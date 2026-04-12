import React, { useState } from 'react'

export function Button({ children, variant = 'primary', size = 'md', disabled = false, onClick, className = '' }) {
  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }[size]

  const variantClass = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    danger: 'btn-danger',
    success: 'btn-success',
  }[variant]

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '', title }) {
  return (
    <div className={`card ${className}`}>
      {title && <div className="card-title">{title}</div>}
      {children}
    </div>
  )
}

export function Badge({ children, variant = 'primary', className = '' }) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  )
}

export function Select({ label, options, value, onChange, placeholder, icon }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="input-wrap">
        {icon && <span className="input-icon">{icon}</span>}
        <select
          value={value}
          onChange={onChange}
          className="select-field"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function TextInput({ label, value, onChange, placeholder, icon, type = 'text', error }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="input-wrap">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="form-input"
        />
      </div>
      {error && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '4px' }}>{error}</div>}
    </div>
  )
}
