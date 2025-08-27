// app/panel/page.js
export default function PanelHome() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <a href="/panel/tareas" className="card hover:bg-gray-50">
        <h2 className="font-semibold">Tareas publicadas</h2>
        <p className="text-sm text-gray-600">Listado y acceso a entregas. Desde ahí podrás crear nuevas.</p>
      </a>

      <a href="/panel/avisos" className="card hover:bg-gray-50">
        <h2 className="font-semibold">Avisos</h2>
        <p className="text-sm text-gray-600">Listado de avisos. Desde ahí podrás crear nuevos.</p>
      </a>

      <a href="/panel/familias" className="card hover:bg-gray-50">
        <h2 className="font-semibold">Familias</h2>
        <p className="text-sm text-gray-600">Alta/edición de emails de responsables.</p>
      </a>
    </div>
  );
}
