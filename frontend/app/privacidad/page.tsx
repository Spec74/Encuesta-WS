export const metadata = { title: "Política de privacidad" };

export default function PaginaPrivacidad() {
  return (
    <div className="mx-auto max-w-lectura px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl text-tinta mb-6">Política de privacidad</h1>
      <div className="space-y-8 text-pizarra leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-tinta mb-2">Qué datos procesamos</h2>
          <p>
            Para emitir un voto no se solicita nombre, correo, documento de
            identidad ni ningún dato que te identifique directamente.
            Procesamos únicamente: un hash irreversible de tu dirección IP
            (truncada), un identificador técnico generado en tu navegador
            (huella de dispositivo) y la marca de tiempo del voto.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-tinta mb-2">Finalidad</h2>
          <p>
            Estos datos técnicos se usan exclusivamente para impedir votos
            duplicados y detectar patrones de automatización. No se usan con
            fines publicitarios ni se comparten con partidos políticos,
            candidatos ni terceros comerciales.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-tinta mb-2">Conservación</h2>
          <p>
            Los registros técnicos de voto se conservan hasta el cierre del
            proceso electoral correspondiente más un periodo razonable de
            auditoría, tras el cual se eliminan o anonimizan de forma
            agregada.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-tinta mb-2">Tus derechos</h2>
          <p>
            De acuerdo con la Ley N.º 29733, puedes ejercer tus derechos de
            acceso, rectificación, cancelación y oposición escribiendo a{" "}
            <a href="mailto:contacto@willasayki.pe" className="underline">contacto@willasayki.pe</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
