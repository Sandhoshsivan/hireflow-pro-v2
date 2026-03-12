# HireFlowPro — AI-Powered Job Application Tracker

A full-stack SaaS platform for tracking job applications, discovering opportunities, getting AI-powered career advice, tailoring resumes to specific roles, and generating professional PDFs — built with .NET 10, React 19, and dual AI providers (Claude & Gemini).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [AI Integration](#ai-integration)
- [Job Discovery](#job-discovery)
- [Authentication & Security](#authentication--security)
- [Frontend Pages](#frontend-pages)
- [Getting Started](#getting-started)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)

---

## Features

### Core Application Tracking
- Full CRUD for job applications with status tracking (Saved → Applied → Interview → Offer → Rejected → Ghosted)
- Kanban pipeline view with drag-like status management
- Priority levels (High / Medium / Low) with follow-up date reminders
- Timeline events for each application (status changes, notes)
- Contact management per application (recruiters, hiring managers)
- CSV export of all applications
- Advanced filtering, search, and sorting

### AI-Powered Tools
- **Match Analysis** — AI scores your resume against a job description (0–100), identifies missing keywords, and gives actionable suggestions
- **Resume Tailoring** — Generates a tailored summary, highlighted skills, suggested bullet points, cover letter draft, match score, and keywords for any job
- **Career Advice Chat** — Contextual career guidance based on your current role, target role, and experience
- **PDF Generation** — Professional two-column A4 resume PDF (Lato fonts, rose accent) with @react-pdf/renderer, including tailored content when available
- **Monthly Quota System** — Free: 5/month, Pro: 90/month, Premium: Unlimited

### Job Discovery
- Search across free job boards (Remotive, Arbeitnow) with no API keys required
- Filter by keyword and location
- One-click "Save Job" to add directly to your application tracker
- Source-tagged results with company, salary, tags, and posted date

### Resume Profile
- Structured resume data: personal info, summary, skills (tag chips), experience entries, education, certifications, languages
- Serves as the foundation for AI resume tailoring and PDF generation
- One profile per user, auto-loaded during tailoring

### Admin Panel
- Dashboard with user/application/revenue statistics
- User management (CRUD, plan assignment, block/unblock, admin toggle)
- User impersonation for support/testing
- Cross-user application browsing

### Pricing & Billing
- Three-tier pricing: Free, Pro ($9.99/mo), Premium ($24.99/mo)
- Stripe integration (checkout, downgrade, payment history)
- Plan-based feature gating and AI quota enforcement

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| .NET | 10.0 | Runtime framework |
| ASP.NET Core | 10.0.3 | Web API framework |
| Entity Framework Core | 10.0.3 | ORM & migrations |
| PostgreSQL (Npgsql) | 10.0.0 | Production database |
| SQLite | 10.0.3 | Local development database |
| JWT Bearer | 8.16.0 | Token-based authentication |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.0 | UI library |
| TypeScript | 5.9.3 | Type safety |
| Vite | 7.3.1 | Build tool & dev server |
| TailwindCSS | 4.2.1 | Utility-first styling |
| React Router | 7.13.1 | Client-side routing |
| Zustand | 5.0.11 | State management |
| React Query | 5.90.21 | Server state management |
| Axios | 1.13.6 | HTTP client |
| @react-pdf/renderer | 4.3.2 | PDF generation |
| Lucide React | 0.577.0 | Icon library |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker (multi-stage) | Containerized deployment |
| Render.com | Cloud hosting (web service + PostgreSQL) |
| Node 20-alpine | Frontend build container |
| .NET 10 SDK/Runtime | Backend build & production containers |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React 19 + Vite                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │Dashboard │ │Apps/Jobs │ │AI Tools  │ │ Admin Panel │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘ │
│       └─────────────┴────────────┴─────────────┘        │
│                         Axios                            │
└─────────────────────────┬───────────────────────────────┘
                          │ REST API (JWT Bearer)
┌─────────────────────────┴───────────────────────────────┐
│                  ASP.NET Core 10 API                     │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐  │
│  │Auth     │ │Apps CRUD │ │AI Svc  │ │Job Discovery │  │
│  │Service  │ │+ Timeline│ │Claude/ │ │Remotive/     │  │
│  │JWT+PBKDF│ │+ Contacts│ │Gemini  │ │Arbeitnow     │  │
│  └────┬────┘ └────┬─────┘ └───┬────┘ └──────┬───────┘  │
│       └───────────┴───────────┴──────────────┘          │
│              Entity Framework Core 10                    │
└─────────────────────────┬───────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │  PostgreSQL (prod)    │
              │  SQLite (dev)         │
              └───────────────────────┘
```

### Clean Architecture (3-Layer)

```
HireFlowPro.Core/           → Entities, DTOs, Interfaces (no dependencies)
HireFlowPro.Infrastructure/ → EF DbContext, Migrations, Service implementations
HireFlowPro.Api/            → Controllers, Middleware, Program.cs (DI & pipeline)
hireflow-ui/                → React SPA (Vite + TypeScript)
```

---

## API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login, returns JWT |
| POST | `/logout` | Yes | Logout (client-side) |
| GET | `/me` | Yes | Get current user profile |
| GET | `/profile` | Yes | Alias for `/me` |
| POST | `/forgot-password` | No | Send password reset email |
| POST | `/reset-password` | No | Reset password with token |
| POST | `/change-password` | Yes | Change current password |

### Applications (`/api/applications`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | List applications (filter, search, sort, paginate) |
| POST | `/` | Yes | Create application |
| GET | `/{id}` | Yes | Get application by ID |
| PUT | `/{id}` | Yes | Update application |
| PATCH | `/{id}/status` | Yes | Quick status update |
| DELETE | `/{id}` | Yes | Delete application |
| GET | `/counts` | Yes | Status counts for sidebar |
| GET | `/stats` | Yes | Dashboard statistics |
| GET | `/export/csv` | Yes | Export all as CSV |
| GET | `/{id}/timeline` | Yes | Timeline events |
| GET | `/{id}/contacts` | Yes | Associated contacts |

### AI (`/api/ai`) — Quota-enforced
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/quota` | Yes | Check AI usage & limits |
| POST | `/analyze-match` | Yes | Resume ↔ job match score |
| POST | `/career-advice` | Yes | AI career guidance |
| POST | `/chat` | Yes | Chat with AI assistant |
| POST | `/tailor-resume` | Yes | Tailor resume for a job |

### Resume Profile (`/api/resume-profile`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | Get resume profile |
| POST | `/` | Yes | Save/update resume profile |

### Job Discovery (`/api/jobs`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/discover?query=&location=&page=` | Yes | Search free job boards |

### Billing (`/api/billing`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/plans` | Yes | List pricing plans |
| POST | `/checkout` | Yes | Initiate payment |
| POST | `/downgrade` | Yes | Downgrade to Free |
| GET | `/history` | Yes | Payment history |

### Admin (`/api/admin`) — Admin only
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Admin | Dashboard statistics |
| GET | `/users` | Admin | List all users |
| GET | `/users/{id}` | Admin | Get user details |
| PUT | `/users/{id}` | Admin | Update user |
| DELETE | `/users/{id}` | Admin | Delete user |
| POST | `/users/{id}/set-plan` | Admin | Set subscription plan |
| POST | `/users/{id}/toggle-block` | Admin | Block/unblock user |
| POST | `/users/{id}/toggle-admin` | Admin | Toggle admin role |
| POST | `/users/{id}/impersonate` | Admin | Impersonate user |
| POST | `/stop-impersonating` | Admin | Stop impersonation |
| POST | `/users/{id}/reset-password` | Admin | Reset user password |
| GET | `/applications` | Admin | Browse all applications |

### Health (`/health`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | Health check + DB connectivity |

---

## Database Schema

### Entity Relationship Diagram

```
User (1) ──────── (*) Application
  │                     │
  │                     ├── (*) Timeline
  │                     └── (*) Contact
  │
  ├── (*) Payment
  ├── (*) PasswordReset
  ├── (*) AIUsage
  └── (1) ResumeProfile
```

### Key Entities

| Entity | Key Fields | Notes |
|---|---|---|
| **User** | Name, Email, PasswordHash, Plan, IsAdmin, IsBlocked | Plans: Free/Pro/Premium |
| **Application** | Company, JobTitle, Status, Priority, Source, MatchScore | 6 status stages |
| **Timeline** | FromStatus, ToStatus, Note | Status transition audit trail |
| **Contact** | Name, Title, Email, Phone | Per-application contacts |
| **ResumeProfile** | FullName, Skills(JSON), Experience(JSON), Education(JSON) | One per user |
| **AIUsage** | Feature, CreatedAt | Monthly quota tracking |
| **Payment** | Plan, Amount, Status, StripePaymentIntentId | Billing records |
| **PasswordReset** | Token, ExpiresAt, IsUsed | 1-hour expiring tokens |

### Indexes
- **Unique:** User.Email, PasswordReset.Token, ResumeProfile.UserId
- **Composite:** (UserId, Status), (UserId, CreatedAt), (UserId, Feature)
- **Single:** ApplicationId, LastActivityDate

---

## AI Integration

### Dual Provider Architecture

```
AIService
  ├── Claude (Anthropic) ← Default
  │     Model: claude-sonnet-4-20250514
  │     Endpoint: api.anthropic.com/v1/messages
  │     Max tokens: 2048
  │
  └── Gemini (Google)
        Model: gemini-2.0-flash
        Endpoint: generativelanguage.googleapis.com/v1beta
        Max tokens: 2048, Temperature: 0.7
```

### AI Features

| Feature | Input | Output |
|---|---|---|
| **Analyze Match** | Job description + Resume text | Match score (0-100), missing keywords, suggestions |
| **Career Advice** | Current role, target role, experience, prompt | Contextual career guidance text |
| **Tailor Resume** | Job description + Resume Profile (auto-loaded) | Tailored summary, highlighted skills, bullet points, cover letter draft, match score, keywords |
| **Chat** | User message | AI response |

### Quota Limits

| Plan | Monthly AI Uses | Price |
|---|---|---|
| Free | 5 | $0 |
| Pro | 90 | $9.99/mo |
| Premium | Unlimited | $24.99/mo |

---

## Job Discovery

Aggregates jobs from multiple **free, no-API-key** sources:

| Source | URL | Coverage |
|---|---|---|
| **Remotive** | remotive.com/api | Remote jobs worldwide |
| **Arbeitnow** | arbeitnow.com/api | EU & global jobs |

- Parallel API fetching for speed
- Location filtering (shows Remote/Worldwide results by default)
- Relevance + recency sorting
- 20 results per page
- One-click save to application tracker with company, role, source, URL pre-filled

---

## Authentication & Security

### JWT Authentication
- **Algorithm:** HS256 (HMAC-SHA256)
- **Expiry:** 7 days
- **Claims:** sub, email, userId, isAdmin, impersonating
- **Validation:** Issuer, Audience, Lifetime, Signing Key

### Password Security
- **Algorithm:** PBKDF2-SHA256
- **Iterations:** 100,000
- **Salt:** 16 bytes (cryptographically random)
- **Hash:** 32 bytes
- **Format:** `{iterations}.{base64_salt}.{base64_hash}`

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### CORS
Configured for: `localhost:5173`, `localhost:3000`, `hireflowpro.onrender.com`

---

## Frontend Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Application counts, recent activity, source breakdown, follow-ups |
| Applications | `/applications` | Searchable table with inline status updates, drawer detail view |
| Pipeline | `/pipeline` | Kanban board organized by application status |
| Analytics | `/analytics` | Charts and statistics on application trends |
| Discover Jobs | `/discover-jobs` | Search and save jobs from free job boards |
| AI Assistant | `/ai-assistant` | Chat interface + match analyzer with quota display |
| Resume Profile | `/resume-profile` | Structured resume builder (7 sections) |
| Export | `/export` | CSV download of all applications |
| Pricing | `/pricing` | Plan comparison and upgrade flow |
| Billing | `/billing` | Current plan, payment history, downgrade option |
| Admin Dashboard | `/admin` | Platform statistics (admin only) |
| Admin Users | `/admin/users` | User management table (admin only) |

### Key UI Components
- **ResumePDF** — React-PDF two-column A4 template with Lato fonts & rose accent
- **Sidebar** — Navigation with application count badges, plan indicator, and section grouping
- **TopBar** — Page title, subtitle, and action buttons
- **Toast** — Stacked notification system (success/error/info)
- **UpgradeModal** — Plan upgrade prompt when quotas are hit

---

## Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 20+](https://nodejs.org/)
- PostgreSQL (optional — falls back to SQLite for local dev)

### Local Development

```bash
# Clone the repository
git clone https://github.com/Sandhoshsivan/hireflow-pro-v2.git
cd hireflow-pro-v2

# Start the backend
dotnet run --project HireFlowPro.Api

# In a separate terminal, start the frontend
cd hireflow-ui
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### Demo Accounts

| Account | Email | Password | Plan |
|---|---|---|---|
| Admin | `admin@hireflowpro.com` | `Admin@123!` | Premium |
| Demo User | `demo@hireflowpro.com` | `Demo@123!` | Pro |

---

## Docker Deployment

### Multi-Stage Build

```dockerfile
# Stage 1: Build React frontend (Node 20-alpine)
# Stage 2: Build .NET backend (.NET 10 SDK)
# Stage 3: Production image (.NET 10 Runtime)
#   - Copies published .NET app
#   - Copies React dist → wwwroot/
#   - Serves both from single container on port 5000
```

### Build & Run

```bash
docker build -t hireflowpro .
docker run -p 5000:5000 \
  -e DATABASE_URL="postgres://user:pass@host:5432/dbname" \
  -e Jwt__Key="your-secret-key-min-32-chars" \
  -e AI__Claude__ApiKey="sk-ant-..." \
  hireflowpro
```

### Render.com Deployment
- Push to `main` branch triggers auto-deploy
- Free-tier web service + free PostgreSQL database
- Environment variables configured in Render dashboard

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Production | — | PostgreSQL connection (Render format) |
| `Jwt__Key` | Recommended | Dev fallback key | JWT signing key (32+ chars) |
| `Jwt__Issuer` | No | `HireFlowPro` | JWT token issuer |
| `Jwt__Audience` | No | `HireFlowPro` | JWT token audience |
| `AI__Claude__ApiKey` | For AI features | — | Anthropic Claude API key |
| `AI__Gemini__ApiKey` | For AI features | — | Google Gemini API key |
| `AI__Provider` | No | `claude` | AI provider (`claude` or `gemini`) |
| `PORT` | No | `5000` | HTTP listen port |
| `ASPNETCORE_ENVIRONMENT` | No | `Production` | Runtime environment |

---

## Project Structure

```
HireFlowPro/
├── HireFlowPro.Api/                    # Web API layer
│   ├── Controllers/
│   │   ├── AuthController.cs           # Authentication endpoints
│   │   ├── ApplicationsController.cs   # Application CRUD + stats
│   │   ├── AIController.cs             # AI features + quota
│   │   ├── JobDiscoveryController.cs   # Job search aggregation
│   │   ├── ResumeProfileController.cs  # Resume profile CRUD
│   │   ├── BillingController.cs        # Plans + payments
│   │   ├── AdminController.cs          # Admin management
│   │   └── HealthController.cs         # Health check
│   ├── Middleware/
│   │   └── ExceptionMiddleware.cs      # Global error handler
│   └── Program.cs                      # DI, pipeline, startup
│
├── HireFlowPro.Core/                   # Domain layer (no dependencies)
│   ├── Entities/
│   │   ├── User.cs
│   │   ├── Application.cs
│   │   ├── Timeline.cs
│   │   ├── Contact.cs
│   │   ├── ResumeProfile.cs
│   │   ├── AIUsage.cs
│   │   ├── Payment.cs
│   │   └── PasswordReset.cs
│   ├── DTOs/
│   │   ├── AuthDTOs.cs
│   │   ├── ApplicationDTOs.cs
│   │   ├── AIDTOs.cs
│   │   ├── ResumeProfileDTOs.cs
│   │   ├── JobDiscoveryDTOs.cs
│   │   ├── BillingDTOs.cs
│   │   └── AdminDTOs.cs
│   └── Interfaces/
│       ├── IAuthService.cs
│       ├── IApplicationService.cs
│       ├── IAIService.cs
│       ├── IAIQuotaService.cs
│       ├── IJobDiscoveryService.cs
│       ├── IResumeProfileService.cs
│       └── IAdminService.cs
│
├── HireFlowPro.Infrastructure/         # Implementation layer
│   ├── Data/
│   │   ├── AppDbContext.cs             # EF Core DbContext + config
│   │   └── DbSeeder.cs                # Demo data seeding
│   ├── Migrations/                     # EF Core migrations
│   └── Services/
│       ├── AuthService.cs              # JWT + PBKDF2 auth
│       ├── ApplicationService.cs       # App CRUD + filtering
│       ├── AIService.cs                # Claude/Gemini integration
│       ├── AIQuotaService.cs           # Monthly quota tracking
│       ├── JobDiscoveryService.cs      # Free job API aggregation
│       ├── ResumeProfileService.cs     # Resume CRUD
│       └── AdminService.cs             # Admin operations
│
├── hireflow-ui/                        # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── ResumePDF.tsx           # React-PDF template
│   │   │   ├── UpgradeModal.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Applications.tsx        # + AI tailor + PDF download
│   │   │   ├── Pipeline.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── JobDiscovery.tsx
│   │   │   ├── AIAssistant.tsx
│   │   │   ├── ResumeProfile.tsx
│   │   │   ├── Billing.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Export.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   └── Admin/
│   │   │       ├── Dashboard.tsx
│   │   │       └── Users.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                  # Axios instance + interceptors
│   │   │   ├── auth.ts                 # Zustand auth store
│   │   │   ├── normalize.ts            # API response normalization
│   │   │   └── pdf-download.ts         # PDF blob download helper
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript interfaces
│   │   ├── App.tsx                     # Router setup
│   │   └── index.css                   # Design system (CSS variables)
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── Dockerfile                          # Multi-stage build
├── .dockerignore
└── .gitignore
```

---

## Statistics

| Metric | Count |
|---|---|
| API Endpoints | 40+ |
| Database Entities | 8 |
| Frontend Pages | 16 |
| React Components | 7 shared + 16 pages |
| Services | 7 backend services |
| AI Features | 4 (match, tailor, advice, chat) |
| External APIs | 3 (Claude, Remotive, Arbeitnow) |
| EF Migrations | 4 |

---

## License

This project is proprietary. All rights reserved.

---

Built with .NET 10 + React 19 + Claude AI
