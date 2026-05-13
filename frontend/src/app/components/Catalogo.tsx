import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Package,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Filter,
  Search,
  LayoutGrid,
  List,
  Recycle,
  DollarSign,
  Tag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { supabase } from "./supabaseClient";
import { toast } from "sonner";
import { Link } from "react-router";

interface Publicacion {
  id: number;
  titulo: string;
  quantity: number;
  price: number;
  bottleType: string;
  location: string;
  date: string;
  status: string;
  visible: boolean;
  description: string;
  moneda: string;
}

const STATUS_MAP: Record<string, { label: string; cls: string; icon: JSX.Element }> = {
  activa: {
    label: "Activa",
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <CheckCircle2 className="size-3.5" />,
  },
  reservada: {
    label: "Reservada",
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: <Clock className="size-3.5" />,
  },
  cerrada: {
    label: "Finalizada",
    cls: "bg-slate-100 text-slate-500 border border-slate-200",
    icon: <CheckCircle2 className="size-3.5" />,
  },
  cancelada: {
    label: "Cancelada",
    cls: "bg-red-50 text-red-600 border border-red-200",
    icon: <XCircle className="size-3.5" />,
  },
};

export function Catalogo() {
  const navigate = useNavigate();
  const moneda = localStorage.getItem("userMoneda") || "COP";

  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVisible, setFilterVisible] = useState("all");

  // ── Stats calculadas ──
  const totalPublicadas = publicaciones.length;
  const totalActivas = publicaciones.filter((p) => p.status === "activa").length;
  const totalReservadas = publicaciones.filter((p) => p.status === "reservada").length;
  const totalCerradas = publicaciones.filter((p) => p.status === "cerrada").length;
  const totalBotellas = publicaciones.reduce((s, p) => s + p.quantity, 0);
  const totalValor = publicaciones.reduce((s, p) => s + p.price * p.quantity, 0);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id_usuario")
      .eq("correo", user.email)
      .single();
    if (!usuario) { setLoading(false); return; }

    const { data: pubs, error } = await supabase
      .from("publicaciones")
      .select(`
        id_publicacion,
        titulo,
        cantidad_unidades,
        precio_unitario,
        descripcion,
        fecha_publicacion,
        estado,
        visible_marketplace,
        tipos_botella!id_tipo_botella (nombre),
        ubicaciones!id_ubicacion (ciudad, pais),
        usuarios!id_usuario (moneda)
      `)
      .eq("id_usuario", usuario.id_usuario)
      .eq("eliminado", false)
      .order("fecha_publicacion", { ascending: false });

    if (error) {
      toast.error("Error cargando catálogo");
      setLoading(false);
      return;
    }

    setPublicaciones(
      (pubs || []).map((p: any) => ({
        id: p.id_publicacion,
        titulo: p.titulo,
        quantity: p.cantidad_unidades,
        price: p.precio_unitario,
        bottleType: p.tipos_botella?.nombre || "Sin tipo",
        location: p.ubicaciones
          ? `${p.ubicaciones.ciudad}, ${p.ubicaciones.pais}`
          : "Sin ubicación",
        date: p.fecha_publicacion,
        status: p.estado || "activa",
        visible: p.visible_marketplace,
        description: p.descripcion || "",
        moneda: p.usuarios?.moneda || moneda,
      }))
    );
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar esta publicación?")) return;
    const { error } = await supabase
      .from("publicaciones")
      .update({ eliminado: true })
      .eq("id_publicacion", id);
    if (error) { toast.error("Error al eliminar"); return; }
    toast.success("Publicación eliminada");
    setPublicaciones((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleVisible = async (pub: Publicacion) => {
    const nuevo = !pub.visible;
    const { error } = await supabase
      .from("publicaciones")
      .update({ visible_marketplace: nuevo })
      .eq("id_publicacion", pub.id);
    if (error) { toast.error("Error al actualizar visibilidad"); return; }
    toast.success(nuevo ? "Visible en marketplace" : "Oculto del marketplace");
    setPublicaciones((prev) =>
      prev.map((p) => (p.id === pub.id ? { ...p, visible: nuevo } : p))
    );
  };

  const filtered = publicaciones.filter((p) => {
    const matchSearch =
      p.titulo.toLowerCase().includes(search.toLowerCase()) ||
      p.bottleType.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchVisible =
      filterVisible === "all" ||
      (filterVisible === "visible" && p.visible) ||
      (filterVisible === "oculto" && !p.visible);
    return matchSearch && matchStatus && matchVisible;
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_MAP[status] || {
      label: status,
      cls: "bg-slate-100 text-slate-500 border border-slate-200",
      icon: null,
    };
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.cls}`}>
        {cfg.icon}
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Recycle className="size-7 text-emerald-600" />
            <h1 className="text-3xl font-bold text-slate-800">Mi Catálogo</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Todas tus publicaciones — lo que ven los compradores en el marketplace
          </p>
        </div>
        <Link to="/publish">
          <button className="px-5 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors">
            + Nueva publicación
          </button>
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Publicadas", value: totalPublicadas, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
          { label: "Activas", value: totalActivas, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
          { label: "Reservadas", value: totalReservadas, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
          { label: "Finalizadas", value: totalCerradas, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
          { label: "Total botellas", value: totalBotellas.toLocaleString(), color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
          {
            label: "Valor total",
            value: `${moneda} ${totalValor.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`,
            color: "text-violet-700",
            bg: "bg-violet-50",
            border: "border-violet-200",
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`${s.bg} border ${s.border} rounded-xl px-4 py-3 flex flex-col gap-1`}
          >
            <span className="text-xs text-slate-400 font-medium">{s.label}</span>
            <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Filtros ── */}
      <Card className="border-slate-200 shadow-none">
        <CardContent className="px-5 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <Input
                placeholder="Buscar por título, tipo o ubicación..."
                className="pl-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 text-sm">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activa">Activa</SelectItem>
                <SelectItem value="reservada">Reservada</SelectItem>
                <SelectItem value="cerrada">Finalizada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterVisible} onValueChange={setFilterVisible}>
              <SelectTrigger className="w-40 text-sm">
                <SelectValue placeholder="Visibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda visibilidad</SelectItem>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="oculto">Oculto</SelectItem>
              </SelectContent>
            </Select>

            {/* Toggle grid/list */}
            <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:text-slate-600"}`}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:text-slate-600"}`}
              >
                <List className="size-4" />
              </button>
            </div>

            <span className="text-sm text-slate-400 shrink-0">
              {filtered.length} de {publicaciones.length}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Loading ── */}
      {loading && (
        <div className="py-20 text-center text-slate-400 text-sm animate-pulse">
          Cargando tu catálogo...
        </div>
      )}

      {/* ── Vacío ── */}
      {!loading && filtered.length === 0 && (
        <div className="py-20 text-center space-y-3">
          <Package className="size-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 font-medium">No hay publicaciones que coincidan</p>
          <p className="text-slate-400 text-sm">Prueba ajustando los filtros o crea tu primera publicación</p>
          <Link to="/publish">
            <button className="mt-2 px-5 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors">
              + Publicar ahora
            </button>
          </Link>
        </div>
      )}

      {/* ── VISTA GRID ── */}
      {!loading && filtered.length > 0 && viewMode === "grid" && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pub) => (
            <div
              key={pub.id}
              className={`group relative rounded-2xl border bg-white transition-all hover:shadow-md ${
                pub.status === "cerrada" || pub.status === "cancelada"
                  ? "opacity-60 border-slate-100"
                  : "border-slate-200"
              }`}
            >
              {/* Cabecera de color según estado */}
              <div
                className={`h-2 rounded-t-2xl ${
                  pub.status === "activa"
                    ? "bg-emerald-400"
                    : pub.status === "reservada"
                    ? "bg-amber-400"
                    : pub.status === "cerrada"
                    ? "bg-slate-300"
                    : "bg-red-300"
                }`}
              />

              <div className="p-5 space-y-4">
                {/* Título + badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-800 text-base leading-snug line-clamp-2">
                    {pub.titulo}
                  </h3>
                  <StatusBadge status={pub.status} />
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Package className="size-4 text-emerald-500 shrink-0" />
                    <span className="font-medium text-slate-700">
                      {pub.quantity.toLocaleString()}
                    </span>
                    <span>und.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Tag className="size-4 text-blue-400 shrink-0" />
                    <span className="truncate">{pub.bottleType}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="size-4 text-rose-400 shrink-0" />
                    <span className="truncate">{pub.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="size-4 text-violet-400 shrink-0" />
                    <span>{new Date(pub.date).toLocaleDateString("es-ES")}</span>
                  </div>
                </div>

                {/* Precio */}
                <div className="flex items-end justify-between pt-1 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400">Precio por unidad</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {pub.moneda} {pub.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Total estimado</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {pub.moneda}{" "}
                      {(pub.price * pub.quantity).toLocaleString("es-ES", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>

                {/* Visibilidad pill */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium flex items-center gap-1 ${
                      pub.visible
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}
                  >
                    {pub.visible ? (
                      <Eye className="size-3" />
                    ) : (
                      <EyeOff className="size-3" />
                    )}
                    {pub.visible ? "Visible en marketplace" : "Oculto del marketplace"}
                  </span>
                </div>

                {/* Acciones */}
                {pub.status === "activa" && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => navigate(`/edit/${pub.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Pencil className="size-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleVisible(pub)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        pub.visible
                          ? "text-slate-500 border-slate-200 hover:bg-slate-50"
                          : "text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                      }`}
                    >
                      {pub.visible ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                      {pub.visible ? "Ocultar" : "Mostrar"}
                    </button>
                    <button
                      onClick={() => handleDelete(pub.id)}
                      className="p-2 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )}

                {pub.status === "reservada" && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 font-medium flex items-center gap-2">
                    <Clock className="size-4 shrink-0" />
                    En proceso de compra — pendiente de confirmación
                  </div>
                )}

                {pub.status === "cerrada" && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 font-medium flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    Transacción completada exitosamente
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── VISTA LISTA ── */}
      {!loading && filtered.length > 0 && viewMode === "list" && (
        <div className="space-y-3">
          {filtered.map((pub) => (
            <div
              key={pub.id}
              className={`flex items-center gap-5 p-5 rounded-xl border bg-white hover:shadow-sm transition-all ${
                pub.status === "cerrada" || pub.status === "cancelada"
                  ? "opacity-60 border-slate-100"
                  : "border-slate-200"
              }`}
            >
              {/* Indicador estado */}
              <div
                className={`w-1.5 self-stretch rounded-full shrink-0 ${
                  pub.status === "activa"
                    ? "bg-emerald-400"
                    : pub.status === "reservada"
                    ? "bg-amber-400"
                    : pub.status === "cerrada"
                    ? "bg-slate-300"
                    : "bg-red-300"
                }`}
              />

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 truncate">{pub.titulo}</span>
                  <StatusBadge status={pub.status} />
                  {!pub.visible && pub.status === "activa" && (
                    <span className="text-xs text-slate-400 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <EyeOff className="size-3" /> Oculto
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Package className="size-3.5" />
                    {pub.quantity.toLocaleString()} unidades
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="size-3.5" />
                    {pub.bottleType}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {pub.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {new Date(pub.date).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>

              {/* Precio */}
              <div className="text-right shrink-0">
                <p className="text-xl font-bold text-emerald-600">
                  {pub.moneda} {pub.price.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">por unidad</p>
              </div>

              {/* Acciones */}
              {pub.status === "activa" && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/edit/${pub.id}`)}
                    title="Editar"
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => handleToggleVisible(pub)}
                    title={pub.visible ? "Ocultar" : "Mostrar"}
                    className={`p-2 rounded-lg border transition-colors ${
                      pub.visible
                        ? "border-slate-200 text-slate-500 hover:bg-slate-100"
                        : "border-emerald-200 text-emerald-600 bg-emerald-50"
                    }`}
                  >
                    {pub.visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(pub.id)}
                    title="Eliminar"
                    className="p-2 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}