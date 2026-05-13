import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import { setCurrentUser } from '../lib/storage';
import { authApi } from '../lib/api';
import { Mail, Lock, Eye, EyeOff, BookOpen, AlertCircle } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const { access, refresh } = response.data;
      
      localStorage.setItem('aulafacil_token', access);
      localStorage.setItem('aulafacil_refresh', refresh);
      
      // Decodificar token para saber el rol (mock por ahora o usar endpoint de perfil)
      // Por ahora asumo que si el mail tiene "admin" es admin
      const is_admin = email.includes('admin');
      
      const user = {
        id: '1', 
        studentId: '202100000', // Agregamos este campo que faltaba (según el error de TS)
        email,
        name: email.split('@')[0],
        role: is_admin ? 'admin' : 'student',
        faculty: 'Ingeniería',
        blocked: false
      };
      
      setCurrentUser(user as any); // Usamos 'any' temporalmente para evitar conflictos de tipos estrictos
      
      if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/app/dashboard');
      toast.success('Inicio de sesión exitoso');
    } catch (err: any) {
      console.error(err);
      const message = 'Correo o contraseña incorrectos, o el servidor no responde.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role: 'student' | 'admin') {
    setEmail(role === 'admin' ? 'admin@university.edu' : 'student@university.edu');
    setPassword('demo123');
    setError('');
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2563eb] mb-4 shadow-lg shadow-blue-200">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-bold text-gray-900" style={{ fontSize: '1.5rem' }}>Bienvenido a AulaFácil</h1>
        <p className="text-sm text-gray-500 mt-1">Inicia sesión para reservar aulas universitarias</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5 mb-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Correo electrónico</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu.correo@universidad.edu.co"
              className="
                w-full h-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-800
                placeholder-gray-400 pl-10 pr-4 outline-none transition-all
                focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100
              "
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              className="
                w-full h-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-800
                placeholder-gray-400 pl-10 pr-11 outline-none transition-all
                focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100
              "
            />
            <button
              type="button"
              onClick={() => setShowPwd(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full h-12 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.98]
            text-white text-sm font-bold transition-all shadow-md shadow-blue-200
            disabled:opacity-60 disabled:cursor-not-allowed mt-1
          "
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31" strokeDashoffset="10" strokeLinecap="round" />
              </svg>
              Ingresando…
            </span>
          ) : 'Iniciar sesión'}
        </button>

        <p className="text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-[#2563eb] font-semibold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </form>
    </div>
  );
}
