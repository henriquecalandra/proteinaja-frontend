import { useEffect, useState } from 'react';
import { getClientes } from '../api/client';
import { Cliente } from '../types';

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

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    getClientes().then((r) => setClientes(r.data)).catch(() => {});
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-xl font-extrabold text-sidebar mb-6">Clientes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.length === 0 ? (
          <p className="text-gray-400 text-sm col-span-3">Nenhum cliente cadastrado ainda.</p>
        ) : (
          clientes.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
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
              <a
                href={`https://wa.me/${c.whatsapp}`}
                target="_blank"
                rel="noreferrer"
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
    </div>
  );
}
