import {
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
  shellsDataJson
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
  public Data : Tile[] = [];

  Load(): void {
    this.Data = tileDataJson;
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
