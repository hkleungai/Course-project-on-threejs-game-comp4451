import {
  Tile
} from './tiles';
import {
  buildingDataJson,
  tileDataJson
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
  Module,
  Shell
} from '../researches';

class TileData {
  public Data : Tile[] = [];

  Load(): void {
    this.Data = tileDataJson.Data;
  }
}

class BuildingData {
  public UnitBuildingData : UnitBuilding[] = [];
  public ResourcesBuildingsData : ResourcesBuilding[] = [];
  public InfrastructuresData : Infrastructure[] = [];
  public TransmissionBuildingsData : TransmissionBuilding[] = [];
  public DefensiveBuildingsData : DefensiveBuilding[] = [];

  Load(): void {
    this.UnitBuildingData = buildingDataJson.UnitBuildingData;
    this.ResourcesBuildingsData = buildingDataJson.ResourcesBuildingsData;
    this.InfrastructuresData = buildingDataJson.InfrastructuresData;
    this.TransmissionBuildingsData = buildingDataJson.TransmissionBuildingsData;
    this.DefensiveBuildingsData = buildingDataJson.DefensiveBuildingsData;
  }
}

class UnitData {
  public PersonnelData : Personnel[] = [];
  public ArtilleriesData : Artillery[] = [];
  public VehicleData : Vehicle[] = [];
  public VesselData : Vessel[] = [];
  public PlaneData : Plane[] = [];

  Load(): void {
    //TODO
  }
}

class CustomizableData {
  public FirearmData : Firearm[] = [];
  public ModuleData : Module[] = [];
  public ShellData : Shell[] = [];

  Load(): void {
    //TODO
  }
}

export {
  BuildingData,
  CustomizableData,
  TileData,
  UnitData
};
