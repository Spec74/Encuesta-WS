export const metadata = { title: "Guía electoral y preguntas frecuentes" };

const PREGUNTAS = [
  {
    q: "¿Esta encuesta es igual a un proceso electoral oficial?",
    a: "No. Es un sondeo ciudadano de participación digital abierta, con fines informativos. Los resultados oficiales y vinculantes son exclusivamente los publicados por la ONPE y proclamados por el JNE.",
  },
  {
    q: "¿Puedo votar más de una vez?",
    a: "El sistema restringe un voto por dispositivo y red para cada encuesta. Ver la sección de Metodología para el detalle técnico de esta verificación.",
  },
  {
    q: "¿Quién organiza y financia estas encuestas?",
    a: "WS Willasayki, de forma independiente. Ningún partido o candidato paga por participar ni por su posición en los resultados.",
  },
  {
    q: "¿Cómo se verifica la información de un candidato?",
    a: "Se contrasta con fuentes oficiales (como la hoja de vida ante el JNE) y prensa verificada. Cuando un dato no puede confirmarse, la ficha lo señala como pendiente de verificación.",
  },
  {
    q: "¿Dónde consulto el padrón electoral o mi local de votación oficial?",
    a: "Esos trámites corresponden a RENIEC y ONPE, no a esta plataforma. Consulta los canales oficiales de dichas entidades.",
  },
];

export default function PaginaFAQ() {
  return (
    <div className="mx-auto max-w-lectura px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl text-tinta mb-3">Guía electoral</h1>
      <p className="text-pizarra mb-8">
        Diferencias clave entre una encuesta ciudadana y un proceso
        electoral oficial, y respuestas a las preguntas más frecuentes.
      </p>

      <div className="border border-linea divide-y divide-linea mb-10">
        <div className="grid grid-cols-2 text-sm">
          <div className="p-4 bg-andes/5">
            <p className="font-medium text-tinta mb-1">Encuesta ciudadana (esta plataforma)</p>
            <ul className="space-y-1 text-pizarra/80 list-disc pl-4">
              <li>Participación digital abierta</li>
              <li>Sin validación de identidad</li>
              <li>Carácter referencial, no vinculante</li>
            </ul>
          </div>
          <div className="p-4">
            <p className="font-medium text-tinta mb-1">Proceso oficial (ONPE / JNE)</p>
            <ul className="space-y-1 text-pizarra/80 list-disc pl-4">
              <li>Padrón electoral verificado por RENIEC</li>
              <li>Un voto por elector, con DNI</li>
              <li>Resultado oficial y vinculante</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {PREGUNTAS.map((p) => (
          <details key={p.q} className="border border-linea p-4 group">
            <summary className="cursor-pointer font-medium text-tinta list-none">
              {p.q}
            </summary>
            <p className="text-sm text-pizarra/80 mt-2">{p.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
