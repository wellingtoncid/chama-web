import React from 'react';

type StatusType = 'pending' | 'published' | 'rejected' | 'draft' | 'active' | 'inactive' | 'approved' | 'cancelled' | 'processing' | 'completed' | 'failed';

interface StatusBadgeProps {
  status: StatusType;
  labels?: Record<StatusType, string>;
  className?: string;
}

const defaultLabels: Record<StatusType, string> = {
  pending: 'Pendente',
  published: 'Publicado',
  rejected: 'Rejeitado',
  draft: 'Rascunho',
  active: 'Ativo',
  inactive: 'Inativo',
  approved: 'Aprovado',
  cancelled: 'Cancelado',
  processing: 'Processando',
  completed: 'Concluído',
  failed: 'Falhou',
};

const statusStyles: Record<StatusType, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  draft: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function StatusBadge({ status, labels = defaultLabels, className = '' }: StatusBadgeProps) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusStyles[status]} ${className}`}>
      {labels[status] || status}
    </span>
  );
}