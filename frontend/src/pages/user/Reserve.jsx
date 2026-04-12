import React, { useState } from 'react'
import { I } from '../../utils/icons'
import { FACULTIES, HOURS } from '../../utils/data'
import { Button } from '../../components/common'

export function Reserve({ aulas, user, onReserve }) {
  const [step, setStep] = useState(1)
  const [selectedAula, setSelectedAula] = useState(null)
  const [fecha, setFecha] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFin, setHoraFin] = useState('')
  const [personas, setPersonas] = useState('')
  const [errors, setErrors] = useState({})

  const validateStep = (stepNum) => {
    const newErrors = {}
    
    if (stepNum === 1 && !selectedAula) {
      newErrors.aula = 'Selecciona un aula'
    }
    if (stepNum === 2) {
      if (!fecha) newErrors.fecha = 'Selecciona una fecha'
      if (!horaInicio) newErrors.horaInicio = 'Selecciona hora de inicio'
      if (!horaFin) newErrors.horaFin = 'Selecciona hora final'
      if (!personas) newErrors.personas = 'Ingresa número de personas'
      if (horaInicio && horaFin && horaInicio >= horaFin) {
        newErrors.horas = 'La hora de fin debe ser posterior a la de inicio'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleReserve = () => {
    onReserve({
      aula: selectedAula,
      date: fecha,
      start: horaInicio,
      end: horaFin,
      people: personas,
    })
    setStep(1)
    setSelectedAula(null)
    setFecha('')
    setHoraInicio('')
    setHoraFin('')
    setPersonas('')
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span style={{ marginRight: '10px' }}>{I.Plus}</span> Nueva Reserva de Aula</h1>
        <p className="page-sub">Sigue los pasos para reservar un aula</p>
      </div>

      {/* Stepper mejorado */}
      <div className="stepper" style={{ marginBottom: '32px' }}>
        {[1, 2, 3, 4].map((s, idx) => (
          <React.Fragment key={s}>
            <div className="step-item">
              <div className={`step-circle ${step >= s ? (step === s ? 'active' : 'done') : ''}`}>
                {step > s ? I.Check : s}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '6px', fontWeight: '600' }}>
                {['Aula', 'Fechas', 'Confirmar', 'Listo'][idx]}
              </div>
            </div>
            {idx < 3 && <div className={`step-line ${step > s + 1 ? 'done' : ''}`}></div>}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="step-card">
          <h3 className="step-title"><span style={{ marginRight: '8px' }}>{I.Grid}</span> Selecciona un aula</h3>
          <p className="step-sub">Elige la aula que necesitas reservar</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px',
            marginBottom: '24px',
          }}>
            {aulas?.map((aula) => (
              <div
                key={aula.id}
                className={`room-select-card ${selectedAula?.id === aula.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedAula(aula)
                  setErrors({})
                }}
                style={{
                  transition: 'all var(--transition)',
                  opacity: aula.enabled ? 1 : 0.6,
                  cursor: aula.enabled ? 'pointer' : 'not-allowed',
                  pointerEvents: aula.enabled ? 'auto' : 'none',
                }}
              >
                <div className="top-line"></div>
                <div style={{ paddingTop: '6px' }}>
                  <div className="room-card-name">
                    {aula.name}
                    <span style={{ fontSize: '14px', color: 'var(--green)' }}>
                      {aula.enabled ? I.Check : I.Cancel}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    marginTop: '12px',
                    fontSize: '12px',
                    color: 'var(--gray-600)',
                  }}>
                    <div>
                      <span style={{ color: 'var(--gray-400)', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Capacidad
                      </span>
                      <div style={{ fontWeight: '700', marginTop: '2px' }}>
                        {aula.capacity} personas
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--gray-400)', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Disponibilidad
                      </span>
                      <div style={{ fontWeight: '700', marginTop: '2px', color: 'var(--green)' }}>
                        Abierta
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px', fontSize: '11px', color: 'var(--gray-500)' }}>
                    {aula.tv && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{I.Tv} TV</span>}
                    {aula.pizarron && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{I.Board} Pizarrón</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {errors.aula && <div style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '12px' }}><span style={{ marginRight: '4px' }}>{I.Info}</span> {errors.aula}</div>}

          <div className="step-nav">
            <Button variant="outline">Cancelar</Button>
            <Button onClick={() => validateStep(1) && setStep(2)}>
              Siguiente <span style={{ marginLeft: '6px' }}>{I.Arrow}</span>
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step-card">
          <h3 className="step-title"><span style={{ marginRight: '8px' }}>{I.Cal}</span> Fecha y hora de reserva</h3>
          <p className="step-sub">Especifica cuándo necesitas el aula</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '14px',
            marginBottom: '20px',
          }}>
            <div className="form-group">
              <label className="form-label"><span style={{ marginRight: '4px' }}>{I.Cal}</span> Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value)
                  setErrors({...errors, fecha: ''})
                }}
                className={`date-input ${errors.fecha ? 'error' : ''}`}
              />
              {errors.fecha && <div style={{ color: 'var(--red)', fontSize: '11px', marginTop: '4px' }}>{errors.fecha}</div>}
            </div>

            <div className="form-group">
              <label className="form-label"><span style={{ marginRight: '4px' }}>{I.People}</span> Personas</label>
              <div className="input-wrap">
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>{I.People}</span>
                <input
                  type="number"
                  min="1"
                  max={selectedAula?.capacity}
                  value={personas}
                  onChange={(e) => {
                    setPersonas(e.target.value)
                    setErrors({...errors, personas: ''})
                  }}
                  className="form-input"
                  placeholder="Cantidad"
                />
              </div>
              {errors.personas && <div style={{ color: 'var(--red)', fontSize: '11px', marginTop: '4px' }}>{errors.personas}</div>}
            </div>

            <div className="form-group">
              <label className="form-label"><span style={{ marginRight: '4px' }}>{I.Clock}</span> Hora de inicio</label>
              <div className="input-wrap">
                <select
                  value={horaInicio}
                  onChange={(e) => {
                    setHoraInicio(e.target.value)
                    setErrors({...errors, horaInicio: '', horas: ''})
                  }}
                  className={`select-field ${errors.horaInicio ? 'error' : ''}`}
                >
                  <option value="">Selecciona</option>
                  {HOURS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              {errors.horaInicio && <div style={{ color: 'var(--red)', fontSize: '11px', marginTop: '4px' }}>{errors.horaInicio}</div>}
            </div>

            <div className="form-group">
              <label className="form-label"><span style={{ marginRight: '4px' }}>{I.Clock}</span> Hora de fin</label>
              <div className="input-wrap">
                <select
                  value={horaFin}
                  onChange={(e) => {
                    setHoraFin(e.target.value)
                    setErrors({...errors, horaFin: '', horas: ''})
                  }}
                  className={`select-field ${errors.horaFin ? 'error' : ''}`}
                >
                  <option value="">Selecciona</option>
                  {HOURS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              {errors.horaFin && <div style={{ color: 'var(--red)', fontSize: '11px', marginTop: '4px' }}>{errors.horaFin}</div>}
            </div>
          </div>

          {errors.horas && <div style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '12px', padding: '8px 12px', background: 'var(--red-light)', borderRadius: 'var(--radius-sm)' }}><span style={{ marginRight: '4px' }}>{I.Info}</span> {errors.horas}</div>}

          <div className="step-nav">
            <Button variant="outline" onClick={() => setStep(1)}>
              <span style={{ marginRight: '4px' }}>{I.ChevL}</span> Atrás
            </Button>
            <Button onClick={() => validateStep(2) && setStep(3)}>
              Siguiente <span style={{ marginLeft: '6px' }}>{I.Arrow}</span>
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="step-card">
          <h3 className="step-title"><span style={{ marginRight: '8px' }}>{I.Check}</span> Confirma tu reserva</h3>
          <p className="step-sub">Revisa los detalles antes de confirmar</p>

          <div style={{
            background: 'var(--blue-light)',
            border: '1.5px solid var(--blue-mid)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            marginBottom: '20px',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '14px 20px',
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  <span style={{ marginRight: '4px' }}>{I.Grid}</span> Aula
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gray-900)' }}>
                  {selectedAula?.name}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  <span style={{ marginRight: '4px' }}>{I.Cal}</span> Fecha
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gray-900)' }}>
                  {fecha}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  <span style={{ marginRight: '4px' }}>{I.Clock}</span> Horario
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gray-900)' }}>
                  {horaInicio} - {horaFin}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  <span style={{ marginRight: '4px' }}>{I.People}</span> Personas
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gray-900)' }}>
                  {personas}/{selectedAula?.capacity}
                </div>
              </div>
            </div>
          </div>

          <div className="rules-box">
            <h4><span style={{ marginRight: '6px' }}>{I.Shield}</span> Reglas y condiciones</h4>
            <ul>
              <li>La reserva es válida 15 minutos después de la hora de inicio</li>
              <li>Debes abandonar el aula 5 minutos antes de tu hora de fin</li>
              <li>Prohibido mover mobiliario sin autorización</li>
              <li>Mantén el aula limpia y en orden</li>
            </ul>
          </div>

          <div style={{ 
            background: 'var(--green-light)', 
            border: '1.5px solid var(--green)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '12px',
            marginBottom: '20px',
            fontSize: '12px',
            color: 'var(--green)',
            fontWeight: '600',
          }}>
            <span style={{ marginRight: '6px' }}>{I.Check}</span> Todas las validaciones pasadas correctamente
          </div>

          <div className="step-nav">
            <Button variant="outline" onClick={() => setStep(2)}>
              <span style={{ marginRight: '4px' }}>{I.ChevL}</span> Atrás
            </Button>
            <Button onClick={() => {
              handleReserve()
              setStep(4)
            }}>
              Confirmar reserva <span style={{ marginLeft: '6px' }}>{I.Check}</span>
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="step-card" style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--green-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            margin: '0 auto 16px',
          }}>
            {I.Check}
          </div>
          <h3 className="step-title">¡Reserva confirmada!</h3>
          <p className="step-sub">Tu reserva ha sido creada exitosamente y recibirás una confirmación por correo</p>

          <div style={{
            background: 'var(--gray-50)',
            border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius)',
            padding: '20px',
            marginBottom: '20px',
            textAlign: 'left',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: '600', marginBottom: '4px' }}>NÚMERO DE RESERVA</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--blue)', fontFamily: 'monospace' }}>#RES-2026-0001</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: '600', marginBottom: '4px' }}>CÓDIGO QR</div>
                <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Escanea al llegar al aula</div>
              </div>
            </div>
          </div>

          <div className="step-nav">
            <Button onClick={() => handleReserve()}>
              Volver al inicio
            </Button>
            <Button onClick={() => {
              handleReserve()
              setStep(1)
            }}>
              Nueva reserva <span style={{ marginLeft: '6px' }}>{I.Plus}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
