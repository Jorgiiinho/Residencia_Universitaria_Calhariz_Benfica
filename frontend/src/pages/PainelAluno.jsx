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
  Sparkles,
  XCircle,
  RefreshCcw
} from "lucide-react";

export default function Panel() {
  const { t } = useI18n();
  const { user, loading, authenticated } = useContext(AuthContext); // Monitorização da sessão real
  const { getApplicationForCurrent, createApplicationForCurrent } = useStore();
  const navigate = useNavigate();

  // Trancagem interna de rotas
  useEffect(() => {
    if (!loading) {
      if (!authenticated) {
        navigate("/login");
      } else if (user?.tipo === "admin") {
        navigate("/admin/dashboard");
      }
    }
  }, [user, authenticated, loading, navigate]);

  // Se estiver a carregar os dados do utilizador
  if (loading) {
    return (
      <PublicLayout>
        <div className="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center px-4 py-20">
          <div className="flex items-center gap-3 text-emerald-800 font-medium">
            <Clock className="h-5 w-5 animate-spin" />
            <span>A carregar a tua sessão...</span>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!authenticated || user?.tipo !== "candidato") {
    return null;
  }

  const app = getApplicationForCurrent();

  const startNew = () => {
    createApplicationForCurrent();
    navigate("/candidatura/dados");
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* CABEÇALHO */}
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
            {t("welcome") || "Bem-vindo"}
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold text-emerald-950">
            {user?.nome || user?.firstName || user?.email}
          </h1>
          <div className="gov-gold-rule mt-2 h-0.5 w-16 bg-amber-500" />
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        {!app ? (
          /* CASO 1: SEM CANDIDATURA CRIADA */
          <Card className="border-2 border-dashed border-emerald-500/40 bg-emerald-500/5">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <FilePlus className="h-7 w-7" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-emerald-900">
                  {t("panel_title") || "Candidatura à Residência Universitária"}
                </h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {t("no_application") || "Ainda não iniciaste o teu processo de candidatura para o ano letivo atual."}
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={startNew} 
                className="mt-2 gap-2 bg-emerald-600 hover:bg-emerald-700 font-bold cursor-pointer text-white shadow-sm"
              >
                + {t("start_application") || "Iniciar Candidatura"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* CASO 2: CANDIDATURA EXISTENTE */
          <ApplicationStateCard appId={app.id} />
        )}
      </div>
    </PublicLayout>
  );
}

function ApplicationStateCard({ appId }) {
  const { store } = useStore();
  const app = store.applications.find((a) => String(a.id) === String(appId)) || {};
  const meta = statusMeta(app.status || "rascunho") || { tone: "neutral", label: app.status };
  
  const documents = app.documents || [];
  const personal = app.personal || {};

  const rejectedDocs = documents.filter((d) => d.status === "rejeitado");
  const uploadedCount = documents.filter((d) => !!d.fileName || !!d.nome_ficheiro).length;
  const totalDocs = ALL_DOC_TYPES?.length || 5;

  const bgClass = {
    neutral: "bg-muted/50 border-border",
    info: "bg-sky-50/50 border-sky-200",
    warn: "bg-amber-50/60 border-amber-300",
    danger: "bg-red-50/50 border-red-200",
    "danger-dark": "bg-red-100/50 border-red-300",
    success: "bg-emerald-50/60 border-emerald-200"
  }[meta.tone] || "bg-background border-border";

  const Icon = {
    neutral: Clock,
    info: FileCheck2,
    warn: AlertTriangle,
    danger: XCircle,
    "danger-dark": XCircle,
    success: CheckCircle2
  }[meta.tone] || Clock;

  return (
    <Card className={`overflow-hidden border-2 ${bgClass}`}>
      <CardContent className="p-6 sm:p-8">
        {/* HEADER DO CARTÃO */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-background shadow-xs">
                <Icon className="h-5 w-5 text-emerald-950" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
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
              <Sparkles className="h-5 w-5" />
              <Sparkles className="h-4 w-4" />
              <Sparkles className="h-3 w-3" />
            </div>
          )}
        </div>

        {/* BLOCO DE RESUMO DOS DADOS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatBlock label="Curso" value={personal.course || personal.curso || "—"} />
          <StatBlock label="Instituição" value={personal.institution || personal.instituicao_1 || "—"} />
          <StatBlock label="Documentos" value={`${uploadedCount} / ${totalDocs}`} />
        </div>

        {/* 🌟 CONDICIONAL DE ACORDO COM O ESTADO DA CANDIDATURA */}

        {/* 1. CORREÇÃO SOLICITADA (PENDENTE_CORRECAO) */}
        {app.status === "pendente_correcao" && (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-500/10 p-5 shadow-2xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold text-amber-950 text-base">
                  Ação Requerida — Correção Solicitada
                </div>
                <p className="mt-1 text-xs text-amber-900/90 leading-relaxed">
                  {rejectedDocs.length > 0
                    ? `Foram identificadas pendências em ${rejectedDocs.length} documento(s). É necessário fazer o reenvio dos ficheiros assinalados.`
                    : "A equipa de análise solicitou correções na sua candidatura. Por favor, reveja os seus documentos e dados."}
                </p>
                <div className="mt-4">
                  <Button asChild className="gap-2 bg-amber-600 hover:bg-amber-700 font-bold text-white cursor-pointer shadow-xs">
                    <Link to="/candidatura/corrigir">
                      <RefreshCcw className="h-4 w-4" /> Corrigir Documentos <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. INCOMPLETA / RASCUNHO */}
        {(app.status === "incompleta" || app.status === "rascunho") && (
          <div className="mt-6 flex flex-wrap gap-3 pt-2">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer">
              <Link to="/candidatura/dados">Continuar candidatura</Link>
            </Button>
            <Button asChild variant="outline" className="cursor-pointer border-emerald-600 text-emerald-800 hover:bg-emerald-50">
              <Link to="/candidatura/documentos">Ir para documentos</Link>
            </Button>
          </div>
        )}

        {/* 3. AGUARDA VALIDAÇÃO OU EM ANÁLISE */}
        {(app.status === "aguarda_validacao" || app.status === "em_analise") && (
          <div className="mt-6 rounded-lg border border-sky-100 bg-sky-50/80 p-4 text-xs text-sky-900 leading-relaxed">
            ℹ️ A sua candidatura foi submetida e está atualmente em fase de verificação pelos Serviços de Ação Social da Câmara Municipal da Ribeira Brava. Será notificado por e-mail caso sejam necessárias correções.
          </div>
        )}

        {/* 4. APROVADA */}
        {app.status === "aprovada" && (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 leading-relaxed">
            🎉 <strong>Parabéns!</strong> A sua candidatura à Residência Universitária foi aprovada. A equipa do Município entrará em contacto para os procedimentos seguintes.
          </div>
        )}

        {/* 5. REJEITADA */}
        {app.status === "rejeitada" && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-900 leading-relaxed">
            ❌ O seu processo de candidatura foi indeferido. Para mais informações ou esclarecimentos, por favor contacte os Serviços Municipais.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatBlock({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-background/80 p-3 shadow-2xs">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-bold text-emerald-950">{value}</div>
    </div>
  );
}