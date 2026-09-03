export const metadata = { title: "Términos de uso" };

export default function PaginaTerminos() {
  return (
    <div className="mx-auto max-w-lectura px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl text-tinta mb-6">Términos de uso</h1>
      <div className="space-y-8 text-pizarra leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-tinta mb-2">Naturaleza del servicio</h2>
          <p>
            Esta plataforma, operada por WS Willasayki, ofrece encuestas
            ciudadanas de participación digital abierta con fines
            informativos y de debate público. No es un servicio de votación
            electoral oficial ni está afiliada a ONPE, JNE o RENIEC.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-tinta mb-2">Uso permitido</h2>
          <p>
            El usuario se compromete a no utilizar scripts, bots, VPN
            rotativas u otros medios automatizados para alterar los
            resultados de una encuesta. WS Willasayki puede invalidar votos o
            suspender el acceso ante evidencia de manipulación.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-tinta mb-2">Propiedad intelectual</h2>
          <p>
            Los textos, diseño y marca WS Willasayki son de titularidad de
            sus editores. Se permite citar y enlazar resultados con
            atribución clara a la fuente.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-tinta mb-2">Limitación de responsabilidad</h2>
          <p>
            Los resultados publicados son de carácter referencial. WS
            Willasayki no garantiza que reflejen la intención de voto real de
            la población y no asume responsabilidad por decisiones tomadas
            con base exclusiva en ellos.
          </p>
        </section>
      </div>
    </div>
  );
}
