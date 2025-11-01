import * as fabric from 'fabric';

export interface Asset {
  id: string;
  url: string;
  originalName: string;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  mimeType: string;
}

export interface ExtendedFabricImage extends fabric.FabricImage {
  cropRect?: fabric.Rect;
}

export interface Layer {
  id: string;
  assetId: string;
  asset?: Asset;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  opacity: number;
  visible: boolean;
  locked: boolean;
  cropX?: number | null;
  cropY?: number | null;
  cropW?: number | null;
  cropH?: number | null;
  fabricObject?: ExtendedFabricImage;
}

export interface Design {
  id: string;
  title: string;
  width: number;
  height: number;
  createdAt?: Date;
  updatedAt?: Date;
  layers?: Layer[];
}

export interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onAddLayer: (file: File) => void;
  uploading: boolean;
  canvasBlank: boolean;
  onMoveLayer: (layerId: string, direction: 'up' | 'down') => void;
}

export interface SettingsProps {
  designTitle: string;
  setDesignTitle: (title: string) => void;
  canvasWidth: number;
  setCanvasWidth: (width: number) => void;
  canvasHeight: number;
  setCanvasHeight: (height: number) => void;
  uploading: boolean;
  handleCreateCanvas: (file?: File) => void;
}

export interface ToolbarProps {
  selectedLayerId: string | null;
  selectedLayer: Layer | null;
  onRotate: (angle: number) => void;
  onFlip: (direction: 'horizontal' | 'vertical') => void;
  onScale: (factor: number) => void;
  onCrop: () => void;
  crop: boolean;
}
