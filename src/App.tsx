import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { 
  SERVICES_CATALOG, 
  INITIAL_PARTNERS, 
  INITIAL_TRANSACTIONS 
} from './mockData';
import { 
  Partner, 
  OrderRequest, 
  FinancialTransaction 
} from './types';
import { supabase } from './lib/supabase';
import SiteInstitucional from './components/SiteInstitucional';
import AppUnificado from './components/AppUnificado';
import PainelAdmin from './components/PainelAdmin';
import ModelagemDados from './components/ModelagemDados';

import { 
  Sparkles, 
  Layers, 
  Settings, 
  Database, 
  Smartphone, 
  UserCheck, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';

// Converte uma linha vinda do Supabase (snake_case) para o formato Partner usado no app (camelCase)
function mapPartnerRow(row: any): Partner {
  return {
    id: row.id,
    name: row.name,
    logo: row.logo,
    rating: row.rating,
    reviewsCount: row.reviews_count,
    servicesOffered: row.services_offered,
    status: row.status,
    plan: row.plan,
    balance: row.balance,
    city: row.city,
    phone: row.phone,
    verified: row.verified,
    lat: row.lat,
    lng: row.lng,
    monthlyFeePaid: row.monthly_fee_paid,
    fixedPrices: row.fixed_prices || {}
  };
}

// Traduz os nomes de aba antigos ('site', 'app', 'admin', 'db') usados internamente
// pelos componentes (ex: SiteInstitucional chama onNavigateTo('app')) para uma URL de verdade
function tabNameToPath(tab: string): string {
  switch (tab) {
    case 'app': return '/app';
    case 'admin': return '/admin';
    case 'db': return '/db';
    default: return '/';
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  // Deriva a aba ativa direto da URL, em vez de um estado separado
  const currentTab = location.pathname === '/app' ? 'app'
    : location.pathname === '/admin' ? 'admin'
    : location.pathname === '/db' ? 'db'
    : 'site';

  const goToTab = (tab: string) => navigate(tabNameToPath(tab));

  // Paleta fixa em Preto + Dourado — o seletor de tema foi removido
  const isRedTheme = false;

  // Shared database states
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoaded, setPartnersLoaded] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(INITIAL_TRANSACTIONS);
  const [activeRequest, setActiveRequest] = useState<OrderRequest | null>(null);

  // Busca os parceiros reais do Supabase ao carregar, e escuta mudanças em tempo real
  // (assim, aprovar um parceiro no Admin em uma aba/dispositivo reflete em todas as outras)
  useEffect(() => {
    let isMounted = true;

    const fetchPartners = async () => {
      const { data, error } = await supabase.from('partners').select('*');
      if (error || !data || !isMounted) return;
      setPartners(data.map(mapPartnerRow));
      setPartnersLoaded(true);
    };

    fetchPartners();

    const channel = supabase
      .channel('partners-listen')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partners' }, (payload: any) => {
        if (payload.eventType === 'DELETE') {
          setPartners(prev => prev.filter(p => p.id !== payload.old.id));
          return;
        }
        const updated = mapPartnerRow(payload.new);
        setPartners(prev => {
          const exists = prev.some(p => p.id === updated.id);
          return exists ? prev.map(p => p.id === updated.id ? updated : p) : [updated, ...prev];
        });
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Helpers
  const handleRegisterPartnerInSite = (newPartner: Partner) => {
    setPartners(prev => {
      const exists = prev.some(p => p.id === newPartner.id);
      return exists ? prev : [newPartner, ...prev];
    });
  };

  const handleAddTransaction = (newTx: FinancialTransaction) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleUpdatePartnerBalance = async (partnerId: string, amount: number) => {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;
    const newBalance = parseFloat((partner.balance + amount).toFixed(2));

    setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, balance: newBalance } : p));

    await supabase.from('partners').update({ balance: newBalance }).eq('id', partnerId);
  };

  const handleUpdatePartnerRating = async (partnerId: string, newRating: number) => {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;
    const totalRatingPoints = (partner.rating * partner.reviewsCount) + newRating;
    const newCount = partner.reviewsCount + 1;
    const newAvg = parseFloat((totalRatingPoints / newCount).toFixed(2));

    setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, reviewsCount: newCount, rating: newAvg } : p));

    await supabase.from('partners').update({ rating: newAvg, reviews_count: newCount }).eq('id', partnerId);
  };

  // Color theme helpers
  const activeAccent = isRedTheme ? 'text-[#E53E3E]' : 'text-[#C5A059]';
  const activeBg = isRedTheme ? 'bg-[#E53E3E]' : 'bg-[#C5A059]';
  const activeBorder = isRedTheme ? 'border-[#E53E3E]/20' : 'border-[#C5A059]/20';
  const activeRing = isRedTheme ? 'ring-[#E53E3E]' : 'ring-[#C5A059]';
  const activeNavText = isRedTheme ? 'text-[#E53E3E] bg-[#E53E3E]/10 border-[#E53E3E]/30' : 'text-[#C5A059] bg-[#C5A059]/10 border-[#C5A059]/30';

  return (
    <div className={`min-h-screen flex flex-col bg-[#0a0a0a] text-white font-sans ${isRedTheme ? 'selection:bg-[#E53E3E]' : 'selection:bg-[#C5A059]'} selection:text-black`}>
      
      {/* Cabeçalho do site — não aparece em /app, que fica isolado como um app de verdade (pronto pra Play Store/App Store) */}
      {currentTab !== 'app' && (
        <header className="bg-[#0d0d0d] border-b border-white/10 sticky top-0 z-50 px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Logo Brand / Slogan */}
            <button onClick={() => navigate('/')} className="text-center lg:text-left flex items-center justify-between lg:justify-start gap-4 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${isRedTheme ? 'bg-[#E53E3E]' : 'bg-[#C5A059]'} flex items-center justify-center font-black text-black text-xl`}>V</div>
                <div>
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <span className="font-sans font-black text-2xl tracking-tighter uppercase text-white">
                      VEX<span className={activeAccent}> AUTO HUB</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 font-medium italic mt-0.5">"Tudo para o seu carro. Em um só lugar."</p>
                </div>
              </div>
            </button>

          </div>
        </header>
      )}

      {/* Main Sandbox Workspace area */}
      <main className="flex-1">

        {/* Dynamic Context Toast Box — some no /app também */}
        {currentTab !== 'app' && (
          <div className="bg-[#0d0d0d] border-b border-white/10 py-2.5 px-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
              <p className="flex items-center gap-2 text-center sm:text-left">
                <Info className={`w-4 h-4 shrink-0 ${activeAccent}`} />
                <span>
                  <strong>Simulação Conectada:</strong> Cadastre um parceiro no <i>Site</i> ➔ aprove-o como administrador no <i>VEX Admin</i> ➔ envie orçamentos e transacione no <i>App Cliente / Parceiro</i>.
                </span>
              </p>
              <div className="flex gap-4 font-mono">
                <span>Fase 1: <strong className="text-emerald-400">Ativa</strong></span>
                <span>•</span>
                <span>Fase 2: <strong className={activeAccent}>Mapeada</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Rotas — cada uma tem sua própria URL, e um F5 não te joga pra fora dela */}
        <Routes>
          <Route
            path="/"
            element={
              <SiteInstitucional
                isRedTheme={isRedTheme}
                onRegisterPartner={handleRegisterPartnerInSite}
                onNavigateTo={goToTab}
                partnersCount={partners.length}
              />
            }
          />

          <Route
            path="/app"
            element={
              <div className="min-h-screen py-6 bg-[#0a0a0a]">
                {partnersLoaded ? (
                  <AppUnificado
                    isRedTheme={isRedTheme}
                    partners={partners}
                    setPartners={setPartners}
                    activeRequest={activeRequest}
                    setActiveRequest={setActiveRequest}
                    transactions={transactions}
                    onAddTransaction={handleAddTransaction}
                    onUpdatePartnerBalance={handleUpdatePartnerBalance}
                    onUpdatePartnerRating={handleUpdatePartnerRating}
                    onRegisterPartner={handleRegisterPartnerInSite}
                  />
                ) : (
                  <div className="text-center text-xs text-white/40 py-10">Carregando...</div>
                )}
              </div>
            }
          />

          <Route
            path="/admin"
            element={
              <PainelAdmin
                isRedTheme={isRedTheme}
                partners={partners}
                setPartners={setPartners}
                transactions={transactions}
                setTransactions={setTransactions}
                activeRequest={activeRequest}
              />
            }
          />

          <Route path="/db" element={<ModelagemDados isRedTheme={isRedTheme} />} />
        </Routes>

      </main>

    </div>
  );
}
