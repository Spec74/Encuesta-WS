export const metadata = { title: "Transparencia y seguridad" };

export default function PaginaTransparencia() {
  return (
    <div className="mx-auto max-w-lectura px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl text-tinta mb-6">Transparencia y seguridad</h1>

      <div className="space-y-8 text-pizarra leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-tinta mb-2">Financiamiento e independencia editorial</h2>
          <p>
            WS Willasayki opera esta plataforma de forma independiente de
            partidos políticos, candidaturas y organismos electorales. Ningún
            candidato o partido puede pagar por mejorar su posición,
            visibilidad o resultado dentro de una encuesta.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-tinta mb-2">Corrección y actualización</h2>
          <p>
            Si detectas un dato incorrecto en la ficha de un candidato o una
            inconsistencia en los resultados, puedes reportarlo a{" "}
            <a href="mailto:contacto@willasayki.pe" className="underline">
              contacto@willasayki.pe
            </a>{" "}
            . Toda corrección publicada queda registrada con fecha.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-tinta mb-2">Panel de integridad por encuesta</h2>
          <p>
            Cada encuesta activa incluye un resumen agregado y anónimo de
            intentos de voto bloqueados por duplicidad o patrón automatizado,
            visible para cualquier visitante, sin exponer datos personales de
            nadie.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-tinta mb-2">Marco normativo</h2>
          <p>
            Esta plataforma respeta la Ley N.º 29733, Ley de Protección de
            Datos Personales del Perú, y las disposiciones vigentes en
            materia de comunicación política y encuestas emitidas por el JNE
            para el período electoral correspondiente. Consulta también
            nuestra{" "}
            <a href="/privacidad" className="underline">política de privacidad</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
