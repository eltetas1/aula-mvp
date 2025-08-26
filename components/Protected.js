'use client'
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container py-10">Cargando…</div>;
  if (!user) {
    return (
      <div className="container py-10">
        <div className="card">
          <p>Necesitas iniciar sesión para ver esta página.</p>
          <p className="mt-4"><Link className="btn btn-primary" href="/acceso">Ir a acceso</Link></p>
        </div>
      </div>
    );
  }
  return children;
}
