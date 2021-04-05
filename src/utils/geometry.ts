import { Vector3, Vector3Tuple } from 'three';
import { isInteger, usolve } from 'mathjs';
import { cosDeg, range } from './';
import { Point, pointEquals } from '../attr';
import { hexScreenSize, instantiateUnit } from '../flows';
import { rangeFrom, rangeFromTo, sinDeg } from './helpers';
import { BuildingData, GameMap, Tile } from '../props';
import { InvalidArgumentException } from './exception';
import { gameMap } from '../main';
import { Unit } from '../props/units';
import { Building, UnitBuilding } from '../props/buildings';

class Line {
  private falsyValues = [NaN, Infinity, undefined];

  public slope: number;
  public xIntercept: number;
  public yIntercept: number;
  public xCoefficient: number;
  public yCoefficient: number;
  public constantTerm: number;

  private constructEquation({ xCoefficient, yCoefficient, constantTerm }: {
    xCoefficient: Line['xCoefficient'],
    yCoefficient: Line['yCoefficient'],
    constantTerm: Line['constantTerm'],
  }): void {
    this.xCoefficient = xCoefficient;
    this.yCoefficient = yCoefficient;
    this.constantTerm = constantTerm;
  }

  private constructCharacteristics({ slope, xIntercept, yIntercept }: {
    slope?: Line['slope'],
    xIntercept?: Line['xIntercept'],
    yIntercept?: Line['yIntercept'],
  }) {
    if ([slope, xIntercept, yIntercept].filter(this.falsyValues.includes).length >= 2) {
      throw new Error([
        'Requires at least two of valid entries for "slope", "x-intercept", "y-Intercept".'
      ].join(' '));
    }
    if (this.falsyValues.includes(slope)) {
      this.xIntercept = xIntercept;
      this.yIntercept = yIntercept;
      this.slope = -yIntercept / xIntercept;
      return;
    }
    if (this.falsyValues.includes(xIntercept)) {
      this.slope = slope;
      this.yIntercept = yIntercept;
      this.xIntercept = -yIntercept / slope;
      return;
    }
    if (this.falsyValues.includes(yIntercept)) {
      this.slope = slope;
      this.xIntercept = xIntercept;
      this.yIntercept = -xIntercept * slope;
      return;
    }
    this.slope = slope;
    this.xIntercept = xIntercept;
    this.yIntercept = yIntercept;
  }

  constructor({ slopeIntercepts, coefficients, twoPoints }: {
    slopeIntercepts?: {
      slope?: Line['slope'],
      xIntercept?: Line['xIntercept'],
      yIntercept?: Line['yIntercept'],
    },
    coefficients?: {
      xCoefficient: Line['xCoefficient'],
      yCoefficient: Line['yCoefficient'],
      constantTerm: Line['constantTerm'],
    },
    twoPoints?:{
      pt1: Vector3Tuple,
      pt2: Vector3Tuple,
    }
  }) {
    if (coefficients) {
      const { xCoefficient, yCoefficient, constantTerm } = coefficients;
      this.constructEquation({ xCoefficient, yCoefficient, constantTerm });
      this.constructCharacteristics({
        slope: -xCoefficient / yCoefficient,
        xIntercept: -constantTerm / xCoefficient,
        yIntercept: -constantTerm / yCoefficient,
      });
      return;
    }
    if (slopeIntercepts) {
      const { slope, xIntercept, yIntercept } = slopeIntercepts;
      this.constructCharacteristics({ slope, xIntercept, yIntercept });
      this.constructEquation({ xCoefficient: this.slope, yCoefficient: -1, constantTerm: this.yIntercept });
    }
    if (twoPoints) {
      const { pt1, pt2 } = twoPoints;
      this.slope = (pt2[1] - pt1[1]) / (pt2[0] - pt1[0]);
      this.yIntercept = this.slope * (-pt1[0]) + pt1[1];
      this.xIntercept = -this.yIntercept / this.slope;
      this.constructEquation({ xCoefficient: this.slope, yCoefficient: -1, constantTerm: this.yIntercept });
    }
    throw new Error([
      'Requires a valid coefficients object with all three coefficients well-defined;',
      'Or a valid slope-intercept object with any two entries well-defined.'
    ].join(' '));
  }

  public pointSubstitution(point: Vector3Tuple): number {
    const [x, y] = point;
    const { xCoefficient, yCoefficient, constantTerm } = this;
    return xCoefficient * x + yCoefficient * y + constantTerm;
  }

  public distanceToPoint(point: Vector3Tuple): number {
    const { xCoefficient, yCoefficient } = this;
    return this.pointSubstitution(point) / Math.sqrt(Math.pow(xCoefficient, 2) + Math.pow(yCoefficient, 2));
  }

  public intersection(line: Line): Vector3Tuple {
    const A = [[this.xCoefficient, this.yCoefficient], [line.xCoefficient, line.yCoefficient]];
    const b = [-this.constantTerm, -line.constantTerm];
    const [[x0], [x1]] = usolve(A, b) as number[][];
    return [x0, x1, 0];
  }
}

class Hexagon {
  public center: Vector3Tuple;
  public diameterX: number;
  public diameterY: number;
  public vertices: Vector3Tuple[];

  constructor({ center, diameterX, diameterY }: {
    center: Hexagon['center'],
    diameterX: Hexagon['diameterX'],
    diameterY?: Hexagon['diameterY']
  }) {
    if (diameterY === undefined) {
      diameterY = diameterX;
    }
    this.center = center;
    this.diameterX = diameterX;
    this.diameterY = diameterY;
    this.vertices = (
      range(2).flatMap(i => (
        range(3).map(j => ([
          center[0] + Math.pow(-1, i) * diameterX / 2 * (j === 1 ? 1 : cosDeg(60)),
          center[1] + (j === 1 ? 0 : Math.pow(-1, j / 2 + i - 1) * diameterY / 2),
          center[2]
        ]))
      ))
    ) as Vector3Tuple[];
  }

  private findVerticesPartitionsByLine(line: Line): Vector3Tuple[][] {
    return [
      this.vertices.filter(v => line.pointSubstitution(v) >= 0),
      this.vertices.filter(v => line.pointSubstitution(v) <= 0),
    ];
  }

  public isChord(line: Line): boolean {
    const partitions = this.findVerticesPartitionsByLine(line);
    return partitions.every(partition => partition.length % this.vertices.length !== 0);
  }

  public isSide(line: Line): boolean {
    const matchedVertex = this.vertices.find((_, i, vs) => (
      line.distanceToPoint(vs[i % 6]) === 0 && line.distanceToPoint(vs[(i + 1) % 6]) === 0
    ));
    return matchedVertex !== undefined;
  }

  private computeArea(vertices: Vector3Tuple[]): number {
    const shoelaceSum = vertices.reduce((previous, _, currentIndex, array) => (
      previous
      + array[currentIndex][0] * array[(currentIndex + 1) % array.length][1]
      - array[currentIndex][1] * array[(currentIndex + 1) % array.length][0]
    ), 0);
    return Math.abs(shoelaceSum) / 2;
  }

  public area(): number {
    return this.computeArea(this.vertices);
  }

  private isSameVertex(v1: Vector3Tuple, v2: Vector3Tuple): boolean {
    return v1[0] === v2[0] && v1[1] === v2[1] && v1[2] === v2[2];
  }

  private insertPointIntoVertexList(
    list: Vector3Tuple[],
    pt: Vector3Tuple,
    v1: Vector3Tuple,
    v2: Vector3Tuple,
  ): Vector3Tuple[] {
    const [i1, i2] = [
      list.findIndex(v => this.isSameVertex(v, v1)),
      list.findIndex(v => this.isSameVertex(v, v2)),
    ];
    if (i1 - i2 === 1) {
      return [...list.slice(0, i1), pt, ...list.slice(i1)];
    }
    if (i2 - i1 === 1) {
      return [...list.slice(0, i2), pt, ...list.slice(i2)];
    }
    if (i1 - i2 === 5 || i2 - i1 === 5) {
      return [...list, pt];
    }
  }

  private sliceVertices(
    list: Vector3Tuple[],
    v1: Vector3Tuple,
    v2: Vector3Tuple,
  ): Vector3Tuple[][] {
    const [i1, i2] = [
      this.vertices.findIndex(v => this.isSameVertex(v, v1)),
      this.vertices.findIndex(v => this.isSameVertex(v, v2)),
    ];
    const [smaller, larger] = [i1 < i2 ? i1 : i2, i1 < i2 ? i2 : i1];
    return [list.slice(smaller, larger + 1), [...list.slice(larger), ...list.slice(0, smaller + 1)]];
  }

  public computeMajorMinorArea(line: Line): {
    major: Vector3Tuple[] | number, minor: Vector3Tuple[] | number
  } {
    if (!this.isChord(line)) {
      return {
        major: this.area(),
        minor: 0
      };
    }
    const verticesCountOnChord = this.vertices
      .map(v => ([v, line.pointSubstitution(v)]))
      .filter(([, e]) => e === 0) as [Vector3Tuple, number][];
    if (verticesCountOnChord.length === 2) {
      return {
        major: this.area() / 2,
        minor: this.area() / 2,
      };
    }
    const [positivePartition, negativePartition] = this.findVerticesPartitionsByLine(line);
    const endPoints = [
      [positivePartition[0], positivePartition.slice(-1)[0]],
      [negativePartition[0], negativePartition.slice(-1)[0]]
    ];
    if (verticesCountOnChord.length === 1) {
      const v1 = verticesCountOnChord[0][0];
      const [pt1, pt2] = endPoints.flat().filter(v => !this.isSameVertex(v1, v));
      const intersectedSide = new Line({ twoPoints: { pt1, pt2 }});
      const v2 = line.intersection(intersectedSide);
      const newVerticesAdjacency = this.insertPointIntoVertexList([...this.vertices], v2, pt1, pt2);
      const segments = this.sliceVertices(newVerticesAdjacency, v1, v2);
      const [minor, major] = segments.map(segment => this.computeArea(segment)).sort();
      return { major, minor };
    }
    const intersectedSidesCandidates = [
      [endPoints[0][0], endPoints[1][0]],
      [endPoints[0][0], endPoints[1][1]],
      [endPoints[0][1], endPoints[1][0]],
      [endPoints[0][1], endPoints[1][1]],
    ];
    const [
      [[pt11, pt12], intersectedSide1],
      [[pt21, pt22], intersectedSide2]
    ] = intersectedSidesCandidates
      .map(([pt1, pt2]) => ([
        [pt1, pt2], new Line({ twoPoints: { pt1, pt2 }})
      ]) as [Vector3Tuple[], Line])
      .filter(([, side]) => (this.isSide(side)));
    const v1 = line.intersection(intersectedSide1);
    const verticesAdjacencyByV1 = this.insertPointIntoVertexList([...this.vertices], v1, pt11, pt12);
    const v2 = line.intersection(intersectedSide2);
    const verticesAdjacencyByV2 = this.insertPointIntoVertexList([...verticesAdjacencyByV1], v2, pt21, pt22);
    const segments = this.sliceVertices(verticesAdjacencyByV2, v1, v2);
    const [minor, major] = segments.map(segment => this.computeArea(segment)).sort();
    return { major, minor };
  }
}

const coordsToScreenPoint = (coords: Point): Vector3 => {
  const x = hexScreenSize.x;
  const y = hexScreenSize.y;
  return new Vector3(
  y * coords.X * cosDeg(30),
  x * cosDeg(30) * coords.Y + ((coords.X % 2) * x * sinDeg(60) / 2),
  0);
} 

export {
  Hexagon,
  Line,
  coordsToScreenPoint
};
