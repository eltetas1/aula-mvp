'use client'
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Nav() {
  const { user } = useAuth();
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container py-3 flex items-center gap-4">
        <Link href="/" className="font-semibold">Aula</Link>
        <Link href="/tareas">Tareas</Link>
        <Link href="/calendario">Calendario</Link>
        <Link href="/familias">Familias</Link>
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <Link href="/panel" className="btn">Panel</Link>
              <button className="btn" onClick={() => signOut(auth)}>Salir</button>
            </>
          ) : (
            <Link className="btn" href="/acceso">Acceso</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
