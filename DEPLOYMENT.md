# Deployment

This repo has a Vite frontend in `client` and an Express backend in `server`.

## Backend: Render

1. Create a new Render Web Service from this GitHub repo.
2. Use the Blueprint if Render detects `render.yaml`, or use these manual settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Add the environment variables listed in `server/.env.example`.
4. Deploy and copy the generated Render URL.

## Frontend: Vercel

1. Import this GitHub repo into Vercel.
2. Use these settings:
   - Framework Preset: `Vite`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add the environment variables listed in `client/.env.example`.
4. Set `VITE_SERVER_URL` to your Render backend URL.
5. Deploy and copy the generated Vercel URL.

## Final Connection

After Vercel deploys, go back to Render and set `CLIENT_URL` to your Vercel frontend URL, then redeploy the backend.
