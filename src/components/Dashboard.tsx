import { useState, useEffect } from 'react';
import { Search, RotateCcw, FileDown, Plus } from 'lucide-react';
import { subscribeCoordinators, resetPresence } from '../lib/data';
import { Coordinator } from '../types';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

export function Dashboard() {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [selectedCoord, setSelectedCoord] = useState<Coordinator | null>(null);

  useEffect(() => {
    return subscribeCoordinators(setCoordinators);
  }, []);

  const filtered = coordinators.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.school.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && c.presenceStatus === filter;
  });

  const presentCount = coordinators.filter(c => c.presenceStatus === 'present').length;
  const totalCount = coordinators.length;
  const progress = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

  const exportCSV = () => {
    const headers = ["E-mail", "Escola", "Nome", "RG", "Código", "Status", "Data de Presença"];
    const rows = coordinators.map(c => [
      c.email,
      c.school,
      c.name,
      c.rg,
      c.code,
      c.presenceStatus === 'present' ? 'Presente' : 'Ausente',
      c.presenceDate ? formatDate(c.presenceDate) : '-'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "presenca_coordenadores.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-[3] flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar coordenador ou escola..."
              className="w-full bg-slate-100 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={exportCSV}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileDown size={14} /> Exportar CSV
            </button>
            <div className="flex bg-slate-100 rounded-lg p-1 p-0.5">
              {(['all', 'present', 'absent'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all",
                    filter === f ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {f === 'all' ? 'Ver Todos' : f === 'present' ? 'Presentes' : 'Ausentes'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lista de Coordenadores ({filtered.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Coordenador</th>
                  <th className="px-6 py-4">Escola</th>
                  <th className="px-6 py-4">Código / RG</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {filtered.map(coord => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={coord.id} 
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase w-fit",
                            coord.presenceStatus === 'present' 
                              ? "bg-green-100 text-green-700" 
                              : "bg-slate-100 text-slate-400"
                          )}>
                            {coord.presenceStatus === 'present' ? 'Presente' : 'Ausente'}
                          </span>
                          {coord.presenceDate && (
                            <span className="text-[9px] text-slate-400 font-medium">
                              {formatDate(coord.presenceDate)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-800">{coord.name}</div>
                        <div className="text-xs text-slate-400">{coord.email}</div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {coord.school}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        <div className="font-bold">#{coord.code}</div>
                        <div className="opacity-70">{coord.rg}</div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setSelectedCoord(coord)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-bold text-xs"
                            title="Ver QR Code"
                          >
                            Ver QR
                          </button>
                          {coord.presenceStatus === 'present' && (
                            <button 
                              onClick={() => resetPresence(coord.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Resetar Presença"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-sm text-slate-400 italic">
                Nenhum registro encontrado para essa busca.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:w-80 flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Resumo em Tempo Real</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="text-blue-700 text-3xl font-bold">{presentCount}</div>
                <div className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">Presentes Confirmados</div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-slate-700 text-3xl font-bold">{totalCount - presentCount}</div>
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Ausentes / Restantes</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-slate-600">Progresso de Adesão</span>
              <span className="text-[11px] font-bold text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-blue-600 h-full rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-5 flex-grow relative overflow-hidden text-white">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:10px_10px]"></div>
          <div className="relative z-10 space-y-6">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Scanner de Validação</h3>
            
            <div className="w-full aspect-square border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-slate-800/50">
               <div className="w-24 h-24 border-2 border-blue-500/50 rounded-lg relative flex items-center justify-center mb-4">
                 <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                 <div className="w-[80%] h-0.5 bg-blue-400 absolute top-1/2 -translate-y-1/2 shadow-[0_0_15px_#60A5FA] animate-[scan_2s_ease-in-out_infinite]"></div>
                 <Plus className="text-slate-600 opacity-30" size={32} />
               </div>
               <p className="text-xs text-slate-300 font-medium mb-1">Aguardando QR Code...</p>
               <p className="text-[10px] text-slate-500">As presenças são registradas via URL única por coordenador.</p>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes scan {
                0%, 100% { transform: translateY(-30px); }
                50% { transform: translateY(30px); }
              }
            `}} />
            
            <div className="space-y-3">
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Dica de Uso</div>
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  Compartilhe o link do QR Code com cada participante. Ao acessarem, a planilha será atualizada instantaneamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedCoord && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
              onClick={() => setSelectedCoord(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full relative z-[101] flex flex-col items-center gap-8"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Plus size={24} />
                </div>
                <h3 className="font-bold text-2xl text-slate-900 tracking-tight">{selectedCoord.name}</h3>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{selectedCoord.school}</p>
              </div>
              
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                <QRCodeSVG 
                  value={`${window.location.origin}/scan/${selectedCoord.code}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg"
                />
              </div>
              
              <div className="text-center space-y-4 w-full">
                <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                  <p className="text-[9px] font-mono font-bold text-slate-400 uppercase mb-1">URL de Registro</p>
                  <p className="text-[10px] font-mono text-slate-600 break-all leading-tight">
                    {window.location.origin}/scan/{selectedCoord.code}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedCoord(null)}
                  className="w-full bg-slate-900 text-white rounded-xl py-4 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
