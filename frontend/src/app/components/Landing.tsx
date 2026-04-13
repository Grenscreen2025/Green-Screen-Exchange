import { useState, useEffect } from "react";
import { Logo } from './logo';
import { Link } from "react-router";
import {
  Recycle, TrendingUp, Users, Leaf, ShoppingCart,
  MapPin, Package, MessageCircle, X
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { supabase } from "./supabaseClient";

interface Product {
  id: number;
  seller: string;
  seller_phone?: string;
  bottleType: string;
  quantity: number;
  price: number;
  location: string;
  image: string;
  description?: string;
  estado?: string;
  moneda?: string;
}

export function Landing() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Imágenes de respaldo
  const fallbackImages = [
    "https://images.unsplash.com/photo-1720959288082-d8783f646ace?w=1080",
    "https://images.unsplash.com/photo-1685300771555-3affe68d2ea5?w=1080",
    "https://images.unsplash.com/photo-1557344252-4d5c9909579c?w=1080",
    "https://images.unsplash.com/photo-1731342484101-c91e0cc1971f?w=1080",
  ];

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  const cargarPublicaciones = async () => {
    const { data, error } = await supabase
      .from('publicaciones')
      .select(`
        id_publicacion,
        titulo,
        cantidad_unidades,
        precio_unitario,
        descripcion,
        estado,
        id_ubicacion,
        usuarios!id_usuario (nombre, telefono),
        tipos_botella!id_tipo_botella (nombre),
        ubicaciones!id_ubicacion (ciudad, pais)
      `)
      .eq('estado', 'activa')
      .limit(6);

    if (error || !data || data.length === 0) {
      // Datos de respaldo si no hay publicaciones
      setProducts([
        { id: 1, seller: "Juan Pérez", bottleType: "PET - Transparente", quantity: 500, price: 1.5, location: "Pasto, Colombia", image: fallbackImages[0], description: "Botellas PET limpias y comprimidas" },
        { id: 2, seller: "María González", bottleType: "HDPE - Color", quantity: 800, price: 1.8, location: "Bogotá, Colombia", image: fallbackImages[1], description: "HDPE disponible para retiro inmediato" },
        { id: 3, seller: "Carlos Rodríguez", bottleType: "PET - Azul", quantity: 350, price: 1.4, location: "Medellín, Colombia", image: fallbackImages[2], description: "Lote clasificado y separado" },
        { id: 4, seller: "Ana López", bottleType: "PET - Verde", quantity: 600, price: 1.6, location: "Cali, Colombia", image: fallbackImages[3], description: "Material limpio y separado por color" },
      ]);
    } else {
      setProducts(data.map((p: any, i: number) => ({
        id: p.id_publicacion,
        seller: p.usuarios?.nombre || 'Vendedor',
        seller_phone: p.usuarios?.telefono || '',
        bottleType: p.tipos_botella?.nombre || p.titulo || 'Botella',
        quantity: p.cantidad_unidades,
        price: p.precio_unitario,
        location: p.ubicaciones ? `${p.ubicaciones.ciudad}, ${p.ubicaciones.pais}` : 'Colombia',
        image: fallbackImages[i % fallbackImages.length],
        description: p.descripcion,
        estado: p.estado,
        moneda: 'COP',
      })));
    }
    setLoading(false);
  };

  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleContactWhatsApp = (product: Product) => {
    const phone = product.seller_phone?.replace(/\D/g, '') || '';
    const message = encodeURIComponent(
      `Hola ${product.seller}! Vi tu publicación en GreenScript Exchange sobre ${product.bottleType} (${product.quantity} unidades a $${product.price}/unidad). ¿Está disponible?`
    );
    const url = phone
      ? `https://wa.me/${phone}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  const scrollToMarketplace = () => {
    document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-green-600" />
              <span className="text-xl font-semibold text-foreground">GreenScript Exchange</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-foreground hover:text-primary transition-colors">Inicio</a>
              <a href="#marketplace" className="text-foreground hover:text-primary transition-colors">Mercado</a>
              <a href="#como-funciona" className="text-foreground hover:text-primary transition-colors">¿Cómo funciona?</a>
              <a href="#contacto" className="text-foreground hover:text-primary transition-colors">Contacto</a>
            </nav>
            <Link to="/auth">
              <Button className="bg-primary hover:bg-green-600">Iniciar Sesión / Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full">🌍 Economía Circular</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Transforma el Reciclaje en <span className="text-primary">Oportunidad</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Conectamos recicladores con centros de acopio para crear un mercado sostenible de botellas plásticas reciclables.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/auth"><Button size="lg" className="bg-primary hover:bg-green-600">Comenzar Ahora</Button></Link>
              <Button size="lg" variant="outline" onClick={scrollToMarketplace}>Conocer Más</Button>
            </div>
            <div className="flex gap-8 pt-4">
              <div><div className="text-2xl font-bold text-primary">5,000+</div><div className="text-sm text-muted-foreground">Recicladores</div></div>
              <div><div className="text-2xl font-bold text-primary">200+</div><div className="text-sm text-muted-foreground">Centros de Acopio</div></div>
              <div><div className="text-2xl font-bold text-primary">1M+</div><div className="text-sm text-muted-foreground">Botellas Recicladas</div></div>
            </div>
          </div>
          <div className="relative">
            <img src={fallbackImages[3]} alt="Reciclaje" className="rounded-2xl shadow-2xl w-full object-cover h-[400px] md:h-[500px]" />
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section id="marketplace" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Marketplace - Botellas Disponibles</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Explora las ofertas disponibles de recicladores verificados</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando publicaciones...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="border-green-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="relative overflow-hidden">
                    <img src={product.image} alt={product.bottleType} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white">Disponible</Badge>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-1">{product.bottleType}</h3>
                      <p className="text-sm text-muted-foreground">Vendedor: {product.seller}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="size-4 text-primary" />
                        <span>{product.quantity.toLocaleString()} unidades disponibles</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="size-4 text-primary" />
                        <span>{product.location}</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground">por unidad</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Total: ${(product.quantity * product.price).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <Button className="w-full bg-primary hover:bg-green-600" onClick={() => handleBuyClick(product)}>
                      <ShoppingCart className="size-4 mr-2" />Comprar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section id="como-funciona" className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">¿Por qué GreenScript Exchange?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, title: "Precios Justos", desc: "Mercado transparente donde recicladores y centros de acopio establecen precios competitivos" },
              { icon: Users, title: "Comunidad Activa", desc: "Conecta con una red de recicladores comprometidos y centros de acopio certificados" },
              { icon: Leaf, title: "Impacto Ambiental", desc: "Cada botella reciclada contribuye a reducir la contaminación y proteger nuestro planeta" },
            ].map((f, i) => (
              <Card key={i} className="border-green-100 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <f.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{f.title}</h3>
                  <p className="text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 md:p-12 text-white text-center space-y-6">
          <Leaf className="size-16 mx-auto opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold">Cada Botella Cuenta</h2>
          <p className="text-lg opacity-90">Las botellas plásticas tardan hasta 450 años en descomponerse.</p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-green-50">Únete al Cambio</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 GreenScript Exchange. Proyecto universitario de impacto ambiental.</p>
        </div>
      </footer>

      {/* Modal del producto */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="p-0 overflow-hidden" style={{ width: '60vw', maxWidth: '80vw', height: '70vh' }}>
          {selectedProduct && (
            <div className="grid grid-cols-2 min-h-[500px]">

              {/* IZQUIERDA - Detalles del producto */}
              <div className="p-6 space-y-4 border-r">
                <div>
                  <Badge className="bg-green-500 text-white mb-2">Disponible</Badge>
                  <h2 className="text-xl font-bold">{selectedProduct.bottleType}</h2>
                  <p className="text-sm text-muted-foreground">Vendedor: {selectedProduct.seller}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipo de Plástico</span>
                    <span className="font-medium">{selectedProduct.bottleType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cantidad</span>
                    <span className="font-medium">{selectedProduct.quantity.toLocaleString()} botellas</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Precio por unidad</span>
                    <span className="font-bold text-primary">${selectedProduct.price}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-muted-foreground">Total estimado</span>
                    <span className="font-bold text-lg text-primary">
                      ${(selectedProduct.quantity * selectedProduct.price).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4 text-primary" />
                  <span>{selectedProduct.location}</span>
                </div>

                {selectedProduct.description && (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-muted-foreground">
                    {selectedProduct.description}
                  </div>
                )}

                <Button
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => handleContactWhatsApp(selectedProduct)}
                >
                  <MessageCircle className="size-4 mr-2" />
                  Contactar por WhatsApp
                </Button>
              </div>

              {/* DERECHA - Opciones de auth */}
              <div className="p-6 space-y-4 bg-gray-50 flex flex-col justify-center">
                <div className="text-center space-y-2">
                  <ShoppingCart className="size-10 text-primary mx-auto" />
                  <h3 className="text-lg font-semibold">¿Quieres comprar?</h3>
                  <p className="text-sm text-muted-foreground">
                    Inicia sesión o crea una cuenta para realizar la compra y acceder a todas las funciones
                  </p>
                </div>

                <div className="space-y-3">
                  <Link to="/auth" className="block">
                    <Button className="w-full bg-primary hover:bg-green-600" size="lg">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/auth" className="block">
                    <Button variant="outline" className="w-full" size="lg">
                      Crear Cuenta Nueva
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full" onClick={() => setShowProductModal(false)}>
                    Cancelar
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground pt-2 border-t">
                  Al continuar, aceptas nuestros términos de servicio y política de privacidad
                </p>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}