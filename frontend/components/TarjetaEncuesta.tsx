import Link from "next/link";

const ESTADO_ESTILOS: Record<string, string> = {
  ABIERTA: "bg-andes/10 text-andes border-andes/30",
  CERRADA: "bg-pizarra/10 text-pizarra border-pizarra/30",
  ARCHIVADA: "bg-linea text-pizarra/70 border-linea",
};

const ESTADO_TEXTO: Record<string, string> = {
  ABIERTA: "Abierta",
  CERRADA: "Cerrada",
  ARCHIVADA: "Archivada",
  BORRADOR: "Próximamente",
};

export function TarjetaEncuesta({ encuesta }: { encuesta: any }) {
  const totalVotos =
    encuesta.candidatos?.reduce((acc: number, c: any) => acc + (c.votosCache || 0), 0) ?? 0;

  return (
    <Link
      href={`/encuesta/${encuesta.slug}`}
      className="block border border-linea rounded-none p-5 hover:border-andes transition-colors bg-papel"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span
          className={`inline-block text-xs px-2 py-0.5 border ${
            ESTADO_ESTILOS[encuesta.estado] || ESTADO_ESTILOS.ARCHIVADA
          }`}
        >
          {ESTADO_TEXTO[encuesta.estado] || encuesta.estado}
        </span>
        <span className="text-xs text-pizarra/70">
          {encuesta.distrito?.nombre}, {encuesta.distrito?.provincia?.nombre}
        </span>
      </div>
      <h3 className="font-display text-lg text-tinta leading-snug">{encuesta.titulo}</h3>
      <p className="text-sm text-pizarra/80 mt-2">
        {totalVotos.toLocaleString("es-PE")} votos registrados · Cierra el{" "}
        {new Date(encuesta.fechaCierre).toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </p>
    </Link>
  );
}
