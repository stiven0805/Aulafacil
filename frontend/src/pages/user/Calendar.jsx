import React, { useState } from 'react'
import { I } from '../../utils/icons'

export function Calendar({ reservations }) {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const daysInMonth = getDaysInMonth(selectedDate)
  const firstDay = getFirstDayOfMonth(selectedDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const prevDays = Array.from({ length: firstDay }, () => null)

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span style={{ marginRight: '10px' }}>{I.Cal}</span> Calendario de Reservas</h1>
        <p className="page-sub">Ver disponibilidad de aulas por fecha</p>
      </div>

      <div className="calendar-grid">
        <div className="mini-cal">
          <div className="mini-cal-header">
            <button className="nav-btn">
              <I.ChevL />
            </button>
            <span className="month-label">
              {selectedDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
            </span>
            <button className="nav-btn">
              <I.ChevR />
            </button>
          </div>

          <div className="mini-cal-grid">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
              <div key={day} className="cal-day-label">{day}</div>
            ))}
            {prevDays.map((_, i) => (
              <div key={`prev-${i}`} style={{ opacity: 0 }}>-</div>
            ))}
            {days.map((day) => (
              <button
                key={day}
                className={`cal-day ${
                  day === new Date().getDate() ? 'today' : ''
                } ${reservations?.some(r => r.date === `2026-03-${day}`) ? 'has-res' : ''}`}
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="cal-legend">
            <span><span className="dot" style={{ background: 'var(--blue)' }}></span> Hoy</span>
            <span><span className="dot" style={{ background: 'var(--blue-mid)' }}></span> Con reservas</span>
            <span><span className="dot" style={{ background: 'var(--amber)' }}></span> Festivo</span>
          </div>
        </div>

        <div className="avail-grid">
          <div className="avail-header">
            <div className="avail-title">Disponibilidad del {selectedDate.toLocaleDateString('es-CO')}</div>
            <div className="avail-sub"><I.Info style={{ marginRight: '8px' }} /> Horarios disponibles para reservas</div>
          </div>

          <table className="time-table">
            <thead>
              <tr>
                <th className="time-col">Hora</th>
                <th>Aula 1</th>
                <th>Aula 2</th>
                <th>Aula 3</th>
                <th>Aula 4</th>
              </tr>
            </thead>
            <tbody>
              {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'].map((time) => (
                <tr key={time}>
                  <td className="time-col">{time}</td>
                  <td>
                    <div className="time-slot avail"><I.Check /></div>
                  </td>
                  <td>
                    <div className="time-slot reserved">Reservado</div>
                  </td>
                  <td>
                    <div className="time-slot avail"><I.Check /></div>
                  </td>
                  <td>
                    <div className="time-slot avail"><I.Check /></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
