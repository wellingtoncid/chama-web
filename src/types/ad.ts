export type AdPositionType = 
  | 'freight_list' 
  | 'infeed_wide' 
  | 'infeed_compact' 
  | 'footer' 
  | 'sidebar' 
  | 'spotlight';

export type AdVariant = 'banner-wide' | 'banner-compact' | 'vertical' | 'bar';

export interface Ad {
  id: number;
  title: string;
  image_url: string;
  link_whatsapp: string;
  position: AdPositionType;
  location_city: string;
  is_active: number;
  advertiser_name?: string;
  advertiser_verified?: number;
}