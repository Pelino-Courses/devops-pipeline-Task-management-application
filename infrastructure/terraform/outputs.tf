# Resource Group
output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Location of the resource group"
  value       = azurerm_resource_group.main.location
}

# Virtual Machine
output "vm_public_ip" {
  description = "Public IP address of the application VM"
  value       = azurerm_public_ip.vm.ip_address
}

output "vm_private_ip" {
  description = "Private IP address of the application VM"
  value       = azurerm_network_interface.vm.private_ip_address
}

output "vm_name" {
  description = "Name of the virtual machine"
  value       = azurerm_linux_virtual_machine.app.name
}

output "vm_admin_username" {
  description = "Admin username for SSH access"
  value       = azurerm_linux_virtual_machine.app.admin_username
}

# Database
output "postgres_fqdn" {
  description = "FQDN of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "postgres_database_name" {
  description = "Name of the PostgreSQL database"
  value       = azurerm_postgresql_flexible_server_database.main.name
}

output "database_connection_string" {
  description = "Database connection string (sensitive)"
  value       = "postgresql://${var.db_admin_username}:***@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${var.db_name}"
  sensitive   = false
}

# Key Vault
output "key_vault_name" {
  description = "Name of the Key Vault"
  value       = azurerm_key_vault.main.name
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}

# Application Insights
output "application_insights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Application Insights connection string"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}

# Container Registry (if enabled)
output "acr_login_server" {
  description = "Login server for Azure Container Registry"
  value       = var.enable_acr ? azurerm_container_registry.main[0].login_server : "N/A"
}

output "acr_admin_username" {
  description = "Admin username for Azure Container Registry"
  value       = var.enable_acr ? azurerm_container_registry.main[0].admin_username : "N/A"
  sensitive   = true
}

# Application URLs
output "application_url" {
  description = "URL to access the application"
  value       = "http://${azurerm_public_ip.vm.ip_address}"
}

output "api_url" {
  description = "URL to access the API"
  value       = "http://${azurerm_public_ip.vm.ip_address}:8000"
}

output "api_docs_url" {
  description = "URL to access the API documentation"
  value       = "http://${azurerm_public_ip.vm.ip_address}:8000/api/v1/docs"
}

# SSH Connection
output "ssh_connection_string" {
  description = "SSH connection string"
  value       = "ssh ${var.vm_admin_username}@${azurerm_public_ip.vm.ip_address}"
}

# Ansible Inventory Information
output "ansible_inventory" {
  description = "Ansible inventory information in JSON format"
  value = jsonencode({
    all = {
      hosts = {
        taskmanager = {
          ansible_host                 = azurerm_public_ip.vm.ip_address
          ansible_user                 = var.vm_admin_username
          ansible_ssh_private_key_file = "~/.ssh/id_rsa"
          database_host                = azurerm_postgresql_flexible_server.main.fqdn
          database_name                = var.db_name
          database_user                = var.db_admin_username
          environment                  = var.environment
        }
      }
    }
  })
}

# Summary Output
output "deployment_summary" {
  description = "Summary of deployed resources"
  value = {
    environment    = var.environment
    location       = var.location
    vm_ip          = azurerm_public_ip.vm.ip_address
    database_fqdn  = azurerm_postgresql_flexible_server.main.fqdn
    key_vault_name = azurerm_key_vault.main.name
    frontend_url   = "http://${azurerm_public_ip.vm.ip_address}:5173"
    backend_url    = "http://${azurerm_public_ip.vm.ip_address}:8000"
    api_docs       = "http://${azurerm_public_ip.vm.ip_address}:8000/api/v1/docs"
  }
}
