'use client'
import Protected from "@/components/Protected";
import { db } from "@/lib/firebase";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Panel() {
  return (
    <Protected>
      <PanelInner />
    </Protected>
  );
}
// arriba del componente PanelInner()
const CLASS_OPTIONS = ["1A","1B","2A","2B"];

function PanelInner() {
  const [cls, setCls] = useState("1A");       // <— nueva
  const [filtro, setFiltro] = useState("");   // <— nueva (filtro listado)
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState("");
  const [aTitle, setATitle] = useState("");
  const [aBody, setABody] = useState("");
  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "assignments"), orderBy("createdAt","desc"));
    const unsub = onSnapshot(q, snap => setTareas(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  async function crearTarea(e) {
    e.preventDefault();
    const dueDate = due ? new Date(due) : null;
    await addDoc(collection(db, "assignments"), {
      title,
      description: desc,
      dueDate: dueDate ? { seconds: Math.floor(dueDate.getTime()/1000) } : null,
      createdAt: serverTimestamp()
    });
    setTitle(""); setDesc(""); setDue("");
    alert("Tarea creada");
  }

  async function crearAviso(e) {
    e.preventDefault();
    await addDoc(collection(db, "announcements"), {
      title: aTitle, body: aBody, createdAt: serverTimestamp()
    });
    setATitle(""); setABody("");
    alert("Aviso publicado");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Panel del docente</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={crearTarea} className="card space-y-3">
          <h2 className="text-lg font-semibold">Nueva tarea</h2>
          <label className="label">Título</label>
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} required />
          <label className="label">Descripción</label>
          <textarea className="input min-h-[140px]" value={desc} onChange={e=>setDesc(e.target.value)} required />
          <label className="label">Fecha límite (opcional)</label>
          <input className="input" type="datetime-local" value={due} onChange={e=>setDue(e.target.value)} />
          <button className="btn btn-primary">Crear tarea</button>
        </form>

        <form onSubmit={crearAviso} className="card space-y-3">
          <h2 className="text-lg font-semibold">Nuevo aviso</h2>
          <label className="label">Título</label>
          <input className="input" value={aTitle} onChange={e=>setATitle(e.target.value)} required />
          <label className="label">Mensaje</label>
          <textarea className="input min-h-[140px]" value={aBody} onChange={e=>setABody(e.target.value)} required />
          <button className="btn btn-primary">Publicar aviso</button>
        </form>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Tareas publicadas</h2>
        {tareas.map((t) => (
          <div key={t.id} className="card">
            <div className="flex items-center gap-3">
              <div className="font-medium">{t.title}</div>
              <a className="btn" href={`/tareas/${t.id}`} target="_blank" rel="noreferrer">Abrir</a>
              <a className="btn" href={`/panel/tareas/${t.id}`}>Ver entregas</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
