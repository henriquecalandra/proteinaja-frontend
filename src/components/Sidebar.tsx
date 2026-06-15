import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getCompany } from '../api/client';

const links = [
  { to: '/', label: 'Início', icon: '📊' },
  { to: '/conversas', label: 'Conversas', icon: '💬' },
  { to: '/pedidos', label: 'Pedidos', icon: '📦' },
  { to: '/produtos', label: 'Produtos', icon: '🥩' },
  { to: '/clientes', label: 'Clientes', icon: '👥' },
  { to: '/inteligencia', label: 'Inteligência', icon: '🧠' },
  { to: '/funil', label: 'Funil', icon: '🗂️' },
];

export default function Sidebar() {
  const role = localStorage.getItem('role');
  const [empresaNome, setEmpresaNome] = useState(
    role === 'admin' ? 'Plataforma ProteínaJá' : 'Frigorífico São Lucas'
  );

  useEffect(() => {
    if (role === 'admin') {
      setEmpresaNome('Plataforma ProteínaJá');
      return;
    }
    let ativo = true;
    getCompany()
      .then(({ data }) => {
        if (ativo && data?.nome) setEmpresaNome(data.nome);
      })
      .catch(() => {
        // defensivo: mantém fallback
      });
    return () => {
      ativo = false;
    };
  }, [role]);

  const itens = [
    ...links,
    ...(role === 'admin' ? [{ to: '/admin', label: 'Plataforma', icon: '🏢' }] : []),
    { to: '/configuracoes', label: 'Configurações', icon: '⚙️' },
  ];

  return (
    <aside className="w-60 min-h-screen bg-sidebar flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="text-white font-extrabold text-lg leading-tight">🥩 ProteínaJá</div>
        <div className="text-white/50 text-xs mt-1">{empresaNome}</div>
      </div>
      <nav className="flex-1 py-4">
        {itens.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-white/10 text-white border-r-4 border-accent'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-white/10">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('empresa_id');
            window.location.href = '/login';
          }}
          className="text-white/40 text-xs hover:text-white/60 transition-colors"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
