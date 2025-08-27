'use client'
import Protected from "@/components/Protected";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function EditarAviso({ params }) {
  return (
    <Protected>
      <EditarInner id={params.id} />
    </Protected>
  );
}

function EditarInner({ id }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody]   = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "announcements", id));
      if (snap.exists()) {
        const a = snap.data();
        setTitle(a.title || "");
        setBody(a.body || "");
      }
      setLoading(false);
    })();
  }, [id]);

  async function guardar(e){
    e.preventDefault();
    await updateDoc(doc(db, "announcements", id), { title, body });
    alert("Aviso actualizado");
    router.push("/panel/avisos");
  }

  function volver(e){
    e.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1) history.back();
    else router.push("/panel/avisos");
  }

  if (loading) return <div className="container py-10">Cargando…</div>;

  return (
    <div className="space-y-4">
      <a className="btn" href="/panel/avisos" onClick={volver}>&larr; Volver</a>
      <h1 className="text-2xl font-semibold">Editar aviso</h1>

      <form onSubmit={guardar} className="card space-y-3 max-w-xl">
        <label className="label">Título</label>
        <input className="input" value={title} onChange={e=>setTitle(e.target.value)} required />
        <label className="label">Mensaje</label>
        <textarea className="input min-h-[140px]" value={body} onChange={e=>setBody(e.target.value)} required />
        <button className="btn btn-primary">Guardar cambios</button>
      </form>
    </div>
  );
}
