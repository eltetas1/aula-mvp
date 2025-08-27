'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/panel",          label: "Resumen" },
  { href: "/panel/tareas",   label: "Tareas publicadas" },
  { href: "/panel/avisos",   label: "Avisos" },
  { href: "/panel/familias", label: "Familias" },
];

export default function PanelNav() {
  const path = usePathname();
  return (
    <nav className="container my-4">
      <ul className="flex flex-wrap gap-2">
        {items.map(it => {
          const active = path === it.href || (it.href !== "/panel" && path.startsWith(it.href));
          return (
            <li key={it.href}>
              <Link href={it.href} className={`btn ${active ? "btn-primary" : ""}`}>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
