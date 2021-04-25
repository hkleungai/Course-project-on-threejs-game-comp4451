import {
  BuildingData,
  CustomizableData,
  GameMap,
  TileData,
  UnitData
} from '../props';

interface JsonResourcesType {
  gameMap: GameMap,
  tileData: TileData,
  buildingData: BuildingData,
  customData: CustomizableData,
  unitData: UnitData
}

const loadGameMapFromJson = ({ shouldLoad }: { shouldLoad: boolean }): GameMap => {
  if (!shouldLoad) {
    return undefined;
  }
  const gameMap = new GameMap();
  gameMap.Load();
  return gameMap;
};

const loadTileDataFromJson = (): TileData => {
  const tileData = new TileData();
  tileData.Load();
  return tileData;
};

const loadBuildingDataFromJson = (): BuildingData => {
  const buildingData = new BuildingData();
  buildingData.Load();
  return buildingData;
};

const loadCustomizableDataFromJson = (): CustomizableData => {
  const customizableData = new CustomizableData();
  customizableData.Load();
  return customizableData;
};

const loadUnitDataFromJson = (): UnitData => {
  const unitData = new UnitData();
  unitData.Load();
  return unitData;
};

const loadResourcesFromJsons = ({
  shouldLoad = true
}: { shouldLoad?: boolean } = {}): JsonResourcesType => ({
    gameMap: loadGameMapFromJson({ shouldLoad }),
    tileData: loadTileDataFromJson(),
    buildingData: loadBuildingDataFromJson(),
    customData: loadCustomizableDataFromJson(),
    unitData: loadUnitDataFromJson()
  });

export { JsonResourcesType, loadResourcesFromJsons };
