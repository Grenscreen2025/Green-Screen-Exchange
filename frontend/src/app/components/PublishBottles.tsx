import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Package, DollarSign, FileText, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { toast } from 'sonner';
import { supabase } from './supabaseClient';

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { duration: 1.5 }); }, [center, zoom]);
  return null;
}

export function PublishBottles() {
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType') || 'recycler';
  const moneda = localStorage.getItem('userMoneda') || 'COP';
  const isRecycler = userType === 'recycler';

  const [formData, setFormData] = useState({
    quantity: '',
    bottleType: '',
    pricePerUnit: '',
    description: '',
    titulo: '',
  });

  const [mapCenter, setMapCenter] = useState<[number, number]>([4.5709, -74.2973]);
  const [mapZoom, setMapZoom] = useState(5);
  const [marker, setMarker] = useState<[number, number] | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [ubicacionNombre, setUbicacionNombre] = useState('');
  const busquedaTimer = useRef<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const bottleTypes = [
    { value: 'pet', label: 'PET (Polietileno Tereftalato)' },
    { value: 'hdpe', label: 'HDPE (Polietileno de Alta Densidad)' },
    { value: 'pvc', label: 'PVC (Policloruro de Vinilo)' },
    { value: 'ldpe', label: 'LDPE (Polietileno de Baja Densidad)' },
    { value: 'pp', label: 'PP (Polipropileno)' },
    { value: 'ps', label: 'PS (Poliestireno)' },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setBusqueda(q);
    if (busquedaTimer.current) clearTimeout(busquedaTimer.current);
    if (q.length < 3) { setSugerencias([]); return; }
    setBuscando(true);
    busquedaTimer.current = setTimeout(async () => {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&accept-language=es`;
      const res = await fetch(url);
      const data = await res.json();
      setSugerencias(data);
      setBuscando(false);
    }, 600);
  };

  const seleccionarSugerencia = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setMapCenter([lat, lng]);
    setMapZoom(17);
    setMarker([lat, lng]);
    setUbicacionNombre(item.display_name.split(',').slice(0, 2).join(','));
    setBusqueda(item.display_name.split(',')[0]);
    setSugerencias([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Debes iniciar sesión'); setLoading(false); return; }

    const { error } = await supabase.from('publicaciones').insert({
      id_usuario: user.id,
      cantidad: parseInt(formData.quantity),
      precio_por_unidad: parseFloat(formData.pricePerUnit),
      descripcion: formData.description,
      titulo: formData.titulo || `${formData.bottleType} - ${formData.quantity} unidades`,
      estado: 'activa',
      moneda,
      fecha_publicacion: new Date().toISOString().split('T')[0],
    });

    if (error) {
      toast.error('Error al publicar: ' + error.message);
      setLoading(false);
      return;
    }

    setShowSuccess(true);
    setLoading(false);
    setTimeout(() => navigate('/bottles'), 2000);
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-100 text-center">
          <CardContent className="pt-12 pb-12">
            <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="size-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">¡Publicación Exitosa!</h2>
            <p className="text-muted-foreground mb-6">
              Tu {isRecycler ? 'oferta' : 'solicitud'} de botellas ha sido publicada correctamente
            </p>
            <div className="text-sm text-muted-foreground">Redirigiendo al listado de botellas...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isRecycler ? 'Publicar Botellas para Venta' : 'Publicar Solicitud de Compra'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isRecycler ? 'Ofrece tus botellas reciclables a centros de acopio' : 'Publica los tipos de botellas que deseas comprar'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* COLUMNA IZQUIERDA - Formulario */}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título de la publicación</Label>
                <Input
                  id="titulo"
                  placeholder="Ej: Botellas PET limpias disponibles"
                  value={formData.titulo}
                  onChange={(e) => handleChange('titulo', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad de Botellas</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Ej: 500"
                    className="pl-10"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    required min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Plástico</Label>
                <Select value={formData.bottleType} onValueChange={(v) => handleChange('bottleType', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecciona el tipo" /></SelectTrigger>
                  <SelectContent>
                    {bottleTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio por Unidad ({moneda})</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="Ej: 150"
                    className="pl-10"
                    value={formData.pricePerUnit}
                    onChange={(e) => handleChange('pricePerUnit', e.target.value)}
                    required min="0.01"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Precio en {moneda}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción Adicional</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Textarea
                    id="description"
                    placeholder="Estado, limpieza, condiciones especiales..."
                    className="pl-10 min-h-[100px]"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>
              </div>

              {formData.quantity && formData.pricePerUnit && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Estimado</div>
                        <div className="text-2xl font-bold text-primary">
                          {moneda} {(parseFloat(formData.quantity) * parseFloat(formData.pricePerUnit)).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {formData.quantity} × {moneda} {formData.pricePerUnit}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-green-600" disabled={loading}>
                  {loading ? 'Publicando...' : `Publicar ${isRecycler ? 'Oferta' : 'Solicitud'}`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* COLUMNA DERECHA - Mapa */}
        <div className="space-y-4">
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5 text-primary" />
                Ubicación de las Botellas
              </CardTitle>
              <CardDescription>
                Marca dónde están ubicadas las botellas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Buscador */}
              <div className="relative">
                <input
                  type="text"
                  value={busqueda}
                  onChange={handleBusqueda}
                  placeholder="Busca parque, barrio, dirección..."
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {buscando && <div className="absolute right-3 top-2 text-xs text-muted-foreground">Buscando...</div>}
                {sugerencias.length > 0 && (
                  <div className="absolute z-50 w-full bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {sugerencias.map((s, i) => (
                      <button key={i} type="button" onClick={() => seleccionarSugerencia(s)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 border-b last:border-0">
                        📍 {s.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mapa */}
              <div className="rounded-lg overflow-hidden border border-green-100" style={{ height: '380px' }}>
                <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapController center={mapCenter} zoom={mapZoom} />
                  {marker && <Marker position={marker} />}
                </MapContainer>
              </div>

              {ubicacionNombre && (
                <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                  📍 {ubicacionNombre}
                </p>
              )}
              {marker && (
                <p className="text-xs text-muted-foreground text-center">
                  {marker[0].toFixed(6)}, {marker[1].toFixed(6)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}