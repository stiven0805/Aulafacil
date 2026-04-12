import React, { useState, useMemo } from 'react'
import { I } from '../../utils/icons'
import { fmtDate } from '../../utils/helpers'
import { StatusBadge } from '../../components/common'

export function History({ reservations, onCancel }) {
  const [activeTab, setActiveTab] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  // Filtrar por tab
  const filtered = useMemo(() => {
    if (activeTab === 'all') return reservations || []
    return reservations?.filter(r => r.status === activeTab) || []
  }, [activeTab, reservations])

  // Estadísticas
  const stats = {
    total: reservations?.length || 0,
    active: reservations?.filter(r => r.status === 'active')?.length || 0,
    completed: reservations?.filter(r => r.status === 'completed')?.length || 0,
    cancelled: reservations?.filter(r => r.status === 'cancelled')?.length || 0,
  }

  const tabs = [
    { id: 'all', label: 'Todas', count: stats.total },
    { id: 'active', label: 'Activas', count: stats.active },
    { id: 'completed', label: 'Completadas', count: stats.completed },
    { id: 'cancelled', label: 'Canceladas', count: stats.cancelled },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span style={{ marginRight: '10px' }}>{I.Book}</span> Historial de Reservas</h1>
        <p className="page-sub">Consulta y gestiona todas tus reservas de aulas</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Total</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Activas</div>
            <div className="stat-value" style={{ color: 'var(--blue)' }}>{stats.active}</div>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Completadas</div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{stats.completed}</div>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Canceladas</div>
            <div className="stat-value" style={{ color: 'var(--red)' }}>{stats.cancelled}</div>
          </div>
        </div>
      </div>

      {/* Header con Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: '700',
          color: 'var(--gray-800)',
          marginBottom: '8px',
        }}>
          Mis Reservas
        </h3>
        <p style={{
          fontSize: '13px',
          color: 'var(--gray-500)',
          marginBottom: '12px',
        }}>
          Filtra tus reservas por estado
        </p>

        {/* Tabs mejorados */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--gray-200)',
                background: activeTab === tab.id ? 'var(--blue)' : 'var(--gray-50)',
                color: activeTab === tab.id ? '#fff' : 'var(--gray-600)',
                fontWeight: activeTab === tab.id ? '600' : '500',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all var(--transition)',
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Grid de 2 columnas con tarjetas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
      }}>
        {filtered.length > 0 ? (
          filtered.map((res) => (
            <div
              key={res.id}
              className="card"
              style={{
                cursor: 'pointer',
                transition: 'all var(--transition)',
                border: expandedId === res.id ? '1.5px solid var(--blue)' : '1px solid var(--gray-200)',
                boxShadow: expandedId === res.id ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              }}
              onClick={() => setExpandedId(expandedId === res.id ? null : res.id)}
            >
              {/* Cabecera de tarjeta */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--gray-900)',
                }}>
                  {res.aula}
                </h4>
                <StatusBadge status={res.status} />
              </div>

              {/* Info principal */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px',
                fontSize: '13px',
                color: 'var(--gray-600)',
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Fecha
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-800)' }}>
                    {new Date(res.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Hora
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-800)' }}>
                    {res.start} - {res.end}
                  </div>
                </div>
              </div>

              {/* Info secundaria */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px',
                fontSize: '13px',
                color: 'var(--gray-600)',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--gray-100)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {I.People}
                  <span>{res.people} personas</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {I.Info}
                  <span>{res.faculty}</span>
                </div>
              </div>

              {/* Detalles expandibles */}
              {expandedId === res.id && (
                <div style={{
                  paddingTop: '12px',
                  borderTop: '1px solid var(--gray-100)',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '12px',
                    fontSize: '12px',
                  }}>
                    <div>
                      <div style={{ color: 'var(--gray-400)', fontWeight: '600', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}>
                        ID Reserva
                      </div>
                      <div style={{ fontWeight: '700', color: 'var(--gray-800)', fontFamily: 'monospace' }}>
                        #RES-2026-{String(res.id).padStart(4, '0')}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--gray-400)', fontWeight: '600', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}>
                        Capacidad Usada
                      </div>
                      <div style={{ fontWeight: '700', color: 'var(--gray-800)' }}>
                        {Math.round((res.people / 12) * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  {res.status === 'active' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCancel(res.id)
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: 'var(--red-light)',
                        border: '1.5px solid var(--red-light)',
                        color: 'var(--red)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: '600',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all var(--transition)',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--red)'
                        e.target.style.color = '#fff'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'var(--red-light)'
                        e.target.style.color = 'var(--red)'
                      }}
                    >
                      <span style={{ marginRight: '6px' }}>{I.Cancel}</span> Cancelar Reserva
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--gray-400)',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{I.Book}</div>
            <p>No hay reservas para este estado</p>
          </div>
        )}
      </div>
    </div>
  )
}
