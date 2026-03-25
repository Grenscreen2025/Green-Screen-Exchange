import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Recycle, Mail, Lock, User, Building2, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';

export function Auth() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'recycler' | 'center'>('recycler');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // El login es directo, sin verificación
    localStorage.setItem('userType', userType);
    navigate('/dashboard');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('register-name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('register-email') as HTMLInputElement).value;
    
    // Generar código de verificación de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setUserEmail(email);
    setUserName(name);
    
    // Mostrar el código en consola para desarrollo/pruebas
    console.log('Código de verificación generado:', code);
    
    // Mostrar alerta con el código (para proyecto universitario sin servidor de correo configurado)
    alert(`Para este proyecto universitario, tu código de verificación es: ${code}\n\nEn producción, este código se enviaría a tu correo: ${email}`);
    
    // Opcional: Si el usuario configura EmailJS, se puede enviar el correo real
    // Para configurar EmailJS: https://www.emailjs.com/
    // Descomentar el código siguiente y agregar las credenciales:
    /*
    try {
      await emailjs.send(
        'YOUR_SERVICE_ID', // ID del servicio de EmailJS
        'YOUR_TEMPLATE_ID', // ID de la plantilla
        {
          to_email: email,
          to_name: name,
          verification_code: code,
        },
        'YOUR_PUBLIC_KEY' // Public Key de EmailJS
      );
      toast.success('Código de verificación enviado a tu correo');
    } catch (error) {
      console.error('Error al enviar correo:', error);
    }
    */
    
    setShowVerification(true);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    setTimeout(() => {
      if (verificationCode === generatedCode) {
        // Verificación exitosa
        localStorage.setItem('userType', userType);
        localStorage.setItem('userName', userName);
        localStorage.setItem('userEmail', userEmail);
        toast.success('¡Cuenta verificada exitosamente!');
        navigate('/dashboard');
      } else {
        // Código incorrecto
        toast.error('Código de verificación incorrecto. Inténtalo de nuevo.');
        setVerificationCode('');
      }
      setIsVerifying(false);
    }, 500);
  };

  // Vista de verificación de código
  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <Recycle className="size-10 text-primary" />
            <span className="text-2xl font-semibold text-foreground">GreenScript Exchange</span>
          </Link>

          <Card className="border-green-100 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 size-16 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="size-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Verifica tu correo</CardTitle>
              <CardDescription>
                Hemos enviado un código de verificación de 6 dígitos a<br />
                <span className="font-medium text-foreground">{userEmail}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Código de Verificación</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl font-bold tracking-widest"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Ingresa el código de 6 dígitos que recibiste
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-green-600"
                  disabled={verificationCode.length !== 6 || isVerifying}
                >
                  {isVerifying ? 'Verificando...' : 'Verificar y Continuar'}
                </Button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerification(false);
                      setVerificationCode('');
                    }}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    ← Volver al registro
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vista normal de login/registro
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
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

                  <div className="space-y-2">
                    <Label>Tipo de Usuario</Label>
                    <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'recycler' | 'center')}>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-green-50 transition-colors">
                        <RadioGroupItem value="recycler" id="login-recycler" />
                        <Label htmlFor="login-recycler" className="flex items-center gap-2 cursor-pointer flex-1">
                          <User className="size-4 text-primary" />
                          Reciclador
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-green-50 transition-colors">
                        <RadioGroupItem value="center" id="login-center" />
                        <Label htmlFor="login-center" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Building2 className="size-4 text-primary" />
                          Centro de Acopio
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-green-600">
                    Iniciar Sesión
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
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

                  <div className="space-y-2">
                    <Label>Tipo de Usuario</Label>
                    <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'recycler' | 'center')}>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-green-50 transition-colors">
                        <RadioGroupItem value="recycler" id="register-recycler" />
                        <Label htmlFor="register-recycler" className="flex items-center gap-2 cursor-pointer flex-1">
                          <User className="size-4 text-primary" />
                          Reciclador
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-green-50 transition-colors">
                        <RadioGroupItem value="center" id="register-center" />
                        <Label htmlFor="register-center" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Building2 className="size-4 text-primary" />
                          Centro de Acopio
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-green-600">
                    Crear Cuenta
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