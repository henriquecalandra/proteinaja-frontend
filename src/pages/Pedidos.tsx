import { useEffect, useState } from 'react';
import { getPedidos } from '../api/client';
import { Pedido } from '../types';

const statusColors: Record<string, string> = {
  confirmado: 'bg-green-100 text-green-700',
  negociando: 'bg-yellow-100 text-yellow-700',
  aguardando: 'bg-gray-100 text-gray-600',
  entregue: 'bg-blue-100 text-blue-700',
};

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    getPedidos().then((r) => setPedidos(r.data)).catch(() => {});
  }, []);

  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-8">
      <h1 className="text-xl font-extrabold text-sidebar mb-6">Pedidos</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">Cliente</th>
              <th className="px-5 py-3 text-left">Valor</th>
              <th className="px-5 py-3 text-left">Origem</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Data</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8">Nenhum pedido ainda.</td>
              </tr>
            ) : (
              pedidos.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-bold text-sidebar">#{p.id}</td>
                  <td className="px-5 py-3 text-gray-600">Cliente #{p.cliente_id}</td>
                  <td className="px-5 py-3 font-bold text-accent">{fmt(p.valor_total)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.origem === 'ia' ? 'bg-sidebar/10 text-sidebar' : 'bg-orange-50 text-accent'}`}>
                      {p.origem === 'ia' ? '🤖 IA' : '👤 Humano'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{fmtDate(p.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
