import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, Shield, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export function UserProfile() {
  const userType = localStorage.getItem('userType') || 'recycler';
  const isRecycler = userType === 'recycler';

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: isRecycler ? 'Juan Pérez' : 'EcoAcopio Central',
    email: 'usuario@greenscript.com',
    phone: '+56 9 1234 5678',
    location: 'Santiago, Región Metropolitana',
    bio: isRecycler 
      ? 'Reciclador comprometido con el medio ambiente desde 2020. Especializado en botellas PET y HDPE.'
      : 'Centro de acopio certificado operando desde 2018. Compramos todo tipo de plásticos reciclables.',
    joinDate: '2020-03-15',
  });

  const [stats] = useState({
    totalTransactions: isRecycler ? 47 : 156,
    totalBottles: isRecycler ? 12450 : 45800,
    rating: 4.8,
    verified: true,
  });

  const handleSave = () => {
    setIsEditing(false);
    // Aquí se guardarían los datos
  };

  const handleChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      {/* Profile Card */}
      <Card className="border-green-100">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="size-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profileData.name.charAt(0)}
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
                  {isRecycler ? 'Reciclador' : 'Centro de Acopio'}
                </CardDescription>
              </div>
            </div>
            <Button
              variant={isEditing ? 'default' : 'outline'}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={isEditing ? 'bg-primary hover:bg-green-600' : ''}
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
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalTransactions}</div>
              <div className="text-xs text-muted-foreground">Transacciones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalBottles.toLocaleString()}</div>
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

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Información Personal</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
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
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
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
                onChange={(e) => handleChange('bio', e.target.value)}
                disabled={!isEditing}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <Separator />

          {/* Account Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Información de Cuenta</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="size-5 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Miembro desde</div>
                  <div className="font-medium">
                    {new Date(profileData.joinDate).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="size-5 text-blue-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Estado de verificación</div>
                  <div className="font-medium text-blue-600">Cuenta Verificada</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Card */}
      <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="size-5 text-primary" />
            Logros y Reconocimientos
          </CardTitle>
          <CardDescription>
            Tu contribución al medio ambiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-white rounded-lg border border-green-100">
              <div className="text-4xl mb-2">🌟</div>
              <div className="font-semibold text-foreground">Usuario Destacado</div>
              <div className="text-xs text-muted-foreground mt-1">
                Por tu compromiso con el reciclaje
              </div>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border border-green-100">
              <div className="text-4xl mb-2">🌱</div>
              <div className="font-semibold text-foreground">Eco Warrior</div>
              <div className="text-xs text-muted-foreground mt-1">
                +10,000 botellas recicladas
              </div>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border border-green-100">
              <div className="text-4xl mb-2">🏆</div>
              <div className="font-semibold text-foreground">Top Contribuidor</div>
              <div className="text-xs text-muted-foreground mt-1">
                Entre los mejores del mes
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact */}
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌍 Tu Impacto Ambiental Total
          </CardTitle>
          <CardDescription>
            El impacto positivo que has generado desde que te uniste
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">
                {stats.totalBottles.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Botellas Procesadas</div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {(stats.totalBottles * 0.025).toFixed(0)} kg
              </div>
              <div className="text-sm text-muted-foreground">Plástico Recuperado</div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600 mb-1">
                {(stats.totalBottles * 0.5).toFixed(0)} kg
              </div>
              <div className="text-sm text-muted-foreground">CO₂ Evitado</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white text-center">
            <p className="text-sm opacity-90">
              ¡Gracias por tu compromiso! Has ayudado a proteger nuestro planeta y crear un futuro más sostenible.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
