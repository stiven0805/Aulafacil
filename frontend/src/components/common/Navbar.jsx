import React from 'react'
import { I } from '../../utils/icons'
import { getInitials } from '../../utils/helpers'

export function Navbar({ user, page, setPage, notifCount, onLogout }) {
  const pages = user?.role === 'admin' 
    ? [
        { id: 'admin-home', label: 'Inicio', icon: I.Home },
        { id: 'admin-aulas', label: 'Aulas', icon: I.Grid },
        { id: 'admin-users', label: 'Usuarios', icon: I.People },
        { id: 'admin-reservations', label: 'Reservas', icon: I.Cal },
      ]
    : [
        { id: 'home', label: 'Inicio', icon: I.Home },
        { id: 'aulas', label: 'Aulas', icon: I.Grid },
        { id: 'calendar', label: 'Calendario', icon: I.Cal },
        { id: 'history', label: 'Historial', icon: I.Book },
      ]

  return (
    <nav className="navbar">
      <a className="nav-brand" onClick={() => setPage('home')} style={{ cursor: 'pointer' }}>
        <div className="nav-brand-icon">{I.Logo}</div>
        <div>
          AulaFácil
          <div className="nav-brand-sub">Student Portal</div>
        </div>
      </a>

      <div className="nav-links">
        {pages.map((p) => (
          <button
            key={p.id}
            className={`nav-link ${page === p.id ? 'active' : ''}`}
            onClick={() => setPage(p.id)}
          >
            {p.icon} {p.label}
          </button>
        ))}
        {user?.role !== 'admin' && (
          <button
            className="nav-link reserve"
            onClick={() => setPage('reserve')}
          >
            {I.Plus} Nueva Reserva
          </button>
        )}
      </div>

      <div className="nav-right">
        <button className="notif-btn" onClick={() => setPage('notifications')}>
          {I.Bell}
          {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
        </button>

        <div className="nav-user">
          <div>
            <div className="nav-user-name">{user?.name}</div>
            <div className="nav-user-role">
              {user?.role === 'admin' ? 'Administrador' : user?.faculty}
            </div>
          </div>
          <div className={`nav-avatar ${user?.role === 'admin' ? 'admin' : ''}`}>
            {getInitials(user?.name)}
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout} title="Cerrar sesión">
          {I.Logout}
        </button>
      </div>
    </nav>
  )
}
