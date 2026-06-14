import { useEffect, useState, FormEvent } from 'react';
import { getPedidos, mudarStatusPedido, getClientes, criarPedido, getProdutos, gerarPagamento, marcarPago, ItemPedidoInput } from '../api/client';
import { Pedido, ItemPedido, Cliente, Produto } from '../types';

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

const itemVazio: ItemPedidoInput = { produto: '', qtd_kg: 0, preco_kg: 0 };

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [itens, setItens] = useState<ItemPedidoInput[]>([{ ...itemVazio }]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [pagamentoPedido, setPagamentoPedido] = useState<Pedido | null>(null);
  const [gerandoPagamento, setGerandoPagamento] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | Pedido['status']>('todos');
  const [filtroPagamento, setFiltroPagamento] = useState<'todos' | 'pago' | 'pendente'>('todos');

  function carregarPedidos() {
    getPedidos().then((r) => setPedidos(r.data)).catch(() => {});
  }

  useEffect(() => {
    carregarPedidos();
    getClientes().then((r) => setClientes(r.data)).catch(() => {});
    getProdutos().then((r) => setProdutos(r.data)).catch(() => {});
  }, []);

  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  const totalForm = itens.reduce((acc, it) => acc + (it.qtd_kg || 0) * (it.preco_kg || 0), 0);

  async function alterarStatus(p: Pedido, status: Pedido['status']) {
    try {
      const r = await mudarStatusPedido(p.id, status);
      setPedidos((prev) => prev.map((x) => (x.id === p.id ? r.data : x)));
    } catch {
      // ignora erro na demo
    }
  }

  function atualizarPedido(p: Pedido) {
    setPedidos((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    setPagamentoPedido((prev) => (prev && prev.id === p.id ? p : prev));
  }

  async function handleGerarPagamento(p: Pedido, metodo: 'pix' | 'boleto') {
    setGerandoPagamento(true);
    setCopiado(false);
    try {
      const r = await gerarPagamento(p.id, metodo);
      atualizarPedido(r.data);
      setPagamentoPedido(r.data);
    } catch {
      // ignora erro na demo
    } finally {
      setGerandoPagamento(false);
    }
  }

  async function handleMarcarPago(p: Pedido) {
    try {
      const r = await marcarPago(p.id);
      atualizarPedido(r.data);
    } catch {
      // ignora erro na demo
    }
  }

  function copiar(texto: string) {
    navigator.clipboard?.writeText(texto).then(
      () => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      },
      () => {}
    );
  }

  function atualizarItem(idx: number, campo: keyof ItemPedidoInput, valor: string) {
    setItens((prev) =>
      prev.map((it, i) =>
        i === idx ? { ...it, [campo]: campo === 'produto' ? valor : Number(valor) } : it
      )
    );
  }

  function selecionarProduto(idx: number, nome: string) {
    const prod = produtos.find((p) => p.nome === nome);
    setItens((prev) =>
      prev.map((it, i) =>
        i === idx
          ? { ...it, produto: nome, preco_kg: prod ? prod.preco_kg : it.preco_kg }
          : it
      )
    );
  }

  function adicionarItem() {
    setItens((prev) => [...prev, { ...itemVazio }]);
  }

  function removerItem(idx: number) {
    setItens((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  }

  function abrirForm() {
    setClienteId('');
    setItens([{ ...itemVazio }]);
    setErro('');
    setMostrarForm(true);
  }

  async function handleSalvar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    if (clienteId === '') {
      setErro('Selecione um cliente.');
      return;
    }
    const itensValidos = itens.filter((it) => it.produto.trim() && it.qtd_kg > 0 && it.preco_kg > 0);
    if (itensValidos.length === 0) {
      setErro('Adicione ao menos um item válido.');
      return;
    }
    setSalvando(true);
    try {
      await criarPedido({ cliente_id: Number(clienteId), itens: itensValidos });
      setMostrarForm(false);
      carregarPedidos();
    } catch {
      setErro('Não foi possível salvar o pedido.');
    } finally {
      setSalvando(false);
    }
  }

  const termo = busca.trim().toLowerCase();
  const pedidosFiltrados = pedidos.filter((p) => {
    const casaBusca = termo === '' || p.cliente_nome.toLowerCase().includes(termo);
    const casaStatus = filtroStatus === 'todos' || p.status === filtroStatus;
    const casaPagamento =
      filtroPagamento === 'todos' ||
      (filtroPagamento === 'pago' ? p.pago : !p.pago);
    return casaBusca && casaStatus && casaPagamento;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold text-sidebar">Pedidos</h1>
        <button
          onClick={abrirForm}
          className="bg-accent text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-700 transition-colors"
        >
          + Novo pedido
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por cliente..."
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
        />
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as 'todos' | Pedido['status'])}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent sm:w-44"
        >
          <option value="todos">Todos os status</option>
          {STATUS_OPCOES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filtroPagamento}
          onChange={(e) => setFiltroPagamento(e.target.value as 'todos' | 'pago' | 'pendente')}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent sm:w-44"
        >
          <option value="todos">Todos pagamentos</option>
          <option value="pago">Pago</option>
          <option value="pendente">Pendente</option>
        </select>
      </div>

      <p className="text-xs font-semibold text-gray-400 mb-4">
        {pedidosFiltrados.length} {pedidosFiltrados.length === 1 ? 'pedido' : 'pedidos'}
      </p>

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
              <th className="px-5 py-3 text-left">Pagamento</th>
              <th className="px-5 py-3 text-left">Data</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-8">Nenhum pedido ainda.</td>
              </tr>
            ) : pedidosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-8">Nenhum pedido encontrado para os filtros aplicados.</td>
              </tr>
            ) : (
              pedidosFiltrados.map((p) => {
                const itensP = parseItens(p.itens_json);
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-bold text-sidebar">#{p.id}</td>
                    <td className="px-5 py-3 text-gray-600">{p.cliente_nome}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {itensP.length === 0 ? (
                        <span className="text-gray-300">—</span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {itensP.map((it, i) => (
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
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1.5 items-start">
                        {p.pago ? (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">Pago</span>
                        ) : p.metodo_pagamento ? (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">Pendente</span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-500">—</span>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {!p.metodo_pagamento && (
                            <>
                              <button
                                onClick={() => handleGerarPagamento(p, 'pix')}
                                className="text-[11px] font-semibold text-accent hover:underline"
                              >
                                Gerar Pix
                              </button>
                              <button
                                onClick={() => handleGerarPagamento(p, 'boleto')}
                                className="text-[11px] font-semibold text-accent hover:underline"
                              >
                                Gerar Boleto
                              </button>
                            </>
                          )}
                          {p.metodo_pagamento && (
                            <button
                              onClick={() => {
                                setCopiado(false);
                                setPagamentoPedido(p);
                              }}
                              className="text-[11px] font-semibold text-accent hover:underline"
                            >
                              Ver código
                            </button>
                          )}
                          {p.metodo_pagamento && !p.pago && (
                            <button
                              onClick={() => handleMarcarPago(p)}
                              className="text-[11px] font-semibold text-green-700 hover:underline"
                            >
                              Marcar como pago
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{fmtDate(p.created_at)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {mostrarForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setMostrarForm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-sidebar">Novo pedido</h2>
              <button onClick={() => setMostrarForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Cliente</label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                >
                  <option value="">Selecione...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-600">Itens</label>
                  <button
                    type="button"
                    onClick={adicionarItem}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    + Adicionar item
                  </button>
                </div>
                <div className="space-y-2">
                  {itens.map((it, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select
                        value={it.produto}
                        onChange={(e) => selecionarProduto(idx, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                      >
                        <option value="">Selecione o produto...</option>
                        {it.produto && !produtos.some((p) => p.nome === it.produto) && (
                          <option value={it.produto}>{it.produto}</option>
                        )}
                        {produtos.map((p) => (
                          <option key={p.id} value={p.nome}>
                            {p.nome}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={it.qtd_kg || ''}
                        onChange={(e) => atualizarItem(idx, 'qtd_kg', e.target.value)}
                        placeholder="kg"
                        className="w-20 px-2 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={it.preco_kg || ''}
                        onChange={(e) => atualizarItem(idx, 'preco_kg', e.target.value)}
                        placeholder="R$/kg"
                        className="w-24 px-2 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={() => removerItem(idx)}
                        disabled={itens.length === 1}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-30 px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm font-semibold text-gray-600">Total</span>
                <span className="text-lg font-extrabold text-accent">{fmt(totalForm)}</span>
              </div>

              {erro && <p className="text-red-500 text-sm">{erro}</p>}
              <button
                type="submit"
                disabled={salvando}
                className="w-full bg-accent text-white font-bold py-2.5 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Salvar pedido'}
              </button>
            </form>
          </div>
        </div>
      )}

      {pagamentoPedido && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setPagamentoPedido(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-sidebar">
                Pagamento · Pedido #{pagamentoPedido.id}
              </h2>
              <button onClick={() => setPagamentoPedido(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {pagamentoPedido.metodo_pagamento && (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-50 text-accent uppercase">
                  {pagamentoPedido.metodo_pagamento}
                </span>
                {pagamentoPedido.pago ? (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">Pago</span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">Pendente</span>
                )}
              </div>
            )}

            {gerandoPagamento ? (
              <p className="text-gray-400 text-sm py-4 text-center">Gerando...</p>
            ) : pagamentoPedido.link_pagamento ? (
              <>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                  {pagamentoPedido.metodo_pagamento === 'boleto' ? 'Linha digitável' : 'Pix copia-e-cola'}
                </label>
                <div className="bg-bg border border-gray-200 rounded-xl p-3 text-xs text-gray-700 break-all font-mono">
                  {pagamentoPedido.link_pagamento}
                </div>
                <button
                  onClick={() => copiar(pagamentoPedido.link_pagamento || '')}
                  className="mt-3 w-full bg-accent text-white font-bold py-2.5 rounded-xl hover:bg-orange-700 transition-colors"
                >
                  {copiado ? 'Copiado!' : 'Copiar código'}
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleGerarPagamento(pagamentoPedido, 'pix')}
                  className="flex-1 bg-accent text-white font-bold py-2.5 rounded-xl hover:bg-orange-700 transition-colors"
                >
                  Gerar Pix
                </button>
                <button
                  onClick={() => handleGerarPagamento(pagamentoPedido, 'boleto')}
                  className="flex-1 bg-sidebar text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Gerar Boleto
                </button>
              </div>
            )}

            {pagamentoPedido.metodo_pagamento && !pagamentoPedido.pago && (
              <button
                onClick={() => handleMarcarPago(pagamentoPedido)}
                className="mt-3 w-full border border-green-600 text-green-700 font-bold py-2.5 rounded-xl hover:bg-green-50 transition-colors"
              >
                Marcar como pago
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
