I used ChatGPT initially to create a high level system design by providing the Prisma schemas and Core Requirements. Since I've never used Prisma, I initially was under the presumption that I would be using a lightweight backend server like Flask.

The prompt was something like:

"want to create a simple image editor app using nextjs, prisma ORM for migrations, postgres, a light weight server (flask?) no need of auth. the image editing can be done using sharp. should i use fabric.js or konva for editor? image uploads need to take place, so using formdata, or multer, or busyboy. also the project is in typescript with strong types (no any).. Can upload a base image Can add at least one overlay image Drag/resize/rotate/flip work on layers Crop works (layer or composition) Layers can be re‑ordered Design can be saved and re‑loaded from DB Export returns a valid PNG/JPEG README explains decisions; migrations run cleanly how would i go about this?"

However, with the help of ChatGPT, I found out that I could simply be creating endpoints via Next itself, using "next/server" as the apis were simply querying databases and not performing complex backend operations.

Further, I used Copilot to assist me (I ask a lot of questions to help me understand what I am doing right or wrong). Some prompts, I gave so that I could understand certain things better.

"when u say req as unknown as Request, what does it mean? why 2 times as?"

The most major code that I authored using Copilot was probably setting up the canvas and the transformations in Canvas and Fabric.js. Since I was new to Fabric.js, I would say I used it extensively. I knew the logic of what I needed to do, but didnt know any Fabric syntax at all. So Copilot helped me a lotttt. Especially in the cropping logic, I don't think it still works how I intend it to work, need some refactoring :D.

I knew the logic, i needed a handler to create the canvas, then add layers. But how to translate that to Fabric and Canvas syntax?? Thankfully, I have some experience with Photoshop so my intuition worked as to link Design-Layer-Assets in the most basic sense. Copilot generated these handlers for me with the logic I gave it, and I refactored on top of it.

  const handleCreateCanvas = async (file?: File) => {
    if (!designTitle.trim()) {
      alert('Please enter a design title');
      return;
    }

    try {
      setUploading(true);

      let asset = null;
      let finalWidth = Math.min(canvasWidth, 1300);
      let finalHeight = Math.min(canvasHeight, 900);

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/assets', {
          method: 'POST',
          body: formData,
        });
        asset = await uploadRes.json();

        finalWidth = Math.min(asset.width || canvasWidth, 1300);
        finalHeight = Math.min(asset.height || canvasHeight, 900);
      } else {
        setIsBlank(true);
      }

      const designRes = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: designTitle,
          width: finalWidth,
          height: finalHeight,
        }),
      });

      const design = await designRes.json();

      if (asset) {
        const layerRes = await fetch('/api/layers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'IMAGE',
            designId: design.id,
            assetId: asset.id,
            x: 0,
            y: 0,
            width: Math.min(asset.width || finalWidth, finalWidth),
            height: Math.min(asset.height || finalHeight, finalHeight),
            rotation: 0,
            flipX: false,
            flipY: false,
            opacity: 1,
            zIndex: 0,
            visible: true,
            locked: false,
          }),
        });

        const layer = await layerRes.json();
        setLayers([layer]);
        
        // Add to canvas after state update
        setTimeout(() => addLayerToCanvas(layer), 100);
      }

      setCurrentDesign(design);
    } catch (error) {
      console.error('Failed to create design:', error);
    } finally {
      setUploading(false);
    }
  };

Another thing that I used AI extensively was to setup Prisma alongside the docs. 

"⨯ Error: @prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.
at module evaluation (app/lib/prisma.ts:6:26)
at module evaluation (app/api/upload/route.ts:4:1)
at Object.<anonymous> (.next/dev/server/app/api/upload/route.js:5:3)"

I was coming across errors while generating prisma schemas and Copilot (I use it with Claude), helped me a lot to find where my errors where. It was because I had set a custom output for the client, which was unnecessary, as it defaulted to the node modules.

Also, I initially wanted to use Multer for image upload alongside Node for a separate lightweight small upload server, but seeing how easily Next integrated uploads with formData (from Copilot's suggestions), I used formData and fs for uploads simply with App Router. I also asked questions for further clarity such as:

"ok, now the api should work right? however in the future, if my file is to be uploaded to a separate file server, i would use multer right?"

which gave a prompt response:

About Multer for Future Use
No, you wouldn't use multer for uploading to a separate file server. Here's why:

Current Setup (Local Storage)
File is uploaded to your Next.js server
Saved directly to /public/uploads/ using fs.writeFileSync()
No multer needed - Next.js App Router handles FormData natively
Future Setup (Separate File Server)
When uploading to external services like AWS S3, Cloudinary, Azure Blob Storage, etc., you would:

Receive the file in your API route (same as now)
Upload to the service using their SDK
Store the returned URL in your database

also used Copilot to do the cheeky stuff that I am too bored to do. "convert the created at to readable date..."

I used AI a lot, couldn't be possible to make an image editor in 2 days with zero knowledge of Fabric else. Cool that I got to learn something new with a project-ish task.
