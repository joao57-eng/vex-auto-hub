export interface Partner {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewsCount: number;
  servicesOffered: string[]; // ServiceType IDs
  status: 'Pendente' | 'Ativo' | 'Suspenso';
  plan: 'Basic' | 'Premium';
  balance: number; // For earnings panel
  city: string;
  phone: string;
  verified: boolean;
  lat: number;
  lng: number;
  monthlyFeePaid: boolean;
}

export interface ServiceType {
  id: string;
  name: string;
  category: string;
  phase: 1 | 2;
  description: string;
  iconName: string;
  basePriceRange: string;
}

export interface BudgetProposal {
  partnerId: string;
  partnerName: string;
  partnerRating: number;
  price: number;
  estimatedTime: string;
  notes: string;
  status: 'Pendente' | 'Aprovado' | 'Recusado';
}

export interface OrderRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  serviceId: string;
  status: 'AguardandoOrçamentos' | 'OrçamentosRecebidos' | 'Aprovado' | 'PagamentoPendente' | 'EmAndamento' | 'Concluido' | 'Avaliado';
  activeStep: number; // 1: Escolha, 2: Localização, 3: Orçamentos, 4: Pagamento, 5: Acompanhamento, 6: Avaliação
  proposals: BudgetProposal[];
  selectedPartnerId?: string;
  paymentMethod?: 'Pix' | 'Cartao';
  paymentSplit?: {
    total: number;
    commissionVex: number;
    partnerRepass: number;
  };
  rating?: number;
  feedback?: string;
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  partnerName: string;
  serviceName: string;
  amount: number;
  commission: number;
  repass: number;
  status: 'Pago' | 'Pendente' | 'Processando';
}
