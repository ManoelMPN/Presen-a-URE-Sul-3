import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth, signInWithGoogle } from '../lib/firebase';
import { registerPresence } from '../lib/data';
import { Coordinator } from '../types';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthState } from 'react-firebase-hooks/auth';

export function ScanPage() {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [coordinator, setCoordinator] = useState<Coordinator | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, authLoading] = useAuthState(auth);

  useEffect(() => {
    async function fetchAndRegister() {
      if (!code) return;
      if (authLoading) return;

      try {
        const docRef = doc(db, 'coordinators', code);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Coordinator;
          setCoordinator(data);

          // If user is logged in, register presence immediately
          if (user) {
            await registerPresence(code, data.name);
            setSuccess(true);
          }
        } else {
          setError('Coordenador não encontrado.');
        }
      } catch (err) {
        console.error(err);
        setError('Erro ao processar presença.');
      } finally {
        setLoading(false);
      }
    }

    fetchAndRegister();
  }, [code, user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin opacity-50" size={48} />
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-50 italic">Validando Código...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="text-red-500" size={64} />
        <h2 className="font-serif italic text-3xl">Ops!</h2>
        <p className="text-xs opacity-50">{error}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-4 border border-[#141414] px-6 py-2 text-[10px] font-mono uppercase hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
        >
          Voltar para Início
        </button>
      </div>
    );
  }

  if (!user && coordinator) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 max-w-sm mx-auto text-center">
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase opacity-50">Coordenador Identificado</p>
          <h2 className="font-serif italic text-4xl">{coordinator.name}</h2>
          <p className="text-xs opacity-70">{coordinator.school}</p>
        </div>

        <div className="p-6 border-2 border-dashed border-[#141414] space-y-4">
          <p className="text-xs italic leading-relaxed">
            Para registrar sua presença e atualizar a planilha em tempo real, 
            é necessário que você se identifique com seu e-mail institucional.
          </p>
          <button 
            onClick={signInWithGoogle}
            className="w-full bg-[#141414] text-[#E4E3E0] py-3 text-xs font-mono uppercase tracking-tighter hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center"
    >
      <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center text-green-500 animate-pulse">
        <CheckCircle2 size={48} />
      </div>

      <div className="space-y-2">
        <h2 className="font-serif italic text-4xl">Presença Confirmada!</h2>
        <p className="text-xs opacity-50 uppercase font-mono tracking-widest italic">Olá, {coordinator?.name}</p>
      </div>

      <div className="bg-[#141414] text-[#E4E3E0] p-6 max-w-sm w-full space-y-1">
        <p className="text-[10px] font-mono uppercase opacity-50">Registrado em</p>
        <p className="font-mono text-sm">{new Date().toLocaleString('pt-BR')}</p>
      </div>

      <p className="text-[10px] font-mono opacity-50 max-w-xs italic leading-relaxed">
        Sua presença foi atualizada na planilha do sistema. Você já pode fechar esta aba.
      </p>
    </motion.div>
  );
}
