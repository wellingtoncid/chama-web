export const COUNTRIES = [
  { label: "Brasil", value: "BR" },
  { label: "Argentina", value: "AR" },
  { label: "Paraguai", value: "PY" },
  { label: "Uruguai", value: "UY" },
  { label: "Chile", value: "CL" }
];

export const VEHICLE_TYPES = [
  { value: "Motocicleta", label: "Motocicleta (até 50kg)" },
  { value: "Triciclo", label: "Triciclo de carga (150kg a 500kg)" },
  { value: "Carro de passeio", label: "Carro de passeio (300kg a 500kg)" },
  { value: "Pick-up leve", label: "Pick-up leve (500kg a 750kg)" },
  { value: "Furgão leve", label: "Furgão leve (600kg a 1.500kg)" },
  { value: "Van / Furgão médio", label: "Van / Furgão médio (1.200kg a 2.000kg)" },
  { value: "VUC", label: "VUC (3.000kg a 4.000kg)" },
  { value: "Caminhão 3/4", label: "Caminhão 3/4 (4.000kg a 5.000kg)" },
  { value: "Toco", label: "Caminhão Toco - 2 eixos (6t a 8t)" },
  { value: "Truck", label: "Caminhão Truck - 3 eixos (10t a 14t)" },
  { value: "Bitruck", label: "Bitruck - 4 eixos (15t a 18t)" },
  { value: "Carreta LS", label: "Carreta Simples/LS (25t a 28t)" },
  { value: "Romeu e Julieta", label: "Romeu e Julieta (30t a 33t)" },
  { value: "Bitrem", label: "Bitrem - 7 eixos (36t a 40t)" },
  { value: "Rodotrem", label: "Rodotrem - 9 eixos (48t a 55t)" },
  { value: "Tritrem", label: "Tritrem (acima de 50t)" },
  { value: "CVE", label: "CVE - Especial (acima de 100t)" }
];

export const BODY_TYPES = [
  "Baú",
  "Baú Frigorifico",
  "Sider",
  "Grade Baixa",
  "Graneleiro",
  "Prancha",
  "Porta Container",
  "Caçamba",
  "Tanque",
  "Cegonha"
];

// NOVAS LISTAS PADRONIZADAS
export const DRIVER_COURSES = [
  { id: 'mopp', label: 'MOPP', desc: 'Produtos Perigosos' },
  { id: 'indivisivel', label: 'Carga Indivisível', desc: 'Cargas Especiais' },
  { id: 'passageiros', label: 'Coletivo', desc: 'Passageiros/Vans' },
  { id: 'escolar', label: 'Escolar', desc: 'Transporte Escolar' },
  { id: 'emergencia', label: 'Emergência', desc: 'Ambulância/Bambeiros' },
  { id: 'motofrete', label: 'Motofrete', desc: 'Atividade Remunerada' }
];

export const CNH_CATEGORIES = ['A', 'B', 'C', 'D', 'E'];

// Mapeamento para ícone visual padrão por tipo de veículo (ProfileView)
export const VEHICLE_TYPE_IDS: Record<string, string> = {
  Motocicleta: 'motocicleta',
  Triciclo: 'triciclo',
  'Carro de passeio': 'carro',
  'Pick-up leve': 'pickup',
  'Furgão leve': 'furgao',
  'Van / Furgão médio': 'van',
  VUC: 'vuc',
  'Caminhão 3/4': 'tres-quartos',
  Toco: 'toco',
  Truck: 'truck',
  Bitruck: 'bitruck',
  'Carreta LS': 'carreta',
  'Romeu e Julieta': 'romeu',
  Bitrem: 'bitrem',
  Rodotrem: 'rodotrem',
  Tritrem: 'tritrem',
  CVE: 'cve',
};

export const COMMON_CITIES = [
  "São Paulo - SP",
  "Santos - SP",
  "Rio de Janeiro - RJ",
  "Belo Horizonte - MG",
  "Curitiba - PR",
  "Itajaí - SC",
  "Porto Alegre - RS",
  "Goiânia - GO",
  "Brasília - DF",
  "Buenos Aires - AR",
  "Rosário - AR",
  "Santiago - CL"
];