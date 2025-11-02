import React, { ChangeEvent, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Lock, Eye, Trash2, EyeOff } from 'lucide-react';
import type { LayerPanelProps } from '@/lib/types';
import { ArrowUp, ArrowDown } from 'lucide-react';

const LayerPanel = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onDeleteLayer,
  onToggleVisibility,
  onAddLayer,
  uploading,
  onMoveLayer,
}: LayerPanelProps) => {
  //why spread? to make shallow copy, not update layers itself
  const sorted = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="border w-full rounded p-3">
      <h3 className="font-semibold mb-3">Layers</h3>

      <div className="mb-3">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-blue-500 text-white p-2 rounded text-center hover:bg-blue-600"
          disabled={uploading}
        >
          + Add Layer
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            e.target.files && onAddLayer(e.target.files[0])
          }
          disabled={uploading}
          className="hidden"
        />

        {uploading && (
          <p className="text-xs text-blue-500 mt-1">Uploading...</p>
        )}
      </div>

      <div className="space-y-2">
        {sorted.map((layer, idx) => {
          const isDeletable = !layer.locked;
          const isLocked = layer.locked;
          const isFirst = idx === sorted.length - 1;
          const isLast = idx === 0;
          return (
            <div
              key={layer.id}
              className={`border rounded p-2 cursor-pointer ${
                selectedLayerId === layer.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
              onClick={() => {
                if (!isLocked) {
                  onSelectLayer(layer.id);
                }
              }}
            >
              <div className="flex items-center">
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate flex gap-x-2">
                      {isLocked && <Lock className="w-4 h-4 text-gray-500" />}
                      {layer.asset?.originalName || `Layer ${layer.zIndex}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Layer {layer.zIndex}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <Button
                  onClick={() => !isLocked && onMoveLayer(layer.id, 'up')}
                  disabled={isLocked || isLast}
                  className={`p-1 border rounded
                          ${
                            isLocked || isLast
                              ? 'bg-gray-100 text-gray-400 border-gray-200 '
                              : 'bg-white text-black border-gray-200 hover:bg-blue-50 hover:text-blue-700'
                          }
                        `}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => !isLocked && onMoveLayer(layer.id, 'down')}
                  disabled={isLocked || isFirst}
                  className={`p-1 border rounded
                            ${
                              isLocked || isFirst
                                ? 'bg-gray-100 text-gray-400 border-gray-200 '
                                : 'bg-white text-black border-gray-200 hover:bg-blue-50 hover:text-blue-700'
                            }
                          `}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(layer.id);
                  }}
                  className="p-1 p-1 bg-white text-black border border-gray-200  rounded"
                >
                  {layer.visible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>

                {isDeletable && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this layer?')) {
                        onDeleteLayer(layer.id);
                      }
                    }}
                    className="p-1 bg-white border border-gray-200 hover:bg-red-100 rounded text-red-600 text-xs"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {layers.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No layers yet
          </p>
        )}
      </div>
    </div>
  );
};

export default LayerPanel;
