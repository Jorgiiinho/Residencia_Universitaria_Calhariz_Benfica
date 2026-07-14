import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { AuthContext } from "../context/AuthContext";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription } from "@/components/ui/Alert";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (!res.sucess) {
      setError(res.message);
      return;
    }

    // Redirecionamento dinâmico inteligente baseado no teu tipo SQL
    if (res.tipo === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/painel");
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:py-24">
        <Card className="border-border/60 shadow-md">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="font-display text-xl font-bold text-deep">
              Aceder ao Portal
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Introduza as suas credenciais de acesso
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={submit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="estudante@ribeirabrava.pt"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "A entrar..." : "Iniciar Sessão"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Ainda não tem conta?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Registe-se aqui
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}