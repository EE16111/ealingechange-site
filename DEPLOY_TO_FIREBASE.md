# Deploying to Firebase Hosting (GCP)

Since your application backend is hosted on Google Apps Script (Google Cloud), the best way to host your frontend is **Firebase Hosting**. It is fast, free (for this scale), and integrates perfectly with Google services.

## Prerequisites

1.  **Google Account**: You already have one.
2.  **Node.js**: You already have this installed.

## Step 1: Install Firebase CLI

Open your terminal (VS Code terminal is fine) and run:

```bash
npm install -g firebase-tools
```

## Step 2: Login to Firebase

Run this command and log in with your Google account:

```bash
firebase login
```

## Step 3: Initialize Project

1.  Run the initialization command:
    ```bash
    firebase init hosting
    ```

2.  **Follow the prompts:**
    *   **Are you ready to proceed?** -> `Yes`
    *   **Please select an option:** -> `Create a new project` (or select an existing one if you have one).
        *   If creating new, give it a unique ID (e.g., `ealing-exchange-app-2024`).
    *   **What do you want to use as your public directory?** -> `dist`
        *   *(Important: Type `dist` because Vite builds to this folder)*
    *   **Configure as a single-page app (rewrite all urls to /index.html)?** -> `Yes`
    *   **Set up automatic builds and deploys with GitHub?** -> `No` (You can set this up later if you want).
    *   **File dist/index.html already exists. Overwrite?** -> `No`
        *   *(Do NOT overwrite your index.html)*

## Step 4: Build your Application

Before deploying, make sure you have the latest version built:

```bash
npm run build
```

*Ensure the build completes successfully without errors.*

## Step 5: Deploy

Run the deploy command:

```bash
firebase deploy --only hosting
```

**Success!** The terminal will show you a "Hosting URL" (e.g., `https://ealing-exchange-app-2024.web.app`). Click it to view your live site.

## Important Note on CORS

Your backend is currently hosted at `script.google.com`.
If you deploy to Firebase and see "Network Error" or data not loading, it might be due to **CORS (Cross-Origin Resource Sharing)** checks by the browser.

Since your Google Apps Script is serving as the API:
1.  Ensure your Google Apps Script `doPost` function returns the correct CORS headers for your new domain.
2.  Typically, allowing `Access-Control-Allow-Origin: *` in your Google Apps Script is the easiest fix for this type of setup.

## Alternative: Google Cloud Run

If you prefer using a containerized approach on standard GCP (heavier, possibly not free tier):

1.  Create a `Dockerfile`.
2.  Build the image.
3.  Push to Google Artifact Registry.
4.  Deploy to efficient Cloud Run.

*But for a React app like this, Firebase Hosting is generally superior.*
