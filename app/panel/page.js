'use client'
import Protected from "@/components/Protected";
import { db } from "@/lib/firebase";
import {
  addDoc, collection, onSnapshot, orderBy, query, serverTimestamp,
  getDocs, where
} from "firebase/firestore";
import { useEffect, useState } from "react";

const CLASS_OPTIONS = ["1A","1B","2A","2B"]; // ajusta las que uses

export default function Panel() {
  return (
    <Protected>
      <PanelInner />
    </Protected>
  );
}

function PanelInner() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState("");
  const [cls, setCls] = useState(CLASS_OPTIONS[0] || "1A");
  const [aTitle, setATitle] = useState("");
  const [aBody, setABody] = useState("");
  const [tareas, setTareas] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const q = query(collection(db, "assignments"), orderBy("createdAt","desc"));
    const unsub = onSnapshot(q, snap => setTareas(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  async function crearTarea(e) {
    e.preventDefault();
    const dueDate = due ? new Date(due) : null;
    const docRef = await addDoc(collection(db, "assignments"), {
      title,
      description: desc,
      classGroup: cls,
      dueDate: dueDate ? { seconds: Math.floor(dueDate.getTime()/1000) } : null,
      createdAt: serverTimestamp()
    });

    // Notificar a familias de esa clase (notify !== false)
    try {
      const emails = await getFamilyEmailsByClass(cls);
      const dueStr = dueDate ? dueDate.toLocaleString() : "";
      if (emails.length) {
        await fetch("/api/notify/new-assignment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipients: emails,
            assignment: { title, description: desc, classGroup: cls, dueDateStr: dueStr, id: docRef.id }
          })
        });
      }
    } catch (err) {
      console.error("Error enviando emails:", err);
    }

    setTitle(""); setDesc(""); setDue("");
    alert("Tarea creada" + (emails?.length ? " y familias notificadas." : "."));
  }

  async function crearAviso(e) {
    e.preventDefault();
    await addDoc(collection(db, "announcements"), {
      title: aTitle, body: aBody, createdAt: serverTimestamp()
    });
    setATitle(""); setABody("");
    alert("Aviso publicado");
  }

  async function getFamilyEmailsByClass(classGroup) {
    const snap = await getDocs(query(collection(db, "families"), where("classGroup","==", classGroup)));
    const emails = new Set();
    snap.forEach(d => {
      const data = d.data();
      if (data.notify === false) return; // respeta opt-out
      (data.parentEmails || []).filter(Boolean).forEach(x => emails.add(String(x).trim()));
    });
    return Array.from(emails);
  }

  const visibles = filtro ? tareas.filter(t => t.classGroup === filtro) : tareas;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Panel del docente</h1>

      <div className="card">
        <a className="btn" href="/panel/familias">Gestionar familias</a>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={crearTarea} className="card space-y-3">
          <h2 className="text-lg font-semibold">Nueva tarea</h2>
          <label className="label">Título</label>
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} required />
          <label className="label">Descripción</label>
          <textarea className="input min-h-[140px]" value={desc} onChange={e=>setDesc(e.target.value)} required />
          <label className="label">Clase</label>
          <select className="input" value={cls} onChange={e=>setCls(e.target.value)}>
            {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
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

      <div className="card flex items-center gap-3">
        <span className="text-sm">Filtrar por clase:</span>
        <select className="input w-32" value={filtro} onChange={e=>setFiltro(e.target.value)}>
          <option value="">Todas</option>
          {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Tareas publicadas</h2>
        {visibles.map((t) => (
          <div key={t.id} className="card">
            <div className="flex items-center gap-3">
              <div className="font-medium">{t.title}</div>
              <span className="text-xs px-2 py-1 rounded bg-gray-100">{t.classGroup || "—"}</span>
              <a className="btn" href={`/tareas/${t.id}`} target="_blank" rel="noreferrer">Abrir</a>
              <a className="btn" href={`/panel/tareas/${t.id}`}>Ver entregas</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
