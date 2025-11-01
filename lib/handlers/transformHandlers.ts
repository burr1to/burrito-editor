import { rotateLayer, flipLayer, scaleLayer } from '@/lib/transformations';
import { updateLayer } from '@/lib/apiUtils';
import type { Layer, ExtendedFabricImage } from '@/lib/types';
import * as fabric from 'fabric';

export const handleRotate = (
  selectedLayerId: string | null,
  layersRef: React.RefObject<Layer[]>,
  fabricCanvasRef: React.RefObject<fabric.Canvas | null>,
  angle: number,
  handleLayerTransformUpdate: (
    layerId: string,
    fabricObject: ExtendedFabricImage,
  ) => void,
) => {
  if (!selectedLayerId || !fabricCanvasRef.current) return;

  const layer = layersRef.current.find((l) => l.id === selectedLayerId);
  if (!layer?.fabricObject) return;

  rotateLayer(layer, angle);
  fabricCanvasRef.current.renderAll();
  handleLayerTransformUpdate(selectedLayerId, layer.fabricObject);
};

export const handleFlip = async (
  direction: 'horizontal' | 'vertical',
  selectedLayerId: string | null,
  layersRef: React.RefObject<Layer[]>,
  fabricCanvasRef: React.RefObject<fabric.Canvas | null>,
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>,
  handleLayerTransformUpdate: (
    layerId: string,
    fabricObject: ExtendedFabricImage,
  ) => void,
) => {
  if (!selectedLayerId || !fabricCanvasRef.current) return;

  const layer = layersRef.current.find((l) => l.id === selectedLayerId);
  if (!layer?.fabricObject) return;

  flipLayer(layer, direction);
  fabricCanvasRef.current.renderAll();
  setLayers((prev) =>
    prev.map((l) =>
      l.id === selectedLayerId
        ? {
            ...l,
            flipX: layer.fabricObject!.flipX || false,
            flipY: layer.fabricObject!.flipY || false,
          }
        : l,
    ),
  );
  await handleLayerTransformUpdate(selectedLayerId, layer.fabricObject);
};

export const handleScale = (
  factor: number,
  selectedLayerId: string | null,
  layersRef: React.RefObject<Layer[]>,
  fabricCanvasRef: React.RefObject<fabric.Canvas | null>,
  handleLayerTransformUpdate: (
    layerId: string,
    fabricObject: ExtendedFabricImage,
  ) => void,
) => {
  if (!selectedLayerId || !fabricCanvasRef.current) return;

  const layer = layersRef.current.find((l) => l.id === selectedLayerId);
  if (!layer?.fabricObject) return;

  scaleLayer(layer, factor);
  fabricCanvasRef.current.renderAll();
  handleLayerTransformUpdate(selectedLayerId, layer.fabricObject);
};

export const handleCrop = (
  selectedLayerId: string | null,
  layersRef: React.RefObject<Layer[]>,
  fabricCanvasRef: React.RefObject<fabric.Canvas | null>,
  setCropMode: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  if (!selectedLayerId) return;
  const layer = layersRef.current.find((l) => l.id === selectedLayerId);

  if (!layer?.fabricObject || !fabricCanvasRef.current) return;

  setCropMode(true);

  const obj = layer.fabricObject;
  const cropRect = new fabric.Rect({
    left: obj.left,
    top: obj.top,
    width: obj.getScaledWidth(),
    height: obj.getScaledHeight(),
    fill: 'rgba(0,0,0,0)',
    stroke: 'blue',
    strokeWidth: 2,
    strokeDashArray: [5, 5],
    selectable: true,
    hasControls: true,
  });

  fabricCanvasRef.current.add(cropRect);
  fabricCanvasRef.current.setActiveObject(cropRect);
  fabricCanvasRef.current.renderAll();

  obj.cropRect = cropRect;
};

export const handleApplyCrop = async (
  selectedLayerId: string | null,
  layers: Layer[],
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>,
  fabricCanvasRef: React.RefObject<fabric.Canvas | null>,
  setCropMode: React.Dispatch<React.SetStateAction<boolean>>,
  setError: (msg: string) => void,
) => {
  if (!selectedLayerId) return;

  const layer = layers.find((l) => l.id === selectedLayerId);
  if (!layer?.fabricObject || !fabricCanvasRef.current) return;

  const obj = layer.fabricObject;
  const cropRect = obj.cropRect;
  const canvas = fabricCanvasRef.current;

  if (!cropRect) return;

  if (!layer.asset || !layer.asset.url) {
    setError('Layer asset not available for cropping.');
    setCropMode(false);
    return;
  }

  try {
    const currentLeft = obj.left || 0;
    const currentTop = obj.top || 0;
    const currentAngle = obj.angle || 0;
    const currentScaleX = obj.scaleX || 1;
    const currentScaleY = obj.scaleY || 1;
    const currentFlipX = obj.flipX || false;
    const currentFlipY = obj.flipY || false;
    const currentOpacity = obj.opacity || 1;

    const rectLeft = cropRect.left || 0;
    const rectTop = cropRect.top || 0;
    const rectWidth = cropRect.getScaledWidth();
    const rectHeight = cropRect.getScaledHeight();

    const cropX = (rectLeft - currentLeft) / currentScaleX;
    const cropY = (rectTop - currentTop) / currentScaleY;
    const cropWidth = rectWidth / currentScaleX;
    const cropHeight = rectHeight / currentScaleY;

    const cropData = {
      cropX: Math.max(0, cropX),
      cropY: Math.max(0, cropY),
      cropW: Math.max(1, cropWidth),
      cropH: Math.max(1, cropHeight),
    };

    canvas.remove(obj);
    canvas.remove(cropRect);
    delete obj.cropRect;

    const newImg = (await fabric.FabricImage.fromURL(layer.asset.url, {
      crossOrigin: 'anonymous',
    })) as ExtendedFabricImage;

    newImg.set({
      cropX: cropData.cropX,
      cropY: cropData.cropY,
      width: cropData.cropW,
      height: cropData.cropH,
      left: currentLeft,
      top: currentTop,
      scaleX: currentScaleX,
      scaleY: currentScaleY,
      angle: currentAngle,
      flipX: currentFlipX,
      flipY: currentFlipY,
      opacity: currentOpacity,
      visible: layer.visible,
      selectable: !layer.locked,
      evented: !layer.locked,
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      lockScalingFlip: true,
      lockSkewingX: true,
      lockSkewingY: true,
      hasControls: false,
      hasBorders: true,
    });

    canvas.add(newImg);
    canvas.setActiveObject(newImg);

    const updatedLayer = {
      ...layer,
      ...cropData,
      flipX: currentFlipX,
      flipY: currentFlipY,
      fabricObject: newImg,
    };

    setLayers((prev) =>
      prev.map((l) => (l.id === layer.id ? updatedLayer : l)),
    );

    setCropMode(false);
    canvas.renderAll();
    await updateLayer(selectedLayerId, newImg, updatedLayer);
  } catch (error) {
    console.error(error);
    setError('Failed to apply crop');
  }
};

export const handleCancelCrop = (
  selectedLayerId: string | null,
  layers: Layer[],
  fabricCanvasRef: React.RefObject<fabric.Canvas | null>,
  setCropMode: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  if (!selectedLayerId) return;

  const layer = layers.find((l) => l.id === selectedLayerId);
  if (!layer?.fabricObject || !fabricCanvasRef.current) return;

  const obj = layer.fabricObject;
  const cropRect = obj.cropRect;

  if (cropRect) {
    fabricCanvasRef.current.remove(cropRect);
    delete obj.cropRect;
  }

  setCropMode(false);
  fabricCanvasRef.current.renderAll();
};
