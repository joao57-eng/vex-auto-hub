import { Suspense } from 'react';
import Scene3D from './three/Scene3D';

export default function Hero({ isRedTheme }: { isRedTheme: boolean }) {
  const accent = isRedTheme ? '#E53E3E' : '#C5A059';

  return (
    <section className="relative bg-[#050505] overflow-hidden border-b border-white/10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500&display=swap');
        .vex-hero-display { font-family: 'Space Grotesk', sans-serif; }
        .vex-hero-body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Brilho atmosférico suave atrás do carro */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[55%] h-[70%] pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accent}14 0%, transparent 70%)`
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 items-center">

        {/* COLUNA ESQUERDA */}
        <div className="max-w-lg">
          <span className="vex-hero-body text-[11px] tracking-[0.25em] uppercase text-white/40 font-medium">
            Assistência Automotiva Premium
          </span>

          <h1 className="vex-hero-display text-white font-bold leading-[1.02] text-5xl sm:text-6xl mt-5 tracking-tight">
            Seu carro,
            <br />
            sempre em
            <br />
            <span style={{ color: accent }}>boas mãos.</span>
          </h1>

          <p className="vex-hero-body mt-7 text-gray-400 text-base leading-relaxed">
            Conectamos você aos melhores profissionais automotivos da sua região.
            Peça, acompanhe e pague — tudo em um só lugar, com a segurança que
            seu carro merece.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <button
              className="vex-hero-body px-8 py-3.5 font-semibold text-sm text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: accent }}
            >
              Solicitar Serviço
            </button>
            <button className="vex-hero-body px-8 py-3.5 font-semibold text-sm text-white border border-white/15 hover:border-white/35 transition-colors">
              Seja um Parceiro
            </button>
          </div>

          {/* Estatísticas discretas, sem excesso visual */}
          <div className="mt-14 flex gap-10">
            {[
              { value: '120+', label: 'Parceiros Ativos' },
              { value: '9 min', label: 'Tempo Médio' },
              { value: '4.9', label: 'Avaliação' }
            ].map((stat) => (
              <div key={stat.label}>
                <p className="vex-hero-display text-2xl font-bold text-white">{stat.value}</p>
                <p className="vex-hero-body text-[11px] text-white/35 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA: Carro 3D, sem molduras nem HUD — só o carro e a luz */}
        <div className="relative h-[360px] sm:h-[440px] lg:h-[500px]">
          <Suspense fallback={null}>
            <Scene3D isRedTheme={isRedTheme} />
          </Suspense>
        </div>

      </div>
    </section>
  );
}
