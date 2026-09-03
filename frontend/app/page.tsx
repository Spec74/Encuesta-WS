import { api } from "@/lib/api";
import { SelectorGeografico } from "@/components/SelectorGeografico";
import { TarjetaEncuesta } from "@/components/TarjetaEncuesta";

export default async function PaginaInicio({
  searchParams,
}: {
  searchParams: { distritoId?: string };
}) {
  const encuestas = await api
    .encuestas({ distritoId: searchParams.distritoId })
    .catch(() => []);

  return (
    <div>
      <section className="border-b border-linea bg-papel">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-sm text-chuncho mb-3">Encuestas ciudadanas · Perú</p>
          <h1 className="font-display text-3xl sm:text-5xl text-tinta leading-tight max-w-2xl">
            La voz ciudadana, distrito por distrito.
          </h1>
          <p className="mt-4 max-w-lectura text-pizarra text-base sm:text-lg">
            Participa en sondeos digitales abiertos sobre las principales
            candidaturas de tu localidad. Cada encuesta indica su metodología,
            su margen de participación y su carácter no oficial.
          </p>
          <div className="mt-8 max-w-2xl">
            <SelectorGeografico />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl text-tinta">Encuestas activas</h2>
          <span className="text-sm text-pizarra/70">{encuestas.length} resultados</span>
        </div>

        {encuestas.length === 0 ? (
          <p className="text-pizarra/70 border border-dashed border-linea p-8 text-center">
            No hay encuestas disponibles para este filtro todavía. Elige otro
            distrito o vuelve a revisar próximamente.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {encuestas.map((e: any) => (
              <TarjetaEncuesta key={e.id} encuesta={e} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
