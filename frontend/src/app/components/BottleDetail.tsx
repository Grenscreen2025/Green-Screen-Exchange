import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  MapPin, 
  Calendar,
  User,
  Building2,
  Shield,
  Award,
  MessageCircle,
  Heart,
  Eye,
  ShoppingCart,
  Info
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface BottleDetailData {
  id: number;
  seller: string;
  sellerType: 'recycler' | 'center';
  quantity: number;
  bottleType: string;
  pricePerUnit: number;
  location: string;
  description: string;
  postedDate: string;
  condition: string;
  views: number;
  interested: number;
  rating: number;
  verified: boolean;
}

export function BottleDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bottleId = searchParams.get('id') || '1';
  const userType = localStorage.getItem('userType') || 'recycler';
  const isRecycler = userType === 'recycler';

  // Datos simulados - en producción vendrían de una API
  const [bottleData] = useState<BottleDetailData>({
    id: parseInt(bottleId),
    seller: 'María González',
    sellerType: 'recycler',
    quantity: 500,
    bottleType: 'PET (Polietileno Tereftalato)',
    pricePerUnit: 1.50,
    location: 'Bogotá, Cundinamarca',
    description: 'Botellas PET completamente limpias y clasificadas. Han sido procesadas siguiendo los estándares de calidad más altos. Listas para recolección inmediata. Las botellas están comprimidas para optimizar el transporte. Todas son transparentes y sin etiquetas.',
    postedDate: '2026-02-20',
    condition: 'Excelente - Limpias y comprimidas',
    views: 127,
    interested: 23,
    rating: 4.8,
    verified: true,
  });

  const totalPrice = bottleData.quantity * bottleData.pricePerUnit;

  const handlePurchase = () => {
    navigate(`/purchase-confirm?id=${bottleId}`);
  };

  const handleContact = () => {
    alert('Función de mensajería en desarrollo. En producción, esto abriría un chat con el vendedor.');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/bottles')}
        className="gap-2"
      >
        <ArrowLeft className="size-4" />
        Volver al listado
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card className="border-green-100">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="size-6 text-primary" />
                    <CardTitle className="text-2xl">
                      {bottleData.bottleType}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4" />
                    <span>{bottleData.location}</span>
                  </div>
                </div>
                <Badge className="bg-green-600 hover:bg-green-700">
                  Disponible
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Eye className="size-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Vistas</div>
                    <div className="font-semibold text-foreground">{bottleData.views}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Heart className="size-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Interesados</div>
                    <div className="font-semibold text-foreground">{bottleData.interested}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Detalles de la Oferta</h3>
                
                <div className="grid gap-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Cantidad</span>
                    <span className="font-semibold text-foreground">
                      {bottleData.quantity.toLocaleString()} botellas
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Tipo de Plástico</span>
                    <span className="font-semibold text-foreground">{bottleData.bottleType}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Condición</span>
                    <span className="font-semibold text-foreground">{bottleData.condition}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Fecha de publicación</span>
                    <span className="font-semibold text-foreground">
                      {new Date(bottleData.postedDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Descripción</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {bottleData.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="border-blue-100 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-blue-900">Información Importante</p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Verifica las condiciones antes de confirmar la compra</li>
                    <li>Coordina con el vendedor el lugar y hora de entrega</li>
                    <li>Revisa que el material cumpla con tus estándares de calidad</li>
                    <li>El pago se realiza directamente con el vendedor</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <Card className="border-green-100 sticky top-6">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Precio por unidad</CardTitle>
              <div className="text-3xl font-bold text-primary">
                ${bottleData.pricePerUnit.toFixed(2)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Total estimado</div>
                <div className="text-2xl font-bold text-green-700">
                  ${totalPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {bottleData.quantity} botellas × ${bottleData.pricePerUnit}
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              {!isRecycler ? (
                <Button 
                  className="w-full bg-primary hover:bg-green-600"
                  size="lg"
                  onClick={handlePurchase}
                >
                  <ShoppingCart className="size-4 mr-2" />
                  Proceder a Comprar
                </Button>
              ) : (
                <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    Como reciclador, no puedes comprar esta oferta
                  </p>
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleContact}
              >
                <MessageCircle className="size-4 mr-2" />
                Contactar Vendedor
              </Button>
            </CardContent>
          </Card>

          {/* Seller Card */}
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-sm">Publicado por</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {bottleData.seller.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    {bottleData.seller}
                    {bottleData.verified && (
                      <Shield className="size-4 text-blue-500" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    {bottleData.sellerType === 'recycler' ? (
                      <>
                        <User className="size-3" />
                        Reciclador
                      </>
                    ) : (
                      <>
                        <Building2 className="size-3" />
                        Centro de Acopio
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Calificación</span>
                  <div className="flex items-center gap-1">
                    <Award className="size-4 text-yellow-500" />
                    <span className="font-semibold">{bottleData.rating}</span>
                    <span className="text-sm text-muted-foreground">/5.0</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <Badge variant="default" className="bg-blue-500">
                    <Shield className="size-3 mr-1" />
                    Verificado
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ubicación</span>
                  <span className="text-sm font-medium">{bottleData.location.split(',')[0]}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
