import { ServiceType, Partner, FinancialTransaction } from './types';

export const SERVICES_CATALOG: ServiceType[] = [
  // Fase 1 - Serviços de Lançamento
  {
    id: 'estetica_automotiva',
    name: 'Estética Automotiva',
    category: 'Detalhamento',
    phase: 1,
    description: 'Polimento, vitrificação de pintura, higienização interna profunda e detalhamento estético.',
    iconName: 'Sparkles',
    basePriceRange: 'R$ 150 - R$ 800'
  },
  {
    id: 'troca_bateria',
    name: 'Bateria Express',
    category: 'Elétrica / Emergência',
    phase: 1,
    description: 'Entrega e instalação rápida de baterias de marcas premium no seu local atual.',
    iconName: 'BatteryCharging',
    basePriceRange: 'R$ 280 - R$ 650'
  },
  {
    id: 'guincho_24h',
    name: 'Guincho 24 Horas',
    category: 'Emergência',
    phase: 1,
    description: 'Socorro e reboque de veículos leves e pesados em qualquer região da cidade a qualquer hora.',
    iconName: 'Truck',
    basePriceRange: 'R$ 120 - R$ 350'
  },
  {
    id: 'troca_oleo',
    name: 'Troca de Óleo Express',
    category: 'Manutenção Preventiva',
    phase: 1,
    description: 'Troca rápida de óleo do motor, filtro de óleo e inspeção básica de fluidos na sua garagem.',
    iconName: 'Droplet',
    basePriceRange: 'R$ 90 - R$ 280'
  },
  // Fase 2 - Expansão
  {
    id: 'autoeletrica',
    name: 'Autoelétrica',
    category: 'Manutenção / Elétrica',
    phase: 2,
    description: 'Diagnóstico e reparo em alternadores, motor de partida, fiação e componentes eletrônicos.',
    iconName: 'Zap',
    basePriceRange: 'R$ 100 - R$ 450'
  },
  {
    id: 'borracharia',
    name: 'Borracharia Express',
    category: 'Emergência / Pneus',
    phase: 2,
    description: 'Reparo de pneus furados, troca de pneus e balanceamento em domicílio ou oficina.',
    iconName: 'Wrench',
    basePriceRange: 'R$ 40 - R$ 180'
  },
  {
    id: 'mecanica',
    name: 'Mecânica Geral',
    category: 'Manutenção Geral',
    phase: 2,
    description: 'Manutenção de freios, suspensão, amortecedores, embreagem e injeção eletrônica.',
    iconName: 'Hammer',
    basePriceRange: 'R$ 150 - R$ 1.500+'
  },
  {
    id: 'higienizacao_ar',
    name: 'Ar-Condicionado',
    category: 'Climatização',
    phase: 2,
    description: 'Higienização química, eliminação de odores e troca de filtro de cabine (filtro antipólen).',
    iconName: 'Wind',
    basePriceRange: 'R$ 80 - R$ 180'
  },
  {
    id: 'lava_rapido',
    name: 'Lava-Rápido Premium',
    category: 'Limpeza',
    phase: 2,
    description: 'Lavagem técnica detalhada, cera rápida de carnaúba e aspiração de estofados.',
    iconName: 'Compass',
    basePriceRange: 'R$ 50 - R$ 120'
  },
  {
    id: 'autopecas',
    name: 'Autopeças Delivery',
    category: 'Peças',
    phase: 2,
    description: 'Cotação e entrega expressa de peças genuínas para seu veículo com garantia do fabricante.',
    iconName: 'ShoppingBag',
    basePriceRange: 'Variável conforme peça'
  }
];

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'p_1',
    name: 'Veloce Bat & Serviços',
    logo: 'VB',
    rating: 4.9,
    reviewsCount: 142,
    servicesOffered: ['troca_bateria', 'autoeletrica', 'troca_oleo'],
    status: 'Ativo',
    plan: 'Premium',
    balance: 2450.00,
    city: 'São Paulo - SP',
    phone: '(11) 98877-6655',
    verified: true,
    lat: -23.5505,
    lng: -46.6333,
    monthlyFeePaid: true
  },
  {
    id: 'p_2',
    name: 'SOS Guincho & Resgate 24h',
    logo: 'SG',
    rating: 4.8,
    reviewsCount: 389,
    servicesOffered: ['guincho_24h', 'borracharia'],
    status: 'Ativo',
    plan: 'Premium',
    balance: 5120.50,
    city: 'São Paulo - SP',
    phone: '(11) 97766-5544',
    verified: true,
    lat: -23.5615,
    lng: -46.6560,
    monthlyFeePaid: true
  },
  {
    id: 'p_3',
    name: 'Studio Estético Diamond Auto',
    logo: 'SD',
    rating: 4.95,
    reviewsCount: 74,
    servicesOffered: ['estetica_automotiva', 'lava_rapido'],
    status: 'Ativo',
    plan: 'Premium',
    balance: 3800.00,
    city: 'São Bernardo do Campo - SP',
    phone: '(11) 96655-4433',
    verified: true,
    lat: -23.6939,
    lng: -46.5650,
    monthlyFeePaid: true
  },
  {
    id: 'p_4',
    name: 'LubriExpress Lubrificantes',
    logo: 'LE',
    rating: 4.7,
    reviewsCount: 201,
    servicesOffered: ['troca_oleo', 'mecanica'],
    status: 'Ativo',
    plan: 'Basic',
    balance: 1200.00,
    city: 'Santo André - SP',
    phone: '(11) 95544-3322',
    verified: true,
    lat: -23.6575,
    lng: -46.5312,
    monthlyFeePaid: true
  },
  {
    id: 'p_5',
    name: 'EletroCar Mecânica Especializada',
    logo: 'EC',
    rating: 4.6,
    reviewsCount: 54,
    servicesOffered: ['autoeletrica', 'mecanica', 'higienizacao_ar'],
    status: 'Ativo',
    plan: 'Basic',
    balance: 850.00,
    city: 'São Paulo - SP',
    phone: '(11) 94433-2211',
    verified: false,
    lat: -23.5900,
    lng: -46.6800,
    monthlyFeePaid: false
  },
  {
    id: 'p_6',
    name: 'VEX Auto Parts & Express',
    logo: 'VP',
    rating: 4.9,
    reviewsCount: 15,
    servicesOffered: ['autopecas'],
    status: 'Pendente',
    plan: 'Basic',
    balance: 0.00,
    city: 'Osasco - SP',
    phone: '(11) 93322-1100',
    verified: false,
    lat: -23.5325,
    lng: -46.7917,
    monthlyFeePaid: false
  }
];

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'TX-1001',
    date: '19/07/2026',
    partnerName: 'Veloce Bat & Serviços',
    serviceName: 'Bateria Heliar 60Ah Express',
    amount: 450.00,
    commission: 45.00, // 10%
    repass: 405.00,
    status: 'Pago'
  },
  {
    id: 'TX-1002',
    date: '18/07/2026',
    partnerName: 'SOS Guincho & Resgate 24h',
    serviceName: 'Guincho até 15km',
    amount: 180.00,
    commission: 18.00,
    repass: 162.00,
    status: 'Pago'
  },
  {
    id: 'TX-1003',
    date: '18/07/2026',
    partnerName: 'Studio Estético Diamond Auto',
    serviceName: 'Polimento Técnico + Cera',
    amount: 550.00,
    commission: 55.00,
    repass: 495.00,
    status: 'Pago'
  },
  {
    id: 'TX-1004',
    date: '17/07/2026',
    partnerName: 'LubriExpress Lubrificantes',
    serviceName: 'Troca de Óleo Mobil 5W30',
    amount: 220.00,
    commission: 22.00,
    repass: 198.00,
    status: 'Pago'
  },
  {
    id: 'TX-1005',
    date: '19/07/2026',
    partnerName: 'SOS Guincho & Resgate 24h',
    serviceName: 'Guincho 24h Emergência',
    amount: 250.00,
    commission: 25.00,
    repass: 225.00,
    status: 'Processando'
  }
];
