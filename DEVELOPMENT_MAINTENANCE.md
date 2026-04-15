# Ealing Exchange: Developer & Maintenance Guide

This document provides a technical overview of the Ealing Exchange platform to help future developers understand the architecture, recent fixes, and how to maintain the system.

## 🏗️ Project Overview
Ealing Exchange is a modern, high-performance currency exchange platform built with **React**, **Vite**, and **Firebase**. It features real-time rate tracking, automated customer notifications, and PWA (Progressive Web App) capabilities.

---

## 🛠️ Recent Major Fixes & Features

### 1. Navigation & Routing (React Router)
**The Problem:** The app previously used custom state-based navigation. Refreshing the page on `/contact` or `/blog` caused a Firebase 404 because the server didn't know about those routes.
**The Fix:** Migrated to `react-router-dom`. We configured `firebase.json` with a "rewrites" rule to send all traffic to `index.html`, allowing the React Router to handle deep-linking correctly.
**Developer Tip:** Always add new pages in `src/App.tsx` within the `<Routes>` block.

### 2. Automated Backend (Cloud Functions)
We implemented two critical automation triggers in the `functions/` directory:
- **`sendOrderConfirmation`**: A Firestore trigger that fires when a new doc is added to `orders`. It queues a branded email.
- **`checkRateAlerts`**: A scheduled function (runs hourly) that compares live market rates against user-defined alerts in the `rateAlerts` collection.
- **Trigger Email Extension**: We use the official Firebase extension. It watches the `mail` collection. To send an email from *any* part of the app, simply write a document to the `mail` collection.

### 3. PWA & Offline Support
The app is configured as a Progressive Web App using `vite-plugin-pwa`.
- **Assets:** Icons are generated via `scripts/generate-icons.cjs`.
- **Caching:** We use a `CacheFirst` strategy for static assets and map tiles, and `NetworkFirst` for live exchange rates.
- **Manifest:** Located in `vite.config.ts`.

### 4. Reliability (Testing)
All core mathematics (buying vs. selling, spread calculations, alert triggers) have been extracted into `src/utils/calculationUtils.ts`.
- **Run Tests:** `npm test`
- **Gatekeeping:** The CI/CD pipeline will **fail** and block a deployment if any of the 45 unit tests fail.

---

## 🚀 Deployment & CI/CD

### GitHub Actions
The pipeline is defined in `.github/workflows/deploy.yml`. It handles:
1. **Testing**: Running Vitest.
2. **Docker**: Building a container for the GHCR registry.
3. **Firebase**: Deploying both the Frontend (Hosting) and the Cloud Functions.

### ⚠️ Critical Maintenance Note: IAM Permissions
To deploy Cloud Functions from GitHub, the service account `github-actions-deployer@ealing-exchange-484820.iam.gserviceaccount.com` **must** have the **"Service Account User"** role in the GCP Console. If deployments fail with an "ActAs" error, check this first.

---

## 📋 Future Work Recommendations
- **Sitemap Generation**: Add a script to generate `sitemap.xml` for better SEO ranking.
- **Analytics**: Integrate Google Analytics 4 (GA4) specifically for tracking the "Reserve Now" conversion funnel.
- **Currency Expansion**: The logic is ready; simply add new currency codes to the `currencies` array in `exchangeService.ts`.

---
**Maintained by:** Antigravity AI
**Last Updated:** April 2026
