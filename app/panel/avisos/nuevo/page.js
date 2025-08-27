'use client'
import { useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function NuevoAviso() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function crearAviso(e) {
    e.preventDefault();
    await addDoc(collection(db, "announcements"), {
      title, body, createdAt: serverTimestamp()
    });
    setTitle(""); setBody("");
    alert("Aviso publicado");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Nuevo aviso</h1>

      <form onSubmit={crearAviso} className="card space-y-3 max-w-xl">
        <label className="label">Título</label>
        <input className="input" value={title} onChange={e=>setTitle(e.target.value)} required />
        <label className="label">Mensaje</label>
        <textarea className="input min-h-[140px]" value={body} onChange={e=>setBody(e.target.value)} required />
        <button className="btn btn-primary">Publicar aviso</button>
      </form>
    </div>
  );
}
