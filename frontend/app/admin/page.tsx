"use client";

import { useEffect, useState } from "react";
import { apiAdmin } from "@/lib/apiAdmin";
import { api } from "@/lib/api";
import { SubidaImagen } from "@/components/admin/SubidaImagen";
import { parsearCSV } from "@/lib/csv";

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

function CargaMasivaGeografia({ token, onTerminado }: { token: string; onTerminado: () => void }) {
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: number; error: string[] } | null>(null);

  async function procesarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    e.target.value = "";

    const texto = await archivo.text();
    const filas = parsearCSV(texto);
    if (filas.length === 0) return;

    const [, ...datos] = filas;
    const errores: string[] = [];
    let exitosos = 0;

    // Cachés locales para no repetir llamadas: como los endpoints de
    // departamento/provincia/distrito hacen upsert, subir el mismo CSV dos
    // veces también sirve para corregir contexto/ubigeo en lote.
    const cacheDepto = new Map<string, string>();
    const cacheProv = new Map<string, string>();

    setProcesando(true);
    setResultado(null);

    for (const fila of datos) {
      const [nombreDepto, ubigeoDepto, nombreProv, ubigeoProv, nombreDist, ubigeoDist, contexto, poblacion] =
        fila.map((c) => c.trim());
      if (!nombreDepto || !nombreProv || !nombreDist) continue;

      try {
        let deptoId = cacheDepto.get(nombreDepto);
        if (!deptoId) {
          const depto: any = await apiAdmin.crearDepartamento(token, {
            nombre: nombreDepto,
            ubigeo: ubigeoDepto || nombreDepto.slice(0, 2).toUpperCase(),
          });
          deptoId = depto.id;
          cacheDepto.set(nombreDepto, deptoId as string);
        }

        const claveProv = `${nombreDepto}|${nombreProv}`;
        let provId = cacheProv.get(claveProv);
        if (!provId) {
          const prov: any = await apiAdmin.crearProvincia(token, {
            nombre: nombreProv,
            ubigeo: ubigeoProv || "0000",
            departamentoId: deptoId,
          });
          provId = prov.id;
          cacheProv.set(claveProv, provId as string);
        }

        await apiAdmin.crearDistrito(token, {
          nombre: nombreDist,
          ubigeo: ubigeoDist || "000000",
          provinciaId: provId,
          contexto: contexto || undefined,
          poblacionElectoral: poblacion ? parseInt(poblacion, 10) : undefined,
        });
        exitosos++;
      } catch (err: any) {
        errores.push(`${nombreDepto} / ${nombreProv} / ${nombreDist}: ${err.message}`);
      }
    }

    setProcesando(false);
    setResultado({ ok: exitosos, error: errores });
    onTerminado();
  }

  const plantilla =
    "departamento,ubigeoDepartamento,provincia,ubigeoProvincia,distrito,ubigeoDistrito,contexto,poblacionElectoral\n" +
    "Ayacucho,05,Huamanga,0500,Acos Vinchos,050103,,";

  function descargarPlantilla() {
    const blob = new Blob([plantilla], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-geografia.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="border border-linea p-4 mb-8">
      <h3 className="font-medium text-tinta mb-1">Carga masiva por CSV</h3>
      <p className="text-xs text-pizarra/60 mb-3">
        Para cargar de un jalón toda la jerarquía Departamento → Provincia → Distrito.
        Columnas: <code>departamento, ubigeoDepartamento, provincia, ubigeoProvincia,
        distrito, ubigeoDistrito, contexto, poblacionElectoral</code>. Una fila por
        distrito — si varios distritos comparten departamento/provincia, repite esos
        nombres en cada fila (no se duplican: si ya existen, solo se reutilizan).
        Volver a subir el mismo CSV actualiza el contexto y el ubigeo de los distritos
        ya cargados, así que también sirve para corregir en lote.
      </p>
      <button onClick={descargarPlantilla} className="text-xs underline text-pizarra/70">
        Descargar plantilla CSV
      </button>
      <label className="mt-3 block w-fit text-sm border border-andes text-andes px-4 py-2 cursor-pointer hover:bg-andes hover:text-papel transition-colors">
        {procesando ? "Procesando…" : "Subir CSV"}
        <input type="file" accept=".csv,text/csv" className="hidden" onChange={procesarArchivo} disabled={procesando} />
      </label>

      {resultado && (
        <div className="mt-3 text-sm">
          <p className="text-andes">{resultado.ok} distrito(s) cargado(s) correctamente.</p>
          {resultado.error.length > 0 && (
            <ul className="mt-1 text-chuncho text-xs list-disc pl-4 space-y-0.5">
              {resultado.error.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function FormularioGeografia({ token }: { token: string }) {
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [nombreDepto, setNombreDepto] = useState("");
  const [ubigeoDepto, setUbigeoDepto] = useState("");

  const [departamentoId, setDepartamentoId] = useState("");
  const [nombreProv, setNombreProv] = useState("");
  const [ubigeoProv, setUbigeoProv] = useState("");

  // Selector Departamento → Provincia para elegir dónde va el nuevo distrito,
  // sin tener que copiar y pegar ningún ID a mano.
  const [departamentoIdDist, setDepartamentoIdDist] = useState("");
  const [provinciasDist, setProvinciasDist] = useState<any[]>([]);
  const [provinciaId, setProvinciaId] = useState("");
  const [nombreDist, setNombreDist] = useState("");
  const [ubigeoDist, setUbigeoDist] = useState("");
  const [contexto, setContexto] = useState("");

  const [distritos, setDistritos] = useState<any[]>([]);

  const [mensaje, setMensaje] = useState("");
  const [tipoMsg, setTipoMsg] = useState<"ok" | "error">("ok");

  function cargarDepartamentos() {
    apiAdmin.departamentos(token).then(setDepartamentos).catch(() => {});
  }
  function cargarDistritos() {
    apiAdmin.distritos(token).then(setDistritos).catch(() => {});
  }
  function cargarTodo() {
    cargarDepartamentos();
    cargarDistritos();
  }
  useEffect(cargarTodo, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!departamentoIdDist) return setProvinciasDist([]);
    api.provincias(departamentoIdDist).then(setProvinciasDist).catch(() => setProvinciasDist([]));
    setProvinciaId("");
  }, [departamentoIdDist]);

  async function enviar(fn: () => Promise<any>, exito: string) {
    try {
      await fn();
      setTipoMsg("ok");
      setMensaje(exito);
      cargarTodo();
    } catch (e: any) {
      setTipoMsg("error");
      setMensaje(e.message);
    }
  }

  return (
    <div>
      <CargaMasivaGeografia token={token} onTerminado={cargarTodo} />

      <h3 className="font-medium text-tinta mb-3">O uno por uno</h3>
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
        <Campo label="Departamento">
          <select className={claseInput} value={departamentoIdDist} onChange={(e) => setDepartamentoIdDist(e.target.value)}>
            <option value="">Selecciona…</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Provincia">
          <select
            className={claseInput}
            value={provinciaId}
            onChange={(e) => setProvinciaId(e.target.value)}
            disabled={!departamentoIdDist}
          >
            <option value="">Selecciona…</option>
            {provinciasDist.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Nombre del distrito">
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
      </div>

      <div className="mt-4">
        <Mensaje texto={mensaje} tipo={tipoMsg} />
      </div>

      <ListaDistritos token={token} distritos={distritos} onCambio={cargarDistritos} />
    </div>
  );
}

function ListaDistritos({ token, distritos, onCambio }: { token: string; distritos: any[]; onCambio: () => void }) {
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [ubigeo, setUbigeo] = useState("");
  const [contexto, setContexto] = useState("");
  const [guardando, setGuardando] = useState(false);

  function empezarEdicion(d: any) {
    setEditandoId(d.id);
    setNombre(d.nombre);
    setUbigeo(d.ubigeo);
    setContexto(d.contexto || "");
  }

  async function guardar(id: string) {
    setGuardando(true);
    try {
      await apiAdmin.actualizarDistrito(token, id, { nombre, ubigeo, contexto: contexto || undefined });
      setEditandoId(null);
      onCambio();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGuardando(false);
    }
  }

  if (distritos.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="font-medium text-tinta mb-3">Distritos existentes ({distritos.length})</h3>
      <div className="space-y-2 max-w-2xl">
        {distritos.map((d) => (
          <div key={d.id} className="border border-linea p-3 text-sm">
            {editandoId === d.id ? (
              <div className="space-y-2">
                <div className="grid sm:grid-cols-2 gap-2">
                  <input className={claseInput} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />
                  <input className={claseInput} value={ubigeo} onChange={(e) => setUbigeo(e.target.value)} placeholder="Ubigeo" />
                </div>
                <textarea
                  className={claseInput}
                  rows={2}
                  value={contexto}
                  onChange={(e) => setContexto(e.target.value)}
                  placeholder="Contexto territorial"
                />
                <div className="flex gap-2">
                  <button className={claseBoton} disabled={guardando} onClick={() => guardar(d.id)}>
                    {guardando ? "Guardando…" : "Guardar"}
                  </button>
                  <button
                    className="text-xs text-pizarra/60 underline"
                    onClick={() => setEditandoId(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-tinta">{d.nombre}</p>
                  <p className="text-xs text-pizarra/60">
                    {d.provincia?.departamento?.nombre} / {d.provincia?.nombre} · ubigeo {d.ubigeo}
                  </p>
                </div>
                <button className="text-xs border border-linea px-3 py-1.5 hover:border-andes" onClick={() => empezarEdicion(d)}>
                  Editar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Partidos ----------------

function FormularioPartidos({ token }: { token: string }) {
  const [nombre, setNombre] = useState("");
  const [siglas, setSiglas] = useState("");
  const [colorHex, setColorHex] = useState("#365C4A");
  const [logoUrl, setLogoUrl] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipoMsg, setTipoMsg] = useState<"ok" | "error">("ok");
  const [partidos, setPartidos] = useState<any[]>([]);

  function cargarPartidos() {
    apiAdmin.partidos(token).then(setPartidos).catch(() => {});
  }
  useEffect(cargarPartidos, [token]);

  async function guardar() {
    try {
      await apiAdmin.crearPartido(token, {
        nombre,
        siglas: siglas || undefined,
        colorHex,
        logoUrl: logoUrl || undefined,
      });
      setTipoMsg("ok");
      setMensaje("Partido guardado.");
      setNombre("");
      setSiglas("");
      setLogoUrl("");
      cargarPartidos();
    } catch (e: any) {
      setTipoMsg("error");
      setMensaje(e.message);
    }
  }

  return (
    <div>
      <div className="max-w-sm mb-10">
        <SubidaImagen label="Logo del partido" valor={logoUrl} onCambio={setLogoUrl} forma="cuadrado" />
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

      <ListaPartidos token={token} partidos={partidos} onCambio={cargarPartidos} />
    </div>
  );
}

function ListaPartidos({ token, partidos, onCambio }: { token: string; partidos: any[]; onCambio: () => void }) {
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [siglas, setSiglas] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [guardando, setGuardando] = useState(false);

  function empezarEdicion(p: any) {
    setEditandoId(p.id);
    setNombre(p.nombre);
    setSiglas(p.siglas || "");
    setLogoUrl(p.logoUrl || "");
  }

  async function guardar(id: string) {
    setGuardando(true);
    try {
      await apiAdmin.actualizarPartido(token, id, { nombre, siglas: siglas || undefined, logoUrl });
      setEditandoId(null);
      onCambio();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGuardando(false);
    }
  }

  if (partidos.length === 0) return null;

  return (
    <div>
      <h3 className="font-medium text-tinta mb-3">Partidos existentes ({partidos.length})</h3>
      <div className="space-y-2 max-w-md">
        {partidos.map((p) => (
          <div key={p.id} className="border border-linea p-3 text-sm">
            {editandoId === p.id ? (
              <div className="space-y-2">
                <SubidaImagen label="Logo" valor={logoUrl} onCambio={setLogoUrl} forma="cuadrado" />
                <input className={claseInput} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />
                <input className={claseInput} value={siglas} onChange={(e) => setSiglas(e.target.value)} placeholder="Siglas" />
                <div className="flex gap-2">
                  <button className={claseBoton} disabled={guardando} onClick={() => guardar(p.id)}>
                    {guardando ? "Guardando…" : "Guardar"}
                  </button>
                  <button className="text-xs text-pizarra/60 underline" onClick={() => setEditandoId(null)}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {p.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logoUrl} alt="" className="w-8 h-8 object-contain border border-linea" />
                  ) : (
                    <div className="w-8 h-8 bg-linea/50" />
                  )}
                  <div>
                    <p className="text-tinta">{p.nombre}</p>
                    {p.siglas && <p className="text-xs text-pizarra/60">{p.siglas}</p>}
                  </div>
                </div>
                <button className="text-xs border border-linea px-3 py-1.5 hover:border-andes" onClick={() => empezarEdicion(p)}>
                  Editar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Candidatos ----------------

function CargaMasivaCandidatos({
  token,
  partidos,
  onTerminado,
}: {
  token: string;
  partidos: any[];
  onTerminado: () => void;
}) {
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: number; error: string[] } | null>(null);

  async function procesarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    e.target.value = "";

    const texto = await archivo.text();
    const filas = parsearCSV(texto);
    if (filas.length === 0) return;

    // La primera fila es el encabezado — la saltamos.
    const [, ...datos] = filas;
    const errores: string[] = [];
    let exitosos = 0;

    setProcesando(true);
    setResultado(null);

    for (const fila of datos) {
      const [nombres, apellidos, nombrePartido, cargoPostulado, perfilBasico, fotoUrl] = fila.map((c) =>
        c.trim()
      );
      if (!nombres || !apellidos) continue;

      const partido = partidos.find((p) => p.nombre.toLowerCase() === (nombrePartido || "").toLowerCase());
      if (!partido) {
        errores.push(`${nombres} ${apellidos}: el partido "${nombrePartido}" no existe (créalo primero en la pestaña Partidos).`);
        continue;
      }

      try {
        await apiAdmin.crearCandidato(token, {
          nombres,
          apellidos,
          partidoId: partido.id,
          cargoPostulado: cargoPostulado || "Por definir",
          perfilBasico: perfilBasico || undefined,
          fotoUrl: fotoUrl || undefined,
        });
        exitosos++;
      } catch (err: any) {
        errores.push(`${nombres} ${apellidos}: ${err.message}`);
      }
    }

    setProcesando(false);
    setResultado({ ok: exitosos, error: errores });
    onTerminado();
  }

  const plantilla =
    "nombres,apellidos,partido,cargoPostulado,perfilBasico,fotoUrl\nJuan,Pérez Gómez,Partido Demo A,Alcalde distrital de Acos Vinchos,,";

  function descargarPlantilla() {
    const blob = new Blob([plantilla], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-candidatos.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="border border-linea p-4 mb-8">
      <h3 className="font-medium text-tinta mb-1">Carga masiva por CSV</h3>
      <p className="text-xs text-pizarra/60 mb-3">
        Para cargar varios candidatos de una vez. Columnas exactas:{" "}
        <code>nombres, apellidos, partido, cargoPostulado, perfilBasico, fotoUrl</code>. El
        nombre del partido debe coincidir exactamente con uno ya creado en la pestaña
        Partidos. <code>perfilBasico</code> y <code>fotoUrl</code> son opcionales (puedes
        dejarlos vacíos y subir la foto después, uno por uno).
      </p>
      <div className="flex items-center gap-3">
        <button onClick={descargarPlantilla} className="text-xs underline text-pizarra/70">
          Descargar plantilla CSV
        </button>
      </div>
      <label className="mt-3 inline-block text-sm border border-andes text-andes px-4 py-2 cursor-pointer hover:bg-andes hover:text-papel transition-colors">
        {procesando ? "Procesando…" : "Subir CSV"}
        <input type="file" accept=".csv,text/csv" className="hidden" onChange={procesarArchivo} disabled={procesando} />
      </label>

      {resultado && (
        <div className="mt-3 text-sm">
          <p className="text-andes">{resultado.ok} candidato(s) cargado(s) correctamente.</p>
          {resultado.error.length > 0 && (
            <ul className="mt-1 text-chuncho text-xs list-disc pl-4 space-y-0.5">
              {resultado.error.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function FormularioCandidatos({ token }: { token: string }) {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [partidoId, setPartidoId] = useState("");
  const [cargoPostulado, setCargoPostulado] = useState("");
  const [perfilBasico, setPerfilBasico] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [hojaVidaVerificada, setHojaVidaVerificada] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMsg, setTipoMsg] = useState<"ok" | "error">("ok");

  function cargarPartidos() {
    apiAdmin.partidos(token).then(setPartidos).catch(() => {});
  }
  function cargarCandidatos() {
    apiAdmin.candidatos(token).then(setCandidatos).catch(() => {});
  }
  useEffect(() => {
    cargarPartidos();
    cargarCandidatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function guardar() {
    try {
      await apiAdmin.crearCandidato(token, {
        nombres,
        apellidos,
        partidoId,
        cargoPostulado,
        perfilBasico: perfilBasico || undefined,
        fotoUrl: fotoUrl || undefined,
        hojaVidaVerificada,
      });
      setTipoMsg("ok");
      setMensaje("Candidato guardado — lo puedes completar (propuestas, experiencia) en la lista de abajo.");
      setNombres("");
      setApellidos("");
      setFotoUrl("");
      cargarCandidatos();
    } catch (e: any) {
      setTipoMsg("error");
      setMensaje(e.message);
    }
  }

  return (
    <div>
      <div className="max-w-lg">
        <CargaMasivaCandidatos token={token} partidos={partidos} onTerminado={cargarCandidatos} />

        <h3 className="font-medium text-tinta mb-3">O uno por uno</h3>
        <SubidaImagen label="Foto del candidato" valor={fotoUrl} onCambio={setFotoUrl} forma="circulo" />
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
      </div>

      <ListaCandidatos token={token} candidatos={candidatos} partidos={partidos} onCambio={cargarCandidatos} />
    </div>
  );
}

function ListaCandidatos({
  token,
  candidatos,
  partidos,
  onCambio,
}: {
  token: string;
  candidatos: any[];
  partidos: any[];
  onCambio: () => void;
}) {
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  if (candidatos.length === 0) return null;

  return (
    <div className="mt-12 max-w-2xl">
      <h3 className="font-medium text-tinta mb-3">Candidatos existentes ({candidatos.length})</h3>
      <div className="space-y-2">
        {candidatos.map((c) => (
          <div key={c.id} className="border border-linea p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {c.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.fotoUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-linea" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-linea/50" />
                )}
                <div>
                  <p className="text-tinta">{c.nombres} {c.apellidos}</p>
                  <p className="text-xs text-pizarra/60">{c.partido?.nombre} · {c.cargoPostulado}</p>
                </div>
              </div>
              <button
                className="text-xs border border-linea px-3 py-1.5 hover:border-andes shrink-0"
                onClick={() => setExpandidoId(expandidoId === c.id ? null : c.id)}
              >
                {expandidoId === c.id ? "Cerrar" : "Editar ficha completa"}
              </button>
            </div>
            {expandidoId === c.id && (
              <EdicionCandidato token={token} candidato={c} partidos={partidos} onCambio={onCambio} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Panel expandido: datos básicos + propuestas + experiencia + fuentes + plan de gobierno. */
function EdicionCandidato({
  token,
  candidato,
  partidos,
  onCambio,
}: {
  token: string;
  candidato: any;
  partidos: any[];
  onCambio: () => void;
}) {
  const [nombres, setNombres] = useState(candidato.nombres);
  const [apellidos, setApellidos] = useState(candidato.apellidos);
  const [partidoId, setPartidoId] = useState(candidato.partidoId);
  const [cargoPostulado, setCargoPostulado] = useState(candidato.cargoPostulado);
  const [perfilBasico, setPerfilBasico] = useState(candidato.perfilBasico || "");
  const [fotoUrl, setFotoUrl] = useState(candidato.fotoUrl || "");
  const [hojaVidaVerificada, setHojaVidaVerificada] = useState(candidato.hojaVidaVerificada);
  const [fuenteHojaVida, setFuenteHojaVida] = useState(candidato.fuenteHojaVida || "");
  const [planGobiernoUrl, setPlanGobiernoUrl] = useState(candidato.planGobiernoUrl || "");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  async function guardarBasicos() {
    setGuardando(true);
    try {
      await apiAdmin.actualizarCandidato(token, candidato.id, {
        nombres,
        apellidos,
        partidoId,
        cargoPostulado,
        perfilBasico: perfilBasico || undefined,
        fotoUrl,
        hojaVidaVerificada,
        fuenteHojaVida: fuenteHojaVida || undefined,
        planGobiernoUrl: planGobiernoUrl || undefined,
      });
      setMensaje("Guardado.");
      onCambio();
    } catch (e: any) {
      setMensaje(e.message);
    } finally {
      setGuardando(false);
    }
  }

  // ---- Propuestas ----
  const [ejePropuesta, setEjePropuesta] = useState("");
  const [resumenPropuesta, setResumenPropuesta] = useState("");
  async function agregarPropuesta() {
    if (!ejePropuesta || !resumenPropuesta) return;
    await apiAdmin.agregarPropuesta(token, candidato.id, { eje: ejePropuesta, resumen: resumenPropuesta });
    setEjePropuesta("");
    setResumenPropuesta("");
    onCambio();
  }
  async function quitarPropuesta(id: string) {
    await apiAdmin.eliminarPropuesta(token, id);
    onCambio();
  }

  // ---- Experiencia ----
  const [cargoExp, setCargoExp] = useState("");
  const [institucionExp, setInstitucionExp] = useState("");
  const [periodoExp, setPeriodoExp] = useState("");
  const [descripcionExp, setDescripcionExp] = useState("");
  async function agregarExperiencia() {
    if (!cargoExp || !institucionExp || !periodoExp) return;
    await apiAdmin.agregarExperiencia(token, candidato.id, {
      cargo: cargoExp,
      institucion: institucionExp,
      periodo: periodoExp,
      descripcion: descripcionExp || undefined,
    });
    setCargoExp("");
    setInstitucionExp("");
    setPeriodoExp("");
    setDescripcionExp("");
    onCambio();
  }
  async function quitarExperiencia(id: string) {
    await apiAdmin.eliminarExperiencia(token, id);
    onCambio();
  }

  // ---- Fuentes verificadas ----
  const [tituloFuente, setTituloFuente] = useState("");
  const [urlFuente, setUrlFuente] = useState("");
  const [tipoFuente, setTipoFuente] = useState("OFICIAL");
  async function agregarFuente() {
    if (!tituloFuente || !urlFuente) return;
    try {
      await apiAdmin.agregarFuente(token, candidato.id, { titulo: tituloFuente, url: urlFuente, tipo: tipoFuente });
      setTituloFuente("");
      setUrlFuente("");
      onCambio();
    } catch (e: any) {
      alert(e.message);
    }
  }
  async function quitarFuente(id: string) {
    await apiAdmin.eliminarFuente(token, id);
    onCambio();
  }

  return (
    <div className="mt-4 pt-4 border-t border-linea space-y-6">
      {/* Datos básicos */}
      <div>
        <p className="text-xs uppercase text-pizarra/50 mb-2">Datos básicos</p>
        <SubidaImagen label="Foto" valor={fotoUrl} onCambio={setFotoUrl} forma="circulo" />
        <div className="grid sm:grid-cols-2 gap-2 mb-2">
          <input className={claseInput} value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder="Nombres" />
          <input className={claseInput} value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Apellidos" />
        </div>
        <select className={claseInput + " mb-2"} value={partidoId} onChange={(e) => setPartidoId(e.target.value)}>
          {partidos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <input
          className={claseInput + " mb-2"}
          value={cargoPostulado}
          onChange={(e) => setCargoPostulado(e.target.value)}
          placeholder="Cargo al que postula"
        />
        <textarea
          className={claseInput + " mb-2"}
          rows={2}
          value={perfilBasico}
          onChange={(e) => setPerfilBasico(e.target.value)}
          placeholder="Perfil básico"
        />
        <input
          className={claseInput + " mb-2"}
          value={fuenteHojaVida}
          onChange={(e) => setFuenteHojaVida(e.target.value)}
          placeholder="URL hoja de vida JNE / Declara Justo (opcional)"
        />
        <input
          className={claseInput + " mb-2"}
          value={planGobiernoUrl}
          onChange={(e) => setPlanGobiernoUrl(e.target.value)}
          placeholder="URL del plan de gobierno oficial en el JNE (opcional)"
        />
        <label className="flex items-center gap-2 text-sm mb-3">
          <input type="checkbox" checked={hojaVidaVerificada} onChange={(e) => setHojaVidaVerificada(e.target.checked)} />
          Hoja de vida verificada (JNE)
        </label>
        <button className={claseBoton} disabled={guardando} onClick={guardarBasicos}>
          {guardando ? "Guardando…" : "Guardar datos básicos"}
        </button>
        {mensaje && <span className="text-xs text-andes ml-3">{mensaje}</span>}
      </div>

      {/* Propuestas */}
      <div>
        <p className="text-xs uppercase text-pizarra/50 mb-2">Propuestas</p>
        <ul className="space-y-1 mb-2">
          {candidato.propuestas?.map((p: any) => (
            <li key={p.id} className="flex items-start justify-between gap-2 text-sm">
              <span><strong>{p.eje}:</strong> {p.resumen}</span>
              <button className="text-xs text-chuncho shrink-0" onClick={() => quitarPropuesta(p.id)}>Quitar</button>
            </li>
          ))}
        </ul>
        <div className="grid sm:grid-cols-[1fr_2fr_auto] gap-2">
          <input className={claseInput} value={ejePropuesta} onChange={(e) => setEjePropuesta(e.target.value)} placeholder="Eje (ej. Seguridad)" />
          <input className={claseInput} value={resumenPropuesta} onChange={(e) => setResumenPropuesta(e.target.value)} placeholder="Resumen de la propuesta" />
          <button className={claseBoton} onClick={agregarPropuesta}>Añadir</button>
        </div>
      </div>

      {/* Experiencia */}
      <div>
        <p className="text-xs uppercase text-pizarra/50 mb-2">Experiencia / trayectoria</p>
        <ul className="space-y-1 mb-2">
          {candidato.experiencias?.map((ex: any) => (
            <li key={ex.id} className="flex items-start justify-between gap-2 text-sm">
              <span><strong>{ex.cargo}</strong> — {ex.institucion} ({ex.periodo}){ex.descripcion ? `: ${ex.descripcion}` : ""}</span>
              <button className="text-xs text-chuncho shrink-0" onClick={() => quitarExperiencia(ex.id)}>Quitar</button>
            </li>
          ))}
        </ul>
        <div className="grid sm:grid-cols-2 gap-2 mb-2">
          <input className={claseInput} value={cargoExp} onChange={(e) => setCargoExp(e.target.value)} placeholder="Cargo (ej. Regidor)" />
          <input className={claseInput} value={institucionExp} onChange={(e) => setInstitucionExp(e.target.value)} placeholder="Institución" />
        </div>
        <div className="grid sm:grid-cols-[1fr_2fr] gap-2 mb-2">
          <input className={claseInput} value={periodoExp} onChange={(e) => setPeriodoExp(e.target.value)} placeholder="Periodo (ej. 2019-2022)" />
          <input className={claseInput} value={descripcionExp} onChange={(e) => setDescripcionExp(e.target.value)} placeholder="Descripción breve (opcional)" />
        </div>
        <button className={claseBoton} onClick={agregarExperiencia}>Añadir experiencia</button>
      </div>

      {/* Fuentes verificadas */}
      <div>
        <p className="text-xs uppercase text-pizarra/50 mb-2">Fuentes verificadas</p>
        <ul className="space-y-1 mb-2">
          {candidato.fuentes?.map((f: any) => (
            <li key={f.id} className="flex items-center justify-between gap-2 text-sm">
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="underline">{f.titulo}</a>
              <button className="text-xs text-chuncho shrink-0" onClick={() => quitarFuente(f.id)}>Quitar</button>
            </li>
          ))}
        </ul>
        <div className="grid sm:grid-cols-[1fr_1fr_auto_auto] gap-2">
          <input className={claseInput} value={tituloFuente} onChange={(e) => setTituloFuente(e.target.value)} placeholder="Título (ej. Hoja de vida JNE)" />
          <input className={claseInput} value={urlFuente} onChange={(e) => setUrlFuente(e.target.value)} placeholder="https://..." />
          <select className={claseInput} value={tipoFuente} onChange={(e) => setTipoFuente(e.target.value)}>
            <option value="OFICIAL">Oficial</option>
            <option value="PRENSA">Prensa</option>
            <option value="OTRO">Otro</option>
          </select>
          <button className={claseBoton} onClick={agregarFuente}>Añadir</button>
        </div>
      </div>
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

  // Selector Departamento → Provincia → Distrito, en vez de pegar un ID a mano.
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [departamentoId, setDepartamentoId] = useState("");
  const [provincias, setProvincias] = useState<any[]>([]);
  const [provinciaId, setProvinciaId] = useState("");
  const [distritos, setDistritos] = useState<any[]>([]);
  const [distritoId, setDistritoId] = useState("");

  const [eleccionId, setEleccionId] = useState("");
  const [fechaCierre, setFechaCierre] = useState("");
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [tipoMsg, setTipoMsg] = useState<"ok" | "error">("ok");

  useEffect(() => {
    api.departamentos().then(setDepartamentos).catch(() => {});
  }, []);

  useEffect(() => {
    if (!departamentoId) return setProvincias([]);
    api.provincias(departamentoId).then(setProvincias).catch(() => setProvincias([]));
    setProvinciaId("");
    setDistritos([]);
    setDistritoId("");
  }, [departamentoId]);

  useEffect(() => {
    if (!provinciaId) return setDistritos([]);
    api.distritos(provinciaId).then(setDistritos).catch(() => setDistritos([]));
    setDistritoId("");
  }, [provinciaId]);

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
      setDepartamentoId("");
      setProvinciaId("");
      setDistritoId("");
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

  const [nombreEleccion, setNombreEleccion] = useState("");
  const [tipoEleccion, setTipoEleccion] = useState("MUNICIPAL_DISTRITAL");
  const [mensajeEleccion, setMensajeEleccion] = useState("");
  const [tipoMsgEleccion, setTipoMsgEleccion] = useState<"ok" | "error">("ok");

  async function guardarEleccion() {
    try {
      await apiAdmin.crearEleccion(token, { nombre: nombreEleccion, tipo: tipoEleccion });
      setTipoMsgEleccion("ok");
      setMensajeEleccion("Elección guardada.");
      setNombreEleccion("");
      cargar();
    } catch (e: any) {
      setTipoMsgEleccion("error");
      setMensajeEleccion(e.message);
    }
  }

  return (
    <div>
      <div className="max-w-sm mb-10 border border-linea p-4">
        <h3 className="font-medium text-tinta mb-3">Nueva elección</h3>
        <p className="text-xs text-pizarra/60 mb-3">
          Crea esto una sola vez por proceso electoral (ej. &ldquo;Elecciones Regionales y
          Municipales 2026&rdquo;) — luego todas tus encuestas de esa elección la reutilizan.
        </p>
        <Campo label="Nombre">
          <input
            className={claseInput}
            value={nombreEleccion}
            onChange={(e) => setNombreEleccion(e.target.value)}
            placeholder="Elecciones Municipales 2026"
          />
        </Campo>
        <Campo label="Tipo">
          <select className={claseInput} value={tipoEleccion} onChange={(e) => setTipoEleccion(e.target.value)}>
            <option value="MUNICIPAL_DISTRITAL">Municipal distrital</option>
            <option value="MUNICIPAL_PROVINCIAL">Municipal provincial</option>
            <option value="REGIONAL">Regional</option>
            <option value="CONGRESO">Congreso</option>
            <option value="PRESIDENCIAL">Presidencial</option>
            <option value="PARLAMENTO_ANDINO">Parlamento Andino</option>
          </select>
        </Campo>
        <button className={claseBoton} onClick={guardarEleccion} disabled={!nombreEleccion}>
          Guardar elección
        </button>
        <Mensaje texto={mensajeEleccion} tipo={tipoMsgEleccion} />
      </div>

      <div className="max-w-lg mb-10">
        <h3 className="font-medium text-tinta mb-3">Nueva encuesta</h3>
        <Campo label="Título">
          <input className={claseInput} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </Campo>
        <Campo label="Slug (URL, minúsculas y guiones)">
          <input className={claseInput} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="miraflores-alcaldia-2026" />
        </Campo>
        <Campo label="Departamento">
          <select className={claseInput} value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)}>
            <option value="">Selecciona…</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Provincia">
          <select
            className={claseInput}
            value={provinciaId}
            onChange={(e) => setProvinciaId(e.target.value)}
            disabled={!departamentoId}
          >
            <option value="">Selecciona…</option>
            {provincias.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Distrito">
          <select
            className={claseInput}
            value={distritoId}
            onChange={(e) => setDistritoId(e.target.value)}
            disabled={!provinciaId}
          >
            <option value="">Selecciona…</option>
            {distritos.map((d) => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
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
