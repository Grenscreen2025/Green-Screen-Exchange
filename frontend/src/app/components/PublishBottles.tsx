import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, DollarSign, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function PublishBottles() {
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType') || 'recycler';
  const isRecycler = userType === 'recycler';

  const [formData, setFormData] = useState({
    quantity: '',
    bottleType: '',
    pricePerUnit: '',
    description: '',
    location: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/bottles');
    }, 2000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const bottleTypes = [
    { value: 'pet', label: 'PET (Polietileno Tereftalato)' },
    { value: 'hdpe', label: 'HDPE (Polietileno de Alta Densidad)' },
    { value: 'pvc', label: 'PVC (Policloruro de Vinilo)' },
    { value: 'ldpe', label: 'LDPE (Polietileno de Baja Densidad)' },
    { value: 'pp', label: 'PP (Polipropileno)' },
    { value: 'ps', label: 'PS (Poliestireno)' },
  ];

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-100 text-center">
          <CardContent className="pt-12 pb-12">
            <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="size-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              ¡Publicación Exitosa!
            </h2>
            <p className="text-muted-foreground mb-6">
              Tu {isRecycler ? 'oferta' : 'solicitud'} de botellas ha sido publicada correctamente
            </p>
            <div className="text-sm text-muted-foreground">
              Redirigiendo al listado de botellas...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isRecycler ? 'Publicar Botellas para Venta' : 'Publicar Solicitud de Compra'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isRecycler 
            ? 'Ofrece tus botellas reciclables a centros de acopio'
            : 'Publica los tipos de botellas que deseas comprar'}
        </p>
      </div>

      {/* Form Card */}
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="size-5 text-primary" />
            Información de la Publicación
          </CardTitle>
          <CardDescription>
            Completa los detalles para {isRecycler ? 'vender' : 'comprar'} botellas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Cantidad de Botellas
              </Label>
              <div className="relative">
                <Package className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Ej: 500"
                  className="pl-10"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  required
                  min="1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Especifica la cantidad total de botellas
              </p>
            </div>

            {/* Bottle Type */}
            <div className="space-y-2">
              <Label htmlFor="bottleType">
                Tipo de Plástico
              </Label>
              <Select value={formData.bottleType} onValueChange={(value) => handleChange('bottleType', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de plástico" />
                </SelectTrigger>
                <SelectContent>
                  {bottleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Identifica el tipo de plástico según su código de reciclaje
              </p>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">
                Precio por Unidad (USD)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Ej: 1.50"
                  className="pl-10"
                  value={formData.pricePerUnit}
                  onChange={(e) => handleChange('pricePerUnit', e.target.value)}
                  required
                  min="0.01"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Precio sugerido por botella
              </p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">
                Ubicación
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="Ej: Ciudad, Región"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Indica tu ubicación para facilitar la coordinación
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción Adicional
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Textarea
                  id="description"
                  placeholder="Agrega detalles adicionales sobre el estado, limpieza, o condiciones especiales..."
                  className="pl-10 min-h-[120px]"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </div>
            </div>

            {/* Summary Card */}
            {formData.quantity && formData.pricePerUnit && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Estimado</div>
                      <div className="text-2xl font-bold text-primary">
                        ${(parseFloat(formData.quantity) * parseFloat(formData.pricePerUnit)).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {formData.quantity} botellas × ${formData.pricePerUnit}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-green-600"
              >
                Publicar {isRecycler ? 'Oferta' : 'Solicitud'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-100 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-blue-600">ℹ️</div>
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Consejos para una mejor publicación:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Asegúrate de clasificar correctamente el tipo de plástico</li>
                <li>Indica si las botellas están limpias y comprimidas</li>
                <li>Sé realista con los precios para atraer más interesados</li>
                <li>Mantén tu ubicación actualizada para facilitar el intercambio</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}