# Architecture Overview: Ealing Exchange (Cost-Optimized)

This document outlines the architecture and deployment workflow for the Ealing Exchange ecosystem, specifically optimized for **zero-cost operation** within personal/learning tiers.

## Core Pillars
1.  **Zero-Cost Maps**: Migrated from Google Maps Platform to **Leaflet.js + OpenStreetMap**. No API keys or credits required.
2.  **Zero-Cost Hosting**: Strategic use of **Firebase Hosting** for frontend applications.
3.  **Zero-Cost Backend**: Leveraging **Google Apps Script** (via `script.google.com`) for managed execution without infrastructure overhead.
4.  **Zero-Cost Registry**: Migrated from GCP Artifact Registry to **GitHub Container Registry (GHCR)**.

## Deployment Workflow
```mermaid
graph LR
    A[Local Development] -- git push --> B[GitHub Repository]
    B -- triggers --> C[GitHub Actions]
    C -- Build & Test --> D[Build Artifacts]
    D -- Push Image --> E[GHCR (ghcr.io)]
    D -- Deploy Site --> F[Firebase Hosting]
```

### 1. GitHub Actions (.github/workflows)
Automated builds are handled by GitHub Actions. A paid GitHub account provides generous inclusive minutes for private repositories.

### 2. GitHub Container Registry (GHCR)
Instead of using GCP Artifact Registry (which has a storage cost), we use GHCR. This is integrated with your GitHub account and is free for most use cases.

### 3. Firebase Hosting
Used for serving the `ealing-exchange-app` frontend. It's fast, CDN-backed, and remains free within the Spark plan limits.

## Infrastructure Maintenance
### GCP Artifact Registry Cleanup
To prevent lingering charges from old builds (especially from Firebase Functions), run the automated cleanup script:
`./scripts/cleanup_registry.sh`

### Billing
Billing has been unlinked from primary learning projects. Any new GCP services added should be checked for "Always Free" eligibility to avoid unexpected charges.

---
*Last Updated: March 2026*
