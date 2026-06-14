import { useEffect, useState } from 'react';
import { getOverview, getDashboardAnalytics } from '../api/client';
import { DashboardOverview, DashboardAnalytics } from '../types';

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">{label}</div>
      <div className="text-2xl font-extrabold text-sidebar">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);

  useEffect(() => {
    getOverview().then((r) => setData(r.data)).catch(() => {});
    getDashboardAnalytics().then((r) => setAnalytics(r.data)).catch(() => {});
  }, []);

  const fmt = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const maxFaturamento = analytics
    ? Math.max(1, ...analytics.faturamento_por_dia.map((d) => d.total))
    : 1;

  const statusCores: { chave: keyof DashboardAnalytics['pedidos_por_status']; label: string; cor: string }[] = [
    { chave: 'confirmado', label: 'Confirmado', cor: 'text-green-600' },
    { chave: 'negociando', label: 'Negociando', cor: 'text-amber-600' },
    { chave: 'aguardando', label: 'Aguardando', cor: 'text-blue-600' },
    { chave: 'entregue', label: 'Entregue', cor: 'text-sidebar' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-xl font-extrabold text-sidebar mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <KpiCard label="Pedidos hoje" value={data?.pedidos_hoje ?? '—'} />
        <KpiCard
          label="Pelo agente IA"
          value={data ? `${data.pct_agente}%` : '—'}
          sub={`${data?.pedidos_agente_hoje ?? 0} pedidos`}
        />
        <KpiCard label="Conversas ativas" value={data?.conversas_ativas ?? '—'} />
        <KpiCard label="Volume hoje" value={data ? fmt(data.volume_hoje) : '—'} />
        <KpiCard
          label="Ticket médio"
          value={analytics ? fmt(analytics.ticket_medio) : '—'}
        />
        <KpiCard
          label="A receber"
          value={analytics ? fmt(analytics.total_a_receber) : '—'}
          sub={analytics ? `${fmt(analytics.total_pago)} pago` : undefined}
        />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <h2 className="font-bold text-sidebar mb-4">Faturamento (14 dias)</h2>
        {analytics ? (
          <div className="flex items-end gap-1 h-48">
            {analytics.faturamento_por_dia.map((d) => {
              const altura = Math.round((d.total / maxFaturamento) * 100);
              return (
                <div key={d.dia} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div className="text-[10px] text-gray-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {fmt(d.total)}
                  </div>
                  <div
                    className="w-full bg-accent/80 rounded-t-md hover:bg-accent transition-colors"
                    style={{ height: `${Math.max(altura, d.total > 0 ? 4 : 0)}%` }}
                    title={`${d.dia}: ${fmt(d.total)} (${d.qtd} pedidos)`}
                  />
                  <div className="text-[9px] text-gray-400 mt-1">{d.dia.slice(8, 10)}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Carregando dados...</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-sidebar mb-4">Pedidos por status</h2>
          {analytics ? (
            <div className="grid grid-cols-2 gap-4">
              {statusCores.map((s) => (
                <div key={s.chave}>
                  <div className={`text-2xl font-extrabold ${s.cor}`}>
                    {analytics.pedidos_por_status[s.chave]}
                  </div>
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Carregando...</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-sidebar mb-4">Top 5 produtos</h2>
          {analytics ? (
            analytics.top_produtos.length ? (
              <ul className="space-y-2 text-sm">
                {analytics.top_produtos.map((p) => (
                  <li key={p.produto} className="flex items-center justify-between gap-2">
                    <span className="text-gray-600 font-medium truncate">{p.produto}</span>
                    <span className="text-gray-400 text-xs whitespace-nowrap">
                      {p.qtd_kg.toLocaleString('pt-BR')} kg ·{' '}
                      <span className="text-accent font-semibold">{fmt(p.receita)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">Sem dados.</p>
            )
          ) : (
            <p className="text-gray-400 text-sm">Carregando...</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-sidebar mb-4">Top 5 clientes</h2>
          {analytics ? (
            analytics.top_clientes.length ? (
              <ul className="space-y-2 text-sm">
                {analytics.top_clientes.map((c) => (
                  <li key={c.nome} className="flex items-center justify-between gap-2">
                    <span className="text-gray-600 font-medium truncate">{c.nome}</span>
                    <span className="text-accent font-semibold whitespace-nowrap">{fmt(c.total)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">Sem dados.</p>
            )
          ) : (
            <p className="text-gray-400 text-sm">Carregando...</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-bold text-sidebar mb-4">Resumo do dia</h2>
        {data ? (
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              O agente de IA atendeu <span className="font-bold text-accent">{data.pedidos_agente_hoje}</span> de{' '}
              <span className="font-bold">{data.pedidos_hoje}</span> pedidos hoje
              ({data.pct_agente}% de autonomia).
            </p>
            <p>
              Há <span className="font-bold text-sidebar">{data.conversas_ativas}</span> conversas
              abertas no momento.
            </p>
            <p>
              Volume total do dia:{' '}
              <span className="font-bold text-accent">{fmt(data.volume_hoje)}</span>.
            </p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Carregando dados...</p>
        )}
      </div>
    </div>
  );
}
