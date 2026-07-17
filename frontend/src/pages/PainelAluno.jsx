import { Link, useNavigate } from "react-router-dom"; 
import { useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext"; 
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/Button";
import { useI18n, useStore, statusMeta, ALL_DOC_TYPES } from "@/lib/providers";
import { Card, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/AdminLayout"; 
import {
  FilePlus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCheck2,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function Panel() {
  const { t } = useI18n();
  const { user, loading, authenticated } = useContext(AuthContext); // Monitorização da sessão real
  const { getApplicationForCurrent, createApplicationForCurrent } = useStore();
  const navigate = useNavigate();

  // Trancagem interna de rotas
  useEffect(() => {
    if (!authenticated) {
      navigate("/login");
    } else if (user?.tipo === "admin") {
      navigate("/admin/dashboard");
    }
  }, [user, authenticated, navigate]);

  if (!authenticated || user?.tipo !== "candidato") return null;

  const app = getApplicationForCurrent();

  const startNew = () => {
    createApplicationForCurrent();
    navigate("/candidatura/dados");
  };
  
  if (loading) {
    return <div>A carregar os teus dados...</div>; // Ou um Spinner
  }

  if (!authenticated || !user) {
    return <div>Sessão expirada. Por favor, faz login novamente.</div>;
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">
            {t("welcome")}
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold text-emerald-950">
            {user?.nome || user?.email}
          </h1>
          <div className="gov-gold-rule mt-2 w-16 bg-amber-500 h-0.5" />
        </div>

        {!app ? (
          <Card className="border-2 border-dashed border-emerald-500/40 bg-emerald-500/5">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <FilePlus className="h-7 w-7" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-emerald-900">
                  {t("panel_title")}
                </h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {t("no_application")}
                </p>
              </div>
              <Button size="lg" onClick={startNew} className="mt-2 gap-2 bg-emerald-600 hover:bg-emerald-700 cursor-pointer text-white">
                + {t("start_application")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ApplicationStateCard appId={app.id} />
        )}
      </div>
    </PublicLayout>
  );
}

function ApplicationStateCard({ appId }) {
  const { store } = useStore();
  const app = store.applications.find((a) => a.id === appId);
  const meta = statusMeta(app.status);
  const rejectedDocs = app.documents.filter((d) => d.status === "rejeitado");
  const uploadedCount = app.documents.filter((d) => !!d.fileName).length;
  const totalDocs = ALL_DOC_TYPES.length;

  const bgClass = {
    neutral: "bg-muted/50 border-border",
    info: "bg-status-info/5 border-status-info/30",
    warn: "bg-status-warn/5 border-status-warn/40",
    danger: "bg-status-danger/5 border-status-danger/40",
    "danger-dark": "bg-status-danger/10 border-status-danger/50",
    success: "bg-emerald-50/50 border-emerald-200"
  }[meta.tone];

  const Icon = {
    neutral: Clock,
    info: FileCheck2,
    warn: Clock,
    danger: AlertTriangle,
    "danger-dark": AlertTriangle,
    success: CheckCircle2
  }[meta.tone];

  return (
    <Card className={`overflow-hidden border-2 ${bgClass}`}>
      <CardContent className="p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-background shadow-sm">
                <Icon className="h-5 w-5 text-emerald-950" />
              </div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Processo #{app.id}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-emerald-900">
                    Estado atual
                  </h2>
                  <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                </div>
              </div>
            </div>
          </div>

          {app.status === "aprovada" && (
            <div className="flex items-center gap-1 text-emerald-600">
              <Sparkles className="h-4 w-4" />
              <Sparkles className="h-3 w-3" />
              <Sparkles className="h-2 w-2" />
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatBlock label="Curso" value={app.personal.course ?? "—"} />
          <StatBlock label="Instituição" value={app.personal.institution ?? "—"} />
          <StatBlock label="Documentos" value={`${uploadedCount} / ${totalDocs}`} />
        </div>

        {app.status === "pendente_correcao" && rejectedDocs.length > 0 && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div className="min-w-0">
                <div className="font-semibold text-red-800">
                  Correção urgente necessária
                </div>
                <p className="mt-1 text-sm text-red-950/80">
                  {rejectedDocs.length} documento(s) rejeitado(s) pela equipa de análise. É necessário reenviar apenas os ficheiros indicados.
                </p>
                <Button asChild className="mt-3 gap-2 bg-red-600 hover:bg-red-700 text-white cursor-pointer">
                  <Link to="/candidatura/corrigir">
                    Corrigir documentos <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {app.status === "incompleta" && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
              <Link to="/candidatura/dados">Continuar candidatura</Link>
            </Button>
            <Button asChild variant="outline" className="cursor-pointer">
              <Link to="/candidatura/documentos">Ir para documentos</Link>
            </Button>
          </div>
        )}

        {(app.status === "aguarda_validacao" || app.status === "em_analise") && (
          <p className="mt-6 text-sm text-muted-foreground bg-slate-50 p-3 rounded-md border border-slate-100">
            A sua candidatura está a ser analisada pela equipa do Município. Será notificado por email assim que houver novidades.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StatBlock({ label, value }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}