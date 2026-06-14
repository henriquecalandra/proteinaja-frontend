import { useEffect, useState, FormEvent } from 'react';
import {
  getCompany,
  atualizarEmpresa,
  conectarWhatsapp,
  desconectarWhatsapp,
} from '../api/client';
import { Empresa } from '../types';

interface FormState {
  nome: string;
  cnpj: string;
  cidade: string;
  whatsapp_numero: string;
  evolution_url: string;
  evolution_instance: string;
}

const formVazio: FormState = {
  nome: '',
  cnpj: '',
  cidade: '',
  whatsapp_numero: '',
  evolution_url: '',
  evolution_instance: '',
};

export default function Configuracoes() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [form, setForm] = useState<FormState>(formVazio);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const [conectando, setConectando] = useState(false);

  function aplicar(e: Empresa) {
    setEmpresa(e);
    setForm({
      nome: e.nome ?? '',
      cnpj: e.cnpj ?? '',
      cidade: e.cidade ?? '',
      whatsapp_numero: e.whatsapp_numero ?? '',
      evolution_url: e.evolution_url ?? '',
      evolution_instance: e.evolution_instance ?? '',
    });
  }

  useEffect(() => {
    getCompany()
      .then((r) => aplicar(r.data))
      .catch(() => setErro('Não foi possível carregar os dados da empresa.'));
  }, []);

  async function handleSalvar(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    setErro('');
    setSalvando(true);
    try {
      const { data } = await atualizarEmpresa({
        nome: form.nome,
        cnpj: form.cnpj || null,
        cidade: form.cidade || null,
        whatsapp_numero: form.whatsapp_numero || null,
        evolution_url: form.evolution_url || null,
        evolution_instance: form.evolution_instance || null,
      });
      aplicar(data);
      setMsg('Dados salvos com sucesso.');
    } catch {
      setErro('Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  async function toggleWhatsapp() {
    if (!empresa) return;
    setMsg('');
    setErro('');
    setConectando(true);
    try {
      if (empresa.whatsapp_conectado) {
        const { data } = await desconectarWhatsapp();
        aplicar(data);
      } else {
        // garante que o número esteja salvo antes de conectar
        if (form.whatsapp_numero && form.whatsapp_numero !== empresa.whatsapp_numero) {
          await atualizarEmpresa({ whatsapp_numero: form.whatsapp_numero });
        }
        const { data } = await conectarWhatsapp();
        aplicar(data);
      }
    } catch (err: any) {
      setErro(
        err?.response?.status === 422
          ? 'Informe o número de WhatsApp antes de conectar.'
          : 'Não foi possível atualizar a conexão.'
      );
    } finally {
      setConectando(false);
    }
  }

  if (!empresa && erro) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-extrabold text-sidebar mb-4">Configurações</h1>
        <p className="text-red-500 text-sm">{erro}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-sidebar">Configurações</h1>
        <p className="text-sm text-gray-400 mt-1">Dados da empresa e integração de WhatsApp.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
        <h2 className="text-sm font-extrabold text-sidebar mb-4">Dados da empresa</h2>
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
            <label className="block text-sm font-semibold text-gray-600 mb-1">CNPJ</label>
            <input
              type="text"
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Cidade</label>
            <input
              type="text"
              value={form.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          {msg && <p className="text-green-600 text-sm">{msg}</p>}
          <button
            type="submit"
            disabled={salvando}
            className="bg-accent text-white font-bold px-5 py-2.5 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-extrabold text-sidebar">WhatsApp</h2>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              empresa?.whatsapp_conectado
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {empresa?.whatsapp_conectado ? '🟢 Conectado' : '⚪ Desconectado'}
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Número do WhatsApp</label>
            <input
              type="text"
              value={form.whatsapp_numero}
              onChange={(e) => setForm({ ...form, whatsapp_numero: e.target.value })}
              placeholder="5562990001234"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Evolution URL</label>
            <input
              type="text"
              value={form.evolution_url}
              onChange={(e) => setForm({ ...form, evolution_url: e.target.value })}
              placeholder="https://evolution.exemplo.com"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Evolution Instance</label>
            <input
              type="text"
              value={form.evolution_instance}
              onChange={(e) => setForm({ ...form, evolution_instance: e.target.value })}
              placeholder="instancia-01"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <button
            type="button"
            onClick={toggleWhatsapp}
            disabled={conectando}
            className={`font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 ${
              empresa?.whatsapp_conectado
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-accent text-white hover:bg-orange-700'
            }`}
          >
            {conectando
              ? 'Atualizando...'
              : empresa?.whatsapp_conectado
              ? 'Desconectar'
              : 'Conectar'}
          </button>
        </div>
      </div>
    </div>
  );
}
