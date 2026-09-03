"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export function SelectorGeografico() {
  const router = useRouter();
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [distritos, setDistritos] = useState<any[]>([]);
  const [departamentoId, setDepartamentoId] = useState("");
  const [provinciaId, setProvinciaId] = useState("");
  const [distritoId, setDistritoId] = useState("");

  useEffect(() => {
    api.departamentos().then(setDepartamentos).catch(() => setDepartamentos([]));
  }, []);

  useEffect(() => {
    if (!departamentoId) return setProvincias([]);
    api.provincias(departamentoId).then(setProvincias).catch(() => setProvincias([]));
    setProvinciaId("");
    setDistritos([]);
  }, [departamentoId]);

  useEffect(() => {
    if (!provinciaId) return setDistritos([]);
    api.distritos(provinciaId).then(setDistritos).catch(() => setDistritos([]));
    setDistritoId("");
  }, [provinciaId]);

  useEffect(() => {
    if (distritoId) router.push(`/?distritoId=${distritoId}`);
  }, [distritoId, router]);

  const claseSelect =
    "w-full border border-linea bg-papel px-3 py-2 text-sm text-tinta focus:outline-none focus:border-andes";

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      <select
        className={claseSelect}
        value={departamentoId}
        onChange={(e) => setDepartamentoId(e.target.value)}
        aria-label="Departamento"
      >
        <option value="">Departamento</option>
        {departamentos.map((d) => (
          <option key={d.id} value={d.id}>{d.nombre}</option>
        ))}
      </select>

      <select
        className={claseSelect}
        value={provinciaId}
        onChange={(e) => setProvinciaId(e.target.value)}
        disabled={!departamentoId}
        aria-label="Provincia"
      >
        <option value="">Provincia</option>
        {provincias.map((p) => (
          <option key={p.id} value={p.id}>{p.nombre}</option>
        ))}
      </select>

      <select
        className={claseSelect}
        value={distritoId}
        onChange={(e) => setDistritoId(e.target.value)}
        disabled={!provinciaId}
        aria-label="Distrito"
      >
        <option value="">Distrito</option>
        {distritos.map((d) => (
          <option key={d.id} value={d.id}>{d.nombre}</option>
        ))}
      </select>
    </div>
  );
}
