# MentalHealth Chatbot

AI-powered mental health chatbot with LangChain + Groq, voice emotion analysis, and session memory.

## Architecture

```
frontend/        → Vercel (React + Vite static site)
backend/         → GCP Cloud Run (FastAPI Python, Docker container)
terraform/        → GCP infrastructure (Artifact Registry, Service Account)
.github/         → GitHub Actions CI/CD
```

- **Frontend:** React 18 + Vite + Tailwind v4
- **Backend:** FastAPI + LangChain + Groq (Llama-3.3-70b-versatile) + Whisper STT + librosa audio analysis
- **Deployment:** GitHub Actions → Cloud Run (backend) + Vercel (frontend)

---

## Running Locally

### Terminal 1 — Backend (Docker)
```bash
docker build -t mentalhealth-chatbot -f backend/Dockerfile backend/
docker run -p 8000:8080 \
  --env-file backend/.env.local \
  -e FRONTEND_ORIGIN=http://localhost:5173 \
  mentalhealth-chatbot
```
Backend: http://localhost:8000

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

---

## Environment Variables

### Backend (`backend/.env.local`) — NEVER commit this
```
GROQ_API_KEY=your_groq_gsk_key_here
FRONTEND_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`) — for local dev only
```
VITE_SERVER_IP=127.0.0.1
VITE_SERVER_PORT=8000
VITE_USE_HTTPS=false
```

---

## Deployment Overview

```
Push to main
    ↓
GitHub Actions (deploy.yml)
    ├── Build Docker image → GCP Artifact Registry
    ├── Deploy to Cloud Run
    ├── Update Vercel env vars with backend URL
    └── Trigger Vercel frontend redeploy
```

---

## GCP Setup (One-Time)

### Step 1 — Create GCP Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → New Project
2. Note your **Project ID** (e.g. `my-project-123`)

### Step 2 — Run Terraform

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars → set your project_id

terraform init
terraform plan   # Review
terraform apply  # Confirm with "yes"
```

### Step 3 — Create GitHub Actions Service Account Key

```bash
# Replace YOUR_PROJECT_ID with your actual GCP project ID
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

Copy the contents of `key.json` — this becomes `GCP_SA_KEY` in GitHub secrets.

### Step 4 — Add GitHub Secrets

Go to **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Where to get it |
|---|---|
| `GCP_SA_KEY` | After running Terraform, run: `gcloud iam service-accounts keys create key.json --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com` — paste the entire JSON |
| `GCP_PROJECT_ID` | Your GCP project ID from [console.cloud.google.com](https://console.cloud.google.com) |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys → Create |
| `VERCEL_TOKEN` | [vercel.com → Settings → Tokens](https://vercel.com) → Create |
| `VERCEL_ORG_ID` | Run: `npx vercel inspect <project-url>` — look for `orgId` |
| `VERCEL_PROJECT_ID` | Same as above — look for `projectId` |
| `VERCEL_FRONTEND_URL` | Your Vercel frontend URL (e.g. `mental-health-chatbot.vercel.app`) — no `https://` |

---

## Vercel Setup (One-Time)

1. Import `MentalHealth_Chatbot` repo in [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `frontend`
3. Framework: Vite (auto-detected)
4. Add environment variables before deploying:
   - `VITE_SERVER_PORT` = `443`
   - `VITE_USE_HTTPS` = `true`
5. Deploy (leave `VITE_SERVER_IP` blank — GitHub Actions fills it after first backend deploy)

After first successful deployment, GitHub Actions will automatically update `VITE_SERVER_IP` with the Cloud Run URL.

### GitHub Secrets vs Vercel Dashboard — which env vars go where?

**GitHub Secrets (Settings → Secrets and variables → Actions):**

| Secret | Used by |
|---|---|
| `GCP_SA_KEY` | GitHub Actions → authenticate with GCP |
| `GCP_PROJECT_ID` | GitHub Actions → GCP project |
| `GROQ_API_KEY` | GitHub Actions → passed to Cloud Run as env var |
| `VERCEL_TOKEN` | GitHub Actions → call Vercel API to update env vars |
| `VERCEL_ORG_ID` | GitHub Actions → target correct Vercel org |
| `VERCEL_PROJECT_ID` | GitHub Actions → target correct Vercel project |
| `VERCEL_FRONTEND_URL` | GitHub Actions → set `FRONTEND_ORIGIN` on Cloud Run |

**Vercel Dashboard (Project → Settings → Environment Variables):**

| Variable | Value | Why not GitHub Secret |
|---|---|---|
| `VITE_SERVER_IP` | (blank initially) | GitHub Actions fills this via Vercel API after deploy |
| `VITE_SERVER_PORT` | `443` | Static — set once in Vercel |
| `VITE_USE_HTTPS` | `true` | Static — set once in Vercel |

`GROQ_API_KEY` does **not** go in Vercel — it's injected into **Cloud Run** (GCP) by GitHub Actions at deploy time.

---

## CI/CD Pipeline

Every push to `main` triggers:

1. **Backend → Cloud Run**
   - Builds Docker image via `gcloud builds submit`
   - Pushes to GCP Artifact Registry
   - Deploys to Cloud Run (us-central1, 1Gi memory, 0-5 instances)
   - Sets `GROQ_API_KEY` and `FRONTEND_ORIGIN` env vars

2. **Vercel env vars update**
   - Extracts hostname from Cloud Run URL
   - Updates `VITE_SERVER_IP` env var on Vercel via `vercel env add`

3. **Frontend → Vercel**
   - Deploys React app to Vercel
   - Uses updated `VITE_SERVER_IP` to call backend

---

## Security

- `.env.local` files contain real API keys — **never commit them**
- Terraform state files are **gitignored** — never commit them either
- Rotate `GROQ_API_KEY` if exposed publicly at [console.groq.com](https://console.groq.com)

---

## File Structure

```
MentalHealth_Chatbot/
├── backend/
│   ├── server.py           FastAPI app
│   ├── requirements.txt    Python deps
│   ├── Dockerfile          Cloud Run container
│   ├── .env.local         Local keys (NEVER commit)
│   └── .env.example       Template
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── terraform/
│   ├── main.tf             GCP resources
│   ├── variables.tf
│   └── terraform.tfvars.example
├── .github/workflows/deploy.yml
└── .gitignore
```
