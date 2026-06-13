import { useEffect, useState } from 'react';
import { getConversas, getMensagens, assumirConversa } from '../api/client';
import { Conversa, Mensagem } from '../types';

const statusLabel: Record<string, string> = {
  agente: '🤖 Agente',
  humano: '👤 Humano',
  encerrada: '✓ Encerrada',
};

export default function Conversas() {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [selected, setSelected] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);

  useEffect(() => {
    getConversas().then((r) => setConversas(r.data)).catch(() => {});
  }, []);

  function selectConversa(c: Conversa) {
    setSelected(c);
    getMensagens(c.id).then((r) => setMensagens(r.data)).catch(() => {});
  }

  async function assumir() {
    if (!selected) return;
    await assumirConversa(selected.id);
    setSelected({ ...selected, status: 'humano' });
    setConversas((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, status: 'humano' } : c))
    );
  }

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="w-72 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="px-4 py-4 border-b border-gray-100">
          <h2 className="font-extrabold text-sidebar">Conversas</h2>
        </div>
        {conversas.length === 0 ? (
          <p className="text-gray-400 text-sm p-4">Nenhuma conversa aberta.</p>
        ) : (
          conversas.map((c) => (
            <button
              key={c.id}
              onClick={() => selectConversa(c)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-bg transition-colors ${
                selected?.id === c.id ? 'bg-bg border-l-4 border-l-accent' : ''
              }`}
            >
              <div className="text-sm font-bold text-sidebar">Conversa #{c.id}</div>
              <div className="text-xs text-gray-400 mt-0.5">{statusLabel[c.status]}</div>
            </button>
          ))
        )}
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col bg-bg">
        {selected ? (
          <>
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-sidebar">Conversa #{selected.id}</div>
                <div className="text-xs text-gray-400">{statusLabel[selected.status]}</div>
              </div>
              {selected.status === 'agente' && (
                <button
                  onClick={assumir}
                  className="bg-accent text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-700 transition-colors"
                >
                  Assumir atendimento
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mensagens.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.origem === 'cliente' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                      m.origem === 'cliente'
                        ? 'bg-white border border-gray-200 text-gray-800'
                        : m.origem === 'sistema'
                        ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs mx-auto'
                        : 'bg-sidebar text-white'
                    }`}
                  >
                    {m.texto}
                  </div>
                </div>
              ))}
              {mensagens.length === 0 && (
                <p className="text-center text-gray-400 text-sm">Sem mensagens ainda.</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Selecione uma conversa
          </div>
        )}
      </div>
    </div>
  );
}
