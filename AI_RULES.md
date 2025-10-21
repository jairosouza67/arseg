# AI_RULES.md - ARSEG Extintores Application

## Tech Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19 for fast development and optimized builds
- **Routing**: React Router DOM 6.30.1 for client-side routing
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS 3.4.17 with custom design system
- **State Management**: React Context API for cart and global state
- **Data Fetching**: TanStack React Query 5.83.0 for server state management
- **Authentication**: Supabase 2.75.0 for auth and database operations
- **Form Handling**: React Hook Form 7.61.1 with Zod 3.25.76 validation
- **PDF Generation**: jsPDF 3.0.3 with jspdf-autotable 5.0.2
- **Charts**: Recharts 2.15.4 for data visualization
- **Icons**: Lucide React 0.462.0
- **Notifications**: Sonner 1.7.4 for toast notifications
- **PWA**: Vite Plugin PWA 1.1.0 for progressive web app features

## Library Usage Rules

### UI Components
- **Use shadcn/ui components** for all UI elements (buttons, cards, dialogs, etc.)
- **Import components** from `@/components/ui/` (e.g., `import { Button } from "@/components/ui/button"`)
- **Customize components** only when necessary by creating new components in `src/components/`
- **Use Radix UI primitives** directly only when building custom shadcn/ui components

### Styling
- **Use Tailwind CSS classes** exclusively for styling
- **Follow the design system** defined in `src/index.css` with HSL color variables
- **Use custom CSS** only for animations and effects defined in `tailwind.config.ts`
- **Responsive design** is mandatory - use responsive Tailwind classes

### State Management
- **Use React Context** for global state (cart, user role)
- **Use React Query** for server state and data fetching
- **Local component state** for UI state (form inputs, modals)
- **Avoid prop drilling** - use context or composition patterns

### Data Fetching
- **Use Supabase** for all database operations and authentication
- **Use React Query** for caching, background updates, and optimistic UI
- **Type database responses** using the generated types from `src/integrations/supabase/types.ts`

### Forms
- **Use React Hook Form** for all forms
- **Use Zod** for schema validation
- **Integrate with Supabase** for form submissions
- **Show loading states** during form submissions

### Authentication
- **Use Supabase Auth** for all authentication needs
- **Protect routes** with the `AdminRoute` component for admin-only pages
- **Check user roles** using the `useUserRole` hook
- **Handle auth errors** gracefully with toast notifications

### PDF Generation
- **Use jsPDF** for generating PDF reports and quotes
- **Use the `generateQuotePDF` utility** for quote documents
- **Include proper headers, footers, and formatting** in PDFs

### Charts and Data Visualization
- **Use Recharts** for all charting needs
- **Follow the dashboard patterns** established in admin pages
- **Make charts responsive** and accessible

### Icons
- **Use Lucide React icons** exclusively
- **Import icons directly** (e.g., `import { Shield } from "lucide-react"`)
- **Use consistent icon sizes** and styling

### Notifications
- **Use Sonner** for all toast notifications
- **Import from `@/hooks/use-toast`** for consistent usage
- **Show success/error states** for all user actions

### File Structure
- **Pages** go in `src/pages/` (e.g., `src/pages/Index.tsx`)
- **Components** go in `src/components/` (e.g., `src/components/Header.tsx`)
- **Hooks** go in `src/hooks/` (e.g., `src/hooks/useUserRole.tsx`)
- **Utilities** go in `src/lib/` (e.g., `src/lib/generateQuotePDF.ts`)
- **Contexts** go in `src/contexts/` (e.g., `src/contexts/CartContext.tsx`)
- **Integration code** goes in `src/integrations/` (e.g., `src/integrations/supabase/`)

### Code Quality
- **Use TypeScript** for all new code
- **Follow ESLint rules** defined in the project
- **Write semantic HTML** with proper accessibility
- **Use proper error boundaries** for error handling
- **Write responsive code** that works on all device sizes

### Performance
- **Use React Query** for efficient data fetching and caching
- **Implement lazy loading** for heavy components
- **Optimize images** and assets
- **Use proper memoization** for expensive computations

### Security
- **Validate all user input** on both client and server
- **Use Supabase RLS** for row-level security
- **Sanitize user-generated content**
- **Use environment variables** for sensitive data
- **Implement proper CORS policies**

### Testing
- **Write unit tests** for utilities and complex functions
- **Test components** with React Testing Library
- **Test forms** with proper validation scenarios
- **Mock API calls** in tests