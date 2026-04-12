import { useCallback } from 'react';

interface PricingRule {
  id: number;
  module_key: string;
  feature_key: string;
  feature_name: string;
  pricing_type: string;
  free_limit: number;
  price_per_use: number;
  price_monthly: number;
  price_daily: number;
  duration_days: number;
  is_active: number;
}

interface UserModule {
  key: string;
  name: string;
  is_active: boolean;
  plan_id?: number | null;
  requires_approval?: boolean;
  approval_status?: string;
}

interface Transaction {
  plan_id?: number | null;
  module_key?: string;
  status: string;
}

interface ModuleStatus {
  isActive: boolean;
  requiresApproval: boolean;
  approvalStatus: string | null;
}

interface UseModuleDataProps {
  pricingRules: PricingRule[];
  plans: any[];
  userModules: UserModule[];
  isDriver: boolean;
  isCompany: boolean;
  driverHasContracted: boolean;
  companyVerificationStatus: {
    is_verified: boolean;
    has_pending: boolean;
    verification: any | null;
  };
  transactions?: Transaction[];
}

export function useModuleData({
  pricingRules,
  plans,
  userModules,
  isDriver,
  isCompany,
  driverHasContracted,
  companyVerificationStatus,
  transactions = [],
}: UseModuleDataProps) {
  // Mapeamento de categoria do plano para module_key
  const categoryToModuleKey: Record<string, string> = {
    'freight_subscription': 'freights',
    'marketplace_subscription': 'marketplace',
    'advertising': 'advertiser',
  };

  const getActivePlanIdForModule = useCallback(
    (moduleKey: string): number | null => {
      // Primeiro verifica em userModules se há plan_id
      const mod = userModules.find((m) => m.key === moduleKey);
      if (mod?.plan_id) {
        return mod.plan_id;
      }

      // Depois verifica nas transações aprovadas
      const approvedPlans = transactions.filter((t) => t.plan_id && t.status === 'approved');
      
      for (const tx of approvedPlans) {
        // Encontra o plano
        const plan = plans.find((p: any) => p.id === tx.plan_id);
        if (plan) {
          // Verifica se o plano pertence ao módulo
          const planModuleKey = categoryToModuleKey[plan.category];
          if (planModuleKey === moduleKey) {
            return tx.plan_id;
          }
        }
      }

      return null;
    },
    [userModules, transactions, plans]
  );

  const getModuleStatus = useCallback(
    (moduleKey: string): ModuleStatus => {
      const mod = userModules.find((m) => m.key === moduleKey);

      if (moduleKey === 'driver' && isDriver) {
        return {
          isActive: driverHasContracted,
          requiresApproval: false,
          approvalStatus: null,
        };
      }

      if (moduleKey === 'company_pro' && isCompany) {
        return {
          isActive: companyVerificationStatus.is_verified,
          requiresApproval: false,
          approvalStatus: null,
        };
      }

      if (!mod) {
        if (moduleKey === 'freights' || moduleKey === 'marketplace') {
          return {
            isActive: true,
            requiresApproval: false,
            approvalStatus: null,
          };
        }
        return {
          isActive: false,
          requiresApproval: true,
          approvalStatus: null,
        };
      }

      return {
        isActive: mod.is_active,
        requiresApproval: mod.requires_approval || false,
        approvalStatus: mod.approval_status || null,
      };
    },
    [userModules, isDriver, isCompany, driverHasContracted, companyVerificationStatus]
  );

  const getModuleRules = useCallback(
    (moduleKey: string): PricingRule[] => {
      let rules = pricingRules.filter((r) => r.module_key === moduleKey);

      if (moduleKey === 'driver') {
        rules = rules.filter(
          (r) =>
            r.feature_key === 'document_verification' ||
            r.feature_key === 'featured_profile' ||
            r.feature_key === 'radar_highlight'
        );
      }

      if (moduleKey === 'company_pro') {
        rules = rules.filter((r) => r.feature_key === 'identity_verification');
      }

      return rules;
    },
    [pricingRules]
  );

  const getSubscriptionPlans = useCallback(
    (category: string) => {
      return plans.filter((p) => p.category === category && p.active === 1);
    },
    [plans]
  );

  return {
    getModuleStatus,
    getModuleRules,
    getSubscriptionPlans,
    getActivePlanIdForModule,
  };
}
