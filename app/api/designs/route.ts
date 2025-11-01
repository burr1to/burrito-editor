import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { designSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = designSchema.parse(body);

    const design = await prisma.design.create({
      data: {
        title: validatedData.title,
        width: validatedData.width,
        height: validatedData.height,
      },
    });

    return NextResponse.json(design);
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
    return NextResponse.json(
      { error: 'Failed to create design' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const designs = await prisma.design.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(designs);
  } catch (error) {
    console.error('Failed to fetch designs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch designs' },
      { status: 500 },
    );
  }
}
