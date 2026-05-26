export type AdPositionType = 
  | 'freight_list' 
  | 'freight_card'
  | 'infeed_wide' 
  | 'footer' 
  | 'sidebar' 
  | 'spotlight'
  | 'marketplace_list' 
  | 'marketplace_card'
  | 'groups_list' 
  | 'groups_card'
  | 'chat_header' 
  | 'popup' 
  | 'header';

export type AdVariant = 'banner-wide' | 'banner-compact' | 'vertical' | 'bar' | 'card' | 'ecommerce' | 'footer' | 'sidebar' | 'notice';

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