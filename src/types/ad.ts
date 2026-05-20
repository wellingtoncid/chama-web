export type AdPositionType = 
  | 'freight_list' 
  | 'infeed_wide' 
  | 'footer' 
  | 'sidebar' 
  | 'spotlight'
  | 'marketplace_list' 
  | 'groups_list' 
  | 'chat_header' 
  | 'popup' 
  | 'header'
  | 'strategic_partners'
  | 'media_network';

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