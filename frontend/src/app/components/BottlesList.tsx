import { useState, useEffect } from "react";
import { MapaVendedores } from "./MapaVendedores";
import {
  Search,
  Filter,
  Package,
  MapPin,
  DollarSign,
  User,
  Building2,
  MessageCircle,
  ShoppingCart,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
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
import { Label } from "./ui/label";

interface BottleListing {
  id: number;
  id_vendedor: number;
  seller: string;
  sellerType: "recycler" | "center";
  telefono: string;
  quantity: number;
  bottleType: string;
  pricePerUnit: number;
  moneda: string;
  location: string;
  description: string;
  postedDate: string;
  sellerId: number;
  xp: number;
  nivel: string;
  total_ventas: number;
  botellas_recicladas: number;
}

export function BottlesList() {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<BottleListing | null>(
    null,
  );
  const [cantidadCompra, setCantidadCompra] = useState("");
  const [loadingCompra, setLoadingCompra] = useState(false);
  const userType = localStorage.getItem("userType") || "recycler";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [listings, setListings] = useState<BottleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [tiposBotella, setTiposBotella] = useState<any[]>([]);
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleComprar = (listing: BottleListing) => {
    setSelectedListing(listing);
    setCantidadCompra(listing.quantity.toString());
    setShowBuyModal(true);
  };

  // Dentro de confirmarCompra (BottlesList.tsx)
  const confirmarCompra = async (total: boolean) => {
    if (!selectedListing) return;
    setLoadingCompra(true);

    const cantidad = total
      ? selectedListing.quantity
      : parseInt(cantidadCompra);
    if (!cantidad || cantidad <= 0 || cantidad > selectedListing.quantity) {
      toast.error("Cantidad inválida");
      setLoadingCompra(false);
      return;
    }

    const precioTotal = cantidad * selectedListing.pricePerUnit;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Usuario no autenticado");
      setLoadingCompra(false);
      return;
    }

    const { data: comprador, error: compradorError } = await supabase
      .from("usuarios")
      .select("id_usuario")
      .eq("correo", user.email)
      .single();
    if (compradorError || !comprador) {
      toast.error("No se pudo obtener el comprador");
      setLoadingCompra(false);
      return;
    }

    // ✅ Solo crear transacción pendiente (NO tocar la publicación)
    const { data: transCreada, error } = await supabase
      .from("transacciones")
      .insert({
        id_publicacion: selectedListing.id,
        id_vendedor: selectedListing.id_vendedor,
        id_comprador: comprador.id_usuario,
        cantidad_unidades: cantidad,
        precio_total_usd: precioTotal,
        fecha_transaccion: new Date().toISOString().split("T")[0],
        estado: "pendiente",
      })
      .select()
      .single();

    if (error) {
      toast.error("Error al registrar transacción: " + error.message);
      setLoadingCompra(false);
      return;
    }

    // Notificar al vendedor
    const { error: notiError } = await supabase.from("notificaciones").insert({
      id_usuario: selectedListing.id_vendedor,
      titulo: "¡Nueva solicitud de compra!",
      mensaje: `${localStorage.getItem("userName")} quiere comprar ${cantidad.toLocaleString()} unidades de ${selectedListing.bottleType} por ${selectedListing.moneda} ${precioTotal.toLocaleString()}`,
      tipo: "compra",
      leida: false,
      id_referencia: selectedListing.id,
      id_transaccion: transCreada.id_transaccion,
    });

    if (notiError) console.error("Error creando notificación:", notiError);
    else
      toast.success("¡Solicitud enviada! Espera la confirmación del vendedor.");

    setShowBuyModal(false);
    setLoadingCompra(false);
    // =========================================
    // XP Y MÉTRICAS COMPRADOR
    // =========================================

    const { data: compradorData } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id_usuario", comprador.id_usuario)
      .single();

    if (compradorData) {
      const nuevoXP = (compradorData.xp || 0) + 50;

      await supabase
        .from("usuarios")
        .update({
          xp: nuevoXP,
          nivel: calcularNivel(nuevoXP),

          total_compras:
            (compradorData.total_compras || 0) + 1,

          botellas_recicladas:
            (compradorData.botellas_recicladas || 0)
            + cantidad,

          plastico_recuperado:
            (compradorData.plastico_recuperado || 0)
            + cantidad * 0.02,

          co2_reducido:
            (compradorData.co2_reducido || 0)
            + cantidad * 0.01,
        })
        .eq("id_usuario", comprador.id_usuario);
    }

    // =========================================
    // XP Y MÉTRICAS VENDEDOR
    // =========================================

    const { data: vendedor } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id_usuario", selectedListing.id_vendedor)
      .single();

    if (vendedor) {
      const xpVendedor = (vendedor.xp || 0) + 100;

      await supabase
        .from("usuarios")
        .update({
          xp: xpVendedor,
          nivel: calcularNivel(xpVendedor),

          total_ventas:
            (vendedor.total_ventas || 0) + 1,
        })
        .eq("id_usuario", vendedor.id_usuario);
    }
    // Recargar la lista para reflejar que la publicación sigue igual (no cambió)
    await cargarDatos();
  };

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const obtenerRol = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("correo", user?.email)
        .single();

      if (data?.rol === "admin") {
        setIsAdmin(true);
      }
    };

    obtenerRol();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);

    // Cargar tipos de botella para filtros
    const { data: tipos } = await supabase
      .from("tipos_botella")
      .select("id_tipo_botella, nombre");
    setTiposBotella(
      (tipos || []).filter((t) => t.nombre && t.nombre.trim() !== ""),
    );
    const { data: ubics } = await supabase
      .from("ubicaciones")
      .select("id_ubicacion, ciudad, pais");
    setUbicaciones(
      (ubics || []).filter((u) => u.ciudad && u.ciudad.trim() !== ""),
    );

    // Cargar publicaciones con joins
    const { data, error } = await supabase
      .from("publicaciones")
      .select(
        `
        id_publicacion,
        id_usuario,
        titulo,
        cantidad_unidades,
        precio_unitario,
        descripcion,
        fecha_publicacion,
        estado,
        usuarios!id_usuario (
  id_usuario,
  nombre,
  tipo_usuario,
  telefono,
  moneda,
  xp,
  nivel,
  total_ventas,
  botellas_recicladas
),
        tipos_botella!id_tipo_botella (nombre),
        ubicaciones!id_ubicacion (ciudad, pais)
      `,
      )
      .eq("estado", "activa")
      .eq("visible_marketplace", true)
      .order("fecha_publicacion", { ascending: false });

    if (error) {
      console.error("Error cargando publicaciones:", error);
      setLoading(false);
      return;
    }

    const mapped: BottleListing[] = (data || []).map((p: any) => ({
      id: p.id_publicacion,
      id_vendedor: p.id_usuario || 0,
      sellerId: p.usuarios?.id_usuario,
      seller: p.usuarios?.nombre || "Vendedor",
      sellerType: p.usuarios?.tipo_usuario === "center" ? "center" : "recycler",
      telefono: p.usuarios?.telefono || "",
      quantity: p.cantidad_unidades,
      bottleType: p.tipos_botella?.nombre || p.titulo || "Botella",
      pricePerUnit: p.precio_unitario,
      moneda: p.usuarios?.moneda || "COP",
      location: p.ubicaciones
        ? `${p.ubicaciones.ciudad}, ${p.ubicaciones.pais}`
        : "Colombia",
      description: p.descripcion || "",
      postedDate: p.fecha_publicacion,
      xp: p.usuarios?.xp || 0,
nivel: p.usuarios?.nivel || "🍃 Novato Verde",
total_ventas: p.usuarios?.total_ventas || 0,
botellas_recicladas: p.usuarios?.botellas_recicladas || 0,
    }));

    setListings(mapped);
    setLoading(false);
  };

  const calcularNivel = (xp: number) => {
    if (xp >= 5000) return "👑 Leyenda del Planeta";
    if (xp >= 3000) return "🏆 Maestro del Reciclaje";
    if (xp >= 1500) return "🌎 Guardián Ambiental";
    if (xp >= 800) return "♻️ Eco Héroe";
    if (xp >= 300) return "🌿 Reciclador Experto";
    if (xp >= 100) return "🌱 Reciclador Activo";

    return "🍃 Novato Verde";
  };

  const handleContactar = (listing: BottleListing) => {
    const phone = listing.telefono?.replace(/\D/g, "") || "";
    const message = encodeURIComponent(
      `Hola ${listing.seller}! Vi tu publicación en Mercado Verde sobre ${listing.bottleType} (${listing.quantity} unidades a ${listing.moneda} ${listing.pricePerUnit}/unidad). ¿Está disponible?`,
    );
    const url = phone
      ? `https://wa.me/${phone}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(url, "_blank");
  };


  const eliminarPublicacion = async (id: number) => {
    const confirmar = confirm("¿Eliminar esta publicación?");
    if (!confirmar) return;
    const { error } = await supabase
      .from("publicaciones")
      .update({ eliminado: true })
      .eq("id_publicacion", id);
    if (error) {
      toast.error("Error al eliminar");
    } else {
      toast.success("Publicación eliminada");
      cargarDatos(); // refrescar lista
    }
  };
  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.bottleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "all" ||
      listing.bottleType.toLowerCase().includes(selectedType.toLowerCase());
    const matchesLocation =
      selectedLocation === "all" || listing.location.includes(selectedLocation);
    return matchesSearch && matchesType && matchesLocation;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Botellas Disponibles
        </h1>
        <p className="text-muted-foreground mt-2">
          {userType === "recycler"
            ? "Encuentra centros de acopio interesados en comprar tus botellas"
            : "Descubre ofertas de recicladores con botellas disponibles"}
        </p>
      </div>

      {/* Filtros */}
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5 text-primary" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por vendedor, tipo..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Plástico</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {tiposBotella
                    .filter((t) => t.nombre && t.nombre.trim() !== "") // solo nombres no vacíos
                    .map((t) => (
                      <SelectItem
                        key={t.id_tipo_botella}
                        value={t.nombre.toLowerCase()}
                      >
                        {t.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ubicación</label>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ubicaciones</SelectItem>
                  {ubicaciones
                    .filter((u) => u.ciudad && u.ciudad.trim() !== "") // solo ciudades no vacías
                    .map((u) => (
                      <SelectItem key={u.id_ubicacion} value={u.ciudad}>
                        {u.ciudad}, {u.pais}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredListings.length} de {listings.length} resultados
        </p>
        {(searchQuery ||
          selectedType !== "all" ||
          selectedLocation !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedType("all");
                setSelectedLocation("all");
              }}
            >
              Limpiar filtros
            </Button>
          )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Cargando publicaciones...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredListings.map((listing) => (
            <Card
              key={listing.id}
              className="border-green-100 hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {listing.sellerType === "recycler" ? (
                        <User className="size-4 text-primary" />
                      ) : (
                        <Building2 className="size-4 text-primary" />
                      )}
                      <CardTitle className="text-lg">
                        {listing.seller}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
  <Badge className="bg-amber-100 text-amber-700 border border-amber-300">
    {listing.nivel}
  </Badge>

  <Badge className="bg-blue-100 text-blue-700 border border-blue-300">
    ⭐ {listing.xp} XP
  </Badge>

  <Badge className="bg-green-100 text-green-700 border border-green-300">
    ♻️ {listing.total_ventas} ventas
  </Badge>
</div>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {listing.location}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge
                      variant={
                        listing.sellerType === "recycler"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {listing.sellerType === "recycler"
                        ? "Reciclador"
                        : "Centro de Acopio"}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 border border-green-300">
                      ✓ Activa
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="size-4 text-primary" />
                      <span className="text-sm font-medium">Cantidad</span>
                    </div>
                    <span className="font-semibold">
                      {listing.quantity.toLocaleString()} botellas
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">
                      Tipo de Plástico
                    </span>
                    <span className="text-sm">{listing.bottleType}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        Precio por unidad
                      </span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      {listing.moneda} {listing.pricePerUnit.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      Total estimado
                    </div>
                    <div className="text-xl font-bold text-amber-700">
                      {listing.moneda}{" "}
                      {(listing.quantity * listing.pricePerUnit).toLocaleString(
                        "es-ES",
                        { minimumFractionDigits: 2 },
                      )}
                    </div>
                  </div>
                </div>

                {listing.description && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      {listing.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Publicado:{" "}
                    {new Date(listing.postedDate).toLocaleDateString("es-ES")}
                  </span>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-green-600"
                      onClick={() => handleComprar(listing)}
                    >
                      <ShoppingCart className="size-4 mr-2" />
                      Comprar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500 text-green-600"
                      onClick={() => handleContactar(listing)}
                    >
                      <MessageCircle className="size-4 mr-2" />
                      WhatsApp
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => eliminarPublicacion(listing.id)}
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredListings.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-muted-foreground mb-4">
              Intenta ajustar tus filtros de búsqueda
            </p>
          </CardContent>
        </Card>
      )}
      {showBuyModal && selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-green-100 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="size-5 text-primary" />
                Confirmar Compra
              </CardTitle>
              <CardDescription>
                {selectedListing.bottleType} — {selectedListing.seller}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Disponible</span>
                  <span className="font-medium">
                    {selectedListing.quantity.toLocaleString()} unidades
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Precio por unidad
                  </span>
                  <span className="font-medium">
                    {selectedListing.moneda} {selectedListing.pricePerUnit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cantidad a comprar</Label>
                <Input
                  type="number"
                  value={cantidadCompra}
                  onChange={(e) => setCantidadCompra(e.target.value)}
                  min="1"
                  max={selectedListing.quantity}
                  placeholder="Ingresa la cantidad"
                />
                {cantidadCompra && (
                  <p className="text-sm text-primary font-medium">
                    Total: {selectedListing.moneda}{" "}
                    {(
                      parseInt(cantidadCompra) * selectedListing.pricePerUnit
                    ).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-primary hover:bg-green-600"
                  onClick={() => confirmarCompra(false)}
                  disabled={loadingCompra}
                >
                  {loadingCompra
                    ? "Procesando..."
                    : `Comprar ${cantidadCompra} unidades`}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-green-500 text-green-600"
                  onClick={() => confirmarCompra(true)}
                  disabled={loadingCompra}
                >
                  Comprar todo ({selectedListing.quantity.toLocaleString()}{" "}
                  unidades)
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowBuyModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
