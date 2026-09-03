/** Parser CSV simple, sin dependencias: soporta campos entre comillas con comas dentro. */
export function parsearCSV(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = "";
  let dentroComillas = false;

  const contenido = texto.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < contenido.length; i++) {
    const char = contenido[i];
    const siguiente = contenido[i + 1];

    if (dentroComillas) {
      if (char === '"' && siguiente === '"') {
        campo += '"';
        i++;
      } else if (char === '"') {
        dentroComillas = false;
      } else {
        campo += char;
      }
    } else {
      if (char === '"') {
        dentroComillas = true;
      } else if (char === ",") {
        fila.push(campo);
        campo = "";
      } else if (char === "\n") {
        fila.push(campo);
        filas.push(fila);
        fila = [];
        campo = "";
      } else {
        campo += char;
      }
    }
  }
  if (campo.length > 0 || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }

  return filas.filter((f) => f.some((c) => c.trim().length > 0));
}
