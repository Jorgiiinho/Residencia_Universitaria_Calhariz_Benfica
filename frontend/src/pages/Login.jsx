import { Link, useNavigate } from "react-router-dom"; 
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext"; 
import { PublicLayout } from "@/components/PublicLayout"; 
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useI18n } from "@/lib/providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { toast } from "sonner";
import { Mail, KeyRound, ArrowLeft } from "lucide-react";
import { AuthAPI } from "@/services/api";

export default function LoginPage() {
  const { t } = useI18n();
  const { login, authenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados para Modal de Recuperar Password
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Estado de E-mail não verificado
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  // Redirecionamento automático caso o utilizador já tenha sessão ativa
  useEffect(() => {
    if (authenticated && user) {
      if (user.tipo === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/painel");
      }
    }
  }, [authenticated, user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Login efetuado com sucesso!");
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      const msg = err?.response?.data?.message || err?.response?.data?.erro || "Credenciais inválidas ou erro no servidor.";
      
      // Deteta se o erro é por conta não verificada
      if (msg.toLowerCase().includes("verific") || err?.response?.data?.naoVerificado) {
        setNeedsVerification(true);
      }
      
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Enviar pedido de recuperação de palavra-passe
  const handleRecoverPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Por favor, introduza o seu e-mail.");
      return;
    }

    setResetLoading(true);
    try {
      if (AuthAPI.recuperarPassword) {
        await AuthAPI.recuperarPassword(resetEmail);
      }
      toast.success("Instruções enviadas! Verifique a sua caixa de entrada.");
      setForgotOpen(false);
      setResetEmail("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Não foi possível enviar o e-mail de recuperação.";
      toast.error(msg);
    } finally {
      setResetLoading(false);
    }
  };

  // Reenviar e-mail de verificação de conta
  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Introduza o seu e-mail no formulário.");
      return;
    }

    setResendingEmail(true);
    try {
      if (AuthAPI.reenviarVerificacao) {
        await AuthAPI.reenviarVerificacao(email);
      }
      toast.success(`E-mail de verificação reenviado para ${email}`);
    } catch (err) {
      toast.error("Erro ao reenviar e-mail de verificação.");
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <PublicLayout>
      <div className="container max-w-md mx-auto py-12 px-4">
        <Card className="border-border">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="font-display text-2xl font-bold text-emerald-950">
              {t("nav_login") || "Iniciar Sessão"}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Aceda à plataforma de candidatura da Residência Universitária
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription className="text-xs flex flex-col gap-2">
                  <span>{error}</span>
                  {needsVerification && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleResendVerification}
                      disabled={resendingEmail}
                      className="w-fit text-xs gap-1 border-red-300 hover:bg-red-50"
                    >
                      <Mail className="h-3 w-3" />
                      {resendingEmail ? "A enviar..." : "Reenviar e-mail de verificação"}
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email") || "E-mail"}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="exemplo@dominio.pt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("password") || "Palavra-passe"}</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setForgotOpen(true);
                    }}
                    className="text-xs font-medium text-emerald-700 hover:underline cursor-pointer"
                  >
                    Esqueceu-se da palavra-passe?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                size="lg"
                disabled={loading}
              >
                {loading ? "A entrar…" : (t("submit_login") || "Entrar")}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t("no_account") || "Ainda não tem conta?"}{" "}
              <Link to="/register" className="font-semibold text-emerald-600 hover:underline">
                {t("nav_register") || "Registar-se"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MODAL DE RECUPERAÇÃO DE PALAVRA-PASSE */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md bg-background border border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-emerald-950">
              <KeyRound className="h-5 w-5 text-emerald-600" />
              Recuperar Palavra-passe
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleRecoverPassword} className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">
              Introduza o seu e-mail registado. Enviaremos uma ligação com as instruções para redefinir a sua palavra-passe.
            </p>
            <div className="space-y-2">
              <Label htmlFor="resetEmail">E-mail de Registo</Label>
              <Input
                id="resetEmail"
                type="email"
                required
                placeholder="exemplo@dominio.pt"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setForgotOpen(false)} className="cursor-pointer">
                Cancelar
              </Button>
              <Button type="submit" disabled={resetLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
                {resetLoading ? "A enviar..." : "Enviar Ligação"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}