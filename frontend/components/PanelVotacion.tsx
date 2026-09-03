"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { obtenerFingerprint } from "@/lib/fingerprint";

export function PanelVotacion({ encuesta }: { encuesta: any }) {
  const [estado, setEstado] = useState<"listo" | "enviando" | "ok" | "error">("listo");
  const [mensaje, setMensaje] = useState("");
  const [votadoId, setVotadoId] = useState<string | null>(null);

  const totalVotos = encuesta.candidatos.reduce((a: number, c: any) => a + c.votosCache, 0);

  async function votar(encuestaCandidatoId: string) {
    setEstado("enviando");
    try {
      const resp = await api.votar({
        encuestaId: encuesta.id,
        encuestaCandidatoId,
        deviceFingerprint: obtenerFingerprint(),
      });
      setEstado("ok");
      setMensaje(resp.mensaje);
      setVotadoId(encuestaCandidatoId);
    } catch (e: any) {
      setEstado("error");
      setMensaje(e.message || "No se pudo registrar tu voto.");
    }
  }

  if (encuesta.estado !== "ABIERTA") {
    return (
      <p className="text-sm text-pizarra/70 border border-linea p-4">
        Esta encuesta está {encuesta.estado === "CERRADA" ? "cerrada" : "archivada"}.
        Los resultados abajo son finales de este sondeo.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {encuesta.candidatos.map((c: any) => {
        const porcentaje =
          totalVotos > 0 ? ((c.votosCache / totalVotos) * 100).toFixed(1) : "0.0";
        return (
          <div key={c.id} className="border border-linea p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {c.candidato.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.candidato.fotoUrl}
                  alt={`${c.candidato.nombres} ${c.candidato.apellidos}`}
                  className="w-12 h-12 rounded-full object-cover border border-linea shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-linea/60 shrink-0" />
              )}
              <div>
                <p className="font-medium text-tinta">
                  {c.candidato.nombres} {c.candidato.apellidos}
                </p>
                <p className="text-sm text-pizarra/70 flex items-center gap-1.5">
                  {c.candidato.partido?.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.candidato.partido.logoUrl} alt="" className="w-4 h-4 object-contain" />
                  )}
                  {c.candidato.partido?.nombre}
                </p>
                <p className="text-xs text-pizarra/50 mt-1">
                  {porcentaje}% · {c.votosCache.toLocaleString("es-PE")} votos
                </p>
              </div>
            </div>
            <button
              onClick={() => votar(c.id)}
              disabled={estado === "enviando" || estado === "ok"}
              className="shrink-0 border border-andes text-andes px-4 py-2 text-sm hover:bg-andes hover:text-papel transition-colors disabled:opacity-40"
            >
              {votadoId === c.id && estado === "ok" ? "Votado" : "Votar"}
            </button>
          </div>
        );
      })}

      {mensaje && (
        <p className={`text-sm ${estado === "error" ? "text-chuncho" : "text-andes"}`}>
          {mensaje}
        </p>
      )}

      <p className="text-xs text-pizarra/50 pt-2">
        Un voto por dispositivo y red. Ver{" "}
        <a href="/metodologia" className="underline">cómo prevenimos duplicados y fraude</a>.
      </p>
    </div>
  );
}
