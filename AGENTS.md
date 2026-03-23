# AGENTS.md - Codebase Guidelines for Chama Frete

## Project Overview

- **Tech Stack**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Package Manager**: npm
- **ESLint**: Flat config with TypeScript, React Hooks, React Refresh
- **No tests configured** - Testing framework can be added if needed

---

## Commands

### Development
```bash
npm run dev          # Start development server
```

### Build & Production
```bash
npm run build        # Run TypeScript check + Vite build
npm run preview      # Preview production build
```

### Linting
```bash
npm run lint         # Run ESLint on entire project
npm run lint -- --fix  # Auto-fix linting issues
```

### Type Checking
```bash
npx tsc -b          # Run TypeScript compiler check
```

---

## Code Style Guidelines

### File Organization
```
src/
├── api/           # API configuration (axios)
├── components/    # React components (grouped by feature)
│   ├── ui/        # Base UI components (Button, Input, etc.)
│   ├── layout/    # Layout components (Sidebar, Topbar)
│   └── [feature]/ # Feature-specific components
├── pages/         # Page components (route endpoints)
├── lib/           # Utilities (utils.ts for cn())
├── types/         # TypeScript type definitions
├── services/      # Custom hooks/services
├── routes/        # Routing configuration
├── context/       # React Context providers
└── constants/     # Static constants
```

### Naming Conventions
- **Components**: PascalCase (e.g., `Login.tsx`, `FreightCard.tsx`)
- **Utilities/Hooks**: camelCase (e.g., `useTracker.ts`, `auth.ts`)
- **Types/Interfaces**: PascalCase (e.g., `FreightType`, `User`)
- **Files with multiple exports**: camelCase (e.g., `api.ts`, `utils.ts`)

### Import Order
1. External libraries (React, react-router-dom, etc.)
2. Named imports from `@/` path alias
3. Relative imports from `../../`
4. Relative imports from `../`

```typescript
// External
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Lock } from 'lucide-react';

// @ alias (project)
import { api } from '@/api/api';
import { cn } from '@/lib/utils';

// Relative
import Button from '../ui/Button';
import FreightCard from './FreightCard';
```

### Path Aliases
- Use `@/` to import from `src/`
- Example: `import { api } from '@/api/api'` instead of `../../api/api`

### TypeScript Guidelines
- **Always define types** for component props and function parameters
- Use `interface` for object shapes, `type` for unions/aliases
- Use `type` for import statements (`import { type ClassValue } from 'clsx'`)
- Enable strict mode - avoid `any`, use `unknown` when type is uncertain

```typescript
// Good
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline';
  size?: 'sm' | 'default' | 'lg';
}

// Good - type-only imports
import { clsx, type ClassValue } from 'clsx';
```

### React Patterns

#### Functional Components
```typescript
export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const navigate = useNavigate();

  // ... component logic

  return (
    <div>...</div>
  );
}
```

#### Components with Refs (forwardRef)
```typescript
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <Comp className={cn(...)} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';
```

#### Error Handling
```typescript
try {
  const res = await api.post('/login', { login, password });
  if (res?.data?.success) {
    // handle success
  }
} catch (error: unknown) {
  if (error instanceof Error) {
    // handle error
  } else if (axios.isAxiosError(error)) {
    // handle axios error
    const message = error.response?.data?.message;
  }
}
```

### Styling (Tailwind CSS)

#### Use `cn()` utility for conditional classes
```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className // allow override
)} />
```

#### Component Variants (cva)
Use `class-variance-authority` for button-like components:
```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva("base classes", {
  variants: {
    variant: { default: "bg-primary", destructive: "bg-red-500" },
    size: { default: "h-11", sm: "h-9" }
  }
});
```

### API Configuration
- Use axios with interceptors for auth tokens
- Handle 401 responses for session expiration
- Use `import.meta.env.VITE_*` for environment variables

```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@ChamaFrete:token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### ESLint Rules
- No console.log in production (configure rule if desired)
- React Hooks rules enabled
- React Refresh enabled for HMR
- Use TypeScript strict mode

### Common Patterns

#### Local Storage Keys
```typescript
const TOKEN_KEY = '@ChamaFrete:token';
const USER_KEY = '@ChamaFrete:user';
```

#### Form Handling
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... form logic
};
```

#### Protected Routes
Use the `PrivateRoute` component with `allowedRoles`:
```typescript
<Route element={<PrivateRoute allowedRoles={['driver', 'company', 'admin']} />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

---

## Working with this Codebase

1. **Run `npm run dev`** to start development
2. **Run `npm run lint`** before committing
3. **Run `npm run build`** to verify production build works
4. **Use `@/` path alias** for imports within `src/`
5. **Use `cn()` utility** for conditional Tailwind classes
6. **Define TypeScript types** for all props and API responses

---

## Environment Variables

Create `.env` files as needed:
- `VITE_API_URL` - Backend API URL
- Never commit secrets to version control

---

## Roles & Modules

### Constants Files
- `src/constants/roles.ts` - Role definitions
- `src/constants/modules.ts` - Module definitions
- `src/constants/permissions.ts` - Permission definitions

### Available Roles
**External (platform users):**
- `driver` - Motorista
- `company` - Empresa/Transportadora

**Internal (Chama Frete team):**
- `admin`, `gerente`, `suporte`, `financeiro`, `marketing`, `vendas`, `coordenador`, `supervisor`

### Available Modules
| Module | Description |
|--------|-------------|
| `fretes` | Fretes (required for company/driver) |
| `marketplace` | Anúncios de vendas |
| `cotacoes` | Sistema de cotações |
| `publicidade` | Anúncios publicitários |
| `chat` | Mensagens |
| `financeiro` | Transações e relatórios |
| `grupos` | Grupos WhatsApp |
| `planos` | Planos de assinatura |
| `suporte` | Tickets de suporte |

### Admin Pages
- `/dashboard/admin/cargos` - Roles management
- `/dashboard/admin/modulos` - Modules management
- `/dashboard/admin/usuarios` - Users management
