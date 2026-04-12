// Sistema de iconos simple - usando emojis (FUNCIONA GARANTIZADO)
export const I = {
  Logo: '🎓',
  Book: '📖',
  Mail: '✉️',
  Lock: '🔒',
  Eye: '👁️',
  EyeOff: '👁️‍🗨️',
  Home: '🏠',
  Grid: '📊',
  Cal: '📅',
  Plus: '➕',
  Clock: '⏰',
  Bell: '🔔',
  Logout: '🚪',
  User: '👤',
  Check: '✅',
  ChevL: '◀',
  ChevR: '▶',
  Tv: '📺',
  Board: '📋',
  People: '👥',
  Info: 'ℹ️',
  Cancel: '❌',
  Star: '⭐',
  Shield: '🛡️',
  Chart: '📈',
  Gear: '⚙️',
  Arrow: '→',
  X: '✕',
  MapPin: '📍',
  Phone: '📞',
  Download: '⬇️',
  Trash: '🗑️',
  Edit: '✏️',
}

// Dummy functions for compatibility
export function Icon({ name }) {
  return I[name] || null
}

export function getIcon(name) {
  return I[name] || null
}
