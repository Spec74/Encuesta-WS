"use client";

import { useEffect, useState } from "react";
import { apiAdmin } from "@/lib/apiAdmin";

const PESTAÑAS = ["Geografía", "Partidos", "Candidatos", "Encuestas"] as const;
type Pestaña = (typeof PESTAÑAS)[number];

export default function PaginaAdmin() {
  const [token, setToken] = useState("");
  const [tokenGuardado, setTokenGuardado] = useState(false);
  const [pestaña, setPestaña] = useState<Pestaña>("Geografía");
  const [resumen, setResumen] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const guardado = typeof window !== "undefined" ? sessionStorage.getItem("ws_admin_token") : null;
    if (guardado) {
      setToken(guardado);
      setTokenGuardado(true);
    }
  }, []);

  useEffect(() => {
    if (!tokenGuardado) return;
    apiAdmin.resumen(token).then(setResumen).catch((e) => setError(e.message));
  }, [tokenGuardado, token]);

  function ingresar() {
    sessionStorage.setItem("ws_admin_token", token);
    setTokenGuardado(true);
    setError("");
  }

  if (!tokenGuardado) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24">
        <h1 className="font-display text-2xl text-tinta mb-4">Panel de administración</h1>
        <p className="text-sm text-pizarra/70 mb-4">
          Ingresa el token de administrador (variable <code>ADMIN_TOKEN</code> del backend).
        </p>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token de administrador"
          className="w-full border border-linea px-3 py-2 text-sm mb-3"
        />
        <button
          onClick={ingresar}
          className="w-full bg-andes text-papel px-4 py-2 text-sm hover:opacity-90"
        >
          Entrar
        </button>
        {error && <p className="text-chuncho text-sm mt-3">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-display text-2xl text-tinta">Panel de administración</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem("ws_admin_token");
            setTokenGuardado(false);
            setToken("");
          }}
          className="text-xs text-pizarra/60 underline"
        >
          Cerrar sesión
        </button>
      </div>

      {resumen && (
        <div className="grid grid-cols-4 gap-3 mb-8 text-center">
          {Object.entries(resumen).map(([k, v]) => (
            <div key={k} className="border border-linea p-3">
              <p className="text-2xl font-display text-tinta">{v as number}</p>
              <p className="text-xs text-pizarra/60 capitalize">{k}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 border-b border-linea mb-6">
        {PESTAÑAS.map((p) => (
          <button
            key={p}
            onClick={() => setPestaña(p)}
            className={`px-3 py-2 text-sm ${
              pestaña === p ? "border-b-2 border-andes text-tinta" : "text-pizarra/60"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {pestaña === "Geografía" && <FormularioGeografia token={token} />}
      {pestaña === "Partidos" && <FormularioPartidos token={token} />}
      {pestaña === "Candidatos" && <FormularioCandidatos token={token} />}
      {pestaña === "Encuestas" && <FormularioEncuestas token={token} />}
    </div>
  );
}

// ---------------- Bloques comunes ----------------

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm mb-3">
      <span className="block text-pizarra/70 mb-1">{label}</span>
      {children}
    </label>
  );
}

const claseInput = "w-full border border-linea px-3 py-2 text-sm bg-papel";
const claseBoton = "bg-andes text-papel px-4 py-2 text-sm hover:opacity-90 disabled:opacity-40";

function Mensaje({ texto, tipo }: { texto: string; tipo: "ok" | "error" }) {
  if (!texto) return null;
  return (
    <p className={`text-sm mt-3 ${tipo === "error" ? "text-chuncho" : "text-andes"}`}>{texto}</p>
  );
}

// ---------------- Geografía ----------------

function FormularioGeografia({ token }: { token: string }) {
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [nombreDepto, setNombreDepto] = useState("");
  const [ubigeoDepto, setUbigeoDepto] = useState("");

  const [departamentoId, setDepartamentoId] = useState("");
  const [nombreProv, setNombreProv] = useState("");
  const [ubigeoProv, setUbigeoProv] = useState("");

  const [provinciaId, setProvinciaId] = useState("");
  const [nombreDist, setNombreDist] = useState("");
  const [ubigeoDist, setUbigeoDist] = useState("");
  const [contexto, setContexto] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [tipoMsg, setTipoMsg] = useState<"ok" | "error">("ok");

  function cargarDepartamentos() {
    apiAdmin.departamentos(token).then(setDepartamentos).catch(() => {});
  }
  useEffect(cargarDepartamentos, [token]);

  async function enviar(fn: () => Promise<any>, exito: string) {
    try {
      await fn();
      setTipoMsg("ok");
      setMensaje(exito);
      cargarDepartamentos();
    } catch (e: any) {
      setTipoMsg("error");
      setMensaje(e.message);
    }
  }

  return (
    <div className="grid sm:grid-cols-3 gap-6">
      <div>
        <h3 className="font-medium text-tinta mb-3">Nuevo departamento</h3>
        <Campo label="Nombre">
          <input className={claseInput} value={nombreDepto} onChange={(e) => setNombreDepto(e.target.value)} />
        </Campo>
        <Campo label="Ubigeo (2 dígitos)">
          <input className={claseInput} value={ubigeoDepto} onChange={(e) => setUbigeoDepto(e.target.value)} />
        </Campo>
        <button
          className={claseBoton}
          onClick={() =>
            enviar(
              () => apiAdmin.crearDepartamento(token, { nombre: nombreDepto, ubigeo: ubigeoDepto }),
              "Departamento guardado."
            )
          }
        >
          Guardar
        </button>
      </div>

      <div>
        <h3 className="font-medium text-tinta mb-3">Nueva provincia</h3>
        <Campo label="Departamento">
          <select className={claseInput} value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)}>
            <option value="">Selecciona…</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Nombre">
          <input className={claseInput} value={nombreProv} onChange={(e) => setNombreProv(e.target.value)} />
        </Campo>
        <Campo label="Ubigeo (4 dígitos)">
          <input className={claseInput} value={ubigeoProv} onChange={(e) => setUbigeoProv(e.target.value)} />
        </Campo>
        <button
          className={claseBoton}
          disabled={!departamentoId}
          onClick={() =>
            enviar(
              () => apiAdmin.crearProvincia(token, { nombre: nombreProv, ubigeo: ubigeoProv, departamentoId }),
              "Provincia guardada."
            )
          }
        >
          Guardar
        </button>
      </div>

      <div>
        <h3 className="font-medium text-tinta mb-3">Nuevo distrito</h3>
        <Campo label="ID de provincia">
          <input
            className={claseInput}
            placeholder="Pega el id de la provincia"
            value={provinciaId}
            onChange={(e) => setProvinciaId(e.target.value)}
          />
        </Campo>
        <Campo label="Nombre">
          <input className={claseInput} value={nombreDist} onChange={(e) => setNombreDist(e.target.value)} />
        </Campo>
        <Campo label="Ubigeo (6 dígitos)">
          <input className={claseInput} value={ubigeoDist} onChange={(e) => setUbigeoDist(e.target.value)} />
        </Campo>
        <Campo label="Contexto territorial (opcional)">
          <textarea className={claseInput} rows={3} value={contexto} onChange={(e) => setContexto(e.target.value)} />
        </Campo>
        <button
          className={claseBoton}
          disabled={!provinciaId}
          onClick={() =>
            enviar(
              () =>
                apiAdmin.crearDistrito(token, {
                  nombre: nombreDist,
                  ubigeo: ubigeoDist,
                  provinciaId,
                  contexto: contexto || undefined,
                }),
              "Distrito guardado."
            )
          }
        >
          Guardar
        </button>
      </div>

      <div className="sm:col-span-3">
        <Mensaje texto={mensaje} tipo={tipoMsg} />
      </div>
    </div>
  );
}

// ---------------- Partidos ----------------

function FormularioPartidos({ token }: { token: string }) {
  const [nombre, setNombre] = useState("");
  const [siglas, setSiglas] = useState("");
  const [colorHex, setColorHex] = useState("#365C4A");
  const [mensaje, setMensaje] = useState("");
  const [tipoMsg, setTipoMsg] = useState<"ok" | "error">("ok");

  async function guardar() {
    try {
      await apiAdmin.crearPartido(token, { nombre, siglas: siglas || undefined, colorHex });
      setTipoMsg("ok");
      setMensaje("Partido guardado.");
      setNombre("");
      setSiglas("");
    } catch (e: any) {
      setTipoMsg("error");
      setMensaje(e.message);
    }
  }

  return (
    <div className="max-w-sm">
      <Campo label="Nombre del partido">
        <input className={claseInput} value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </Campo>
      <Campo label="Siglas (opcional)">
        <input className={claseInput} value={siglas} onChange={(e) => setSiglas(e.target.value)} />
      </Campo>
      <Campo label="Color institucional">
        <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)} />
      </Campo>
      <button className={claseBoton} onClick={guardar} disabled={!nombre}>
        Guardar
      </button>
      <Mensaje texto={mensaje} tipo={tipoMsg} />
    </div>
  );
}

// ---------------- Candidatos ----------------

function FormularioCandidatos({ token }: { token: string }) {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [partidoId, setPartidoId] = useState("");
  const [cargoPostulado, setCargoPostulado] = useState("");
  const [perfilBasico, setPerfilBasico] = useState("");
  const [hojaVidaVerificada, setHojaVidaVerificada] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMsg, setTipoMsg] = useState<"ok" | "error">("ok");

  useEffect(() => {
    apiAdmin.partidos(token).then(setPartidos).catch(() => {});
  }, [token]);

  async function guardar() {
    try {
      await apiAdmin.crearCandidato(token, {
        nombres,
        apellidos,
        partidoId,
        cargoPostulado,
        perfilBasico: perfilBasico || undefined,
        hojaVidaVerificada,
      });
      setTipoMsg("ok");
      setMensaje("Candidato guardado. Copia su ID desde el backend para asignarlo a una encuesta.");
      setNombres("");
      setApellidos("");
    } catch (e: any) {
      setTipoMsg("error");
      setMensaje(e.message);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="grid sm:grid-cols-2 gap-x-4">
        <Campo label="Nombres">
          <input className={claseInput} value={nombres} onChange={(e) => setNombres(e.target.value)} />
        </Campo>
        <Campo label="Apellidos">
          <input className={claseInput} value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
        </Campo>
      </div>
      <Campo label="Partido">
        <select className={claseInput} value={partidoId} onChange={(e) => setPartidoId(e.target.value)}>
          <option value="">Selecciona…</option>
          {partidos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </Campo>
      <Campo label="Cargo al que postula">
        <input
          className={claseInput}
          placeholder="Alcalde distrital de…"
          value={cargoPostulado}
          onChange={(e) => setCargoPostulado(e.target.value)}
        />
      </Campo>
      <Campo label="Perfil básico">
        <textarea className={claseInput} rows={3} value={perfilBasico} onChange={(e) => setPerfilBasico(e.target.value)} />
      </Campo>
      <label className="flex items-center gap-2 text-sm mb-4">
        <input type="checkbox" checked={hojaVidaVerificada} onChange={(e) => setHojaVidaVerificada(e.target.checked)} />
        Hoja de vida verificada (JNE)
      </label>
      <button className={claseBoton} onClick={guardar} disabled={!nombres || !apellidos || !partidoId}>
        Guardar candidato
      </button>
      <Mensaje texto={mensaje} tipo={tipoMsg} />
      <p className="text-xs text-pizarra/50 mt-4">
        Propuestas y fuentes verificadas se agregan vía API (<code>POST /api/admin/candidatos</code> con
        los campos <code>propuestas</code> y <code>fuentes</code>) o directamente con Prisma Studio.
      </p>
    </div>
  );
}

// ---------------- Encuestas ----------------

function FormularioEncuestas({ token }: { token: string }) {
  const [encuestas, setEncuestas] = useState<any[]>([]);
  const [elecciones, setElecciones] = useState<any[]>([]);
  const [candidatos, setCandidatos] = useState<any[]>([]);

  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [distritoId, setDistritoId] = useState("");
  const [eleccionId, setEleccionId] = useState("");
  const [fechaCierre, setFechaCierre] = useState("");
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [tipoMsg, setTipoMsg] = useState<"ok" | "error">("ok");

  function cargar() {
    apiAdmin.encuestas(token).then(setEncuestas).catch(() => {});
    apiAdmin.elecciones(token).then(setElecciones).catch(() => {});
    apiAdmin.candidatos(token).then(setCandidatos).catch(() => {});
  }
  useEffect(cargar, [token]);

  function alternar(id: string) {
    setSeleccionados((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function guardar() {
    try {
      await apiAdmin.crearEncuesta(token, {
        titulo,
        slug,
        distritoId,
        eleccionId,
        fechaCierre: new Date(fechaCierre).toISOString(),
        candidatoIds: seleccionados,
      });
      setTipoMsg("ok");
      setMensaje("Encuesta creada.");
      setTitulo("");
      setSlug("");
      setSeleccionados([]);
      cargar();
    } catch (e: any) {
      setTipoMsg("error");
      setMensaje(e.message);
    }
  }

  async function cambiarEstado(id: string, estado: string) {
    try {
      await apiAdmin.cambiarEstadoEncuesta(token, id, estado);
      cargar();
    } catch (e: any) {
      setTipoMsg("error");
      setMensaje(e.message);
    }
  }

  return (
    <div>
      <div className="max-w-lg mb-10">
        <h3 className="font-medium text-tinta mb-3">Nueva encuesta</h3>
        <Campo label="Título">
          <input className={claseInput} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </Campo>
        <Campo label="Slug (URL, minúsculas y guiones)">
          <input className={claseInput} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="miraflores-alcaldia-2026" />
        </Campo>
        <Campo label="ID de distrito">
          <input className={claseInput} value={distritoId} onChange={(e) => setDistritoId(e.target.value)} placeholder="Pega el id del distrito" />
        </Campo>
        <Campo label="Elección">
          <select className={claseInput} value={eleccionId} onChange={(e) => setEleccionId(e.target.value)}>
            <option value="">Selecciona…</option>
            {elecciones.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Fecha de cierre">
          <input type="datetime-local" className={claseInput} value={fechaCierre} onChange={(e) => setFechaCierre(e.target.value)} />
        </Campo>
        <Campo label="Candidatos participantes">
          <div className="space-y-1 max-h-40 overflow-y-auto border border-linea p-2">
            {candidatos.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={seleccionados.includes(c.id)} onChange={() => alternar(c.id)} />
                {c.nombres} {c.apellidos} — {c.partido?.nombre}
              </label>
            ))}
          </div>
        </Campo>
        <button
          className={claseBoton}
          onClick={guardar}
          disabled={!titulo || !slug || !distritoId || !eleccionId || !fechaCierre || seleccionados.length < 2}
        >
          Crear encuesta (queda en Borrador)
        </button>
        <Mensaje texto={mensaje} tipo={tipoMsg} />
      </div>

      <h3 className="font-medium text-tinta mb-3">Encuestas existentes</h3>
      <div className="space-y-2">
        {encuestas.map((e) => (
          <div key={e.id} className="border border-linea p-3 flex items-center justify-between gap-4 text-sm">
            <div>
              <p className="text-tinta">{e.titulo}</p>
              <p className="text-pizarra/60 text-xs">{e.distrito?.nombre} · {e.estado}</p>
            </div>
            <select
              className="border border-linea px-2 py-1 text-xs"
              value={e.estado}
              onChange={(ev) => cambiarEstado(e.id, ev.target.value)}
            >
              {["BORRADOR", "ABIERTA", "CERRADA", "ARCHIVADA"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
