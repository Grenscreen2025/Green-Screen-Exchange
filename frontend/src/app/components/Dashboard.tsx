import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
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
  status: "active" | "pending" | "sold";
}

export function Dashboard() {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType") || "recycler";
  const isRecycler = userType === "recycler";

  const [stats] = useState({
    totalBottles: isRecycler ? 1250 : 8450,
    totalSales: isRecycler ? 15 : 52,
    totalRevenue: isRecycler ? 1875.5 : 12680.0,
    monthlyGrowth: 12.5,
  });

  // Publicaciones para recicladores y centros de acopio
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [recentPublications, setRecentPublications] = useState<Publication[]>(
    [],
  );
  const [topSuppliers, setTopSuppliers] = useState<any[]>([]);
  const userId = localStorage.getItem("userId");

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

    // ocultar en UI
    setRecentPublications((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    const fetchData = async () => {
      // 🔐 1. obtener usuario auth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 🔥 2. obtener id_usuario real
      const { data: usuario } = await supabase
        .from("usuarios")
        .select("id_usuario")
        .eq("correo", user.email)
        .single();

      if (!usuario) return;

      const idUsuario = usuario.id_usuario;

      console.log("ID USUARIO:", idUsuario);

      // 🔹 TOP PROVEEDORES (solo centro de acopio)
      if (!isRecycler) {
        const { data: proveedores } = await supabase
          .from("transacciones")
          .select(
            `
          id_vendedor,
          cantidad,
          usuarios!id_vendedor (nombre, calificacion_promedio)
        `,
          )
          .order("cantidad", { ascending: false })
          .limit(20);

        if (proveedores) {
          const agrupado: Record<number, any> = {};

          proveedores.forEach((t: any) => {
            const id = t.id_vendedor;

            if (!agrupado[id]) {
              agrupado[id] = {
                name: t.usuarios?.nombre || "Usuario",
                bottles: 0,
                transactions: 0,
                rating: t.usuarios?.calificacion_promedio || 0,
              };
            }

            agrupado[id].bottles += t.cantidad;
            agrupado[id].transactions += 1;
          });

          setTopSuppliers(
            Object.values(agrupado)
              .sort((a: any, b: any) => b.bottles - a.bottles)
              .slice(0, 4),
          );
        }
      }

      // 🔹 PUBLICACIONES DEL USUARIO
      const { data: pubs, error: pubError } = await supabase
        .from("publicaciones")
        .select(
          `
        id_publicacion,
        titulo,
        cantidad_unidades,
        precio_unitario,
        fecha_publicacion,
        estado,
        ubicaciones!id_ubicacion (ciudad, pais)
      `,
        )
        .eq("id_usuario", idUsuario)
        .eq("eliminado", false)
        .order("fecha_publicacion", { ascending: false })
        .limit(5);

      console.log("PUBLICACIONES:", pubs);

      if (!pubError && pubs) {
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
            status: p.estado,
          })),
        );
      }

      // 🔹 TRANSACCIONES DEL USUARIO
      const { data: trans } = await supabase
        .from("transacciones")
        .select(
          `
    id_transaccion,
    cantidad_unidades,
    precio_total_usd,
    fecha_transaccion,
    id_comprador,
    id_vendedor
  `,
        )
        .or(`id_comprador.eq.${userId},id_vendedor.eq.${userId}`)
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
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Logo className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-foreground">
            {isRecycler ? "Panel de Reciclador" : "Panel de Centro de Acopio"}
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">
          {isRecycler
            ? "Gestiona tus publicaciones y monitorea tus ventas"
            : "Administra tus compras y proveedores"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRecycler ? "Botellas Vendidas" : "Botellas Compradas"}
            </CardTitle>
            <Package className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalBottles.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total acumulado
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transacciones
            </CardTitle>
            <ShoppingCart className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalSales}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Operaciones completadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRecycler ? "Ingresos" : "Inversión Total"}
            </CardTitle>
            <DollarSign className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              $
              {stats.totalRevenue.toLocaleString("es-ES", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total histórico
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Crecimiento
            </CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{stats.monthlyGrowth}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs. mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Recycle className="size-5 text-primary" />
            Meta Mensual de Reciclaje
          </CardTitle>
          <CardDescription>
            {isRecycler
              ? "Progreso hacia tu meta de 2,000 botellas este mes"
              : "Progreso hacia tu meta de 10,000 botellas este mes"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={isRecycler ? 62.5 : 84.5} className="h-3" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {isRecycler ? "1,250" : "8,450"} botellas completadas
            </span>
            <span className="text-primary font-medium">
              {isRecycler ? "62.5%" : "84.5%"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Contenido específico para Reciclador */}
      {isRecycler && (
        <Card className="border-green-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mis Publicaciones Recientes</CardTitle>
                <CardDescription>
                  Últimas botellas que has publicado en la plataforma
                </CardDescription>
              </div>
              <Link to="/publish">
                <Button className="bg-primary hover:bg-green-600">
                  + Nueva Publicación
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPublications.map((pub) => (
                <div
                  key={pub.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">
                        {pub.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          pub.status === "active"
                            ? "bg-green-100 text-green-700"
                            : pub.status === "sold"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {pub.status === "active"
                          ? "Activa"
                          : pub.status === "sold"
                            ? "Vendida"
                            : "Pendiente"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="size-3" />
                        {pub.quantity} botellas
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {pub.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(pub.date).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1 text-primary">
                        <Eye className="size-3" />
                        {pub.views} vistas
                      </span>
                      <span className="flex items-center gap-1 text-primary">
                        <Heart className="size-3" />
                        {pub.interested} interesados
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 md:mt-0 md:ml-4 text-right space-y-2">
                    <div className="text-2xl font-bold text-green-600">
                      ${pub.price.toFixed(2)}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      ${(pub.price / pub.quantity).toFixed(2)}/unidad
                    </p>

                    {/* 🔥 BOTONES */}
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/edit/${pub.id}`)}
                      >
                        Editar
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(pub.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido específico para Centro de Acopio */}
      {!isRecycler && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Proveedores Principales */}
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                Proveedores Principales
              </CardTitle>
              <CardDescription>
                Recicladores con más transacciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSuppliers.map((supplier, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {supplier.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {supplier.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {supplier.transactions} transacciones
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">
                        {supplier.bottles} botellas
                      </div>
                      <div className="flex items-center gap-1 text-sm text-yellow-600">
                        <Star className="size-3 fill-yellow-600" />
                        {supplier.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inventario Disponible */}
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5 text-primary" />
                Inventario Actual
              </CardTitle>
              <CardDescription>
                Botellas procesadas y en almacén
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      PET Transparente
                    </p>
                    <p className="text-2xl font-bold text-foreground">3,200</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Capacidad</p>
                    <Progress value={64} className="w-20 h-2 mt-1" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">PET Color</p>
                    <p className="text-2xl font-bold text-foreground">2,150</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Capacidad</p>
                    <Progress value={43} className="w-20 h-2 mt-1" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">HDPE</p>
                    <p className="text-2xl font-bold text-foreground">1,500</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Capacidad</p>
                    <Progress value={30} className="w-20 h-2 mt-1" />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Link to="/bottles">
                  <Button className="w-full bg-primary hover:bg-green-600">
                    Ver Ofertas Disponibles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
          <CardDescription>
            Últimas operaciones realizadas en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center ${
                      transaction.type === "sale"
                        ? "bg-green-100"
                        : "bg-blue-100"
                    }`}
                  >
                    {transaction.type === "sale" ? (
                      <TrendingUp className="size-5 text-green-600" />
                    ) : (
                      <ShoppingCart className="size-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {transaction.type === "sale" ? "Venta" : "Compra"} -{" "}
                      {transaction.bottles} botellas
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.partner} •{" "}
                      {new Date(transaction.date).toLocaleDateString("es-ES")}
                    </div>
                  </div>
                </div>
                <div
                  className={`font-semibold ${
                    transaction.type === "sale"
                      ? "text-green-600"
                      : "text-blue-600"
                  }`}
                >
                  {transaction.type === "sale" ? "+" : "-"}$
                  {transaction.price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Section */}
      <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Recycle className="size-5 text-primary" />
            {isRecycler
              ? "Tu Impacto Ambiental"
              : "Impacto Ambiental Colectivo"}
          </CardTitle>
          <CardDescription>
            {isRecycler
              ? "Contribución al medio ambiente"
              : "Impacto positivo de tus compras"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-green-100">
              <div className="text-3xl font-bold text-primary">
                {stats.totalBottles}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Botellas Recicladas
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-100">
              <div className="text-3xl font-bold text-primary">
                {(stats.totalBottles * 0.025).toFixed(1)} kg
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Plástico Recuperado
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-100">
              <div className="text-3xl font-bold text-primary">
                {(stats.totalBottles * 0.5).toFixed(1)} kg
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                CO₂ Reducido
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            🌍 Cada botella reciclada ayuda a proteger nuestro planeta
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
