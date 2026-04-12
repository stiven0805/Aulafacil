// User Pages
export { Home, Aulas, Calendar, Reserve, History, Notifications } from './user'

// Admin Pages  
export {
  AdminHomeScreen,
  AdminAulasScreen,
  AdminUsersScreen,
  AdminReservationsScreen,
} from './admin/AdminPages'

// Auth Pages
export { LoginScreen, RegisterScreen } from './auth/AuthPages'

// Legacy exports (for backwards compatibility during migration)
export { Home as HomeScreen } from './user'
export { Aulas as AulasScreen } from './user'
export { Calendar as CalendarScreen } from './user'
export { Reserve as ReserveScreen } from './user'
export { History as HistoryScreen } from './user'
export { Notifications as NotificationsScreen } from './user'
