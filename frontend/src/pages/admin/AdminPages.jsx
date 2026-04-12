import React from 'react'
import { I } from '../../utils/icons'
import { StatusBadge } from '../../components/common'

export function AdminHomeScreen({ aulas, users, allReservations }) {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span style={{ marginRight: '10px' }}>{I.Shield}</span> Panel de Administración</h1>
        <p className="page-sub">Gestiona aulas, usuarios y reservas</p>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat-val">{aulas?.length || 0}</div>
          <div className="admin-stat-label"><span style={{ marginRight: '4px' }}>{I.Grid}</span> Aulas</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-val">{users?.length || 0}</div>
          <div className="admin-stat-label"><span style={{ marginRight: '4px' }}>{I.People}</span> Usuarios</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-val">{allReservations?.length || 0}</div>
          <div className="admin-stat-label"><span style={{ marginRight: '4px' }}>{I.Cal}</span> Reservas</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-val">{users?.filter(u => u.blocked)?.length || 0}</div>
          <div className="admin-stat-label"><span style={{ marginRight: '4px' }}>{I.Shield}</span> Bloqueados</div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <h3 className="section-title">Primeras 5 reservas recientes</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Aula</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Personas</th>
              <th>Facultad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {allReservations?.slice(0, 5).map((res) => (
              <tr key={res.id}>
                <td>{res.aula}</td>
                <td>{res.date}</td>
                <td>{res.start}</td>
                <td>{res.people}</td>
                <td>{res.faculty}</td>
                <td><StatusBadge status={res.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminAulasScreen({ aulas, onToggleAula }) {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span style={{ marginRight: '10px' }}>{I.Grid}</span> Gestionar Aulas</h1>
        <p className="page-sub">Edita el estado y características de las aulas</p>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Capacidad</th>
            <th>TV</th>
            <th>Pizarrón</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {aulas?.map((aula) => (
            <tr key={aula.id}>
              <td>{aula.name}</td>
              <td>{aula.capacity} personas</td>
              <td>{aula.tv ? I.Check : I.Cancel}</td>
              <td>{aula.pizarron ? I.Check : I.Cancel}</td>
              <td>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: aula.enabled ? 'var(--green-light)' : 'var(--red-light)',
                  color: aula.enabled ? 'var(--green)' : 'var(--red)',
                }}>
                  {aula.enabled ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td>
                <button
                  className="toggle-btn"
                  onClick={() => onToggleAula(aula.id)}
                  style={{ background: aula.enabled ? 'var(--green)' : 'var(--gray-300)' }}
                >
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AdminUsersScreen({ users, onToggleBlock }) {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span style={{ marginRight: '10px' }}>{I.People}</span> Gestionar Usuarios</h1>
        <p className="page-sub">Visualiza y controla el acceso de usuarios</p>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Código</th>
            <th>Facultad</th>
            <th>Reservas</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.code}</td>
              <td>{user.faculty}</td>
              <td>{user.reservations}</td>
              <td>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: user.blocked ? 'var(--red-light)' : 'var(--green-light)',
                  color: user.blocked ? 'var(--red)' : 'var(--green)',
                }}>
                  {user.blocked ? 'Bloqueado' : 'Activo'}
                </span>
              </td>
              <td>
                <button
                  className="toggle-btn"
                  onClick={() => onToggleBlock(user.id)}
                >
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AdminReservationsScreen({ allReservations }) {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span style={{ marginRight: '10px' }}>{I.Cal}</span> Todas las Reservas</h1>
        <p className="page-sub">Historial completo de reservas del sistema</p>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Aula</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Personas</th>
            <th>Facultad</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {allReservations?.map((res) => (
            <tr key={res.id}>
              <td>{res.aula}</td>
              <td>{res.date}</td>
              <td>{res.start} - {res.end}</td>
              <td>{res.people}</td>
              <td>{res.faculty}</td>
              <td><StatusBadge status={res.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
