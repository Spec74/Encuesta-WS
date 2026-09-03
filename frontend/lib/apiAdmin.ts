const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function llamar<T>(ruta: string, token: string, opciones?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/admin${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opciones?.headers || {}),
    },
    cache: "no-store",
  });
  const cuerpo = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(cuerpo.error || `Error al llamar ${ruta}`);
  return cuerpo;
}

export const apiAdmin = {
  resumen: (token: string) => llamar<any>("/resumen", token),

  departamentos: (token: string) => llamar<any[]>("/departamentos", token),
  crearDepartamento: (token: string, datos: any) =>
    llamar("/departamentos", token, { method: "POST", body: JSON.stringify(datos) }),

  crearProvincia: (token: string, datos: any) =>
    llamar("/provincias", token, { method: "POST", body: JSON.stringify(datos) }),

  crearDistrito: (token: string, datos: any) =>
    llamar("/distritos", token, { method: "POST", body: JSON.stringify(datos) }),
  provincias: (token: string) => llamar<any[]>("/provincias", token),
  distritos: (token: string) => llamar<any[]>("/distritos", token),
  actualizarDistrito: (token: string, id: string, datos: any) =>
    llamar(`/distritos/${id}`, token, { method: "PATCH", body: JSON.stringify(datos) }),

  elecciones: (token: string) => llamar<any[]>("/elecciones", token),
  crearEleccion: (token: string, datos: any) =>
    llamar("/elecciones", token, { method: "POST", body: JSON.stringify(datos) }),

  partidos: (token: string) => llamar<any[]>("/partidos", token),
  crearPartido: (token: string, datos: any) =>
    llamar("/partidos", token, { method: "POST", body: JSON.stringify(datos) }),
  actualizarPartido: (token: string, id: string, datos: any) =>
    llamar(`/partidos/${id}`, token, { method: "PATCH", body: JSON.stringify(datos) }),

  candidatos: (token: string) => llamar<any[]>("/candidatos", token),
  crearCandidato: (token: string, datos: any) =>
    llamar("/candidatos", token, { method: "POST", body: JSON.stringify(datos) }),
  actualizarCandidato: (token: string, id: string, datos: any) =>
    llamar(`/candidatos/${id}`, token, { method: "PATCH", body: JSON.stringify(datos) }),
  agregarPropuesta: (token: string, candidatoId: string, datos: any) =>
    llamar(`/candidatos/${candidatoId}/propuestas`, token, { method: "POST", body: JSON.stringify(datos) }),
  eliminarPropuesta: (token: string, id: string) =>
    llamar(`/propuestas/${id}`, token, { method: "DELETE" }),
  agregarExperiencia: (token: string, candidatoId: string, datos: any) =>
    llamar(`/candidatos/${candidatoId}/experiencias`, token, { method: "POST", body: JSON.stringify(datos) }),
  eliminarExperiencia: (token: string, id: string) =>
    llamar(`/experiencias/${id}`, token, { method: "DELETE" }),
  agregarFuente: (token: string, candidatoId: string, datos: any) =>
    llamar(`/candidatos/${candidatoId}/fuentes`, token, { method: "POST", body: JSON.stringify(datos) }),
  eliminarFuente: (token: string, id: string) =>
    llamar(`/fuentes/${id}`, token, { method: "DELETE" }),

  encuestas: (token: string) => llamar<any[]>("/encuestas", token),
  crearEncuesta: (token: string, datos: any) =>
    llamar("/encuestas", token, { method: "POST", body: JSON.stringify(datos) }),
  cambiarEstadoEncuesta: (token: string, id: string, estado: string) =>
    llamar(`/encuestas/${id}/estado`, token, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    }),
};
