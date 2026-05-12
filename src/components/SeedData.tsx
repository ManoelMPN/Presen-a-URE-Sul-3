import { useState, ChangeEvent } from 'react';
import { Upload, AlertTriangle, AlertCircle, Loader2, CheckCircle, FileText, X, ChevronRight, Info } from 'lucide-react';
import { seedCoordinators } from '../lib/data';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';

export function SeedData() {
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[] | null>(null);

  const parseData = (csvString: string) => {
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const mapped = results.data.map((row: any) => {
          const obj: any = {};
          // Mapeamento flexível das colunas baseado nas observações do usuário
          Object.keys(row).forEach(key => {
            const h = key.toLowerCase().trim();
            const val = row[key]?.trim();
            if (!val) return;

            if (h.includes('e-mail') || h === 'email') obj.email = val;
            if (h.includes('escola')) obj.school = val;
            if (h.includes('nome')) obj.name = val;
            if (h.includes('rg')) obj.rg = val;
            if (h.includes('código') || h.includes('codigo') || h === 'code') obj.code = val;
            if (h.includes('link') || h.includes('qr')) obj.qrCodeLink = val;
          });
          return obj;
        }).filter(c => c.email || c.name || c.code);

        if (mapped.length > 0) {
          setPreview(mapped.slice(0, 5));
          setError(null);
        } else {
          setPreview(null);
          setError("Não foi possível identificar colunas válidas. Verifique o cabeçalho.");
        }
      },
      error: (err) => {
        setError("Erro ao processar arquivo: " + err.message);
      }
    });
  };

  const handleImport = async () => {
    if (!data.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Re-parse para pegar tudo
      const results = Papa.parse(data, { header: true, skipEmptyLines: true });
      const coordinators = results.data.map((row: any) => {
        const obj: any = {};
        Object.keys(row).forEach(key => {
          const h = key.toLowerCase().trim();
          const val = row[key]?.trim();
          if (!val) return;
          if (h.includes('e-mail') || h === 'email') obj.email = val;
          if (h.includes('escola')) obj.school = val;
          if (h.includes('nome')) obj.name = val;
          if (h.includes('rg')) obj.rg = val;
          if (h.includes('código') || h.includes('codigo') || h === 'code') obj.code = val;
          if (h.includes('link') || h.includes('qr')) obj.qrCodeLink = val;
        });
        return obj;
      }).filter(c => c.email && c.name && c.code);

      if (coordinators.length === 0) {
        throw new Error('Nenhum coordenador válido encontrado. Verifique se as colunas Nome, E-mail e Código estão presentes.');
      }

      const result = await seedCoordinators(coordinators);
      setSuccess(true);
      setPreview(null);
      setData('');
      alert(`Importação concluída: ${result.successCount} registros salvos.`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erro ao importar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const text = Papa.unparse(results.data);
        setData(text);
        parseData(text);
        setLoading(false);
      },
      error: (err) => {
        setError("Erro no arquivo: " + err.message);
        setLoading(false);
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Upload size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Importar Base de Dados</h3>
            <p className="text-sm font-medium text-slate-400">Arraste um CSV ou cole os dados abaixo</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-blue-100">
            <FileText size={16} /> Selecionar CSV
            <input 
              type="file" 
              accept=".csv,.txt,.tsv" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </label>
          {data && (
            <button 
              onClick={() => { setData(''); setPreview(null); setError(null); }}
              className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Painel de Texto</span>
            <button 
              onClick={() => {
                const sample = `E-mail,Escola,Nome,RG,Código\nneto@exemplo.com,Escola ABC,Neto MMP,12345,C001\nmaria@exemplo.com,Escola XYZ,Maria Silva,67890,C002`;
                setData(sample);
                parseData(sample);
              }}
              className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest"
            >
              Usar Modelo
            </button>
          </div>
          <textarea 
            value={data}
            onChange={(e) => {
              setData(e.target.value);
              if (e.target.value) parseData(e.target.value);
              else setPreview(null);
            }}
            placeholder="Cole os dados aqui (E-mail, Escola, Nome, RG, Código)..."
            className="w-full h-64 bg-slate-50 border border-slate-200 rounded-2xl p-6 font-mono text-xs focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none shadow-inner"
          />
        </div>

        <div className="space-y-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Pré-visualização (Mapeamento Automatizado)</span>
          <div className="h-64 bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-hidden relative">
            {!preview && !error && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-2">
                <Info size={32} />
                <p className="text-xs font-medium">Os dados aparecerão aqui após carregar o arquivo</p>
              </div>
            )}

            {error && (
              <div className="h-full flex flex-col items-center justify-center text-red-500 space-y-2 text-center p-4">
                <AlertCircle size={32} />
                <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
              </div>
            )}

            {preview && (
              <div className="space-y-3 overflow-y-auto h-full pr-2">
                {preview.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">{item.name || 'Sem nome'}</p>
                        <p className="text-[10px] text-slate-400">{item.email || 'Sem email'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold">
                      <div className="flex flex-col items-end">
                        <span className="text-blue-600">ID: {item.code || '?'}</span>
                        <span className="text-slate-300">{item.school?.substring(0, 15)}...</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
                {preview.length === 5 && (
                  <p className="text-[10px] text-center text-slate-400 pt-2 italic">Mostrando os primeiros 5 registros...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>E-mail</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Nome</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Código (Obrigatório)</span>
          </div>
        </div>

        <button 
          onClick={handleImport}
          disabled={loading || !preview}
          className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-30 disabled:grayscale flex items-center gap-3 shadow-xl shadow-blue-200"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Processando...
            </>
          ) : (
            <>
              Gravar Presença Institucional
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 text-green-700 font-bold text-xs uppercase bg-green-50 p-5 rounded-2xl border border-green-100 shadow-sm"
        >
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle size={20} />
          </div>
          Banco de dados atualizado com sucesso! Os novos coordenadores já podem gerar seus QR Codes.
        </motion.div>
      )}
    </div>
  );
}

