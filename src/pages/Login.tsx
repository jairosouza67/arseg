import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Lock, Mail, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const signupSchema = loginSchema.extend({
  confirmPassword: z.string().min(6, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const resetSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;
type ResetForm = z.infer<typeof resetSchema>;

const Login = () => {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        if (roleData) {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }
    };
    checkUser();
  }, [navigate]);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const handleLogin = async (data: LoginForm) => {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user?.id)
        .eq("role", "admin")
        .maybeSingle();

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });

      setTimeout(() => {
        if (roleData) {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (data: SignupForm) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu e-mail para confirmar sua conta.",
      });
      setMode("login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (data: ResetForm) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;

      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      setMode("login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar e-mail",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 bg-muted/30">
        <div className="container max-w-md">
          <Card className="shadow-glow animate-fade-in">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-hero">
                  <Flame className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">
                {mode === "login" && "Área Administrativa"}
                {mode === "signup" && "Criar Nova Conta"}
                {mode === "reset" && "Recuperar Senha"}
              </CardTitle>
              <CardDescription>
                {mode === "login" && "Faça login para acessar o painel de gestão"}
                {mode === "signup" && "Preencha os dados para criar sua conta"}
                {mode === "reset" && "Enviaremos instruções para seu e-mail"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mode === "login" && (
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      {...loginForm.register("email")}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      {...loginForm.register("password")}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
                    <Lock className="mr-2 h-4 w-4" />
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>

                  <div className="space-y-2 text-center text-sm">
                    <button
                      type="button"
                      onClick={() => setMode("reset")}
                      className="text-muted-foreground hover:text-primary transition-colors block w-full"
                    >
                      Esqueceu sua senha?
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="text-muted-foreground hover:text-primary transition-colors block w-full"
                    >
                      Não tem conta? Criar nova conta
                    </button>
                  </div>
                </form>
              )}

              {mode === "signup" && (
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      {...signupForm.register("email")}
                    />
                    {signupForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      {...signupForm.register("password")}
                    />
                    {signupForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      {...signupForm.register("confirmPassword")}
                    />
                    {signupForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {loading ? "Criando conta..." : "Criar Conta"}
                  </Button>

                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      Já tem conta? Fazer login
                    </button>
                  </div>
                </form>
              )}

              {mode === "reset" && (
                <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">E-mail</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="seu@email.com"
                      {...resetForm.register("email")}
                    />
                    {resetForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{resetForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
                    <Mail className="mr-2 h-4 w-4" />
                    {loading ? "Enviando..." : "Enviar Instruções"}
                  </Button>

                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      Voltar para login
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Acesso restrito a funcionários autorizados
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
