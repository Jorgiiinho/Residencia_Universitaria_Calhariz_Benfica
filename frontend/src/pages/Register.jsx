import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription } from "@/components/ui/Alert";

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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
      // Envia o registo para o Backend
      const response = await api.post("/auth/register", {
        nome: firstName,
        apelido: lastName,
        email: email,
        password: pwd
      });

      if (response.data.ok) {
        const log = await login(email, pwd);
        if (log.sucess) {
          navigate("/painel");
        } else {
          navigate("/login");
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Erro ao efetuar o registo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-12 sm:py-20">
        <Card className="border-border/60 shadow-md">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="font-display text-xl font-bold text-deep">
              Criar Conta
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Registe-se para aceder ao portal de inscrição
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={submit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fn">Nome</Label>
                  <Input id="fn" required value={firstName} onChange={(e) => setFirst(e.target.value)} placeholder="Ex: João" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ln">Apelido</Label>
                  <Input id="ln" required value={lastName} onChange={(e) => setLast(e.target.value)} placeholder="Ex: Silva" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="estudante@ribeirabrava.pt" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pwd">Palavra-passe</Label>
                <Input id="pwd" type="password" required value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Mínimo 6 caracteres" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pwd2">Confirmar Palavra-passe</Label>
                <Input id="pwd2" type="password" required value={pwd2} onChange={(e) => setPwd2(e.target.value)} placeholder="Repita a senha" />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "A registar..." : "Criar Conta e Continuar"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Inicie sessão aqui
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}