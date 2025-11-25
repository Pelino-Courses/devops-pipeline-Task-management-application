# DevSecOps-Ready Task Manager Application

A modern, secure, and scalable full-stack task management application built with DevSecOps best practices.

## 🚀 Features

### User Features
- ✅ User authentication with JWT
- ✅ Task CRUD operations
- ✅ Task priorities (Low, Medium, High, Critical)
- ✅ Categories and tags
- ✅ File attachments (PDFs/images)
- ✅ Calendar and reminders
- ✅ Advanced filters and search
- ✅ Activity history
- 🎨 Dark & Light themes with system preference detection

### Admin Features
- 📊 Analytics dashboard
- 👥 User management
- 🔐 Role-based access control
- 📝 Security and audit logs
- ⚙️ System configuration

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM
- **Pydantic** - Data validation
- **JWT** - Authentication
- **Celery** - Background tasks (optional)

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **React Query** - Server state management

### DevSecOps
- **GitHub Actions** - CI/CD
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **Terraform** - Infrastructure as Code
- **Ansible** - Configuration management
- **Prometheus/Grafana** - Monitoring
- **Trivy** - Container scanning
- **Semgrep** - SAST
- **Bandit** - Python security linting

## 📁 Project Structure

```
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configurations
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   ├── tests/              # Backend tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # Context providers
│   │   └── utils/          # Utilities
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── infrastructure/         # IaC
│   ├── terraform/          # Terraform configs
│   ├── kubernetes/         # K8s manifests
│   └── ansible/            # Ansible playbooks
├── .github/
│   └── workflows/          # CI/CD pipelines
├── monitoring/             # Observability
│   ├── prometheus/
│   ├── grafana/
│   └── alerts/
├── docs/                   # Documentation
└── docker-compose.yml      # Local development
```

## 🚦 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/Pelino-Courses/devops-pipeline-Task-management-application.git
cd devops-pipeline-Task-management-application
```

2. **Start with Docker Compose**
```bash
docker-compose up -d
```

3. **Backend setup (alternative)**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

4. **Frontend setup (alternative)**
```bash
cd frontend
npm install
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🔒 Security Features

- OWASP ASVS compliance
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation with Pydantic
- SQL injection prevention
- XSS protection
- CSRF protection
- Security headers (CSP, HSTS, X-Frame-Options)
- Encrypted sensitive data
- Audit logging
- Rate limiting
- Container vulnerability scanning
- SAST/DAST integration

## 🔄 CI/CD Pipeline

The project includes comprehensive GitHub Actions workflows:

- **Code Quality**: Linting, formatting
- **Security Scanning**: SAST, dependency checks, container scanning
- **Testing**: Unit tests, integration tests, coverage reporting
- **Build**: Docker image builds
- **Deployment**: GitOps with ArgoCD/FluxCD

## 📊 Monitoring & Observability

- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Loki**: Log aggregation
- **Jaeger**: Distributed tracing
- **Alertmanager**: Alert management

## 🏗️ Infrastructure

- **Terraform**: Cloud resource provisioning
- **Kubernetes**: Container orchestration
- **Ansible**: Configuration management
- **OPA/Kyverno**: Policy enforcement

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Security](./docs/SECURITY.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing](./docs/CONTRIBUTING.md)

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app

# Frontend tests
cd frontend
npm test
npm run test:coverage
```

## 🔐 Environment Variables

See `.env.example` files in backend and frontend directories.

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details on our code of conduct and development process.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ following DevSecOps best practices**
