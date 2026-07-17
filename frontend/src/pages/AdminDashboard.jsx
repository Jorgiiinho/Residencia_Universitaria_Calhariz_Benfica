import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { AdminShell, StatusBadge } from "@/components/AdminLayout";
import { useStore, statusMeta, useI18n } from "@/lib/providers";

import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/Table";

import { Users, ClipboardList, CheckCircle2, XCircle, Search, Eye } from "lucide-react";
import { AdminAPI } from "@/services/api";

export default function AdminDashboard() {
  const { t } = useI18n();
  const { store } = useStore();
  const { user, authenticated } = useContext(AuthContext); // 🌟 Lendo a sessão real do Município
  const navigate = useNavigate(); // Hook oficial de navegação do React Router Dom
  
  const [q, setQ] = useState("");
  const [remoteApps, setRemoteApps] = useState(null);

  // Segurança de Rota Interna usando o teu AuthContext real
  useEffect(() => {
    if (!authenticated) {
      navigate("/login");
    } else if (user?.tipo !== "admin") { // No teu App.jsx usas "admin" para a câmara municipal
      navigate("/painel");
    }
  }, [user, authenticated, navigate]);

  // Chamada Real à API das candidaturas da Ribeira Brava
  useEffect(() => {
    if (!authenticated || user?.tipo !== "admin") return;
    
    AdminAPI.listarCandidaturas()
      .then(({ data }) => setRemoteApps(Array.isArray(data) ? data : data?.candidaturas ?? null))
      .catch((err) => console.warn("[api] listar candidaturas falhou", err?.message));
  }, [user, authenticated]);

  const apps = remoteApps ?? store.applications;

  const metrics = useMemo(
    () => ({
      total: apps.length,
      pending: apps.filter((a) => ["aguarda_validacao", "em_analise", "incompleta", "pendente_correcao"].includes(a.status)).length,
      approved: apps.filter((a) => a.status === "aprovada").length,
      rejected: apps.filter((a) => a.status === "rejeitada").length
    }),
    [apps]
  );

  const filtered = apps.filter((a) => {
    const u = store.users.find((x) => x.id === a.userId);
    const name = `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.toLowerCase();
    return !q || name.includes(q.toLowerCase()) || a.id.toLowerCase().includes(q.toLowerCase()) || (a.personal.course ?? "").toLowerCase().includes(q.toLowerCase());
  });

  return (
    <AdminShell title={t("admin_dashboard")}>
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
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                      Nenhuma candidatura encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((a) => {
                  const u = store.users.find((x) => x.id === a.userId);
                  const meta = statusMeta(a.status);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.id}</TableCell>
                      <TableCell className="font-medium">
                        {u?.firstName} {u?.lastName}
                      </TableCell>
                      <TableCell>{a.personal.course ?? "\u2014"}</TableCell>
                      <TableCell>{a.personal.academicYear ?? "\u2014"}</TableCell>
                      <TableCell>
                        <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline" className="gap-1.5 cursor-pointer">
                          <Link to={`/admin/candidatura/${a.id}`}>
                            <Eye className="h-3.5 w-3.5" /> {t("view_process")}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  const bg = {
    deep: "bg-deep text-deep-foreground",
    warn: "bg-status-warn/10 text-status-warn",
    success: "bg-status-success/10 text-status-success",
    danger: "bg-status-danger/10 text-status-danger"
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