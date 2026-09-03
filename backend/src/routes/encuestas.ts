import { Router } from "express";
import { prisma } from "../lib/prisma";

export const encuestasRouter = Router();

/** Lista de encuestas con filtros por estado y distrito. */
encuestasRouter.get("/", async (req, res) => {
  const { estado, distritoId } = req.query;
  const data = await prisma.encuesta.findMany({
    where: {
      ...(estado ? { estado: String(estado) as any } : {}),
      ...(distritoId ? { distritoId: String(distritoId) } : {}),
    },
    orderBy: { fechaApertura: "desc" },
    include: {
      distrito: { include: { provincia: { include: { departamento: true } } } },
      eleccion: true,
      candidatos: { select: { votosCache: true } },
    },
  });
  res.json(data);
});

/** Detalle completo de una encuesta por slug, con candidatos y conteo de votos. */
encuestasRouter.get("/:slug", async (req, res) => {
  const encuesta = await prisma.encuesta.findUnique({
    where: { slug: req.params.slug },
    include: {
      distrito: { include: { provincia: { include: { departamento: true } } } },
      eleccion: true,
      candidatos: {
        include: {
          candidato: { include: { partido: true, propuestas: true, experiencias: true, fuentes: true } },
        },
      },
    },
  });
  if (!encuesta) return res.status(404).json({ error: "Encuesta no encontrada." });

  const totalVotos = encuesta.candidatos.reduce((acc: number, c: any) => acc + c.votosCache, 0);

  res.json({
    ...encuesta,
    totalVotos,
    candidatos: encuesta.candidatos
      .map((c: any) => ({
        ...c,
        porcentaje: totalVotos > 0 ? +((c.votosCache / totalVotos) * 100).toFixed(1) : 0,
      }))
      .sort((a: any, b: any) => b.votosCache - a.votosCache),
  });
});

/** Panel agregado de transparencia por encuesta: intentos bloqueados, sin datos personales. */
encuestasRouter.get("/:slug/transparencia", async (req, res) => {
  const encuesta = await prisma.encuesta.findUnique({ where: { slug: req.params.slug } });
  if (!encuesta) return res.status(404).json({ error: "Encuesta no encontrada." });

  const [totalVotos, votosSospechosos, intentosBloqueados] = await Promise.all([
    prisma.voto.count({ where: { encuestaId: encuesta.id } }),
    prisma.voto.count({ where: { encuestaId: encuesta.id, sospechoso: true } }),
    prisma.intentoBloqueado.count({ where: { encuestaId: encuesta.id } }),
  ]);

  res.json({ totalVotos, votosSospechosos, intentosBloqueados });
});
