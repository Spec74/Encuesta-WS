import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ZodError } from "zod";
import { geografiaRouter } from "./routes/geografia";
import { encuestasRouter } from "./routes/encuestas";
import { votosRouter } from "./routes/votos";
import { adminRouter } from "./routes/admin";

const app = express();
const PORT = process.env.PORT || 4000;

const ORIGENES_PERMITIDOS = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

app.set("trust proxy", 1); // necesario en Render para leer X-Forwarded-For correctamente

app.use(helmet());
app.use(
  cors({
    origin: ORIGENES_PERMITIDOS,
    methods: ["GET", "POST"],
  })
);
app.use(express.json({ limit: "100kb" }));

app.get("/salud", (_req, res) => res.json({ ok: true, servicio: "willasayki-encuestas-api" }));

app.use("/api/geografia", geografiaRouter);
app.use("/api/encuestas", encuestasRouter);
app.use("/api/votos", votosRouter);
app.use("/api/admin", adminRouter);

app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada." }));

// Manejador de errores: normaliza errores de validación (Zod) y errores inesperados
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Datos inválidos.", detalles: err.issues });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

app.listen(PORT, () => {
  console.log(`API de WS Willasayki · Encuestas escuchando en el puerto ${PORT}`);
});
