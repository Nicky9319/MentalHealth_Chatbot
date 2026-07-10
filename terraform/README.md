# Terraform Setup for GCP

This directory manages the GCP infrastructure for the MentalHealth Chatbot backend using Terraform.

## What It Creates

- **Artifact Registry** Docker repository (`us-central1`)
- **Service Account** `github-actions` with correct IAM roles for Cloud Run deployment
- (Cloud Run itself is managed by GitHub Actions — see `.github/workflows/deploy.yml`)

## One-Time Setup

### 1. Install Terraform

```bash
# macOS
brew install terraform

# Linux (amd64)
curl -LO https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

### 2. Create `terraform.tfvars`

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars and fill in your GCP project ID
```

### 3. Initialize Terraform

```bash
terraform init
```

### 4. Plan & Apply

```bash
terraform plan   # Review what will be created
terraform apply  # Type "yes" to confirm
```

### 5. Create the GitHub Actions Service Account Key

After `terraform apply` succeeds, run:

```bash
# Replace YOUR_PROJECT_ID with your actual GCP project ID
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Copy the contents of key.json into your GitHub repo secrets as GCP_SA_KEY
# Settings → Secrets and variables → Actions → New repository secret
```

> ⚠️ The service account key is shown only **once**. Save it somewhere safe (e.g., 1Password) before closing the terminal.

## Adding Secrets to GitHub

After getting the service account key, add these secrets in your GitHub repo (`Settings → Secrets and variables → Actions → New repository secret`):

| Secret Name | Value |
|---|---|
| `GCP_SA_KEY` | Full JSON content of `key.json` |
| `GCP_PROJECT_ID` | Your GCP project ID (e.g. `my-project-123`) |
| `GROQ_API_KEY` | Your Groq API key (get from [console.groq.com](https://console.groq.com)) |
| `VERCEL_TOKEN` | Vercel API token ([vercel.com → Settings → Tokens](https://vercel.com)) |
| `VERCEL_ORG_ID` | Vercel org ID (`vercel inspect <project>` or dashboard) |
| `VERCEL_PROJECT_ID` | Vercel project ID for frontend |
| `VERCEL_FRONTEND_URL` | Your Vercel frontend URL (e.g. `mental-health-chatbot.vercel.app`) |

## Tear Down

```bash
terraform destroy  # Removes all GCP resources created above
```

## Files

```
terraform/
├── main.tf              Terraform resources (APIs, Artifact Registry, Service Account)
├── variables.tf         Input variables
├── terraform.tfvars.example  Template — copy to terraform.tfvars and fill in
└── README.md            This file
```
