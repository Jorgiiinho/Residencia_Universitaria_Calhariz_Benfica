import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useI18n } from "@/lib/providers";
import { toast } from "sonner";
import { AuthAPI } from "@/services/api";
import { Mail, User, Lock, CheckCircle2, RefreshCw } from "lucide-react";

export default function Register() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    apelido: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("As palavras-passes introduzidas não coincidem.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await AuthAPI.register({
        nome: formData.nome,
        apelido: formData.apelido,
        email: formData.email,
        password: formData.password,
      });

      if (res.data.ok) {
        toast.success("Conta criada! Verifique o seu e-mail para confirmar o registo.");
        setSubmitted(true);
      }
    } catch (err) {
      console.error("❌ Erro no registo:", err);
      toast.error(err.response?.data?.error || "Ocorreu um erro ao criar a conta.");
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    setResending(true);
    try {
      const res = await AuthAPI.reenviarVerificacao(formData.email);
      if (res.data.ok) {
        toast.success("E-mail de verificação reenviado com sucesso!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao reenviar o e-mail.");
    } finally {
      setResending(false);
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <Card className="border-border shadow-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="font-display text-2xl font-bold text-emerald-950">
              Criar Conta de Candidato
            </CardTitle>
            <CardDescription>
              Acesso à candidatura da Residência Universitária Calhariz-Benfica
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submitted ? (
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-display text-lg font-bold text-emerald-950">
                  Verifique a sua Caixa de Entrada
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enviámos um e-mail de confirmação para <strong className="text-emerald-900">{formData.email}</strong>. 
                  Clique no link enviado para ativar a sua conta antes de iniciar a candidatura.
                </p>

                <div className="pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full gap-2 cursor-pointer"
                    onClick={handleReenviar}
                    disabled={resending}
                  >
                    <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
                    {resending ? "A reenviar..." : "Reenviar e-mail de ativação"}
                  </Button>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    onClick={() => navigate("/login")}
                  >
                    Ir para o Login
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="nome">Primeiro Nome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nome"
                        name="nome"
                        placeholder="João Manuel"
                        required
                        className="pl-9"
                        value={formData.nome}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="apelido">Apelido</Label>
                    <Input
                      id="apelido"
                      name="apelido"
                      placeholder="Silva Costa"
                      required
                      value={formData.apelido}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Endereço de E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="estudante@email.pt"
                      required
                      className="pl-9"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Palavra-passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="pl-9"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirmar Palavra-passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="pl-9"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {loading ? "A criar conta..." : "Criar Conta"}
                </Button>

                <div className="text-center text-xs text-muted-foreground mt-4">
                  Já tem conta criada?{" "}
                  <Link to="/login" className="font-bold text-emerald-700 hover:underline">
                    Efetuar Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}