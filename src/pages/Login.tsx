import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const { data } = await login(email, senha);
      localStorage.setItem('token', data.access_token);
      navigate('/');
    } catch {
      setErro('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: brand panel */}
      <div className="hidden md:flex w-1/2 bg-sidebar flex-col justify-center px-14 text-white">
        <div className="text-3xl font-extrabold mb-3">🥩 ProteínaJá</div>
        <div className="text-white/70 text-lg mb-10 font-semibold">
          Seu agente comercial no WhatsApp, 24h por dia.
        </div>
        <ul className="space-y-4 text-white/80 text-sm">
          {[
            '✅ Recebe pedidos automaticamente',
            '✅ Responde em português coloquial',
            '✅ Dashboard em tempo real',
            '✅ Escala para humano quando necessário',
          ].map((t) => (
            <li key={t} className="font-medium">{t}</li>
          ))}
        </ul>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-8 bg-bg">
        <div className="w-full max-w-sm">
          <div className="text-sidebar font-extrabold text-2xl mb-1">Bem-vindo</div>
          <div className="text-gray-400 text-sm mb-8">Entre com sua conta do frigorífico</div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                placeholder="marcos@frigorifico.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                placeholder="••••••••"
              />
            </div>
            {erro && <p className="text-red-500 text-sm">{erro}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
