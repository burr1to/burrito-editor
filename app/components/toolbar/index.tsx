import React, { useState } from 'react';
import type { ToolbarProps } from '@/lib/types';
import { Button } from '@/app/components/ui/button';
import {
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  ZoomIn,
  ZoomOut,
  Move,
  Lock,
  Unlock,
} from 'lucide-react';

const Toolbar = ({
  selectedLayerId,
  selectedLayer,
  onRotate,
  onFlip,
  onScale,
  onCrop,
  crop,
}: ToolbarProps) => {
  const [rotation, setRotation] = useState(0);

  if (!selectedLayerId || !selectedLayer) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 text-gray-700">
        <p className="text-sm text-gray-500 text-center">
          Select a layer to transform
        </p>
      </div>
    );
  }

  return (
    <div className="border py-2 px-8 border-gray-300 rounded-md">
      <div className="mb-3">
        <h3 className="font-semibold text-sm mb-1">Transformations</h3>
        <p className="text-xs text-gray-500">
          Layer: {`Layer ${selectedLayer.zIndex}`}
        </p>
      </div>

      <div className="space-y-3">
        <>
          <p>Rotate</p>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onRotate(-15)}
              className="flex-1 bg-white border hover:bg-gray-50 text-gray-700 text-gray-700"
              size="sm"
            >
              <RotateCw className="w-4 h-4 transform scale-x-[-1] " />
              <span className="ml-1">-15°</span>
            </Button>
            <Button
              onClick={() => onRotate(15)}
              className="flex-1 bg-white border hover:bg-gray-50 text-gray-700"
              size="sm"
            >
              <RotateCw className="w-4 h-4" />
              <span className="ml-1">+15°</span>
            </Button>
            <Button
              onClick={() => onRotate(-selectedLayer.rotation)}
              className="flex-1 bg-white border hover:bg-gray-50 text-gray-700 text-xs"
              size="sm"
            >
              Reset
            </Button>
          </div>
        </>

        <>
          <p>Flip</p>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onFlip('horizontal')}
              className="flex-1 bg-white border hover:bg-gray-50 text-gray-700"
              size="sm"
            >
              <FlipHorizontal className="w-4 h-4" />
              <span className="ml-1">Horizontal</span>
            </Button>
            <Button
              onClick={() => onFlip('vertical')}
              className="flex-1 bg-white border hover:bg-gray-50 text-gray-700"
              size="sm"
            >
              <FlipVertical className="w-4 h-4" />
              <span className="ml-1">Vertical</span>
            </Button>
          </div>
        </>

        <>
          <p>Scale</p>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onScale(0.7)}
              className="flex-1 bg-white border hover:bg-gray-50 text-gray-700"
              size="sm"
            >
              <ZoomOut className="w-4 h-4" />
              <span className="ml-1">70%</span>
            </Button>
            <Button
              onClick={() => onScale(0.9)}
              className="flex-1 bg-white border hover:bg-gray-50 text-gray-700"
              size="sm"
            >
              <ZoomOut className="w-4 h-4" />
              <span className="ml-1">90%</span>
            </Button>
            <Button
              onClick={() => onScale(1.1)}
              className="flex-1 bg-white border hover:bg-gray-50 text-gray-700"
              size="sm"
            >
              <ZoomIn className="w-4 h-4" />
              <span className="ml-1">110%</span>
            </Button>
            <Button
              onClick={() => onScale(1.3)}
              className="flex-1 bg-white border hover:bg-gray-50 text-gray-700"
              size="sm"
            >
              <ZoomIn className="w-4 h-4" />
              <span className="ml-1">130%</span>
            </Button>
          </div>
        </>

        <>
          <p>Crop</p>
          <Button
            onClick={onCrop}
            className="w-full bg-white border hover:bg-gray-50 text-gray-700"
            size="sm"
            disabled={crop}
          >
            <Crop className="w-4 h-4" />
            <span className="ml-1">Enable Crop Mode</span>
          </Button>
        </>
      </div>
    </div>
  );
};

export default Toolbar;
