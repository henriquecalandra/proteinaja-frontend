import { useEffect, useState } from 'react';
import { getPedidos, mudarStatusPedido } from '../api/client';
import { Pedido } from '../types';

const COLUNAS: { status: Pedido['status']; titulo: string; cor: string }[] = [
  { status: 'aguardando', titulo: 'Aguardando', cor: 'border-gray-300' },
  { status: 'negociando', titulo: 'Negociando', cor: 'border-yellow-400' },
  { status: 'confirmado', titulo: 'Confirmado', cor: 'border-green-400' },
  { status: 'entregue', titulo: 'Entregue', cor: 'border-blue-400' },
];

const fmt = (n: number) =>
  (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Funil() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [colunaAtiva, setColunaAtiva] = useState<Pedido['status'] | null>(null);

  useEffect(() => {
    getPedidos()
      .then((r) => setPedidos(r.data))
      .catch(() => {});
  }, []);

  function onDragStart(e: React.DragEvent, pedidoId: number) {
    setArrastando(pedidoId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(pedidoId));
  }

  function onDragEnd() {
    setArrastando(null);
    setColunaAtiva(null);
  }

  function onDragOver(e: React.DragEvent, status: Pedido['status']) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (colunaAtiva !== status) setColunaAtiva(status);
  }

  async function onDrop(e: React.DragEvent, novoStatus: Pedido['status']) {
    e.preventDefault();
    setColunaAtiva(null);
    const id = Number(e.dataTransfer.getData('text/plain')) || arrastando;
    setArrastando(null);
    if (!id) return;

    const atual = pedidos.find((p) => p.id === id);
    if (!atual || atual.status === novoStatus) return;

    const anterior = atual.status;
    // Atualização otimista do estado local.
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status: novoStatus } : p)));

    try {
      const r = await mudarStatusPedido(id, novoStatus);
      setPedidos((prev) => prev.map((p) => (p.id === id ? r.data : p)));
    } catch {
      // Reverte em caso de erro.
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status: anterior } : p)));
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-extrabold text-sidebar mb-1">Funil de pedidos</h1>
      <p className="text-xs font-semibold text-gray-400 mb-6">
        Arraste os cards entre as colunas para atualizar o status.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUNAS.map((col) => {
          const doStatus = pedidos.filter((p) => p.status === col.status);
          return (
            <div
              key={col.status}
              onDragOver={(e) => onDragOver(e, col.status)}
              onDrop={(e) => onDrop(e, col.status)}
              className={`rounded-2xl bg-gray-50 border-t-4 ${col.cor} p-3 min-h-[60vh] transition-colors ${
                colunaAtiva === col.status ? 'ring-2 ring-accent ring-inset bg-orange-50/40' : ''
              }`}
            >
              <div className="flex items-center justify-between px-1 mb-3">
                <h2 className="text-sm font-extrabold text-sidebar">{col.titulo}</h2>
                <span className="text-xs font-bold text-gray-400 bg-white rounded-full px-2 py-0.5 border border-gray-100">
                  {doStatus.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {doStatus.length === 0 ? (
                  <p className="text-center text-gray-300 text-xs py-6">Nenhum pedido</p>
                ) : (
                  doStatus.map((p) => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, p.id)}
                      onDragEnd={onDragEnd}
                      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                        arrastando === p.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sidebar text-sm">{p.cliente_nome}</span>
                        <span className="text-[11px] font-semibold text-gray-300">#{p.id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-accent text-sm">
                          {fmt(p.valor_total)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            p.origem === 'ia'
                              ? 'bg-sidebar/10 text-sidebar'
                              : 'bg-orange-50 text-accent'
                          }`}
                        >
                          {p.origem === 'ia' ? '🤖 IA' : '👤 Humano'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
