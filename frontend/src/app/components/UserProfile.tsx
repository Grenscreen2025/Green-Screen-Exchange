import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  Shield,
  Award,
} from "lucide-react";
import { Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { supabase } from "./supabaseClient";

export function UserProfile() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    joinDate: "",
    tipo: "",
  });

  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalBottles: 0,
    rating: 0,
    verified: false,
  });

  useEffect(() => {
    cargarPerfil();
  }, []);
  const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return;
      }

      if (passwordData.newPassword.length < 8) {
        toast.error("La contraseña debe tener al menos 8 caracteres");
        return;
      }

      setLoadingPassword(true);

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) {
        toast.error("Error al cambiar contraseña: " + error.message);
      } else {
        toast.success("Contraseña actualizada correctamente");
        setShowChangePassword(false);
        setPasswordData({ newPassword: "", confirmPassword: "" });
      }
      setLoadingPassword(false);
    };

  const cargarPerfil = async () => {
    setLoading(true);

    const userEmail = localStorage.getItem("userEmail");
    const userId = localStorage.getItem("userId");

    if (!userEmail) {
      toast.error("No hay sesión activa");
      setLoading(false);
      return;
    }

    // Obtener datos de la tabla usuarios
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("correo", userEmail)
      .single();

    if (error || !data) {
      toast.error("Error al cargar perfil");
      setLoading(false);
      return;
    }

    setProfileData({
      name: data.nombre || "",
      email: data.correo || "",
      phone: data.telefono || "",
      location: data.ciudad_base || "",
      bio: "",
      joinDate: data.fecha_registro || "",
      tipo: data.tipo_usuario || "",
    });

    // Obtener estadísticas de transacciones
    const { data: transacciones } = await supabase
      .from("transacciones")
      .select("cantidad_unidades")
      .or(
        `id_comprador.eq.${data.id_usuario},id_vendedor.eq.${data.id_usuario}`,
      );

    const totalBotellas =
      transacciones?.reduce((sum, t) => sum + t.cantidad_unidades, 0) || 0;

    // Verificar si el correo está confirmado en Auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setStats({
      totalTransactions: transacciones?.length || 0,
      totalBottles: totalBotellas,
      rating: 4.8,
      verified: user?.email_confirmed_at != null,
    });

    setLoading(false);
  };

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("usuarios")
      .update({
        nombre: profileData.name,
        correo: profileData.email,
      })
      .eq("correo", user.email);

    if (error) {
      toast.error("Error al guardar cambios");
      return;
    }

    toast.success("Perfil actualizado correctamente");
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando perfil...</div>
      </div>
    );
  }

  const isRecycler = profileData.tipo === "recycler";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      <Card className="border-green-100">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="size-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profileData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {profileData.name}
                  {stats.verified && (
                    <Badge variant="default" className="bg-blue-500">
                      <Shield className="size-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  {isRecycler ? "Reciclador" : "Centro de Acopio"}
                </CardDescription>
              </div>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={isEditing ? "bg-primary hover:bg-green-600" : ""}
            >
              {isEditing ? (
                <>
                  <Save className="size-4 mr-2" />
                  Guardar
                </>
              ) : (
                <>
                  <Edit2 className="size-4 mr-2" />
                  Editar Perfil
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.totalTransactions}
              </div>
              <div className="text-xs text-muted-foreground">Transacciones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.totalBottles.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Botellas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                <Award className="size-5" />
                {stats.rating}
              </div>
              <div className="text-xs text-muted-foreground">Calificación</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">
              Información Personal
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                disabled={!isEditing}
                className="min-h-[100px]"
                placeholder="Cuéntanos sobre ti..."
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">
              Información de Cuenta
            </h3>
            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Seguridad</h3>

              {!showChangePassword ? (
                <Button
                  variant="outline"
                  onClick={() => setShowChangePassword(true)}
                  className="flex items-center gap-2"
                >
                  <Lock className="size-4" />
                  Cambiar Contraseña
                </Button>
              ) : (
                <form
                  onSubmit={handleChangePassword} // ✅ BIEN
                  className="space-y-4 max-w-md"
                >
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        className="pl-10"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirmar Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Repite la contraseña"
                        className="pl-10"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-green-600"
                      disabled={loadingPassword}
                    >
                      {loadingPassword ? "Guardando..." : "Guardar Contraseña"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordData({
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="size-5 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">
                    Miembro desde
                  </div>
                  <div className="font-medium">
                    {profileData.joinDate
                      ? new Date(profileData.joinDate).toLocaleDateString(
                          "es-ES",
                          { year: "numeric", month: "long", day: "numeric" },
                        )
                      : "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="size-5 text-blue-500" />
                <div>
                  <div className="text-xs text-muted-foreground">
                    Estado de verificación
                  </div>
                  <div
                    className={`font-medium ${stats.verified ? "text-blue-600" : "text-yellow-600"}`}
                  >
                    {stats.verified
                      ? "Cuenta Verificada"
                      : "Pendiente de verificación"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-100">
        <CardHeader>
          <CardTitle>🌍 Tu Impacto Ambiental Total</CardTitle>
          <CardDescription>
            El impacto positivo que has generado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">
                {stats.totalBottles.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Botellas Procesadas
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {(stats.totalBottles * 0.025).toFixed(0)} kg
              </div>
              <div className="text-sm text-muted-foreground">
                Plástico Recuperado
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600 mb-1">
                {(stats.totalBottles * 0.5).toFixed(0)} kg
              </div>
              <div className="text-sm text-muted-foreground">CO₂ Evitado</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
