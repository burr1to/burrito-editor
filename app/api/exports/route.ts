import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { designId, dataUrl, format, width, height } = await request.json();

    if (!designId || !dataUrl || !format) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const timestamp = Date.now();
    const filename = `export_${designId}_${timestamp}.${format}`;

    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
    const filepath = path.join(downloadsDir, filename);
    fs.writeFileSync(filepath, buffer);

    const stats = fs.statSync(filepath);

    const exportRecord = await prisma.exports.create({
      data: {
        designId,
        filename,
        format,
        width,
        height,
        sizeBytes: stats.size,
        url: `/downloads/${filename}`,
      },
    });

    return NextResponse.json(exportRecord);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export image' },
      { status: 500 },
    );
  }
}
