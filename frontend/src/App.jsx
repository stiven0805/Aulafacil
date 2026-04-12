import { useState } from 'react'
import { LoginScreen, RegisterScreen } from './pages/auth/AuthPages'
import { Home, Aulas, Calendar, Reserve, History, Notifications } from './pages/user'
import {
  AdminHomeScreen,
  AdminAulasScreen,
  AdminUsersScreen,
  AdminReservationsScreen,
} from './pages/admin/AdminPages'
import { Navbar } from './components/common'
import {
  AULAS_INIT,
  USERS_INIT,
  RESERVATIONS_INIT,
  NOTIFICATIONS_INIT,
} from './utils/data'

function App() {
  const [authPage, setAuthPage] = useState('login')
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('home')
  const [aulas, setAulas] = useState(AULAS_INIT)
  const [users, setUsers] = useState(USERS_INIT)
  const [reservations, setReservations] = useState(RESERVATIONS_INIT)
  const [notifications, setNotifications] = useState(NOTIFICATIONS_INIT)

  const handleLogin = (credentials) => {
    const mockUser = {
      id: 1,
      name: 'Juan Pérez',
      email: credentials.email,
      role: 'student',
      faculty: 'Ingeniería',
    }
    setUser(mockUser)
  }

  const handleRegister = (data) => {
    console.log('Registrar:', data)
    setAuthPage('login')
  }

  const handleLogout = () => {
    setUser(null)
    setPage('home')
    setAuthPage('login')
  }

  const handleReserve = (reserveData) => {
    const newReservation = {
      id: reservations.length + 1,
      aula: reserveData.aula?.name || 'Aula',
      date: reserveData.date,
      start: reserveData.start,
      end: reserveData.end,
      people: parseInt(reserveData.people),
      faculty: user.faculty,
      status: 'active',
    }
    setReservations([...reservations, newReservation])
    
    // Agregar notificación
    const notification = {
      id: notifications.length + 1,
      type: 'confirm',
      title: 'Reserva Confirmada',
      desc: `Tu reserva para ${newReservation.aula} el ${newReservation.date} ha sido confirmada.`,
      time: 'Justo ahora',
      read: false,
    }
    setNotifications([...notifications, notification])
    
    setPage('home')
  }

  const handleCancelReservation = (reserveId) => {
    setReservations(
      reservations.map((r) =>
        r.id === reserveId ? { ...r, status: 'cancelled' } : r
      )
    )
    
    // Agregar notificación
    const res = reservations.find((r) => r.id === reserveId)
    const notification = {
      id: notifications.length + 1,
      type: 'cancelled',
      title: 'Reserva Cancelada',
      desc: `Tu reserva para ${res.aula} ha sido cancelada.`,
      time: 'Justo ahora',
      read: false,
    }
    setNotifications([...notifications, notification])
  }

  const handleMarkNotificationRead = (notifId) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notifId ? { ...n, read: true } : n
      )
    )
  }

  const handleMarkAllNotificationsRead = () => {
    setNotifications(
      notifications.map((n) => ({ ...n, read: true }))
    )
  }

  if (!user) {
    return (
      <div className="app">
        {authPage === 'login' ? (
          <LoginScreen
            onLogin={handleLogin}
            onGoRegister={() => setAuthPage('register')}
          />
        ) : (
          <RegisterScreen
            onGoLogin={() => setAuthPage('login')}
          />
        )}
      </div>
    )
  }

  return (
    <div className="app">
      <Navbar
        user={user}
        page={page}
        setPage={setPage}
        notifCount={notifications.filter((n) => !n.read).length}
        onLogout={handleLogout}
      />

      {user.role === 'student' && page === 'home' && (
        <Home user={user} reservations={reservations} setPage={setPage} />
      )}
      {user.role === 'student' && page === 'aulas' && (
        <Aulas aulas={aulas} />
      )}
      {user.role === 'student' && page === 'reserve' && (
        <Reserve aulas={aulas} user={user} onReserve={handleReserve} />
      )}
      {user.role === 'student' && page === 'calendar' && (
        <Calendar reservations={reservations} />
      )}
      {user.role === 'student' && page === 'history' && (
        <History reservations={reservations} onCancel={handleCancelReservation} />
      )}
      {user.role === 'student' && page === 'notifications' && (
        <Notifications
          notifications={notifications}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
        />
      )}

      {user.role === 'admin' && page === 'admin-home' && (
        <AdminHomeScreen />
      )}
      {user.role === 'admin' && page === 'admin-aulas' && (
        <AdminAulasScreen aulas={aulas} setAulas={setAulas} />
      )}
      {user.role === 'admin' && page === 'admin-users' && (
        <AdminUsersScreen users={users} setUsers={setUsers} />
      )}
      {user.role === 'admin' && page === 'admin-reservations' && (
        <AdminReservationsScreen reservations={reservations} />
      )}
    </div>
  )
}

export default App
