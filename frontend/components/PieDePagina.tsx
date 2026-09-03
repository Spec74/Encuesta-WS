import Link from "next/link";

export function PieDePagina() {
  return (
    <footer className="border-t border-linea bg-pizarra text-papel/90 mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg text-papel">WS Willasayki</p>
          <p className="text-sm mt-2 text-papel/70 max-w-xs">
            Medio de noticias automatizadas y plataforma de encuestas ciudadanas
            independientes. Un ecosistema informativo para el Perú.
          </p>
        </div>
        <div className="text-sm">
          <p className="uppercase text-papel/60 mb-2">Plataforma</p>
          <ul className="space-y-1.5">
            <li><Link href="/metodologia" className="hover:underline">Metodología</Link></li>
            <li><Link href="/transparencia" className="hover:underline">Transparencia y seguridad</Link></li>
            <li><Link href="/privacidad" className="hover:underline">Política de privacidad</Link></li>
            <li><Link href="/terminos" className="hover:underline">Términos de uso</Link></li>
            <li><Link href="/preguntas-frecuentes" className="hover:underline">Preguntas frecuentes</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="uppercase text-papel/60 mb-2">Aviso legal</p>
          <p className="text-papel/70 leading-relaxed">
            Las encuestas publicadas en esta plataforma son sondeos ciudadanos
            de participación digital abierta, de carácter <strong>referencial y
            no oficial</strong>. No constituyen una encuesta de intención de voto
            con muestreo probabilístico ni sustituyen los procesos electorales
            conducidos por el <strong>JNE</strong>, la <strong>ONPE</strong> y el
            <strong> RENIEC</strong>. Ver{" "}
            <Link href="/metodologia" className="underline">metodología completa</Link>.
          </p>
        </div>
      </div>
      <div className="border-t border-papel/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between gap-2 text-xs text-papel/60">
          <p>© {new Date().getFullYear()} WS Willasayki. Todos los derechos reservados.</p>
          <p>contacto@willasayki.pe</p>
        </div>
      </div>
    </footer>
  );
}
