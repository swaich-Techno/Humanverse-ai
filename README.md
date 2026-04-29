# HumanVerse AI Studio

Beginner-friendly Next.js starter for generating realistic AI characters, places, scenes, product shots and short videos with:

- `Next.js` for the app
- `MongoDB Atlas` for saved requests
- `Vercel` for hosting
- `Pollinations` as the media generation provider

## What this project does

- Lets you choose `image` or `video`
- Supports realistic `people`, `places`, `scenes`, and `products`
- Saves each request to MongoDB when `MONGODB_URI` is configured
- Still runs without MongoDB so the app does not crash during setup

## Before you start

You need:

- Node.js installed
- A free MongoDB Atlas cluster
- A Vercel account
- A Pollinations API key for the most reliable image and video generation

## Local setup on Windows PowerShell

1. Open the project folder in PowerShell.
2. Install packages:

```powershell
npm.cmd install
```

3. Create your local environment file:

```powershell
Copy-Item .env.example .env.local
```

4. Open `.env.local` and fill in your values:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=humanverse
POLLINATIONS_API_KEY=your_pollinations_key
```

5. Start the app:

```powershell
npm.cmd run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## MongoDB Atlas setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. In Atlas, create a database user.
3. In Atlas, allow your current IP address.
4. Copy the connection string.
5. Put that string into `MONGODB_URI`.

The app stores saved requests in:

- Database: value from `MONGODB_DB` or `humanverse`
- Collection: `generations`

## Vercel deployment

1. Upload this project to GitHub.
2. Go to [Vercel](https://vercel.com/new).
3. Import your GitHub repository.
4. In the Vercel project settings, add these environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=humanverse
POLLINATIONS_API_KEY=your_pollinations_key
```

5. Click deploy.

## Important notes

- `MONGODB_URI` is optional for the UI to load, but required if you want requests saved to MongoDB.
- For Vercel, assume `POLLINATIONS_API_KEY` is required for reliable generation.
- Video generation can take longer than image generation.
- This starter is designed for realistic short-form marketing and creator assets, not long movie rendering.

## Useful commands

```powershell
npm.cmd run dev
npm.cmd run typecheck
npm.cmd run build
```

## GitHub upload if you do not use Git locally

If Git is confusing, you can still do this:

1. Create a new repository on GitHub.
2. Click `uploading an existing file`.
3. Drag this whole project folder into GitHub.
4. Commit the upload.
5. Import that repository into Vercel.
