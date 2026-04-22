import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Star, Package, MapPin } from 'lucide-react';
import { supabase } from './supabaseClient';
import L from 'leaflet';

// Íconos personalizados según calificación
const getMarkerIcon = (calificacion: number) => {
  const color = calificacion >= 4 ? '#16a34a' : calificacion >= 3 ? '#f59e0b' : '#ef4444';
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 11px;">
          ${calificacion > 0 ? calificacion.toFixed(1) : '★'}
        </span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

interface Vendedor {
  id_usuario: number;
  nombre: string;
  tipo_usuario: string;
  ciudad_base: string;
  pais: string;
  calificacion_promedio: number;
  total_calificaciones: number;
  total_publicaciones: number;
  latitud: number;
  longitud: number;
}

export function MapaVendedores() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const userPais = localStorage.getItem('userPais') || 'Colombia';

  // Centro del mapa según país del usuario
  const CENTROS: Record<string, [number, number]> = {
    Colombia: [4.5709, -74.2973],
    Ecuador: [-1.8312, -78.1834],
    Peru: [-9.1900, -75.0152],
    México: [23.6345, -102.5528],
    Argentina: [-38.4161, -63.6167],
    Chile: [-35.6751, -71.5430],
  };

  const mapCenter = CENTROS[userPais] || [4.5709, -74.2973];

  useEffect(() => {
    cargarVendedores();
  }, []);

  const cargarVendedores = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id_usuario,
        nombre,
        tipo_usuario,
        ciudad_base,
        pais,
        calificacion_promedio,
        total_calificaciones
      `)
      .gt('total_calificaciones', 0)
      .order('calificacion_promedio', { ascending: false });

    if (error) {
      console.error('Error:', error);
      setLoading(false);
      return;
    }

    // Obtener coordenadas por ciudad usando Nominatim
    const vendedoresConCoords = await Promise.all(
      (data || []).map(async (v: any) => {
        try {
          const query = `${v.ciudad_base}, ${v.pais}`;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
          );
          const coords = await res.json();
          if (coords && coords[0]) {
            return {
              ...v,
              latitud: parseFloat(coords[0].lat),
              longitud: parseFloat(coords[0].lon),
              total_publicaciones: 0,
            };
          }
        } catch {}
        return null;
      })
    );

    setVendedores(vendedoresConCoords.filter(Boolean) as Vendedor[]);
    setLoading(false);
  };

  const renderEstrellas = (calificacion: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`size-4 ${i < Math.round(calificacion) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Cargando mapa de vendedores...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="size-5 text-primary" />
        <h2 className="text-xl font-semibold">Mapa de Vendedores</h2>
        <span className="text-sm text-muted-foreground ml-2">
          {vendedores.length} vendedores con calificación
        </span>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="size-3 rounded-full bg-green-600"></div>
          <span>4-5 estrellas</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-3 rounded-full bg-amber-500"></div>
          <span>3-4 estrellas</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-3 rounded-full bg-red-500"></div>
          <span>1-3 estrellas</span>
        </div>
      </div>

      {/* Mapa */}
      <div className="rounded-lg overflow-hidden border border-green-100" style={{ height: '500px' }}>
        <MapContainer center={mapCenter} zoom={6} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {vendedores.map((v) => (
            <Marker
              key={v.id_usuario}
              position={[v.latitud, v.longitud]}
              icon={getMarkerIcon(v.calificacion_promedio)}
            >
              <Popup>
                <div className="space-y-2 min-w-[200px]">
                  <div className="font-semibold text-base">{v.nombre}</div>
                  <div className="text-xs text-gray-500">
                    {v.tipo_usuario === 'recycler' ? '♻️ Reciclador' : '🏭 Centro de Acopio'}
                  </div>
                  <div className="flex items-center gap-1">
                    {renderEstrellas(v.calificacion_promedio)}
                    <span className="text-sm font-medium ml-1">
                      {v.calificacion_promedio.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {v.total_calificaciones} calificaciones
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="size-3" />
                    {v.ciudad_base}, {v.pais}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Ranking top vendedores */}
      {vendedores.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            🏆 Top Vendedores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {vendedores.slice(0, 3).map((v, i) => (
              <div key={v.id_usuario} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <div className={`size-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                  ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{v.nombre}</div>
                  <div className="flex items-center gap-1">
                    <Star className="size-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-muted-foreground">
                      {v.calificacion_promedio.toFixed(1)} ({v.total_calificaciones})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {vendedores.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Star className="size-12 mx-auto mb-2 opacity-30" />
          <p>Aún no hay vendedores calificados</p>
          <p className="text-sm">Las calificaciones aparecerán aquí después de las primeras transacciones</p>
        </div>
      )}
    </div>
  );
}