# Environment Configuration
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
}

# Networking Configuration
variable "vnet_address_space" {
  description = "Address space for the virtual network"
  type        = string
  default     = "10.0.0.0/16"
}

variable "app_subnet_prefix" {
  description = "Address prefix for application subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "db_subnet_prefix" {
  description = "Address prefix for database subnet"
  type        = string
  default     = "10.0.2.0/24"
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH into the VM"
  type        = string
  default     = "*" # Change to specific IP for production
}

# Virtual Machine Configuration
variable "vm_size" {
  description = "Size of the virtual machine"
  type        = string
  default     = "Standard_B2s" # 2 vCPUs, 4 GB RAM - good for dev/test
}

variable "vm_admin_username" {
  description = "Admin username for the VM"
  type        = string
  default     = "azureuser"
}

variable "ssh_public_key" {
  description = "SSH public key for VM access"
  type        = string
  sensitive   = true
}

variable "docker_compose_version" {
  description = "Docker Compose version to install"
  type        = string
  default     = "2.23.0"
}

# Database Configuration
variable "db_admin_username" {
  description = "PostgreSQL administrator username"
  type        = string
  default     = "taskmanager_admin"
}

variable "db_admin_password" {
  description = "PostgreSQL administrator password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Name of the PostgreSQL database"
  type        = string
  default     = "taskmanager_db"
}

variable "db_storage_mb" {
  description = "Storage size for PostgreSQL in MB"
  type        = number
  default     = 32768 # 32 GB
}

variable "db_sku_name" {
  description = "SKU name for PostgreSQL"
  type        = string
  default     = "B_Standard_B1ms" # Burstable, 1 vCore, 2 GB RAM
}

# Container Registry
variable "enable_acr" {
  description = "Enable Azure Container Registry"
  type        = bool
  default     = false # Use Docker Hub by default
}

# Tags
variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "TaskManager"
    ManagedBy   = "Terraform"
    Application = "task-management-app"
  }
}

# Application Configuration
variable "app_secret_key" {
  description = "Secret key for the application"
  type        = string
  sensitive   = true
}

variable "docker_hub_username" {
  description = "Docker Hub username for pulling images"
  type        = string
  default     = ""
}

variable "docker_hub_token" {
  description = "Docker Hub access token"
  type        = string
  sensitive   = true
  default     = ""
}
