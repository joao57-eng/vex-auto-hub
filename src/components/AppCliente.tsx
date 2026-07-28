import React, { useState, useEffect } from 'react';
import { SERVICES_CATALOG } from '../mockData';
import { Partner, OrderRequest, BudgetProposal } from '../types';
import { supabase } from '../lib/supabase';
import { 
  Sparkles, MapPin, Search, Navigation, Compass, Shield, Star, Check, AlertCircle,
  Clock, CreditCard, CheckCircle2, StarHalf, MessageSquare, ChevronRight, RefreshCw, X
} from 'lucide-react';

interface AppClienteProps {
  isRedTheme: boolean;
  partners: Partner[];
  activeRequest: OrderRequest | null;
  setActiveRequest: (req: OrderRequest | null) => void;
  onAddTransaction: (tx: any) => void;
  onUpdatePartnerBalance: (partnerId: string, amount: number) => void;
  onUpdatePartnerRating: (partnerId: string, rating: number) => void;
  clientName: string;
  clientPhone: string;
}

export default function AppCliente({
  isRedTheme,
  partners,
  activeRequest,
  setActiveRequest,
  onAddTransaction,
  onUpdatePartnerBalance,
  onUpdatePartnerRating,
  clientName,
  clientPhone
}: AppClienteProps) {
  // Mobile states
  const [selectedCategory, setSelectedCategory] = useState<'Fase1' | 'Fase2'>('Fase1');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create local states for ongoing request creation when activeRequest is null
  const [localStep, setLocalStep] = useState<number>(1); // 1: Choose, 2: Location, 3: Budgets, 4: Pay, 5: Tracker, 6: Rate
  const [chosenServiceId, setChosenServiceId] = useState<string>('');
  const [addressInput, setAddressInput] = useState('Av. Paulista, 1500 - Bela Vista, São Paulo - SP');
  const [selectedProposal, setSelectedProposal] = useState<BudgetProposal | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Cartao'>('Pix');
  const [trackerSubStep, setTrackerSubStep] = useState<number>(1); // 1: Preparando, 2: A caminho, 3: Executando, 4: Pronto
  
  // Rating form
  const [stars, setStars] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState('');

  const primaryAccent = isRedTheme ? 'text-[#E53E3E]' : 'text-[#C5A059]';
  const primaryBg = isRedTheme ? 'bg-[#E53E3E] hover:bg-[#c22d2d]' : 'bg-[#C5A059] hover:bg-[#b08e4d]';
  const primaryBorder = isRedTheme ? 'border-[#E53E3E]/30' : 'border-[#C5A059]/30';
  const activeTabClass = isRedTheme ? 'bg-[#E53E3E]/10 text-[#E53E3E] border-[#E53E3E]/30' : 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/30';

  const phase1Services = SERVICES_CATALOG.filter(s => s.phase === 1);
  const phase2Services = SERVICES_CATALOG.filter(s => s.phase === 2);
  const displayedServices = selectedCategory === 'Fase1' ? phase1Services : phase2Services;

  const filteredServices = displayedServices.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Flow triggers
  const handleSelectService = (serviceId: string) => {
    setChosenServiceId(serviceId);
    setLocalStep(2);
  };

  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [matchedFixedPartner, setMatchedFixedPartner] = useState<{ partner: Partner; price: number; estimatedTime: string } | null>(null);

  // Procura o melhor parceiro ativo com preço fixo definido para o serviço escolhido
  const findFixedPricePartner = () => {
    const candidates = partners.filter(p =>
      p.status === 'Ativo' &&
      p.servicesOffered.includes(chosenServiceId) &&
      p.fixedPrices && p.fixedPrices[chosenServiceId]
    );
    if (candidates.length === 0) return null;
    // Escolhe o parceiro mais bem avaliado (simula "mais próximo/disponível")
    const best = candidates.reduce((a, b) => (b.rating > a.rating ? b : a));
    return { partner: best, price: best.fixedPrices![chosenServiceId].price, estimatedTime: best.fixedPrices![chosenServiceId].estimatedTime };
  };

  const handleProceedFromAddress = () => {
    const match = findFixedPricePartner();
    if (match) {
      setMatchedFixedPartner(match);
      setLocalStep(2.5);
    } else {
      handleConfirmLocation();
    }
  };

  const handleConfirmFixedPriceOrder = async () => {
    if (!matchedFixedPartner) return;
    setIsCreatingRequest(true);

    const paymentSplit = {
      total: matchedFixedPartner.price,
      commissionVex: parseFloat((matchedFixedPartner.price * 0.10).toFixed(2)),
      partnerRepass: parseFloat((matchedFixedPartner.price * 0.90).toFixed(2))
    };

    const { data, error } = await supabase
      .from('order_requests')
      .insert({
        client_name: clientName,
        client_phone: clientPhone,
        client_address: addressInput,
        service_id: chosenServiceId,
        status: 'PagamentoPendente',
        active_step: 4,
        selected_partner_id: matchedFixedPartner.partner.id,
        payment_split: paymentSplit
      })
      .select()
      .single();

    if (error || !data) {
      setIsCreatingRequest(false);
      console.error(error);
      alert('Não foi possível criar sua solicitação. Tente novamente.');
      return;
    }

    const proposal: BudgetProposal = {
      partnerId: matchedFixedPartner.partner.id,
      partnerName: matchedFixedPartner.partner.name,
      partnerRating: matchedFixedPartner.partner.rating,
      price: matchedFixedPartner.price,
      estimatedTime: matchedFixedPartner.estimatedTime,
      notes: 'Preço fixo do parceiro.',
      status: 'Pendente'
    };

    await supabase
      .from('budget_proposals')
      .insert({
        order_request_id: data.id,
        partner_id: proposal.partnerId,
        partner_name: proposal.partnerName,
        partner_rating: proposal.partnerRating,
        price: proposal.price,
        estimated_time: proposal.estimatedTime,
        notes: proposal.notes,
        status: 'Pendente'
      });

    setIsCreatingRequest(false);

    const newRequest: OrderRequest = {
      id: data.id,
      clientName: data.client_name,
      clientPhone: data.client_phone,
      clientAddress: data.client_address,
      serviceId: data.service_id,
      status: data.status,
      activeStep: data.active_step,
      proposals: [proposal],
      selectedPartnerId: matchedFixedPartner.partner.id,
      paymentSplit,
      createdAt: new Date(data.created_at).toLocaleDateString('pt-BR')
    };

    setActiveRequest(newRequest);
    setSelectedProposal(proposal);
    setLocalStep(4);
  };

  const handleConfirmLocation = async () => {
    setIsCreatingRequest(true);

    const { data, error } = await supabase
      .from('order_requests')
      .insert({
        client_name: clientName,
        client_phone: clientPhone,
        client_address: addressInput,
        service_id: chosenServiceId,
        status: 'AguardandoOrçamentos',
        active_step: 3
      })
      .select()
      .single();

    setIsCreatingRequest(false);

    if (error || !data) {
      console.error(error);
      alert('Não foi possível criar sua solicitação. Tente novamente em instantes.');
      return;
    }

    const newRequest: OrderRequest = {
      id: data.id,
      clientName: data.client_name,
      clientPhone: data.client_phone,
      clientAddress: data.client_address,
      serviceId: data.service_id,
      status: data.status,
      activeStep: data.active_step,
      proposals: [],
      createdAt: new Date(data.created_at).toLocaleDateString('pt-BR')
    };

    setActiveRequest(newRequest);
    setLocalStep(3);
  };

  // Escuta em tempo real novos orçamentos enviados por parceiros para este pedido
  useEffect(() => {
    if (!activeRequest?.id || localStep !== 3) return;

    const channel = supabase
      .channel(`order-proposals-${activeRequest.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'budget_proposals', filter: `order_request_id=eq.${activeRequest.id}` },
        (payload: any) => {
          const row = payload.new;
          if (!row) return;

          const incomingProposal: BudgetProposal = {
            partnerId: row.partner_id,
            partnerName: row.partner_name,
            partnerRating: row.partner_rating,
            price: row.price,
            estimatedTime: row.estimated_time,
            notes: row.notes,
            status: row.status
          };

          setActiveRequest(prev => {
            if (!prev) return prev;
            const alreadyHas = prev.proposals.some(p => p.partnerId === incomingProposal.partnerId);
            const updatedProposals = alreadyHas
              ? prev.proposals.map(p => p.partnerId === incomingProposal.partnerId ? incomingProposal : p)
              : [...prev.proposals, incomingProposal];
            return { ...prev, proposals: updatedProposals, status: 'OrçamentosRecebidos' };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRequest?.id, localStep]);

  const handleSelectProposal = async (prop: BudgetProposal) => {
    setSelectedProposal(prop);
    
    if (activeRequest) {
      const paymentSplit = {
        total: prop.price,
        commissionVex: parseFloat((prop.price * 0.10).toFixed(2)), // 10% standard VEX commission
        partnerRepass: parseFloat((prop.price * 0.90).toFixed(2))
      };

      const updatedReq: OrderRequest = {
        ...activeRequest,
        selectedPartnerId: prop.partnerId,
        status: 'PagamentoPendente',
        activeStep: 4,
        paymentSplit
      };
      setActiveRequest(updatedReq);

      await supabase
        .from('order_requests')
        .update({
          selected_partner_id: prop.partnerId,
          status: 'PagamentoPendente',
          active_step: 4,
          payment_split: paymentSplit
        })
        .eq('id', activeRequest.id);
    }
    setLocalStep(4);
  };

  const handleConfirmPayment = async () => {
    if (activeRequest) {
      const updatedReq: OrderRequest = {
        ...activeRequest,
        paymentMethod: paymentMethod,
        status: 'EmAndamento',
        activeStep: 5
      };
      setActiveRequest(updatedReq);
      setTrackerSubStep(1);

      await supabase
        .from('order_requests')
        .update({ payment_method: paymentMethod, status: 'EmAndamento', active_step: 5 })
        .eq('id', activeRequest.id);
    }
    setLocalStep(5);
  };

  const advanceTracker = async () => {
    if (trackerSubStep < 4) {
      setTrackerSubStep(prev => prev + 1);
    } else {
      if (activeRequest) {
        const updatedReq: OrderRequest = {
          ...activeRequest,
          status: 'Concluido',
          activeStep: 6
        };
        setActiveRequest(updatedReq);

        await supabase
          .from('order_requests')
          .update({ status: 'Concluido', active_step: 6 })
          .eq('id', activeRequest.id);
      }
      setLocalStep(6);
    }
  };

  const handleSendRating = async () => {
    if (activeRequest && selectedProposal) {
      // 1. Update partner balance with repass amount
      const repassVal = activeRequest.paymentSplit?.partnerRepass || (selectedProposal.price * 0.90);
      onUpdatePartnerBalance(selectedProposal.partnerId, repassVal);

      // 2. Add transaction record
      const serviceObj = SERVICES_CATALOG.find(s => s.id === chosenServiceId);
      const newTx = {
        id: 'TX-' + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toLocaleDateString('pt-BR'),
        partnerName: selectedProposal.partnerName,
        serviceName: serviceObj?.name || 'Serviço Automotivo',
        amount: selectedProposal.price,
        commission: activeRequest.paymentSplit?.commissionVex || (selectedProposal.price * 0.10),
        repass: repassVal,
        status: 'Pago'
      };
      onAddTransaction(newTx);

      // 3. Update partner average rating
      onUpdatePartnerRating(selectedProposal.partnerId, stars);

      // 4. Persist rating and feedback on the order itself
      await supabase
        .from('order_requests')
        .update({ status: 'Avaliado', rating: stars, feedback: feedbackText })
        .eq('id', activeRequest.id);

      // Reset
      setActiveRequest(null);
      setLocalStep(1);
      setChosenServiceId('');
      setSelectedProposal(null);
      setFeedbackText('');
      alert('Avaliação enviada com sucesso! O valor líquido foi transferido para a carteira do parceiro.');
    }
  };

  const handleCancelRequest = () => {
    setActiveRequest(null);
    setLocalStep(1);
    setChosenServiceId('');
    setSelectedProposal(null);
  };

  return (
    <div className="flex flex-col items-center py-6">
      {/* Smartphone Chassis Frame */}
      <div className="relative w-[340px] h-[680px] bg-neutral-900 rounded-[50px] border-[12px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col ring-4 ring-neutral-950">
        
        {/* Dynamic Notch / Ear Speaker */}
        <div className="absolute top-0 inset-x-0 h-6 bg-neutral-800 rounded-b-2xl flex justify-center items-center z-30">
          <div className="w-16 h-4 bg-black rounded-full flex items-center justify-between px-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <div className="w-6 h-1 bg-neutral-800 rounded-full" />
            <span className="w-1 h-1 rounded-full bg-neutral-600" />
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-neutral-950 text-[10px] text-gray-500 px-6 pt-7 pb-1.5 flex justify-between items-center z-20 font-mono">
          <span>14:25</span>
          <div className="flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-gray-500 animate-spin" />
            <span className="text-emerald-500">5G VEX</span>
          </div>
        </div>

        {/* Screen Scrollable Body */}
        <div className="flex-1 bg-neutral-950 text-white flex flex-col overflow-y-auto font-sans relative">
          
          {/* Header Bar */}
          <div className="px-4 py-3 bg-neutral-900/60 border-b border-neutral-900 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-1.5">
              <span className={`font-mono font-black text-sm tracking-wider ${primaryAccent}`}>VEX</span>
              <span className="text-[10px] bg-neutral-800 text-gray-400 px-1.5 py-0.5 rounded font-mono">CLIENTE</span>
            </div>
            {localStep > 1 && (
              <button 
                onClick={handleCancelRequest}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-mono bg-neutral-950 px-2 py-1 rounded border border-neutral-900 cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </div>

          {/* STEP 1: CHOOSE SERVICE */}
          {localStep === 1 && (
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                {/* Location Bar */}
                <div className="bg-neutral-900 p-2.5 rounded-none border border-white/10 flex items-center gap-2 mb-4">
                  <MapPin className={`w-4 h-4 ${primaryAccent} shrink-0`} />
                  <div className="overflow-hidden">
                    <p className="text-[9px] text-white/40 uppercase tracking-wider font-bold">SUA LOCALIZAÇÃO</p>
                    <p className="text-[10px] font-bold text-gray-300 truncate">{addressInput}</p>
                  </div>
                </div>

                {/* Slogan Intro */}
                <div className="mb-4">
                  <h3 className="text-base font-extrabold tracking-tight">O que o seu carro precisa hoje?</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Orçamentos rápidos com profissionais locais</p>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar bateria, guincho, óleo..."
                    className="w-full bg-neutral-900 border border-white/10 rounded-none py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-current text-white placeholder-white/20"
                  />
                </div>

                {/* Category Selector Tabs */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setSelectedCategory('Fase1')}
                    className={`py-2 rounded-none text-[10px] font-bold border transition-all uppercase tracking-wider ${
                      selectedCategory === 'Fase1' ? activeTabClass : 'border-white/10 bg-neutral-900/40 text-white/40'
                    }`}
                  >
                    Fase 1
                  </button>
                  <button
                    onClick={() => setSelectedCategory('Fase2')}
                    className={`py-2 rounded-none text-[10px] font-bold border transition-all uppercase tracking-wider ${
                      selectedCategory === 'Fase2' ? activeTabClass : 'border-white/10 bg-neutral-900/40 text-white/40'
                    }`}
                  >
                    Fase 2
                  </button>
                </div>

                {/* Service Items Grid */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleSelectService(service.id)}
                        className={`w-full text-left p-3 bg-[#0d0d0d] hover:bg-[#121212] border border-white/10 rounded-none transition-all flex justify-between items-center group cursor-pointer ${primaryAccent.replace('text-', 'hover:border-')}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-none bg-neutral-950 border ${primaryBorder}`}>
                            <Sparkles className={`w-3.5 h-3.5 ${primaryAccent}`} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-tight">{service.name}</h4>
                            <p className="text-[9px] text-white/40 leading-normal line-clamp-1">{service.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <AlertCircle className="w-5 h-5 mx-auto text-gray-600 mb-1" />
                      <p className="text-[10px] text-gray-500">Nenhum serviço encontrado</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Safety notice */}
              <div className="mt-4 p-2.5 rounded-none bg-neutral-900/50 border border-white/10 flex gap-2 items-center text-[9px] text-white/40">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Atendimentos monitorados por geolocalização e com pagamento protegido.</span>
              </div>
            </div>
          )}

          {/* STEP 2: ADDRESS INPUT / MAP */}
          {localStep === 2 && (
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded ${primaryBg}/10 ${primaryAccent}`}>PASSO 2 DE 6</span>
                  <h3 className="text-sm font-extrabold text-white mt-2">Onde seu carro está?</h3>
                  <p className="text-[10px] text-gray-400">Os orçamentos consideram a distância até os parceiros.</p>
                </div>

                {/* Simulated map graphic */}
                <div className="h-44 bg-neutral-900 rounded-none border border-white/10 relative overflow-hidden flex flex-col justify-center items-center">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:14px_14px]" />
                  
                  {/* Pin Client */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`p-1 bg-black border ${primaryBorder} rounded-full animate-bounce`}>
                      <MapPin className={`w-6 h-6 ${primaryAccent}`} />
                    </div>
                    <div className="bg-neutral-950 text-[9px] font-bold px-2 py-1 rounded shadow-lg border border-neutral-800 mt-1">
                      Seu Veículo
                    </div>
                  </div>

                  {/* Dot animation representing search */}
                  <div className={`absolute w-32 h-32 rounded-full border border-dashed ${isRedTheme ? 'border-red-500/20' : 'border-amber-500/20'} animate-ping opacity-30`} />
                </div>

                {/* Input block */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40">Confirme o Endereço de Entrega/Socorro:</label>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-none py-2.5 px-3 text-xs focus:outline-none focus:border-current text-white font-sans"
                  />
                  <button 
                    onClick={() => setAddressInput('Av. Brigadeiro Luís Antônio, 2200 - São Paulo')}
                    className="text-[10px] text-gray-500 hover:text-gray-300 underline block"
                  >
                    Usar Endereço de Teste Alternativo
                  </button>
                </div>
              </div>

              <button
                onClick={handleProceedFromAddress}
                disabled={isCreatingRequest}
                className={`w-full py-3 rounded-none text-xs font-bold text-black uppercase tracking-widest ${primaryBg} transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
              >
                {isCreatingRequest ? 'Enviando solicitação...' : 'Buscar Orçamentos Próximos'}
                {!isCreatingRequest && <Navigation className="w-3.5 h-3.5 text-black" />}
              </button>
            </div>
          )}

          {/* STEP 2.5: PREÇO FIXO ENCONTRADO — ESTILO 99/UBER */}
          {localStep === 2.5 && matchedFixedPartner && (
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded ${primaryBg}/10 ${primaryAccent}`}>PREÇO FIXO DISPONÍVEL</span>
                  <h3 className="text-sm font-extrabold text-white mt-2">Encontramos um parceiro na hora!</h3>
                  <p className="text-[10px] text-gray-400">Sem espera por orçamentos — pague agora e confirme o serviço.</p>
                </div>

                <div className="bg-neutral-900 border border-white/10 rounded-none p-4 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <p className="text-xs font-bold text-gray-100 uppercase tracking-tight">{matchedFixedPartner.partner.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-gray-400">{matchedFixedPartner.partner.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    {matchedFixedPartner.partner.verified && (
                      <Shield className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-white/30 font-bold">Valor Fixo</span>
                      <p className="text-base font-black text-emerald-400">R$ {matchedFixedPartner.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-white/30 font-bold">Chegada Estimada</span>
                      <p className="text-sm font-bold text-gray-200">{matchedFixedPartner.estimatedTime}</p>
                    </div>
                  </div>
                </div>

                <p className="text-[9px] text-white/30 text-center">Ao confirmar, você já garante o parceiro e vai direto para o pagamento.</p>
              </div>

              <div className="space-y-2 mt-4">
                <button
                  onClick={handleConfirmFixedPriceOrder}
                  disabled={isCreatingRequest}
                  className={`w-full py-3 rounded-none text-xs font-bold text-black uppercase tracking-widest ${primaryBg} transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
                >
                  {isCreatingRequest ? 'Confirmando...' : 'Pagar Agora e Confirmar'}
                </button>
                <button
                  onClick={() => { setMatchedFixedPartner(null); handleConfirmLocation(); }}
                  disabled={isCreatingRequest}
                  className="w-full py-2.5 text-[10px] text-white/40 hover:text-white underline cursor-pointer disabled:opacity-50"
                >
                  Prefiro esperar por outros orçamentos
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT BUDGET/PROPOSAL */}
          {localStep === 3 && activeRequest && (
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded ${primaryBg}/10 ${primaryAccent}`}>PASSO 3 DE 6</span>
                  <div className="flex items-center gap-2 mt-2">
                    <h3 className="text-sm font-extrabold text-white">Orçamentos Recebidos</h3>
                    <span className="text-[10px] bg-neutral-900 text-green-400 px-2 py-0.5 rounded border border-neutral-800 font-bold animate-pulse">Ativo</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Prestadores credenciados disponíveis para seu local.</p>
                </div>

                {/* Proposals List */}
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {activeRequest.proposals.length === 0 && (
                    <div className="p-6 bg-neutral-900/40 border border-white/10 rounded-none text-center">
                      <RefreshCw className="w-5 h-5 mx-auto text-white/30 mb-2 animate-spin" />
                      <p className="text-[10px] text-white/40">Procurando parceiros disponíveis na sua região...</p>
                      <p className="text-[9px] text-white/25 mt-1">Assim que um orçamento chegar, ele aparece aqui automaticamente.</p>
                    </div>
                  )}
                  {activeRequest.proposals.map((prop) => (
                    <div 
                      key={prop.partnerId}
                      className="p-3 bg-neutral-900 border border-white/10 rounded-none space-y-2 hover:border-current transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="text-xs font-extrabold text-gray-200 uppercase tracking-tight">{prop.partnerName}</h4>
                            <span className="text-[9px] bg-green-500/10 text-green-400 px-1 py-0.5 rounded-none font-mono font-bold uppercase">Verificado</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex text-amber-450">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            </div>
                            <span className="text-[9px] text-gray-400 font-bold">{prop.partnerRating.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`text-sm font-black ${primaryAccent}`}>R$ {prop.price.toFixed(2)}</p>
                          <p className="text-[9px] text-gray-500 flex items-center justify-end gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {prop.estimatedTime}
                          </p>
                        </div>
                      </div>

                      <p className="text-[10px] text-white/40 italic bg-[#0a0a0a] p-2 rounded-none border border-white/10">
                        "{prop.notes}"
                      </p>

                      <button
                        onClick={() => handleSelectProposal(prop)}
                        className={`w-full py-2.5 rounded-none text-[10px] font-bold text-black uppercase tracking-wider ${primaryBg} transition-all flex items-center justify-center gap-1.5 cursor-pointer`}
                      >
                        Selecionar e Ir para Pagamento
                        <ChevronRight className="w-3 h-3 text-black" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[9px] text-gray-600 text-center mt-3">
                A VEX AUTO HUB cobra comissão padrão de 10% já incluída no valor final proposto.
              </p>
            </div>
          )}

          {/* STEP 4: PAYMENT SCREEN */}
          {localStep === 4 && activeRequest && selectedProposal && (
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded ${primaryBg}/10 ${primaryAccent}`}>PASSO 4 DE 6</span>
                  <h3 className="text-sm font-extrabold text-white mt-2">Pagamento Seguro VEX</h3>
                  <p className="text-[10px] text-gray-400">Seu dinheiro fica protegido até a conclusão do serviço.</p>
                </div>

                {/* Audit Table (Split Demonstration) */}
                <div className="bg-[#0d0d0d] rounded-none p-3 border border-white/10 space-y-2">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider pb-1.5 border-b border-white/10">Detalhamento do Split Financeiro</p>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Valor Bruto do Serviço</span>
                    <span className="font-mono text-gray-300">R$ {selectedProposal.price.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                    <span className="text-white/30 flex items-center gap-1 text-[11px]">
                      Taxa VEX Retida (10%)
                      <span className={`bg-neutral-950 text-[8px] px-1 py-0.5 rounded-none font-mono ${primaryAccent}`}>Comissão</span>
                    </span>
                    <span className="font-mono text-white/40 text-[11px]">- R$ {activeRequest.paymentSplit?.commissionVex.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-emerald-450 font-bold text-[11px]">Repasse Líquido ao Parceiro</span>
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">R$ {activeRequest.paymentSplit?.partnerRepass.toFixed(2)}</span>
                  </div>
                </div>

                {/* Select payment method */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400">Selecione o Método:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('Pix')}
                      className={`p-3 rounded-none border text-left flex items-center gap-2 transition-all ${
                        paymentMethod === 'Pix' 
                          ? `${isRedTheme ? 'border-[#E53E3E] bg-[#E53E3E]/10' : 'border-[#C5A059] bg-[#C5A059]/10'}`
                          : 'border-white/10 bg-neutral-900/40 text-white/40'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${paymentMethod === 'Pix' ? primaryAccent : 'text-white/20'}`} />
                      <div>
                        <p className="text-xs font-bold text-gray-200">Pix Express</p>
                        <p className="text-[8px] text-white/40">Liberação instantânea</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('Cartao')}
                      className={`p-3 rounded-none border text-left flex items-center gap-2 transition-all ${
                        paymentMethod === 'Cartao' 
                          ? `${isRedTheme ? 'border-[#E53E3E] bg-[#E53E3E]/10' : 'border-[#C5A059] bg-[#C5A059]/10'}`
                          : 'border-white/10 bg-neutral-900/40 text-white/40'
                      }`}
                    >
                      <CreditCard className={`w-4 h-4 ${paymentMethod === 'Cartao' ? primaryAccent : 'text-white/20'}`} />
                      <div>
                        <p className="text-xs font-bold text-gray-200">Cartão de Crédito</p>
                        <p className="text-[8px] text-white/40">Até 6x sem juros</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Pix Details */}
                {paymentMethod === 'Pix' && (
                  <div className="bg-neutral-950 p-3 rounded-none border border-white/10 space-y-2 text-center">
                    <p className="text-[10px] text-white/40">Escaneie o QR Code ou copie a chave Pix abaixo</p>
                    <div className="w-24 h-24 mx-auto bg-white p-1 rounded-none flex items-center justify-center">
                      <div className="w-22 h-22 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 to-black rounded-none" />
                    </div>
                    <code className="block text-[8px] bg-[#0d0d0d] p-1.5 rounded-none text-white/40 select-all truncate font-mono">
                      vex-auto-hub-key-sp-9485764720194
                    </code>
                  </div>
                )}
              </div>

              <button
                onClick={handleConfirmPayment}
                className={`w-full py-3.5 rounded-none text-xs font-bold text-black uppercase tracking-widest ${primaryBg} transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer`}
              >
                Confirmar Pagamento
                <Check className="w-4 h-4 text-black" />
              </button>
            </div>
          )}

          {/* STEP 5: REALTIME TRACKER */}
          {localStep === 5 && activeRequest && selectedProposal && (
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded ${primaryBg}/10 ${primaryAccent}`}>PASSO 5 DE 6</span>
                  <h3 className="text-sm font-extrabold text-white mt-2">Acompanhamento em Tempo Real</h3>
                  <p className="text-[10px] text-gray-400">Seu socorro já está programado.</p>
                </div>

                <div className="bg-[#0d0d0d] p-3 rounded-none border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-white/40 uppercase tracking-wider font-bold">PRESTADOR DESIGNADO</p>
                    <p className="text-xs font-bold text-white uppercase tracking-tight">{selectedProposal.partnerName}</p>
                    <p className="text-[10px] text-white/40 mt-0.5 font-mono">{selectedProposal.estimatedTime} para chegada</p>
                  </div>
                  <div className={`w-8 h-8 rounded-none ${primaryBg}/10 border ${primaryBorder} flex items-center justify-center font-bold text-xs ${primaryAccent}`}>
                    VEX
                  </div>
                </div>

                {/* Progress Pipeline */}
                <div className="space-y-3 pl-4 relative before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
                  
                  {/* Pipeline Item 1 */}
                  <div className={`relative flex gap-3 text-xs ${trackerSubStep >= 1 ? 'text-white font-semibold' : 'text-gray-600'}`}>
                    <div className={`absolute -left-[17px] w-2.5 h-2.5 rounded-full border-2 ${trackerSubStep >= 1 ? `${primaryBg} border-neutral-950` : 'bg-neutral-900 border-neutral-800'}`} />
                    <div>
                      <p>Pagamento Aprovado com Sucesso</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">Dinheiro retido de forma segura</p>
                    </div>
                  </div>

                  {/* Pipeline Item 2 */}
                  <div className={`relative flex gap-3 text-xs ${trackerSubStep >= 2 ? 'text-white font-semibold' : 'text-gray-600'}`}>
                    <div className={`absolute -left-[17px] w-2.5 h-2.5 rounded-full border-2 ${trackerSubStep >= 2 ? `${primaryBg} border-neutral-950` : 'bg-neutral-900 border-neutral-800'}`} />
                    <div>
                      <p>Profissional em Deslocamento</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">Rotas monitoradas por PostGIS</p>
                    </div>
                  </div>

                  {/* Pipeline Item 3 */}
                  <div className={`relative flex gap-3 text-xs ${trackerSubStep >= 3 ? 'text-white font-semibold' : 'text-gray-600'}`}>
                    <div className={`absolute -left-[17px] w-2.5 h-2.5 rounded-full border-2 ${trackerSubStep >= 3 ? `${primaryBg} border-neutral-950` : 'bg-neutral-900 border-neutral-800'}`} />
                    <div>
                      <p>Serviço Sendo Executado no Local</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">Acompanhe o andamento</p>
                    </div>
                  </div>

                  {/* Pipeline Item 4 */}
                  <div className={`relative flex gap-3 text-xs ${trackerSubStep >= 4 ? 'text-white font-semibold' : 'text-gray-600'}`}>
                    <div className={`absolute -left-[17px] w-2.5 h-2.5 rounded-full border-2 ${trackerSubStep >= 4 ? 'bg-green-500 border-neutral-950' : 'bg-neutral-900 border-neutral-800'}`} />
                    <div>
                      <p className={trackerSubStep >= 4 ? 'text-green-400 font-bold' : ''}>Atendimento Concluído pelo Parceiro</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">Aguardando seu aval para liberação do saldo</p>
                    </div>
                  </div>

                </div>

                {/* Simulate steps progress button for demo purposes */}
                <div className="pt-2">
                  <button 
                    onClick={advanceTracker}
                    className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 border border-white/10 text-[10px] text-white/40 font-mono rounded-none flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 animate-spin text-white/40" />
                    Simular Próximo Passo
                  </button>
                </div>
              </div>

              {trackerSubStep === 4 ? (
                <button
                  onClick={advanceTracker}
                  className="w-full py-3 rounded-none text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-500 transition-all mt-4 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-widest"
                >
                  Confirmar e Avaliar
                  <CheckCircle2 className="w-4 h-4 text-black" />
                </button>
              ) : (
                <div className="mt-4 p-3 rounded-none bg-neutral-900/40 border border-white/10 text-center text-[10px] text-white/40">
                  Aguardando conclusão física do serviço...
                </div>
              )}
            </div>
          )}

          {/* STEP 6: EVALUATION / RATING */}
          {localStep === 6 && activeRequest && selectedProposal && (
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-none bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-none ${primaryBg}/10 ${primaryAccent}`}>ATENDIMENTO FINALIZADO</span>
                  <h3 className="text-sm font-extrabold text-white mt-2">Avalie o Atendimento</h3>
                  <p className="text-[10px] text-gray-400 max-w-xs mx-auto">Sua avaliação ajuda a manter a qualidade VEX e ajuda outros motoristas.</p>
                </div>

                {/* Star rating selector */}
                <div className="bg-[#0d0d0d] p-4 rounded-none border border-white/10 text-center space-y-3">
                  <p className="text-[10px] text-white/40">Como foi o serviço de <span className="font-bold text-white">{selectedProposal.partnerName}</span>?</p>
                  
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setStars(star)}
                        className="transition-transform active:scale-125 cursor-pointer"
                      >
                        <Star className={`w-8 h-8 ${star <= stars ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`} />
                      </button>
                    ))}
                  </div>

                  <span className="text-xs font-mono font-bold text-amber-400 block">{stars} de 5 Estrelas</span>
                </div>

                {/* Feedback Comment Box */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40">Relate sua experiência (Opcional):</label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Ex: Chegou super rápido! O profissional foi educado, tirou minhas dúvidas e resolveu o problema da bateria em 15 minutos."
                    rows={3}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-none p-3 text-xs focus:outline-none focus:border-current text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleSendRating}
                className={`w-full py-3.5 rounded-none text-xs font-bold text-black uppercase tracking-widest ${primaryBg} transition-all mt-4 flex items-center justify-center gap-1.5 cursor-pointer`}
              >
                Enviar Avaliação e Encerrar
                <Check className="w-4 h-4 text-black" />
              </button>
            </div>
          )}

        </div>

        {/* Home indicator bar (iPhone simulator style) */}
        <div className="bg-neutral-950 pb-2.5 pt-1.5 flex justify-center items-center shrink-0">
          <div className="w-24 h-1 bg-neutral-700 rounded-full" />
        </div>
      </div>
    </div>
  );
}
