import React, { useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Mail, Lock, ArrowRight, UserPlus, LogIn, KeyRound } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot-password';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      setError(`Erro ao fazer login com Google: ${err.message || 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, insira seu e-mail.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        if (!password) throw new Error('auth/missing-password');
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === 'register') {
        if (!password) throw new Error('auth/missing-password');
        if (password.length < 6) throw new Error('auth/weak-password');
        await createUserWithEmailAndPassword(auth, email, password);
      } else if (mode === 'forgot-password') {
        await sendPasswordResetEmail(auth, email);
        setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
        setMode('login');
      }
    } catch (err: any) {
      console.error(err);
      switch (err.code || err.message) {
        case 'auth/invalid-email':
          setError('E-mail inválido.');
          break;
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          setError('E-mail ou senha incorretos.');
          break;
        case 'auth/email-already-in-use':
          setError('Este e-mail já está cadastrado.');
          break;
        case 'auth/weak-password':
          setError('A senha deve ter pelo menos 6 caracteres.');
          break;
        case 'auth/missing-password':
          setError('Por favor, insira a senha.');
          break;
        default:
          setError(`Erro: ${err.message || 'Tente novamente.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center p-4 sm:p-8 overflow-hidden bg-slate-900">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/5 blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 mb-4 shadow-2xl shadow-blue-500/20">
            <span className="text-3xl font-black text-blue-400">H</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">AgendaHub</h1>
          <p className="text-slate-400 text-base font-medium px-4">
            Seu negócio organizado de forma simples e inteligente.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          
          {error && (
            <div className="bg-red-500/20 text-red-200 p-3 rounded-xl text-sm font-medium mb-6 border border-red-500/30 backdrop-blur-md text-center">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-emerald-500/20 text-emerald-200 p-3 rounded-xl text-sm font-medium mb-6 border border-emerald-500/30 backdrop-blur-md text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 ml-1">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot-password' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-slate-300">Senha</label>
                  {mode === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => setMode('forgot-password')}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required={mode !== 'forgot-password'}
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {mode === 'login' && <><LogIn className="w-5 h-5" /> Entrar</>}
                  {mode === 'register' && <><UserPlus className="w-5 h-5" /> Criar Conta</>}
                  {mode === 'forgot-password' && <><KeyRound className="w-5 h-5" /> Recuperar Senha</>}
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative px-4 bg-slate-900/50 backdrop-blur-xl text-xs text-slate-400 font-medium uppercase tracking-wider rounded-full">
              Ou
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-50 font-bold py-3.5 px-6 rounded-xl transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group mb-6"
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuar com Google
          </button>
          
          <div className="text-center text-sm text-slate-400">
            {mode === 'login' ? (
              <p>
                Não tem uma conta?{' '}
                <button onClick={() => setMode('register')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Registre-se
                </button>
              </p>
            ) : (
              <p>
                Já tem uma conta?{' '}
                <button onClick={() => setMode('login')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Fazer login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
