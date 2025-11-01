# Setup

1. **Clone the repo**

```bash
git clone https://github.com/yourusername/img-editor.git
cd burrito-editor
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up PostgreSQL database**

Make sure you have PostgreSQL installed and running locally.

Create a database:

```bash
createdb img_editor_db
```

Or using `psql`:

```sql
CREATE DATABASE img_editor_db;
```

4. **Create env file**

```bash
cp .env.example .env
```

Then update `.env` with your PostgreSQL credentials:

```bash
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/img_editor_db?schema=public"
```

5. **Generate Prisma client and setup DB**

```bash
npx prisma generate
npx prisma db push   # or: npx prisma migrate dev --name init
```

6. **(Optional) Seed with sample data**

```bash
npm run db:seed
```

7. **Start dev server**

```bash
npm run dev
```

8. **See DB tables in UI form**

```bash
npx prisma studio
```

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

- Dockerize database (Currently working)
- Undo-redo feature (Currently working)
- Image snapping to canvas feature
- Support for other layers (text, shape)
- Responsiveness, better UI and UX
- Better error handling
- Authentication
