import React, { useState } from 'react';
import { Partner, OrderRequest, BudgetProposal } from '../types';
import { SERVICES_CATALOG } from '../mockData';
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
  const [proposalSent, setProposalSent] = useState<boolean>(false);

  const primaryAccent = isRedTheme ? 'text-red-500' : 'text-amber-400';
  const primaryBg = isRedTheme ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-650';
  const primaryBorder = isRedTheme ? 'border-red-500/20' : 'border-amber-500/20';

  const currentPartner = partners.find(p => p.id === activePartnerId) || partners[0];

  const handlePayMonthlyFee = () => {
    setPartners(prev => prev.map(p => {
      if (p.id === activePartnerId) {
        return { ...p, monthlyFeePaid: true };
      }
      return p;
    }));
    alert(`Mensalidade do Plano ${currentPartner.plan} paga com sucesso! Sua conta agora está ativa.`);
  };

  const handleUpgradePlan = () => {
    setPartners(prev => prev.map(p => {
      if (p.id === activePartnerId) {
        return { ...p, plan: 'Premium', monthlyFeePaid: true };
      }
      return p;
    }));
    alert(`Parabéns! Sua empresa foi promovida ao plano PREMIUM. Maior visibilidade nas buscas de clientes e menor taxa de comissão.`);
  };

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;

    const newProposal: BudgetProposal = {
      partnerId: currentPartner.id,
      partnerName: currentPartner.name,
      partnerRating: currentPartner.rating,
      price: proposedPrice,
      estimatedTime: proposedEta,
      notes: proposedNotes,
      status: 'Pendente'
    };

    // Check if partner already bid
    const alreadyBid = activeRequest.proposals.some(p => p.partnerId === currentPartner.id);
    let updatedProposals = [...activeRequest.proposals];

    if (alreadyBid) {
      updatedProposals = updatedProposals.map(p => p.partnerId === currentPartner.id ? newProposal : p);
    } else {
      updatedProposals.push(newProposal);
    }

    const updatedRequest: OrderRequest = {
      ...activeRequest,
      status: 'OrçamentosRecebidos',
      proposals: updatedProposals
    };

    setActiveRequest(updatedRequest);
    setProposalSent(true);
    setTimeout(() => {
      setProposalSent(false);
    }, 4000);
  };

  // Filter service requests that match what this partner actually offers
  const partnerOffersService = activeRequest ? currentPartner.servicesOffered.includes(activeRequest.serviceId) : false;

  // Filter transactions related to this partner
  const partnerTx = transactions.filter(t => t.partnerName === currentPartner.name);

  return (
    <div className="flex flex-col items-center py-6">
      {/* Smartphone Chassis Frame */}
      <div className="relative w-[340px] h-[680px] bg-neutral-900 rounded-[50px] border-[12px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col ring-4 ring-neutral-950">
        
        {/* Notch */}
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

            {/* ACTIVE INCOMING REQUEST LISTENING */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-mono tracking-wider text-white/40 uppercase">Solicitações de Serviços na Região</h4>

              {currentPartner.status !== 'Ativo' ? (
                <div className="p-4 bg-neutral-900/40 border border-white/10 rounded-none text-center">
                  <AlertCircle className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                  <p className="text-[10px] text-white/40">Sua conta precisa estar ATIVA para receber chamados em tempo real.</p>
                </div>
              ) : activeRequest ? (
                partnerOffersService ? (
                  <div className="p-3 bg-neutral-900 border border-white/10 rounded-none space-y-3">
                    <div className="flex justify-between items-start pb-2 border-b border-white/10">
                      <div>
                        <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-none font-bold uppercase animate-pulse">NOVA SOLICITAÇÃO</span>
                        <h5 className="text-xs font-bold text-gray-200 mt-1 uppercase tracking-tight">
                          {SERVICES_CATALOG.find(s => s.id === activeRequest.serviceId)?.name || 'Serviço Automotivo'}
                        </h5>
                        <p className="text-[9px] text-white/40 mt-0.5 leading-normal">Cliente: {activeRequest.clientName}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-white/30 block">LOCALIDADE</span>
                        <span className="text-[9px] font-semibold text-gray-300 block max-w-[100px] truncate">{activeRequest.clientAddress}</span>
                      </div>
                    </div>

                    {/* Proposal Send Form */}
                    {proposalSent ? (
                      <div className="bg-neutral-950 p-3 rounded-none border border-green-500/20 text-center space-y-1">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                        <p className="text-[10px] text-green-400 font-bold">Proposta enviada!</p>
                        <p className="text-[8px] text-white/30">Aguardando aprovação do cliente no app dele.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSendProposal} className="space-y-3">
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

                        <button
                          type="submit"
                          className={`w-full py-2.5 rounded-none text-[10px] font-bold text-black uppercase tracking-wider ${primaryBg} transition-all flex items-center justify-center gap-1 cursor-pointer`}
                        >
                          <Send className="w-3 h-3 text-black" />
                          Enviar Orçamento
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-900/40 border border-white/10 rounded-none text-center">
                    <Clock className="w-5 h-5 mx-auto text-white/20 mb-1" />
                    <p className="text-[10px] text-white/40">Há solicitações ativas, mas sua empresa não oferece este serviço específico.</p>
                  </div>
                )
              ) : (
                <div className="p-4 bg-neutral-900/40 border border-white/10 rounded-none text-center">
                  <Clock className="w-5 h-5 mx-auto text-white/20 mb-1 animate-pulse" />
                  <p className="text-[10px] text-white/40">Aguardando chamados em {currentPartner.city}...</p>
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
