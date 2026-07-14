import { useEffect, useState, useMemo, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminLayout, StatusBadge } from "../components/AdminLayout";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, ClipboardList, CheckCircle2, XCircle, Search, Eye } from "lucide-react";

// Pequeno tradutor integrado para o Dashboard
const traducoesDashboard = {
  pt: {
    admin_dashboard: "Painel Municipal",
    total_registered: "Total de Candidatos",
    pending: "Pendentes de Análise",
    approved: "Candidaturas Aprovadas",
    rejected: "Candidaturas Rejeitadas",
    process_id: "Nº Processo",
    candidate: "Candidato",
    course: "Curso",
    academic_year: "Ano Letivo",
    state: "Estado",
    actions: "Ações",
    view_process: "Ver Dossiê"
  },
  en: {
    admin_dashboard: "Municipal Dashboard",
    total_registered: "Total Candidates",
    pending: "Pending Analysis",
    approved: "Approved",
    rejected: "Rejected",
    process_id: "Process ID",
    candidate: "Candidate",
    course: "Course",
    academic_year: "Academic Year",
    state: "Status",
    actions: "Actions",
    view_process: "View File"
  }
};

// Auxiliar para as cores e textos dos estados da Base de Dados
const statusMeta = (estado) => {
  switch (estado) {
    case 'rascunho':
    case 'aguarda_documentos':
      return { tone: 'neutral', label: 'Incompleta' };
    case 'aguarda_validacao':
      return { tone: 'warn', label: 'Aguardar Validação' };
    case 'em_analise':
      return { tone: 'info', label: 'Em Análise' };
    case 'pendente_correcao':
      return { tone: 'danger', label: 'Pendente Correção' };
    case 'aprovado':
      return { tone: 'success', label: 'Aprovada' };
    case 'rejeitado':
      return { tone: 'danger-dark', label: 'Rejeitada' };
    case 'arquivado':
      return { tone: 'neutral', label: 'Arquivada' };
    default:
      return { tone: 'neutral', label: estado || 'Incompleta' };
  }
};

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [lang] = useState("pt"); // Padrão
  const t = (key) => traducoesDashboard[lang]?.[key] || key;

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  // Segurança
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.tipo !== "admin") {
      navigate("/painel");
    }
  }, [user, navigate]);

  //Carrega todas as candidaturas do backend
  useEffect(() => {
    const carregarCandidaturas = async () => {
      try {
        const response = await api.get("/admin/candidaturas"); // Rota do teu backend
        if (response.data) {
          setApps(response.data.candidaturas || response.data);
        }
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as candidaturas.");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.tipo === "admin") {
      carregarCandidaturas();
    }
  }, [user]);

  // Cálculos em tempo real com base no teu ENUM da base de dados
  const metrics = useMemo(() => {
    return {
      total: apps.length,
      pending: apps.filter((a) => ["aguarda_validacao", "em_analise", "pendente_correcao", "rascunho", "aguarda_documentos"].includes(a.estado)).length,
      approved: apps.filter((a) => a.estado === "aprovado" || a.estado === "aprovada").length,
      rejected: apps.filter((a) => a.estado === "rejeitado" || a.estado === "rejeitada").length,
    };
  }, [apps]);

  // Filtro de pesquisa
  const filtered = apps.filter((a) => {
    const nomeCompleto = `${a.nome ?? ""} ${a.apelido ?? ""}`.toLowerCase();
    const cursoCandidato = (a.curso ?? "").toLowerCase();
    const idCandidatura = String(a.id).toLowerCase();
    const busca = q.toLowerCase();

    return !q || nomeCompleto.includes(busca) || idCandidatura.includes(busca) || cursoCandidato.includes(busca);
  });

  if (loading) return <div className="p-8">A carregar painel municipal...</div>;

  return (
    <AdminLayout title={t("admin_dashboard")}>
      {error && <div className="mb-4 text-red-600 font-semibold">⚠️ {error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Users} label={t("total_registered")} value={metrics.total} tone="deep" />
        <MetricCard icon={ClipboardList} label={t("pending")} value={metrics.pending} tone="warn" />
        <MetricCard icon={CheckCircle2} label={t("approved")} value={metrics.approved} tone="success" />
        <MetricCard icon={XCircle} label={t("rejected")} value={metrics.rejected} tone="danger" />
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-deep">Candidaturas</h2>
              <p className="text-xs text-muted-foreground">
                Todos os processos submetidos por candidatos.
              </p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, ID ou curso..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>{t("process_id")}</TableHead>
                  <TableHead>{t("candidate")}</TableHead>
                  <TableHead>{t("course")}</TableHead>
                  <TableHead>{t("academic_year")}</TableHead>
                  <TableHead>{t("state")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                      Nenhuma candidatura encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((a) => {
                    const meta = statusMeta(a.estado);
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono text-xs">#{a.id}</TableCell>
                        <TableCell className="font-medium">
                          {a.nome} {a.apelido}
                        </TableCell>
                        <TableCell>{a.curso || "—"}</TableCell>
                        <TableCell>{a.ano_letivo || "—"}</TableCell>
                        <TableCell>
                          <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline" className="gap-1.5">
                            <Link to={`/admin/candidatura/${a.id}`}>
                              <Eye className="h-3.5 w-3.5" /> {t("view_process")}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  const bg = {
    deep: "bg-deep text-deep-foreground",
    warn: "bg-status-warn/10 text-status-warn",
    success: "bg-status-success/10 text-status-success",
    danger: "bg-status-danger/10 text-status-danger",
  }[tone];
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-md ${bg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </div>
          <div className="font-display text-2xl font-bold text-deep">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}