export interface ProfileTheme {
  primary: string;
  bg: string;
  text: string;
  light: string;
  border: string;
  shadow: string;
}

const driver: ProfileTheme = {
  primary: 'orange',
  bg: 'bg-orange-600',
  text: 'text-orange-600',
  light: 'bg-orange-50 dark:bg-orange-500/5',
  border: 'border-orange-100 dark:border-orange-900/30',
  shadow: 'shadow-orange-100',
};

const company: ProfileTheme = {
  primary: 'blue',
  bg: 'bg-blue-600',
  text: 'text-blue-600',
  light: 'bg-blue-50 dark:bg-blue-500/5',
  border: 'border-blue-100 dark:border-blue-900/30',
  shadow: 'shadow-blue-100',
};

const advertiser: ProfileTheme = {
  primary: 'purple',
  bg: 'bg-purple-600',
  text: 'text-purple-600',
  light: 'bg-purple-50 dark:bg-purple-500/5',
  border: 'border-purple-100 dark:border-purple-900/30',
  shadow: 'shadow-purple-100',
};

export const profileThemes: Record<string, ProfileTheme> = {
  DRIVER: driver,
  COMPANY: company,
  SHIPPER: company,
  ADVERTISER: advertiser,
};

export function useProfileTheme(userType?: string): ProfileTheme {
  return profileThemes[userType?.toUpperCase() || ''] || company;
}
