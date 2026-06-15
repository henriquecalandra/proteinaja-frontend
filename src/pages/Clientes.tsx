import { useEffect, useState, FormEvent } from 'react';
import {
  getClientes,
  criarCliente,
  atualizarCliente,
  getClienteDetalhe,
  getVendedores,
  ClienteCreatePayload,
  ClienteUpdatePayload,
} from '../api/client';
import { Cliente, ClienteDetalhe, Vendedor } from '../types';

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

const condicaoOpcoes = ['À vista', '30 dias', '30/60', '30/60/90', '45 dias', '60 dias'];

const conversaStatusLabel: Record<string, string> = {
  agente: '🤖 Agente',
  humano: '👤 Humano',
  encerrada: '✓ Encerrada',
};

interface FormState {
  nome: string;
  razao_social: string;
  cnpj: string;
  inscricao_estadual: string;
  tipo: Cliente['tipo'];
  atendido_por_ia: boolean;
  contato_nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  vendedor_id: string;
  condicao_pagamento: string;
  limite_credito: number;
}

const formVazio: FormState = {
  nome: '',
  razao_social: '',
  cnpj: '',
  inscricao_estadual: '',
  tipo: 'acougue',
  atendido_por_ia: true,
  contato_nome: '',
  email: '',
  telefone: '',
  whatsapp: '',
  endereco: '',
  bairro: '',
  cidade: '',
  uf: '',
  cep: '',
  vendedor_id: '',
  condicao_pagamento: '',
  limite_credito: 0,
};

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState<FormState>(formVazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [detalhe, setDetalhe] = useState<ClienteDetalhe | null>(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | Cliente['tipo']>('todos');

  const fmtMoeda = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtData = (s: string) =>
    new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const vendedorNome = (id: number | null | undefined) =>
    id != null ? vendedores.find((v) => v.id === id)?.nome ?? null : null;

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
    getVendedores().then((r) => setVendedores(r.data)).catch(() => {});
  }, []);

  function abrirNovo() {
    setEditando(null);
    setForm(formVazio);
    setErro('');
    setMostrarForm(true);
  }

  function abrirEdicao(c: Cliente) {
    setEditando(c);
    setForm({
      nome: c.nome,
      razao_social: c.razao_social ?? '',
      cnpj: c.cnpj ?? '',
      inscricao_estadual: c.inscricao_estadual ?? '',
      tipo: c.tipo,
      atendido_por_ia: c.atendido_por_ia,
      contato_nome: c.contato_nome ?? '',
      email: c.email ?? '',
      telefone: c.telefone ?? '',
      whatsapp: c.whatsapp,
      endereco: c.endereco ?? '',
      bairro: c.bairro ?? '',
      cidade: c.cidade ?? '',
      uf: c.uf ?? '',
      cep: c.cep ?? '',
      vendedor_id: c.vendedor_id != null ? String(c.vendedor_id) : '',
      condicao_pagamento: c.condicao_pagamento ?? '',
      limite_credito: c.limite_credito ?? 0,
    });
    setErro('');
    setMostrarForm(true);
  }

  function montarPayload(): ClienteCreatePayload {
    return {
      nome: form.nome.trim(),
      whatsapp: form.whatsapp.trim(),
      tipo: form.tipo,
      atendido_por_ia: form.atendido_por_ia,
      cnpj: form.cnpj.trim() || null,
      razao_social: form.razao_social.trim() || null,
      inscricao_estadual: form.inscricao_estadual.trim() || null,
      contato_nome: form.contato_nome.trim() || null,
      email: form.email.trim() || null,
      telefone: form.telefone.trim() || null,
      endereco: form.endereco.trim() || null,
      bairro: form.bairro.trim() || null,
      cidade: form.cidade.trim() || null,
      uf: form.uf.trim() || null,
      cep: form.cep.trim() || null,
      vendedor_id: form.vendedor_id ? Number(form.vendedor_id) : null,
      condicao_pagamento: form.condicao_pagamento || null,
      limite_credito: form.limite_credito > 0 ? form.limite_credito : null,
    };
  }

  async function handleSalvar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    if (!form.nome.trim()) {
      setErro('Informe o nome do cliente.');
      return;
    }
    if (!form.whatsapp.trim()) {
      setErro('Informe o WhatsApp.');
      return;
    }
    setSalvando(true);
    try {
      if (editando) {
        const payload: ClienteUpdatePayload = montarPayload();
        const { data } = await atualizarCliente(editando.id, payload);
        setClientes((prev) =>
          prev.map((x) => (x.id === editando.id ? data : x)).sort((a, b) => a.nome.localeCompare(b.nome))
        );
      } else {
        const { data } = await criarCliente(montarPayload());
        setClientes((prev) => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      }
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

  const termo = busca.trim().toLowerCase();
  const clientesFiltrados = clientes.filter((c) => {
    const casaBusca =
      termo === '' ||
      c.nome.toLowerCase().includes(termo) ||
      (c.cidade ?? '').toLowerCase().includes(termo) ||
      c.whatsapp.toLowerCase().includes(termo);
    const casaTipo = filtroTipo === 'todos' || c.tipo === filtroTipo;
    return casaBusca && casaTipo;
  });

  const inputClass =
    'w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent';
  const labelClass = 'block text-sm font-semibold text-gray-600 mb-1';
  const secaoClass = 'text-xs font-extrabold uppercase tracking-wide text-accent mt-2 mb-1';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold text-sidebar">Clientes</h1>
        <button
          onClick={abrirNovo}
          className="bg-accent text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-700 transition-colors"
        >
          + Novo cliente
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, cidade ou WhatsApp..."
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
        />
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value as 'todos' | Cliente['tipo'])}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent sm:w-52"
        >
          <option value="todos">Todos os tipos</option>
          {tipoOpcoes.map((t) => (
            <option key={t} value={t}>{tipoLabel[t]}</option>
          ))}
        </select>
      </div>

      <p className="text-xs font-semibold text-gray-400 mb-4">
        {clientesFiltrados.length} {clientesFiltrados.length === 1 ? 'cliente' : 'clientes'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.length === 0 ? (
          <p className="text-gray-400 text-sm col-span-3">Nenhum cliente cadastrado ainda.</p>
        ) : clientesFiltrados.length === 0 ? (
          <p className="text-gray-400 text-sm col-span-3">Nenhum cliente encontrado para os filtros aplicados.</p>
        ) : (
          clientesFiltrados.map((c) => (
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
              {c.cnpj && <div className="text-xs text-gray-400 mb-1">🏢 CNPJ {c.cnpj}</div>}
              {vendedorNome(c.vendedor_id) && (
                <div className="text-xs text-gray-400 mb-3">🧑‍💼 {vendedorNome(c.vendedor_id)}</div>
              )}
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
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirEdicao(c);
                    }}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    Editar
                  </button>
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
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-sidebar">
                {editando ? 'Editar cliente' : 'Novo cliente'}
              </h2>
              <button onClick={() => setMostrarForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSalvar} className="space-y-3">
              {/* Dados gerais */}
              <div className={secaoClass}>Dados gerais</div>
              <div>
                <label className={labelClass}>Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Razão social</label>
                <input
                  type="text"
                  value={form.razao_social}
                  onChange={(e) => setForm({ ...form, razao_social: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>CNPJ</label>
                  <input
                    type="text"
                    value={form.cnpj}
                    onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Inscrição estadual</label>
                  <input
                    type="text"
                    value={form.inscricao_estadual}
                    onChange={(e) => setForm({ ...form, inscricao_estadual: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Tipo</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as Cliente['tipo'] })}
                  className={inputClass}
                >
                  {tipoOpcoes.map((t) => (
                    <option key={t} value={t}>{tipoLabel[t]}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <input
                  type="checkbox"
                  checked={form.atendido_por_ia}
                  onChange={(e) => setForm({ ...form, atendido_por_ia: e.target.checked })}
                  className="h-4 w-4 accent-accent"
                />
                Atendido por IA
              </label>

              {/* Contato */}
              <div className={secaoClass}>Contato</div>
              <div>
                <label className={labelClass}>Nome do contato</label>
                <input
                  type="text"
                  value={form.contato_nome}
                  onChange={(e) => setForm({ ...form, contato_nome: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>E-mail</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Telefone</label>
                  <input
                    type="text"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>WhatsApp</label>
                <input
                  type="text"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  required
                  placeholder="5562999990000"
                  className={inputClass}
                />
              </div>

              {/* Endereço */}
              <div className={secaoClass}>Endereço</div>
              <div>
                <label className={labelClass}>Endereço</label>
                <input
                  type="text"
                  value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Bairro</label>
                  <input
                    type="text"
                    value={form.bairro}
                    onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Cidade</label>
                  <input
                    type="text"
                    value={form.cidade}
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={form.uf}
                    onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>CEP</label>
                  <input
                    type="text"
                    value={form.cep}
                    onChange={(e) => setForm({ ...form, cep: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Comercial */}
              <div className={secaoClass}>Comercial</div>
              <div>
                <label className={labelClass}>Vendedor responsável</label>
                <select
                  value={form.vendedor_id}
                  onChange={(e) => setForm({ ...form, vendedor_id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Sem vendedor</option>
                  {vendedores.map((v) => (
                    <option key={v.id} value={String(v.id)}>{v.nome}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Condição de pagamento</label>
                  <select
                    value={form.condicao_pagamento}
                    onChange={(e) => setForm({ ...form, condicao_pagamento: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Não definida</option>
                    {condicaoOpcoes.map((co) => (
                      <option key={co} value={co}>{co}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Limite de crédito (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.limite_credito || ''}
                    onChange={(e) => setForm({ ...form, limite_credito: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
              </div>

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
                    {detalhe.cliente.razao_social && (
                      <div className="text-xs text-gray-400">{detalhe.cliente.razao_social}</div>
                    )}
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

                <div className="space-y-1 mb-4 text-sm text-gray-600">
                  <div>📱 {detalhe.cliente.whatsapp}</div>
                  {detalhe.cliente.telefone && <div>☎️ {detalhe.cliente.telefone}</div>}
                  {detalhe.cliente.email && <div>✉️ {detalhe.cliente.email}</div>}
                  {detalhe.cliente.contato_nome && <div>👤 Contato: {detalhe.cliente.contato_nome}</div>}
                  {detalhe.cliente.cnpj && <div>🏢 CNPJ {detalhe.cliente.cnpj}</div>}
                  {detalhe.cliente.inscricao_estadual && <div>🧾 IE {detalhe.cliente.inscricao_estadual}</div>}
                </div>

                {(detalhe.cliente.endereco ||
                  detalhe.cliente.bairro ||
                  detalhe.cliente.cidade ||
                  detalhe.cliente.uf ||
                  detalhe.cliente.cep) && (
                  <div className="mb-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wide text-accent mb-1">Endereço</h3>
                    <div className="text-sm text-gray-600">
                      {[detalhe.cliente.endereco, detalhe.cliente.bairro].filter(Boolean).join(', ')}
                      {(detalhe.cliente.endereco || detalhe.cliente.bairro) &&
                        (detalhe.cliente.cidade || detalhe.cliente.uf || detalhe.cliente.cep) &&
                        ' · '}
                      {[
                        [detalhe.cliente.cidade, detalhe.cliente.uf].filter(Boolean).join('/'),
                        detalhe.cliente.cep,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-accent mb-1">Comercial</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>🧑‍💼 Vendedor: {vendedorNome(detalhe.cliente.vendedor_id) ?? '—'}</div>
                    <div>💳 Condição: {detalhe.cliente.condicao_pagamento ?? '—'}</div>
                    <div>
                      💰 Limite de crédito:{' '}
                      {detalhe.cliente.limite_credito != null
                        ? fmtMoeda(detalhe.cliente.limite_credito)
                        : '—'}
                    </div>
                  </div>
                  <div className="flex gap-4 pt-3">
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

                {detalhe.cliente.observacoes && (
                  <div className="mb-5">
                    <h3 className="text-xs font-extrabold uppercase tracking-wide text-accent mb-1">Observações</h3>
                    <p className="text-sm text-gray-600">{detalhe.cliente.observacoes}</p>
                  </div>
                )}

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
