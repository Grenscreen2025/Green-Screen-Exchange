import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  MapPin,
  User,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Truck,
  Shield
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner';

interface PurchaseData {
  id: number;
  seller: string;
  quantity: number;
  bottleType: string;
  pricePerUnit: number;
  location: string;
}

export function PurchaseConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bottleId = searchParams.get('id') || '1';
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [purchaseData] = useState<PurchaseData>({
    id: parseInt(bottleId),
    seller: 'María González',
    quantity: 500,
    bottleType: 'PET (Polietileno Tereftalato)',
    pricePerUnit: 1.50,
    location: 'Bogotá, Cundinamarca',
  });

  const [formData, setFormData] = useState({
    paymentMethod: 'cash',
    deliveryDate: '',
    deliveryAddress: '',
    notes: '',
  });

  const totalPrice = purchaseData.quantity * purchaseData.pricePerUnit;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirmPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simular procesamiento
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      toast.success('¡Compra confirmada exitosamente!');

      // Redirigir al dashboard después de 3 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }, 1500);
  };

  // Success Screen
  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-100 text-center">
          <CardContent className="pt-12 pb-12">
            <div className="size-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="size-16 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              ¡Compra Confirmada!
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Tu solicitud de compra ha sido enviada al vendedor. 
              Recibirás una notificación cuando confirme la transacción.
            </p>

            {/* Order Summary */}
            <div className="max-w-md mx-auto mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cantidad</span>
                  <span className="font-semibold">{purchaseData.quantity} botellas</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-semibold">{purchaseData.bottleType}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${totalPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Redirigiendo al dashboard en 3 segundos...
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-primary hover:bg-green-600"
              >
                Ir al Dashboard Ahora
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(`/bottle-detail?id=${bottleId}`)}
        className="gap-2"
      >
        <ArrowLeft className="size-4" />
        Volver al detalle
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Confirmar Compra</h1>
        <p className="text-muted-foreground mt-2">
          Revisa los detalles y confirma tu compra
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchase Details */}
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5 text-primary" />
                Detalles de la Compra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Vendedor</span>
                  <span className="font-semibold text-foreground">{purchaseData.seller}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Tipo de Plástico</span>
                  <span className="font-semibold text-foreground">{purchaseData.bottleType}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Cantidad</span>
                  <span className="font-semibold text-foreground">
                    {purchaseData.quantity.toLocaleString()} botellas
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Precio por unidad</span>
                  <span className="font-semibold text-foreground">
                    ${purchaseData.pricePerUnit.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Ubicación del vendedor</span>
                  <span className="font-semibold text-foreground">{purchaseData.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="size-5 text-primary" />
                Información de Entrega
              </CardTitle>
              <CardDescription>
                Coordina los detalles de entrega con el vendedor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConfirmPurchase} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Fecha de Recolección Preferida</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id="deliveryDate"
                      type="date"
                      className="pl-10"
                      value={formData.deliveryDate}
                      onChange={(e) => handleChange('deliveryDate', e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Dirección de Entrega</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id="deliveryAddress"
                      type="text"
                      placeholder="Calle, número, ciudad..."
                      className="pl-10"
                      value={formData.deliveryAddress}
                      onChange={(e) => handleChange('deliveryAddress', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Instrucciones especiales, horarios preferidos, etc..."
                    className="min-h-[100px]"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5 text-primary" />
                Método de Pago
              </CardTitle>
              <CardDescription>
                Selecciona cómo realizarás el pago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={formData.paymentMethod} onValueChange={(value) => handleChange('paymentMethod', value)}>
                <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-green-50 transition-colors">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex-1 cursor-pointer">
                    <div className="font-medium">Efectivo al Recibir</div>
                    <div className="text-sm text-muted-foreground">Pago en efectivo al momento de la entrega</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-green-50 transition-colors">
                  <RadioGroupItem value="transfer" id="transfer" />
                  <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                    <div className="font-medium">Transferencia Bancaria</div>
                    <div className="text-sm text-muted-foreground">Coordinar transferencia con el vendedor</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-green-50 transition-colors">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="flex-1 cursor-pointer">
                    <div className="font-medium">Otro Método</div>
                    <div className="text-sm text-muted-foreground">A coordinar directamente con el vendedor</div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Warning */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-amber-900">Importante</p>
                  <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                    <li>Esta es una solicitud de compra que debe ser confirmada por el vendedor</li>
                    <li>Coordina directamente con el vendedor los detalles finales</li>
                    <li>Verifica el material antes de realizar el pago completo</li>
                    <li>Mercado Verde facilita la conexión pero no procesa pagos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/bottle-detail?id=${bottleId}`)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmPurchase}
              className="flex-1 bg-primary hover:bg-green-600"
              disabled={isProcessing}
            >
              {isProcessing ? 'Procesando...' : 'Confirmar Compra'}
            </Button>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div>
          <Card className="border-green-100 sticky top-6">
            <CardHeader>
              <CardTitle>Resumen de Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cantidad</span>
                  <span className="font-medium">{purchaseData.quantity} botellas</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Precio/unidad</span>
                  <span className="font-medium">${purchaseData.pricePerUnit}</span>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total a Pagar</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${totalPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Shield className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Compra Protegida</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Tu transacción está respaldada por nuestras políticas de seguridad
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
