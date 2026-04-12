import React, { useState } from 'react'
import { I, Icon, getIcon } from '../../utils/icons'

export function InputField({ label, icon, type = 'text', placeholder, value, onChange, hint }) {
  const [show, setShow] = useState(false)
  const t = type === 'password' && show ? 'text' : type

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="input-wrap">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={t}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="form-input"
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--gray-400)',
              fontSize: '15px',
            }}
          >
            {show ? I.EyeOff : I.Eye}
          </button>
        )}
      </div>
      {hint && <div className="highlight-box h-hint">{hint}</div>}
    </div>
  )
}

export function StatusBadge({ status }) {
  const badgeClass = {
    active: 'badge-active',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
    available: 'badge-available',
    occupied: 'badge-occupied',
    disabled: 'badge-disabled',
    new: 'badge-new',
  }[status] || 'badge-active'

  const statusText = {
    active: 'Activa',
    completed: 'Completada',
    cancelled: 'Cancelada',
    available: 'Disponible',
    occupied: 'Ocupada',
    disabled: 'Deshabilitada',
    new: 'Nueva',
  }[status] || status

  return <span className={`badge ${badgeClass}`}>{statusText}</span>
}
