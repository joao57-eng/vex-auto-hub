import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail } from 'lucide-react';

interface AdminGateProps {
  children: React.ReactNode;
}

export default function AdminGate({ children }: AdminGateProps) {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setStatus('unauthorized');
      return;
    }

    const { data, error } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error || !data) {
      setStatus('unauthorized');
      return;
    }

    setStatus('authorized');
  };

  useEffect(() => {
    checkAdmin();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Preencha email e senha.');
      return;
    }

    setSubmitting(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);

    if (loginError) {
      setError('Email ou senha incorretos.');
      return;
    }
    // checkAdmin() é re-executado automaticamente pelo listener acima
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-xs text-white/40">Verificando acesso...</p>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
        <div className="w-full max-w-sm bg-[#0d0d0d] border border-white/10 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-[#C5A059] flex items-center justify-center font-black text-black text-lg shrink-0">V</div>
            <div>
              <h2 className="text-lg font-bold text-white leading-none">Acesso Restrito</h2>
              <p className="text-[11px] text-white/40 mt-1">Entre com sua conta de administrador.</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3 h-3" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/30 border border-white/10 px-3 py-3 text-sm text-white outline-none focus:border-white/30 transition-colors"
                placeholder="admin@vexautohub.com"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-1.5 mb-1.5">
                <Lock className="w-3 h-3" /> Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-white/10 px-3 py-3 text-sm text-white outline-none focus:border-white/30 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#C5A059] hover:bg-[#b08e4d] text-black font-bold text-xs uppercase tracking-widest disabled:opacity-50 cursor-pointer transition-colors"
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
