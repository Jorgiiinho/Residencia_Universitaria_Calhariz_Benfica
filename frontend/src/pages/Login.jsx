import { Link, useNavigate } from "react-router-dom"; 
import {useContext, useState, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext"; 
import { PublicLayout } from "@/components/PublicLayout"; 
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useI18n } from "@/lib/providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { toast } from "sonner";

export default function LoginPage() {
  const { t } = useI18n();
  const { login, authenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirecionamento automático caso o utilizador já tenha uma sessão ativa
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
    setLoading(true);
    try {
      const res = await login(email, password);
      if (!res || !res.ok) {
        setError(res?.error || "Credenciais inválidas. Tente novamente.");
        return;
      }
      toast.success("Sessão iniciada com sucesso");
      
      // O teu backend devolve o papel no 'tipo' ('admin' ou 'candidato')
      if (res.user?.tipo === "admin" || res.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/painel");
      }
    } catch (err) {
      setError("Falha na ligação com o servidor municipal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-md bg-deep text-gold">
              <span className="font-display text-lg font-bold text-amber-500">RB</span>
            </div>
            <CardTitle className="font-display text-2xl text-emerald-950">
              {t("login_title")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t("login_subtitle")}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer" size="lg" disabled={loading}>
                {loading ? "A entrar…" : t("submit_login")}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t("no_account")}?{" "}
              <Link to="/register" className="font-semibold text-emerald-600 hover:underline">
                {t("nav_register")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}