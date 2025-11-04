import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as fabric from 'fabric';
import type { Layer, ExtendedFabricImage, Design } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createCanvas = (
  canvasElement: HTMLCanvasElement,
  width: number,
  height: number,
) => {
  return new fabric.Canvas(canvasElement, {
    width,
    height,
    backgroundColor: '#ffffff',
    preserveObjectStacking: true,
  });
};

export const addImageToCanvas = async (
  canvas: fabric.Canvas,
  layer: Layer,
): Promise<ExtendedFabricImage | null> => {
  if (!layer.asset) return null;

  try {
    const imageUrl = layer.asset.url.startsWith('http')
      ? layer.asset.url
      : `${typeof window !== 'undefined' ? window.location.origin : ''}${
          layer.asset.url
        }`;

    const img = (await fabric.FabricImage.fromURL(
      imageUrl,
    )) as ExtendedFabricImage;

    const originalWidth = layer.asset.width || layer.width;
    const originalHeight = layer.asset.height || layer.height;

    if (
      layer.cropX !== null &&
      layer.cropX !== undefined &&
      layer.cropY !== null &&
      layer.cropY !== undefined &&
      layer.cropW &&
      layer.cropH
    ) {
      img.set({
        cropX: layer.cropX,
        cropY: layer.cropY,
        width: layer.cropW,
        height: layer.cropH,
      });
    }
    const imageWidth = layer.cropW || originalWidth;
    const imageHeight = layer.cropH || originalHeight;

    const scaleX = layer.width / imageWidth;
    const scaleY = layer.height / imageHeight;

    img.set({
      left: layer.x,
      top: layer.y,
      scaleX: scaleX,
      scaleY: scaleY,
      angle: layer.rotation,
      flipX: layer.flipX || false,
      flipY: layer.flipY || false,
      opacity: layer.opacity,
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
    canvas.add(img);
    return img;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const sortLayersByZIndex = (canvas: fabric.Canvas, layers: Layer[]) => {
  const objects = canvas.getObjects();
  const activeObject = canvas.getActiveObject();

  objects.sort((a, b) => {
    const layerA = layers.find((l) => l.fabricObject === a);
    const layerB = layers.find((l) => l.fabricObject === b);

    const zIndexA = layerA?.zIndex ?? 0;
    const zIndexB = layerB?.zIndex ?? 0;

    return zIndexA - zIndexB;
  });

  canvas.remove(...canvas.getObjects());
  objects.forEach((obj) => canvas.add(obj));

  if (activeObject) {
    canvas.setActiveObject(activeObject);
  }
};

export const exportCanvasToImage = async (
  canvas: fabric.Canvas,
  format: 'png' | 'jpeg',
  quality: number,
  filename?: string,
  currentDesign?: Design | null,
) => {
  const maxMultiplier = 4;
  const maxDimension = 8192;

  const width = canvas.width || 0;
  const height = canvas.height || 0;

  if (width > maxDimension || height > maxDimension) {
    throw new Error(`Canvas too large.`);
  }

  const url = canvas.toDataURL({
    format: format,
    quality: quality,
    multiplier: Math.min(maxMultiplier, 2),
  });

  const response = await fetch('/api/exports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      designId: currentDesign?.id,
      dataUrl: url,
      format: 'png',
      width: canvas.width,
      height: canvas.height,
    }),
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  const link = document.createElement('a');
  link.download = filename || `design-${Date.now()}`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
