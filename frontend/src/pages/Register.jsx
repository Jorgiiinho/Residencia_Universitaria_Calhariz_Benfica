import { Link, useNavigate } from "react-router-dom"; 
import { useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext"; 
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useI18n } from "@/lib/providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { toast } from "sonner";
import { MailCheck, ArrowRight, RefreshCw } from "lucide-react";
import { AuthAPI } from "@/services/api";

export default function RegisterPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estado para controlar se o registo foi concluído e aguarda verificação por email
  const [isRegistered, setIsRegistered] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (pwd.length < 6) {
      setError("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }
    if (pwd !== pwd2) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    setLoading(true);
    try {
      if (register) {
        await register({ firstName, lastName, email, password: pwd });
      }
      
      setIsRegistered(true);
      toast.success("Conta criada! Enviámos um e-mail de verificação.");
    } catch (err) {
      console.error("Erro no registo:", err);
      const msg = err?.response?.data?.message || err?.response?.data?.erro || "Ocorreu um erro ao criar a conta.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      if (AuthAPI.reenviarVerificacao) {
        await AuthAPI.reenviarVerificacao(email);
      }
      toast.success(`E-mail de verificação reenviado para ${email}`);
    } catch (err) {
      toast.error("Não foi possível reenviar o e-mail de verificação.");
    } finally {
      setResending(false);
    }
  };

  // ECRÃ DE SUCESSO / AVISO DE E-MAIL ENVIADO
  if (isRegistered) {
    return (
      <PublicLayout>
        <div className="container max-w-md mx-auto py-12 px-4">
          <Card className="border-border text-center p-4">
            <CardHeader className="space-y-3">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <MailCheck className="h-8 w-8" />
              </div>
              <CardTitle className="font-display text-2xl font-bold text-emerald-950">
                Verifique o seu E-mail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Enviámos uma mensagem de confirmação para <strong className="text-emerald-900">{email}</strong>.
              </p>
              <p className="text-xs text-muted-foreground bg-slate-50 p-3 rounded border border-slate-200">
                Por favor, aceda à sua caixa de correio eletrónico e clique na ligação enviada para ativar a sua conta antes de iniciar sessão. (Verifique também a pasta de Spam/Lixo Eletrónico).
              </p>

              <div className="pt-2 space-y-2">
                <Button 
                  onClick={() => navigate("/login")} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 cursor-pointer"
                >
                  Ir para o Login <ArrowRight className="h-4 w-4" />
                </Button>

                <Button 
                  variant="outline" 
                  onClick={handleResendEmail} 
                  disabled={resending}
                  className="w-full text-xs gap-2 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? "A reenviar..." : "Não recebeu? Reenviar E-mail"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  // FORMULÁRIO NORMAL DE REGISTO
  return (
    <PublicLayout>
      <div className="container max-w-md mx-auto py-12 px-4">
        <Card className="border-border">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="font-display text-2xl font-bold text-emerald-950">
              {t("nav_register") || "Criar Conta"}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Registe-se para candidatar-se às vagas da Residência Universitária
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fn">{t("first_name") || "Nome"}</Label>
                  <Input 
                    id="fn" 
                    required 
                    value={firstName} 
                    onChange={(e) => setFirst(e.target.value)} 
                    placeholder="João"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ln">{t("last_name") || "Apelido"}</Label>
                  <Input 
                    id="ln" 
                    required 
                    value={lastName} 
                    onChange={(e) => setLast(e.target.value)} 
                    placeholder="Silva"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email") || "E-mail"}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="exemplo@dominio.pt"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pwd">{t("password") || "Palavra-passe"}</Label>
                <Input 
                  id="pwd" 
                  type="password" 
                  required 
                  value={pwd} 
                  onChange={(e) => setPwd(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pwd2">{t("confirm_password") || "Confirmar Palavra-passe"}</Label>
                <Input 
                  id="pwd2" 
                  type="password" 
                  required 
                  value={pwd2} 
                  onChange={(e) => setPwd2(e.target.value)} 
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer" 
                size="lg" 
                disabled={loading}
              >
                {loading ? "A criar…" : (t("submit_register") || "Criar Conta")}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t("have_account") || "Já tem conta?"}{" "}
              <Link to="/login" className="font-semibold text-emerald-600 hover:underline">
                {t("nav_login") || "Iniciar Sessão"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}