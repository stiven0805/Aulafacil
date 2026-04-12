import React from 'react'
import { I } from '../../utils/icons'
import { StatusBadge } from '../../components/common'

export function Aulas({ aulas }) {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span style={{ marginRight: '10px' }}>{I.Grid}</span> Aulas Disponibles</h1>
        <p className="page-sub">Explora todas las aulas para tu reserva</p>
      </div>

      <div className="aulas-stats">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total de aulas</div>
            <div className="stat-value">{aulas?.length || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
            {I.Grid}
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Disponibles ahora</div>
            <div className="stat-value">{aulas?.filter(a => a.enabled)?.length || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
            {I.Check}
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Capacidad promedio</div>
            <div className="stat-value">12</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>
            {I.People}
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Con TV</div>
            <div className="stat-value">{aulas?.filter(a => a.tv)?.length || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>
            {I.Tv}
          </div>
        </div>
      </div>

      <div className="aula-grid">
        {aulas?.map((aula) => (
          <div key={aula.id} className="aula-card">
            <div className={`aula-top-bar ${!aula.enabled ? 'disabled' : ''}`}></div>
            <div className="aula-body">
              <div className="aula-name">
                {aula.name}
                <StatusBadge status={aula.enabled ? 'available' : 'disabled'} />
              </div>
              <div className="aula-feature">
                <span style={{ marginRight: '8px' }}>{I.People}</span> Capacidad: {aula.capacity} personas
              </div>
              {aula.tv && (
                <div className="aula-feature">
                  <span style={{ marginRight: '8px' }}>{I.Tv}</span> Televisor disponible
                </div>
              )}
              {aula.pizarron && (
                <div className="aula-feature">
                  <span style={{ marginRight: '8px' }}>{I.Board}</span> Pizarrón digital
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
