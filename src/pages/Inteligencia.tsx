import { useEffect, useState } from 'react';
import { getComparativo, getInativos, getReposicao } from '../api/client';
import { Comparativo, ClienteInativo, ClienteReposicao } from '../types';
import { abrirWhatsapp } from '../utils/whatsapp';

const fmt = (n: number) =>
  (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function fmtDate(s: string | null): string {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Inteligencia() {
  const [comparativo, setComparativo] = useState<Comparativo | null>(null);
  const [inativos, setInativos] = useState<ClienteInativo[]>([]);
  const [reposicao, setReposicao] = useState<ClienteReposicao[]>([]);
  const [dias, setDias] = useState(30);

  useEffect(() => {
    getComparativo().then((r) => setComparativo(r.data)).catch(() => {});
    getReposicao().then((r) => setReposicao(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    getInativos(dias).then((r) => setInativos(r.data)).catch(() => {});
  }, [dias]);

  const pctIa = comparativo ? Math.round(comparativo.pct_ia) : 0;
  const maxVolume = comparativo
    ? Math.max(comparativo.ia.volume, comparativo.humano.volume, 1)
    : 1;
  const maxPedidos = comparativo
    ? Math.max(comparativo.ia.pedidos, comparativo.humano.pedidos, 1)
    : 1;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-xl font-extrabold text-sidebar">Inteligência</h1>

      {/* IA x Equipe humana */}
      <section>
        <h2 className="text-sm font-extrabold text-gray-500 uppercase tracking-wide mb-3">
          IA x Equipe humana
        </h2>
        {!comparativo ? (
          <p className="text-gray-400 text-sm">Carregando...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-gray-400 uppercase">% feito pela IA</span>
              <span className="text-4xl font-extrabold text-accent mt-2">{pctIa}%</span>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="bg-accent h-full rounded-full transition-all"
                  style={{ width: `${pctIa}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Pedidos</span>
              <div className="mt-3 space-y-3">
                {[
                  { label: '🤖 IA', val: comparativo.ia.pedidos, cor: 'bg-sidebar' },
                  { label: '👤 Humano', val: comparativo.humano.pedidos, cor: 'bg-accent' },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                      <span>{row.label}</span>
                      <span>{row.val}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${row.cor} h-full rounded-full transition-all`}
                        style={{ width: `${(row.val / maxPedidos) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Volume (R$)</span>
              <div className="mt-3 space-y-3">
                {[
                  { label: '🤖 IA', val: comparativo.ia.volume, cor: 'bg-sidebar' },
                  { label: '👤 Humano', val: comparativo.humano.volume, cor: 'bg-accent' },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                      <span>{row.label}</span>
                      <span>{fmt(row.val)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${row.cor} h-full rounded-full transition-all`}
                        style={{ width: `${(row.val / maxVolume) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <span className="text-xs font-semibold text-gray-400 uppercase">Ticket médio</span>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">🤖 IA</span>
                  <span className="font-extrabold text-sidebar">{fmt(comparativo.ia.ticket_medio)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">👤 Humano</span>
                  <span className="font-extrabold text-accent">{fmt(comparativo.humano.ticket_medio)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Clientes inativos */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-gray-500 uppercase tracking-wide">
            Clientes inativos
          </h2>
          <select
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
          >
            <option value={15}>Sem comprar há 15+ dias</option>
            <option value={30}>Sem comprar há 30+ dias</option>
            <option value={60}>Sem comprar há 60+ dias</option>
            <option value={90}>Sem comprar há 90+ dias</option>
          </select>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Cliente</th>
                <th className="px-5 py-3 text-left">Dias sem comprar</th>
                <th className="px-5 py-3 text-left">Último pedido</th>
                <th className="px-5 py-3 text-left">Total pedidos</th>
                <th className="px-5 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {inativos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">
                    Nenhum cliente inativo neste período.
                  </td>
                </tr>
              ) : (
                inativos.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-bold text-sidebar">{c.nome}</span>
                      {c.cidade && <span className="text-gray-400 text-xs"> · {c.cidade}</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                        {c.dias_sem_comprar} dias
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{fmtDate(c.ultimo_pedido)}</td>
                    <td className="px-5 py-3 text-gray-600">{c.total_pedidos}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() =>
                          abrirWhatsapp(
                            c.whatsapp,
                            `Olá ${c.nome}, sentimos sua falta! Quer repor seu pedido?`
                          )
                        }
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        💬 WhatsApp
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reposição sugerida */}
      <section>
        <h2 className="text-sm font-extrabold text-gray-500 uppercase tracking-wide mb-3">
          Reposição sugerida
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Cliente</th>
                <th className="px-5 py-3 text-left">Intervalo médio</th>
                <th className="px-5 py-3 text-left">Último pedido</th>
                <th className="px-5 py-3 text-left">Próxima sugerida</th>
                <th className="px-5 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {reposicao.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">
                    Sem sugestões de reposição no momento.
                  </td>
                </tr>
              ) : (
                reposicao.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-bold text-sidebar">{c.nome}</span>
                      {c.devido && (
                        <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-accent">
                          Repor agora
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {Math.round(c.intervalo_medio_dias)} dias
                    </td>
                    <td className="px-5 py-3 text-gray-400">{fmtDate(c.ultimo_pedido)}</td>
                    <td className="px-5 py-3 text-gray-600">{fmtDate(c.proxima_sugerida)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() =>
                          abrirWhatsapp(
                            c.whatsapp,
                            `Olá ${c.nome}, já é hora de repor seu pedido? Posso preparar o de sempre para você!`
                          )
                        }
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        💬 WhatsApp
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
