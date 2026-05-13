import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Logo } from "./logo";
import { Link } from "react-router";
import {
  Package,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Recycle,
  Eye,
  Heart,
  MapPin,
  Calendar,
  Users,
  Star,
  Bell,
  Check,
  X,
  Pencil,
  EyeOff,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router";

interface Transaction {
  id: number;
  type: "sale" | "purchase";
  bottles: number;
  price: number;
  date: string;
  partner: string;
}

interface Publication {
  id: number;
  title: string;
  quantity: number;
  price: number;
  location: string;
  views: number;
  interested: number;
  date: string;
  visible: boolean;
  status: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType") || "recycler";
  const isRecycler = userType === "recycler";

  const [stats, setStats] = useState({
    totalBottles: 0,
    totalSales: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [recentPublications, setRecentPublications] = useState<Publication[]>(
    [],
  );
  const [topSuppliers, setTopSuppliers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const userId = localStorage.getItem("userId");

  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notificaciones.filter((n) => !n.leida).length;

  const crearNotificacion = async ({
    id_usuario,
    titulo,
    mensaje,
    tipo,
    id_referencia,
    id_transaccion,
  }: {
    id_usuario: number;
    titulo: string;
    mensaje: string;
    tipo: string;
    id_referencia?: number | null;
    id_transaccion?: number | null;
  }) => {
    const payload = {
      id_usuario: Number(id_usuario),
      titulo,
      mensaje,
      tipo,
      leida: false,
      id_referencia: id_referencia ? Number(id_referencia) : null,
      id_transaccion: id_transaccion ? Number(id_transaccion) : null,
    };

    const { data, error } = await supabase
      .from("notificaciones")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error creando notificación:", error, payload);
      return null;
    }

    return data;
  };

  // ─────────────────────────────────────────
  // VENDEDOR: Confirmar reserva
  // ─────────────────────────────────────────
  // ================== FUNCIÓN CONFIRMAR RESERVA (CORREGIDA) ==================
  const handleConfirmarReserva = async (noti: any) => {
    // 1. Marcar notificación del vendedor como leída
    await supabase
      .from("notificaciones")
      .update({ leida: true })
      .eq("id_notificacion", noti.id_notificacion);

    if (!noti.id_referencia) return;

    // 2. Buscar transacción pendiente
    const { data: trans, error: transError } = await supabase
      .from("transacciones")
      .select(
        "id_comprador, id_transaccion, cantidad_unidades, precio_total_usd",
      )
      .eq("id_publicacion", noti.id_referencia)
      .eq("estado", "pendiente")
      .maybeSingle();

    if (!trans) {
      console.error(
        "❌ No se encontró transacción pendiente para la publicación",
        noti.id_referencia,
      );
      toast.error("Error: No se pudo encontrar la solicitud de compra.");
      return;
    }

    if (!trans.id_comprador) {
      console.error("❌ La transacción no tiene id_comprador", trans);
      toast.error("Error interno: falta el comprador en la transacción.");
      return;
    }

    // 3. Actualizar publicación a reservada
    await supabase
      .from("publicaciones")
      .update({ estado: "reservada", visible_marketplace: false })
      .eq("id_publicacion", noti.id_referencia);

    // 4. Actualizar transacción a reservada
    await supabase
      .from("transacciones")
      .update({ estado: "reservada" })
      .eq("id_transaccion", trans.id_transaccion);

    // 5. Notificar al comprador
    const { error: notifError } = await supabase.from("notificaciones").insert({
      id_usuario: trans.id_comprador,
      titulo: "¡Tu reserva fue confirmada!",
      mensaje:
        "¡Tu reserva fue aceptada! El vendedor confirmó que el producto está listo. Ya puedes ir a recogerlo y coordinar el pago.",
      tipo: "reserva_confirmada",
      leida: false,
      id_referencia: noti.id_referencia,
      id_transaccion: trans.id_transaccion,
    });

    if (notifError) {
      console.error("❌ Error al notificar al comprador:", notifError);
      toast.error(
        "La reserva se confirmó, pero no se pudo notificar al comprador.",
      );
    } else {
      console.log("✅ Notificación enviada al comprador:", trans.id_comprador);
      toast.success("Reserva confirmada. Se notificó al comprador.");
    }

    // 6. Notificar al vendedor (opcional)
    const { data: pub } = await supabase
      .from("publicaciones")
      .select("id_usuario, titulo")
      .eq("id_publicacion", noti.id_referencia)
      .single();

    if (pub) {
      await supabase.from("notificaciones").insert({
        id_usuario: pub.id_usuario,
        titulo: "Producto reservado",
        mensaje: `Tu publicación "${pub.titulo}" fue marcada como reservada exitosamente.`,
        tipo: "producto_reservado",
        leida: false,
        id_referencia: noti.id_referencia,
        id_transaccion: trans.id_transaccion,
      });
    }

    // Actualizar estado local
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === noti.id_notificacion ? { ...n, leida: true } : n,
      ),
    );

    await cargarPublicaciones();
  };

  // ================== FUNCIÓN RECHAZAR RESERVA (CORREGIDA) ==================
  const handleRechazarReserva = async (noti: any) => {
    await supabase
      .from("notificaciones")
      .update({ leida: true })
      .eq("id_notificacion", noti.id_notificacion);

    if (!noti.id_referencia) return;

    // Buscar transacción pendiente o reservada
    const { data: trans, error: transError } = await supabase
      .from("transacciones")
      .select("id_comprador, id_transaccion, cantidad_unidades, estado")
      .eq("id_publicacion", noti.id_referencia)
      .in("estado", ["pendiente", "reservada"])
      .maybeSingle();

    if (!trans) {
      console.error(
        "❌ No se encontró transacción para rechazar",
        noti.id_referencia,
      );
      toast.error("No se pudo rechazar la solicitud: no existe transacción.");
      return;
    }

    if (!trans.id_comprador) {
      console.error("❌ La transacción no tiene id_comprador", trans);
      toast.error("Error interno: falta el comprador en la transacción.");
      return;
    }

    // Cancelar transacción
    await supabase
      .from("transacciones")
      .update({ estado: "cancelada" })
      .eq("id_transaccion", trans.id_transaccion);

    // Notificar al comprador que fue rechazado
    const { error: notifError } = await supabase.from("notificaciones").insert({
      id_usuario: trans.id_comprador,
      titulo: "Reserva no aceptada",
      mensaje:
        "El vendedor no pudo aceptar tu solicitud en este momento. El producto volvió a estar disponible, puedes volver a intentarlo.",
      tipo: "reserva_rechazada",
      leida: false,
      id_referencia: noti.id_referencia,
      id_transaccion: trans.id_transaccion,
    });

    if (notifError) {
      console.error("❌ Error al notificar rechazo al comprador:", notifError);
      toast.error(
        "El rechazo se aplicó, pero no se pudo notificar al comprador.",
      );
    } else {
      console.log(
        "✅ Notificación de rechazo enviada al comprador:",
        trans.id_comprador,
      );
      toast.success("Solicitud rechazada. Se notificó al comprador.");
    }

    // Restaurar publicación a activa
    const { data: pubActual } = await supabase
      .from("publicaciones")
      .select("cantidad_unidades")
      .eq("id_publicacion", noti.id_referencia)
      .maybeSingle();

    if (pubActual && trans) {
      const nuevaCantidad =
        Number(pubActual.cantidad_unidades || 0) +
        Number(trans.cantidad_unidades || 0);
      await supabase
        .from("publicaciones")
        .update({
          estado: "activa",
          visible_marketplace: true,
          cantidad_unidades: nuevaCantidad,
        })
        .eq("id_publicacion", noti.id_referencia);
    }

    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === noti.id_notificacion ? { ...n, leida: true } : n,
      ),
    );
    await cargarPublicaciones();
  };
  // ─────────────────────────────────────────
  // COMPRADOR: Confirmar compra final
  // ─────────────────────────────────────────
  const handleConfirmarCompra = async (noti: any) => {
    await supabase
      .from("notificaciones")
      .update({ leida: true })
      .eq("id_notificacion", noti.id_notificacion);

    if (noti.id_transaccion) {
      // Marcar transacción como completada
      await supabase
        .from("transacciones")
        .update({ estado: "completada" })
        .eq("id_transaccion", noti.id_transaccion);
    }

    if (noti.id_referencia) {
      // Cerrar publicación definitivamente
      await supabase
        .from("publicaciones")
        .update({ estado: "cerrada", visible_marketplace: false })
        .eq("id_publicacion", noti.id_referencia);

      // Notificar al vendedor que la venta se completó
      const { data: pub } = await supabase
        .from("publicaciones")
        .select("id_usuario")
        .eq("id_publicacion", noti.id_referencia)
        .maybeSingle();

      if (pub) {
        await supabase.from("notificaciones").insert({
          id_usuario: pub.id_usuario,
          titulo: "¡Venta completada!",
          mensaje: `El comprador confirmó la recepción del producto. La transacción ha sido completada exitosamente.`,
          tipo: "venta_completada",
          leida: false,
          id_referencia: noti.id_referencia,
        });
      }
    }
    await supabase
      .from("notificaciones")
      .update({ leida: true })
      .eq("id_referencia", noti.id_referencia);

    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === noti.id_notificacion ? { ...n, leida: true } : n,
      ),
    );
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("¿Seguro que quieres eliminar?");
    if (!confirmDelete) return;
    const { error } = await supabase
      .from("publicaciones")
      .update({ eliminado: true })
      .eq("id_publicacion", id);
    if (error) {
      alert("Error: " + error.message);
      return;
    }
    setRecentPublications((prev) => prev.filter((p) => p.id !== id));
  };

  const cargarPublicaciones = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id_usuario")
      .eq("correo", user.email)
      .single();
    if (!usuario) return;

    const { data: pubs } = await supabase
      .from("publicaciones")
      .select(
        `id_publicacion, titulo, cantidad_unidades, precio_unitario, fecha_publicacion, estado, visible_marketplace, ubicaciones!id_ubicacion (ciudad, pais)`,
      )
      .eq("id_usuario", usuario.id_usuario)
      .eq("eliminado", false)
      .order("fecha_publicacion", { ascending: false })
      .limit(5);

    if (pubs) {
      setRecentPublications(
        pubs.map((p: any) => ({
          id: p.id_publicacion,
          title: p.titulo,
          quantity: p.cantidad_unidades,
          price: p.precio_unitario,
          location: p.ubicaciones
            ? `${p.ubicaciones.ciudad}, ${p.ubicaciones.pais}`
            : "Sin ubicación",
          views: 0,
          interested: 0,
          date: p.fecha_publicacion,
          status: p.estado || "activa",
          visible: p.visible_marketplace,
        })),
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: inventario } = await supabase
        .from("publicaciones")
        .select(`cantidad_unidades, tipos_botella!id_tipo_botella(nombre)`)
        .eq("estado", "activa")
        .eq("visible_marketplace", true);

      if (inventario) {
        const agrupado: Record<string, number> = {};
        inventario.forEach((item: any) => {
          const tipo = item.tipos_botella?.nombre || "Otro";
          if (!agrupado[tipo]) agrupado[tipo] = 0;
          agrupado[tipo] += item.cantidad_unidades;
        });
        setInventory(
          Object.entries(agrupado).map(([tipo, cantidad]) => ({
            tipo,
            cantidad,
          })),
        );
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("id_usuario")
        .eq("correo", user.email)
        .single();
      if (!usuario) return;
      const idUsuario = usuario.id_usuario;

      if (!isRecycler) {
        const { data: proveedores } = await supabase
          .from("transacciones")
          .select("id_vendedor, cantidad_unidades")
          .order("cantidad_unidades", { ascending: false })
          .limit(20);

        if (proveedores) {
          const idsVendedores = [
            ...new Set(proveedores.map((p) => p.id_vendedor)),
          ];

          const { data: usuarios } = await supabase
            .from("usuarios")
            .select("id_usuario, nombre, calificacion_promedio")
            .in("id_usuario", idsVendedores);

          const usuariosMap = new Map(
            usuarios?.map((u) => [u.id_usuario, u]) || [],
          );

          const agrupado: Record<number, any> = {};

          proveedores.forEach((t: any) => {
            const id = t.id_vendedor;

            const usuario = usuariosMap.get(id);

            if (!agrupado[id]) {
              agrupado[id] = {
                name: usuario?.nombre || "Usuario",
                bottles: 0,
                transactions: 0,
                rating: usuario?.calificacion_promedio || 0,
              };
            }

            agrupado[id].bottles += t.cantidad_unidades;
            agrupado[id].transactions += 1;
          });

          setTopSuppliers(
            Object.values(agrupado)
              .sort((a: any, b: any) => b.bottles - a.bottles)
              .slice(0, 4),
          );
        }
      }

      await cargarPublicaciones();

      const { data: notis, error: notisError } = await supabase
        .from("notificaciones")
        .select("*")
        .eq("id_usuario", idUsuario)
        .order("fecha", { ascending: false });
      if (notis) setNotificaciones(notis);

      const id = parseInt(idUsuario);
      console.log("NOTIFICACIONES:", notis);
      console.log("ERROR NOTIS:", notisError);

      const interval = setInterval(async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data: usuario } = await supabase
          .from("usuarios")
          .select("id_usuario")
          .eq("correo", user.email)
          .single();
        if (usuario) {
          const { data: notis } = await supabase
            .from("notificaciones")
            .select("*")
            .eq("id_usuario", usuario.id_usuario)
            .order("fecha", { ascending: false });
          if (notis) setNotificaciones(notis);
        }
      }, 30000);
      return () => clearInterval(interval);

      const { data: trans } = await supabase
        .from("transacciones")
        .select(
          `id_transaccion, cantidad_unidades, precio_total_usd, fecha_transaccion, id_comprador, id_vendedor`,
        )
        .or(`id_comprador.eq.${id},id_vendedor.eq.${id}`)
        .eq("estado", "completada")
        .order("fecha_transaccion", { ascending: false })
        .limit(5);

      if (trans) {
        setRecentTransactions(
          trans.map((t: any) => ({
            id: t.id_transaccion,
            type:
              t.id_vendedor === parseInt(userId || "0") ? "sale" : "purchase",
            bottles: t.cantidad_unidades,
            price: t.precio_total_usd,
            date: t.fecha_transaccion,
            partner: "Usuario",
          })),
        );
        const totalBotellas = trans.reduce(
          (sum: number, t: any) => sum + (t.cantidad_unidades || 0),
          0,
        );
        const totalDinero = trans.reduce(
          (sum: number, t: any) => sum + (t.precio_total_usd || 0),
          0,
        );
        setStats({
          totalBottles: totalBotellas,
          totalSales: trans.length,
          totalRevenue: totalDinero,
          monthlyGrowth: 12.5,
        });
      }
    };
    fetchData();

    const intervalId = setInterval(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("id_usuario")
        .eq("correo", user.email)
        .single();

      if (usuario) {
        const { data: notis } = await supabase
          .from("notificaciones")
          .select("*")
          .eq("id_usuario", usuario.id_usuario)
          .order("fecha", { ascending: false });
        if (notis) setNotificaciones(notis);
      }
    }, 30000); // cada 30 segundos

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const StatusBadge = ({
    status,
  }: {
    status: Publication["status"] | string;
  }) => {
    const map: Record<string, { label: string; cls: string }> = {
      activa: {
        label: "Activa",
        cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      },
      cerrada: {
        label: "Finalizada",
        cls: "bg-slate-100 text-slate-500 border border-slate-200",
      },
      reservada: {
        label: "Reservada",
        cls: "bg-amber-50 text-amber-700 border border-amber-200",
      },
      cancelada: {
        label: "Cancelada",
        cls: "bg-red-50 text-red-700 border border-red-200",
      },
    };
    console.log("STATUS:", status);

    const current = map[status] || {
      label: status || "Sin estado",
      cls: "bg-red-50 text-red-700 border border-red-200",
    };

    return (
      <span
        className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${current.cls}`}
      >
        {current.label}
      </span>
    );
  };

  // ─────────────────────────────────────────
  // Render de cada notificación según su tipo
  // ─────────────────────────────────────────
  const renderNotificacion = (noti: any) => {
    const isUnread = !noti.leida;

    // Icono y color según tipo
    const tipoConfig: Record<string, { icon: JSX.Element; accent: string }> = {
      compra: {
        icon: <ShoppingCart className="size-4 text-blue-500" />,
        accent: "bg-blue-50",
      },
      reserva_confirmada: {
        icon: <Package className="size-4 text-emerald-600" />, // Cambia de CheckCircle2 a Package
        accent: "bg-emerald-50",
      },
      reserva_rechazada: {
        icon: <XCircle className="size-4 text-red-500" />,
        accent: "bg-red-50",
      },
      venta_completada: {
        icon: <CheckCircle2 className="size-4 text-emerald-600" />,
        accent: "bg-emerald-50",
      },
      producto_reservado: {
        icon: <Clock className="size-4 text-amber-600" />,
        accent: "bg-amber-50",
      },
    };

    const config = tipoConfig[noti.tipo] ?? {
      icon: <Bell className="size-4 text-slate-400" />,
      accent: "bg-slate-50",
    };

    return (
      <div
        key={noti.id_notificacion}
        className={`px-6 py-4 transition-colors ${isUnread ? "bg-green-50/50" : "bg-white"}`}
      >
        <div className="flex items-start gap-3">
          {/* Icono tipo */}
          <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${config.accent}`}>
            {config.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800 leading-snug">
                {noti.titulo}
              </p>
              {isUnread && (
                <span className="size-2 rounded-full bg-green-500 shrink-0 mt-1.5" />
              )}
            </div>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              {noti.mensaje}
            </p>
            <p className="text-xs text-slate-400 mt-1.5">
              {new Date(noti.fecha).toLocaleString("es-ES")}
            </p>

            {/* ── VENDEDOR: solicitud de compra pendiente → confirmar o rechazar reserva ── */}
            {noti.tipo === "compra" && isUnread && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleConfirmarReserva(noti)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <Check className="size-4" />
                  Confirmar reserva
                </button>
                <button
                  onClick={() => handleRechazarReserva(noti)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <X className="size-4" />
                  Rechazar
                </button>
              </div>
            )}

            {/* ── COMPRADOR: reserva confirmada → puede confirmar compra final ── */}
            {noti.tipo === "reserva_confirmada" && isUnread && (
              <div className="mt-3 space-y-3">
                {/* Banner principal: ir a recoger */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
                  <span className="text-lg">📦</span>
                  <div>
                    <p className="text-xs font-semibold text-emerald-800 mb-0.5">
                      ¡Tu producto está listo para recoger!
                    </p>
                    <p className="text-xs text-emerald-700">
                      Coordina con el vendedor el lugar y hora de entrega.
                      Puedes contactarlo por WhatsApp si lo necesitas.
                    </p>
                  </div>
                </div>

                {/* Pasos */}
                <ol className="text-xs text-slate-600 space-y-1 pl-1">
                  <li className="flex items-center gap-2">
                    <span className="size-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                      1
                    </span>
                    Coordina la entrega con el vendedor
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                      2
                    </span>
                    Ve a recoger tu producto y realiza el pago
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-4 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[10px] shrink-0">
                      3
                    </span>
                    Vuelve aquí y confirma que recibiste todo correctamente
                  </li>
                </ol>

                {/* Botón confirmar recepción */}
                <button
                  onClick={() => handleConfirmarCompra(noti)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Check className="size-4" />
                  Ya recibí el producto — confirmar compra
                </button>
              </div>
            )}

            {/* ── COMPRADOR: reserva rechazada → puede volver a intentarlo ── */}
            {noti.tipo === "reserva_rechazada" && isUnread && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700 font-medium mb-2">
                  El producto volvió a estar disponible en el marketplace.
                </p>
                <button
                  onClick={async () => {
                    // Marcar notificación como leída
                    await supabase
                      .from("notificaciones")
                      .update({ leida: true })
                      .eq("id_notificacion", noti.id_notificacion);
                    setNotificaciones((prev) =>
                      prev.map((n) =>
                        n.id_notificacion === noti.id_notificacion
                          ? { ...n, leida: true }
                          : n,
                      ),
                    );
                    // Navegar al marketplace para volver a solicitar
                    navigate("/bottles");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <ShoppingCart className="size-4" />
                  Volver a solicitar
                </button>
              </div>
            )}

            {/* Otras notificaciones sin acción: marcar leída */}
            {!["compra", "reserva_confirmada", "reserva_rechazada"].includes(
              noti.tipo,
            ) &&
              isUnread && (
                <button
                  onClick={async () => {
                    await supabase
                      .from("notificaciones")
                      .update({ leida: true })
                      .eq("id_notificacion", noti.id_notificacion);
                    setNotificaciones((prev) =>
                      prev.map((n) =>
                        n.id_notificacion === noti.id_notificacion
                          ? { ...n, leida: true }
                          : n,
                      ),
                    );
                  }}
                  className="mt-2 text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Marcar como leída
                </button>
              )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Logo className="h-9 w-9 text-green-600" />
            <h1 className="text-3xl font-bold text-foreground">
              {isRecycler ? "Panel de Reciclador" : "Panel de Centro de Acopio"}
            </h1>
          </div>
          <p className="text-base text-muted-foreground mt-1">
            {isRecycler
              ? "Gestiona tus publicaciones y monitorea tus ventas"
              : "Administra tus compras y proveedores"}
          </p>
        </div>

        {/* ── Campana de notificaciones ── */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <Bell className="size-6 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full size-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[440px] z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-base font-semibold text-slate-800">
                  Notificaciones
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {unreadCount > 0
                    ? `${unreadCount} sin responder`
                    : "Todo al día"}
                </p>
              </div>
              <div className="max-h-[540px] overflow-y-auto divide-y divide-slate-100">
                {notificaciones.length === 0 ? (
                  <div className="py-14 text-center text-sm text-slate-400">
                    No tienes notificaciones
                  </div>
                ) : (
                  notificaciones.map(renderNotificacion)
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: isRecycler ? "Botellas Vendidas" : "Botellas Compradas",
            value: stats.totalBottles.toLocaleString(),
            sub: "Total acumulado",
            icon: <Package className="size-5 text-emerald-600" />,
            accent: "bg-emerald-50",
          },
          {
            label: "Transacciones",
            value: stats.totalSales,
            sub: "Operaciones completadas",
            icon: <ShoppingCart className="size-5 text-blue-500" />,
            accent: "bg-blue-50",
          },
          {
            label: isRecycler ? "Ingresos" : "Inversión Total",
            value: `$${stats.totalRevenue.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`,
            sub: "Total histórico",
            icon: <DollarSign className="size-5 text-violet-500" />,
            accent: "bg-violet-50",
          },
          {
            label: "Crecimiento",
            value: `+${stats.monthlyGrowth}%`,
            sub: "vs. mes anterior",
            icon: <TrendingUp className="size-5 text-amber-500" />,
            accent: "bg-amber-50",
            valueClass: "text-emerald-600",
          },
        ].map((s, i) => (
          <Card key={i} className="border-slate-200 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-medium text-slate-500">
                {s.label}
              </CardTitle>
              <div className={`p-2 rounded-lg ${s.accent}`}>{s.icon}</div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div
                className={`text-3xl font-bold ${(s as any).valueClass ?? "text-slate-800"}`}
              >
                {s.value}
              </div>
              <p className="text-sm text-slate-400 mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Meta mensual ── */}
      <Card className="border-slate-200 shadow-none">
        <CardHeader className="px-6 pt-6 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Recycle className="size-5 text-emerald-600" />
            Meta Mensual de Reciclaje
          </CardTitle>
          <CardDescription className="text-sm">
            {isRecycler
              ? "Progreso hacia tu meta de 2,000 botellas este mes"
              : "Progreso hacia tu meta de 10,000 botellas este mes"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-3">
          <Progress value={isRecycler ? 62.5 : 84.5} className="h-2.5" />
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">
              {isRecycler ? "1,250" : "8,450"} botellas completadas
            </span>
            <span className="font-semibold text-emerald-600">
              {isRecycler ? "62.5%" : "84.5%"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Mis Publicaciones (Reciclador/Vendedor) ── */}
      {isRecycler && (
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Mis Publicaciones</CardTitle>
                <CardDescription className="text-sm mt-0.5">
                  Últimas botellas publicadas en la plataforma
                </CardDescription>
              </div>
              <Link to="/publish">
                <button className="px-5 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors">
                  + Nueva publicación
                </button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-3">
              {recentPublications.map((pub) => (
                <div
                  key={pub.id}
                  className="flex items-center justify-between p-5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all"
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 text-base truncate">
                        {pub.title}
                      </span>
                      <StatusBadge status={pub.status} />
                      {!pub.visible && (
                        <span className="text-xs text-slate-400 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded-full">
                          Oculto en marketplace
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Package className="size-4" />
                        {pub.quantity.toLocaleString()} botellas
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-4" />
                        {pub.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-4" />
                        {new Date(pub.date).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Eye className="size-4" />
                        {pub.views} vistas
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Heart className="size-4" />
                        {pub.interested} interesados
                      </span>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col items-end gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        ${pub.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-slate-400">
                        $
                        {pub.quantity > 0
                          ? (pub.price / pub.quantity).toFixed(2)
                          : "—"}
                        /ud.
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {pub.status === "activa" && (
                        <button
                          onClick={() => navigate(`/edit/${pub.id}`)}
                          title="Editar publicación"
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <Pencil className="size-4" />
                        </button>
                      )}

                      {pub.status === "activa" && (
                        <button
                          title={
                            pub.visible
                              ? "Ocultar del marketplace"
                              : "Mostrar en marketplace"
                          }
                          onClick={async () => {
                            const nuevoVisible = !pub.visible;

                            const { error } = await supabase
                              .from("publicaciones")
                              .update({ visible_marketplace: nuevoVisible })
                              .eq("id_publicacion", pub.id);

                            if (!error) {
                              setRecentPublications((prev) =>
                                prev.map((p) =>
                                  p.id === pub.id
                                    ? { ...p, visible: nuevoVisible }
                                    : p,
                                ),
                              );
                            } else {
                              alert("Error: " + error.message);
                            }
                          }}
                          className={`p-2 rounded-lg border transition-colors ${
                            pub.visible
                              ? "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                              : "border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                          }`}
                        >
                          {pub.visible ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      )}

                      {pub.status === "activa" && (
                        <button
                          title="Eliminar publicación"
                          onClick={() => handleDelete(pub.id)}
                          className="p-2 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>

                    {/* Confirmar entrega manual — solo si reservada */}
                    {pub.status === "reservada" && (
                      <button
                        onClick={async () => {
                          const { error } = await supabase
                            .from("publicaciones")
                            .update({
                              estado: "cerrada",
                              visible_marketplace: false,
                            })
                            .eq("id_publicacion", pub.id);
                          if (!error) {
                            setRecentPublications((prev) =>
                              prev.map((p) =>
                                p.id === pub.id
                                  ? { ...p, status: "cerrada" }
                                  : p,
                              ),
                            );
                          }
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                      >
                        <Check className="size-4" /> Confirmar entrega
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {recentPublications.length === 0 && (
                <div className="py-12 text-center text-base text-slate-400">
                  Aún no tienes publicaciones
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Centro de acopio ── */}
      {!isRecycler && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="px-6 pt-6 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="size-5 text-emerald-600" />
                Proveedores Principales
              </CardTitle>
              <CardDescription className="text-sm">
                Recicladores con más transacciones
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              {topSuppliers.map((supplier, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center font-semibold text-emerald-700">
                      {supplier.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-700">
                        {supplier.name}
                      </div>
                      <div className="text-sm text-slate-400">
                        {supplier.transactions} transacciones
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-700">
                      {supplier.bottles} bot.
                    </div>
                    <div className="flex items-center gap-0.5 text-sm text-amber-500 justify-end">
                      <Star className="size-3.5 fill-amber-400" />
                      {supplier.rating}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-none">
            <CardHeader className="px-6 pt-6 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="size-5 text-emerald-600" />
                Inventario Actual
              </CardTitle>
              <CardDescription className="text-sm">
                Botellas procesadas y en almacén
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              {inventory.map((item, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.tipo}</span>
                    <span className="font-semibold text-slate-800">
                      {item.cantidad.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(item.cantidad / 100, 100)}
                    className="h-2"
                  />
                </div>
              ))}
              <div className="pt-3">
                <Link to="/bottles">
                  <button className="w-full py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors">
                    Ver Ofertas Disponibles
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Transacciones recientes ── */}
      <Card className="border-slate-200 shadow-none">
        <CardHeader className="px-6 pt-6 pb-3">
          <CardTitle className="text-lg">Transacciones Recientes</CardTitle>
          <CardDescription className="text-sm">
            Últimas operaciones realizadas en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-3">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`size-10 rounded-full flex items-center justify-center ${transaction.type === "sale" ? "bg-emerald-50" : "bg-blue-50"}`}
                >
                  {transaction.type === "sale" ? (
                    <TrendingUp className="size-5 text-emerald-600" />
                  ) : (
                    <ShoppingCart className="size-5 text-blue-500" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700">
                    {transaction.type === "sale" ? "Venta" : "Compra"} —{" "}
                    {transaction.bottles} botellas
                  </div>
                  <div className="text-sm text-slate-400">
                    {transaction.partner} ·{" "}
                    {new Date(transaction.date).toLocaleDateString("es-ES")}
                  </div>
                </div>
              </div>
              <div
                className={`text-base font-semibold ${transaction.type === "sale" ? "text-emerald-600" : "text-blue-500"}`}
              >
                {transaction.type === "sale" ? "+" : "−"}$
                {transaction.price.toFixed(2)}
              </div>
            </div>
          ))}
          {recentTransactions.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-400">
              Sin transacciones recientes
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Impacto ambiental ── */}
      <Card className="border-slate-200 shadow-none bg-gradient-to-br from-emerald-50/60 to-white">
        <CardHeader className="px-6 pt-6 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Recycle className="size-5 text-emerald-600" />
            {isRecycler
              ? "Tu Impacto Ambiental"
              : "Impacto Ambiental Colectivo"}
          </CardTitle>
          <CardDescription className="text-sm">
            {isRecycler
              ? "Contribución al medio ambiente"
              : "Impacto positivo de tus compras"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: stats.totalBottles, label: "Botellas Recicladas" },
              {
                value: `${(stats.totalBottles * 0.025).toFixed(1)} kg`,
                label: "Plástico Recuperado",
              },
              {
                value: `${(stats.totalBottles * 0.5).toFixed(1)} kg`,
                label: "CO₂ Reducido",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center p-5 bg-white rounded-xl border border-slate-100"
              >
                <div className="text-3xl font-bold text-emerald-600">
                  {item.value}
                </div>
                <div className="text-sm text-slate-500 mt-1.5">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400 text-center mt-4">
            🌍 Cada botella reciclada ayuda a proteger nuestro planeta
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
