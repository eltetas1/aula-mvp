'use client'
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query, serverTimestamp, addDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const [ann, setAnn] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setAnn(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  async function addDemo() {
    await addDoc(collection(db, "announcements"), {
      title: "Bienvenidos al aula",
      body: "Este es un aviso de ejemplo.",
      createdAt: serverTimestamp()
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Avisos</h1>
      {ann.length === 0 && (
        <div className="card">
          <p>No hay avisos aún.</p>
          {user && <button className="btn mt-3" onClick={addDemo}>Añadir aviso de demo</button>}
        </div>
      )}
      {ann.map(a => (
        <div key={a.id} className="card">
          <h3 className="text-lg font-semibold">{a.title}</h3>
          <p className="mt-2">{a.body}</p>
        </div>
      ))}
    </div>
  );
}
