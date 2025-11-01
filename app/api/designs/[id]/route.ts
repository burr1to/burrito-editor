import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const design = await prisma.design.findUnique({
      where: { id },
      include: {
        layers: {
          include: {
            asset: true,
          },
          orderBy: {
            zIndex: 'asc',
          },
        },
      },
    });

    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    return NextResponse.json(design);
  } catch (error) {
    console.error('Failed to fetch design:', error);
    return NextResponse.json(
      { error: 'Failed to fetch design' },
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

    await prisma.design.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete design:', error);
    return NextResponse.json(
      { error: 'Failed to delete design' },
      { status: 500 },
    );
  }
}
