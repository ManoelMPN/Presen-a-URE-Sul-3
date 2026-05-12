import { ReactNode } from 'react';
import { LogOut, User } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export function Layout({ children }: { children: ReactNode }) {
  const [user] = useAuthState(auth);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      <nav className="h-20 bg-white border-b border-slate-200 px-8 flex justify-between items-center sticky top-0 z-50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
            Q
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Gestão de Presença</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sincronizado com Planilha</p>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold ring-2 ring-white">
                {user.email?.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-600 hidden md:block">
                {user.email}
              </span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>
            <button 
              onClick={() => auth.signOut()}
              className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-2"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        )}
      </nav>
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8">
        {children}
      </main>
      <footer className="h-10 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex gap-6">
          <span>DB: coordinators_main</span>
          <span>Sincronização Ativa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
          <span>Monitoramento Real-time</span>
        </div>
      </footer>
    </div>
  );
}
