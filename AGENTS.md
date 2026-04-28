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
- `/dashboard/admin/planos` - Planos de Assinatura (PlansManager)
- `/dashboard/admin/precificacao` - Precificação (PricingManager)

---

## Admin Components (Dashboard)

O projeto possui componentes padronizados para páginas de administração em `src/components/admin/`.

### Importar Componentes

```typescript
// Importar todos de uma vez
import { 
  AdminLayout, 
  AdminHeader, 
  StatsGrid, 
  StatCard, 
  FilterBar, 
  DataTable, 
  StatusBadge, 
  AdminCard 
} from '@/components/admin';

// Ou importar individualmente
import AdminHeader from '@/components/admin/AdminHeader';
import DataTable, { type TableColumn, type TableAction } from '@/components/admin/DataTable';
```

### AdminLayout

Wrapper padrão para páginas de admin.

```tsx
<AdminLayout 
  title="Artigos" 
  description="Gerencie artigos submetidos"
  actions={<Button>Novo Artigo</Button>}
>
  {/* conteúdo da página */}
</AdminLayout>
```

**Nota:** O header padrão NÃO tem ícone. Ícones são usados nos StatsCards, não no título.

### AdminHeader

Header com título e ações (sem ícone para consistência com páginas manuais).

```tsx
<AdminHeader 
  title="Gestão de Usuários" 
  description="Gerencie usuários do sistema"
  actions={
    <Button>
      <Plus size={20} />
      Novo Usuário
    </Button>
  }
/>
```

**Nota:** AdminHeader não usa ícone - para manter consistência com padrão manual.

### StatsGrid + StatCard

Grid de cards de estatísticas.

```tsx
<StatsGrid>
  <StatCard label="Total" value={123} />
  <StatCard label="Ativos" value={100} variant="green" />
  <StatCard label="Pendentes" value={20} variant="yellow" />
  <StatCard label="Rejeitados" value={3} variant="red" />
</StatsGrid>
```

### FilterBar

Barra de filtros com busca e abas.

```tsx
<FilterBar
  search={{
    placeholder: 'Buscar por nome...',
    value: searchTerm,
    onChange: setSearchTerm
  }}
  tabs={[
    { key: 'all', label: 'Todos' },
    { key: 'pending', label: 'Pendente' },
    { key: 'published', label: 'Publicado' }
  ]}
  activeTab={filter}
  onTabChange={setFilter}
/>
```

### DataTable

Tabela padronizada com colunas e ações.

```tsx
const columns: TableColumn<Article>[] = [
  { key: 'title', label: 'Título' },
  { 
    key: 'status', 
    label: 'Status',
    render: (value) => <StatusBadge status={value} />
  },
  { 
    key: 'actions', 
    label: 'Ações',
    render: (_, row) => (
      <div className="flex gap-2">
        <button onClick={() => handleEdit(row)}>
          <Edit size={16} />
        </button>
        <button onClick={() => handleDelete(row)}>
          <Trash2 size={16} />
        </button>
      </div>
    )
  }
];

<DataTable 
  columns={columns} 
  data={articles} 
  loading={loading}
  emptyMessage="Nenhum artigo encontrado"
/>
```

### StatusBadge

Badge de status colorido.

```tsx
<StatusBadge status="pending" />
<StatusBadge status="published" />
<StatusBadge status="rejected" />

// Com labels customizados
<StatusBadge 
  status="pending" 
  labels={{ pending: 'Aguardando', published: 'Publicado' }}
/>
```

### AdminCard

Card wrapper padrão.

```tsx
<AdminCard>
  <AdminCardHeader title="Informações" action={<Button>Editar</Button>} />
  <p>Conteúdo do card...</p>
</AdminCard>

// Sem padding
<AdminCard noPadding>
  <table>...</table>
</AdminCard>
```

### Exemplo Completo

```tsx
import { AdminLayout, StatsGrid, StatCard, FilterBar, DataTable, StatusBadge, type TableColumn } from '@/components/admin';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ArticlesAdminPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const columns: TableColumn[] = [
    { key: 'title', label: 'Título' },
    { key: 'author_name', label: 'Autor' },
    { 
      key: 'status', 
      label: 'Status',
      render: (v) => <StatusBadge status={v as any} />
    },
    { key: 'created_at', label: 'Data' },
  ];

  return (
    <AdminLayout
      title="Artigos"
      description="Gerencie artigos submetidos"
      icon={FileText}
      actions={<Button><Plus size={20} /> Novo Artigo</Button>}
    >
      <StatsGrid>
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pendentes" value={stats.pending} variant="yellow" />
        <StatCard label="Publicados" value={stats.published} variant="green" />
        <StatCard label="Rejeitados" value={stats.rejected} variant="red" />
      </StatsGrid>

      <FilterBar
        search={{ placeholder: 'Buscar artigos...', value: search, onChange: setSearch }}
        tabs={[
          { key: 'all', label: 'Todos' },
          { key: 'pending', label: 'Pendente' },
          { key: 'published', label: 'Publicado' },
          { key: 'rejected', label: 'Rejeitado' },
        ]}
        activeTab={filter}
        onTabChange={setFilter}
      />

      <DataTable
        columns={columns}
        data={filteredArticles}
        loading={loading}
        emptyMessage="Nenhum artigo encontrado"
      />
    </AdminLayout>
  );
}
```
