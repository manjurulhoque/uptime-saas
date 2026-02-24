# UptimeSaaS - Professional Website Monitoring Platform

A full-stack SaaS application for monitoring website uptime, tracking performance metrics, and sending instant alerts when issues are detected. Built with modern technologies for scalability and reliability.

## 🚀 Features

### Core Monitoring Features
- **Real-time Uptime Monitoring**: Monitor any website or API endpoint with configurable check intervals (1 minute to 1 hour)
- **Status Tracking**: Track UP, DOWN, TIMEOUT, and ERROR states
- **Response Time Monitoring**: Measure and track response times for each check
- **Incident Management**: Automatic incident detection and resolution tracking
- **Historical Data**: View check history and performance trends

### Alert System
- **Email Notifications**: Get instant alerts via email when monitors change status
- **Configurable Alerts**: Choose when to receive alerts:
  - When monitor goes down
  - When monitor comes back up
  - When response time exceeds threshold (slow response alerts)
- **Custom Email Addresses**: Set custom alert email addresses per monitor
- **Notification History**: Track all sent notifications

### User Features
- **User Authentication**: Secure JWT-based authentication with refresh tokens
- **Profile Management**: Update profile information and account settings
- **Dashboard**: Overview of all monitors with status indicators
- **Monitor Management**: Create, edit, pause, and delete monitors
- **Detailed Analytics**: View statistics, check history, and incident reports

### Admin Dashboard
- **User Management**: View, create, edit, and delete users
- **Monitor Management**: View all monitors across all users
- **System Statistics**: Dashboard with system-wide metrics
- **User Activity**: Track user registrations and monitor creation
- **Role Management**: Grant/revoke admin privileges

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Monitoring**: Node-cron for scheduled checks
- **Email**: Nodemailer for email notifications
- **Validation**: Zod for schema validation
- **Logging**: Winston for structured logging
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: Next.js 15.1.6 (React 19)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Redux Toolkit with RTK Query
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast notifications)
- **Forms**: React Hook Form with Zod validation

## 📁 Project Structure

```
uptime-saas/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files (logger, etc.)
│   │   ├── middleware/      # Express middleware (auth, validation, security)
│   │   ├── routes/          # API route handlers
│   │   │   ├── auth.ts      # Authentication routes
│   │   │   ├── monitors.ts  # Monitor management routes
│   │   │   └── admin.ts     # Admin routes
│   │   ├── services/        # Business logic services
│   │   │   ├── authService.ts
│   │   │   ├── emailService.ts
│   │   │   └── monitoringService.ts
│   │   ├── utils/           # Utility functions
│   │   ├── db.ts            # Prisma client
│   │   └── server.ts        # Express server setup
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   ├── package.json
│   ├── tsconfig.json
│   └── env.example          # Environment variables template
│
├── frontend/
│   ├── app/                 # Next.js app directory
│   │   ├── (app)/           # Public pages
│   │   ├── (auth)/          # Authentication pages
│   │   ├── (dashboard)/     # Dashboard pages
│   │   └── api/             # API routes
│   ├── components/
│   │   ├── dashboard/       # Dashboard components
│   │   ├── pages/           # Page components
│   │   ├── ui/              # UI components (shadcn/ui)
│   │   └── providers/       # Context providers
│   ├── store/
│   │   └── api/             # RTK Query API slices
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   ├── types/                # TypeScript type definitions
│   └── package.json
│
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **PostgreSQL** 12.x or higher
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uptime-saas
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and configure:
   - Database connection string
   - JWT secrets
   - SMTP settings for email notifications
   - CORS allowed origins

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   ```

5. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

6. **Configure frontend environment**
   
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:9900/api
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-here
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   
   The backend will run on `http://localhost:9900` (or the port specified in `.env`)

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   
   The frontend will run on `http://localhost:3000`

3. **Access the application**
   - Open `http://localhost:3000` in your browser
   - Register a new account or login
   - Start monitoring your websites!

## 🔧 Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=9900
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/uptime_saas?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-make-it-different-from-jwt-secret

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging Configuration
LOG_LEVEL=debug

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@uptimesaas.com
SMTP_FROM_NAME=UptimeSaaS

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:9900/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Monitors
- `GET /api/monitors` - Get all monitors for authenticated user
- `GET /api/monitors/:id` - Get monitor details
- `POST /api/monitors` - Create a new monitor
- `PUT /api/monitors/:id` - Update monitor
- `DELETE /api/monitors/:id` - Delete monitor
- `PATCH /api/monitors/:id/status` - Update monitor status (active/inactive)
- `GET /api/monitors/:id/stats` - Get monitor statistics
- `GET /api/monitors/:id/checks` - Get monitor check history
- `GET /api/monitors/:id/incidents` - Get monitor incidents

### Admin (Admin only)
- `GET /api/admin/users` - Get all users (with pagination)
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/monitors` - Get all monitors (with filters)
- `GET /api/admin/monitors/:id` - Get monitor details
- `GET /api/admin/monitors/:id/stats` - Get monitor statistics
- `DELETE /api/admin/monitors/:id` - Delete monitor
- `GET /api/admin/stats` - Get dashboard statistics

## 🗄️ Database Schema

The application uses PostgreSQL with the following main models:

- **User**: User accounts with authentication and profile information
- **Monitor**: Website/API monitoring configurations
- **MonitorCheck**: Historical check results
- **Incident**: Downtime incidents with duration tracking
- **Notification**: Email notification history

See `backend/prisma/schema.prisma` for the complete schema definition.

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password storage
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma ORM parameterized queries

## 📊 Monitoring Service

The monitoring service runs scheduled checks using node-cron:

- **Automatic Checks**: Monitors are checked at configured intervals
- **Status Detection**: Detects UP, DOWN, TIMEOUT, and ERROR states
- **Incident Tracking**: Automatically creates and resolves incidents
- **Alert Triggering**: Sends email alerts based on configured conditions
- **Performance Tracking**: Records response times for each check

## 🎨 UI Components

The frontend uses shadcn/ui components built on Radix UI:

- Responsive design with Tailwind CSS
- Accessible components following WAI-ARIA guidelines
- Dark mode support (via next-themes)
- Toast notifications for user feedback
- Form validation with React Hook Form

## 🧪 Development

### Backend Development
```bash
cd backend
npm run dev      # Start with nodemon (auto-reload)
npm run build    # Build TypeScript
npm run lint     # Run ESLint
```

### Frontend Development
```bash
cd frontend
npm run dev      # Start Next.js dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Database Management
```bash
cd backend
npx prisma studio          # Open Prisma Studio (database GUI)
npx prisma migrate dev     # Create and apply migration
npx prisma migrate deploy  # Apply migrations in production
npx prisma generate        # Regenerate Prisma client
```

## 🚀 Production Deployment

### Backend
1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend
1. Build the Next.js application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

Or deploy to platforms like Vercel, which support Next.js out of the box.

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@uptimesaas.com or open an issue in the repository.

---

**Built with ❤️ using Node.js, Next.js, and PostgreSQL**
