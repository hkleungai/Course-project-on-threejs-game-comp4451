import { TileData } from '../props';

const loadTileDataFromJson = (): void => {
  const tileData = new TileData();
  tileData.Load();
};

export { loadTileDataFromJson };
