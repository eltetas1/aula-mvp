'use client'
import Protected from "@/components/Protected";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection, onSnapshot, orderBy, query, deleteDoc, doc, getDocs
} from "firebase/firestore";

const CLASS_OPTIONS = ["1A","1B","2A","2B"]; // ajusta a tus clases

export default function TareasPublicadas() {
  return (
    <Protected>
      <ListaTareas />
    </Protected>
  );
}

function ListaTareas() {
  const [tareas, setTareas] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const q = query(collection(db, "assignments"), orderBy("createdAt","desc"));
    const unsub = onSnapshot(q, snap => setTareas(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  const visibles = filtro ? tareas.filter(t => t.classGroup === filtro) : tareas;

  async function borrarTareaConEntregas(id) {
    if (!confirm("¿Borrar esta tarea y TODAS sus entregas?")) return;
    try {
      // borra subcolección submissions
      const subsSnap = await getDocs(collection(db, "assignments", id, "submissions"));
      await Promise.all(subsSnap.docs.map(d => deleteDoc(d.ref)));
      // borra la tarea
      await deleteDoc(doc(db, "assignments", id));
      alert("Tarea borrada.");
    } catch (e) {
      console.error(e);
      alert("No se pudo borrar: " + (e?.message || e));
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tareas publicadas</h1>

      <div className="card flex items-center gap-3">
        <span className="text-sm">Filtrar por clase:</span>
        <select className="input w-32" value={filtro} onChange={e=>setFiltro(e.target.value)}>
          <option value="">Todas</option>
          {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <a className="btn ml-auto" href="/panel/tareas/nueva">+ Nueva tarea</a>
      </div>

      {visibles.length === 0 && <div className="card">No hay tareas {filtro ? `para ${filtro}` : "publicadas"}.</div>}

      <div className="space-y-2">
        {visibles.map(t => (
          <div key={t.id} className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium">{t.title}</div>
                <div className="text-xs mt-1">
                  Clase: <b>{t.classGroup || "—"}</b>
                  {t.dueDate?.seconds && <> · Entrega: {new Date(t.dueDate.seconds * 1000).toLocaleString()}</>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <a className="btn" href={`/tareas/${t.id}`}>Abrir</a>
                <a className="btn" href={`/panel/tareas/${t.id}`}>Ver entregas</a>
                <a className="btn" href={`/panel/tareas/${t.id}/editar`}>Editar</a>
                <button className="btn btn-danger" onClick={()=>borrarTareaConEntregas(t.id)}>Borrar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
