# Deploy Promptz to Vercel

1. Extract this ZIP file.
2. Import the project at https://vercel.com/new (or deploy this folder with the Vercel CLI).
3. Set the project root to the folder containing `package.json`.
4. Let Vercel detect Next.js and the package manager. The build command is `npm run build` (or `bun run build`). Leave the output directory at its default.
5. Deploy.

Promptz is a single Next.js app. Its `/api/improve` endpoint is part of that same app, so it does not need a second service or service binding.

**AI provider note:** The API currently uses `z-ai-web-dev-sdk`. Deployment of the Next.js app does not guarantee that this provider SDK will work in Vercel's runtime. If `/api/improve` returns a provider/runtime error after deployment, the AI integration will need to be switched to an API provider supported by your Vercel deployment and configured with its API key.
