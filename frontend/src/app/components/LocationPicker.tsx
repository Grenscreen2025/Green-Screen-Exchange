import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Label } from "./ui/label";

export interface LocationData {
  pais: string;
  departamento: string;
  ciudad: string;
  latitud: number | null;
  longitud: number | null;
  moneda: string;
}

interface Props {
  onChange: (data: LocationData) => void;
}

const MONEDAS: Record<string, string> = {
  Colombia: "COP",
  Venezuela: "VES",
  Ecuador: "USD",
  Peru: "PEN",
  México: "MXN",
  Argentina: "ARS",
  Chile: "CLP",
  Brasil: "BRL",
  Bolivia: "BOB",
  Paraguay: "PYG",
  Uruguay: "UYU",
  Panamá: "PAB",
  "Costa Rica": "CRC",
  Guatemala: "GTQ",
  Honduras: "HNL",
  "El Salvador": "USD",
  "República Dominicana": "DOP",
};

function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom]);
  return null;
}

const API_KEY = "b7744cb1f6d720120baf2130c8f232e86c5baa721afb2c52ea3e9e687242772b";
const headers = { "X-CSCAPI-KEY": API_KEY };

const selectClass =
  "w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500";

export function LocationPicker({ onChange }: Props) {
  const [paises, setPaises] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [ciudades, setCiudades] = useState<any[]>([]);

  const [paisSel, setPaisSel] = useState("");
  const [paisNombre, setPaisNombre] = useState("");
  const [depSel, setDepSel] = useState("");
  const [depNombre, setDepNombre] = useState("");
  const [ciudadNombre, setCiudadNombre] = useState("");

  const [mapCenter, setMapCenter] = useState<[number, number]>([
    4.5709, -74.2973,
  ]);
  const [mapZoom, setMapZoom] = useState(4);
  const [marker, setMarker] = useState<[number, number] | null>(null);

  // Buscador
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const busquedaTimer = useRef<any>(null);

  useEffect(() => {
    fetch("https://api.countrystatecity.in/v1/countries", { headers })
      .then((r) => r.json())
      .then((data) => setPaises(Array.isArray(data) ? data : []))
      .catch(() =>
        setPaises([
          {
            name: "Colombia",
            iso2: "CO",
            latitude: "4.5709",
            longitude: "-74.2973",
          },
          {
            name: "Ecuador",
            iso2: "EC",
            latitude: "-1.8312",
            longitude: "-78.1834",
          },
          {
            name: "Peru",
            iso2: "PE",
            latitude: "-9.1900",
            longitude: "-75.0152",
          },
          {
            name: "México",
            iso2: "MX",
            latitude: "23.6345",
            longitude: "-102.5528",
          },
          {
            name: "Argentina",
            iso2: "AR",
            latitude: "-38.4161",
            longitude: "-63.6167",
          },
          {
            name: "Chile",
            iso2: "CL",
            latitude: "-35.6751",
            longitude: "-71.5430",
          },
          {
            name: "Venezuela",
            iso2: "VE",
            latitude: "6.4238",
            longitude: "-66.5897",
          },
          {
            name: "Bolivia",
            iso2: "BO",
            latitude: "-16.2902",
            longitude: "-63.5887",
          },
        ]),
      );
  }, []);

  const handlePais = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const iso = e.target.value;
    const selected = paises.find((p) => p.iso2 === iso);
    if (!selected) return;
    setPaisSel(iso);
    setPaisNombre(selected.name);
    setDepSel("");
    setDepNombre("");
    setCiudadNombre("");
    setDepartamentos([]);
    setCiudades([]);
    setMarker(null);
    setSugerencias([]);
    setBusqueda("");
    const lat = parseFloat(selected.latitude || "4.5709");
    const lng = parseFloat(selected.longitude || "-74.2973");
    setMapCenter([lat, lng]);
    setMapZoom(5);
    const res = await fetch(
      `https://api.countrystatecity.in/v1/countries/${iso}/states`,
      { headers },
    );
    const data = await res.json();
    setDepartamentos(Array.isArray(data) ? data : []);
    onChange({
      pais: selected.name,
      departamento: "",
      ciudad: "",
      latitud: null,
      longitud: null,
      moneda: MONEDAS[selected.name] || "USD",
    });
  };

  const handleDep = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const iso = e.target.value;
    const selected = departamentos.find((d) => d.iso2 === iso);
    if (!selected) return;
    setDepSel(iso);
    setDepNombre(selected.name);
    setCiudadNombre("");
    setCiudades([]);
    setMarker(null);
    setSugerencias([]);
    setBusqueda("");
    const lat = parseFloat(selected.latitude || mapCenter[0].toString());
    const lng = parseFloat(selected.longitude || mapCenter[1].toString());
    setMapCenter([lat, lng]);
    setMapZoom(8);
    const res = await fetch(
      `https://api.countrystatecity.in/v1/countries/${paisSel}/states/${iso}/cities`,
      { headers },
    );
    const data = await res.json();
    setCiudades(Array.isArray(data) ? data : []);
    onChange({
      pais: paisNombre,
      departamento: selected.name,
      ciudad: "",
      latitud: null,
      longitud: null,
      moneda: MONEDAS[paisNombre] || "USD",
    });
  };

  const handleCiudad = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nombre = e.target.value;
    const selected = ciudades.find((c) => c.name === nombre);
    if (!selected) return;
    setCiudadNombre(nombre);
    const lat = parseFloat(selected.latitude || mapCenter[0].toString());
    const lng = parseFloat(selected.longitude || mapCenter[1].toString());
    setMapCenter([lat, lng]);
    setMapZoom(13);
    setMarker([lat, lng]);
    setSugerencias([]);
    setBusqueda("");
    onChange({
      pais: paisNombre,
      departamento: depNombre,
      ciudad: nombre,
      latitud: lat,
      longitud: lng,
      moneda: MONEDAS[paisNombre] || "USD",
    });
  };

  // Buscador con Nominatim
  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setBusqueda(q);
    if (busquedaTimer.current) clearTimeout(busquedaTimer.current);
    if (q.length < 3) {
      setSugerencias([]);
      return;
    }
    setBuscando(true);
    busquedaTimer.current = setTimeout(async () => {
      const ciudad = ciudadNombre || depNombre || paisNombre;
      const query = `${q}, ${ciudad}, ${paisNombre}`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=es`;
      const res = await fetch(url, { headers: { "Accept-Language": "es" } });
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
    setBusqueda(item.display_name.split(",")[0]);
    setSugerencias([]);
    onChange({
      pais: paisNombre,
      departamento: depNombre,
      ciudad: ciudadNombre || item.display_name.split(",")[0],
      latitud: lat,
      longitud: lng,
      moneda: MONEDAS[paisNombre] || "USD",
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {/* COLUMNA IZQUIERDA - Selectores + Buscador */}
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label>País</Label>
          <select className={selectClass} onChange={handlePais} defaultValue="">
            <option value="" disabled>
              Selecciona un país
            </option>
            {paises.map((p) => (
              <option key={p.iso2} value={p.iso2}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Departamento / Estado</Label>
          <select
            className={selectClass}
            onChange={handleDep}
            defaultValue=""
            disabled={departamentos.length === 0}
          >
            <option value="" disabled>
              {departamentos.length === 0
                ? "Selecciona un país primero"
                : "Selecciona un departamento"}
            </option>
            {departamentos.map((d) => (
              <option key={d.iso2} value={d.iso2}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Ciudad / Municipio</Label>
          <select
            className={selectClass}
            onChange={handleCiudad}
            defaultValue=""
            disabled={ciudades.length === 0}
          >
            <option value="" disabled>
              {ciudades.length === 0
                ? "Selecciona un departamento primero"
                : "Selecciona una ciudad"}
            </option>
            {ciudades.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Buscador de lugares */}
        {ciudadNombre && (
          <div className="space-y-2">
            <Label>Buscar lugar específico</Label>
            <div className="relative">
              <input
                type="text"
                value={busqueda}
                onChange={handleBusqueda}
                placeholder={`Ej: parque, hospital, universidad en ${ciudadNombre}...`}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {buscando && (
                <div className="absolute right-3 top-2 text-xs text-muted-foreground">
                  Buscando...
                </div>
              )}
              {sugerencias.length > 0 && (
                <div className="absolute z-50 w-full bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {sugerencias.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => seleccionarSugerencia(s)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 border-b last:border-0 truncate"
                    >
                      📍 {s.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* COLUMNA DERECHA - Mapa grande */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium text-muted-foreground">
          {ciudadNombre
            ? `📍 ${ciudadNombre}`
            : depNombre
              ? `📍 ${depNombre}`
              : paisNombre
                ? `📍 ${paisNombre}`
                : "📍 Mapa"}
        </Label>
        <div
          className="rounded-lg overflow-hidden border border-green-100"
          style={{ height: "350px" }}
        >
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapController center={mapCenter} zoom={mapZoom} />
            {marker && <Marker position={marker} />}
          </MapContainer>
        </div>
        {marker && (
          <p className="text-xs text-muted-foreground text-center">
            📍 {marker[0].toFixed(6)}, {marker[1].toFixed(6)}
          </p>
        )}
      </div>
    </div>
  );
}
