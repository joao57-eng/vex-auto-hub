interface HeroProps {
  partnersCount: number;
  isLoading: boolean;
  onRequestService: () => void;
}

export default function Hero({ partnersCount, isLoading, onRequestService }: HeroProps) {
  const partnerLabel = partnersCount === 1 ? 'parceiro cadastrado' : 'parceiros cadastrados';

  return (
    <section className="relative flex min-h-[520px] items-center justify-center overflow-hidden border-b border-white/10 bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(197,160,89,0.16),_transparent_42%)]" />

      <div className="relative px-6 text-center">
        <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.32em] text-[#C5A059]">
          Plataforma automotiva conectada
        </p>

        <h1 className="text-5xl font-black text-white sm:text-6xl">
          VEX <span className="text-[#C5A059]">AUTO HUB</span>
        </h1>

        <p className="mt-6 text-xl text-gray-400">
          Tudo para o seu carro.
          <br />
          Em um só lugar.
        </p>

        <p className="mt-6 text-sm text-white/50" aria-live="polite">
          {isLoading ? 'Conectando à rede de parceiros...' : `${partnersCount} ${partnerLabel} na rede`}
        </p>

        <button
          type="button"
          onClick={onRequestService}
          className="mt-8 rounded-full bg-[#C5A059] px-8 py-4 font-bold text-black transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#050505]"
        >
          Solicitar serviço
        </button>
      </div>
    </section>
  );
}
