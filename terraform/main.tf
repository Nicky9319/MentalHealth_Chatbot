terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# =============================================================================
# Enable GCP APIs
# =============================================================================
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "iam.googleapis.com",
  ])

  service            = each.key
  disable_on_destroy = false
}

# =============================================================================
# Artifact Registry Repository (for Docker images)
# =============================================================================
resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = var.artifact_repo
  description   = "Docker repository for MentalHealth Chatbot backend"
  format        = "DOCKER"

  depends_on = [google_project_service.apis]
}

# =============================================================================
# Service Account for GitHub Actions (Cloud Run deployer)
# =============================================================================
resource "google_service_account" "github_actions" {
  account_id   = "github-actions"
  display_name = "GitHub Actions CI"
  description  = "Service account used by GitHub Actions to deploy to Cloud Run"
}

# IAM: Cloud Run Admin + Artifact Registry Writer + Cloud Build Editor
resource "google_project_iam_member" "github_actions_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_project_iam_member" "github_actions_artifactregistry_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_project_iam_member" "github_actions_cloudbuild_editor" {
  project = var.project_id
  role    = "roles/cloudbuild.builds.builder"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# =============================================================================
# Cloud Run Service (optional — can also be deployed via gcloud CLI in CI)
# =============================================================================
# Note: The GitHub Actions workflow handles the actual image build + Cloud Run
# deployment using `gcloud builds submit` + `gcloud run deploy`. This resource
# is commented out to avoid conflicts (two different tools managing the same
# service). Uncomment only if you want Terraform to fully manage Cloud Run.
#
# resource "google_cloud_run_v2_service" "backend" {
#   location = var.region
#   name     = "mentalhealth-chatbot-backend"
#
#   template {
#     service_account = google_service_account.github_actions.email
#
#     scaling {
#       min_instance_count = 0
#       max_instance_count = 5
#     }
#
#     containers {
#       image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.artifact_repo}/mentalhealth-chatbot-backend:${var.image_tag}"
#       resources {
#         limits = {
#           cpu    = "1"
#           memory = "1Gi"
#         }
#       }
#       ports {
#         container_port = 8080
#       }
#       env {
#         name  = "PORT"
#         value = "8080"
#       }
#       env {
#         name  = "GROQ_API_KEY"
#         value = var.groq_api_key  # Set in terraform.tfvars
#       }
#       env {
#         name  = "FRONTEND_ORIGIN"
#         value = var.frontend_origin
#       }
#     }
#   }
#
#   traffic {
#     type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
#     percent = 100
#   }
#
#   depends_on = [google_project_service.apis]
# }

# =============================================================================
# Outputs
# =============================================================================
output "artifact_registry_url" {
  description = "URL of the Artifact Registry Docker repository"
  value       = google_artifact_registry_repository.docker_repo.repository_url
}

output "github_actions_service_account_email" {
  description = "Email of the GitHub Actions service account"
  value       = google_service_account.github_actions.email
}

output "github_actions_service_account_key" {
  description = "One-time key for the GitHub Actions service account (visible only once — save securely)"
  value       = google_service_account.github_actions.email # Key must be created manually: gcloud iam service-accounts keys create key.json --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com
  sensitive   = true
}
