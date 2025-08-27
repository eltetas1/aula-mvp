'use client'
import Protected from "@/components/Protected";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";

export default function AvisosLista() {
  return (
    <Protected>
      <ListaAvisos />
    </Protected>
  );
}

function ListaAvisos() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt","desc"));
    const unsub = onSnapshot(q, snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  async function borrar(id){
    if (!confirm("¿Borrar este aviso?")) return;
    try {
      await deleteDoc(doc(db, "announcements", id));
      alert("Aviso borrado.");
    } catch (e) {
      console.error(e);
      alert("No se pudo borrar: " + (e?.message || e));
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Avisos</h1>

      <div className="card">
        <a className="btn" href="/panel/avisos/nuevo">+ Nuevo aviso</a>
      </div>

      {items.length === 0 && <div className="card">No hay avisos publicados.</div>}

      <div className="space-y-2">
        {items.map(a => (
          <div key={a.id} className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium">{a.title}</div>
                <div className="text-sm text-gray-600 mt-1 line-clamp-2">{a.body}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <a className="btn" href={`/panel/avisos/${a.id}/editar`}>Editar</a>
                <button className="btn btn-danger" onClick={()=>borrar(a.id)}>Borrar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
