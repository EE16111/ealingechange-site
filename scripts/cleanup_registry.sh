#!/bin/bash
# cleanup_registry.sh - Safely clean Artifact Registry images to stop storage costs

PROJECT_ID="tekrenewed-757a9" # Update this to your active project

echo "🔍 Fetching repositories in project: $PROJECT_ID"
REPOS=$(gcloud artifacts repositories list --project=$PROJECT_ID --format="value(name)")

if [ -z "$REPOS" ]; then
    echo "✅ No Artifact Registry repositories found. No charges expected."
    exit 0
fi

for REPO in $REPOS; do
    echo "🧹 Cleaning repository: $REPO"
    
    # List images in the repo
    IMAGES=$(gcloud artifacts docker images list $REPO --format="value(package)")
    
    for IMAGE in $IMAGES; do
        echo "   🗑️ Deleting all versions of image: $IMAGE"
        # Deletes all versions except the latest if you want, or just everything
        # This command deletes the entire package (all versions)
        gcloud artifacts docker packages delete $IMAGE --repository=$(basename $REPO) --location=$(echo $REPO | cut -d/ -f4) --quiet
    done
done

echo "✨ Cleanup complete. Check your GCP Console to verify."
echo "🔗 https://console.cloud.google.com/artifacts"
