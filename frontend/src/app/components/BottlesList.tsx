import { useState } from 'react';
import { Search, Filter, Package, MapPin, DollarSign, User, Building2, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface BottleListing {
  id: number;
  seller: string;
  sellerType: 'recycler' | 'center';
  quantity: number;
  bottleType: string;
  pricePerUnit: number;
  location: string;
  description: string;
  postedDate: string;
}

export function BottlesList() {
  const userType = localStorage.getItem('userType') || 'recycler';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const [listings] = useState<BottleListing[]>([
    {
      id: 1,
      seller: 'Juan Pérez',
      sellerType: 'recycler',
      quantity: 500,
      bottleType: 'PET (Polietileno Tereftalato)',
      pricePerUnit: 1.50,
      location: 'Santiago, Región Metropolitana',
      description: 'Botellas PET limpias y comprimidas, listas para recolección',
      postedDate: '2026-02-10',
    },
    {
      id: 2,
      seller: 'EcoAcopio Central',
      sellerType: 'center',
      quantity: 1000,
      bottleType: 'HDPE (Polietileno de Alta Densidad)',
      pricePerUnit: 1.80,
      location: 'Valparaíso, Región de Valparaíso',
      description: 'Solicitud de compra de botellas HDPE en buen estado',
      postedDate: '2026-02-09',
    },
    {
      id: 3,
      seller: 'María González',
      sellerType: 'recycler',
      quantity: 300,
      bottleType: 'PET (Polietileno Tereftalato)',
      pricePerUnit: 1.40,
      location: 'Concepción, Región del Biobío',
      description: 'Botellas PET transparentes, clasificadas por tamaño',
      postedDate: '2026-02-08',
    },
    {
      id: 4,
      seller: 'Verde Futuro SA',
      sellerType: 'center',
      quantity: 800,
      bottleType: 'PP (Polipropileno)',
      pricePerUnit: 1.60,
      location: 'La Serena, Región de Coquimbo',
      description: 'Compramos botellas PP, pago inmediato al recibir',
      postedDate: '2026-02-07',
    },
    {
      id: 5,
      seller: 'Carlos Rodríguez',
      sellerType: 'recycler',
      quantity: 650,
      bottleType: 'HDPE (Polietileno de Alta Densidad)',
      pricePerUnit: 1.70,
      location: 'Temuco, Región de La Araucanía',
      description: 'Botellas de productos de limpieza, sin etiquetas',
      postedDate: '2026-02-06',
    },
    {
      id: 6,
      seller: 'Recicladores Unidos',
      sellerType: 'center',
      quantity: 2000,
      bottleType: 'PET (Polietileno Tereftalato)',
      pricePerUnit: 1.55,
      location: 'Antofagasta, Región de Antofagasta',
      description: 'Gran demanda de PET, ofrecemos mejor precio del mercado',
      postedDate: '2026-02-05',
    },
  ]);

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = 
      listing.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.bottleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || listing.bottleType.toLowerCase().includes(selectedType.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || listing.location.includes(selectedLocation);

    return matchesSearch && matchesType && matchesLocation;
  });

  const bottleTypes = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'pet', label: 'PET' },
    { value: 'hdpe', label: 'HDPE' },
    { value: 'pp', label: 'PP' },
  ];

  const locations = [
    { value: 'all', label: 'Todas las ubicaciones' },
    { value: 'Santiago', label: 'Santiago' },
    { value: 'Valparaíso', label: 'Valparaíso' },
    { value: 'Concepción', label: 'Concepción' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Botellas Disponibles</h1>
        <p className="text-muted-foreground mt-2">
          {userType === 'recycler' 
            ? 'Encuentra centros de acopio interesados en comprar tus botellas'
            : 'Descubre ofertas de recicladores con botellas disponibles'}
        </p>
      </div>

      {/* Filters */}
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5 text-primary" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
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

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Plástico</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {bottleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ubicación</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredListings.length} de {listings.length} resultados
        </p>
        {(searchQuery || selectedType !== 'all' || selectedLocation !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedLocation('all');
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Listings Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="border-green-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {listing.sellerType === 'recycler' ? (
                      <User className="size-4 text-primary" />
                    ) : (
                      <Building2 className="size-4 text-primary" />
                    )}
                    <CardTitle className="text-lg">{listing.seller}</CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {listing.location}
                  </CardDescription>
                </div>
                <Badge variant={listing.sellerType === 'recycler' ? 'default' : 'secondary'}>
                  {listing.sellerType === 'recycler' ? 'Reciclador' : 'Centro de Acopio'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="size-4 text-primary" />
                    <span className="text-sm font-medium">Cantidad</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {listing.quantity.toLocaleString()} botellas
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Tipo de Plástico</span>
                  <span className="text-sm text-foreground">{listing.bottleType}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="size-4 text-blue-600" />
                    <span className="text-sm font-medium">Precio por unidad</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    ${listing.pricePerUnit.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Total estimado</div>
                  <div className="text-xl font-bold text-amber-700">
                    ${(listing.quantity * listing.pricePerUnit).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">{listing.description}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  Publicado: {new Date(listing.postedDate).toLocaleDateString('es-ES')}
                </span>
                <Button size="sm" className="bg-primary hover:bg-green-600">
                  <MessageCircle className="size-4 mr-2" />
                  Contactar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredListings.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-muted-foreground mb-4">
              Intenta ajustar tus filtros de búsqueda
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedLocation('all');
              }}
            >
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
