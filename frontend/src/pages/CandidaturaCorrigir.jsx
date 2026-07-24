import { useNavigate } from "react-router-dom"; 
import { useEffect, useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext"; 
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/Button";
import { useI18n, useStore, DOC_LABELS } from "@/lib/providers";
import { Card, CardContent } from "@/components/ui/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { 
  AlertTriangle, 
  UploadCloud, 
  CheckCircle2, 
  RefreshCcw, 
  Edit3, 
  Send, 
  FileText,
  Lock 
} from "lucide-react";
import { toast } from "sonner";
import { DocumentosAPI, CandidaturaAPI } from "@/services/api";

export default function FixDocs() {
  const { t } = useI18n();
  const { authenticated } = useContext(AuthContext); 
  const { store, getApplicationForCurrent, updateApplication } = useStore();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);

  // 🌟 VERIFICAÇÃO DO PERÍODO E DA CANDIDATURA
  const isPeriodOpen = store?.isPeriodOpen ?? store?.periodoAberto ?? store?.periodo_aberto ?? true;
  const app = getApplicationForCurrent();
  const currentStatus = app?.status || app?.estado;
  const isPendenteCorrecao = currentStatus === "pendente_correcao";

  // 🌟 TRANCAGEM DE SEGURANÇA DA ROTA
  useEffect(() => {
    if (!authenticated) {
      navigate("/login");
      return;
    }

    if (!isPeriodOpen) {
      toast.error("O período de candidaturas encontra-se encerrado. Não é possível realizar correções.");
      navigate("/painel");
      return;
    }

    if (app && !isPendenteCorrecao) {
      toast.error("A sua candidatura não se encontra em estado de correção.");
      navigate("/painel");
      return;
    }
  }, [authenticated, isPeriodOpen, isPendenteCorrecao, app, navigate]);

  // ECRÃ CASO NÃO HOUVER CANDIDATURA OU ACESSO SEJA BLOQUEADO
  if (!app || !isPeriodOpen || !isPendenteCorrecao) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="p-8 flex flex-col items-center gap-4">
              <Lock className="h-10 w-10 text-amber-700" />
              <h2 className="font-display text-xl font-bold text-amber-950">
                {!isPeriodOpen ? "Período de Candidaturas Encerrado" : "Acesso Não Permitido"}
              </h2>
              <p className="text-sm text-amber-900/80 max-w-md">
                {!isPeriodOpen 
                  ? "O período oficial de submissão e alteração de candidaturas está de momento encerrado pelo Município."
                  : "A sua candidatura não necessita de correções neste momento."}
              </p>
              <Button onClick={() => navigate("/painel")} className="mt-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Voltar ao Painel
              </Button>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  // 1. Extração segura de Documentos Rejeitados
  const rawDocs = Array.isArray(app.documents) ? app.documents : (Array.isArray(app.documentos) ? app.documentos : []);
  const rejected = rawDocs.filter((d) => (d.status === "rejeitado" || d.estado === "rejeitado"));

  // Reenviar Ficheiro Rejeitado
  const reupload = async (type, file) => {
    const doc = rawDocs.find((d) => (d.type || d.tipo || d.tipo_documento) === type);
    try {
      if (doc?.id) {
        await DocumentosAPI.reenviar(doc.id, file);
      }
    } catch (err) {
      console.warn("[api] Reenvio falhou na API, a guardar localmente", err?.message);
    }
    
    const newDocs = rawDocs.map((d) => {
      const currentType = d.type || d.tipo || d.tipo_documento;
      if (currentType === type) {
        return { 
          ...d, 
          fileName: file.name, 
          uploadedAt: new Date().toISOString(), 
          status: "pendente", 
          estado: "pendente",
          rejectionReason: undefined 
        };
      }
      return d;
    });
    
    updateApplication(app.id, { documents: newDocs });
    toast.success(`Ficheiro (${DOC_LABELS[type]?.pt || type}) carregado com sucesso!`);
  };

  // Concluir Correções e Retornar para "Aguarda Validação"
  const handleFinalizarCorrecoes = async () => {
    setSubmitting(true);
    try {
      if (CandidaturaAPI?.atualizarEstado) {
        await CandidaturaAPI.atualizarEstado(
          app.id, 
          "aguarda_validacao", 
          "Candidato concluiu e submeteu as correções solicitadas."
        );
      }

      updateApplication(app.id, { 
        status: "aguarda_validacao", 
        estado: "aguarda_validacao" 
      });

      toast.success("Correções submetidas! O seu processo voltou ao estado 'Aguarda Validação'.");
      navigate("/painel");
    } catch (err) {
      console.error("Erro ao finalizar correções:", err);
      toast.error("Ocorreu um erro ao submeter as correções. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-xs uppercase tracking-widest text-amber-600 font-bold">
          Ação Necessária
        </div>
        <h1 className="mt-1 font-display text-3xl font-bold text-emerald-950">
          Corrigir Candidatura
        </h1>
        <div className="gov-gold-rule mt-2 mb-6 w-16 bg-amber-500 h-0.5" />

        {/* ALERTA PRINCIPAL */}
        <Alert variant="destructive" className="border-amber-300 bg-amber-50 text-amber-950">
          <AlertTriangle className="h-5 w-5 text-amber-700" />
          <AlertTitle className="font-bold text-amber-900 text-base">
            O seu processo necessita de correções
          </AlertTitle>
          <AlertDescription className="mt-2 text-sm text-amber-900/90 leading-relaxed">
            A equipa de análise do município solicitou revisões na sua candidatura antes de prosseguir com a validação.
          </AlertDescription>
        </Alert>

        {/* ÁREA DE CORREÇÃO DE DADOS DO FORMULÁRIO */}
        <Card className="mt-6 border-slate-200 bg-card">
          <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-700">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-emerald-950">Dados Pessoais e Académicos</div>
                <p className="text-xs text-muted-foreground">
                  Altere NIF, Morada, Contactos, Agregado Familiar ou Opções de Curso.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/candidatura/dados")} 
              variant="outline"
              className="gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 cursor-pointer font-semibold"
            >
              <Edit3 className="h-4 w-4" /> Editar Formulário
            </Button>
          </CardContent>
        </Card>

        {/* ÁREA DE CORREÇÃO DE DOCUMENTOS (SE HOUVER REJEITADOS) */}
        <div className="mt-8">
          <h2 className="font-display text-lg font-bold text-emerald-950 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" /> 
            Documentos Rejeitados ({rejected.length})
          </h2>

          {rejected.length === 0 ? (
            <Card className="mt-3 border-emerald-200 bg-emerald-50/60">
              <CardContent className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-900 font-medium">
                  Não existem ficheiros PDF rejeitados. Se alterou os dados pessoais no botão acima, pode concluir a correção abaixo.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-3 space-y-4">
              {rejected.map((d) => {
                const typeKey = d.type || d.tipo || d.tipo_documento;
                const labelName = DOC_LABELS[typeKey]?.pt || typeKey;

                return (
                  <Card key={typeKey} className="border-red-200 bg-red-50/40">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                            Revisão Solicitada
                          </div>
                          <div className="mt-0.5 font-display text-base font-bold text-emerald-950">
                            {labelName}
                          </div>
                          {d.rejectionReason && (
                            <p className="mt-2 text-xs text-red-900 bg-white p-2.5 rounded border border-red-200">
                              <span className="font-bold text-red-700">Motivo da rejeição:</span> {d.rejectionReason}
                            </p>
                          )}
                        </div>

                        <label className="shrink-0 cursor-pointer">
                          <Button asChild variant="destructive" className="gap-2 bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-xs">
                            <span>
                              <RefreshCcw className="h-4 w-4" /> Reenviar Ficheiro
                              <input
                                type="file"
                                accept="application/pdf,image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) reupload(typeKey, f);
                                }}
                              />
                            </span>
                          </Button>
                        </label>
                      </div>

                      <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-white px-3 py-1.5 text-xs text-muted-foreground">
                        <UploadCloud className="h-4 w-4 text-emerald-600 shrink-0" />
                        Ficheiro atual: <span className="font-mono font-medium text-foreground truncate">{d.fileName || d.nome_ficheiro || "Documento anexado"}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTÃO FINAL DE SUBMISSÃO DAS CORREÇÕES */}
        <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
          <Button variant="outline" onClick={() => navigate("/painel")} className="cursor-pointer">
            {t("back") || "Voltar ao Painel"}
          </Button>

          <Button 
            size="lg" 
            onClick={handleFinalizarCorrecoes}
            disabled={submitting}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-bold shadow-md"
          >
            <Send className="h-4 w-4" /> 
            {submitting ? "A submeter..." : "Concluir e Submeter Correção"}
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}