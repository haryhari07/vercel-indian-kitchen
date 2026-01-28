INSTRUCTIONS FOR RECIPE IMAGES
==============================

This folder (`public/recipes`) is where you can store your own images for specific recipes.

How to use:
1. Paste your recipe image here (e.g., `butter-chicken.jpg`).
2. Open the file `data/recipes.ts`.
3. Find the recipe you want to update.
4. Change the `imageUrl` field to point to your new image.

Example:
  original: imageUrl: "https://commons.wikimedia.org/...",
  new:      imageUrl: "/recipes/butter-chicken.jpg",

Note:
- Ensure the file extension matches (.jpg, .png, etc.).
- Try to use high-quality images but keep file sizes reasonable (under 500KB is best for speed).
