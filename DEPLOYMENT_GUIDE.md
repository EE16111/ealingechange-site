# Deployment Guide for Ealing Exchange App

This application is built with React and Vite. It is ready for deployment.

## Prerequisites

- **GitHub Account** (recommended for continuous deployment)
- **Vercel** or **Netlify** account (free tier is sufficient)

## Option 1: Deploy to Vercel (Recommended)

Vercel is the creators of Next.js and provides excellent support for Vite apps.

1.  **Push your code to GitHub**:
    - Initialize a git repo if you haven't: `git init`
    - Commit your changes: `git add .`, `git commit -m "Ready for deploy"`
    - Push to a new repository on GitHub.

2.  **Connect to Vercel**:
    - Go to [vercel.com](https://vercel.com) and sign up/login.
    - Click **"Add New..."** -> **"Project"**.
    - Import your GitHub repository.
    - Vercel will automatically detect `Vite` as the framework.
    - Just click **"Deploy"**.

3.  **Done!** Your app will be live locally and updated whenever you push to GitHub.

## Option 2: Deploy to Netlify

1.  **Drag and Drop**:
    - Run `npm run build` locally (already done, check `dist` folder).
    - Go to [app.netlify.com](https://app.netlify.com).
    - Drag the `dist` folder onto the page.

2.  **Connect to Git** (Better):
    - Similar to Vercel, connect your GitHub repo to Netlify.
    - **Build Command**: `npm run build`
    - **Publish Directory**: `dist`

## Manual / Other Cloud Providers

If you use AWS S3, Firebase Hosting, or others:
- Run `npm run build` to generate the `dist` folder.
- Upload the contents of `dist` to your static hosting provider.
- Ensure your hosting provider rewrites all 404s to `index.html` (for Single Page App routing).
