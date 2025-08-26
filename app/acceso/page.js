'use client'
import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AccesoPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [mode, setMode] = useState("login");
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, pass);
      } else {
        await createUserWithEmailAndPassword(auth, email, pass);
        alert("Cuenta creada. Pide al admin que habilite tu cuenta como docente en Firestore (colección 'admins').");
      }
      router.push("/panel");
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Acceso</h1>
      <form onSubmit={onSubmit} className="card space-y-3">
        <label className="label">Email (docente)</label>
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label className="label">Contraseña</label>
        <input className="input" type="password" value={pass} onChange={e=>setPass(e.target.value)} required />
        <button className="btn btn-primary">{mode === "login" ? "Entrar" : "Crear cuenta"}</button>
        <button type="button" className="btn" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Crear cuenta" : "Ya tengo cuenta"}
        </button>
        <p className="text-xs text-gray-500">Los alumnos no necesitan cuenta para entregar tareas en este MVP.</p>
      </form>
    </div>
  );
}
