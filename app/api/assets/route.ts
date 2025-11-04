import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { prisma } from '../../../lib/prisma';
import sharp from 'sharp';
import { validateFileUpload } from '@/lib/validation';
import crypto from 'crypto';

const uploadDirectory = path.join(process.cwd(), 'public', 'uploads');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    const validatedFile = validateFileUpload(file, 10, [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ]);

    if (!fs.existsSync(uploadDirectory))
      fs.mkdirSync(uploadDirectory, { recursive: true });

    const bytes = await validatedFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    const sha256 = hash.digest('hex');

    const existingAsset = await prisma.asset.findUnique({
      where: { sha256 },
    });

    if (existingAsset) {
      return NextResponse.json(
        {
          error:
            'Duplicate file detected. This image has already been uploaded.',
          existingAsset,
        },
        { status: 409 },
      );
    }

    const filename = `${Date.now()}-${validatedFile.name}`;
    const filepath = path.join(uploadDirectory, filename);
    fs.writeFileSync(filepath, buffer);
    const metadata = await sharp(filepath).metadata();

    const asset = await prisma.asset.create({
      data: {
        url: `/uploads/${filename}`,
        originalName: validatedFile.name,
        width: metadata.width || null,
        height: metadata.height || null,
        sizeBytes: validatedFile.size,
        mimeType: validatedFile.type,
        sha256: sha256,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);

    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Failed to fetch designs:', error);
    return NextResponse.json(
      { error: 'Failed to load asset gallery' },
      { status: 500 },
    );
  }
}
