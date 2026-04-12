import React, { useState } from 'react'
import { InputField } from '../../components/common'
import { I } from '../../utils/icons'

export function LoginScreen({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin({ email, password })
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">{I.Logo}</div>
          <h2 className="auth-title">AulaFacil</h2>
          <p className="auth-sub">Sistema de Reservas de Aulas</p>
        </div>

        <form onSubmit={handleSubmit}>
          <InputField
            label="Correo electrónico"
            icon={I.Mail}
            type="email"
            placeholder="tu@universidad.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputField
            label="Contraseña"
            icon={I.Lock}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="btn btn-primary">
            Ingresar <span style={{ marginLeft: '6px' }}>{I.Arrow}</span>
          </button>
        </form>

        <div className="auth-switch">
          ¿No tienes cuenta?{' '}
          <a onClick={onGoRegister}>Registrarse</a>
        </div>
      </div>
    </div>
  )
}

export function RegisterScreen({ onGoLogin }) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [facultad, setFacultad] = useState('')
  const [password, setPassword] = useState('')

  const FACULTIES = ["Ingeniería", "Medicina", "Derecho", "Arquitectura", "Economía", "Ciencias"]

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ nombre, email, codigo, facultad, password })
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">{I.Logo}</div>
          <h2 className="auth-title">Crear Cuenta</h2>
          <p className="auth-sub">Únete a AulaFacil</p>
        </div>

        <form onSubmit={handleSubmit}>
          <InputField
            label="Nombre completo"
            icon={I.User}
            placeholder="Juan Pérez"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <InputField
            label="Correo electrónico"
            icon={I.Mail}
            type="email"
            placeholder="tu@universidad.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="form-group">
            <label className="form-label">Código de estudiante</label>
            <div className="highlight-box">
              <div className="h-label"><span style={{ marginRight: '4px' }}>{I.Info}</span> Código único</div>
              <input
                type="text"
                placeholder="2023456789"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  fontFamily: 'var(--font)',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'var(--gray-800)',
                  outline: 'none',
                  padding: '4px 0',
                }}
              />
              <div className="h-hint">Se utiliza para identificar tus reservas</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Facultad</label>
            <div className="input-wrap">
              <select
                value={facultad}
                onChange={(e) => setFacultad(e.target.value)}
                className="select-field"
              >
                <option value="">Selecciona tu facultad</option>
                {FACULTIES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <InputField
            label="Contraseña"
            icon={I.Lock}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="btn btn-primary">
            Registrarse <span style={{ marginLeft: '6px' }}>{I.Check}</span>
          </button>
        </form>

        <div className="auth-switch">
          ¿Ya tienes cuenta?{' '}
          <a onClick={onGoLogin}>Ingresar</a>
        </div>
      </div>
    </div>
  )
}
