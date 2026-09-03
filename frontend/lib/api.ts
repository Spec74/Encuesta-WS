const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function obtener<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: { "Content-Type": "application/json", ...(opciones?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => ({}));
    throw new Error(cuerpo.error || `Error al consultar ${ruta}`);
  }
  return res.json();
}

export const api = {
  departamentos: () => obtener<any[]>("/geografia/departamentos"),
  provincias: (departamentoId: string) =>
    obtener<any[]>(`/geografia/departamentos/${departamentoId}/provincias`),
  distritos: (provinciaId: string) =>
    obtener<any[]>(`/geografia/provincias/${provinciaId}/distritos`),
  encuestas: (params?: { estado?: string; distritoId?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return obtener<any[]>(`/encuestas${qs ? `?${qs}` : ""}`);
  },
  encuestaPorSlug: (slug: string) => obtener<any>(`/encuestas/${slug}`),
  votar: (payload: { encuestaId: string; encuestaCandidatoId: string; deviceFingerprint: string }) =>
    obtener<{ ok: boolean; mensaje: string }>("/votos", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
