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

interface FormState {
  nome: string;
  categoria: string;
  preco_kg: number;
  ativo: boolean;
}

const formVazio: FormState = {
  nome: '',
  categoria: '',
  preco_kg: 0,
  ativo: true,
};

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState<FormState>(formVazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  function carregar() {
    getProdutos().then((r) => setProdutos(r.data)).catch(() => {});
  }

  useEffect(() => {
    carregar();
  }, []);

  const fmt = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
        });
        setProdutos((prev) => prev.map((x) => (x.id === editando.id ? data : x)));
      } else {
        const payload: ProdutoCreatePayload = {
          nome: form.nome,
          preco_kg: form.preco_kg,
          categoria: form.categoria || null,
          ativo: form.ativo,
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Produto</th>
              <th className="px-5 py-3 text-left">Categoria</th>
              <th className="px-5 py-3 text-left">Preço (R$/kg)</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8">
                  Nenhum produto cadastrado ainda.
                </td>
              </tr>
            ) : (
              produtos.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-3 font-bold text-sidebar">{p.nome}</td>
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
                  <td className="px-5 py-3 font-bold text-accent">{fmt(p.preco_kg)}</td>
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
