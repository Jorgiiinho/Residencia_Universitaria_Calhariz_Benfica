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


export default function RegisterPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { register, login } = useContext(AuthContext);
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    // REGISTO
    const res = await register({ 
      nome: firstName, 
      apelido: lastName, 
      email, 
      password: pwd 
    });
    
    if (!res || !res.ok) {
      setError(res?.error || "Erro ao criar conta.");
      setLoading(false);
      return;
    }
    
    // LOGIN AUTOMÁTICO (Auto-login)
    const loginRes = await login(email, pwd);
    
    if (loginRes && loginRes.sucess) {
      toast.success("Conta criada e sessão iniciada com sucesso!");
      navigate("/painel");
    } else {
      // Caso o registo tenha funcionado mas o login automático falhe
      toast.error("Conta criada! Por favor, faça login.");
      navigate("/login");
    }
    
  } catch (err) {
    console.error("❌ Erro:", err);
    setError("Serviço de registo temporariamente indisponível.");
  } finally {
    setLoading(false);
  }
};

  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl text-emerald-950">
              {t("register_title")}
            </CardTitle>
            <div className="gov-gold-rule mx-auto mt-2 w-16 bg-amber-500 h-0.5" />
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fn">{t("first_name")}</Label>
                  <Input id="fn" required value={firstName} onChange={(e) => setFirst(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ln">{t("last_name")}</Label>
                  <Input id="ln" required value={lastName} onChange={(e) => setLast(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pwd">{t("password")}</Label>
                <Input id="pwd" type="password" required value={pwd} onChange={(e) => setPwd(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pwd2">{t("confirm_password")}</Label>
                <Input id="pwd2" type="password" required value={pwd2} onChange={(e) => setPwd2(e.target.value)} />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer" size="lg" disabled={loading}>
                {loading ? "A criar…" : t("submit_register")}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t("have_account")}?{" "}
              <Link to="/login" className="font-semibold text-emerald-600 hover:underline">
                {t("nav_login")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}