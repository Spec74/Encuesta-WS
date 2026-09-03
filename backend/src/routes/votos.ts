import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  hashIp,
  hashUserAgent,
  limitadorVotos,
  validarFingerprint,
  detectarPatronSospechoso,
} from "../middleware/antifraude";

export const votosRouter = Router();

const votoSchema = z.object({
  encuestaId: z.string().min(1),
  encuestaCandidatoId: z.string().min(1),
  deviceFingerprint: z.string().min(16).max(256),
});

votosRouter.post("/", limitadorVotos, validarFingerprint, async (req, res) => {
  const parseado = votoSchema.safeParse(req.body);
  if (!parseado.success) {
    return res.status(400).json({ error: "Datos de voto inválidos." });
  }
  const { encuestaId, encuestaCandidatoId, deviceFingerprint } = parseado.data;

  const encuesta = await prisma.encuesta.findUnique({ where: { id: encuestaId } });
  if (!encuesta) return res.status(404).json({ error: "Encuesta no encontrada." });
  if (encuesta.estado !== "ABIERTA") {
    return res.status(409).json({ error: "Esta encuesta no está abierta a votación." });
  }
  if (new Date() > encuesta.fechaCierre) {
    return res.status(409).json({ error: "El plazo de esta encuesta ya venció." });
  }

  const candidatoEnEncuesta = await prisma.encuestaCandidato.findUnique({
    where: { id: encuestaCandidatoId },
  });
  if (!candidatoEnEncuesta || candidatoEnEncuesta.encuestaId !== encuestaId) {
    return res.status(400).json({ error: "El candidato no pertenece a esta encuesta." });
  }

  const ipReal = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "0.0.0.0";
  const ipHash = hashIp(ipReal);
  const userAgentHash = hashUserAgent(req.headers["user-agent"] || "desconocido");
  const { sospechoso, motivo } = detectarPatronSospechoso(req);

  if (sospechoso) {
    await prisma.intentoBloqueado.create({
      data: { encuestaId, motivo: motivo || "PATRON_AUTOMATIZADO" },
    });
    return res.status(403).json({ error: "No se pudo validar tu voto. Intenta desde un navegador estándar." });
  }

  try {
    await prisma.$transaction([
      prisma.voto.create({
        data: {
          encuestaId,
          encuestaCandidatoId,
          ipHash,
          deviceFingerprint,
          userAgentHash,
          sospechoso: false,
        },
      }),
      prisma.encuestaCandidato.update({
        where: { id: encuestaCandidatoId },
        data: { votosCache: { increment: 1 } },
      }),
    ]);
  } catch (e: any) {
    if (e.code === "P2002") {
      await prisma.intentoBloqueado.create({
        data: { encuestaId, motivo: "DUPLICADO" },
      });
      return res.status(409).json({ error: "Ya se registró un voto desde este dispositivo para esta encuesta." });
    }
    console.error(e);
    return res.status(500).json({ error: "No se pudo registrar el voto. Intenta de nuevo." });
  }

  res.status(201).json({ ok: true, mensaje: "Voto registrado correctamente." });
});
