import { Request, Response, NextFunction } from "express";

/**
 * Autenticación mínima por token fijo (ADMIN_TOKEN) vía cabecera Authorization.
 * Suficiente para un panel interno de un solo equipo editorial. Si el
 * panel crece a varios usuarios con roles, migrar a JWT + tabla de usuarios.
 */
export function requiereAdmin(req: Request, res: Response, next: NextFunction) {
  const cabecera = req.headers.authorization || "";
  const token = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : "";

  if (!process.env.ADMIN_TOKEN) {
    return res.status(500).json({ error: "ADMIN_TOKEN no configurado en el servidor." });
  }
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Token de administrador inválido." });
  }
  next();
}
