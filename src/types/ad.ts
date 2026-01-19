export interface Ad {
  id: number;
  title: string;
  image_url: string;
  link_whatsapp: string;
  position: 'sidebar' | 'freight_list' | 'home_hero';
  location_city: string;
  is_active: number;
}