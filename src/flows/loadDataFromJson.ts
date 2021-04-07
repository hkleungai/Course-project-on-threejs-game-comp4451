import {
  BuildingData,
  CustomizableData,
  GameMap,
  TileData,
  UnitData
} from '../props';

const loadGameMapFromJson = (): GameMap => {
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

export {
  loadGameMapFromJson,
  loadTileDataFromJson,
  loadBuildingDataFromJson,
  loadCustomizableDataFromJson,
  loadUnitDataFromJson,
};
