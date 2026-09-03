import Link from "next/link";

const enlaces = [
  { href: "/", label: "Encuestas" },
  { href: "/metodologia", label: "Metodología" },
  { href: "/transparencia", label: "Transparencia" },
  { href: "/preguntas-frecuentes", label: "Guía electoral" },
  { href: "https://willasayki.pe/noticias", label: "Noticias" },
];

export function Encabezado() {
  return (
    <header className="border-b border-linea bg-papel">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold text-tinta">
              WS Willasayki
            </span>
            <span className="text-xs tracking-wide text-pizarra mt-1">
              Encuestas ciudadanas independientes
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-pizarra">
            {enlaces.map((e) => (
              <Link key={e.href} href={e.href} className="hover:text-andes transition-colors">
                {e.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
