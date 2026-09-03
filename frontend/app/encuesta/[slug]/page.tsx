import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { PanelVotacion } from "@/components/PanelVotacion";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const encuesta = await api.encuestaPorSlug(params.slug).catch(() => null);
  if (!encuesta) return {};
  return {
    title: encuesta.titulo,
    description: `Encuesta ciudadana no oficial en ${encuesta.distrito?.nombre}. Metodología transparente y resultados en vivo.`,
    openGraph: {
      title: encuesta.titulo,
      description: `Participa en la encuesta ciudadana de ${encuesta.distrito?.nombre}. Un servicio de WS Willasayki.`,
      type: "article",
    },
  };
}

export default async function PaginaEncuesta({ params }: { params: { slug: string } }) {
  const encuesta = await api.encuestaPorSlug(params.slug).catch(() => null);
  if (!encuesta) return notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <nav className="text-sm text-pizarra/60 mb-4">
        <Link href="/" className="hover:underline">Encuestas</Link>
        <span className="mx-2">/</span>
        <span>
          {encuesta.distrito?.provincia?.departamento?.nombre} / {encuesta.distrito?.provincia?.nombre} / {encuesta.distrito?.nombre}
        </span>
      </nav>

      <h1 className="font-display text-3xl sm:text-4xl text-tinta leading-tight">
        {encuesta.titulo}
      </h1>

      <p className="text-sm text-pizarra/70 mt-3">
        {encuesta.totalVotos.toLocaleString("es-PE")} votos registrados · Cierra el{" "}
        {new Date(encuesta.fechaCierre).toLocaleDateString("es-PE", {
          day: "2-digit", month: "long", year: "numeric",
        })}
      </p>

      {encuesta.distrito?.contexto && (
        <div className="mt-6 border-l-2 border-andes pl-4 text-sm text-pizarra/80 max-w-lectura">
          <p className="uppercase text-xs text-pizarra/50 mb-1">Contexto territorial</p>
          <p>{encuesta.distrito.contexto}</p>
        </div>
      )}

      <div className="mt-8">
        <PanelVotacion encuesta={encuesta} />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl text-tinta mb-4">Fichas de candidatos</h2>
        <div className="space-y-6">
          {encuesta.candidatos.map((c: any) => (
            <article key={c.id} className="border border-linea p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {c.candidato.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.candidato.fotoUrl}
                      alt={`${c.candidato.nombres} ${c.candidato.apellidos}`}
                      className="w-16 h-16 rounded-full object-cover border border-linea shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-linea/60 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-medium text-tinta">
                      {c.candidato.nombres} {c.candidato.apellidos}
                    </h3>
                    <p className="text-sm text-pizarra/70 flex items-center gap-1.5">
                      {c.candidato.partido?.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.candidato.partido.logoUrl} alt="" className="w-4 h-4 object-contain" />
                      )}
                      {c.candidato.partido?.nombre} · {c.candidato.cargoPostulado}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 border shrink-0 ${
                    c.candidato.hojaVidaVerificada
                      ? "border-andes/40 text-andes bg-andes/5"
                      : "border-linea text-pizarra/60"
                  }`}
                >
                  {c.candidato.hojaVidaVerificada ? "Hoja de vida verificada" : "Verificación pendiente"}
                </span>
              </div>

              {c.candidato.perfilBasico && (
                <p className="text-sm text-pizarra/80 mt-3 max-w-lectura">{c.candidato.perfilBasico}</p>
              )}

              {c.candidato.propuestas?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs uppercase text-pizarra/50 mb-2">Propuestas principales</p>
                  <ul className="space-y-2">
                    {c.candidato.propuestas.map((p: any) => (
                      <li key={p.id} className="text-sm text-pizarra/80">
                        <strong className="text-tinta">{p.eje}:</strong> {p.resumen}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {c.candidato.fuentes?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  {c.candidato.fuentes.map((f: any) => (
                    <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" className="underline text-pizarra/70">
                      {f.titulo}
                    </a>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <p className="mt-10 text-xs text-pizarra/50 border-t border-linea pt-4">
        Encuesta ciudadana independiente, de participación digital abierta y
        autoseleccionada. No representa una proyección estadística
        poblacional ni sustituye los procesos oficiales de ONPE y JNE. Ver{" "}
        <Link href="/metodologia" className="underline">metodología</Link>.
      </p>
    </div>
  );
}
