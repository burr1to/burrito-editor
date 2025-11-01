import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

function createMockAsset(filename: string, width: number, height: number) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const filepath = path.join(uploadDir, filename);

  if (!fs.existsSync(filepath)) {
    console.warn(`Warning: Image file not found: ${filepath}`);
    console.warn('Please add sample images to public/uploads/ directory');
  }

  let sizeBytes = 0;
  let sha256Hash = null;

  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    sizeBytes = stats.size;

    const fileBuffer = fs.readFileSync(filepath);
    sha256Hash = createHash('sha256').update(fileBuffer).digest('hex');
  }

  return {
    url: `/uploads/${filename}`,
    originalName: filename,
    mimeType: filename.endsWith('.png')
      ? 'image/png'
      : filename.endsWith('.jpg') || filename.endsWith('.jpeg')
      ? 'image/jpeg'
      : 'image/webp',
    width,
    height,
    sizeBytes,
    sha256: sha256Hash,
  };
}

async function main() {
  console.log('Seeding to DB');

  console.log('Clearing data initially.');
  await prisma.layer.deleteMany({});
  await prisma.design.deleteMany({});
  await prisma.asset.deleteMany({});

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created directory for assets');
  }

  const files = fs.readdirSync(uploadDir).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

  if (files.length === 0) {
    console.error('No image files found in in uploads folder');
    console.log('Please add at least one image file.');
    return;
  }

  console.log('Creating assets...\n');

  const assets = [];
  for (const file of files.slice(0, 5)) {
    const asset = await prisma.asset.create({
      data: createMockAsset(file, 1920, 1080),
    });

    assets.push(asset);
    console.log(`Created asset: ${asset.originalName}`);
  }

  if (assets.length === 0) {
    console.error('No assets were created');
    return;
  }

  console.log('\nCreating designs...');

  const design1 = await prisma.design.create({
    data: {
      title: '1200x800 canvas',
      width: 1200,
      height: 800,
      layers: {
        create: [
          {
            type: 'IMAGE',
            assetId: assets[0].id,
            x: 0,
            y: 0,
            width: 1200,
            height: 800,
            rotation: 0,
            flipX: false,
            flipY: false,
            opacity: 1,
            zIndex: 0,
            visible: true,
            locked: true,
          },
        ],
      },
    },
    include: {
      layers: true,
    },
  });
  console.log(
    `Created design: ${design1.title} (${design1.width}x${design1.height}px)`,
  );

  const design2 = await prisma.design.create({
    data: {
      title: 'Square Canvas',
      width: 900,
      height: 900,
      layers: {
        create: [
          {
            type: 'IMAGE',
            assetId: assets[Math.min(1, assets.length - 1)].id,
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            rotation: 0,
            flipX: false,
            flipY: false,
            opacity: 1,
            zIndex: 0,
            visible: true,
            locked: false,
          },
        ],
      },
    },
    include: {
      layers: true,
    },
  });

  console.log(
    `Created design: ${design2.title} (${design2.width}x${design2.height}px)`,
  );

  const design3 = await prisma.design.create({
    data: {
      title: 'Blank canvas',
      width: 900,
      height: 600,
    },
  });
  console.log(
    `Created design: ${design3.title} (${design3.width}x${design3.height}px)`,
  );

  console.log('\nSeed completed successfully!');
}

main()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
