import React, { useState } from 'react';
import { SERVICES_CATALOG } from '../mockData';
import { Partner } from '../types';
import { supabase } from '../lib/supabase';
import { Sparkles, CheckCircle2, ChevronRight, Play, ArrowRight, ShieldCheck, DollarSign, Smartphone, Users, MapPin, Star, Building2, Phone } from 'lucide-react';

interface SiteProps {
  isRedTheme: boolean;
  onRegisterPartner: (partner: Partner) => void;
  onNavigateTo: (screen: string) => void;
  partnersCount: number;
}

export default function SiteInstitucional({ isRedTheme, onRegisterPartner, onNavigateTo, partnersCount }: SiteProps) {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'São Paulo - SP',
    plan: 'Premium' as 'Basic' | 'Premium',
    selectedServices: [] as string[]
  });
 const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const primaryAccent = isRedTheme ? 'text-[#E53E3E]' : 'text-[#C5A059]';
  const primaryBg = isRedTheme ? 'bg-[#E53E3E] hover:bg-[#c22d2d]' : 'bg-[#C5A059] hover:bg-[#b08e4d]';
  const primaryBorder = isRedTheme ? 'border-[#E53E3E]/30' : 'border-[#C5A059]/30';
  const glowShadow = isRedTheme ? 'shadow-[#E53E3E]/10' : 'shadow-[#C5A059]/10';
  const buttonRing = isRedTheme ? 'focus:ring-[#E53E3E]' : 'focus:ring-[#C5A059]';

  const phase1Services = SERVICES_CATALOG.filter(s => s.phase === 1);
  const phase2Services = SERVICES_CATALOG.filter(s => s.phase === 2);

  const handleServiceToggle = (id: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedServices.includes(id);
      return {
        ...prev,
        selectedServices: isSelected 
          ? prev.selectedServices.filter(sId => sId !== id)
          : [...prev.selectedServices, id]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Por favor, preencha todos os campos obrigatórios.');
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
        services_offered: formData.selectedServices.length > 0 ? formData.selectedServices : ['troca_bateria'],
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
    setFormSubmitted(true);
  };
  return (
    <div id="site-landing" className="min-h-screen text-white bg-[#0a0a0a] font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/30 via-[#0a0a0a] to-[#0a0a0a]" />
        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className={`mb-4 px-3 py-1 border ${primaryBorder} inline-block w-fit ${primaryAccent} text-[10px] font-bold tracking-[0.2em] uppercase`}>
              Startup Brasileira de Tecnologia
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter mb-6 uppercase text-white">
              Tudo para o seu carro. <br />
              <span className={`${primaryAccent}`}>Em um só lugar.</span>
            </h1>
            
            <p className="text-white/40 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 font-light">
              Conectamos motoristas aos melhores profissionais automotivos. De estética a emergências 24h, gerenciamos todo o processo com segurança e transparência.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => onNavigateTo('cliente')}
                className={`w-full sm:w-auto px-8 py-4 rounded-none font-bold ${primaryBg} text-black uppercase text-xs tracking-widest transition-all duration-150 shadow-lg ${glowShadow} flex items-center justify-center gap-2 cursor-pointer`}
              >
                <Smartphone className="w-4 h-4 text-black" />
                Simular App do Cliente
              </button>
              
              <a
                href="#cadastro-parceiro"
                className="w-full sm:w-auto px-8 py-4 rounded-none font-bold bg-[#0d0d0d] hover:bg-neutral-900 text-white border border-white/10 uppercase text-xs tracking-widest transition-all duration-150 flex items-center justify-center gap-2"
              >
                Seja um Parceiro Credenciado
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8 max-w-lg mx-auto lg:mx-0 border-t border-white/10">
              <div>
                <p className={`text-2xl font-bold ${primaryAccent}`}>4</p>
                <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold mt-1">Serviços Lançamento</p>
              </div>
              <div className="border-l border-white/10 pl-6">
                <p className="text-2xl font-bold text-white">{partnersCount}</p>
                <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold mt-1">Parceiros Ativos</p>
              </div>
              <div className="border-l border-white/10 pl-6">
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold mt-1">Split Integrado</p>
              </div>
            </div>
          </div>

          {/* Right side - App Mockup Graphic */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className={`absolute -inset-4 rounded-full bg-gradient-to-tr ${isRedTheme ? 'from-[#E53E3E]/10' : 'from-[#C5A059]/10'} to-transparent filter blur-2xl opacity-60`} />
            <div className="relative w-[300px] h-[600px] bg-[#141414] border-[6px] border-[#222] rounded-[48px] shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10">
              {/* Phone ear-speaker */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-[#222] rounded-b-2xl z-20 flex justify-center items-center">
                <div className="w-12 h-1 bg-black rounded-full" />
              </div>
              
              {/* Inside Phone Screen Visual */}
              <div className="p-6 pt-10 flex-1 flex flex-col justify-between bg-[#0f0f0f] text-left">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Sua localização</p>
                      <p className="text-xs font-medium">Av. Paulista, 1000, SP</p>
                    </div>
                    <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
                      <div className={`w-2 h-2 ${isRedTheme ? 'bg-[#E53E3E]' : 'bg-[#C5A059]'} rounded-full animate-pulse`} />
                    </div>
                  </div>

                  <h2 className="text-xl font-bold mb-4">Status do Serviço</h2>
                  
                  {/* Tracking Card */}
                  <div className={`rounded-2xl p-5 text-black mb-4 ${isRedTheme ? 'bg-[#E53E3E]' : 'bg-[#C5A059]'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-black/10 px-2 py-0.5 rounded">Atendimento Ativo</span>
                      <span className="font-mono font-bold text-sm">#V882</span>
                    </div>
                    <p className="text-sm font-bold">Troca de Bateria Express</p>
                    <p className="text-xs opacity-80 mb-4">Profissional: Roberto Santos</p>
                    <div className="h-1 bg-black/20 w-full rounded-full overflow-hidden">
                      <div className="h-full bg-black w-[65%]"></div>
                    </div>
                    <p className="text-[9px] mt-2 font-bold uppercase">Profissional a caminho • 8 min</p>
                  </div>

                  {/* Map Mockup Component */}
                  <div className="h-28 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute w-full h-full opacity-20">
                      <div className="absolute top-8 left-8 w-20 h-20 border border-white/20 rotate-45"></div>
                      <div className="absolute top-16 right-5 w-32 h-1 bg-white/10"></div>
                    </div>
                    <div className="relative flex flex-col items-center">
                      <div className={`w-8 h-8 bg-black rounded-full border-2 ${isRedTheme ? 'border-[#E53E3E]' : 'border-[#C5A059]'} flex items-center justify-center mb-1`}>
                        <div className={`w-2 h-2 ${isRedTheme ? 'bg-[#E53E3E]' : 'bg-[#C5A059]'} rounded-full`}></div>
                      </div>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white/60">Posição do Parceiro</span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-4 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-colors cursor-pointer">
                  Confirmar Conclusão
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Diferenciais Section */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className={`text-xs font-mono tracking-widest ${primaryAccent} uppercase mb-2`}>Muito mais que um catálogo</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A plataforma que protege a jornada automotiva completa
          </h2>
          <p className="text-gray-400 mt-4 leading-relaxed">
            Diferente de catálogos tradicionais de empresas onde o usuário apenas encontra um telefone, a VEX gerencia todo o fluxo de ponta a ponta para garantir segurança, rapidez e qualidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className={`p-6 bg-white/5 border border-white/10 hover:border-current transition-all cursor-pointer ${primaryAccent.replace('text-', 'hover:border-')}`}>
            <div className={`p-3 bg-neutral-950 border ${primaryBorder} w-fit mb-6`}>
              <Users className={`w-6 h-6 ${primaryAccent}`} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">Conexão Direta</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Sem intermediários lentos. Sua localização e necessidade são enviadas instantaneamente para parceiros disponíveis em um raio ideal.
            </p>
          </div>

          <div className={`p-6 bg-white/5 border border-white/10 hover:border-current transition-all cursor-pointer ${primaryAccent.replace('text-', 'hover:border-')}`}>
            <div className={`p-3 bg-neutral-950 border ${primaryBorder} w-fit mb-6`}>
              <ShieldCheck className={`w-6 h-6 ${primaryAccent}`} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">Selo VEX Verificado</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Todos os parceiros cadastrados passam por rigorosa auditoria de documentação e teste de equipamentos antes de receberem o selo.
            </p>
          </div>

          <div className={`p-6 bg-white/5 border border-white/10 hover:border-current transition-all cursor-pointer ${primaryAccent.replace('text-', 'hover:border-')}`}>
            <div className={`p-3 bg-neutral-950 border ${primaryBorder} w-fit mb-6`}>
              <DollarSign className={`w-6 h-6 ${primaryAccent}`} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">Split de Pagamentos</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Pague com Pix ou Cartão diretamente pelo App. O valor do serviço é dividido de forma automática: Vex retém a taxa e o parceiro saca na hora.
            </p>
          </div>

          <div className={`p-6 bg-white/5 border border-white/10 hover:border-current transition-all cursor-pointer ${primaryAccent.replace('text-', 'hover:border-')}`}>
            <div className={`p-3 bg-neutral-950 border ${primaryBorder} w-fit mb-6`}>
              <Star className={`w-6 h-6 ${primaryAccent}`} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">Avaliação de Pós-Venda</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Mantenha o controle da qualidade. Cada serviço concluído deve ser avaliado pelo cliente para mantermos apenas os melhores ativos.
            </p>
          </div>
        </div>
      </section>

      {/* Catalogo / Fases de Lançamento */}
      <section className="py-20 bg-[#0d0d0d] border-t border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-12 gap-4">
            <div>
              <p className={`text-xs font-mono tracking-[0.2em] ${primaryAccent} uppercase mb-2 font-bold`}>Portfólio de Serviços</p>
              <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Fase 1 — Serviços de Lançamento</h2>
            </div>
            <p className="text-white/40 max-w-md text-sm leading-relaxed font-light">
              Iniciaremos a operação nacional com os serviços mais requisitados pelos motoristas brasileiros para atendimento expresso.
            </p>
          </div>

          {/* Phase 1 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {phase1Services.map((service) => (
              <div key={service.id} className={`p-6 bg-[#0a0a0a] border border-white/10 hover:border-current transition-all flex flex-col justify-between rounded-none ${primaryAccent.replace('text-', 'hover:border-')}`}>
                <div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-none bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Fase 1 Lançamento</span>
                  <h3 className="text-base font-bold text-white mt-3 mb-2 uppercase tracking-tight">{service.name}</h3>
                  <p className="text-xs text-white/40 leading-relaxed mb-4 font-light">{service.description}</p>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between items-center text-[11px]">
                  <span className="text-white/40 font-mono uppercase tracking-wider">Estimativa</span>
                  <span className={`font-mono font-bold ${primaryAccent}`}>{service.basePriceRange}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Phase 2 Title */}
          <div className="border-t border-white/10 pt-12 flex flex-col lg:flex-row items-start lg:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-mono tracking-[0.2em] text-purple-400 uppercase mb-2 font-bold">Próximos Passos</p>
              <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Fase 2 — Expansão Programada</h2>
            </div>
            <p className="text-white/40 max-w-md text-sm leading-relaxed font-light">
              Estrutura modular desenhada desde o início para permitir o acréscimo automático de novos serviços sem impactar o core da aplicação.
            </p>
          </div>

          {/* Phase 2 Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {phase2Services.map((service) => (
              <div key={service.id} className={`p-4 bg-white/5 border border-white/10 hover:border-current flex flex-col justify-between opacity-80 hover:opacity-100 transition-all rounded-none ${primaryAccent.replace('text-', 'hover:border-')}`}>
                <div>
                  <span className="text-[8px] font-mono font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-none border border-purple-500/20 uppercase">Fase 2</span>
                  <h4 className="text-xs font-bold text-gray-200 mt-2 mb-1 uppercase tracking-tight">{service.name}</h4>
                  <p className="text-[10px] text-white/40 line-clamp-2 leading-normal font-light">{service.description}</p>
                </div>
                <span className="text-[10px] font-mono text-white/40 mt-3">{service.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Registration Form Area */}
      <section id="cadastro-parceiro" className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <p className={`text-xs font-mono tracking-widest ${primaryAccent} uppercase`}>Acelere sua oficina</p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Seja um parceiro credenciado VEX e aumente seus lucros
            </h2>
            <p className="text-gray-400 leading-relaxed text-sm">
              Traga sua empresa para a era digital. Receba solicitações pré-qualificadas de motoristas na sua região, envie orçamentos e garanta o recebimento diretamente na sua conta bancária VEX.
            </p>

            {/* Model details for partners */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 className={`w-5 h-5 ${primaryAccent} shrink-0 mt-0.5`} />
                <div>
                  <p className="text-sm font-bold text-white">Atendimento Garantido</p>
                  <p className="text-xs text-gray-400 mt-0.5">O cliente realiza o pagamento em juízo na plataforma antes de você sair para atendimento.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className={`w-5 h-5 ${primaryAccent} shrink-0 mt-0.5`} />
                <div>
                  <p className="text-sm font-bold text-white">Opção de Planos Flexíveis</p>
                  <p className="text-xs text-gray-400 mt-0.5">Plano Basic (comissão padrão) ou Plano Premium (destaque prioritário e menor comissão).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form container */}
          <div className="lg:col-span-7">
            <div className="bg-[#0d0d0d] rounded-none p-8 border border-white/10 shadow-2xl relative">
              
              {formSubmitted ? (
                <div className="text-center py-10 space-y-4 animate-fade-in">
                  <div className={`mx-auto w-16 h-16 rounded-none bg-green-500/10 border border-green-500/30 flex items-center justify-center`}>
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">Cadastro Solicitado!</h3>
                  <p className="text-sm text-white/40 max-w-md mx-auto">
                    Parabéns, os dados de <span className="font-bold text-white">{formData.name}</span> foram salvos no sistema como <span className={`${primaryAccent} font-semibold`}>{formData.plan}</span>. 
                  </p>
                  <div className="p-4 bg-[#0a0a0a] rounded-none border border-white/10 text-left text-xs text-white/40 max-w-md mx-auto space-y-1 font-mono leading-relaxed">
                    <p>● Status inicial do parceiro: <span className="text-[#C5A059] font-bold">PENDENTE</span></p>
                    <p>● Próximo passo: Acesse o <strong className="text-white">VEX Admin</strong> no menu superior para visualizar, auditar e <span className="text-emerald-400">APROVAR</span> este prestador.</p>
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={() => {
                        setFormSubmitted(false);
                        setFormData({ name: '', phone: '', city: 'São Paulo - SP', plan: 'Premium', selectedServices: [] });
                      }}
                      className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-white/10 rounded-none text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Cadastrar Outro
                    </button>
                    <button 
                      onClick={() => onNavigateTo('admin')}
                      className={`px-6 py-2.5 rounded-none text-xs font-bold text-black uppercase tracking-wider ${primaryBg} transition-all cursor-pointer`}
                    >
                      Ir para VEX Admin
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">Formulário de Credenciamento</h3>
                    <p className="text-xs text-white/40 mt-1 font-light">Preencha os dados da sua empresa ou serviço autônomo para iniciar.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Nome Comercial / Oficina *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40">
                          <Building2 className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Auto Mecânica Paulista"
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-none py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-current text-white placeholder-white/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">WhatsApp / Telefone *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Ex: (11) 99999-8888"
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-none py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-current text-white placeholder-white/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Cidade Base</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40">
                          <MapPin className="w-4 h-4" />
                        </span>
                        <select
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-none py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-current text-white"
                        >
                          <option value="São Paulo - SP">São Paulo - SP</option>
                          <option value="São Bernardo do Campo - SP">São Bernardo do Campo - SP</option>
                          <option value="Santo André - SP">Santo André - SP</option>
                          <option value="Osasco - SP">Osasco - SP</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Plano Inicial</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, plan: 'Basic' }))}
                          className={`py-3 rounded-none text-xs font-bold border transition-all ${
                            formData.plan === 'Basic'
                              ? `${isRedTheme ? 'border-[#E53E3E] bg-[#E53E3E]/10 text-[#E53E3E]' : 'border-[#C5A059] bg-[#C5A059]/10 text-[#C5A059]'}`
                              : 'border-white/10 bg-[#0a0a0a] text-white/40 hover:text-white'
                          }`}
                        >
                          Basic
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, plan: 'Premium' }))}
                          className={`py-3 rounded-none text-xs font-bold border transition-all ${
                            formData.plan === 'Premium'
                              ? `${isRedTheme ? 'border-[#E53E3E] bg-[#E53E3E]/10 text-[#E53E3E]' : 'border-[#C5A059] bg-[#C5A059]/10 text-[#C5A059]'}`
                              : 'border-white/10 bg-[#0a0a0a] text-white/40 hover:text-white'
                          }`}
                        >
                          Premium
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Serviços que oferece (Selecione):</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SERVICES_CATALOG.map((srv) => {
                        const isSelected = formData.selectedServices.includes(srv.id);
                        return (
                          <button
                            type="button"
                            key={srv.id}
                            onClick={() => handleServiceToggle(srv.id)}
                            className={`p-2 rounded-none text-[10px] font-bold border text-center transition-all ${
                              isSelected
                                ? `${isRedTheme ? 'border-[#E53E3E] bg-[#E53E3E]/20 text-white' : 'border-[#C5A059] bg-[#C5A059]/20 text-white'}`
                                : 'border-white/10 bg-[#0a0a0a] text-white/40 hover:text-white'
                            }`}
                          >
                            {srv.name}
                          </button>
                        );
                      })}
                    </div>
                 </div>

                  {submitError && (
                    <p className="text-xs text-red-400 font-bold">{submitError}</p>
                  )}


                   <button
                                                     type="submit"
                                  disabled={isSubmitting}
                                                    className={`w-full py-4 rounded-none font-bold text-black uppercase text-xs tracking-widest transition-all duration-150 shadow-lg ${primaryBg} flex items-center justify-center gap-2 cursor-pointer`}  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                    <CheckCircle2 className="w-5 h-5 text-black" />
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-900 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <span className="font-mono font-black text-lg tracking-wider text-white">VEX<span className={`${primaryAccent}`}>.</span></span>
            <p className="text-xs text-gray-600 mt-1">© 2026 VEX AUTO HUB Tecnologia S.A. Todos os direitos reservados.</p>
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <a href="#data-model" className="hover:text-white transition-colors">PostgreSQL Model</a>
            <span>•</span>
            <button onClick={() => onNavigateTo('admin')} className="hover:text-white transition-colors">Admin Area</button>
            <span>•</span>
            <button onClick={() => onNavigateTo('parceiro')} className="hover:text-white transition-colors">Partner Dashboard</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
