/**
 * Huella de dispositivo ligera y persistente en localStorage.
 * No identifica a la persona: solo ayuda a impedir votos duplicados
 * desde el mismo navegador. Se combina en el servidor con un hash de IP.
 */
export function obtenerFingerprint(): string {
  const CLAVE = "ws_willasayki_fp";
  if (typeof window === "undefined") return "";

  let fp = localStorage.getItem(CLAVE);
  if (fp) return fp;

  const semilla = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    Math.random().toString(36).slice(2),
  ].join("|");

  fp = btoa(unescape(encodeURIComponent(semilla))).slice(0, 64);
  localStorage.setItem(CLAVE, fp);
  return fp;
}
