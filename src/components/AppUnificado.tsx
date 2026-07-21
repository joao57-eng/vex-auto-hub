import React, { useState } from 'react';
import { Partner, OrderRequest } from '../types';
import { SERVICES_CATALOG } from '../mockData';
import { supabase } from '../lib/supabase';
import AppCliente from './AppCliente';
import AppParceiro from './AppParceiro';
import { Car, Wrench, ArrowLeft, Building2, Phone, MapPin } from 'lucide-react';

interface AppUnificadoProps {
  isRedTheme: boolean;
  partners: Partner[];
  setPartners: React.Dispatch<React.SetStateAction<Partner[]>>;
  activeRequest: OrderRequest | null;
  setActiveRequest: (req: OrderRequest | null) => void;
  transactions: any[];
  onAddTransaction: (tx: any) => void;
  onUpdatePartnerBalance: (partnerId: string, amount: number) => void;
  onUpdatePartnerRating: (partnerId: string, rating: number) => void;
  onRegisterPartner: (partner: Partner) => void;
}

export default function AppUnificado({
  isRedTheme,
  partners,
  setPartners,
  activeRequest,
  setActiveRequest,
  transactions,
  onAddTransaction,
  onUpdatePartnerBalance,
  onUpdatePartnerRating,
  onRegisterPartner
}: AppUnificadoProps) {
  const [profile, setProfile] = useState<'none' | 'cliente' | 'cadastro-parceiro' | 'parceiro'>('none');
  const [newPartnerId, setNewPartnerId] = useState<string | undefined>(undefined);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'São Paulo - SP',
    plan: 'Basic' as 'Basic' | 'Premium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const primaryAccent = isRedTheme ? 'text-[#E53E3E]' : 'text-[#C5A059]';
  const primaryBg = isRedTheme ? 'bg-[#E53E3E] hover:bg-[#c22d2d]' : 'bg-[#C5A059] hover:bg-[#b08e4d]';
  const primaryBorder = isRedTheme ? 'border-[#E53E3E]/30' : 'border-[#C5A059]/30';

  const handleSubmitCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setSubmitError('Preencha nome e telefone.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const { data, error } = await supabase
      .from('partners')
      .insert({
        name: formData.name,
        logo: formData.name.substring(0, 2).toUpperCase(),
        rating: 5.0,
        reviews_count: 0,
        services_offered: ['troca_bateria'],
        status: 'Pendente',
        plan: formData.plan,
        balance: 0.0,
        city: formData.city,
        phone: formData.phone,
        verified: false,
        lat: -23.5505 + (Math.random() - 0.5) * 0.1,
        lng: -46.6333 + (Math.random() - 0.5) * 0.1,
        monthly_fee_paid: formData.plan === 'Premium'
      })
      .select()
      .single();

    setIsSubmitting(false);

    if (error || !data) {
      console.error(error);
      setSubmitError('Não foi possível enviar seu cadastro. Tente novamente em instantes.');
      return;
    }

    const newPartner: Partner = {
      id: data.id,
      name: data.name,
      logo: data.logo,
      rating: data.rating,
      reviewsCount: data.reviews_count,
      servicesOffered: data.services_offered,
      status: data.status,
      plan: data.plan,
      balance: data.balance,
      city: data.city,
      phone: data.phone,
      verified: data.verified,
      lat: data.lat,
      lng: data.lng,
      monthlyFeePaid: data.monthly_fee_paid
    };

    onRegisterPartner(newPartner);
    setNewPartnerId(newPartner.id);
    setProfile('parceiro');
  };

  const resetToChoice = () => {
    setProfile('none');
    setNewPartnerId(undefined);
    setFormData({ name: '', phone: '', city: 'São Paulo - SP', plan: 'Basic' });
    setSubmitError(null);
  };

  if (profile === 'none') {
    return (
      <div className="flex flex-col items-center py-6">
        <div className="relative w-[340px] h-[680px] bg-neutral-900 rounded-[50px] border-[12px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col ring-4 ring-neutral-950">

          <div className="absolute top-0 inset-x-0 h-6 bg-neutral-800 rounded-b-2xl flex justify-center items-center z-30">
            <div className="w-16 h-4 bg-black rounded-full flex items-center justify-between px-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <div className="w-6 h-1 bg-neutral-800 rounded-full" />
              <span className="w-1 h-1 rounded-full bg-neutral-600" />
            </div>
          </div>

          <div className="bg-neutral-950 text-[10px] text-gray-500 px-6 pt-7 pb-1.5 flex justify-between items-center z-20 font-mono">
            <span>14:25</span>
            <span className="text-emerald-500">5G VEX</span>
          </div>

          <div className="flex-1 bg-neutral-950 text-white flex flex-col justify-center items-center px-6 font-sans">
            <div className={`w-16 h-16 ${primaryBg} flex items-center justify-center font-black text-black text-3xl rounded-none mb-4`}>
              V
            </div>
            <h2 className="text-lg font-extrabold tracking-tight text-center">VEX AUTO HUB</h2>
            <p className="text-[11px] text-white/40 italic text-center mt-1 mb-10">
              "Tudo para o seu carro. Em um só lugar."
            </p>

            <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-4">Como você quer entrar?</p>

            <button
              onClick={() => setProfile('cliente')}
              className={`w-full py-4 mb-3 border ${primaryBorder} bg-neutral-900 hover:bg-neutral-800 rounded-none flex items-center gap-3 px-4 transition-all cursor-pointer`}
            >
              <div className={`p-2 rounded-none bg-neutral-950 border ${primaryBorder}`}>
                <Car className={`w-5 h-5 ${primaryAccent}`} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white uppercase tracking-tight">Sou Cliente</p>
                <p className="text-[9px] text-white/40">Quero pedir um serviço para meu carro</p>
              </div>
            </button>

            <button
              onClick={() => setProfile('cadastro-parceiro')}
              className={`w-full py-4 border ${primaryBorder} bg-neutral-900 hover:bg-neutral-800 rounded-none flex items-center gap-3 px-4 transition-all cursor-pointer`}
            >
              <div className={`p-2 rounded-none bg-neutral-950 border ${primaryBorder}`}>
                <Wrench className={`w-5 h-5 ${primaryAccent}`} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white uppercase tracking-tight">Sou Parceiro</p>
                <p className="text-[9px] text-white/40">Sou prestador de serviço automotivo</p>
              </div>
            </button>
          </div>

          <div className="bg-neutral-950 pb-2.5 pt-1.5 flex justify-center items-center shrink-0">
            <div className="w-24 h-1 bg-neutral-700 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (profile === 'cadastro-parceiro') {
    return (
      <div className="flex flex-col items-center py-6">
        <div className="relative w-[340px] h-[680px] bg-neutral-900 rounded-[50px] border-[12px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col ring-4 ring-neutral-950">

          <div className="absolute top-0 inset-x-0 h-6 bg-neutral-800 rounded-b-2xl flex justify-center items-center z-30">
            <div className="w-16 h-4 bg-black rounded-full flex items-center justify-between px-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <div className="w-6 h-1 bg-neutral-800 rounded-full" />
              <span className="w-1 h-1 rounded-full bg-neutral-600" />
            </div>
          </div>

          <div className="bg-neutral-950 text-[10px] text-gray-500 px-6 pt-7 pb-1.5 flex justify-between items-center z-20 font-mono">
            <span>14:25</span>
            <span className="text-emerald-500">5G VEX</span>
          </div>

          <div className="flex-1 bg-neutral-950 text-white flex flex-col px-6 pt-4 pb-6 font-sans overflow-y-auto">
            <button
              onClick={resetToChoice}
              className="mb-4 text-[11px] text-white/50 hover:text-white flex items-center gap-1.5 font-mono w-fit cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              Voltar
            </button>

            <h2 className="text-base font-extrabold tracking-tight mb-1">Cadastro de Parceiro</h2>
            <p className="text-[10px] text-white/40 mb-5">Preencha seus dados para começar a receber pedidos.</p>

            <form onSubmit={handleSubmitCadastro} className="space-y-3">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3 h-3" /> Nome da Empresa / Prestador
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full bg-neutral-900 border ${primaryBorder} rounded-none px-3 py-2.5 text-xs text-white outline-none focus:border-white/40`}
                  placeholder="Ex: Oficina do João"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-1.5 mb-1">
                  <Phone className="w-3 h-3" /> Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full bg-neutral-900 border ${primaryBorder} rounded-none px-3 py-2.5 text-xs text-white outline-none focus:border-white/40`}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3 h-3" /> Cidade
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className={`w-full bg-neutral-900 border ${primaryBorder} rounded-none px-3 py-2.5 text-xs text-white outline-none focus:border-white/40`}
                />
              </div>

              <div>
  <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold mb-1 block">Plano</label>
  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => setFormData(prev => ({ ...prev, plan: 'Basic' }))}
      className={`flex-1 py-2.5 flex flex-col items-center border cursor-pointer ${formData.plan === 'Basic' ? `${primaryBg} text-black border-transparent` : 'bg-neutral-900 text-white/50 border-white/10'}`}
    >
      <span className="text-[10px] font-bold uppercase">Basic</span>
      <span className="text-[9px] font-mono mt-0.5">R$ 29,90/mês</span>
    </button>
    <button
      type="button"
      onClick={() => setFormData(prev => ({ ...prev, plan: 'Premium' }))}
      className={`flex-1 py-2.5 flex flex-col items-center border cursor-pointer ${formData.plan === 'Premium' ? `${primaryBg} text-black border-transparent` : 'bg-neutral-900 text-white/50 border-white/10'}`}
    >
      <span className="text-[10px] font-bold uppercase">Premium</span>
      <span className="text-[9px] font-mono mt-0.5">R$ 49,90/mês</span>
    </button>
  </div>
</div>

              {submitError && (
                <p className="text-[10px] text-red-400">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 mt-2 ${primaryBg} text-black font-bold text-xs uppercase tracking-widest rounded-none disabled:opacity-50 cursor-pointer`}
              >
                {isSubmitting ? 'Enviando...' : 'Concluir Cadastro'}
              </button>
            </form>
          </div>

          <div className="bg-neutral-950 pb-2.5 pt-1.5 flex justify-center items-center shrink-0">
            <div className="w-24 h-1 bg-neutral-700 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={resetToChoice}
        className="mb-3 text-[11px] text-white/50 hover:text-white flex items-center gap-1.5 font-mono bg-neutral-900 px-3 py-1.5 rounded-none border border-white/10 cursor-pointer"
      >
        <ArrowLeft className="w-3 h-3" />
        Trocar Perfil
      </button>

      {profile === 'cliente' ? (
        <AppCliente
          isRedTheme={isRedTheme}
          partners={partners}
          activeRequest={activeRequest}
          setActiveRequest={setActiveRequest}
          onAddTransaction={onAddTransaction}
          onUpdatePartnerBalance={onUpdatePartnerBalance}
          onUpdatePartnerRating={onUpdatePartnerRating}
        />
      ) : (
        <AppParceiro
          isRedTheme={isRedTheme}
          partners={partners}
          setPartners={setPartners}
          activeRequest={activeRequest}
          setActiveRequest={setActiveRequest}
          transactions={transactions}
          initialPartnerId={newPartnerId}
        />
      )}
    </div>
  );
}