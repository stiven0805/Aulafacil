export const mockAulas = [
  {
    id: 1,
    name: "Aula 101",
    capacity: 20,
    enabled: true,
    tv: true,
    pizarron: true,
    faculty: "Ingeniería"
  },
  {
    id: 2,
    name: "Aula 102",
    capacity: 30,
    enabled: true,
    tv: true,
    pizarron: true,
    faculty: "Ingeniería"
  },
  {
    id: 3,
    name: "Aula 201",
    capacity: 15,
    enabled: true,
    tv: false,
    pizarron: true,
    faculty: "Derecho"
  },
  {
    id: 4,
    name: "Aula 202",
    capacity: 25,
    enabled: true,
    tv: true,
    pizarron: false,
    faculty: "Medicina"
  }
]

export const mockUsers = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan@universidad.edu",
    role: "student",
    blocked: false,
    faculty: "Ingeniería"
  },
  {
    id: 2,
    name: "María García",
    email: "maria@universidad.edu",
    role: "student",
    blocked: false,
    faculty: "Medicina"
  }
]

export const mockReservations = [
  {
    id: 1,
    aula: "Aula 101",
    date: "2026-04-15",
    start: "09:00",
    end: "11:00",
    people: 12,
    faculty: "Ingeniería",
    status: "active",
    user: "Juan Pérez"
  },
  {
    id: 2,
    aula: "Aula 102",
    date: "2026-04-16",
    start: "14:00",
    end: "16:00",
    people: 8,
    faculty: "Ingeniería",
    status: "completed",
    user: "María García"
  }
]

export const mockNotifications = [
  {
    id: 1,
    title: "Reserva confirmada",
    desc: "Tu reserva de Aula 101 ha sido confirmada",
    read: false,
    type: "confirm",
    time: "Hace 5 minutos"
  },
  {
    id: 2,
    title: "Recordatorio",
    desc: "Tu reserva en Aula 102 es en 1 hora",
    read: true,
    type: "reminder",
    time: "Hace 30 minutos"
  }
]
