import React from 'react';
import { Partner, OrderRequest, FinancialTransaction } from '../types';
import { SERVICES_CATALOG } from '../mockData';
import { 
  Users, CheckCircle2, ShieldAlert, DollarSign, Award, AlertCircle, 
  Settings, RefreshCw, Layers, ShieldCheck, TrendingUp, Sparkles, Filter
} from 'lucide-react';

interface PainelAdminProps {
  isRedTheme: boolean;
  partners: Partner[];
  setPartners: React.Dispatch<React.SetStateAction<Partner[]>>;
  transactions: FinancialTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<FinancialTransaction[]>>;
  activeRequest: OrderRequest | null;
}

export default function PainelAdmin({
  isRedTheme,
  partners,
  setPartners,
  transactions,
  setTransactions,
  activeRequest
}: PainelAdminProps) {
  
  const primaryAccent = isRedTheme ? 'text-red-500' : 'text-amber-400';
  const primaryBg = isRedTheme ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600';
  const primaryBorder = isRedTheme ? 'border-red-500/20' : 'border-amber-500/20';
  const tableHeaderClass = isRedTheme ? 'bg-red-950/20 border-red-500/10' : 'bg-amber-500/10 border-amber-500/10';

  // Calculations for dashboard stats
  const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalCommissions = transactions.reduce((acc, t) => acc + t.commission, 0);
  const activePremiumCount = partners.filter(p => p.plan === 'Premium' && p.status === 'Ativo').length;
  // Estimate subscription revenue (R$ 149,90 per active premium and R$ 79,90 per active basic)
  const activeBasicCount = partners.filter(p => p.plan === 'Basic' && p.status === 'Ativo').length;
  const subscriptionRevenue = (activePremiumCount * 149.90) + (activeBasicCount * 79.90);

  // Administrative actions
  const handleApprovePartner = (id: string) => {
    setPartners(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: 'Ativo', verified: true, monthlyFeePaid: true };
      }
      return p;
    }));
  };

  const handleToggleVerify = (id: string) => {
    setPartners(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, verified: !p.verified };
      }
      return p;
    }));
  };

  const handleSuspendPartner = (id: string) => {
    setPartners(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'Suspenso' ? 'Ativo' : 'Suspenso' };
      }
      return p;
    }));
  };

  return (
    <div id="admin-panel" className="p-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
          <Settings className={`w-8 h-8 ${primaryAccent} animate-spin-slow`} />
          <h2 className="text-2xl font-bold tracking-tight">Painel Operacional Admin VEX</h2>
        </div>
        <p className="text-gray-400 text-sm max-w-2xl">
          Visão centralizada de controle. Audite cadastros de prestadores de serviços automotivos, configure comissões, gerencie planos de assinaturas e acompanhe o fluxo financeiro nacional.
        </p>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Stat 1 */}
        <div className="bg-[#0d0d0d] border border-white/10 p-5 rounded-none text-left relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-white/40 font-mono tracking-wider uppercase">Volume Bruto Transacionado</p>
              <h3 className="text-2xl font-black text-white mt-2">R$ {totalVolume.toFixed(2)}</h3>
            </div>
            <div className={`p-2 rounded-none bg-neutral-950 border ${primaryBorder}`}>
              <TrendingUp className={`w-5 h-5 ${primaryAccent}`} />
            </div>
          </div>
          <p className="text-[10px] text-white/30 mt-4 font-mono">Processado pelo Split de Pagamentos VEX</p>
        </div>

        {/* Stat 2 */}
        <div className="bg-[#0d0d0d] border border-white/10 p-5 rounded-none text-left relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-white/40 font-mono tracking-wider uppercase">Receita de Comissões (10%)</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-2">R$ {totalCommissions.toFixed(2)}</h3>
            </div>
            <div className="p-2 rounded-none bg-neutral-950 border border-emerald-500/20">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-[10px] text-white/30 mt-4 font-mono">Faturamento líquido retido de serviços</p>
        </div>

        {/* Stat 3 */}
        <div className="bg-[#0d0d0d] border border-white/10 p-5 rounded-none text-left relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-white/40 font-mono tracking-wider uppercase">Recorrente de Mensalidades (MRR)</p>
              <h3 className="text-2xl font-black text-purple-400 mt-2">R$ {subscriptionRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-2 rounded-none bg-neutral-950 border border-purple-500/20">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-[10px] text-white/30 mt-4 font-mono">Assinaturas estimadas de parceiros ativos</p>
        </div>

        {/* Stat 4 */}
        <div className="bg-[#0d0d0d] border border-white/10 p-5 rounded-none text-left relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-white/40 font-mono tracking-wider uppercase">Parceiros Premium Ativos</p>
              <h3 className="text-2xl font-black text-white mt-2">{activePremiumCount} / {partners.length}</h3>
            </div>
            <div className="p-2 rounded-none bg-neutral-950 border border-blue-500/20">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-[10px] text-white/30 mt-4 font-mono">Prioridade nas buscas e destaque</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Tabela de Gestão de Parceiros */}
        <div className="lg:col-span-8 bg-neutral-950 border border-white/10 rounded-none p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Controle de Parceiros e Oficinas</h3>
              <p className="text-xs text-white/40 mt-0.5">Autorize novos credenciamentos e monitore as vistorias técnicas.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-white/40 uppercase font-mono tracking-wider border-b border-white/10">
                  <th className="pb-3 pl-2">Parceiro</th>
                  <th className="pb-3">Plano</th>
                  <th className="pb-3">Cidade Base</th>
                  <th className="pb-3">Vistoria VEX</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs">
                {partners.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    
                    {/* Name/Logo */}
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-[11px] text-gray-400">
                          {p.logo}
                        </div>
                        <div>
                          <p className="font-bold text-gray-200 uppercase tracking-tight">{p.name}</p>
                          <p className="text-[10px] text-white/40 font-mono">{p.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-none font-mono text-[10px] font-bold ${
                        p.plan === 'Premium' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-white/10 text-white/40 border border-white/10'
                      }`}>
                        {p.plan}
                      </span>
                    </td>

                    {/* City */}
                    <td className="py-3.5 text-gray-400">{p.city}</td>

                    {/* Vistoria */}
                    <td className="py-3.5">
                      <button 
                        onClick={() => handleToggleVerify(p.id)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none font-mono text-[10px] font-bold cursor-pointer transition-all ${
                          p.verified 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                        }`}
                        title="Clique para alternar o selo de vistoria"
                      >
                        {p.verified ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        {p.verified ? 'Verificado' : 'Não vistoriado'}
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-none font-bold text-[10px] uppercase ${
                        p.status === 'Ativo' ? 'bg-green-500/10 text-green-400' :
                        p.status === 'Pendente' ? 'bg-amber-500/10 text-amber-550 animate-pulse' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 text-right pr-2">
                      <div className="flex justify-end gap-1.5">
                        {p.status === 'Pendente' ? (
                          <button
                            onClick={() => handleApprovePartner(p.id)}
                            className={`px-3 py-1 bg-green-600 hover:bg-green-500 text-black font-bold text-[10px] rounded-none transition-colors cursor-pointer uppercase tracking-wider`}
                          >
                            Aprovar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspendPartner(p.id)}
                            className={`px-2.5 py-1 border rounded-none text-[10px] font-bold transition-colors cursor-pointer uppercase tracking-wider ${
                              p.status === 'Suspenso' 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' 
                                : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            }`}
                          >
                            {p.status === 'Suspenso' ? 'Ativar' : 'Suspender'}
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auditoria Financeira de Split */}
        <div className="lg:col-span-4 bg-[#0d0d0d] border border-white/10 rounded-none p-5 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-tight">
              <DollarSign className="w-4 h-4 text-green-400" />
              Auditoria de Transações
            </h3>
            <p className="text-xs text-white/40 mt-1">Veja a comissão de 10% da VEX sendo retida de forma auditável e transparente.</p>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-3 bg-neutral-950 rounded-none border border-white/10 space-y-2">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <span className="text-[8px] bg-neutral-900 text-gray-500 px-1.5 py-0.5 rounded-none font-mono uppercase">{tx.id}</span>
                    <p className="font-bold text-gray-200 mt-1 uppercase tracking-tight">{tx.partnerName}</p>
                    <p className="text-[9px] text-white/40">{tx.serviceName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-white font-bold">R$ {tx.amount.toFixed(2)}</p>
                    <span className="text-[9px] text-emerald-450 font-mono font-semibold uppercase">{tx.status}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[9px] font-mono text-gray-500">
                  <div className="bg-neutral-900/60 p-1.5 rounded-none">
                    <span className="block text-[8px] text-white/30 font-bold">RETENÇÃO VEX (10%)</span>
                    <span className={`font-bold ${primaryAccent}`}>+ R$ {tx.commission.toFixed(2)}</span>
                  </div>
                  <div className="bg-neutral-900/60 p-1.5 rounded-none">
                    <span className="block text-[8px] text-white/30 font-bold">REPASSE PARCEIRO</span>
                    <span className="font-bold text-emerald-450">+ R$ {tx.repass.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Order Listening Indicator */}
          {activeRequest && (
            <div className="p-3.5 bg-neutral-950 border border-white/10 rounded-none">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Monitoramento em Tempo Real</h4>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed">
                ID do Pedido: <code className="text-gray-300 font-mono">{activeRequest.id}</code> está no passo <strong className="text-amber-400">{activeRequest.activeStep} de 6</strong> ({activeRequest.status}). 
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
