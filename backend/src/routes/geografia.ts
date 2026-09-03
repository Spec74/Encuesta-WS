import { Router } from "express";
import { prisma } from "../lib/prisma";

export const geografiaRouter = Router();

geografiaRouter.get("/departamentos", async (_req, res) => {
  const data = await prisma.departamento.findMany({
    orderBy: { nombre: "asc" },
  });
  res.json(data);
});

geografiaRouter.get("/departamentos/:id/provincias", async (req, res) => {
  const data = await prisma.provincia.findMany({
    where: { departamentoId: req.params.id },
    orderBy: { nombre: "asc" },
  });
  res.json(data);
});

geografiaRouter.get("/provincias/:id/distritos", async (req, res) => {
  const data = await prisma.distrito.findMany({
    where: { provinciaId: req.params.id },
    orderBy: { nombre: "asc" },
  });
  res.json(data);
});

geografiaRouter.get("/distritos/:id", async (req, res) => {
  const data = await prisma.distrito.findUnique({
    where: { id: req.params.id },
    include: {
      provincia: { include: { departamento: true } },
      encuestas: { select: { id: true, titulo: true, estado: true, slug: true } },
    },
  });
  if (!data) return res.status(404).json({ error: "Distrito no encontrado." });
  res.json(data);
});
