/**
 * Seed de datos DEMO para desarrollo/staging.
 * En producción, carga la geografía completa del Perú (departamentos,
 * provincias y distritos con ubigeo INEI) desde un CSV oficial usando
 * el script /scripts/importar-ubigeo.ts (ver README).
 */
import { PrismaClient, TipoEleccion, EstadoEncuesta } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const lima = await prisma.departamento.upsert({
    where: { nombre: "Lima" },
    update: {},
    create: { nombre: "Lima", ubigeo: "15" },
  });

  const provLima = await prisma.provincia.upsert({
    where: { departamentoId_nombre: { departamentoId: lima.id, nombre: "Lima" } },
    update: {},
    create: { nombre: "Lima", ubigeo: "1501", departamentoId: lima.id },
  });

  const miraflores = await prisma.distrito.upsert({
    where: { provinciaId_nombre: { provinciaId: provLima.id, nombre: "Miraflores" } },
    update: {},
    create: {
      nombre: "Miraflores",
      ubigeo: "150122",
      provinciaId: provLima.id,
      contexto:
        "Distrito costero del área metropolitana de Lima. Referencia editorial: incluir composición demográfica y antecedentes electorales recientes.",
    },
  });

  const eleccion = await prisma.eleccion.upsert({
    where: { id: "eleccion-demo-2026" },
    update: {},
    create: {
      id: "eleccion-demo-2026",
      nombre: "Elecciones Regionales y Municipales 2026",
      tipo: TipoEleccion.MUNICIPAL_DISTRITAL,
      activa: true,
    },
  });

  const partidoA = await prisma.partidoPolitico.upsert({
    where: { nombre: "Partido Demo A" },
    update: {},
    create: { nombre: "Partido Demo A", siglas: "PDA", colorHex: "#1B3A5C" },
  });

  const partidoB = await prisma.partidoPolitico.upsert({
    where: { nombre: "Partido Demo B" },
    update: {},
    create: { nombre: "Partido Demo B", siglas: "PDB", colorHex: "#8C1D2B" },
  });

  const candA = await prisma.candidato.create({
    data: {
      nombres: "Nombre",
      apellidos: "Apellido Demo A",
      partidoId: partidoA.id,
      cargoPostulado: "Alcalde distrital de Miraflores",
      perfilBasico: "Perfil de ejemplo. Reemplazar con datos verificados vía JNE.",
      hojaVidaVerificada: false,
      propuestas: {
        create: [
          { eje: "Seguridad ciudadana", resumen: "Propuesta de ejemplo.", orden: 1 },
          { eje: "Movilidad urbana", resumen: "Propuesta de ejemplo.", orden: 2 },
        ],
      },
    },
  });

  const candB = await prisma.candidato.create({
    data: {
      nombres: "Nombre",
      apellidos: "Apellido Demo B",
      partidoId: partidoB.id,
      cargoPostulado: "Alcalde distrital de Miraflores",
      perfilBasico: "Perfil de ejemplo. Reemplazar con datos verificados vía JNE.",
      hojaVidaVerificada: false,
    },
  });

  const encuesta = await prisma.encuesta.create({
    data: {
      titulo: "Encuesta ciudadana independiente — Alcaldía de Miraflores",
      slug: "miraflores-alcaldia-2026",
      distritoId: miraflores.id,
      eleccionId: eleccion.id,
      estado: EstadoEncuesta.ABIERTA,
      fechaCierre: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      metodologiaNota:
        "Encuesta digital abierta, autoseleccionada. No representa una proyección estadística poblacional. Ver metodología completa.",
      candidatos: {
        create: [{ candidatoId: candA.id }, { candidatoId: candB.id }],
      },
    },
  });

  console.log("Seed completo. Encuesta demo:", encuesta.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
