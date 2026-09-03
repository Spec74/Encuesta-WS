import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import rateLimit from "express-rate-limit";

const SALT = process.env.HASH_SALT || "cambiar-este-salt-en-produccion";

/** Nunca se guarda la IP en claro: se trunca y se hashea con un salt de servidor. */
export function hashIp(ip: string): string {
  const truncada = ip.includes(":")
    ? ip.split(":").slice(0, 4).join(":") // IPv6: conserva solo el bloque de red
    : ip.split(".").slice(0, 3).join("."); // IPv4: descarta el último octeto
  return crypto.createHash("sha256").update(truncada + SALT).digest("hex");
}

export function hashUserAgent(ua: string): string {
  return crypto.createHash("sha256").update(ua + SALT).digest("hex");
}

/** Limita intentos de voto por IP para frenar patrones automatizados. */
export const limitadorVotos = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 8, // máx. 8 intentos de voto por IP en la ventana, sobre cualquier encuesta
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Se detectaron demasiados intentos desde este origen. Inténtalo de nuevo en unos minutos.",
  },
});

/** Validación básica de la huella de dispositivo enviada por el cliente. */
export function validarFingerprint(req: Request, res: Response, next: NextFunction) {
  const fp = req.body?.deviceFingerprint;
  if (typeof fp !== "string" || fp.length < 16 || fp.length > 256) {
    return res.status(400).json({ error: "Huella de dispositivo inválida." });
  }
  next();
}

/**
 * Heurística simple de detección de patrón automatizado.
 * Señales: ausencia de cabeceras típicas de navegador, user-agent vacío/genérico.
 * Esto complementa —no reemplaza— la restricción única por (encuesta, ipHash, fingerprint).
 */
export function detectarPatronSospechoso(req: Request): { sospechoso: boolean; motivo?: string } {
  const ua = req.headers["user-agent"] || "";
  const acceptLang = req.headers["accept-language"];
  if (!ua || /curl|python-requests|axios\/|bot|headless/i.test(ua)) {
    return { sospechoso: true, motivo: "USER_AGENT_NO_NAVEGADOR" };
  }
  if (!acceptLang) {
    return { sospechoso: true, motivo: "CABECERAS_INCOMPLETAS" };
  }
  return { sospechoso: false };
}
