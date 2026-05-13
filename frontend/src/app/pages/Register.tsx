import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import { getAllUsers, setCurrentUser } from '../lib/storage';
import { authApi } from '../lib/api';
import { FACULTIES } from '../lib/mockData';
import {
  User, Mail, Lock, GraduationCap, IdCard,
  Eye, EyeOff, CheckCircle2, AlertCircle, BookOpen,
} from 'lucide-react';

// ── Field wrapper ──────────────────────────────────────────────────────────

function Field({
  label, hint, error, children,
}: {
  label: string; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

// ── Input component ────────────────────────────────────────────────────────

function StyledInput({
  icon, error, type = 'text', ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode; error?: boolean }) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        type={type}
        className={`
          w-full h-11 rounded-xl border bg-white text-sm text-gray-800 placeholder-gray-400
          transition-all outline-none
          ${icon ? 'pl-10' : 'pl-4'} pr-4
          ${error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-gray-200 focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100'}
        `}
        {...props}
      />
    </div>
  );
}

// ── PasswordInput ──────────────────────────────────────────────────────────

function PasswordInput({
  value, onChange, placeholder, error,
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; error?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <Lock className="w-4 h-4" />
      </span>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full h-11 rounded-xl border bg-white text-sm text-gray-800 placeholder-gray-400
          pl-10 pr-11 transition-all outline-none
          ${error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-gray-200 focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100'}
        `}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ── Password strength indicator ────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['Débil', 'Regular', 'Fuerte'];
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-green-400'];
  return (
    <div className="space-y-1.5 pt-0.5">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className="text-xs text-gray-400">Seguridad: <span className="font-medium text-gray-600">{labels[score - 1] ?? 'Muy débil'}</span></p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    studentId: '',
    name: '',
    email: '',
    faculty: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof typeof form) => (v: string) =>
    setForm(f => ({ ...f, [field]: v }));

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: Record<string, string> = {};

    // Código estudiantil: 7–10 dígitos numéricos
    if (!form.studentId.trim()) {
      e.studentId = 'El código estudiantil es obligatorio';
    } else if (!/^\d{7,15}$/.test(form.studentId.trim())) {
      e.studentId = 'Debe contener entre 7 y 15 dígitos numéricos';
    } else {
      // Unicidad
      const existing = getAllUsers().find(u => u.studentId === form.studentId.trim());
      if (existing) e.studentId = 'Este código ya está registrado en el sistema';
    }

    if (!form.name.trim()) {
      e.name = 'El nombre completo es obligatorio';
    } else if (form.name.trim().length < 3) {
      e.name = 'Ingresa tu nombre completo';
    }

    if (!form.email.trim()) {
      e.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Ingresa un correo electrónico válido';
    } else {
      const existing = getAllUsers().find(u => u.email === form.email.trim());
      if (existing) e.email = 'Este correo ya está registrado';
    }

    if (!form.faculty) {
      e.faculty = 'Selecciona tu facultad';
    }

    if (!form.password) {
      e.password = 'La contraseña es obligatoria';
    } else if (form.password.length < 6) {
      e.password = 'Mínimo 6 caracteres';
    }

    if (!form.confirmPassword) {
      e.confirmPassword = 'Confirma tu contraseña';
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.register({
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        faculty: form.faculty,
        studentId: form.studentId.trim(),
      });
      setSuccess(true);
      toast.success('Registro exitoso. Redirigiendo al inicio de sesión...');
      setTimeout(() => navigate('/login'), 1500); // Redirigir al login después de registrarse
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || 'Error de conexión con el servidor.';
      setErrors({ submit: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2563eb] mb-4 shadow-lg shadow-blue-200">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-bold text-gray-900" style={{ fontSize: '1.5rem' }}>Crear cuenta</h1>
        <p className="text-sm text-gray-500 mt-1">Regístrate para reservar aulas universitarias</p>
      </div>

      {/* Success */}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">¡Cuenta creada exitosamente!</p>
            <p className="text-xs text-green-600">Redirigiendo al panel…</p>
          </div>
        </div>
      )}

      {/* Submit error */}
      {errors.submit && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Código estudiantil — destacado arriba */}
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-bold text-[#2563eb]">
            <IdCard className="w-4 h-4" />
            Código estudiantil
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={form.studentId}
              onChange={e => {
                // Solo dígitos
                const v = e.target.value.replace(/\D/g, '');
                set('studentId')(v);
              }}
              placeholder="Ej. 2021301456"
              className={`
                w-full h-12 rounded-xl border bg-white text-base font-mono font-semibold text-gray-800
                tracking-widest placeholder-gray-300 pl-4 pr-4 outline-none transition-all
                ${errors.studentId
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'border-blue-200 focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100'}
              `}
            />
          </div>
          {errors.studentId
            ? <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="w-3 h-3" />{errors.studentId}</p>
            : <p className="text-xs text-blue-500">Tu código de 7 a 10 dígitos asignado por la universidad</p>
          }
        </div>

        {/* Nombre completo */}
        <Field label="Nombre completo" error={errors.name}>
          <StyledInput
            icon={<User className="w-4 h-4" />}
            placeholder="Ej. María García López"
            value={form.name}
            onChange={e => set('name')(e.target.value)}
            error={!!errors.name}
          />
        </Field>

        {/* Correo institucional */}
        <Field label="Correo electrónico" hint="Preferiblemente tu correo institucional" error={errors.email}>
          <StyledInput
            icon={<Mail className="w-4 h-4" />}
            type="email"
            placeholder="tu.correo@universidad.edu.co"
            value={form.email}
            onChange={e => set('email')(e.target.value)}
            error={!!errors.email}
          />
        </Field>

        {/* Facultad */}
        <Field label="Facultad" error={errors.faculty}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <GraduationCap className="w-4 h-4" />
            </span>
            <select
              value={form.faculty}
              onChange={e => set('faculty')(e.target.value)}
              className={`
                w-full h-11 rounded-xl border bg-white text-sm text-gray-800 pl-10 pr-4
                outline-none appearance-none transition-all cursor-pointer
                ${errors.faculty
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'border-gray-200 focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100'}
              `}
            >
              <option value="">Selecciona tu facultad</option>
              {FACULTIES.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
          </div>
        </Field>

        {/* Contraseña */}
        <Field label="Contraseña" error={errors.password}>
          <PasswordInput
            value={form.password}
            onChange={set('password')}
            placeholder="Mínimo 6 caracteres"
            error={!!errors.password}
          />
          <PasswordStrength password={form.password} />
        </Field>

        {/* Confirmar contraseña */}
        <Field label="Confirmar contraseña" error={errors.confirmPassword}>
          <PasswordInput
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            placeholder="Repite tu contraseña"
            error={!!errors.confirmPassword}
          />
        </Field>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || success}
          className="
            w-full h-12 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.98]
            text-white text-sm font-bold transition-all shadow-md shadow-blue-200
            disabled:opacity-60 disabled:cursor-not-allowed mt-2
          "
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31" strokeDashoffset="10" strokeLinecap="round" />
              </svg>
              Creando cuenta…
            </span>
          ) : success ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> ¡Listo!
            </span>
          ) : 'Crear cuenta'}
        </button>

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-[#2563eb] font-semibold hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </form>
    </div>
  );
}
