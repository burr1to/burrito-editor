# Setup

1. Clone the repo

git clone https://github.com/yourusername/img-editor.git

cd burrito-editor

2. Install dependencies

npm install

3. Generate Prisma client

npx prisma generate

4. Set up the database (creates tables)

npx prisma db push

5. (Optional) Seed with sample data

npm run db:seed

6. Start the development server

npm run dev

7: To see DB tables in UI form

npx prisma studio

# Architecture Overview

## Frontend

- Nextjs with App Router
- TailwindCSS
- Fabricjs for Image Manipulation

## Backend

- Nextjs API routes (at REST)
- Prisma ORM (used Postgres locally)
- File uploads via FormData and fs

## Data Flow

- Separated User Actions

  - Add Design
  - Add Layer to Design
  - Save/Load Design
  - Transform each Layer
  - Select/Move/Delete Layers

- All state changes recorded in DB (in Layer table)

![Alt text](./public/readme/flow.png)

## Libraries

- Nextjs with TS (Easy Routing, Full-Stack, use own API routes, Type Safety)
- Prisma (Type-safe, easy DB access, ORM)
- Fabric.js (Easy Image Manipulation, Easy Canvas creation, Good docs)
- Tailwind CSS (Easy, Rapid)
- Shadcn (UI components/ templates)
- Lucide (Ready-to-use icons)

## What Works

- Create/Delete/Update Designs (Canvas)
- Uplaod assets (Images)
- Add/Delete/Select/Move layer
- Transform(Rotate, Scale, Flip, Crop) layers
- Export canvas as PNG/JPEG
- Changes persist to DB

## What More

- Currently working on a undo-redo feature
- Image snapping to canvas feature
- Support for other layers (text, shape)
- Responsiveness, better UI and UX
- Better error handling
- Authentication
