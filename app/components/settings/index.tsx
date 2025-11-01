import React from 'react';
import type { SettingsProps } from '@/lib/types';

const Settings = ({
  designTitle,
  setDesignTitle,
  canvasWidth,
  setCanvasWidth,
  canvasHeight,
  setCanvasHeight,
  uploading,
  handleCreateCanvas,
}: SettingsProps) => {
  return (
    <div className="mb-4  space-y-3">
      <input
        type="text"
        value={designTitle}
        onChange={(e) => setDesignTitle(e.target.value)}
        placeholder="Design Title"
        className="w-full border p-2 rounded"
      />
      <p>Create Blank Canvas</p>
      <div className="flex gap-2">
        <input
          type="number"
          value={canvasWidth}
          onChange={(e) => setCanvasWidth(Number(e.target.value))}
          placeholder="Width"
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          value={canvasHeight}
          onChange={(e) => setCanvasHeight(Number(e.target.value))}
          placeholder="Height"
          className="w-full border p-2 rounded"
        />
        <button
          onClick={() => handleCreateCanvas()}
          disabled={uploading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Create Design
        </button>
      </div>

      <div className="text-center text-gray-500">or</div>

      <p>
        Canvas with Base Image{' '}
        {!designTitle && (
          <span className="text-red-400">
            (Please enter design title first)
          </span>
        )}
      </p>
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          e.target.files && handleCreateCanvas(e.target.files[0])
        }
        disabled={uploading || !designTitle}
        className="w-full border p-2 rounded"
      />

      {uploading && <p className="text-blue-500 text-sm">Creating...</p>}
    </div>
  );
};

export default Settings;
