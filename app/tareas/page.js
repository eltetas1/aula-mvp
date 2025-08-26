'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

export default function TareasPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "assignments"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tareas</h1>
      {items.length === 0 && <div className="card">No hay tareas publicadas.</div>}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map(t => (
          <div key={t.id} className="card">
            <h3 className="text-lg font-semibold">{t.title}</h3>
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
