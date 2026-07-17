import { useNavigate } from "react-router-dom"; 
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext"; 
import { AdminShell } from "@/components/AdminLayout";
import { useStore } from "@/lib/providers";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export default function CreateStaff() {
  const { user: currentUser, authenticated } = useContext(AuthContext); // Sessão real do funcionário
  const { createAdmin } = useStore();
  const navigate = useNavigate();
  
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Segurança de rota administrativa
  useEffect(() => {
    if (!authenticated) navigate("/login");
    else if (currentUser?.tipo !== "admin") navigate("/painel");
  }, [currentUser, authenticated, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (f.password.length < 6) {
      setError("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const res = await createAdmin(f);
      if (!res || !res.ok) {
        setError(res?.error ?? "Erro inesperado ao registar funcionário.");
        return;
      }
      toast.success("Conta de funcionário municipal criada com sucesso!");
      setF({ firstName: "", lastName: "", email: "", phone: "", password: "" });
    } catch (err) {
      setError("Falha na sincronização com o banco TiDB.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell title="Criar novo funcionário">
      <Card className="max-w-2xl border-border shadow-xs">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-emerald-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-emerald-950">
                Nova conta de funcionário municipal
              </h2>
              <p className="text-xs text-muted-foreground">
                Área restrita — apenas administradores autárquicos autorizados.
              </p>
            </div>
          </div>
          <div className="gov-gold-rule mb-6 w-12 bg-amber-500 h-0.5" />

          <form onSubmit={submit} className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
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
            <Button type="submit" size="lg" disabled={loading} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm">
              <UserPlus className="h-4 w-4" /> {loading ? "A processar..." : "Criar Conta de Funcionário"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminShell>
  );
}