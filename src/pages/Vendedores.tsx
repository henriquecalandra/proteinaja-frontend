import { useEffect, useState, FormEvent } from 'react';
import {
  getVendedores,
  criarVendedor,
  atualizarVendedor,
  VendedorCreatePayload,
} from '../api/client';
import { Vendedor } from '../types';

interface FormState {
  nome: string;
  email: string;
  telefone: string;
  meta_mensal: number;
  ativo: boolean;
}

const formVazio: FormState = {
  nome: '',
  email: '',
  telefone: '',
  meta_mensal: 0,
  ativo: true,
};

export default function Vendedores() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Vendedor | null>(null);
  const [form, setForm] = useState<FormState>(formVazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  function carregar() {
    getVendedores().then((r) => setVendedores(r.data)).catch(() => {});
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

  function abrirEdicao(v: Vendedor) {
    setEditando(v);
    setForm({
      nome: v.nome,
      email: v.email ?? '',
      telefone: v.telefone ?? '',
      meta_mensal: v.meta_mensal ?? 0,
      ativo: v.ativo,
    });
    setErro('');
    setMostrarForm(true);
  }

  async function handleSalvar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    if (!form.nome.trim()) {
      setErro('Informe o nome do vendedor.');
      return;
    }
    setSalvando(true);
    try {
      const payload: VendedorCreatePayload = {
        nome: form.nome.trim(),
        email: form.email.trim() || null,
        telefone: form.telefone.trim() || null,
        meta_mensal: form.meta_mensal > 0 ? form.meta_mensal : null,
        ativo: form.ativo,
      };
      if (editando) {
        const { data } = await atualizarVendedor(editando.id, payload);
        setVendedores((prev) => prev.map((x) => (x.id === editando.id ? data : x)));
      } else {
        const { data } = await criarVendedor(payload);
        setVendedores((prev) =>
          [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome))
        );
      }
      setMostrarForm(false);
    } catch {
      setErro('Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold text-sidebar">Vendedores</h1>
        <button
          onClick={abrirNovo}
          className="bg-accent text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-700 transition-colors"
        >
          + Novo vendedor
        </button>
      </div>

      <p className="text-xs font-semibold text-gray-400 mb-4">
        {vendedores.length} {vendedores.length === 1 ? 'vendedor' : 'vendedores'}
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Nome</th>
              <th className="px-5 py-3 text-left">E-mail</th>
              <th className="px-5 py-3 text-left">Telefone</th>
              <th className="px-5 py-3 text-left">Meta mensal</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {vendedores.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8">
                  Nenhum vendedor cadastrado ainda.
                </td>
              </tr>
            ) : (
              vendedores.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-3 font-bold text-sidebar">{v.nome}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {v.email ? v.email : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {v.telefone ? v.telefone : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 font-semibold text-accent">
                    {v.meta_mensal != null ? fmt(v.meta_mensal) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        v.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {v.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => abrirEdicao(v)}
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
                {editando ? 'Editar vendedor' : 'Novo vendedor'}
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
                <label className="block text-sm font-semibold text-gray-600 mb-1">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Telefone</label>
                <input
                  type="text"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Meta mensal (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.meta_mensal || ''}
                  onChange={(e) => setForm({ ...form, meta_mensal: Number(e.target.value) })}
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
                {salvando ? 'Salvando...' : 'Salvar vendedor'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
