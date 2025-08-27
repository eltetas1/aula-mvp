'use client'
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  doc, getDoc, addDoc, collection,
  serverTimestamp, onSnapshot, orderBy, query
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function TareaDetalle({ params }) {
  const { id } = params;
  const [tarea, setTarea] = useState(null);
  const [nombre, setNombre] = useState("");
  const [enlace, setEnlace] = useState("");
  const [comentario, setComentario] = useState("");
  const [envios, setEnvios] = useState([]);
  const router = useRouter();

  // Botón Volver con fallback a /tareas si no hay historial (p.ej., abriste en pestaña nueva)
  function goBack(e) {
    e.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/tareas");
    }
  }

  useEffect(() => {
    async function fetch() {
      const snap = await getDoc(doc(db, "assignments", id));
      if (snap.exists()) setTarea({ id: snap.id, ...snap.data() });
    }
    fetch();

    const q = query(
      collection(db, "assignments", id, "submissions"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, snap =>
      setEnvios(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [id]);

  async function enviar(e) {
    e.preventDefault();
    await addDoc(collection(db, "assignments", id, "submissions"), {
      name: (nombre || "").trim(),
      link: (enlace || "").trim(),
      comment: (comentario || "").trim(),
      createdAt: serverTimestamp()
    });
    setNombre(""); setEnlace(""); setComentario("");
    alert("¡Enviado!");
  }

  if (!tarea) return <div className="container py-10">Cargando…</div>;

  return (
    <div className="space-y-4">
      <a href="/tareas" onClick={goBack} className="btn mb-2">&larr; Volver</a>

      <div className="card">
        <h1 className="text-2xl font-semibold">{tarea.title}</h1>
        {tarea.classGroup && (
          <p className="mt-1 text-sm text-gray-600">
            Clase: <b>{tarea.classGroup}</b>
          </p>
        )}
        {tarea.dueDate?.seconds && (
          <p className="text-sm text-gray-600">
            Entrega: {new Date(tarea.dueDate.seconds * 1000).toLocaleString()}
          </p>
        )}
        <p className="mt-3 whitespace-pre-wrap">{tarea.description}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Formulario de entrega */}
        <form onSubmit={enviar} className="card space-y-3">
          <h2 className="text-lg font-semibold">Entregar</h2>

          <label className="label">Nombre del alumno</label>
          <input
            className="input"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
          />

          <label className="label">Enlace al trabajo (Drive, Docs, etc.)</label>
          <input
            className="input"
            type="url"
            value={enlace}
            onChange={e => setEnlace(e.target.value)}
            placeholder="https://…"
            required
          />

          <label className="label">Comentario (opcional)</label>
          <textarea
            className="input min-h-[100px]"
            value={comentario}
            onChange={e => setComentario(e.target.value)}
          />

          <button className="btn btn-primary">Enviar</button>
          <p className="text-xs text-gray-500">
            No hace falta cuenta: solo registramos nombre, enlace y fecha.
          </p>
        </form>

        {/* Entregas recientes */}
        <div className="space-y-2">
          <div className="card">
            <h2 className="text-lg font-semibold">
              Entregas recientes (solo visibles para el profe en el Panel)
            </h2>
            <p className="text-sm text-gray-500">
              Las entregas se guardan y el docente las verá en el Panel.
            </p>
          </div>

          {envios.map(s => (
            <div key={s.id} className="card">
              <p className="font-medium">{s.name || "Sin nombre"}</p>
              {s.link && (
                <a
                  className="link break-all"
                  href={s.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {s.link}
                </a>
              )}
              {s.comment && (
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                  {s.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
