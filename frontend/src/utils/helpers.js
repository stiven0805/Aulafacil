export function getInitials(name) {
  return name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d + "T12:00:00");
  return dt.toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
