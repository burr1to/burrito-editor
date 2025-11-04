'use client';
import React, { useState, useRef, useEffect } from 'react';
import * as fabric from 'fabric';
import Settings from '@/app/components/settings';
import LayerPanel from '@/app/components/layerPanel';
import Toolbar from '@/app/components/toolbar';
import Gallery from '@/app/components/gallery';
import type { Layer, Design, ExtendedFabricImage } from '@/lib/types';
import { Button } from '@/app/components/ui/button';
import { createCanvas, sortLayersByZIndex } from '@/lib/utils';
import Image from 'next/image';
import { Logo } from '@/public';
import {
  uploadAsset,
  createDesign,
  createLayer,
  updateLayer,
  loadDesign,
  loadAllDesigns,
  deleteDesign,
} from '@/lib/apiUtils';
import { Asset } from '@/lib/types';
import { Download } from 'lucide-react';
import {
  handleRotate,
  handleFlip,
  handleScale,
  handleCrop,
  handleApplyCrop,
  handleCancelCrop,
} from '@/lib/handlers/transformHandlers';

import {
  handleExportPNG,
  handleExportJPEG,
} from '@/lib/handlers/exportHandlers';

import {
  addLayerToCanvas,
  handleAddLayer,
  handleDeleteLayer,
  handleToggleVisibility,
  handleSelectLayer,
} from '@/lib/handlers/layerHandlers';

const CanvasPage = () => {
  const [uploading, setUploading] = useState(false);
  const [currentDesign, setCurrentDesign] = useState<Design | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [allDesigns, setAllDesigns] = useState<Design[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(true);
  const [cropMode, setCropMode] = useState<boolean>(false);

  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [designTitle, setDesignTitle] = useState('');
  const [isBlank, setIsBlank] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const layersRef = useRef<Layer[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [error, setError] = useState<string | null>(null);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  useEffect(() => {
    fetchDesigns();
  }, []);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  useEffect(() => {
    if (!currentDesign || fabricCanvasRef.current) return;

    const canvas = createCanvas(
      canvasRef.current!,
      currentDesign.width,
      currentDesign.height,
    );
    fabricCanvasRef.current = canvas;

    canvas.on('selection:created', (e) => {
      const selected = e.selected?.[0];
      if (selected) {
        const layer = layersRef.current.find(
          (l) => l.fabricObject === selected,
        );
        if (layer) setSelectedLayerId(layer.id);
      }
    });

    canvas.on('selection:updated', (e) => {
      const selected = e.selected?.[0];
      if (selected) {
        const layer = layersRef.current.find(
          (l) => l.fabricObject === selected,
        );
        if (layer) setSelectedLayerId(layer.id);
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedLayerId(null);
    });

    canvas.on('object:modified', (e) => {
      const modifiedObject = e.target as ExtendedFabricImage;
      const layer = layersRef.current.find(
        (l) => l.fabricObject === modifiedObject,
      );
      if (layer && modifiedObject && fabricCanvasRef.current) {
        handleLayerTransformUpdate(layer.id, modifiedObject);
        sortLayersByZIndex(fabricCanvasRef.current, layersRef.current);
        canvas.renderAll();
      }
    });

    canvas.on('object:moving', (e) => {
      const obj = e.target as ExtendedFabricImage;
      const layer = layersRef.current.find((l) => l.fabricObject === obj);
      if (layer) {
        debouncedUpdate(layer.id, obj);
      }
    });

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [currentDesign]);

  const fetchDesigns = async () => {
    try {
      setLoadingDesigns(true);
      const designs = await loadAllDesigns();
      setAllDesigns(designs);
    } catch (error) {
      console.error('Failed to fetch designs:', error);
      setError('Unable to load designs.');
    } finally {
      setLoadingDesigns(false);
    }
  };

  const debouncedUpdate = (
    layerId: string,
    fabricObject: ExtendedFabricImage,
  ) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const layer = layersRef.current.find((l) => l.id === layerId);
      if (!layer) return;

      try {
        const updatedData = await updateLayer(layerId, fabricObject, layer);
        setLayers((prev) =>
          prev.map((l) => (l.id === layerId ? { ...l, ...updatedData } : l)),
        );
      } catch (error) {
        console.error('Failed to update layer:', error);
        setError('Failed to save changes. Please try again.');
      }
    }, 500);
  };

  const handleAddAssetFromGallery = async (asset: Asset) => {
    if (!currentDesign) return;

    try {
      setUploading(true);
      setError(null);

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

      await onAddLayerToCanvas(newLayer);
      setLayers((prev) => [...prev, newLayer]);

      console.log('Asset added from gallery');
    } catch (error) {
      console.error('Failed to add:', error);
      setError('Failed to add asset. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLayerTransformUpdate = async (
    layerId: string,
    fabricObject: ExtendedFabricImage,
  ) => {
    const layer = layersRef.current.find((l) => l.id === layerId);
    if (!layer) return;

    try {
      const updatedData = await updateLayer(layerId, fabricObject, layer);
      setLayers((prev) =>
        prev.map((l) => (l.id === layerId ? { ...l, ...updatedData } : l)),
      );

      if (fabricCanvasRef.current) {
        sortLayersByZIndex(fabricCanvasRef.current, layersRef.current);
        fabricCanvasRef.current.renderAll();
      }
    } catch (error) {
      console.error('Failed to update layer:', error);
    }
  };

  const handleCreateCanvas = async (file?: File) => {
    if (!designTitle.trim()) {
      setError('Please enter a design title');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      let asset = null;
      let finalWidth = canvasWidth;
      let finalHeight = canvasHeight;

      if (file) {
        asset = await uploadAsset(file);
        finalWidth = asset.width || canvasWidth;
        finalHeight = asset.height || canvasHeight;
      } else {
        setIsBlank(true);
      }

      const design = await createDesign(designTitle, finalWidth, finalHeight);

      if (asset) {
        const layer = await createLayer({
          type: 'IMAGE',
          designId: design.id,
          assetId: asset.id,
          x: 0,
          y: 0,
          width: asset.width || finalWidth,
          height: asset.height || finalHeight,
          rotation: 0,
          flipX: false,
          flipY: false,
          opacity: 1,
          zIndex: 0,
          visible: true,
          locked: true,
        });

        setLayers([layer]);
        setTimeout(() => onAddLayerToCanvas(layer), 100);
      }

      setCurrentDesign(design);
    } catch (error) {
      console.error('Failed to create design:', error);
      setError('Failed to create design. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadDesign = async (designId: string) => {
    try {
      setError(null);

      const design = await loadDesign(designId);
      const sortedLayers = (design.layers || [])
        .slice()
        .sort((a: Layer, b: Layer) => b.zIndex - a.zIndex);

      setCurrentDesign(design);
      setLayers(sortedLayers);

      setTimeout(() => {
        sortedLayers.forEach((layer: Layer) => {
          onAddLayerToCanvas(layer);
        });
      }, 100);
    } catch (error) {
      console.error('Failed to load design', error);
      setError('Failed to load design');
    }
  };

  const handleDeleteDesign = async (id: string) => {
    try {
      setError(null);
      await deleteDesign(id);

      fetchDesigns();
    } catch (error) {
      console.error('Failed to delete design', error);
      setError('Failed to delete design');
    }
  };

  const handleMoveLayer = async (layerId: string, direction: 'up' | 'down') => {
    const idx = layers.findIndex((l) => l.id === layerId);
    if (idx === -1) return;

    const sorted = [...layers].sort((a, b) => b.zIndex - a.zIndex);

    const currentIdx = sorted.findIndex((l) => l.id === layerId);
    if (currentIdx === -1) return;

    const swapIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const layerA = sorted[currentIdx];
    const layerB = sorted[swapIdx];

    if (layerA.locked || layerB.locked) return;

    const tempZ = layerA.zIndex;
    layerA.zIndex = layerB.zIndex;
    layerB.zIndex = tempZ;

    await Promise.all([
      updateLayer(layerA.id, layerA.fabricObject!, layerA),
      updateLayer(layerB.id, layerB.fabricObject!, layerB),
    ]);

    setLayers((prev) =>
      prev.map((l) =>
        l.id === layerA.id
          ? { ...l, zIndex: layerA.zIndex }
          : l.id === layerB.id
          ? { ...l, zIndex: layerB.zIndex }
          : l,
      ),
    );

    if (fabricCanvasRef.current) {
      sortLayersByZIndex(fabricCanvasRef.current, layersRef.current);
      fabricCanvasRef.current.renderAll();
    }
  };

  const onAddLayerToCanvas = async (layer: Layer) => {
    await addLayerToCanvas(layer, fabricCanvasRef, layersRef);
  };

  const onAddLayer = (file: File) => {
    handleAddLayer(
      file,
      currentDesign,
      layers,
      setLayers,
      setUploading,
      setError,
      uploadAsset,
      (layer) => onAddLayerToCanvas(layer),
    );
  };
  const onDeleteLayer = (layerId: string) => {
    handleDeleteLayer(
      layerId,
      layers,
      setLayers,
      selectedLayerId,
      setSelectedLayerId,
      fabricCanvasRef,
      setError,
    );
  };

  const onToggleVisibility = (layerId: string) => {
    handleToggleVisibility(layerId, layers, setLayers, fabricCanvasRef);
  };

  const onSelectLayer = (layerId: string) => {
    handleSelectLayer(layerId, layers, fabricCanvasRef, setSelectedLayerId);
  };

  const onFlip = (direction: 'horizontal' | 'vertical') => {
    handleFlip(
      direction,
      selectedLayerId,
      layersRef,
      fabricCanvasRef,
      setLayers,
      handleLayerTransformUpdate,
    );
  };

  const onRotate = (angle: number) => {
    handleRotate(
      selectedLayerId,
      layersRef,
      fabricCanvasRef,
      angle,
      handleLayerTransformUpdate,
    );
  };

  const onScale = (factor: number) => {
    handleScale(
      factor,
      selectedLayerId,
      layersRef,
      fabricCanvasRef,
      handleLayerTransformUpdate,
    );
  };

  const onCrop = () => {
    handleCrop(selectedLayerId, layersRef, fabricCanvasRef, setCropMode);
  };

  const onApplyCrop = () => {
    handleApplyCrop(
      selectedLayerId,
      layers,
      setLayers,
      fabricCanvasRef,
      setCropMode,
      setError,
    );
  };

  const onCancelCrop = () => {
    handleCancelCrop(selectedLayerId, layers, fabricCanvasRef, setCropMode);
  };

  return (
    <div className="flex flex-col gap-y-4 min-h-screen">
      <div className="p-2 border-b">
        <div
          className=" cursor-pointer p-2 flex gap-x-2 items-center bg-gray-600 rounded-2xl w-[330px] mx-auto"
          onClick={() => {
            setCurrentDesign(null);

            setLayers([]);
            setDesignTitle('');
            fetchDesigns();
          }}
        >
          <Image src={Logo} width={64} height={64} alt={'logo'} />
          <h1 className="text-2xl font-bold text-white">
            Burrito Image Editor
          </h1>
        </div>
      </div>

      {error && (
        <div className="mx-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {!currentDesign ? (
        <div className="flex flex-col gap-y-8 flex-1 p-4 ">
          <div className="max-w-[1200px] mx-auto">
            {' '}
            <Settings
              designTitle={designTitle}
              setDesignTitle={setDesignTitle}
              canvasWidth={canvasWidth}
              setCanvasWidth={setCanvasWidth}
              canvasHeight={canvasHeight}
              setCanvasHeight={setCanvasHeight}
              uploading={uploading}
              handleCreateCanvas={handleCreateCanvas}
            />
          </div>

          <section className="flex flex-col gap-y-5">
            <p className="text-[24px]">Existing Designs</p>
            <div className="flex flex-wrap gap-x-2">
              {allDesigns.map((design, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-y-4 py-4 px-7 bg-none border border-gray-200 bg-gray-100/50 rounded-md cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-[18px]">{design.title}</p>
                    <p>{new Date(design.createdAt!).toLocaleDateString()}</p>
                  </div>

                  <div className="flex flex-row gap-x-2">
                    <Button
                      className="bg-white text-black border border-gray-400 cursor-pointer hover:bg-black hover:text-white"
                      onClick={() => {
                        handleLoadDesign(design.id);
                      }}
                    >
                      Load Design
                    </Button>
                    <Button
                      className="text-white bg-red-500 cursor-pointer"
                      onClick={() => {
                        handleDeleteDesign(design.id);
                      }}
                    >
                      Delete Design
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <>
          <div className="px-4 py-2 bg-white border-b flex justify-between items-center">
            <div className="text-sm text-gray-700">
              <strong>Design:</strong> {currentDesign.title} |
              <strong> Canvas:</strong> {currentDesign.width}x
              {currentDesign.height}px
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleExportPNG(fabricCanvasRef, currentDesign)}
                className="flex items-center gap-2"
                disabled={!currentDesign}
              >
                <Download className="w-4 h-4" />
                Export PNG
              </Button>
              <Button
                onClick={() => handleExportJPEG(fabricCanvasRef, currentDesign)}
                className="flex items-center gap-2"
                disabled={!currentDesign}
              >
                <Download className="w-4 h-4" />
                Export JPEG
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden min-h-0">
            <div className="flex-1 flex items-center justify-center bg-gray-50 overflow-auto p-4">
              <div className="border-4 border-gray-300 bg-white">
                <canvas ref={canvasRef} />
              </div>
            </div>

            <div className="w-[450px] flex flex-col bg-white border-l">
              <div className="p-4 border-b h-[520px]">
                <h3 className="font-semibold mb-4">Transformations</h3>
                <Toolbar
                  selectedLayerId={selectedLayerId}
                  selectedLayer={selectedLayer}
                  onRotate={onRotate}
                  onFlip={onFlip}
                  onScale={onScale}
                  onCrop={onCrop}
                  crop={cropMode}
                />

                {cropMode && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      className="flex-1 border border-gray-200 bg-white text-black"
                      onClick={onApplyCrop}
                    >
                      Apply Crop
                    </Button>
                    <Button
                      className="flex-1 border border-gray-200 bg-white text-black"
                      onClick={onCancelCrop}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 border-b">
                <LayerPanel
                  layers={layers}
                  selectedLayerId={selectedLayerId}
                  onSelectLayer={onSelectLayer}
                  onDeleteLayer={onDeleteLayer}
                  onToggleVisibility={onToggleVisibility}
                  onAddLayer={onAddLayer}
                  uploading={uploading}
                  onMoveLayer={handleMoveLayer}
                  canvasBlank={isBlank}
                />
              </div>
            </div>
          </div>

          <div className="h-[180px] border-t bg-white overflow-y-auto">
            <Gallery
              onSelectAsset={handleAddAssetFromGallery}
              uploading={uploading}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CanvasPage;
