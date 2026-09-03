"use client";

import { useState } from "react";

export function CompartirEncuesta({ url, titulo }: { url: string; titulo: string }) {
  const [copiado, setCopiado] = useState(false);

  const urlFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(`${titulo} — vota aquí: ${url}`)}`;

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Si el navegador bloquea el portapapeles, no pasa nada — el enlace sigue visible para seleccionar a mano.
    }
  }

  const claseBoton =
    "inline-flex items-center gap-1.5 border border-linea px-3 py-1.5 text-xs text-pizarra hover:border-andes hover:text-andes transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <span className="text-xs text-pizarra/50 mr-1">Compartir:</span>
      <a href={urlFacebook} target="_blank" rel="noopener noreferrer" className={claseBoton}>
        Facebook
      </a>
      <a href={urlWhatsApp} target="_blank" rel="noopener noreferrer" className={claseBoton}>
        WhatsApp
      </a>
      <button onClick={copiarEnlace} className={claseBoton}>
        {copiado ? "¡Copiado!" : "Copiar enlace"}
      </button>
    </div>
  );
}
