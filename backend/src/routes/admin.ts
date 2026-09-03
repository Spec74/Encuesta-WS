import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requiereAdmin } from "../middleware/adminAuth";

export const adminRouter = Router();
adminRouter.use(requiereAdmin);

/** Envuelve handlers async para reenviar cualquier excepción (incl. ZodError) al manejador de errores global. */
function asincrono(fn: (req: Request, res: Response) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
}

// ---------- Resumen para el dashboard ----------
adminRouter.get(
  "/resumen",
  asincrono(async (_req, res) => {
    const [distritos, candidatos, encuestas, votos] = await Promise.all([
      prisma.distrito.count(),
      prisma.candidato.count(),
      prisma.encuesta.count(),
      prisma.voto.count(),
    ]);
    res.json({ distritos, candidatos, encuestas, votos });
  })
);

// ---------- Geografía ----------
const departamentoSchema = z.object({ nombre: z.string().min(2), ubigeo: z.string().min(1) });
adminRouter.post(
  "/departamentos",
  asincrono(async (req, res) => {
    const datos = departamentoSchema.parse(req.body);
    const d = await prisma.departamento.upsert({
      where: { nombre: datos.nombre },
      update: {},
      create: datos,
    });
    res.status(201).json(d);
  })
);
adminRouter.get(
  "/departamentos",
  asincrono(async (_req, res) => {
    res.json(await prisma.departamento.findMany({ orderBy: { nombre: "asc" } }));
  })
);

const provinciaSchema = z.object({
  nombre: z.string().min(2),
  ubigeo: z.string().min(1),
  departamentoId: z.string().min(1),
});
adminRouter.post(
  "/provincias",
  asincrono(async (req, res) => {
    const datos = provinciaSchema.parse(req.body);
    const p = await prisma.provincia.upsert({
      where: { departamentoId_nombre: { departamentoId: datos.departamentoId, nombre: datos.nombre } },
      update: {},
      create: datos,
    });
    res.status(201).json(p);
  })
);

const distritoSchema = z.object({
  nombre: z.string().min(2),
  ubigeo: z.string().min(1),
  provinciaId: z.string().min(1),
  contexto: z.string().optional(),
  poblacionElectoral: z.number().int().optional(),
});
adminRouter.post(
  "/distritos",
  asincrono(async (req, res) => {
    const datos = distritoSchema.parse(req.body);
    const d = await prisma.distrito.upsert({
      where: { provinciaId_nombre: { provinciaId: datos.provinciaId, nombre: datos.nombre } },
      update: { contexto: datos.contexto, poblacionElectoral: datos.poblacionElectoral },
      create: datos,
    });
    res.status(201).json(d);
  })
);

// ---------- Elecciones ----------
const eleccionSchema = z.object({
  nombre: z.string().min(3),
  tipo: z.enum([
    "PRESIDENCIAL",
    "REGIONAL",
    "MUNICIPAL_PROVINCIAL",
    "MUNICIPAL_DISTRITAL",
    "CONGRESO",
    "PARLAMENTO_ANDINO",
  ]),
});
adminRouter.post(
  "/elecciones",
  asincrono(async (req, res) => {
    const datos = eleccionSchema.parse(req.body);
    const e = await prisma.eleccion.create({ data: datos });
    res.status(201).json(e);
  })
);
adminRouter.get(
  "/elecciones",
  asincrono(async (_req, res) => {
    res.json(await prisma.eleccion.findMany({ orderBy: { nombre: "asc" } }));
  })
);

// ---------- Partidos ----------
const partidoSchema = z.object({
  nombre: z.string().min(2),
  siglas: z.string().optional(),
  colorHex: z.string().optional(),
  logoUrl: z.string().url().optional(),
});
adminRouter.post(
  "/partidos",
  asincrono(async (req, res) => {
    const datos = partidoSchema.parse(req.body);
    const p = await prisma.partidoPolitico.upsert({
      where: { nombre: datos.nombre },
      update: datos,
      create: datos,
    });
    res.status(201).json(p);
  })
);
adminRouter.get(
  "/partidos",
  asincrono(async (_req, res) => {
    res.json(await prisma.partidoPolitico.findMany({ orderBy: { nombre: "asc" } }));
  })
);

// ---------- Candidatos ----------
const candidatoSchema = z.object({
  nombres: z.string().min(2),
  apellidos: z.string().min(2),
  partidoId: z.string().min(1),
  cargoPostulado: z.string().min(2),
  perfilBasico: z.string().optional(),
  fotoUrl: z.string().url().optional(),
  hojaVidaVerificada: z.boolean().optional(),
  fuenteHojaVida: z.string().url().optional(),
  propuestas: z
    .array(z.object({ eje: z.string(), resumen: z.string(), orden: z.number().optional() }))
    .optional(),
  fuentes: z
    .array(z.object({ titulo: z.string(), url: z.string().url(), tipo: z.string() }))
    .optional(),
});
adminRouter.post(
  "/candidatos",
  asincrono(async (req, res) => {
    const { propuestas, fuentes, ...datos } = candidatoSchema.parse(req.body);
    const c = await prisma.candidato.create({
      data: {
        ...datos,
        propuestas: propuestas ? { create: propuestas } : undefined,
        fuentes: fuentes ? { create: fuentes } : undefined,
      },
      include: { propuestas: true, fuentes: true, partido: true },
    });
    res.status(201).json(c);
  })
);
adminRouter.get(
  "/candidatos",
  asincrono(async (_req, res) => {
    res.json(
      await prisma.candidato.findMany({
        include: { partido: true },
        orderBy: { apellidos: "asc" },
      })
    );
  })
);

// ---------- Encuestas ----------
const encuestaSchema = z.object({
  titulo: z.string().min(5),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Usa solo minúsculas, números y guiones"),
  descripcion: z.string().optional(),
  distritoId: z.string().min(1),
  eleccionId: z.string().min(1),
  fechaCierre: z.string().datetime(),
  metodologiaNota: z.string().optional(),
  candidatoIds: z.array(z.string()).min(2, "Añade al menos 2 candidatos"),
});
adminRouter.post(
  "/encuestas",
  asincrono(async (req, res) => {
    const { candidatoIds, ...datos } = encuestaSchema.parse(req.body);
    const e = await prisma.encuesta.create({
      data: {
        ...datos,
        fechaCierre: new Date(datos.fechaCierre),
        candidatos: { create: candidatoIds.map((candidatoId) => ({ candidatoId })) },
      },
      include: { candidatos: { include: { candidato: true } } },
    });
    res.status(201).json(e);
  })
);

const estadoSchema = z.object({
  estado: z.enum(["BORRADOR", "ABIERTA", "CERRADA", "ARCHIVADA"]),
});
adminRouter.patch(
  "/encuestas/:id/estado",
  asincrono(async (req, res) => {
    const { estado } = estadoSchema.parse(req.body);
    const e = await prisma.encuesta.update({
      where: { id: req.params.id },
      data: { estado },
    });
    res.json(e);
  })
);

adminRouter.get(
  "/encuestas",
  asincrono(async (_req, res) => {
    res.json(
      await prisma.encuesta.findMany({
        include: { distrito: { include: { provincia: { include: { departamento: true } } } } },
        orderBy: { createdAt: "desc" },
      })
    );
  })
);
