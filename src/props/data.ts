import {
  Cities,
  Tile
} from './tiles';
import {
  buildingDataJson,
  firearmsDataJson,
  gunsDataJson,
  personnelDataJson,
  artilleriesDataJson,
  vehiclesDataJson,
  tileDataJson,
  shellsDataJson,
  citiesDataJson
} from "../assets/json";
import {
  DefensiveBuilding,
  Infrastructure,
  ResourcesBuilding,
  TransmissionBuilding,
  UnitBuilding
} from './buildings';
import {
  Artillery,
  Personnel,
  Plane,
  Vehicle,
  Vessel
} from './units';
import {
  Firearm,
  Gun,
  Shell
} from '../researches';
class TileData {
  public TilesData : Tile[] = [];
  public CitiesData : Cities[] = [];

  Load(): void {
    this.TilesData = tileDataJson;
    this.CitiesData = citiesDataJson;
  }
}

class BuildingData {
  public UnitBuildingData : { [name: string]: UnitBuilding } = {};
  public ResourcesBuildingData : { [name: string]: ResourcesBuilding } = {};
  public InfrastructureData : { [name: string]: Infrastructure } = {};
  public TransmissionBuildingData : { [name: string]: TransmissionBuilding } = {};
  public DefensiveBuildingData : { [name: string]: DefensiveBuilding } = {};

  Load(): void {
    this.UnitBuildingData = buildingDataJson.UnitBuildingData;
    this.ResourcesBuildingData = buildingDataJson.ResourcesBuildingData;
    this.InfrastructureData = buildingDataJson.InfrastructuresData;
    this.TransmissionBuildingData = buildingDataJson.TransmissionBuildingData;
    this.DefensiveBuildingData = buildingDataJson.DefensiveBuildingData;
  }
}

class UnitData {
  public PersonnelData : { [name: string]: Personnel } = {};
  public ArtilleriesData : { [name: string]: Artillery } = {};
  public VehicleData : { [name: string]: Vehicle } = {};
  public VesselData : Vessel[] = [];
  public PlaneData : Plane[] = [];

  Load(): void {
    this.PersonnelData = personnelDataJson;
    this.ArtilleriesData = artilleriesDataJson;
    this.VehicleData = vehiclesDataJson;
  }
}

class CustomizableData {
  public FirearmData : { [name: string]: Firearm } = {};
  public GunData : { [name: string]: Gun } = {};
  public ShellData : { [name: string]: Shell } = {};

  Load(): void {
    this.FirearmData = firearmsDataJson;
    this.GunData = gunsDataJson;
    this.ShellData = shellsDataJson;
  }
}

export {
  BuildingData,
  CustomizableData,
  TileData,
  UnitData
};
