import { useState } from "react";
import { Logo } from './logo';
import { Link } from "react-router";
import {
  Recycle,
  TrendingUp,
  Users,
  Leaf,
  ShoppingCart,
  MapPin,
  Package,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";

interface Product {
  id: number;
  seller: string;
  bottleType: string;
  quantity: number;
  price: number;
  location: string;
  image: string;
}

export function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const products: Product[] = [
    {
      id: 1,
      seller: "Juan Pérez",
      bottleType: "PET - Transparente",
      quantity: 500,
      price: 1.5,
      location: "Santiago, RM",
      image:
        "https://images.unsplash.com/photo-1720959288082-d8783f646ace?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBwbGFzdGljJTIwYm90dGxlcyUyMHJlY3ljbGluZ3xlbnwxfHx8fDE3NzA4NjA3ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 2,
      seller: "María González",
      bottleType: "HDPE - Color",
      quantity: 800,
      price: 1.8,
      location: "Valparaíso",
      image:
        "https://images.unsplash.com/photo-1685300771555-3affe68d2ea5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZHBlJTIwcGxhc3RpYyUyMGJvdHRsZXMlMjBjb2xsZWN0aW9ufGVufDF8fHx8MTc3MDg2MDc4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 3,
      seller: "Carlos Rodríguez",
      bottleType: "PET - Azul",
      quantity: 350,
      price: 1.4,
      location: "Concepción",
      image:
        "https://images.unsplash.com/photo-1557344252-4d5c9909579c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFzdGljJTIwYm90dGxlcyUyMHdhc3RlJTIwcmVjeWNsaW5nfGVufDF8fHx8MTc3MDg2MDc4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 4,
      seller: "Ana López",
      bottleType: "PET - Verde",
      quantity: 600,
      price: 1.6,
      location: "La Serena",
      image:
        "https://images.unsplash.com/photo-1731342484101-c91e0cc1971f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWN5Y2xpbmclMjBwbGFzdGljJTIwYm90dGxlcyUyMGVudmlyb25tZW50fGVufDF8fHx8MTc3MDc3Njc0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 5,
      seller: "Pedro Martínez",
      bottleType: "HDPE - Transparente",
      quantity: 450,
      price: 1.7,
      location: "Temuco",
      image:
        "https://images.unsplash.com/photo-1720959288082-d8783f646ace?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBwbGFzdGljJTIwYm90dGxlcyUyMHJlY3ljbGluZ3xlbnwxfHx8fDE3NzA4NjA3ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 6,
      seller: "Sofía Ramírez",
      bottleType: "PET - Transparente",
      quantity: 700,
      price: 1.55,
      location: "Antofagasta",
      image:
        "https://images.unsplash.com/photo-1685300771555-3affe68d2ea5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZHBlJTIwcGxhc3RpYyUyMGJvdHRsZXMlMjBjb2xsZWN0aW9ufGVufDF8fHx8MTc3MDg2MDc4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    setShowAuthModal(true);
  };

  const scrollToMarketplace = () => {
    document
      .getElementById("marketplace")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-green-600" />
              <span className="text-xl font-semibold text-foreground">
                GreenScript Exchange
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#"
                className="text-foreground hover:text-primary transition-colors"
              >
                Inicio
              </a>
              <a
                href="#marketplace"
                className="text-foreground hover:text-primary transition-colors"
              >
                Mercado
              </a>
              <a
                href="#como-funciona"
                className="text-foreground hover:text-primary transition-colors"
              >
                ¿Cómo funciona?
              </a>
              <a
                href="#contacto"
                className="text-foreground hover:text-primary transition-colors"
              >
                Contacto
              </a>
            </nav>

            <Link to="/auth">
              <Button className="bg-primary hover:bg-green-600">
                Iniciar Sesión / Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full">
              🌍 Economía Circular
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Transforma el Reciclaje en{" "}
              <span className="text-primary">Oportunidad</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Conectamos recicladores con centros de acopio para
              crear un mercado sostenible de botellas plásticas
              reciclables. Juntos construimos un futuro más
              verde.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-green-600"
                >
                  Comenzar Ahora
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToMarketplace}
              >
                Conocer Más
              </Button>
            </div>
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-primary">
                  5,000+
                </div>
                <div className="text-sm text-muted-foreground">
                  Recicladores
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  200+
                </div>
                <div className="text-sm text-muted-foreground">
                  Centros de Acopio
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  1M+
                </div>
                <div className="text-sm text-muted-foreground">
                  Botellas Recicladas
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1731342484101-c91e0cc1971f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWN5Y2xpbmclMjBwbGFzdGljJTIwYm90dGxlcyUyMGVudmlyb25tZW50fGVufDF8fHx8MTc3MDc3Njc0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Reciclaje de botellas plásticas"
              className="rounded-2xl shadow-2xl w-full object-cover h-[400px] md:h-[500px]"
            />
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="marketplace" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Marketplace - Botellas Disponibles
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explora las ofertas disponibles de botellas
              plásticas reciclables de recicladores verificados
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="border-green-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.bottleType}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-green-500 text-white">
                      Disponible
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5 space-y-4">
                  {/* Product Info */}
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {product.bottleType}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Vendedor: {product.seller}
                    </p>
                  </div>

                  {/* Quantity and Location */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="size-4 text-primary" />
                      <span>
                        {product.quantity.toLocaleString()}{" "}
                        unidades disponibles
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-4 text-primary" />
                      <span>{product.location}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-3 border-t">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        por unidad
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Total: $
                      {(
                        product.quantity * product.price
                      ).toLocaleString("es-ES", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  {/* Buy Button */}
                  <Button
                    className="w-full bg-primary hover:bg-green-600"
                    onClick={() => handleBuyClick(product)}
                  >
                    <ShoppingCart className="size-4 mr-2" />
                    Comprar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="como-funciona"
        className="bg-gradient-to-b from-gray-50 to-white py-16"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              ¿Por qué GreenScript Exchange?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Una plataforma diseñada para hacer el reciclaje
              más accesible, rentable y sostenible
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">
                  Precios Justos
                </h3>
                <p className="text-muted-foreground">
                  Mercado transparente donde recicladores y
                  centros de acopio establecen precios
                  competitivos
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">
                  Comunidad Activa
                </h3>
                <p className="text-muted-foreground">
                  Conecta con una red de recicladores
                  comprometidos y centros de acopio certificados
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Leaf className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">
                  Impacto Ambiental
                </h3>
                <p className="text-muted-foreground">
                  Cada botella reciclada contribuye a reducir la
                  contaminación y proteger nuestro planeta
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Environmental Message Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Leaf className="size-16 mx-auto opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Cada Botella Cuenta
            </h2>
            <p className="text-lg opacity-90">
              Las botellas plásticas tardan hasta 450 años en
              descomponerse. Al reciclarlas, no solo generas
              ingresos, sino que proteges el medio ambiente para
              las futuras generaciones.
            </p>
            <div className="pt-4">
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-green-600 hover:bg-green-50"
                >
                  Únete al Cambio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contacto"
        className="border-t bg-gray-50 py-8"
      >
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>
            &copy; 2026 GreenScript Exchange. Proyecto
            universitario de impacto ambiental.
          </p>
        </div>
      </footer>

      {/* Authentication Modal */}
      <Dialog
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ShoppingCart className="size-6 text-primary" />
              Inicia sesión para continuar
            </DialogTitle>
            <DialogDescription className="pt-2">
              Para continuar con la compra de este producto
              debes iniciar sesión o crear una cuenta en
              GreenScript Exchange
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="py-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h4 className="font-semibold text-foreground mb-2">
                  Producto seleccionado:
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    {selectedProduct.bottleType}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedProduct.quantity} unidades - $
                    {selectedProduct.price}/unidad
                  </p>
                  <p className="font-semibold text-primary">
                    Total: $
                    {(
                      selectedProduct.quantity *
                      selectedProduct.price
                    ).toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link to="/auth" className="block">
              <Button
                className="w-full bg-primary hover:bg-green-600"
                size="lg"
              >
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/auth" className="block">
              <Button
                variant="outline"
                className="w-full"
                size="lg"
              >
                Crear Cuenta Nueva
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowAuthModal(false)}
            >
              Cancelar
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Al continuar, aceptas nuestros términos de
              servicio y política de privacidad
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}