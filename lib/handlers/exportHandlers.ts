import type { Design } from '@/lib/types';
import type { Canvas } from 'fabric';
import { exportCanvasToImage } from '@/lib/utils';

export const handleExportPNG = (
  fabricCanvasRef: React.RefObject<Canvas | null>,
  currentDesign: Design | null,
) => {
  if (!fabricCanvasRef.current || !currentDesign) return;

  exportCanvasToImage(
    fabricCanvasRef.current,
    'png',
    1.0,
    `${currentDesign.title}.png`,
  );
};

export const handleExportJPEG = (
  fabricCanvasRef: React.RefObject<Canvas | null>,
  currentDesign: Design | null,
) => {
  if (!fabricCanvasRef.current || !currentDesign) return;

  exportCanvasToImage(
    fabricCanvasRef.current,
    'jpeg',
    0.9,
    `${currentDesign.title}.jpg`,
  );
};
