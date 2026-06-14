import { useEffect, useState, FormEvent } from 'react';
import { getClientes, criarCliente, atualizarCliente, getClienteDetalhe, ClienteCreatePayload } from '../api/client';
import { Cliente, ClienteDetalhe } from '../types';

const tipoLabel: Record<string, string> = {
  acougue: 'Açougue',
  restaurante: 'Restaurante',
  mercadinho: 'Mercadinho',
  food_service: 'Food Service',
};

const tipoColor: Record<string, string> = {
  acougue: 'bg-red-100 text-red-700',
  restaurante: 'bg-purple-100 text-purple-700',
  mercadinho: 'bg-blue-100 text-blue-700',
  food_service: 'bg-green-100 text-green-700',
};

const tipoOpcoes: Cliente['tipo'][] = ['acougue', 'restaurante', 'mercadinho', 'food_service'];

const conversaStatusLabel: Record<string, string> = {
  agente: '🤖 Agente',
  humano: '👤 Humano',
  encerrada: '✓ Encerrada',
};

const formVazio: ClienteCreatePayload = {
  nome: '',
  whatsapp: '',
  tipo: 'acougue',
  cnpj: '',
  cidade: '',
  atendido_por_ia: true,
};

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState<ClienteCreatePayload>(formVazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [detalhe, setDetalhe] = useState<ClienteDetalhe | null>(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);

  const fmtMoeda = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtData = (s: string) =>
    new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  async function abrirDetalhe(c: Cliente) {
    setCarregandoDetalhe(true);
    setDetalhe(null);
    try {
      const { data } = await getClienteDetalhe(c.id);
      setDetalhe(data);
    } catch {
      // ignora erro na demo
    } finally {
      setCarregandoDetalhe(false);
    }
  }

  useEffect(() => {
    getClientes().then((r) => setClientes(r.data)).catch(() => {});
  }, []);

  async function handleSalvar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      const payload: ClienteCreatePayload = {
        ...form,
        cnpj: form.cnpj || null,
        cidade: form.cidade || null,
      };
      const { data } = await criarCliente(payload);
      setClientes((prev) => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      setForm(formVazio);
      setMostrarForm(false);
    } catch (err: any) {
      setErro(err?.response?.status === 409 ? 'WhatsApp já cadastrado.' : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  async function toggleIA(c: Cliente) {
    try {
      const { data } = await atualizarCliente(c.id, { atendido_por_ia: !c.atendido_por_ia });
      setClientes((prev) => prev.map((x) => (x.id === c.id ? data : x)));
    } catch {
      // ignora erro na demo
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold text-sidebar">Clientes</h1>
        <button
          onClick={() => setMostrarForm(true)}
          className="bg-accent text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-700 transition-colors"
        >
          + Novo cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.length === 0 ? (
          <p className="text-gray-400 text-sm col-span-3">Nenhum cliente cadastrado ainda.</p>
        ) : (
          clientes.map((c) => (
            <div
              key={c.id}
              onClick={() => abrirDetalhe(c)}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-accent/40 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-bold text-sidebar text-sm">{c.nome}</div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tipoColor[c.tipo]}`}>
                  {tipoLabel[c.tipo]}
                </span>
              </div>
              {c.cidade && <div className="text-xs text-gray-400 mb-1">📍 {c.cidade}</div>}
              {c.cnpj && <div className="text-xs text-gray-400 mb-3">🏢 CNPJ {c.cnpj}</div>}
              <div className="flex gap-4 mb-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">Pedidos</div>
                  <div className="text-sm font-bold text-sidebar">{c.total_pedidos}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">Total comprado</div>
                  <div className="text-sm font-bold text-accent">
                    {c.valor_total_comprado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    c.atendido_por_ia ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {c.atendido_por_ia ? '🤖 IA' : '👤 Manual'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleIA(c);
                  }}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  {c.atendido_por_ia ? 'Mudar p/ Manual' : 'Mudar p/ IA'}
                </button>
              </div>
              <a
                href={`https://wa.me/${c.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold text-accent hover:underline"
              >
                📱 {c.whatsapp}
              </a>
              {!c.ativo && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inativo</span>
              )}
            </div>
          ))
        )}
      </div>

      {mostrarForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setMostrarForm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-sidebar">Novo cliente</h2>
              <button onClick={() => setMostrarForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSalvar} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  required
                  placeholder="5562999990000"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={form.cnpj ?? ''}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as Cliente['tipo'] })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                >
                  {tipoOpcoes.map((t) => (
                    <option key={t} value={t}>{tipoLabel[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Cidade</label>
                <input
                  type="text"
                  value={form.cidade ?? ''}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <input
                  type="checkbox"
                  checked={form.atendido_por_ia ?? true}
                  onChange={(e) => setForm({ ...form, atendido_por_ia: e.target.checked })}
                  className="h-4 w-4 accent-accent"
                />
                Atendido por IA
              </label>
              {erro && <p className="text-red-500 text-sm">{erro}</p>}
              <button
                type="submit"
                disabled={salvando}
                className="w-full bg-accent text-white font-bold py-2.5 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Salvar cliente'}
              </button>
            </form>
          </div>
        </div>
      )}

      {(detalhe || carregandoDetalhe) && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setDetalhe(null);
            setCarregandoDetalhe(false);
          }}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {carregandoDetalhe || !detalhe ? (
              <p className="text-gray-400 text-sm py-8 text-center">Carregando...</p>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-sidebar">{detalhe.cliente.nome}</h2>
                    <span className={`inline-block mt-1 text-xs font-semibold px-2 py-1 rounded-full ${tipoColor[detalhe.cliente.tipo]}`}>
                      {tipoLabel[detalhe.cliente.tipo]}
                    </span>
                  </div>
                  <button
                    onClick={() => setDetalhe(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1 mb-5 text-sm text-gray-600">
                  <div>📱 {detalhe.cliente.whatsapp}</div>
                  {detalhe.cliente.cidade && <div>📍 {detalhe.cliente.cidade}</div>}
                  {detalhe.cliente.cnpj && <div>🏢 CNPJ {detalhe.cliente.cnpj}</div>}
                  <div className="flex gap-4 pt-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">Pedidos</div>
                      <div className="text-sm font-bold text-sidebar">{detalhe.cliente.total_pedidos}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">Total comprado</div>
                      <div className="text-sm font-bold text-accent">{fmtMoeda(detalhe.cliente.valor_total_comprado)}</div>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className="text-sm font-extrabold text-sidebar mb-2">Pedidos</h3>
                  {detalhe.pedidos.length === 0 ? (
                    <p className="text-gray-400 text-sm">Nenhum pedido.</p>
                  ) : (
                    <div className="space-y-2">
                      {detalhe.pedidos.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2"
                        >
                          <div>
                            <div className="text-sm font-bold text-sidebar">#{p.id} · {fmtMoeda(p.valor_total)}</div>
                            <div className="text-xs text-gray-400">{fmtData(p.created_at)}</div>
                          </div>
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-sidebar mb-2">Conversas</h3>
                  {detalhe.conversas.length === 0 ? (
                    <p className="text-gray-400 text-sm">Nenhuma conversa.</p>
                  ) : (
                    <div className="space-y-2">
                      {detalhe.conversas.map((conv) => (
                        <div
                          key={conv.id}
                          className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2"
                        >
                          <span className="text-sm text-gray-600">Conversa #{conv.id}</span>
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            {conversaStatusLabel[conv.status] ?? conv.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
