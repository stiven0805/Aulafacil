export function Home({ user, reservations, setPage }) {
  const upcomingRes = reservations.filter((r) => r.status === 'active');

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 rounded-xl m-6 flex justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Buenas tardes, {user.name}
          </h2>
          <p>Gestiona tus reservas desde aquí</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 m-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <p>Reservas activas</p>
          <h2 className="text-2xl font-bold">
            {reservations.filter(r => r.status === 'active').length}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p>Total reservas</p>
          <h2 className="text-2xl font-bold">
            {reservations.length}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p>Horas</p>
          <h2 className="text-2xl font-bold text-green-500">
            {reservations.length * 2}
          </h2>
        </div>
      </div>

      {/* BOTONES */}
      <div className="bg-white p-6 rounded-xl shadow m-6 flex gap-4">
        <button onClick={() => setPage('reserve')} className="bg-blue-600 text-white px-4 py-2 rounded">
          Reservar
        </button>

        <button onClick={() => setPage('aulas')} className="border px-4 py-2 rounded">
          Aulas
        </button>
      </div>

      <div className="res-list m-6">
        {upcomingRes.length > 0 ? (
          upcomingRes.map((res) => (
            <div key={res.id} className="res-card">
              <p>{res.aula}</p>
            </div>
          ))
        ) : (
          <p>No hay reservas próximas</p>
        )}
      </div>
    </div>
  )
}
