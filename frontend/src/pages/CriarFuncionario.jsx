import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../components/AdminLayout";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { UserPlus } from "lucide-react";

export default function CriarFuncionario() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Segurança de Rota em React Router Dom
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.tipo !== "admin") {
      navigate("/painel");
    }
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (f.password.length < 6) {
      setError("A palavra-passe deve tener pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome: f.firstName,
        apelido: f.lastName,
        email: f.email,
        telefone: f.phone,
        password: f.password,
        tipo: "admin" // Força o registo como administrador/staff municipal
      };

      const response = await api.post("/auth/register", payload); // Ajusta a tua rota se for diferente

      if (response.data.ok) {
        alert("Conta de funcionário criada com sucesso!");
        setF({ firstName: "", lastName: "", email: "", phone: "", password: "" });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Erro ao criar a conta de funcionário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Criar novo funcionário">
      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-deep">
                Nova conta de funcionário municipal
              </h2>
              <p className="text-xs text-muted-foreground">
                Área restrita — apenas administradores autorizados.
              </p>
            </div>
          </div>
          <div className="gov-gold-rule mb-6 w-12" />

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input required value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apelido</Label>
                <Input required value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email profissional</Label>
              <Input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Palavra-passe de acesso</Label>
              <Input type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
            </div>
            <Button type="submit" size="lg" className="gap-2" disabled={loading}>
              <UserPlus className="h-4 w-4" /> {loading ? "A criar..." : "Criar Conta de Funcionário"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}