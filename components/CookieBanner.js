'use client'
import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const ok = localStorage.getItem("cookie-ok");
    if (!ok) setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-4 inset-x-0 px-4">
      <div className="container">
        <div className="card flex flex-col md:flex-row md:items-center gap-3">
          <p className="text-sm">
            Usamos cookies técnicas para que el sitio funcione. Consulta la{" "}
            <a className="link" href="/cookies">política de cookies</a>.
          </p>
          <div className="md:ml-auto flex gap-2">
            <button className="btn" onClick={() => { localStorage.setItem("cookie-ok","1"); setShow(false); }}>
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
