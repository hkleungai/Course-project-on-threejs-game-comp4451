import {
  BuildingData,
  CustomizableData,
  TileData,
  UnitData
} from '../props';

const loadTileDataFromJson = (): void => {
  const tileData = new TileData();
  tileData.Load();
};

const loadBuildingDataFromJson = (): void => {
  const buildingData = new BuildingData();
  buildingData.Load();
};

const loadCustomizableDataFromJson = (): void => {
  const customizableData = new CustomizableData();
  customizableData.Load();
};

const loadUnitDataFromJson = (): void => {
  const unitData = new UnitData();
  unitData.Load();
};

export {
  loadTileDataFromJson,
  loadBuildingDataFromJson,
  loadCustomizableDataFromJson,
  loadUnitDataFromJson,
};
