import { z } from 'zod';

export const designSchema = z.object({
  title: z.string().min(1, 'Title required').max(100, 'Title is too long'),
  width: z
    .number()
    .min(1, 'Width must be at least 1')
    .max(10000, 'Width too large'),
  height: z
    .number()
    .min(1, 'Height must be at least 1')
    .max(10000, 'Height too large'),
});

export const createLayerSchema = z.object({
  type: z.enum(['IMAGE', 'TEXT', 'SHAPE']),
  designId: z.string().min(1, 'Design ID is required'),
  assetId: z.string().min(1, 'Asset ID is required').optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().min(1, 'Width must be positive'),
  height: z.number().min(1, 'Height must be positive'),
  rotation: z.number().min(-360).max(360),
  flipX: z.boolean(),
  flipY: z.boolean(),
  opacity: z.number().min(0).max(1, 'Opacity must be between 0 and 1'),
  zIndex: z.number().int().min(0),
  visible: z.boolean(),
  locked: z.boolean(),
  cropX: z.number().nullable().optional(),
  cropY: z.number().nullable().optional(),
  cropW: z.number().min(1).nullable().optional(),
  cropH: z.number().min(1).nullable().optional(),
});

export const updateLayerSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().min(1).optional(),
  height: z.number().min(1).optional(),
  rotation: z.number().min(-360).max(360).optional(),
  flipX: z.boolean().optional(),
  flipY: z.boolean().optional(),
  opacity: z.number().min(0).max(1).optional(),
  zIndex: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
  locked: z.boolean().optional(),
  cropX: z.number().nullable().optional(),
  cropY: z.number().nullable().optional(),
  cropW: z.number().min(1).nullable().optional(),
  cropH: z.number().min(1).nullable().optional(),
});

export const uploadAssetSchema = z.object({
  file: z.instanceof(File, { message: 'File is required' }),
  maxSizeMB: z.number().default(10),
  allowedTypes: z
    .array(z.string())
    .default(['image/png', 'image/jpeg', 'image/jpg']),
});

export const validateFileUpload = (
  file: File | null,
  maxSizeMB: number = 10,
  allowedTypes: string[] = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
  ],
) => {
  if (!file) {
    throw new Error('No file provided');
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File too large. Maximum size is ${maxSizeMB}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    );
  }

  return file;
};

export type CreateDesignInput = z.infer<typeof designSchema>;
export type CreateLayerInput = z.infer<typeof createLayerSchema>;
export type UpdateLayerInput = z.infer<typeof updateLayerSchema>;
