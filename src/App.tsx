import Hero from "./components/Hero";
import React, { useState, useEffect } from 'react';
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

export default function App() {
  // Navigation: 'site' | 'app' | 'admin' | 'db'
  const [currentTab, setCurrentTab] = useState<string>('site');
  
  // Theme state: false = Preto + Dourado + Branco (Gold); true = Preto + Vermelho + Branco (Red)
  const [isRedTheme, setIsRedTheme] = useState<boolean>(false);

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
      
      {/* Workspace Control Panel Header */}
      <header className="bg-[#0d0d0d] border-b border-white/10 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo Brand / Slogan */}
          <div className="text-center lg:text-left flex items-center justify-between lg:justify-start gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${isRedTheme ? 'bg-[#E53E3E]' : 'bg-[#C5A059]'} flex items-center justify-center font-black text-black text-xl`}>V</div>
              <div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <span className="font-sans font-black text-2xl tracking-tighter uppercase text-white">
                    VEX<span className={activeAccent}> AUTO HUB</span>
                  </span>
                  <span className="text-[10px] bg-[#0a0a0a] border border-white/10 text-gray-400 px-2 py-0.5 rounded font-mono font-bold tracking-wider">PROTÓTIPO V1.0</span>
                </div>
                <p className="text-[11px] text-white/40 font-medium italic mt-0.5">"Tudo para o seu carro. Em um só lugar."</p>
              </div>
            </div>
          </div>

          {/* Theme Switcher Lado a Lado (Satisfaz o requisito de paletas) */}
          <div className="bg-[#0a0a0a] p-1.5 rounded-none border border-white/10 flex items-center justify-between gap-3 self-center">
            <span className="text-[10px] font-mono font-bold text-white/40 pl-2">PALETA ATIVA:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setIsRedTheme(false)}
                className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isRedTheme 
                    ? 'bg-[#0d0d0d] text-[#C5A059] border border-[#C5A059]/30 shadow' 
                    : 'text-white/40 hover:text-white'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059] border border-black" />
                Preto + Dourado (Premium)
              </button>
              
              <button
                onClick={() => setIsRedTheme(true)}
                className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isRedTheme 
                    ? 'bg-[#0d0d0d] text-[#E53E3E] border border-[#E53E3E]/30 shadow' 
                    : 'text-white/40 hover:text-white'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#E53E3E] border border-black" />
                Preto + Vermelho (Speed)
              </button>
            </div>
          </div>

          {/* Global Workspace Navigation Pills */}
          <nav className="flex flex-wrap items-center justify-center gap-1.5 bg-[#0a0a0a] p-1 rounded-none border border-white/10 self-center">
            
            <button
              onClick={() => setCurrentTab('site')}
              className={`px-3 py-2 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'site' ? activeNavText : 'text-white/60 hover:text-white'
              }`}
            >
              🌐 Site Institucional
            </button>
            
            <button
              onClick={() => setCurrentTab('app')}
              className={`px-3 py-2 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'app' ? activeNavText : 'text-white/60 hover:text-white'
              }`}
            >
              📱 App VEX (Cliente/Parceiro)
            </button>
            
            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-3 py-2 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'admin' ? activeNavText : 'text-white/60 hover:text-white'
              }`}
            >
              ⚙️ VEX Admin
            </button>
            
            <button
              onClick={() => setCurrentTab('db')}
              className={`px-3 py-2 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'db' ? activeNavText : 'text-white/60 hover:text-white'
              }`}
            >
              🗄️ Modelagem SQL
            </button>

          </nav>

        </div>
      </header>

      {/* Main Sandbox Workspace area */}
      <main className="flex-1">
        <Hero />

        {/* Dynamic Context Toast Box informing user about the simulation integration */}
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

        {/* Tab Switching Body */}
        {currentTab === 'site' && (
          <SiteInstitucional
            isRedTheme={isRedTheme}
            onRegisterPartner={handleRegisterPartnerInSite}
            onNavigateTo={setCurrentTab}
            partnersCount={partners.length}
          />
        )}

        {currentTab === 'app' && (
          <div className="py-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900/60 via-neutral-950 to-neutral-950">
            <div className="max-w-4xl mx-auto px-6 text-center mb-6">
              <h3 className="text-xl font-black">App VEX (Cliente & Parceiro)</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-lg mx-auto">
                Um único aplicativo. A pessoa escolhe se entra como Cliente ou como Parceiro, e cada um vê sua própria área.
              </p>
            </div>

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
              <div className="text-center text-xs text-white/40 py-10">Carregando parceiros...</div>
            )}
          </div>
        )}

        {currentTab === 'admin' && (
          <PainelAdmin
            isRedTheme={isRedTheme}
            partners={partners}
            setPartners={setPartners}
            transactions={transactions}
            setTransactions={setTransactions}
            activeRequest={activeRequest}
          />
        )}

        {currentTab === 'db' && (
          <ModelagemDados
            isRedTheme={isRedTheme}
          />
        )}

      </main>

    </div>
  );
}