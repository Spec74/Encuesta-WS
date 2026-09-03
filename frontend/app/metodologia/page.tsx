export const metadata = { title: "Metodología" };

export default function PaginaMetodologia() {
  return (
    <div className="mx-auto max-w-lectura px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl text-tinta mb-6">Metodología</h1>

      <div className="space-y-8 text-pizarra leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-tinta mb-2">1. Qué es esta encuesta</h2>
          <p>
            Las encuestas de WS Willasayki son <strong>sondeos ciudadanos de
            participación digital abierta</strong>: cualquier persona con acceso
            al enlace puede emitir un voto simbólico por el candidato de su
            preferencia en su distrito. No utilizan una muestra
            probabilística representativa de la población electoral, por lo
            que <strong>no deben leerse como una proyección estadística de
            resultados</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-tinta mb-2">2. Cómo se recogen los votos</h2>
          <p>
            Cada persona puede emitir un voto por encuesta. El sistema
            identifica cada intento mediante la combinación de una huella de
            dispositivo generada en el navegador y un hash irreversible de la
            dirección IP de origen (truncada antes de procesarse: nunca se
            almacena la IP completa ni en texto plano).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-tinta mb-2">3. Control de duplicados y fraude</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Restricción única por combinación de encuesta, dispositivo e IP truncada.</li>
            <li>Límite de intentos por origen en ventanas de tiempo cortas (control de patrones automatizados).</li>
            <li>Verificación de cabeceras de navegador para descartar tráfico de bots o scripts.</li>
            <li>Registro agregado y anónimo de intentos bloqueados, visible en cada encuesta en su panel de transparencia.</li>
          </ul>
          <p className="mt-2">
            Ningún sistema de participación digital abierta puede garantizar
            al 100% la imposibilidad de duplicación (por ejemplo, entre
            distintos dispositivos de una misma persona). Por eso el
            resultado se presenta siempre como referencial.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-tinta mb-2">4. Fichas de candidatos</h2>
          <p>
            La información de cada candidato se contrasta, cuando está
            disponible, con fuentes oficiales (hoja de vida JNE / plataforma
            Declara Justo) y prensa verificada. Cuando un dato no ha sido
            verificado, la ficha lo indica explícitamente como
            &quot;verificación pendiente&quot;.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-tinta mb-2">5. Encuesta ciudadana vs. proceso oficial</h2>
          <p>
            Los únicos resultados electorales oficiales y vinculantes en el
            Perú son los publicados por la <strong>ONPE</strong> (conteo de
            actas) y proclamados por el <strong>JNE</strong>. Esta plataforma
            no participa, no representa ni sustituye a ninguna entidad del
            sistema electoral peruano.
          </p>
        </section>
      </div>
    </div>
  );
}
