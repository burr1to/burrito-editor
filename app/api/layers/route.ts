import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { createLayerSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createLayerSchema.parse(body);

    const layer = await prisma.layer.create({
      data: {
        type: validatedData.type,
        designId: validatedData.designId,
        assetId: validatedData.assetId,
        x: validatedData.x,
        y: validatedData.y,
        width: validatedData.width,
        height: validatedData.height,
        rotation: validatedData.rotation,
        flipX: validatedData.flipX,
        flipY: validatedData.flipY,
        opacity: validatedData.opacity,
        zIndex: validatedData.zIndex,
        visible: validatedData.visible,
        locked: validatedData.locked,
      },
      include: {
        asset: true,
      },
    });

    return NextResponse.json(layer);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 },
      );
    }
    console.error('Error creating layer:', error);
    return NextResponse.json(
      { error: 'Failed to create layer' },
      { status: 500 },
    );
  }
}
