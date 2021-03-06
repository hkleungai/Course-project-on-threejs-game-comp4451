import { TileData } from './props';

const LoadAllData = (): void => {
  const tileData = new TileData();
  tileData.Load();
  // eslint-disable-next-line no-console
  console.log(tileData.Data);
};

export { LoadAllData };
