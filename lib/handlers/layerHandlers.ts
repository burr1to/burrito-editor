import { addImageToCanvas, sortLayersByZIndex } from '@/lib/utils';
import { createLayer, updateLayer, deleteLayer } from '@/lib/apiUtils';
import type { Layer, Asset, ExtendedFabricImage, Design } from '@/lib/types';
import * as fabric from 'fabric';

export const addLayerToCanvas = async (
  layer: Layer,
  fabricCanvasRef: React.RefObject<fabric.Canvas | null>,
  layersRef: React.RefObject<Layer[]>,
) => {
  if (!fabricCanvasRef.current) return;

  const img = await addImageToCanvas(fabricCanvasRef.current, layer);

  if (img) {
    layer.fabricObject = img;
    sortLayersByZIndex(fabricCanvasRef.current, layersRef.current);
    fabricCanvasRef.current.renderAll();
  }
};

export const handleAddLayer = async (
  file: File,
  currentDesign: Design | null,
  layers: Layer[],
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>,
  setUploading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: (msg: string) => void,
  uploadAsset: (file: File) => Promise<Asset>,
  addLayerToCanvas: (layer: Layer) => Promise<void>,
) => {
  if (!currentDesign) return;

  try {
    setUploading(true);

    const asset = await uploadAsset(file);
    const maxZIndex =
      layers.length > 0 ? Math.max(...layers.map((l) => l.zIndex)) : -1;

    const newLayer = await createLayer({
      type: 'IMAGE',
      designId: currentDesign.id,
      assetId: asset.id,
      x: 50,
      y: 50,
      width: asset.width || 200,
      height: asset.height || 200,
      rotation: 0,
      flipX: false,
      flipY: false,
      opacity: 1,
      zIndex: maxZIndex + 1,
      visible: true,
      locked: false,
    });

    await addLayerToCanvas(newLayer);
    setLayers((prev) => [...prev, newLayer]);
  } catch (error) {
    console.error(error);
    setError('Failed to add layer. Please check the file and try again.');
  } finally {
    setUploading(false);
  }
};

export const handleDeleteLayer = async (
  layerId: string,
  layers: Layer[],
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>,
  selectedLayerId: string | null,
  setSelectedLayerId: React.Dispatch<React.SetStateAction<string | null>>,
  fabricCanvasRef: React.RefObject<fabric.Canvas | null>,
  setError: (msg: string) => void,
) => {
  try {
    const layer = layers.find((l) => l.id === layerId);

    if (layer?.fabricObject && fabricCanvasRef.current) {
      fabricCanvasRef.current.remove(layer.fabricObject);
      fabricCanvasRef.current.renderAll();
    }

    await deleteLayer(layerId);

    setLayers((prev) => prev.filter((l) => l.id !== layerId));

    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
  } catch (error) {
    console.error(error);
    setError('Failed to delete layer. Please try again.');
  }
};

export const handleToggleVisibility = (
  layerId: string,
  layers: Layer[],
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>,
  fabricCanvasRef: React.RefObject<fabric.Canvas | null>,
) => {
  setLayers((prev) =>
    prev.map((layer) => {
      if (layer.id === layerId) {
        const updated = { ...layer, visible: !layer.visible };
        if (updated.fabricObject) {
          updated.fabricObject.set({ visible: updated.visible });
          fabricCanvasRef.current?.renderAll();
        }
        return updated;
      }
      return layer;
    }),
  );
};

export const handleSelectLayer = (
  layerId: string,
  layers: Layer[],
  fabricCanvasRef: React.RefObject<fabric.Canvas | null>,
  setSelectedLayerId: React.Dispatch<React.SetStateAction<string | null>>,
) => {
  const layer = layers.find((l) => l.id === layerId);
  if (layer?.fabricObject && fabricCanvasRef.current) {
    fabricCanvasRef.current.setActiveObject(layer.fabricObject);
    fabricCanvasRef.current.renderAll();
    setSelectedLayerId(layerId);
  }
};
