variable "project_id" {
  description = "Your GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for Cloud Run and Artifact Registry"
  type        = string
  default     = "us-central1"
}

variable "artifact_repo" {
  description = "Name of the Artifact Registry Docker repository"
  type        = string
  default     = "mentalhealth-chatbot"
}

# Uncomment and fill these if you want Terraform to manage Cloud Run directly
# variable "groq_api_key" {
#   description = "Your Groq API key (GROQ_API_KEY)"
#   type        = string
#   sensitive   = true
# }

# variable "frontend_origin" {
#   description = "Origin of the frontend (e.g., https://mental-health-chatbot.vercel.app)"
#   type        = string
#   default     = "*"
# }

# variable "image_tag" {
#   description = "Docker image tag to deploy (usually the Git commit SHA)"
#   type        = string
#   default     = "latest"
# }
