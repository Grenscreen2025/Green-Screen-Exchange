import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Recycle, Mail, Lock, User, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner';
import { supabase } from './supabaseClient';

export function Auth() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'recycler' | 'center'>('recycler');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('login-email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('login-password') as HTMLInputElement).value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message === 'Email not confirmed' 
        ? 'Debes confirmar tu correo antes de iniciar sesión' 
        : 'Correo o contraseña incorrectos');
      setLoading(false);
      return;
    }

    // Guardar datos del usuario
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('userEmail', data.user.email || '');
    localStorage.setItem('userName', data.user.user_metadata?.nombre || '');
    localStorage.setItem('userType', data.user.user_metadata?.tipo || userType);

    toast.success('¡Bienvenido!');
    navigate('/dashboard');
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const nombre = (form.elements.namedItem('register-name') as HTMLInputElement).value;
    const correo = (form.elements.namedItem('register-email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('register-password') as HTMLInputElement).value;

    // 1. Registrar en Supabase Auth (envía correo de verificación automáticamente)
    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: password,
      options: {
        data: { nombre, tipo: userType }
      }
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // 2. Guardar datos extra en tabla usuarios
    if (data.user) {
      await supabase.from('usuarios').insert({
        id_usuario: data.user.id,
        nombre,
        correo,
        password,
        tipo: userType
      });
    }

    setShowConfirmation(true);
    setLoading(false);
  };

  // Vista de confirmación
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-green-100 shadow-xl text-center">
            <CardHeader>
              <div className="mx-auto mb-4 size-16 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="size-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">¡Revisa tu correo!</CardTitle>
              <CardDescription>
                Te enviamos un enlace de verificación. Haz clic en él para
                activar tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowConfirmation(false)}>
                Volver al inicio de sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Recycle className="size-10 text-primary" />
          <span className="text-2xl font-semibold text-foreground">GreenScript Exchange</span>
        </Link>

        <Card className="border-green-100 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Bienvenido</CardTitle>
            <CardDescription className="text-center">
              Inicia sesión o crea una cuenta para comenzar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              {/* Login */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input id="login-email" type="email" placeholder="tu@email.com" className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input id="login-password" type="password" placeholder="••••••••" className="pl-10" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-green-600" disabled={loading}>
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                </form>
              </TabsContent>

              {/* Registro */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nombre Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input id="register-name" type="text" placeholder="Tu nombre" className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input id="register-email" type="email" placeholder="tu@email.com" className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input id="register-password" type="password" placeholder="••••••••" className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Usuario</Label>
                    <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'recycler' | 'center')}>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-green-50 transition-colors">
                        <RadioGroupItem value="recycler" id="register-recycler" />
                        <Label htmlFor="register-recycler" className="flex items-center gap-2 cursor-pointer flex-1">
                          <User className="size-4 text-primary" /> Reciclador
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-green-50 transition-colors">
                        <RadioGroupItem value="center" id="register-center" />
                        <Label htmlFor="register-center" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Building2 className="size-4 text-primary" /> Centro de Acopio
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-green-600" disabled={loading}>
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
                ← Volver al inicio
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}