'use client'
import Protected from "@/components/Protected";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const CLASS_OPTIONS = ["1A","1B","2A","2B"];

export default function EditarTarea({ params }) {
  return (
    <Protected>
      <EditarInner id={params.id} />
    </Protected>
  );
}

function toLocalInput(dtSec){
  if (!dtSec) return "";
  const d = new Date(dtSec * 1000);
  const pad = n => String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EditarInner({ id }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cls, setCls] = useState(CLASS_OPTIONS[0] || "1A");
  const [due, setDue] = useState("");

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "assignments", id));
      if (snap.exists()) {
        const t = snap.data();
        setTitle(t.title || "");
        setDesc(t.description || "");
        setCls(t.classGroup || (CLASS_OPTIONS[0] || "1A"));
        setDue(toLocalInput(t.dueDate?.seconds));
      }
      setLoading(false);
    })();
  }, [id]);

  async function guardar(e){
    e.preventDefault();
    const dueDate = due ? { seconds: Math.floor(new Date(due).getTime()/1000) } : null;
    await updateDoc(doc(db, "assignments", id), {
      title, description: desc, classGroup: cls, dueDate
    });
    alert("Tarea actualizada");
    router.push("/panel/tareas");
  }

  function volver(e){
    e.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1) history.back();
    else router.push("/panel/tareas");
  }

  if (loading) return <div className="container py-10">Cargando…</div>;

  return (
    <div className="space-y-4">
      <a className="btn" href="/panel/tareas" onClick={volver}>&larr; Volver</a>
      <h1 className="text-2xl font-semibold">Editar tarea</h1>

      <form onSubmit={guardar} className="card space-y-3 max-w-xl">
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

        <button className="btn btn-primary">Guardar cambios</button>
      </form>
    </div>
  );
}
