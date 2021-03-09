import { TileData } from '../props';

const loadTileDataFromJson = (): void => {
  const tileData = new TileData();
  tileData.Load();
  // eslint-disable-next-line no-console
  console.log(tileData.Data);
};

export { loadTileDataFromJson };
