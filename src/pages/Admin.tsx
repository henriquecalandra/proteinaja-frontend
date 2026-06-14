import { useEffect, useState } from 'react';
import { getAdminOverview, getAdminCompanies } from '../api/client';
import { AdminOverview, Empresa } from '../types';

const planoColor: Record<string, string> = {
  starter: 'bg-blue-100 text-blue-700',
  pro: 'bg-purple-100 text-purple-700',
  enterprise: 'bg-amber-100 text-amber-700',
};

const planoLabel: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export default function Admin() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  useEffect(() => {
    getAdminOverview().then((r) => setOverview(r.data)).catch(() => {});
    getAdminCompanies().then((r) => setEmpresas(r.data)).catch(() => {});
  }, []);

  const fmtMoeda = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const cards = [
    { label: 'Total de empresas', valor: overview ? String(overview.total_empresas) : '—' },
    { label: 'Empresas ativas', valor: overview ? String(overview.empresas_ativas) : '—' },
    { label: 'GMV da plataforma', valor: overview ? fmtMoeda(overview.gmv_plataforma) : '—', accent: true },
    { label: 'Total de pedidos', valor: overview ? String(overview.total_pedidos_plataforma) : '—' },
    { label: 'Total de clientes', valor: overview ? String(overview.total_clientes) : '—' },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-sidebar">Plataforma</h1>
        <p className="text-sm text-gray-400 mt-1">Visão geral de todas as empresas da plataforma.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">{c.label}</div>
            <div className={`text-xl font-extrabold ${c.accent ? 'text-accent' : 'text-sidebar'}`}>
              {c.valor}
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-extrabold text-sidebar mb-3">Empresas</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Empresa</th>
              <th className="px-5 py-3 text-left">Cidade</th>
              <th className="px-5 py-3 text-left">Plano</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {empresas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8">
                  Nenhuma empresa cadastrada ainda.
                </td>
              </tr>
            ) : (
              empresas.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-bold text-sidebar">{e.nome}</td>
                  <td className="px-5 py-3 text-gray-600">{e.cidade || <span className="text-gray-300">—</span>}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        planoColor[e.plano] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {planoLabel[e.plano] || e.plano}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        e.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {e.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        e.whatsapp_conectado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {e.whatsapp_conectado ? '🟢 Conectado' : '⚪ Não conectado'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
