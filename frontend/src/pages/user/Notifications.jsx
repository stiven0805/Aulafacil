import React from 'react'
import { I } from '../../utils/icons'

export function Notifications({ notifications, onMarkRead, onMarkAllRead }) {
  const unreadCount = notifications?.filter(n => !n.read)?.length || 0

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title"><span style={{ marginRight: '10px' }}>{I.Bell}</span> Notificaciones</h1>
          <p className="page-sub">Mantente actualizado con tus reservas</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline btn-sm" onClick={onMarkAllRead}>
            Marcar todo como leído
          </button>
        )}
      </div>

      <div className="notif-list">
        {notifications?.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notif-item ${!notif.read ? 'unread' : ''}`}
              onClick={() => onMarkRead(notif.id)}
            >
              <div className="notif-icon" style={{
                background: notif.type === 'confirm' ? 'var(--green-light)' : 'var(--blue-light)',
                color: notif.type === 'confirm' ? 'var(--green)' : 'var(--blue)',
              }}>
                {notif.type === 'confirm' ? I.Check : I.Bell}
              </div>
              <div className="notif-content">
                <div className="notif-title">{notif.title}</div>
                <div className="notif-desc">{notif.desc}</div>
                <div className="notif-time">{notif.time}</div>
              </div>
              {!notif.read && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--blue)',
                }}></div>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>{I.Bell}</div>
            <p>No hay notificaciones</p>
          </div>
        )}
      </div>
    </div>
  )
}
