'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

const CLASS_OPTIONS = ["1A","1B","2A","2B"];

export default function TareasPage() {
  const [items, setItems] = useState([]);
  const [clase, setClase] = useState(""); // filtro

  useEffect(() => {
    const q = query(collection(db, "assignments"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  const visibles = clase ? items.filter(i => i.classGroup === clase) : items;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tareas</h1>

      <div className="card flex items-center gap-3">
        <span className="text-sm">Filtrar por clase:</span>
        <select className="input w-32" value={clase} onChange={e=>setClase(e.target.value)}>
          <option value="">Todas</option>
          {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {visibles.length === 0 && <div className="card">No hay tareas {clase ? `para ${clase}` : "publicadas"}.</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {visibles.map(t => (
          <div key={t.id} className="card">
            <h3 className="text-lg font-semibold">{t.title}</h3>
            <p className="text-xs mt-1">Clase: <b>{t.classGroup || "—"}</b></p>
            <p className="text-sm text-gray-600 mt-1">Entrega: {t.dueDate ? new Date(t.dueDate.seconds * 1000).toLocaleString() : "—"}</p>
            <p className="mt-2 line-clamp-3">{t.description}</p>
            <div className="mt-3">
              <Link className="btn btn-primary" href={`/tareas/${t.id}`}>Ver y entregar</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
