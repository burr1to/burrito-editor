import type { Layer } from './types';

export const rotateLayer = (layer: Layer, deltaAngle: number): void => {
  if (!layer.fabricObject) return;

  const newAngle = (layer.fabricObject.angle || 0) + deltaAngle;
  layer.fabricObject.rotate(newAngle);
};

export const flipLayer = (
  layer: Layer,
  direction: 'horizontal' | 'vertical',
): void => {
  if (!layer.fabricObject) return;

  if (direction === 'horizontal') {
    layer.fabricObject.set({ flipX: !layer.fabricObject.flipX });
  } else {
    layer.fabricObject.set({ flipY: !layer.fabricObject.flipY });
  }
};

export const scaleLayer = (layer: Layer, factor: number): void => {
  if (!layer.fabricObject) return;

  const currentScaleX = layer.fabricObject.scaleX || 1;
  const currentScaleY = layer.fabricObject.scaleY || 1;

  layer.fabricObject.set({
    scaleX: currentScaleX * factor,
    scaleY: currentScaleY * factor,
  });
};
