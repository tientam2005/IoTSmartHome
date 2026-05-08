import { assets as mockAssets, type Asset } from "./mockData";

let _assets: Asset[] = [...mockAssets];

export const getAssets = () => _assets;
export const getAssetsByRoom = (roomId: string) => _assets.filter(a => a.roomId === roomId);

export const addAsset = (a: Asset) => { _assets = [..._assets, a]; };
export const updateAsset = (id: string, data: Partial<Asset>) => {
  _assets = _assets.map(a => a.id === id ? { ...a, ...data } : a);
};
export const deleteAsset = (id: string) => { _assets = _assets.filter(a => a.id !== id); };
