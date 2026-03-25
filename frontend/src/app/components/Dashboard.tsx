import { useState } from "react";
import { Logo } from './logo';
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
  const userType =
    localStorage.getItem("userType") || "recycler";
  const isRecycler = userType === "recycler";

  const [stats] = useState({
    totalBottles: isRecycler ? 1250 : 8450,
    totalSales: isRecycler ? 15 : 52,
    totalRevenue: isRecycler ? 1875.5 : 12680.0,
    monthlyGrowth: 12.5,
  });

  // Publicaciones para recicladores
  const [recentPublications] = useState<Publication[]>([
    {
      id: 1,
      title: "Botellas PET 500ml Transparentes",
      quantity: 150,
      price: 225.0,
      location: "Bogotá, Colombia",
      views: 45,
      interested: 8,
      date: "2026-02-20",
      status: "active",
    },
    {
      id: 2,
      title: "Botellas PET 1L Variadas",
      quantity: 200,
      price: 300.0,
      location: "Medellín, Colombia",
      views: 67,
      interested: 12,
      date: "2026-02-18",
      status: "active",
    },
    {
      id: 3,
      title: "Botellas PET 2L Azules",
      quantity: 100,
      price: 180.0,
      location: "Cali, Colombia",
      views: 23,
      interested: 4,
      date: "2026-02-15",
      status: "sold",
    },
  ]);

  // Datos para Centro de Acopio
  const [topSuppliers] = useState([
    { name: "María González", bottles: 850, transactions: 12, rating: 4.8 },
    { name: "Carlos Ruiz", bottles: 720, transactions: 10, rating: 4.9 },
    { name: "Ana Torres", bottles: 650, transactions: 9, rating: 4.7 },
    { name: "José Martínez", bottles: 580, transactions: 8, rating: 4.6 },
  ]);

  const [recentTransactions] = useState<Transaction[]>([
    {
      id: 1,
      type: isRecycler ? "sale" : "purchase",
      bottles: 150,
      price: 225.0,
      date: "2026-02-10",
      partner: isRecycler ? "Centro Verde SA" : "María González",
    },
    {
      id: 2,
      type: isRecycler ? "sale" : "purchase",
      bottles: 200,
      price: 300.0,
      date: "2026-02-08",
      partner: isRecycler ? "EcoAcopio Ltda" : "Carlos Ruiz",
    },
    {
      id: 3,
      type: isRecycler ? "sale" : "purchase",
      bottles: 100,
      price: 150.0,
      date: "2026-02-05",
      partner: isRecycler ? "Recicladores Unidos" : "Ana Torres",
    },
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Logo className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-foreground">
            {isRecycler
              ? "Panel de Reciclador"
              : "Panel de Centro de Acopio"}
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
              {isRecycler
                ? "Botellas Vendidas"
                : "Botellas Compradas"}
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
          <Progress
            value={isRecycler ? 62.5 : 84.5}
            className="h-3"
          />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {isRecycler ? "1,250" : "8,450"} botellas
              completadas
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
                  Nueva Publicación
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
                  <div className="mt-3 md:mt-0 md:ml-4 text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${pub.price.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ${(pub.price / pub.quantity).toFixed(2)}/unidad
                    </p>
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
                    <p className="text-sm text-muted-foreground">PET Transparente</p>
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
                      {transaction.type === "sale"
                        ? "Venta"
                        : "Compra"}{" "}
                      - {transaction.bottles} botellas
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.partner} •{" "}
                      {new Date(
                        transaction.date,
                      ).toLocaleDateString("es-ES")}
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
            {isRecycler ? "Tu Impacto Ambiental" : "Impacto Ambiental Colectivo"}
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
