import { useEffect, useState } from 'react';
import { getOverview } from '../api/client';
import { DashboardOverview } from '../types';

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

  useEffect(() => {
    getOverview().then((r) => setData(r.data)).catch(() => {});
  }, []);

  const fmt = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="p-8">
      <h1 className="text-xl font-extrabold text-sidebar mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Pedidos hoje" value={data?.pedidos_hoje ?? '—'} />
        <KpiCard
          label="Pelo agente IA"
          value={data ? `${data.pct_agente}%` : '—'}
          sub={`${data?.pedidos_agente_hoje ?? 0} pedidos`}
        />
        <KpiCard label="Conversas ativas" value={data?.conversas_ativas ?? '—'} />
        <KpiCard label="Volume hoje" value={data ? fmt(data.volume_hoje) : '—'} />
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
