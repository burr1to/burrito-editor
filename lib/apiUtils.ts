import type { ExtendedFabricImage, Layer } from './types';

export const uploadAsset = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/assets', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload asset');
  }

  return response.json();
};

export const createDesign = async (
  title: string,
  width: number,
  height: number,
) => {
  const response = await fetch('/api/designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, width, height }),
  });

  if (!response.ok) {
    throw new Error('Failed to create design');
  }

  return response.json();
};

export const createLayer = async (layerData: {
  type: string;
  designId: string;
  assetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  opacity: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
}) => {
  const response = await fetch('/api/layers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(layerData),
  });

  if (!response.ok) {
    throw new Error('Failed to create layer');
  }

  return response.json();
};

export const updateLayer = async (
  layerId: string,
  fabricObject: ExtendedFabricImage,
  layer: Layer,
) => {
  if (!layer.asset) return;

  const baseWidth = layer.cropW || layer.asset.width || layer.width;
  const baseHeight = layer.cropH || layer.asset.height || layer.height;

  const updatedData = {
    x: fabricObject.left || 0,
    y: fabricObject.top || 0,
    width: baseWidth * (fabricObject.scaleX || 1),
    height: baseHeight * (fabricObject.scaleY || 1),
    rotation: fabricObject.angle || 0,
    flipX: fabricObject.flipX || false,
    flipY: fabricObject.flipY || false,
    opacity: fabricObject.opacity || 1,
    visible: layer.visible,
    locked: layer.locked,
    cropX: layer.cropX ?? null,
    cropY: layer.cropY ?? null,
    cropW: layer.cropW ?? null,
    cropH: layer.cropH ?? null,
    zIndex: layer.zIndex,
  };

  const response = await fetch(`/api/layers/${layerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error('Failed to update layer');
  }

  return updatedData;
};

export const deleteLayer = async (layerId: string) => {
  const response = await fetch(`/api/layers/${layerId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete layer');
  }
};

export const loadDesign = async (designId: string) => {
  const response = await fetch(`/api/designs/${designId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to load design');
  }

  return response.json();
};

export const loadAllDesigns = async () => {
  const response = await fetch('/api/designs', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to load design');
  }

  return response.json();
};

export const deleteDesign = async (id: string) => {
  const response = await fetch(`/api/designs/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete design');
  }
};

export const getAssets = async () => {
  const response = await fetch('/api/assets', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to load assets');
  }

  return response.json();
};
