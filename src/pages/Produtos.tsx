import { useEffect, useState, FormEvent } from 'react';
import {
  getProdutos,
  criarProduto,
  atualizarProduto,
  ProdutoCreatePayload,
} from '../api/client';
import { Produto } from '../types';

const categoriaColor: Record<string, string> = {
  Bovino: 'bg-red-100 text-red-700',
  Suino: 'bg-pink-100 text-pink-700',
  Aves: 'bg-yellow-100 text-yellow-700',
  Embutidos: 'bg-purple-100 text-purple-700',
};

const categoriaOpcoes = ['Bovino', 'Suino', 'Aves', 'Embutidos'];

const unidadeOpcoes = ['kg', 'un', 'cx'];

interface FormState {
  nome: string;
  categoria: string;
  preco_kg: number;
  ativo: boolean;
  sku: string;
  unidade: string;
  preco_custo: number;
  estoque: number;
  estoque_minimo: number;
  descricao: string;
}

const formVazio: FormState = {
  nome: '',
  categoria: '',
  preco_kg: 0,
  ativo: true,
  sku: '',
  unidade: 'kg',
  preco_custo: 0,
  estoque: 0,
  estoque_minimo: 0,
  descricao: '',
};

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState<FormState>(formVazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [somenteRuptura, setSomenteRuptura] = useState(false);

  function carregar() {
    getProdutos().then((r) => setProdutos(r.data)).catch(() => {});
  }

  useEffect(() => {
    carregar();
  }, []);

  const fmt = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const margem = (p: Produto) =>
    p.preco_custo && p.preco_custo > 0 && p.preco_kg > 0
      ? `${(((p.preco_kg - p.preco_custo) / p.preco_kg) * 100).toFixed(0)}%`
      : '—';

  function abrirNovo() {
    setEditando(null);
    setForm(formVazio);
    setErro('');
    setMostrarForm(true);
  }

  function abrirEdicao(p: Produto) {
    setEditando(p);
    setForm({
      nome: p.nome,
      categoria: p.categoria ?? '',
      preco_kg: p.preco_kg,
      ativo: p.ativo,
      sku: p.sku ?? '',
      unidade: p.unidade ?? 'kg',
      preco_custo: p.preco_custo ?? 0,
      estoque: p.estoque ?? 0,
      estoque_minimo: p.estoque_minimo ?? 0,
      descricao: p.descricao ?? '',
    });
    setErro('');
    setMostrarForm(true);
  }

  async function handleSalvar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    if (!form.nome.trim()) {
      setErro('Informe o nome do produto.');
      return;
    }
    if (!form.preco_kg || form.preco_kg <= 0) {
      setErro('Informe um preço válido.');
      return;
    }
    setSalvando(true);
    try {
      if (editando) {
        const { data } = await atualizarProduto(editando.id, {
          nome: form.nome,
          categoria: form.categoria || null,
          preco_kg: form.preco_kg,
          ativo: form.ativo,
          sku: form.sku.trim() || null,
          unidade: form.unidade,
          preco_custo: form.preco_custo > 0 ? form.preco_custo : null,
          estoque: form.estoque,
          estoque_minimo: form.estoque_minimo,
          descricao: form.descricao.trim() || null,
        });
        setProdutos((prev) => prev.map((x) => (x.id === editando.id ? data : x)));
      } else {
        const payload: ProdutoCreatePayload = {
          nome: form.nome,
          preco_kg: form.preco_kg,
          categoria: form.categoria || null,
          ativo: form.ativo,
          sku: form.sku.trim() || null,
          unidade: form.unidade,
          preco_custo: form.preco_custo > 0 ? form.preco_custo : null,
          estoque: form.estoque,
          estoque_minimo: form.estoque_minimo,
          descricao: form.descricao.trim() || null,
        };
        const { data } = await criarProduto(payload);
        setProdutos((prev) =>
          [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome))
        );
      }
      setMostrarForm(false);
    } catch (err: any) {
      setErro(
        err?.response?.status === 409
          ? 'Já existe um produto com esse nome.'
          : 'Não foi possível salvar.'
      );
    } finally {
      setSalvando(false);
    }
  }

  const categoriasDisponiveis = Array.from(
    new Set(produtos.map((p) => p.categoria).filter((c): c is string => !!c))
  ).sort((a, b) => a.localeCompare(b));

  const termo = busca.trim().toLowerCase();
  const produtosFiltrados = produtos.filter((p) => {
    const casaBusca =
      termo === '' ||
      p.nome.toLowerCase().includes(termo) ||
      (p.sku ?? '').toLowerCase().includes(termo);
    const casaCategoria = filtroCategoria === 'todas' || p.categoria === filtroCategoria;
    const casaRuptura = !somenteRuptura || p.estoque <= p.estoque_minimo;
    return casaBusca && casaCategoria && casaRuptura;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold text-sidebar">Produtos</h1>
        <button
          onClick={abrirNovo}
          className="bg-accent text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-700 transition-colors"
        >
          + Novo produto
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou SKU..."
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
        />
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent sm:w-52"
        >
          <option value="todas">Todas as categorias</option>
          {categoriasDisponiveis.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 whitespace-nowrap">
          <input
            type="checkbox"
            checked={somenteRuptura}
            onChange={(e) => setSomenteRuptura(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Somente em ruptura
        </label>
      </div>

      <p className="text-xs font-semibold text-gray-400 mb-4">
        {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'produto' : 'produtos'}
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Produto</th>
              <th className="px-5 py-3 text-left">SKU</th>
              <th className="px-5 py-3 text-left">Categoria</th>
              <th className="px-5 py-3 text-left">Un.</th>
              <th className="px-5 py-3 text-left">Estoque</th>
              <th className="px-5 py-3 text-left">Preço (R$/kg)</th>
              <th className="px-5 py-3 text-left">Margem</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-gray-400 py-8">
                  Nenhum produto cadastrado ainda.
                </td>
              </tr>
            ) : produtosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-gray-400 py-8">
                  Nenhum produto encontrado para os filtros aplicados.
                </td>
              </tr>
            ) : (
              produtosFiltrados.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-3 font-bold text-sidebar">{p.nome}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {p.sku ? p.sku : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    {p.categoria ? (
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          categoriaColor[p.categoria] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.categoria}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500 uppercase">{p.unidade}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sidebar">
                        {p.estoque.toLocaleString('pt-BR')}
                      </span>
                      {p.estoque <= p.estoque_minimo && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap">
                          Estoque baixo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-bold text-accent">{fmt(p.preco_kg)}</td>
                  <td className="px-5 py-3 font-semibold text-gray-600">{margem(p)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        p.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => abrirEdicao(p)}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
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
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-sidebar">
                {editando ? 'Editar produto' : 'Novo produto'}
              </h2>
              <button
                onClick={() => setMostrarForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">SKU</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Unidade</label>
                  <select
                    value={form.unidade}
                    onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                  >
                    {unidadeOpcoes.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Categoria</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                >
                  <option value="">Sem categoria</option>
                  {categoriaOpcoes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Preço (R$/kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.preco_kg || ''}
                    onChange={(e) => setForm({ ...form, preco_kg: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Preço de custo
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.preco_custo || ''}
                    onChange={(e) => setForm({ ...form, preco_custo: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Estoque</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.estoque || ''}
                    onChange={(e) => setForm({ ...form, estoque: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Estoque mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.estoque_minimo || ''}
                    onChange={(e) =>
                      setForm({ ...form, estoque_minimo: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent resize-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                  className="h-4 w-4 accent-accent"
                />
                Ativo
              </label>
              {erro && <p className="text-red-500 text-sm">{erro}</p>}
              <button
                type="submit"
                disabled={salvando}
                className="w-full bg-accent text-white font-bold py-2.5 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Salvar produto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
