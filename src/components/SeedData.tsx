import { useState } from 'react';
import { Upload, AlertTriangle, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { seedCoordinators } from '../lib/data';
import { motion } from 'motion/react';

const SAMPLE_CSV = `email,school,name,rg,code,qrCodeLink
neto@exemplo.com,Escola Estadual ABC,Neto MMP,12.345.678-9,CODE01,https://link.com/qr1
maria@exemplo.com,Escola Municipal XYZ,Maria Silva,98.765.432-1,CODE02,https://link.com/qr2`;

export function SeedData() {
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!data.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const lines = data.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const coordinators = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((h, i) => {
          if (['email', 'e-mail'].includes(h)) obj.email = values[i];
          if (['escola', 'school'].includes(h)) obj.school = values[i];
          if (['nome', 'name'].includes(h)) obj.name = values[i];
          if (['rg'].includes(h)) obj.rg = values[i];
          if (['codigo', 'código', 'code'].includes(h)) obj.code = values[i];
          if (['link', 'qrCodeLink', 'link do código'].includes(h)) obj.qrCodeLink = values[i];
        });
        return obj;
      }).filter(c => c.email && c.name && c.code);

      if (coordinators.length === 0) {
        throw new Error('Nenhum dado válido encontrado. Verifique os cabeçalhos.');
      }

      await seedCoordinators(coordinators);
      setSuccess(true);
      setData('');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erro ao importar dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <Upload size={20} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Importar Coordenadores</h3>
          <p className="text-xs font-medium text-slate-400">Sincronize sua planilha externa via CSV</p>
        </div>
      </div>
      
      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
        <AlertTriangle className="text-blue-600 flex-shrink-0" size={16} />
        <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
          Certifique-se de que a primeira linha contém os cabeçalhos: 
          <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded ml-1 text-[10px]">email,escola,nome,rg,codigo,link</span>
        </p>
      </div>

      <textarea 
        value={data}
        onChange={(e) => setData(e.target.value)}
        placeholder={SAMPLE_CSV}
        className="w-full h-48 bg-slate-50 border border-slate-100 rounded-2xl p-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-inner"
      />

      <div className="flex justify-between items-center pt-2">
        <button 
          onClick={() => setData(SAMPLE_CSV)}
          className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline"
        >
          Carregar Exemplo
        </button>
        
        <button 
          onClick={handleImport}
          disabled={loading || !data.trim()}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-all disabled:opacity-30 flex items-center gap-2 shadow-lg shadow-blue-100"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'Processar Importação'}
        </button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase bg-red-50 p-4 rounded-xl border border-red-100"
        >
          <AlertCircle size={14} /> {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-green-700 font-bold text-[10px] uppercase bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm"
        >
          <CheckCircle size={14} /> Importação concluída com sucesso!
        </motion.div>
      )}
    </div>
  );
}
