import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { updateLayerSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();
    const validatedData = updateLayerSchema.parse(body);
    const { id } = await params;
    const layer = await prisma.layer.update({
      where: { id },
      data: validatedData,
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
    console.error('Error updating layer:', error);
    return NextResponse.json(
      { error: 'Failed to update layer' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.layer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting layer:', error);
    return NextResponse.json(
      { error: 'Failed to delete layer' },
      { status: 500 },
    );
  }
}
