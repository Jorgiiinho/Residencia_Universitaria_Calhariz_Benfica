import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { toast } from "sonner";
import { AuthAPI } from "@/services/api";
import { Lock, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function RedefinirPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Captura o token diretamente da URL: /redefinir-password?token=xyz...
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 🛡️ BLOQUEIO DE SEGURANÇA: Se não existir token na URL, impede o acesso
  useEffect(() => {
    if (!token) {
      toast.error("Ligação inválida. Solicite a recuperação de palavra-passe novamente.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token de validação em falta no link.");
      return;
    }

    if (password.length < 6) {
      toast.error("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As palavras-passes introduzidas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const res = await AuthAPI.redefinirPassword(token, password);
      if (res.data?.ok || res.status === 200) {
        setSuccess(true);
        toast.success("Palavra-passe alterada com sucesso!");
      }
    } catch (err) {
      console.error("❌ Erro ao redefinir palavra-passe:", err);
      const msg = err.response?.data?.error || err.response?.data?.message || "A ligação expirou ou é inválida.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <Card className="border-border shadow-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="font-display text-2xl font-bold text-emerald-950">
              Redefinir Palavra-passe
            </CardTitle>
            <CardDescription>
              Residência Universitária Calhariz-Benfica
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* CENÁRIO 1: ACESSO SEM TOKEN NO LINK */}
            {!token ? (
              <div className="py-4 space-y-4">
                <Alert variant="destructive">
                  <AlertDescription className="text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Acesso negado. Esta página só pode ser acedida através da ligação enviada para o seu e-mail.</span>
                  </AlertDescription>
                </Alert>
                <Button 
                  asChild 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Login
                  </Link>
                </Button>
              </div>
            ) : success ? (
              /* CENÁRIO 2: PALAVRA-PASSE ALTERADA COM SUCESSO */
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-display text-lg font-bold text-emerald-950">
                  Palavra-passe Atualizada!
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A sua palavra-passe foi alterada com sucesso. Já pode aceder ao portal com as novas credenciais.
                </p>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer mt-4"
                  onClick={() => navigate("/login")}
                >
                  Iniciar Sessão
                </Button>
              </div>
            ) : (
              /* CENÁRIO 3: FORMULÁRIO DE NOVA PALAVRA-PASSE */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Nova Palavra-passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirmar Nova Palavra-passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="pl-9"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {loading ? "A guardar..." : "Guardar Nova Palavra-passe"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}