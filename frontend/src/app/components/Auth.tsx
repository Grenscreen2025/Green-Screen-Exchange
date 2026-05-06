import { LocationPicker } from "./LocationPicker";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Recycle, Mail, Lock, User, Building2, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "sonner";
import { supabase } from "./supabaseClient";

export function Auth() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error("Error al enviar el correo: " + error.message);
    } else {
      setResetSent(true);
      toast.success("Correo de recuperación enviado");
    }
    setLoading(false);
  };
  const [paisesReg, setPaisesReg] = useState<any[]>([]);
  const [depsReg, setDepsReg] = useState<any[]>([]);
  const [ciudadesReg, setCiudadesReg] = useState<any[]>([]);
  const [paisReg, setPaisReg] = useState("");
  const [paisIsoReg, setPaisIsoReg] = useState("");
  const [depReg, setDepReg] = useState("");
  const [ciudadReg, setCiudadReg] = useState("");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [userType, setUserType] = useState<"recycler" | "center">("recycler");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [locationData, setLocationData] = useState({
    pais: "",
    departamento: "",
    ciudad: "",
    latitud: null as number | null,
    longitud: null as number | null,
    moneda: "COP",
  });
  const MONEDAS_REG: Record<string, string> = {
    Colombia: "COP",
    Venezuela: "VES",
    Ecuador: "USD",
    Peru: "PEN",
    México: "MXN",
    Argentina: "ARS",
    Chile: "CLP",
  };

  useEffect(() => {
    fetch("https://api.countrystatecity.in/v1/countries", {
      headers: {
        "X-CSCAPI-KEY":
          "b7744cb1f6d720120baf2130c8f232e86c5baa721afb2c52ea3e9e687242772b",
      },
    })
      .then((r) => r.json())
      .then((d) => setPaisesReg(Array.isArray(d) ? d : []))
      .catch(() =>
        setPaisesReg([
          { name: "Colombia", iso2: "CO" },
          { name: "Ecuador", iso2: "EC" },
          { name: "Peru", iso2: "PE" },
          { name: "México", iso2: "MX" },
          { name: "Argentina", iso2: "AR" },
          { name: "Chile", iso2: "CL" },
          { name: "Venezuela", iso2: "VE" },
        ]),
      );
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("login-email") as HTMLInputElement)
      .value;
    const password = (
      form.elements.namedItem("login-password") as HTMLInputElement
    ).value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(
        error.message === "Email not confirmed"
          ? "Debes confirmar tu correo antes de iniciar sesión"
          : "Correo o contraseña incorrectos",
      );
      setLoading(false);
      return;
    }

    // Obtener datos reales desde tabla usuarios
    const { data: usuarioData } = await supabase
      .from("usuarios")
      .select("id_usuario, tipo_usuario, nombre, moneda, pais, ciudad_base")
      .eq("correo", data.user.email)
      .single();

    // Guardar id_usuario INTEGER no UUID
    localStorage.setItem("userId", usuarioData?.id_usuario?.toString() || "");
    localStorage.setItem("userEmail", data.user.email || "");
    localStorage.setItem("userName", usuarioData?.nombre || "");
    localStorage.setItem("userType", usuarioData?.tipo_usuario || "recycler");
    localStorage.setItem("userMoneda", usuarioData?.moneda || "COP");
    localStorage.setItem("userPais", usuarioData?.pais || "");
    localStorage.setItem("userCiudad", usuarioData?.ciudad_base || "");

    toast.success("¡Bienvenido!");
    navigate("/dashboard");
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const nombre = (
      form.elements.namedItem("register-name") as HTMLInputElement
    ).value;
    const correo = (
      form.elements.namedItem("register-email") as HTMLInputElement
    ).value;
    const password = (
      form.elements.namedItem("register-password") as HTMLInputElement
    ).value;
    const telefono = (
      form.elements.namedItem("register-phone") as HTMLInputElement
    ).value;

    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password,
      options: { data: { nombre, tipo: userType } },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Obtener el próximo id_usuario
      const { data: maxData } = await supabase
        .from("usuarios")
        .select("id_usuario")
        .order("id_usuario", { ascending: false })
        .limit(1)
        .single();

      const nextId = (maxData?.id_usuario || 0) + 1;

      const { error: insertError } = await supabase.from("usuarios").insert({
        id_usuario: nextId,
        nombre,
        correo,
        password,
        tipo_usuario: userType,
        telefono,
        pais: locationData.pais,
        ciudad_base: locationData.ciudad,
        moneda: locationData.moneda,
        fecha_registro: new Date().toISOString().split("T")[0],
      });

      if (insertError) {
        toast.error("Error al guardar usuario: " + insertError.message);
        setLoading(false);
        return;
      }
    }
    setShowConfirmation(true);
    setLoading(false);
  };

  const testLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "ana.morales4@mercadoverde.com",
      password: "12345678",
    });
    console.log("DATA:", data);
    console.log("ERROR:", error);
    alert(error ? error.message : "¡Login exitoso! " + data.user?.email);
  };

  /* ── Pantalla de confirmación ── */
  return (
  <>
    {/* 🟣 MODAL OLVIDÉ CONTRASEÑA */}
    {showForgotPassword && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md border-green-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Recuperar Contraseña</CardTitle>
            <CardDescription>
              Te enviaremos un enlace para restablecer tu contraseña
            </CardDescription>
          </CardHeader>

          <CardContent>
            {resetSent ? (
              <div className="text-center space-y-4">
                <Mail className="size-12 text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Revisa tu correo y haz clic en el enlace
                </p>
                <Button
                  className="w-full"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSent(false);
                  }}
                >
                  Volver al login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">
                  {loading ? "Enviando..." : "Enviar enlace"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancelar
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    )}

    {/* 🔵 CONTENIDO */}
    {showConfirmation ? (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>¡Revisa tu correo!</CardTitle>
            <CardDescription>
              Te enviamos un enlace de verificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowConfirmation(false)}>
              Volver al login
            </Button>
          </CardContent>
        </Card>
      </div>
    ) : (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div
        className={`w-full transition-all duration-500 ${activeTab === "register" ? "max-w-5xl" : "max-w-md"}`}
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Recycle className="size-10 text-primary" />
          <span className="text-2xl font-semibold text-foreground">
            Mercado Verde
          </span>
        </Link>

        <Card className="border-green-100 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Bienvenido</CardTitle>
            <CardDescription className="text-center">
              Inicia sesión o crea una cuenta para comenzar
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              {/* ══ LOGIN ══ */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-green-600"
                    disabled={loading}
                  >
                    {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="w-full text-sm text-muted-foreground hover:text-primary text-center mt-2"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </form>
              </TabsContent>

              {/* ══ REGISTRO ══ */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nombre Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="Tu nombre"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">
                        Teléfono / WhatsApp
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <Input
                          id="register-phone"
                          type="tel"
                          placeholder="+57 310 XXX XXXX"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Correo Electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="tu@email.com"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Usuario</Label>
                    <RadioGroup
                      value={userType}
                      onValueChange={(v) =>
                        setUserType(v as "recycler" | "center")
                      }
                      className="grid grid-cols-2 gap-3"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-green-50 transition-colors">
                        <RadioGroupItem
                          value="recycler"
                          id="register-recycler"
                        />
                        <Label
                          htmlFor="register-recycler"
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <User className="size-4 text-primary" /> Reciclador
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-green-50 transition-colors">
                        <RadioGroupItem value="center" id="register-center" />
                        <Label
                          htmlFor="register-center"
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <Building2 className="size-4 text-primary" /> Centro
                          de Acopio
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Ubicación simple - solo selectores */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Ubicación</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          País
                        </Label>
                        <select
                          className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          onChange={(e) => {
                            const selected = paisesReg.find(
                              (p: any) => p.iso2 === e.target.value,
                            );
                            if (selected) {
                              setPaisReg(selected.name);
                              setPaisIsoReg(e.target.value);
                              setDepReg("");
                              setCiudadReg("");
                              setDepsReg([]);
                              setCiudadesReg([]);
                              setLocationData((prev) => ({
                                ...prev,
                                pais: selected.name,
                                moneda: MONEDAS_REG[selected.name] || "USD",
                              }));
                              fetch(
                                `https://api.countrystatecity.in/v1/countries/${e.target.value}/states`,
                                {
                                  headers: {
                                    "X-CSCAPI-KEY":
                                      "b7744cb1f6d720120baf2130c8f232e86c5baa721afb2c52ea3e9e687242772b",
                                  },
                                },
                              )
                                .then((r) => r.json())
                                .then((d) =>
                                  setDepsReg(Array.isArray(d) ? d : []),
                                );
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Selecciona
                          </option>
                          {paisesReg.map((p: any) => (
                            <option key={p.iso2} value={p.iso2}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Departamento
                        </Label>
                        <select
                          className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          onChange={(e) => {
                            const selected = depsReg.find(
                              (d: any) => d.iso2 === e.target.value,
                            );
                            if (selected) {
                              setDepReg(selected.name);
                              setCiudadReg("");
                              setCiudadesReg([]);
                              setLocationData((prev) => ({
                                ...prev,
                                departamento: selected.name,
                              }));
                              fetch(
                                `https://api.countrystatecity.in/v1/countries/${paisIsoReg}/states/${e.target.value}/cities`,
                                {
                                  headers: {
                                    "X-CSCAPI-KEY":
                                      "b7744cb1f6d720120baf2130c8f232e86c5baa721afb2c52ea3e9e687242772b",
                                  },
                                },
                              )
                                .then((r) => r.json())
                                .then((d) =>
                                  setCiudadesReg(Array.isArray(d) ? d : []),
                                );
                            }
                          }}
                          defaultValue=""
                          disabled={depsReg.length === 0}
                        >
                          <option value="" disabled>
                            {depsReg.length === 0
                              ? "Primero país"
                              : "Selecciona"}
                          </option>
                          {depsReg.map((d: any) => (
                            <option key={d.iso2} value={d.iso2}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Ciudad
                        </Label>
                        <select
                          className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          onChange={(e) => {
                            setCiudadReg(e.target.value);
                            setLocationData((prev) => ({
                              ...prev,
                              ciudad: e.target.value,
                            }));
                          }}
                          defaultValue=""
                          disabled={ciudadesReg.length === 0}
                        >
                          <option value="" disabled>
                            {ciudadesReg.length === 0
                              ? "Primero departamento"
                              : "Selecciona"}
                          </option>
                          {ciudadesReg.map((c: any) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-green-600"
                    disabled={loading}
                  >
                    {loading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                ← Volver al inicio
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    )}
  </>
);
}