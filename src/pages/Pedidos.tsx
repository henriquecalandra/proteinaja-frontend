import { useEffect, useState } from 'react';
import { getPedidos, mudarStatusPedido } from '../api/client';
import { Pedido, ItemPedido } from '../types';

const STATUS_OPCOES: Pedido['status'][] = ['confirmado', 'negociando', 'aguardando', 'entregue'];

function parseItens(json: string): ItemPedido[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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

  async function alterarStatus(p: Pedido, status: Pedido['status']) {
    try {
      const r = await mudarStatusPedido(p.id, status);
      setPedidos((prev) => prev.map((x) => (x.id === p.id ? r.data : x)));
    } catch {
      // ignora erro na demo
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-extrabold text-sidebar mb-6">Pedidos</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">Cliente</th>
              <th className="px-5 py-3 text-left">Itens</th>
              <th className="px-5 py-3 text-left">Valor</th>
              <th className="px-5 py-3 text-left">Origem</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Data</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-8">Nenhum pedido ainda.</td>
              </tr>
            ) : (
              pedidos.map((p) => {
                const itens = parseItens(p.itens_json);
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-bold text-sidebar">#{p.id}</td>
                    <td className="px-5 py-3 text-gray-600">{p.cliente_nome}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {itens.length === 0 ? (
                        <span className="text-gray-300">—</span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {itens.map((it, i) => (
                            <span key={i} className="text-xs">
                              {it.produto} {it.qtd_kg}kg
                              <span className="text-gray-400"> · {fmt(it.preco_kg)}/kg</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-bold text-accent">{fmt(p.valor_total)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.origem === 'ia' ? 'bg-sidebar/10 text-sidebar' : 'bg-orange-50 text-accent'}`}>
                        {p.origem === 'ia' ? '🤖 IA' : '👤 Humano'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={p.status}
                        onChange={(e) => alterarStatus(p, e.target.value as Pedido['status'])}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${statusColors[p.status]}`}
                      >
                        {STATUS_OPCOES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{fmtDate(p.created_at)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
