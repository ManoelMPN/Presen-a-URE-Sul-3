/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signInWithGoogle } from './lib/firebase';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ScanPage } from './components/ScanPage';
import { SeedData } from './components/SeedData';
import { AlertCircle, LogIn, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

function Login() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-10 max-w-lg mx-auto text-center">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-6"
      >
        <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-200 ring-8 ring-blue-50">
          <Sparkles size={40} />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 px-4">Gestão de Presença</h1>
          <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
            Controle de frequência institucional com atualização em tempo real e integração segura.
          </p>
        </div>
      </motion.div>

      <motion.button 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={signInWithGoogle}
        className="w-full max-w-sm bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200/50 active:scale-[0.98]"
      >
        <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center">
          <LogIn size={14} />
        </div>
        Entrar com Google
      </motion.button>

      <div className="flex flex-col items-center gap-4">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
          Ambiente Institucional Seguro
        </p>
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-200"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-100"></div>
        </div>
      </div>
    </div>
  );
}

function AdminView() {
  const [showSeed, setShowSeed] = (window as any).showSeed || [false, () => {}]; // Basic toggle if needed
  const [isSeedOpen, setSeedOpen] = (window as any).useState ? (window as any).useState(false) : [false, (v: boolean) => {}];
  // Since I can't easily use hooks here safely without defining them properly in a component:
  return <AdminLayout />;
}

function AdminLayout() {
  return (
    <div className="space-y-12">
      <Dashboard />
      <div className="pt-4">
        <SeedData />
      </div>
    </div>
  );
}

export default function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin opacity-50" size={48} />
          <p className="font-mono text-[10px] uppercase tracking-widest opacity-50">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public Scan Route */}
          <Route path="/scan/:code" element={<ScanPage />} />
          
          {/* Admin Routes */}
          <Route 
            path="/" 
            element={user ? <AdminLayout /> : <Login />} 
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
