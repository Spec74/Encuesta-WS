"use client";

import { useState } from "react";
import { subirImagen } from "@/lib/cloudinary";

export function SubidaImagen({
  label,
  valor,
  onCambio,
  forma = "circulo",
}: {
  label: string;
  valor: string;
  onCambio: (url: string) => void;
  forma?: "circulo" | "cuadrado";
}) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function manejarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setError("");
    setCargando(true);
    try {
      const url = await subirImagen(archivo);
      onCambio(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
      e.target.value = "";
    }
  }

  return (
    <div className="mb-3">
      <span className="block text-sm text-pizarra/70 mb-1">{label}</span>
      <div className="flex items-center gap-3">
        <div
          className={`w-14 h-14 bg-linea/50 border border-linea overflow-hidden flex items-center justify-center shrink-0 ${
            forma === "circulo" ? "rounded-full" : ""
          }`}
        >
          {valor ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={valor} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-pizarra/40 text-center px-1">Sin imagen</span>
          )}
        </div>
        <div>
          <label className="text-xs border border-linea px-3 py-1.5 cursor-pointer hover:border-andes inline-block">
            {cargando ? "Subiendo…" : valor ? "Cambiar imagen" : "Subir imagen"}
            <input type="file" accept="image/*" className="hidden" onChange={manejarArchivo} disabled={cargando} />
          </label>
          {valor && (
            <button
              type="button"
              onClick={() => onCambio("")}
              className="text-xs text-chuncho ml-2 underline"
            >
              Quitar
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-chuncho mt-1">{error}</p>}
    </div>
  );
}
