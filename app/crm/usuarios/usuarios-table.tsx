"use client";

import { useState, useTransition } from "react";
import { eliminarUsuarioAction, toggleActivoAction } from "./usuarios-actions";

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  telefono: string;
  activo: boolean;
  permisos: string[];
  comision_porcentaje: number;
};

export default function UsuariosTable({
  usuarios,
  currentUserEmail,
}: {
  usuarios: Usuario[];
  currentUserEmail: string;
}) {
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleToggle(u: Usuario) {
    if (!confirm(`¿${u.activo ? "Desactivar" : "Activar"} a ${u.nombre}?`)) return;
    startTransition(async () => {
      setMsg(null);
      const result = await toggleActivoAction(u.id);
      if (result.error) setMsg({ type: "err", text: result.error });
      else setMsg({ type: "ok", text: result.message! });
    });
  }

  function handleDelete(u: Usuario) {
    if (!confirm(`¿Eliminar permanentemente a ${u.nombre}? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      setMsg(null);
      const result = await eliminarUsuarioAction(u.id);
      if (result.error) setMsg({ type: "err", text: result.error });
      else setMsg({ type: "ok", text: result.message! });
    });
  }

  return (
    <>
      {msg && (
        <div
          className={`rounded-xl border px-3 py-2 text-sm ${
            msg.type === "ok"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Permisos</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const isSelf = u.email === currentUserEmail;
                return (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{u.nombre}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.rol === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(u.permisos || []).map((p) => (
                          <span
                            key={p}
                            className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                          >
                            {p}
                          </span>
                        ))}
                        {!(u.permisos || []).length ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          u.activo !== false
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.activo !== false ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleToggle(u)}
                            disabled={pending}
                            className="rounded-lg border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
                          >
                            {u.activo !== false ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={pending}
                            className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!usuarios.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Sin usuarios.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
