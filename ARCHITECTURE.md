# Infrastructure Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          GitHub Repository                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐   │
│  │   Source    │  │   Terraform  │  │  GitHub Actions         │   │
│  │   Code      │  │   Configs    │  │  Workflows              │   │
│  └─────────────┘  └──────────────┘  └─────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │   GitHub Actions CI/CD  │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐      ┌──────────────────┐     ┌──────────────┐
│  CI Pipeline  │      │    Terraform     │     │  Docker Hub  │
│  - Lint       │      │  Infrastructure  │     │   - Backend  │
│  - Test       │      │  Provisioning    │     │   - Frontend │
│  - Security   │      └─────────┬────────┘     └──────────────┘
└───────────────┘                │
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Azure Cloud          │
                    ├────────────────────────┤
                    │                        │
      ┌─────────────┼────────────────────────┼─────────────┐
      │             │                        │             │
      ▼             ▼                        ▼             ▼
┌─────────┐  ┌────────────┐        ┌──────────────┐  ┌──────────┐
│   VM    │  │ PostgreSQL │        │  Key Vault   │  │   App    │
│ Docker  │  │  Database  │        │   Secrets    │  │ Insights │
│Compose  │  │  Flexible  │        │              │  │          │
└─────────┘  └────────────┘        └──────────────┘  └──────────┘
      │
      ▼
┌─────────────────────────────────┐
│     Application Stack           │
│  ┌─────────┐  ┌──────────────┐ │
│  │Frontend │  │   Backend    │ │
│  │  React  │  │   FastAPI    │ │
│  │  :5173  │  │   :8000      │ │
│  └─────────┘  └──────────────┘ │
│  ┌─────────┐  ┌──────────────┐ │
│  │PostgreSQL│ │    Redis     │ │
│  │  :5432  │  │   :6379      │ │
│  └─────────┘  └──────────────┘ │
│  ┌─────────┐  ┌──────────────┐ │
│  │Prometheus│ │   Grafana    │ │
│  │  :9090  │  │   :3001      │ │
│  └─────────┘  └──────────────┘ │
└─────────────────────────────────┘
```

## Network Architecture

```
Azure Virtual Network (10.0.0.0/16)
│
├── App Subnet (10.0.1.0/24)
│   ├── Network Security Group
│   │   ├── Allow SSH (22)
│   │   ├── Allow HTTP (80)
│   │   ├── Allow HTTPS (443)
│   │   ├── Allow Backend (8000)
│   │   └── Allow Frontend (5173)
│   │
│   └── Linux VM (Ubuntu 22.04)
│       ├── Public IP (Static)
│       ├── Private IP (Dynamic)
│       └── Managed Disk (64 GB Premium SSD)
│
└── Database Subnet (10.0.2.0/24)
    └── PostgreSQL Flexible Server
        ├── Private Endpoint
        ├── Zone Redundant HA
        └── 32 GB Storage
```

## CI/CD Pipeline Flow

```
┌──────────────┐
│  Git Push    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│  1. CI Pipeline                  │
│     - Backend Lint & Test        │
│     - Frontend Lint & Build      │
│     - Security Scan              │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  2. Docker Build & Push          │
│     - Build Backend Image        │
│     - Build Frontend Image       │
│     - Push to Docker Hub         │
│     - Scan with Trivy            │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  3. Terraform Provision          │
│     - Validate Config            │
│     - Plan Infrastructure        │
│     - Apply Changes              │
│     - Output VM IP & Secrets     │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  4. Ansible Deploy               │
│     - Configure VM               │
│     - Deploy Docker Compose      │
│     - Start Application          │
│     - Verify Health              │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  5. Post-Deployment Tests        │
│     - Health Check               │
│     - API Availability           │
│     - Frontend Load              │
│     - Create Summary             │
└──────────────────────────────────┘
```

## Deployment Workflow Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub Actions Workflows                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────┐      ┌─────────────┐      ┌─────────────┐     │
│  │   ci.yml   │      │security.yml │      │terraform.yml│     │
│  │            │      │             │      │             │     │
│  │ - Lint     │◄─────┤ - CodeQL    │      │ - Validate  │     │
│  │ - Test     │      │ - Semgrep   │      │ - Plan      │     │
│  │ - Build    │      │ - Secrets   │      │ - Apply     │     │
│  └─────┬──────┘      └──────┬──────┘      └─────┬───────┘     │
│        │                    │                    │             │
│        └────────────────────┼────────────────────┘             │
│                             │                                  │
│                             ▼                                  │
│                    ┌─────────────────┐                         │
│                    │   deploy.yml    │                         │
│                    │                 │                         │
│                    │ 1. Run CI       │                         │
│                    │ 2. Security     │                         │
│                    │ 3. Docker Build │                         │
│                    │ 4. Terraform    │                         │
│                    │ 5. Ansible      │                         │
│                    │ 6. Smoke Tests  │                         │
│                    └─────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────┐         ┌───────────┐         ┌──────────┐
│  User    │  HTTPS  │  Azure    │   SSH   │   VM     │
│  Browser │◄───────►│  Public   │◄───────►│  Docker  │
│          │         │  IP       │         │  Host    │
└──────────┘         └───────────┘         └────┬─────┘
                                                 │
                    ┌────────────────────────────┼────────────┐
                    │                            │            │
                    ▼                            ▼            ▼
            ┌───────────────┐          ┌─────────────┐  ┌─────────┐
            │   Frontend    │          │   Backend   │  │ Monitor │
            │   Container   │          │  Container  │  │  Stack  │
            │   Port 5173   │◄────────►│  Port 8000  │  │         │
            └───────────────┘          └──────┬──────┘  └─────────┘
                                               │
                    ┌──────────────────────────┼──────────────┐
                    │                          │              │
                    ▼                          ▼              ▼
            ┌───────────────┐        ┌─────────────┐  ┌────────────┐
            │  PostgreSQL   │        │    Redis    │  │   Azure    │
            │  Container    │        │  Container  │  │ PostgreSQL │
            │  Port 5432    │        │  Port 6379  │  │  Flexible  │
            └───────────────┘        └─────────────┘  └────────────┘
```

## Security Layers

```
┌────────────────────────────────────────────────────────────────┐
│                        Security Layers                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: Network Security                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - Network Security Groups (NSG)                          │  │
│  │ - Private Virtual Network                                │  │
│  │ - Subnet Isolation                                       │  │
│  │ - DDoS Protection                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Layer 2: Application Security                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - HTTPS/TLS Encryption                                   │  │
│  │ - JWT Authentication                                     │  │
│  │ - CORS Configuration                                     │  │
│  │ - Rate Limiting                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Layer 3: Data Security                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - Database Encryption at Rest                            │  │
│  │ - Private Database Endpoint                              │  │
│  │ - Secure Connection Strings                              │  │
│  │ - Azure Key Vault for Secrets                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Layer 4: Code Security                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - SAST (Bandit, Semgrep, CodeQL)                         │  │
│  │ - Dependency Scanning (Safety, npm audit)                │  │
│  │ - Container Scanning (Trivy)                             │  │
│  │ - Secret Scanning (TruffleHog)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Layer 5: Infrastructure Security                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - Terraform Security Scanning (tfsec, Checkov)           │  │
│  │ - Least Privilege Access (RBAC)                          │  │
│  │ - Service Principal Authentication                       │  │
│  │ - SSH Key-based Authentication                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## Resource Naming Convention

```
Resource Type          │ Pattern                           │ Example
─────────────────────────────────────────────────────────────────────
Resource Group         │ rg-{app}-{env}-{region}          │ rg-taskmanager-dev-eastus
Virtual Network        │ vnet-{app}-{env}                 │ vnet-taskmanager-dev
Subnet                 │ snet-{function}-{env}            │ snet-app-dev
Virtual Machine        │ vm-{app}-{env}                   │ vm-taskmanager-dev
Network Interface      │ nic-{resource}-{env}             │ nic-vm-dev
Public IP              │ pip-{resource}-{env}             │ pip-vm-dev
NSG                    │ nsg-{resource}-{env}             │ nsg-app-dev
PostgreSQL Server      │ psql-{app}-{env}-{random}        │ psql-taskmanager-dev-a1b2c3
Database               │ {app}_db                         │ taskmanager_db
Key Vault              │ kv-{app}-{random}                │ kv-taskmanager-a1b2c3
Storage Account        │ st{app}{env}{random}             │ sttaskmanagerdevab12
Container Registry     │ acr{app}{env}{random}            │ acrtaskmanagerdevab12
App Insights           │ appi-{app}-{env}                 │ appi-taskmanager-dev
Log Analytics          │ log-{app}-{env}                  │ log-taskmanager-dev
```

## Cost Breakdown (Estimated Monthly)

### Development Environment
```
Service                        │ SKU                  │ Cost/Month
──────────────────────────────────────────────────────────────────
Virtual Machine                │ Standard_B2s         │ ~$30
Managed Disk (64 GB)           │ Premium SSD          │ ~$10
Public IP (Static)             │ Standard             │ ~$3
PostgreSQL Flexible Server     │ B_Standard_B1ms      │ ~$15
PostgreSQL Storage (32 GB)     │ Standard             │ ~$5
Virtual Network                │ Standard             │ Free
NSG                            │ Standard             │ Free
Key Vault                      │ Standard             │ ~$1
Application Insights           │ Pay-as-you-go        │ ~$5
Log Analytics                  │ Pay-as-you-go        │ ~$5
──────────────────────────────────────────────────────────────────
TOTAL                                                 │ ~$74/month
```

### Production Environment
```
Service                        │ SKU                  │ Cost/Month
──────────────────────────────────────────────────────────────────
Virtual Machine                │ Standard_D2s_v3      │ ~$70
Managed Disk (128 GB)          │ Premium SSD          │ ~$20
Public IP (Static)             │ Standard             │ ~$3
PostgreSQL Flexible Server     │ GP_Standard_D2s_v3   │ ~$150
PostgreSQL Storage (128 GB)    │ Standard             │ ~$20
High Availability              │ Zone Redundant       │ Included
Virtual Network                │ Standard             │ Free
NSG                            │ Standard             │ Free
Key Vault                      │ Standard             │ ~$1
Application Insights           │ Pay-as-you-go        │ ~$20
Log Analytics                  │ Pay-as-you-go        │ ~$15
──────────────────────────────────────────────────────────────────
TOTAL                                                 │ ~$299/month
```

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Stack                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Application Level                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  Prometheus    │  │    Grafana     │  │   Loki       │  │
│  │  (Metrics)     │  │ (Visualization)│  │   (Logs)     │  │
│  └────────┬───────┘  └───────┬────────┘  └──────┬───────┘  │
│           │                  │                   │          │
│           └──────────────────┼───────────────────┘          │
│                              │                              │
│  ┌───────────────────────────┴───────────────────────────┐ │
│  │             Application Containers                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Cloud Level                                                 │
│  ┌────────────────┐  ┌────────────────┐                    │
│  │   Application  │  │ Log Analytics  │                    │
│  │    Insights    │  │   Workspace    │                    │
│  └────────────────┘  └────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

## Disaster Recovery

```
Recovery Strategy:
├── Automated Backups
│   ├── PostgreSQL: 7-day retention
│   ├── VM Snapshots: On-demand
│   └── Terraform State: Azure Storage (versioned)
│
├── High Availability
│   ├── Database: Zone-redundant (prod)
│   ├── Application: Docker restart policies
│   └── Network: Azure SLA 99.9%
│
└── Recovery Procedures
    ├── Infrastructure: terraform apply
    ├── Application: Redeploy via GitHub Actions
    └── Database: Point-in-time restore
```

---

**This architecture provides:**
- ✅ Automated infrastructure provisioning
- ✅ Continuous integration and deployment
- ✅ Multi-layered security
- ✅ Comprehensive monitoring
- ✅ Disaster recovery capabilities
- ✅ Cost-effective scaling
