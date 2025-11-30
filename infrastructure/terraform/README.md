# Terraform Infrastructure Documentation

## Overview

This directory contains Terraform configurations for provisioning and managing Azure infrastructure for the Task Manager application.

## Architecture

The infrastructure includes:

- **Virtual Network**: Isolated network with separate subnets for application and database
- **Virtual Machine**: Ubuntu 22.04 LTS VM running Docker containers
- **PostgreSQL Database**: Azure PostgreSQL Flexible Server for data persistence
- **Key Vault**: Secure storage for secrets and connection strings
- **Application Insights**: Application performance monitoring
- **Log Analytics**: Centralized logging
- **Network Security Groups**: Firewall rules for security
- **Container Registry** (optional): Private Docker registry

## Files Structure

```
infrastructure/terraform/
├── main.tf                          # Main infrastructure configuration
├── variables.tf                     # Variable definitions
├── outputs.tf                       # Output definitions
├── cloud-init.yaml                  # VM bootstrap configuration
├── terraform.dev.tfvars.example     # Development environment variables
├── terraform.prod.tfvars.example    # Production environment variables (to be created)
└── README.md                        # This file
```

## Prerequisites

### Required Tools

- Terraform >= 1.5.0
- Azure CLI
- SSH key pair
- Docker Hub account (for image storage)

### Azure Resources

You need:
1. Azure subscription
2. Service Principal with Contributor role
3. Resource group for Terraform state (optional)

## Setup Instructions

### 1. Install Terraform

**Windows (Chocolatey):**
```powershell
choco install terraform
```

**macOS (Homebrew):**
```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

**Linux:**
```bash
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

Verify installation:
```bash
terraform --version
```

### 2. Azure Login

```bash
az login
az account list --output table
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 3. Create Service Principal

```bash
az ad sp create-for-rbac --name "taskmanager-terraform" --role Contributor --scopes /subscriptions/YOUR_SUBSCRIPTION_ID

# Save the output, you'll need:
# - appId (ARM_CLIENT_ID)
# - password (ARM_CLIENT_SECRET)
# - tenant (ARM_TENANT_ID)
```

### 4. Generate SSH Keys

If you don't have SSH keys:

```bash
# Linux/macOS/Git Bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/taskmanager_azure

# Windows PowerShell
ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f $env:USERPROFILE\.ssh\taskmanager_azure
```

### 5. Configure Environment Variables

Create a `.env` file (git-ignored):

```bash
# Azure Credentials
export ARM_CLIENT_ID="your-client-id"
export ARM_CLIENT_SECRET="your-client-secret"
export ARM_SUBSCRIPTION_ID="your-subscription-id"
export ARM_TENANT_ID="your-tenant-id"

# Terraform Variables
export TF_VAR_ssh_public_key="$(cat ~/.ssh/taskmanager_azure.pub)"
export TF_VAR_db_admin_password="YourSecurePassword123!"
export TF_VAR_app_secret_key="your-secret-key-here"
export TF_VAR_docker_hub_username="your-dockerhub-username"
export TF_VAR_docker_hub_token="your-dockerhub-token"
```

Load the environment:
```bash
source .env
```

### 6. Create Variables File

Copy the example and customize:

```bash
cd infrastructure/terraform
cp terraform.dev.tfvars.example terraform.dev.tfvars

# Edit terraform.dev.tfvars with your values
# DO NOT commit this file to Git!
```

## Usage

### Initialize Terraform

```bash
cd infrastructure/terraform
terraform init
```

### Validate Configuration

```bash
terraform validate
terraform fmt -check
```

### Plan Infrastructure

```bash
terraform plan -var-file="terraform.dev.tfvars"
```

### Apply Infrastructure

```bash
terraform apply -var-file="terraform.dev.tfvars"

# Or auto-approve (use with caution)
terraform apply -var-file="terraform.dev.tfvars" -auto-approve
```

### View Outputs

```bash
# All outputs
terraform output

# Specific output
terraform output vm_public_ip
terraform output -json deployment_summary
```

### Destroy Infrastructure

```bash
terraform destroy -var-file="terraform.dev.tfvars"
```

## GitHub Actions Integration

### Required Secrets

Configure these in GitHub: `Settings > Secrets and variables > Actions > New repository secret`

#### Azure Credentials
- `ARM_CLIENT_ID` - Service Principal Application ID
- `ARM_CLIENT_SECRET` - Service Principal Password
- `ARM_SUBSCRIPTION_ID` - Azure Subscription ID
- `ARM_TENANT_ID` - Azure Tenant ID
- `AZURE_CREDENTIALS` - JSON format (see below)

**AZURE_CREDENTIALS format:**
```json
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "subscriptionId": "your-subscription-id",
  "tenantId": "your-tenant-id"
}
```

#### Application Secrets
- `SSH_PUBLIC_KEY` - Public SSH key content
- `SSH_PRIVATE_KEY` - Private SSH key content
- `DB_ADMIN_PASSWORD` - PostgreSQL admin password
- `APP_SECRET_KEY` - Application secret key
- `DOCKER_HUB_USERNAME` - Docker Hub username
- `DOCKER_HUB_TOKEN` - Docker Hub access token

### Workflow Triggers

The Terraform workflow runs on:

1. **Push to `main` or `develop`** - When Terraform files change
2. **Pull Request** - Runs validation and plan
3. **Manual Dispatch** - From GitHub Actions UI

### Manual Terraform Operations

From GitHub Actions UI:
1. Go to **Actions** tab
2. Select **Terraform Infrastructure** workflow
3. Click **Run workflow**
4. Choose action: `plan`, `apply`, or `destroy`

## State Management

### Local State (Development)

By default, state is stored locally. For production, use remote backend.

### Remote State (Production)

The configuration uses Azure Storage for remote state:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstateprod"
    container_name       = "tfstate"
    key                  = "taskmanager.tfstate"
  }
}
```

**Setup remote state:**

```bash
# Create resource group
az group create --name terraform-state-rg --location eastus

# Create storage account
az storage account create \
  --name tfstateprod \
  --resource-group terraform-state-rg \
  --location eastus \
  --sku Standard_LRS

# Create blob container
az storage container create \
  --name tfstate \
  --account-name tfstateprod
```

## Security Best Practices

1. **Never commit sensitive files:**
   - `*.tfvars` (except `.example` files)
   - `terraform.tfstate`
   - `*.auto.tfvars`
   - `.terraform/`

2. **Use secure passwords:**
   - Minimum 12 characters
   - Mix of upper, lower, numbers, special characters
   - Change default passwords

3. **Restrict SSH access:**
   - Change `allowed_ssh_cidr` to your IP
   - Use SSH keys, never passwords

4. **Enable encryption:**
   - Database encryption at rest (enabled by default)
   - Disk encryption (enabled by default)
   - Transit encryption with SSL/TLS

5. **Use Key Vault:**
   - Store all secrets in Azure Key Vault
   - Access via Managed Identity

## Troubleshooting

### Authentication Errors

```bash
# Verify Azure login
az account show

# Re-login if needed
az login

# Verify Service Principal
az ad sp list --display-name "taskmanager-terraform"
```

### State Lock Issues

```bash
# Force unlock (use carefully)
terraform force-unlock LOCK_ID
```

### Resource Already Exists

```bash
# Import existing resource
terraform import azurerm_resource_group.main /subscriptions/XXX/resourceGroups/rg-name
```

### SSH Connection Issues

```bash
# Test SSH
ssh -i ~/.ssh/taskmanager_azure azureuser@VM_PUBLIC_IP

# Check NSG rules
az network nsg rule list --nsg-name nsg-app-dev --resource-group rg-taskmanager-dev-eastus --output table
```

### Cost Estimation

Use Azure Pricing Calculator or:

```bash
# Install Infracost
brew install infracost  # macOS
# or download from https://www.infracost.io/docs/

# Breakdown costs
infracost breakdown --path .

# Compare changes
terraform plan -out=tfplan.binary
terraform show -json tfplan.binary > plan.json
infracost diff --path plan.json
```

## Resource Sizing

### Development Environment
- VM: `Standard_B2s` (2 vCPU, 4 GB RAM)
- Database: `B_Standard_B1ms` (1 vCore, 2 GB RAM, 32 GB storage)
- Estimated cost: ~$50-80/month

### Production Environment
- VM: `Standard_D2s_v3` (2 vCPU, 8 GB RAM)
- Database: `GP_Standard_D2s_v3` (2 vCore, 8 GB RAM, 128 GB storage)
- High Availability: Zone-redundant
- Estimated cost: ~$200-300/month

## Next Steps

After infrastructure is provisioned:

1. **SSH into the VM:**
   ```bash
   ssh azureuser@$(terraform output -raw vm_public_ip)
   ```

2. **Verify Docker installation:**
   ```bash
   docker --version
   docker-compose --version
   ```

3. **Check application status:**
   ```bash
   cd /opt/taskmanager
   docker-compose ps
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

## Support

For issues or questions:
- Check [Terraform Azure Provider Docs](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- Review Azure documentation
- Open an issue in the repository

## References

- [Terraform Documentation](https://www.terraform.io/docs)
- [Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
