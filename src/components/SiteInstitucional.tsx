import React, { useEffect, useRef, useState } from 'react';
import { SERVICES_CATALOG } from '../mockData';
import { Partner } from '../types';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { CheckCircle2, ArrowRight, ShieldCheck, DollarSign, Smartphone, Users, MapPin, Star, Building2, Phone } from 'lucide-react';

interface SiteProps {
  isRedTheme: boolean;
  onRegisterPartner: (partner: Partner) => void;
  onNavigateTo: (screen: string) => void;
  partnersCount: number;
}

export default function SiteInstitucional({ isRedTheme, onRegisterPartner, onNavigateTo, partnersCount }: SiteProps) {
  const heroRef = useRef<HTMLElement>(null);

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

  const accent = isRedTheme ? '#E53E3E' : '#C5A059';
  const primaryAccent = isRedTheme ? 'text-[#E53E3E]' : 'text-[#C5A059]';
  const primaryBg = isRedTheme ? 'bg-[#E53E3E] hover:bg-[#c22d2d]' : 'bg-[#C5A059] hover:bg-[#b08e4d]';

  const phase1Services = SERVICES_CATALOG.filter(s => s.phase === 1);
  const phase2Services = SERVICES_CATALOG.filter(s => s.phase === 2);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const context = gsap.context(() => {
      gsap.fromTo('[data-hero-stat]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.11, delay: 0.5, ease: 'power3.out' });
    }, hero);
    return () => context.revert();
  }, [isRedTheme]);

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
    <div id="site-landing" className="min-h-screen text-white bg-[#050505] vex-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap');
        .vex-display { font-family: 'Space Grotesk', sans-serif; }
        .vex-body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden pt-24 pb-20 border-b border-white/[0.06]">
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[55%] h-[80%] pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)` }}
        />

        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-xl"
          >
            <span className="vex-body text-[11px] tracking-[0.25em] uppercase text-white/40 font-medium">
              Startup Brasileira de Tecnologia Automotiva
            </span>

            <h1 className="vex-display font-bold leading-[1.02] text-5xl sm:text-6xl lg:text-[64px] mt-5 tracking-tight text-white">
              Tudo para o
              <br />
              seu carro, em
              <br />
              <span style={{ color: accent }}>um só lugar.</span>
            </h1>

            <p className="vex-body mt-7 text-gray-400 text-base leading-relaxed max-w-md">
              Conectamos motoristas aos melhores profissionais automotivos.
              De estética a emergências 24h, gerenciamos todo o processo com
              segurança e transparência.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="mt-9 flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={() => onNavigateTo('app')}
                className="vex-body px-8 py-3.5 font-semibold text-sm text-black transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: accent }}
              >
                <Smartphone className="w-4 h-4" />
                Simular App do Cliente
              </button>
              <a
                href="#cadastro-parceiro"
                className="vex-body px-8 py-3.5 font-semibold text-sm text-white border border-white/15 hover:border-white/35 transition-colors flex items-center justify-center gap-2"
              >
                Seja um Parceiro
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            <div className="mt-14 flex gap-10">
              <div data-hero-stat>
                <p className="vex-display text-2xl font-bold text-white">4</p>
                <p className="vex-body text-[11px] text-white/35 mt-1">Serviços Lançamento</p>
              </div>
              <div data-hero-stat>
                <p className="vex-display text-2xl font-bold text-white">{partnersCount}</p>
                <p className="vex-body text-[11px] text-white/35 mt-1">Parceiros Ativos</p>
              </div>
              <div data-hero-stat>
                <p className="vex-display text-2xl font-bold text-white">100%</p>
                <p className="vex-body text-[11px] text-white/35 mt-1">Split Integrado</p>
              </div>
            </div>
          </motion.div>

          {/* Foto do carro — tratamento com gradiente pra integrar ao fundo escuro */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.8, ease: 'easeOut' }}
            className="relative h-[380px] sm:h-[460px] lg:h-[520px] overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1747770641554-a1c16ad4821e?q=80&w=1600&auto=format&fit=crop"
              alt="Carro esportivo"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradientes para fundir a foto com o fundo #050505 */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent lg:from-[#050505]/80" />
            <div
              className="absolute inset-0 mix-blend-overlay"
              style={{ background: `radial-gradient(circle at 70% 40%, ${accent}30 0%, transparent 60%)` }}
            />
          </motion.div>

        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <p className="vex-body text-[11px] font-semibold tracking-[0.25em] uppercase text-white/35">Muito mais que um catálogo</p>
          <h2 className="vex-display text-3xl sm:text-4xl font-bold tracking-tight text-white mt-3">
            A plataforma que protege a jornada automotiva completa
          </h2>
          <p className="vex-body text-gray-400 mt-4 leading-relaxed">
            Diferente de catálogos tradicionais, a VEX gerencia todo o fluxo de ponta a ponta
            para garantir segurança, rapidez e qualidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06]">
          {[
            { icon: Users, title: 'Conexão Direta', desc: 'Sem intermediários lentos. Sua localização e necessidade são enviadas instantaneamente para parceiros disponíveis na sua região.' },
            { icon: ShieldCheck, title: 'Selo VEX Verificado', desc: 'Todos os parceiros passam por auditoria de documentação e teste de equipamentos antes de receberem o selo.' },
            { icon: DollarSign, title: 'Split de Pagamentos', desc: 'Pague com Pix ou Cartão pelo App. O valor é dividido automaticamente entre VEX e parceiro.' },
            { icon: Star, title: 'Avaliação de Pós-Venda', desc: 'Cada serviço concluído é avaliado pelo cliente, mantendo apenas os melhores profissionais ativos.' }
          ].map((item) => (
            <div key={item.title} className="p-8 bg-[#050505] hover:bg-white/[0.02] transition-colors">
              <item.icon className="w-5 h-5 mb-6" style={{ color: accent }} />
              <h3 className="vex-body text-base font-semibold text-white mb-2">{item.title}</h3>
              <p className="vex-body text-sm text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="py-24 bg-[#080808] border-t border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-12 gap-4">
            <div>
              <p className="vex-body text-[11px] font-semibold tracking-[0.25em] uppercase text-white/35">Portfólio de Serviços</p>
              <h2 className="vex-display text-3xl font-bold tracking-tight text-white mt-3">Fase 1 — Lançamento</h2>
            </div>
            <p className="vex-body text-white/40 max-w-md text-sm leading-relaxed">
              Iniciamos a operação com os serviços mais requisitados pelos motoristas
              brasileiros para atendimento expresso.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] mb-20">
            {phase1Services.map((service) => (
              <div key={service.id} className="p-6 bg-[#080808] hover:bg-white/[0.02] transition-colors flex flex-col justify-between">
                <div>
                  <span className="vex-body text-[9px] font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 uppercase tracking-wider">Disponível</span>
                  <h3 className="vex-body text-base font-semibold text-white mt-3 mb-2">{service.name}</h3>
                  <p className="vex-body text-xs text-white/40 leading-relaxed mb-4">{service.description}</p>
                </div>
                <div className="border-t border-white/[0.06] pt-3 flex justify-between items-center text-[11px]">
                  <span className="vex-body text-white/35 uppercase tracking-wider">Estimativa</span>
                  <span className="vex-body font-semibold" style={{ color: accent }}>{service.basePriceRange}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-10 gap-4">
            <div>
              <p className="vex-body text-[11px] font-semibold tracking-[0.25em] uppercase text-purple-400/70">Próximos Passos</p>
              <h2 className="vex-display text-2xl font-bold tracking-tight text-white mt-3">Fase 2 — Expansão</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-white/[0.06]">
            {phase2Services.map((service) => (
              <div key={service.id} className="p-4 bg-[#080808] hover:bg-white/[0.02] transition-colors opacity-70 hover:opacity-100">
                <span className="vex-body text-[8px] font-semibold text-purple-400/80 uppercase tracking-wider">Fase 2</span>
                <h4 className="vex-body text-xs font-semibold text-gray-200 mt-2 mb-1">{service.name}</h4>
                <p className="vex-body text-[10px] text-white/35 line-clamp-2 leading-normal">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CADASTRO DE PARCEIRO */}
      <section id="cadastro-parceiro" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-start">

          <div className="lg:col-span-5 space-y-7">
            <div>
              <p className="vex-body text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: accent }}>Acelere sua oficina</p>
              <h2 className="vex-display text-3xl sm:text-4xl font-bold tracking-tight text-white mt-3">
                Seja um parceiro credenciado VEX
              </h2>
            </div>
            <p className="vex-body text-gray-400 leading-relaxed text-sm">
              Traga sua empresa para a era digital. Receba solicitações pré-qualificadas
              de motoristas na sua região, envie orçamentos e garanta o recebimento
              diretamente na sua conta.
            </p>

            <div className="space-y-5 pt-2">
              <div className="flex gap-3.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: accent }} />
                <div>
                  <p className="vex-body text-sm font-semibold text-white">Atendimento Garantido</p>
                  <p className="vex-body text-xs text-gray-400 mt-1 leading-relaxed">O cliente paga na plataforma antes de você sair para o atendimento.</p>
                </div>
              </div>
              <div className="flex gap-3.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: accent }} />
                <div>
                  <p className="vex-body text-sm font-semibold text-white">Planos Flexíveis</p>
                  <p className="vex-body text-xs text-gray-400 mt-1 leading-relaxed">Basic (comissão padrão) ou Premium (destaque e menor comissão).</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-[#0a0a0a] border border-white/[0.08] p-8">

              {formSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="mx-auto w-14 h-14 bg-green-500/10 border border-green-500/25 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-green-400" />
                  </div>
                  <h3 className="vex-display text-xl font-bold text-white">Cadastro Solicitado!</h3>
                  <p className="vex-body text-sm text-white/40 max-w-md mx-auto">
                    Os dados de <span className="font-semibold text-white">{formData.name}</span> foram salvos como <span style={{ color: accent }} className="font-semibold">{formData.plan}</span>.
                  </p>
                  <div className="p-4 bg-black/30 border border-white/[0.06] text-left text-xs text-white/40 max-w-md mx-auto space-y-1.5 vex-body leading-relaxed">
                    <p>Status inicial: <span className="text-amber-400 font-semibold">PENDENTE</span></p>
                    <p>Próximo passo: acesse o <strong className="text-white">VEX Admin</strong> para aprovar este prestador.</p>
                  </div>
                  <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => {
                        setFormSubmitted(false);
                        setFormData({ name: '', phone: '', city: 'São Paulo - SP', plan: 'Premium', selectedServices: [] });
                      }}
                      className="vex-body px-6 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-semibold transition-colors"
                    >
                      Cadastrar Outro
                    </button>
                    <button
                      onClick={() => onNavigateTo('admin')}
                      className={`vex-body px-6 py-2.5 text-xs font-semibold text-black ${primaryBg} transition-all cursor-pointer`}
                    >
                      Ir para VEX Admin
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="vex-display text-xl font-bold text-white">Formulário de Credenciamento</h3>
                    <p className="vex-body text-xs text-white/40 mt-1">Preencha os dados da sua empresa ou serviço autônomo.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="vex-body block text-xs font-medium text-white/40 mb-2">Nome Comercial *</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Auto Mecânica Paulista"
                          className="vex-body w-full bg-black/30 border border-white/10 py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/30 text-white placeholder-white/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="vex-body block text-xs font-medium text-white/40 mb-2">WhatsApp *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="text"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(11) 99999-8888"
                          className="vex-body w-full bg-black/30 border border-white/10 py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/30 text-white placeholder-white/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="vex-body block text-xs font-medium text-white/40 mb-2">Cidade Base</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <select
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          className="vex-body w-full bg-black/30 border border-white/10 py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/30 text-white"
                        >
                          <option value="São Paulo - SP">São Paulo - SP</option>
                          <option value="São Bernardo do Campo - SP">São Bernardo do Campo - SP</option>
                          <option value="Santo André - SP">Santo André - SP</option>
                          <option value="Osasco - SP">Osasco - SP</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="vex-body block text-xs font-medium text-white/40 mb-2">Plano Inicial</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, plan: 'Basic' }))}
                          className={`vex-body py-3 text-xs font-semibold border transition-all ${
                            formData.plan === 'Basic' ? 'border-white/30 bg-white/[0.06] text-white' : 'border-white/10 bg-black/20 text-white/40 hover:text-white'
                          }`}
                        >
                          Basic
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, plan: 'Premium' }))}
                          className={`vex-body py-3 text-xs font-semibold border transition-all ${
                            formData.plan === 'Premium' ? 'border-white/30 bg-white/[0.06] text-white' : 'border-white/10 bg-black/20 text-white/40 hover:text-white'
                          }`}
                        >
                          Premium
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="vex-body block text-xs font-medium text-white/40 mb-2">Serviços que oferece:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SERVICES_CATALOG.map((srv) => {
                        const isSelected = formData.selectedServices.includes(srv.id);
                        return (
                          <button
                            type="button"
                            key={srv.id}
                            onClick={() => handleServiceToggle(srv.id)}
                            className={`vex-body p-2 text-[10px] font-semibold border text-center transition-all ${
                              isSelected ? 'border-white/30 bg-white/[0.08] text-white' : 'border-white/10 bg-black/20 text-white/40 hover:text-white'
                            }`}
                          >
                            {srv.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {submitError && (
                    <p className="vex-body text-xs text-red-400 font-medium">{submitError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`vex-body w-full py-4 font-semibold text-black text-sm ${primaryBg} flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                    {!isSubmitting && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <span className="vex-display font-bold text-lg text-white">VEX<span style={{ color: accent }}>.</span></span>
            <p className="vex-body text-xs text-gray-600 mt-1">© 2026 VEX AUTO HUB Tecnologia S.A. Todos os direitos reservados.</p>
          </div>
          <div className="flex gap-4 text-xs text-gray-500 vex-body">
            <button onClick={() => onNavigateTo('app')} className="hover:text-white transition-colors">App</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
