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

const loadTileDataFromJson = ({ shouldLoad }: { shouldLoad: boolean }): TileData => {
  if (!shouldLoad) {
    return undefined;
  }
  const tileData = new TileData();
  tileData.Load();
  return tileData;
};

const loadBuildingDataFromJson = ({ shouldLoad }: { shouldLoad: boolean }): BuildingData => {
  if (!shouldLoad) {
    return undefined;
  }
  const buildingData = new BuildingData();
  buildingData.Load();
  return buildingData;
};

const loadCustomizableDataFromJson = ({ shouldLoad }: { shouldLoad: boolean }): CustomizableData => {
  if (!shouldLoad) {
    return undefined;
  }
  const customizableData = new CustomizableData();
  customizableData.Load();
  return customizableData;
};

const loadUnitDataFromJson = ({ shouldLoad }: { shouldLoad: boolean }): UnitData => {
  if (!shouldLoad) {
    return undefined;
  }
  const unitData = new UnitData();
  unitData.Load();
  return unitData;
};

const loadResourcesFromJsons = ({
  shouldLoad = true
}: { shouldLoad?: boolean } = {}): JsonResourcesType => ({
  gameMap: loadGameMapFromJson({ shouldLoad }),
  tileData: loadTileDataFromJson({ shouldLoad }),
  buildingData: loadBuildingDataFromJson({ shouldLoad }),
  customData: loadCustomizableDataFromJson({ shouldLoad }),
  unitData: loadUnitDataFromJson({ shouldLoad }),
});

export { JsonResourcesType, loadResourcesFromJsons };
