'use client'
import { useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, getDocs, query, where } from "firebase/firestore";

const CLASS_OPTIONS = ["1A","1B","2A","2B"];

export default function NuevaTarea() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState("");
  const [cls, setCls] = useState(CLASS_OPTIONS[0] || "1A");
  const [loading, setLoading] = useState(false);

  async function getFamilyEmailsByClass(classGroup) {
    const snap = await getDocs(query(collection(db, "families"), where("classGroup","==", classGroup)));
    const set = new Set();
    snap.forEach(d => {
      const data = d.data();
      if (data.notify === false) return;
      (data.parentEmails || []).forEach(e => set.add(String(e).trim()));
    });
    return Array.from(set);
  }

  async function crearTarea(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const dueDate = due ? new Date(due) : null;
      const docRef = await addDoc(collection(db, "assignments"), {
        title,
        description: desc,
        classGroup: cls,
        dueDate: dueDate ? { seconds: Math.floor(dueDate.getTime()/1000) } : null,
        createdAt: serverTimestamp()
      });

      try {
        const emails = await getFamilyEmailsByClass(cls);
        if (emails.length) {
          await fetch("/api/notify/new-assignment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipients: emails,
              assignment: {
                id: docRef.id,
                title, description: desc, classGroup: cls,
                dueDateStr: dueDate ? dueDate.toLocaleString() : ""
              }
            })
          });
        }
      } catch (err) {
        console.error("Error enviando emails:", err);
      }

      setTitle(""); setDesc(""); setDue("");
      alert("Tarea creada");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Nueva tarea</h1>

      <form onSubmit={crearTarea} className="card space-y-3 max-w-xl">
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

        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Creando…" : "Crear tarea"}
        </button>
      </form>
    </div>
  );
}
