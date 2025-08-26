'use client'
import Protected from "@/components/Protected";
import { db } from "@/lib/firebase";
import {
  doc, getDoc, collection, query, orderBy, onSnapshot, updateDoc,
  getDocs, where
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PanelTareaEntregas({ params }) {
  const { id } = params;
  return (
    <Protected>
      <Entregas id={id} />
    </Protected>
  );
}

const STATUS_OPTIONS = [
  { value: "sent", label: "Pendiente" },
  { value: "approved", label: "Aprobado ✅" },
  { value: "needs_changes", label: "Necesita cambios ✏️" },
  { value: "rejected", label: "Rechazado ❌" },
];

function Entregas({ id }) {
  const [tarea, setTarea] = useState(null);
  const [subs, setSubs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "assignments", id));
      if (snap.exists()) setTarea({ id: snap.id, ...snap.data() });
    })();

    const q = query(collection(db, "assignments", id, "submissions"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, s => setSubs(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [id]);

  async function guardar(sub, { grade, feedback, status }) {
    const g = grade === "" || grade == null ? null : Number(grade);
    await updateDoc(doc(db, "assignments", id, "submissions", sub.id), {
      grade: g, feedback: feedback || "", status: status || "sent"
    });
    await notificarFamilia({
      studentName: sub.name || "Alumno",
      assignmentTitle: tarea?.title || "Tarea",
      classGroup: tarea?.classGroup || "",
      status: status || "sent",
      grade: g,
      feedback: feedback || ""
    });
    alert("Guardado y familia notificada (si existe).");
  }

  async function accionRapida(sub, status) {
    await updateDoc(doc(db, "assignments", id, "submissions", sub.id), { status });
    await notificarFamilia({
      studentName: sub.name || "Alumno",
      assignmentTitle: tarea?.title || "Tarea",
      classGroup: tarea?.classGroup || "",
      status
    });
  }

  async function notificarFamilia(payload) {
    try {
      const emails = await getFamilyEmailsByStudent(payload.studentName, payload.classGroup);
      if (emails.length) {
        await fetch("/api/notify/submission-updated", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipients: emails, submission: payload }),
        });
      }
    } catch (e) {
      console.error("Error notificando familia:", e);
    }
  }

  async function getFamilyEmailsByStudent(studentName, classGroup) {
    const q = query(
      collection(db, "families"),
      where("studentName", "==", studentName),
      where("classGroup", "==", classGroup)
    );
    const snap = await getDocs(q);
    const set = new Set();
    snap.forEach(d => (d.data().parentEmails || []).forEach(e => set.add(String(e).trim())));
    return Array.from(set);
  }

  if (!tarea) return <div className="container py-10">Cargando…</div>;

  return (
    <div className="space-y-4">
      <button className="btn" onClick={() => router.back()}>&larr; Volver</button>

      <div className="card">
        <h1 className="text-2xl font-semibold">Entregas — {tarea.title}</h1>
        {tarea.classGroup && <p className="text-sm text-gray-600 mt-1">Clase: <b>{tarea.classGroup}</b></p>}
        {tarea.dueDate?.seconds && (
          <p className="text-sm text-gray-600">Entrega: {new Date(tarea.dueDate.seconds * 1000).toLocaleString()}</p>
        )}
      </div>

      {subs.length === 0 && <div className="card">Aún no hay entregas.</div>}

      <div className="space-y-3">
        {subs.map(s => (
          <EntregaCard
            key={s.id}
            s={s}
            onSave={(data) => guardar(s, data)}
            onQuick={(status) => accionRapida(s, status)}
          />
        ))}
      </div>
    </div>
  );
}

function EntregaCard({ s, onSave, onQuick }) {
  const [grade, setGrade] = useState(s.grade ?? "");
  const [feedback, setFeedback] = useState(s.feedback ?? "");
  const [status, setStatus] = useState(s.status ?? "sent");

  return (
    <div className="card space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium">{s.name || "Sin nombre"}</div>
          <div className="text-sm text-gray-600">
            {s.createdAt?.seconds ? new Date(s.createdAt.seconds * 1000).toLocaleString() : "—"}
          </div>
          {s.comment && <p className="mt-2 whitespace-pre-wrap">{s.comment}</p>}
          {s.link && (
            <p className="mt-2">
              <a className="btn btn-primary" href={s.link} target="_blank" rel="noreferrer">Abrir enlace</a>
            </p>
          )}
        </div>

        <div className="w-full md:w-96 space-y-2">
          <label className="label">Estado</label>
          <select className="input" value={status} onChange={e=>setStatus(e.target.value)}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <label className="label">Puntuación (0–10)</label>
          <input
            className="input"
            type="number" min="0" max="10" step="0.1"
            value={grade}
            onChange={e=>setGrade(e.target.value)}
            placeholder="Ej: 10"
          />

          <label className="label">Feedback</label>
          <textarea
            className="input min-h-[90px]"
            value={feedback}
            onChange={e=>setFeedback(e.target.value)}
            placeholder="Comentario para el alumno"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <button className="btn" onClick={() => onSave({ grade, feedback, status })}>Guardar</button>
            <button className="btn" onClick={() => onQuick("approved")}>Aprobar ✅</button>
            <button className="btn" onClick={() => onQuick("needs_changes")}>Necesita cambios ✏️</button>
            <button className="btn" onClick={() => onQuick("rejected")}>Rechazar ❌</button>
          </div>
        </div>
      </div>
    </div>
  );
}
