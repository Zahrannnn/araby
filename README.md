# NEDX CRM Platform

A comprehensive Customer Relationship Management (CRM) platform built with Next.js, featuring multi-tenant architecture, role-based access control, and international support.

![NEDX CRM](./public/nedx.png)

## 🚀 Features

### Core Functionality
- **Multi-tenant Architecture** - Support for multiple companies with isolated data
- **Role-based Access Control** - Super Admin, Company Admin, and Employee roles
- **Customer Management** - Complete customer lifecycle management
- **Employee Management** - Staff onboarding, management, and task assignment
- **Task Management** - Project and task tracking with status management
- **Appointment Scheduling** - Calendar integration and appointment management
- **Expense Tracking** - Financial expense management and analytics
- **Offer Management** - Quote and proposal management system

### Technical Features
- **Internationalization (i18n)** - Support for Arabic (RTL), English, German, and Italian
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Real-time Updates** - Live data synchronization
- **Advanced Analytics** - Charts and reporting with Chart.js and Recharts
- **PDF Generation** - Document generation capabilities
- **Authentication** - Secure authentication with NextAuth.js
- **State Management** - Redux and Zustand for optimal state handling
- **API Integration** - RESTful API with TanStack React Query

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI + Shadcn/ui
- **Icons**: Lucide React, Heroicons
- **Internationalization**: next-intl
- **Charts**: Chart.js, Recharts
- **Forms**: React Hook Form + Zod validation

### State Management & Data Fetching
- **Global State**: Redux, Zustand
- **Server State**: TanStack React Query
- **HTTP Client**: Axios
- **Authentication**: NextAuth.js

### Development Tools
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Package Manager**: npm
- **Build Tool**: Turbopack (development)

## 🏗️ Project Structure

```
araby/
├── app/                          # Next.js App Router
│   └── [locale]/                # Internationalized routes
│       ├── (auth)/              # Authentication pages
│       ├── admin/               # Admin dashboard
│       ├── company/             # Company management
│       └── super-admin/         # Super admin panel
├── components/                  # Reusable UI components
│   ├── ui/                     # Base UI components (Shadcn)
│   ├── auth/                   # Authentication components
│   ├── company/                # Company-specific components
│   └── super-admin/            # Super admin components
├── lib/                        # Utilities and configurations
│   ├── api/                    # API layer
│   │   ├── services/           # API service functions
│   │   ├── types/              # TypeScript type definitions
│   │   └── query/              # React Query configurations
│   ├── utils/                  # Utility functions
│   └── schemas/                # Zod validation schemas
├── hooks/                      # Custom React hooks
├── i18n/                       # Internationalization files
└── types/                      # Global type definitions
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd araby
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure the following variables:
   - `NEXTAUTH_URL` - Your application URL
   - `NEXTAUTH_SECRET` - NextAuth.js secret
   - `API_BASE_URL` - Backend API URL
   - Additional API keys as needed

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🌍 Internationalization

The platform supports multiple languages with full RTL support:

- **English** (en) - Default
- **Arabic** (ar) - RTL support
- **German** (de)
- **Italian** (it)

Language files are located in `/i18n/` directory. To add a new language:

1. Create a new JSON file in `/i18n/`
2. Add the locale to the `locales` array in `i18n.ts`
3. Update the `getLocaleDisplayName` function

## 🔐 Authentication & Authorization

### User Roles

1. **Super Admin**
   - Manage multiple companies
   - System-wide settings and configuration
   - Company creation and management

2. **Company Admin**
   - Manage company settings
   - Employee and customer management
   - Task and appointment oversight
   - Financial management

3. **Employee**
   - Task management
   - Customer interaction
   - Appointment scheduling
   - Expense reporting

## 🎨 UI/UX Features

- **Modern Design System** - Built with Radix UI and Tailwind CSS
- **Dark/Light Mode** - Theme switching capability
- **Responsive Layout** - Mobile-first design
- **Accessibility** - WCAG compliant components
- **Smooth Animations** - Enhanced user experience
- **Toast Notifications** - Real-time feedback with Sonner

## 📊 Analytics & Reporting

- **Dashboard Analytics** - Key performance indicators
- **Expense Analytics** - Financial tracking and reports
- **Task Progress** - Project completion tracking
- **Customer Insights** - Customer relationship analytics
- **Export Capabilities** - PDF and data export functionality

## 🔧 Configuration

### Next.js Configuration
- Internationalization with next-intl
- Image optimization for multiple domains
- PDF generation support
- Webpack customization for canvas rendering

### API Configuration
- RESTful API integration
- Request/response interceptors
- Error handling and retry logic
- Type-safe API calls

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
Ensure all environment variables are properly configured for production:
- Database connections
- API endpoints
- Authentication secrets
- Third-party service keys

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write meaningful commit messages
- Ensure responsive design
- Add proper internationalization support

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**
