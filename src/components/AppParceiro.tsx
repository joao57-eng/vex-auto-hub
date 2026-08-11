import React, { useState, useEffect } from 'react';
import { Partner, OrderRequest, BudgetProposal } from '../types';
import { SERVICES_CATALOG } from '../mockData';
import { supabase } from '../lib/supabase';
import { 
  Building2, ShieldCheck, DollarSign, Briefcase, Star, Clock, AlertCircle,
  TrendingUp, Settings, FileText, CheckCircle2, ChevronRight, Send, HelpCircle, ArrowUpRight
} from 'lucide-react';

interface AppParceiroProps {
  isRedTheme: boolean;
  partners: Partner[];
  setPartners: React.Dispatch<React.SetStateAction<Partner[]>>;
  activeRequest: OrderRequest | null;
  setActiveRequest: (req: OrderRequest | null) => void;
  transactions: any[];
  initialPartnerId?: string;
}

export default function AppParceiro({
  isRedTheme,
  partners,
  setPartners,
  activeRequest,
  setActiveRequest,
  transactions,
  initialPartnerId
}: AppParceiroProps) {
  // Act as specific partner
  const [activePartnerId, setActivePartnerId] = useState<string>(initialPartnerId || 'p_1');
  
  // Proposal input fields
  const [proposedPrice, setProposedPrice] = useState<number>(180);
  const [proposedEta, setProposedEta] = useState<string>('20-30 min');
  const [proposedNotes, setProposedNotes] = useState<string>('Dispomos de equipamentos calibrados de alta precisão e garantia.');

  // Pedidos reais vindos do Supabase, esperando orçamento
  const [pendingRequests, setPendingRequests] = useState<OrderRequest[]>([]);
  // Orçamentos que este parceiro já enviou, indexados por order_request_id
  const [myProposals, setMyProposals] = useState<Record<string, BudgetProposal>>({});
  // Qual pedido está com o formulário de orçamento aberto no momento
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  const primaryAccent = isRedTheme ? 'text-red-500' : 'text-amber-400';
  const primaryBg = isRedTheme ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-650';
  const primaryBorder = isRedTheme ? 'border-red-500/20' : 'border-amber-500/20';

  // Pedidos aceitos que o parceiro já "confirmou ciência" (saiu da tela de celebração)
  const [dismissedJobIds, setDismissedJobIds] = useState<Set<string>>(new Set());

  // Preços fixos: qual serviço está sendo editado agora, e os campos do formulário
  const [editingPriceServiceId, setEditingPriceServiceId] = useState<string | null>(null);
  const [priceFormValue, setPriceFormValue] = useState<number>(0);
  const [priceFormEta, setPriceFormEta] = useState<string>('20-30 min');

  const currentPartner = partners.find(p => p.id === activePartnerId) || partners[0];

  if (!currentPartner) {
    return (
      <div className="flex flex-col items-center py-6 vex-phone-outer">
        <div className="relative w-[340px] h-[680px] bg-neutral-900 rounded-[50px] border-[12px] border-neutral-800 shadow-2xl overflow-hidden flex items-center justify-center ring-4 ring-neutral-950 vex-phone-chassis">
          <p className="text-xs text-white/40">Carregando parceiros...</p>
        </div>
      </div>
    );
  }

  const handlePayMonthlyFee = async () => {
    setPartners(prev => prev.map(p => {
      if (p.id === activePartnerId) {
        return { ...p, monthlyFeePaid: true };
      }
      return p;
    }));

    await supabase
      .from('partners')
      .update({ monthly_fee_paid: true })
      .eq('id', activePartnerId);

    alert(`Mensalidade do Plano ${currentPartner.plan} paga com sucesso! Sua conta agora está ativa.`);
  };

  const handleUpgradePlan = async () => {
    setPartners(prev => prev.map(p => {
      if (p.id === activePartnerId) {
        return { ...p, plan: 'Premium', monthlyFeePaid: true };
      }
      return p;
    }));

    await supabase
      .from('partners')
      .update({ plan: 'Premium', monthly_fee_paid: true })
      .eq('id', activePartnerId);

    alert(`Parabéns! Sua empresa foi promovida ao plano PREMIUM. Maior visibilidade nas buscas de clientes e menor taxa de comissão.`);
  };

  // Busca pedidos reais aguardando orçamento, e escuta novos pedidos em tempo real
  useEffect(() => {
    let isMounted = true;

    const fetchPending = async () => {
      const { data, error } = await supabase
        .from('order_requests')
        .select('*')
        .in('status', ['AguardandoOrçamentos', 'OrçamentosRecebidos', 'PagamentoPendente', 'EmAndamento'])
        .order('created_at', { ascending: false });

      if (error || !data || !isMounted) return;

      const mapped: OrderRequest[] = data.map((row: any) => ({
        id: row.id,
        clientName: row.client_name,
        clientPhone: row.client_phone,
        clientAddress: row.client_address,
        serviceId: row.service_id,
        status: row.status,
        activeStep: row.active_step,
        proposals: [],
        selectedPartnerId: row.selected_partner_id,
        createdAt: new Date(row.created_at).toLocaleDateString('pt-BR')
      }));

      setPendingRequests(mapped);
    };

    fetchPending();

    const channel = supabase
      .channel('order-requests-listen')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_requests' }, () => {
        fetchPending();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Busca os orçamentos que este parceiro já enviou, para saber quais pedidos já respondeu
  useEffect(() => {
    if (!currentPartner?.id) return;

    const fetchMyProposals = async () => {
      const { data, error } = await supabase
        .from('budget_proposals')
        .select('*')
        .eq('partner_id', currentPartner.id);

      if (error || !data) return;

      const map: Record<string, BudgetProposal> = {};
      data.forEach((row: any) => {
        map[row.order_request_id] = {
          partnerId: row.partner_id,
          partnerName: row.partner_name,
          partnerRating: row.partner_rating,
          price: row.price,
          estimatedTime: row.estimated_time,
          notes: row.notes,
          status: row.status
        };
      });
      setMyProposals(map);
    };

    fetchMyProposals();
  }, [currentPartner?.id, pendingRequests]);

  const handleSendProposal = async (e: React.FormEvent, requestId: string) => {
    e.preventDefault();

    const existing = myProposals[requestId];

    if (existing) {
      // Já enviou antes: atualiza o orçamento existente
      const { error } = await supabase
        .from('budget_proposals')
        .update({ price: proposedPrice, estimated_time: proposedEta, notes: proposedNotes })
        .eq('order_request_id', requestId)
        .eq('partner_id', currentPartner.id);

      if (error) {
        console.error(error);
        alert('Não foi possível atualizar sua proposta. Tente novamente.');
        return;
      }
    } else {
      // Primeira vez respondendo este pedido: cria o orçamento
      const { error } = await supabase
        .from('budget_proposals')
        .insert({
          order_request_id: requestId,
          partner_id: currentPartner.id,
          partner_name: currentPartner.name,
          partner_rating: currentPartner.rating,
          price: proposedPrice,
          estimated_time: proposedEta,
          notes: proposedNotes,
          status: 'Pendente'
        });

      if (error) {
        console.error(error);
        alert('Não foi possível enviar sua proposta. Tente novamente.');
        return;
      }

      await supabase
        .from('order_requests')
        .update({ status: 'OrçamentosRecebidos' })
        .eq('id', requestId);
    }

    setMyProposals(prev => ({
      ...prev,
      [requestId]: {
        partnerId: currentPartner.id,
        partnerName: currentPartner.name,
        partnerRating: currentPartner.rating,
        price: proposedPrice,
        estimatedTime: proposedEta,
        notes: proposedNotes,
        status: 'Pendente'
      }
    }));

    setExpandedRequestId(null);
  };

  const handleSaveFixedPrice = async (serviceId: string) => {
    const updatedPrices = {
      ...(currentPartner.fixedPrices || {}),
      [serviceId]: { price: priceFormValue, estimatedTime: priceFormEta }
    };

    setPartners(prev => prev.map(p => p.id === currentPartner.id ? { ...p, fixedPrices: updatedPrices } : p));

    await supabase
      .from('partners')
      .update({ fixed_prices: updatedPrices })
      .eq('id', currentPartner.id);

    setEditingPriceServiceId(null);
  };

  const handleRemoveFixedPrice = async (serviceId: string) => {
    const updatedPrices = { ...(currentPartner.fixedPrices || {}) };
    delete updatedPrices[serviceId];

    setPartners(prev => prev.map(p => p.id === currentPartner.id ? { ...p, fixedPrices: updatedPrices } : p));

    await supabase
      .from('partners')
      .update({ fixed_prices: updatedPrices })
      .eq('id', currentPartner.id);
  };

  // Pedidos que batem com os serviços que este parceiro oferece
  // Pedidos que batem com os serviços que este parceiro oferece, e ainda aguardam orçamento
  const relevantRequests = pendingRequests.filter(r => 
    currentPartner.servicesOffered.includes(r.serviceId) && 
    (r.status === 'AguardandoOrçamentos' || r.status === 'OrçamentosRecebidos')
  );

  // Pedidos onde o CLIENTE JÁ ACEITOU o orçamento deste parceiro específico
  const acceptedJobs = pendingRequests.filter(r => r.selectedPartnerId === currentPartner.id);

  // Filter transactions related to this partner
  const partnerTx = transactions.filter(t => t.partnerName === currentPartner.name);

  // Pega o pedido aceito mais recente que ainda não foi "visto" pelo parceiro
  const jobToCelebrate = acceptedJobs.find(j => !dismissedJobIds.has(j.id));

  // TELA CHEIA: Cliente aceitou o orçamento!
  if (jobToCelebrate) {
    const proposal = myProposals[jobToCelebrate.id];
    const serviceName = SERVICES_CATALOG.find(s => s.id === jobToCelebrate.serviceId)?.name || 'Serviço Automotivo';

    return (
      <div className="flex flex-col items-center py-6 vex-phone-outer">
        <div className="relative w-[340px] h-[680px] bg-neutral-900 rounded-[50px] border-[12px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col ring-4 ring-neutral-950 vex-phone-chassis">

          <div className="absolute top-0 inset-x-0 h-6 bg-neutral-800 rounded-b-2xl flex justify-center items-center z-30 vex-phone-decor">
            <div className="w-16 h-4 bg-black rounded-full flex items-center justify-between px-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <div className="w-6 h-1 bg-neutral-800 rounded-full" />
              <span className="w-1 h-1 rounded-full bg-neutral-600" />
            </div>
          </div>

          <div className="bg-neutral-950 text-[10px] text-gray-500 px-6 pt-7 pb-1.5 flex justify-between items-center z-20 font-mono vex-phone-decor">
            <span>14:25</span>
            <span className="text-emerald-500">5G VEX</span>
          </div>

          <div className="flex-1 bg-gradient-to-b from-emerald-500/10 via-neutral-950 to-neutral-950 text-white flex flex-col px-6 pt-8 pb-6 font-sans overflow-y-auto">

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4 animate-pulse">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-lg font-extrabold tracking-tight">Serviço Aceito!</h2>
              <p className="text-[10px] text-white/50 mt-1">O cliente escolheu o seu orçamento. Prepare-se para atender.</p>
            </div>

            <div className="bg-neutral-900 border border-white/10 rounded-none p-4 space-y-3 mb-4">
              <div>
                <span className="text-[8px] uppercase tracking-wider text-white/30 font-bold">Serviço</span>
                <p className="text-sm font-bold text-gray-100 uppercase tracking-tight">{serviceName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-white/30 font-bold">Valor Combinado</span>
                  <p className="text-sm font-bold text-emerald-400">R$ {proposal ? proposal.price.toFixed(2) : '—'}</p>
                </div>
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-white/30 font-bold">Tempo Estimado</span>
                  <p className="text-sm font-bold text-gray-200">{proposal ? proposal.estimatedTime : '—'}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-white/10 rounded-none p-4 space-y-2.5 mb-6">
              <p className="text-[9px] uppercase tracking-wider text-white/30 font-bold mb-1">Dados do Cliente</p>
              <div>
                <span className="text-[8px] text-white/30 block">Nome</span>
                <p className="text-xs font-semibold text-gray-200">{jobToCelebrate.clientName}</p>
              </div>
              <div>
                <span className="text-[8px] text-white/30 block">Telefone</span>
                <p className="text-xs font-semibold text-gray-200">{jobToCelebrate.clientPhone}</p>
              </div>
              <div>
                <span className="text-[8px] text-white/30 block">Endereço</span>
                <p className="text-xs font-semibold text-gray-200">{jobToCelebrate.clientAddress}</p>
              </div>
            </div>

            {jobToCelebrate.clientPhone && (
              <a
                href={`tel:${jobToCelebrate.clientPhone.replace(/\D/g, '')}`}
                className={`w-full py-3 mb-2.5 ${primaryBg} text-black font-bold text-xs uppercase tracking-widest rounded-none flex items-center justify-center gap-2 cursor-pointer`}
              >
                Ligar para o Cliente
              </a>
            )}

            <button
              onClick={() => setDismissedJobIds(prev => new Set(prev).add(jobToCelebrate.id))}
              className="w-full py-3 border border-white/10 text-white/60 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-none cursor-pointer"
            >
              Ir para o Painel
            </button>
          </div>

          <div className="bg-neutral-950 pb-2.5 pt-1.5 flex justify-center items-center shrink-0 vex-phone-decor">
            <div className="w-24 h-1 bg-neutral-700 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6 vex-phone-outer">
      {/* Smartphone Chassis Frame */}
      <div className="relative w-[340px] h-[680px] bg-neutral-900 rounded-[50px] border-[12px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col ring-4 ring-neutral-950 vex-phone-chassis">
        
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-6 bg-neutral-800 rounded-b-2xl flex justify-center items-center z-30 vex-phone-decor">
          <div className="w-16 h-4 bg-black rounded-full flex items-center justify-between px-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <div className="w-6 h-1 bg-neutral-800 rounded-full" />
            <span className="w-1 h-1 rounded-full bg-neutral-600" />
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-neutral-950 text-[10px] text-gray-500 px-6 pt-7 pb-1.5 flex justify-between items-center z-20 font-mono vex-phone-decor">
          <span>14:25</span>
          <span className="text-yellow-500">PAINEL PARCEIRO</span>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 bg-neutral-950 text-white flex flex-col overflow-y-auto font-sans">
          
          {/* Header & Act-As Dropdown Selector */}
          <div className="px-4 py-3 bg-neutral-900/60 border-b border-white/10 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-mono tracking-wider text-white/40 uppercase font-bold">OPERAR COMO:</span>
              <select
                value={activePartnerId}
                onChange={(e) => setActivePartnerId(e.target.value)}
                className={`bg-neutral-950 border border-white/10 rounded-none text-[10px] py-1 px-2 focus:outline-none focus:border-current ${primaryAccent} font-bold max-w-[180px]`}
              >
                {partners.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 space-y-4 flex-1">
            
            {/* Header Partner Info Badge */}
            <div className="bg-neutral-900 rounded-none p-3.5 border border-white/10 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-none bg-neutral-950 border ${primaryBorder} flex items-center justify-center font-black text-sm text-gray-200`}>
                  {currentPartner.logo}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">{currentPartner.name}</h4>
                    {currentPartner.verified && (
                      <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-1 py-0.5 rounded-none font-mono font-bold uppercase">VEX</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[9px] text-white/40">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      {currentPartner.rating.toFixed(2)}
                    </span>
                    <span>•</span>
                    <span>{currentPartner.city}</span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className="mt-3 pt-2.5 border-t border-neutral-850 flex justify-between items-center text-[9px]">
                <span className="text-gray-500">Plano: <strong className="text-white font-mono">{currentPartner.plan}</strong></span>
                <span className="text-gray-500">Status: <strong className={currentPartner.status === 'Ativo' ? 'text-green-400' : 'text-amber-500'}>{currentPartner.status}</strong></span>
                <span className="text-gray-500">Mensalidade: <strong className={currentPartner.monthlyFeePaid ? 'text-green-400' : 'text-red-400'}>{currentPartner.monthlyFeePaid ? 'Paga' : 'Vencida'}</strong></span>
              </div>
            </div>

            {/* Quick Actions (Subscription rules) */}
            {(!currentPartner.monthlyFeePaid || currentPartner.plan === 'Basic' || currentPartner.status === 'Pendente') && (
              <div className="p-3 rounded-none bg-neutral-900/60 border border-white/10 space-y-2">
                <p className="text-[10px] text-gray-300 font-semibold flex items-center gap-1 uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-550" />
                  Ações Pendentes do Parceiro
                </p>
                
                {currentPartner.status === 'Pendente' && (
                  <p className="text-[9px] text-white/40 leading-normal">
                    Seu cadastro está em análise pela VEX. Acesse o <strong>Painel Admin</strong> no topo para aprovar sua conta.
                  </p>
                )}

                {currentPartner.status === 'Ativo' && !currentPartner.monthlyFeePaid && (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <p className="text-[9px] text-red-400">Mensalidade em aberto para manter a conta visível.</p>
                    <button 
                      onClick={handlePayMonthlyFee}
                      className={`px-2 py-1 rounded-none text-[9px] font-bold text-black ${primaryBg} cursor-pointer uppercase tracking-wider`}
                    >
                      Pagar R$ 99
                    </button>
                  </div>
                )}

                {currentPartner.status === 'Ativo' && currentPartner.plan === 'Basic' && (
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 mt-1">
                    <p className="text-[9px] text-white/40">Upgrade para Premium (Mais orçamentos).</p>
                    <button 
                      onClick={handleUpgradePlan}
                      className="px-2 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/25 rounded-none text-[9px] font-bold cursor-pointer uppercase tracking-wider"
                    >
                      Premium
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Wallet Balance Display */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-900 p-3.5 rounded-none border border-white/10 text-left">
                <p className="text-[9px] text-white/40 uppercase tracking-wider font-bold">CARTEIRA VEX</p>
                <p className="text-sm font-extrabold text-emerald-400 mt-1">R$ {currentPartner.balance.toFixed(2)}</p>
                <span className="text-[8px] text-white/30 block mt-0.5">Disponível para saque</span>
              </div>
              
              <div className="bg-neutral-900 p-3.5 rounded-none border border-white/10 text-left flex flex-col justify-between">
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider font-bold">MENSALIDADE</p>
                  <p className="text-[10px] font-bold text-gray-300 mt-1">R$ {currentPartner.plan === 'Premium' ? '149,90' : '79,90'}/mês</p>
                </div>
                <span className="text-[8px] text-white/30">Recorrente automático</span>
              </div>
            </div>

            {/* MEUS PREÇOS FIXOS */}
            <div className="space-y-2">
              <div>
                <h4 className="text-[10px] font-mono tracking-wider text-white/40 uppercase">Meus Preços Fixos</h4>
                <p className="text-[9px] text-white/30 mt-0.5">Opcional. Defina um preço fixo por serviço para pular a etapa de orçamento — o cliente já vê o valor e paga na hora, como em apps de transporte. Sem preço fixo, você continua recebendo pedidos para orçar manualmente.</p>
              </div>

              <div className="space-y-1.5">
                {currentPartner.servicesOffered.map((serviceId) => {
                  const service = SERVICES_CATALOG.find(s => s.id === serviceId);
                  const fixedPrice = currentPartner.fixedPrices?.[serviceId];
                  const isEditing = editingPriceServiceId === serviceId;

                  return (
                    <div key={serviceId} className="p-2.5 bg-neutral-900 border border-white/10 rounded-none">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-gray-200 uppercase tracking-tight">{service?.name || serviceId}</p>
                        {!isEditing && (
                          fixedPrice ? (
                            <span className="text-[10px] font-bold text-emerald-400">R$ {fixedPrice.price.toFixed(2)}</span>
                          ) : (
                            <span className="text-[9px] text-white/30">Sem preço fixo</span>
                          )
                        )}
                      </div>

                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[8px] text-white/30 mb-1">Preço (R$):</label>
                              <input
                                type="number"
                                value={priceFormValue}
                                onChange={(e) => setPriceFormValue(parseFloat(e.target.value) || 0)}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-none px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-current"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] text-white/30 mb-1">Tempo Estimado:</label>
                              <select
                                value={priceFormEta}
                                onChange={(e) => setPriceFormEta(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-none px-2 py-1 text-xs text-white focus:outline-none focus:border-current"
                              >
                                <option value="15-25 min">15-25 min</option>
                                <option value="25-40 min">25-40 min</option>
                                <option value="40-60 min">40-60 min</option>
                                <option value="Agendar">Agendar</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingPriceServiceId(null)}
                              className="flex-1 py-1.5 text-[9px] font-bold text-white/50 uppercase border border-white/10 cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveFixedPrice(serviceId)}
                              className={`flex-1 py-1.5 text-[9px] font-bold text-black uppercase ${primaryBg} cursor-pointer`}
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPriceFormValue(fixedPrice?.price || 150);
                              setPriceFormEta(fixedPrice?.estimatedTime || '20-30 min');
                              setEditingPriceServiceId(serviceId);
                            }}
                            className="text-[9px] text-white/40 hover:text-white underline cursor-pointer"
                          >
                            {fixedPrice ? 'Editar preço' : 'Definir preço fixo'}
                          </button>
                          {fixedPrice && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFixedPrice(serviceId)}
                              className="text-[9px] text-red-400/70 hover:text-red-400 underline cursor-pointer"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PEDIDOS ACEITOS PELO CLIENTE */}
            {acceptedJobs.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase">🎉 Cliente Aceitou seu Orçamento!</h4>
                {acceptedJobs.map((job) => (
                  <div key={job.id} className="p-3 bg-emerald-500/5 border border-emerald-500/30 rounded-none space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-none font-bold uppercase">
                          {job.status === 'PagamentoPendente' ? 'AGUARDANDO PAGAMENTO' : 'SERVIÇO EM ANDAMENTO'}
                        </span>
                        <h5 className="text-xs font-bold text-gray-200 mt-1 uppercase tracking-tight">
                          {SERVICES_CATALOG.find(s => s.id === job.serviceId)?.name || 'Serviço Automotivo'}
                        </h5>
                        <p className="text-[9px] text-white/50 mt-0.5">Cliente: {job.clientName} • {job.clientPhone}</p>
                        <p className="text-[9px] text-white/40">{job.clientAddress}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ACTIVE INCOMING REQUEST LISTENING */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-mono tracking-wider text-white/40 uppercase">Solicitações de Serviços na Região</h4>

              {currentPartner.status !== 'Ativo' ? (
                <div className="p-4 bg-neutral-900/40 border border-white/10 rounded-none text-center">
                  <AlertCircle className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                  <p className="text-[10px] text-white/40">Sua conta precisa estar ATIVA para receber chamados em tempo real.</p>
                </div>
              ) : relevantRequests.length === 0 ? (
                <div className="p-4 bg-neutral-900/40 border border-white/10 rounded-none text-center">
                  <Clock className="w-5 h-5 mx-auto text-white/20 mb-1 animate-pulse" />
                  <p className="text-[10px] text-white/40">Aguardando chamados em {currentPartner.city}...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {relevantRequests.map((req) => {
                    const alreadySent = !!myProposals[req.id];
                    const isExpanded = expandedRequestId === req.id;

                    return (
                      <div key={req.id} className="p-3 bg-neutral-900 border border-white/10 rounded-none space-y-3">
                        <div className="flex justify-between items-start pb-2 border-b border-white/10">
                          <div>
                            <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-none font-bold uppercase animate-pulse">NOVA SOLICITAÇÃO</span>
                            <h5 className="text-xs font-bold text-gray-200 mt-1 uppercase tracking-tight">
                              {SERVICES_CATALOG.find(s => s.id === req.serviceId)?.name || 'Serviço Automotivo'}
                            </h5>
                            <p className="text-[9px] text-white/40 mt-0.5 leading-normal">Cliente: {req.clientName}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] text-white/30 block">LOCALIDADE</span>
                            <span className="text-[9px] font-semibold text-gray-300 block max-w-[100px] truncate">{req.clientAddress}</span>
                          </div>
                        </div>

                        {alreadySent ? (
                          <div className="bg-neutral-950 p-3 rounded-none border border-green-500/20 text-center space-y-1">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                            <p className="text-[10px] text-green-400 font-bold">Proposta enviada!</p>
                            <p className="text-[8px] text-white/30">R$ {myProposals[req.id].price.toFixed(2)} • {myProposals[req.id].estimatedTime}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setProposedPrice(myProposals[req.id].price);
                                setProposedEta(myProposals[req.id].estimatedTime);
                                setProposedNotes(myProposals[req.id].notes);
                                setExpandedRequestId(req.id);
                              }}
                              className="text-[9px] text-white/40 underline cursor-pointer"
                            >
                              Editar proposta
                            </button>
                          </div>
                        ) : isExpanded ? (
                          <form onSubmit={(e) => handleSendProposal(e, req.id)} className="space-y-3">
                            <p className="text-[9px] text-white/40 font-semibold uppercase tracking-wider">Preencha seu Orçamento:</p>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[8px] text-white/30 mb-1">Preço Proposto (R$):</label>
                                <input
                                  type="number"
                                  required
                                  value={proposedPrice}
                                  onChange={(e) => setProposedPrice(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-none px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-current"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] text-white/30 mb-1">Tempo Previsto:</label>
                                <select
                                  value={proposedEta}
                                  onChange={(e) => setProposedEta(e.target.value)}
                                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-none px-2 py-1 text-xs text-white focus:outline-none focus:border-current"
                                >
                                  <option value="15-25 min">15-25 min</option>
                                  <option value="25-40 min">25-40 min</option>
                                  <option value="40-60 min">40-60 min</option>
                                  <option value="Agendar">Agendar</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[8px] text-white/30 mb-1">Notas adicionais ou Termos:</label>
                              <input
                                type="text"
                                value={proposedNotes}
                                onChange={(e) => setProposedNotes(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-none px-2 py-1 text-[10px] text-gray-300 focus:outline-none focus:border-current"
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setExpandedRequestId(null)}
                                className="flex-1 py-2.5 rounded-none text-[10px] font-bold text-white/50 uppercase tracking-wider border border-white/10 cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                className={`flex-1 py-2.5 rounded-none text-[10px] font-bold text-black uppercase tracking-wider ${primaryBg} transition-all flex items-center justify-center gap-1 cursor-pointer`}
                              >
                                <Send className="w-3 h-3 text-black" />
                                Enviar
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setProposedPrice(180);
                              setProposedEta('20-30 min');
                              setProposedNotes('Dispomos de equipamentos calibrados de alta precisão e garantia.');
                              setExpandedRequestId(req.id);
                            }}
                            className={`w-full py-2.5 rounded-none text-[10px] font-bold text-black uppercase tracking-wider ${primaryBg} transition-all flex items-center justify-center gap-1 cursor-pointer`}
                          >
                            <Send className="w-3 h-3 text-black" />
                            Responder com Orçamento
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RECENT SETTLEMENT TRANSACTIONS FOR THIS PARTNER */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-mono tracking-wider text-white/40 uppercase">Histórico de Repasses Recebidos</h4>
              
              {partnerTx.length > 0 ? (
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                  {partnerTx.map((tx) => (
                    <div key={tx.id} className="p-2.5 bg-neutral-900 rounded-none border border-white/10 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-gray-200 uppercase tracking-tight">{tx.serviceName}</p>
                        <p className="text-[8px] text-white/30">{tx.date} • Split Seguro VEX</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-450 font-mono font-bold">+ R$ {tx.repass.toFixed(2)}</p>
                        <p className="text-[8px] text-white/30 font-mono">Dedução VEX: R$ {tx.commission.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-neutral-900/30 rounded-none border border-white/10 text-center text-[10px] text-white/40">
                  Nenhuma transação financeira efetuada nesta simulação ainda.
                </div>
              )}
            </div>

          </div>

          {/* Bottom Bar Indicator */}
          <div className="bg-neutral-950 pb-2.5 pt-1 flex justify-center items-center shrink-0 border-t border-neutral-900">
            <div className="w-24 h-1 bg-neutral-700 rounded-full" />
          </div>

        </div>
      </div>
    </div>
  );
}
