import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Início', icon: '📊' },
  { to: '/conversas', label: 'Conversas', icon: '💬' },
  { to: '/pedidos', label: 'Pedidos', icon: '📦' },
  { to: '/produtos', label: 'Produtos', icon: '🥩' },
  { to: '/clientes', label: 'Clientes', icon: '👥' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-sidebar flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="text-white font-extrabold text-lg leading-tight">🥩 ProteínaJá</div>
        <div className="text-white/50 text-xs mt-1">Frigorífico São Lucas</div>
      </div>
      <nav className="flex-1 py-4">
        {links.map((l) => (
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
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
          className="text-white/40 text-xs hover:text-white/60 transition-colors"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
