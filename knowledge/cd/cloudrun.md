# CD: Cloud Run

Deploying a released container image to Google Cloud Run (serverless
containers, scale-to-zero).

Demonstrated in: [bitwise-devops-cloudrun](https://github.com/barikpriyabrata27/bitwise-devops-cloudrun)

Typical shape: build and push the image to Artifact Registry (CI/Release),
then `gcloud run deploy` (or a Terraform `google_cloud_run_v2_service`
resource) points the service at the new image tag. See the repo's own
README for the exact steps.

Back to [CD overview](README.md).
