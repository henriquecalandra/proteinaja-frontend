import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, getMe } from '../api/client';
import { AxiosError } from 'axios';

export default function Login() {
  const [modo, setModo] = useState<'entrar' | 'cadastro'>('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function alternarModo() {
    setModo((m) => (m === 'entrar' ? 'cadastro' : 'entrar'));
    setErro('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      if (modo === 'cadastro') {
        const { data } = await register(nome, email, senha);
        localStorage.setItem('token', data.access_token);
      } else {
        const { data } = await login(email, senha);
        localStorage.setItem('token', data.access_token);
      }
      try {
        const { data: me } = await getMe();
        localStorage.setItem('role', me.role ?? 'empresa');
        if (me.empresa_id != null) {
          localStorage.setItem('empresa_id', String(me.empresa_id));
        } else {
          localStorage.removeItem('empresa_id');
        }
      } catch {
        // demo: segue mesmo sem /auth/me
      }
      navigate('/');
    } catch (err) {
      if (modo === 'cadastro') {
        const status = (err as AxiosError)?.response?.status;
        setErro(status === 409 ? 'Este e-mail já está cadastrado.' : 'Não foi possível criar a conta.');
      } else {
        setErro('E-mail ou senha incorretos.');
      }
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
          <div className="text-sidebar font-extrabold text-2xl mb-1">
            {modo === 'entrar' ? 'Bem-vindo' : 'Criar conta'}
          </div>
          <div className="text-gray-400 text-sm mb-8">
            {modo === 'entrar'
              ? 'Entre com sua conta do frigorífico'
              : 'Cadastre-se para acessar o painel'}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {modo === 'cadastro' && (
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  placeholder="Seu nome"
                />
              </div>
            )}
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
              {loading
                ? modo === 'cadastro'
                  ? 'Criando...'
                  : 'Entrando...'
                : modo === 'cadastro'
                ? 'Criar conta'
                : 'Entrar'}
            </button>
          </form>

          <div className="text-center text-sm text-gray-400 mt-6">
            {modo === 'entrar' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}{' '}
            <button
              type="button"
              onClick={alternarModo}
              className="font-semibold text-accent hover:underline"
            >
              {modo === 'entrar' ? 'Criar conta' : 'Entrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
