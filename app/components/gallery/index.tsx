'use client';
import React, { useState, useEffect } from 'react';
import { getAssets } from '@/lib/apiUtils';
import { Button } from '@/app/components/ui/button';
import { X, Image as ImageIcon } from 'lucide-react';
import type { Asset } from '@/lib/types';
import Image from 'next/image';

interface GalleryProps {
  onSelectAsset: (asset: Asset) => void;
  uploading: boolean;
}

const Gallery = ({ onSelectAsset, uploading }: GalleryProps) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssets();
      setAssets(data);
    } catch (err) {
      console.error('Failed to load assets:', err);
      setError('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleAddToCanvas = () => {
    if (selectedAsset) {
      onSelectAsset(selectedAsset);
      setSelectedAsset(null);
    }
  };

  return (
    <div className="border rounded p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          Gallery
        </h3>
        <Button
          onClick={fetchAssets}
          disabled={loading}
          className="text-sm"
          variant="outline"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No assets</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 max-h-[400px] overflow-y-auto mb-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => handleSelectAsset(asset)}
                className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedAsset?.id === asset.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className=" bg-gray-100 flex  items-center justify-center">
                  <Image
                    src={asset.url}
                    alt={asset.originalName}
                    className="w-10 h-10 object-cover"
                    loading="lazy"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="p-2 bg-white">
                  <p className="text-xs truncate font-medium text-gray-700">
                    {asset.originalName}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {selectedAsset && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {selectedAsset.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedAsset.width}x{selectedAsset.height}px •{' '}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddToCanvas}
                  disabled={uploading}
                  className="flex-1 w-[300px] bg-white text-black border border-1 flex justify-center"
                >
                  {uploading ? 'Adding...' : 'Add to Canvas'}
                </Button>
                <Button
                  onClick={() => setSelectedAsset(null)}
                  variant="outline"
                  className="px-3"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Gallery;
