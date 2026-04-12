import React from 'react'
import { I } from '../../utils/icons'
import { fmtDate } from '../../utils/helpers'
import { StatusBadge } from '../../components/common'

export function Home({ user, reservations, setPage }) {
  const upcomingRes = reservations?.filter(r => r.status === 'active') || []

  return (
    <div className="page">
      <div className="hero-banner">
        <div>
          <h2>¡Bienvenido, {user?.name?.split(' ')[0]}!</h2>
          <p>Gestiona tus reservas de aulas de forma rápida y sencilla</p>
        </div>
        <div className="hero-avatar">{user?.name?.charAt(0)}</div>
      </div>

      <div className="profile-row">
        <div className="profile-item">
          <div className="profile-icon pi-blue">{I.Grid}</div>
          <div>
            <div className="profile-item-label">Aulas disponibles</div>
            <div className="profile-item-value">12</div>
          </div>
        </div>
        <div className="profile-item">
          <div className="profile-icon pi-purple">{I.Cal}</div>
          <div>
            <div className="profile-item-label">Reservas activas</div>
            <div className="profile-item-value">{upcomingRes.length}</div>
          </div>
        </div>
        <div className="profile-item">
          <div className="profile-icon pi-green">{I.Check}</div>
          <div>
            <div className="profile-item-label">Completadas</div>
            <div className="profile-item-value">8</div>
          </div>
        </div>
      </div>

      <div className="section-hdr">
        <h3 className="section-title">Acciones rápidas</h3>
      </div>
      <div className="quick-actions" style={{ marginBottom: '24px' }}>
        <button className="qa-btn primary" onClick={() => setPage('reserve')}>
          <span className="qa-icon">{I.Plus}</span>
          Nueva Reserva
        </button>
        <button className="qa-btn" onClick={() => setPage('aulas')}>
          <span className="qa-icon">{I.Grid}</span>
          Ver Aulas
        </button>
        <button className="qa-btn" onClick={() => setPage('calendar')}>
          <span className="qa-icon">{I.Cal}</span>
          Calendario
        </button>
        <button className="qa-btn" onClick={() => setPage('history')}>
          <span className="qa-icon">{I.Book}</span>
          Historial
        </button>
      </div>

      <div className="section-hdr">
        <h3 className="section-title">Reservas próximas</h3>
      </div>
      <div className="res-list">
        {upcomingRes.length > 0 ? (
          upcomingRes.map((res) => (
            <div key={res.id} className="res-card">
              <div className="res-card-header">
                <span className="res-card-name">{res.aula}</span>
                <StatusBadge status={res.status} />
              </div>
              <div className="res-meta">
                <span><span style={{ marginRight: '4px' }}>{I.Cal}</span> {fmtDate(res.date)}</span>
                <span><span style={{ marginRight: '4px' }}>{I.Clock}</span> {res.start} - {res.end}</span>
                <span><span style={{ marginRight: '4px' }}>{I.People}</span> {res.people} personas</span>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '20px' }}>
            No tienes reservas próximas. <span style={{ marginLeft: '4px', marginRight: '4px' }}>{I.Arrow}</span> <a onClick={() => setPage('reserve')} className="link">Crear una ahora</a>
          </p>
        )}
      </div>
    </div>
  )
}
