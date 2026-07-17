import { useNavigate } from "react-router-dom"; 
import { useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext"; 
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/Button";
import { useI18n, useStore, DOC_LABELS } from "@/lib/providers";
import { Card, CardContent } from "@/components/ui/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { AlertTriangle, UploadCloud, CheckCircle2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { DocumentosAPI } from "@/services/api";

export default function FixDocs() {
  const { t } = useI18n();
  const { user, authenticated } = useContext(AuthContext); // Sessão real do aluno
  const { getApplicationForCurrent, updateApplication } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authenticated) navigate("/login");
  }, [authenticated, navigate]);

  const app = getApplicationForCurrent();
  if (!app) return null;

  const rejected = app.documents.filter((d) => d.status === "rejeitado");

  const reupload = async (type, file) => {
    const doc = app.documents.find((d) => d.type === type);
    try {
      if (doc?.id) {
        await DocumentosAPI.reenviar(doc.id, file);
      }
    } catch (err) {
      console.warn("[api] reenvio falhou, a atualizar localmente", err?.message);
    }
    
    const newDocs = app.documents.map((d) =>
      d.type === type ? { ...d, fileName: file.name, uploadedAt: new Date().toISOString(), status: "pendente", rejectionReason: undefined } : d
    );
    
    const stillRejected = newDocs.some((d) => d.status === "rejeitado");
    updateApplication(app.id, {
      documents: newDocs,
      status: stillRejected ? "pendente_correcao" : "em_analise"
    });
    toast.success(`${DOC_LABELS[type].pt} reenviado com sucesso`);
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-xs uppercase tracking-widest text-red-600 font-bold">
          Correção urgente
        </div>
        <h1 className="mt-1 font-display text-3xl font-bold text-emerald-950">
          Reenviar documentos rejeitados
        </h1>
        <div className="gov-gold-rule mt-2 w-16 bg-amber-500 h-0.5" />

        <Alert variant="destructive" className="mt-6 border-red-200 bg-red-50 text-red-900">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="font-bold text-red-800">Ação necessária</AlertTitle>
          <AlertDescription className="text-red-950/80">
            A equipa de análise do município rejeitou {rejected.length} documento(s).
            Reenvie apenas os ficheiros listados abaixo — os restantes dados da sua candidatura permanecem intactos.
          </AlertDescription>
        </Alert>

        {rejected.length === 0 ? (
          <Card className="mt-6 border-emerald-200 bg-emerald-50">
            <CardContent className="flex items-center gap-3 p-6">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <div>
                <div className="font-bold text-emerald-900">Nenhum documento rejeitado</div>
                <p className="text-sm text-emerald-950/80">A sua candidatura encontra-se em análise regular.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 space-y-4">
            {rejected.map((d) => (
              <Card key={d.type} className="border-red-200 bg-red-50/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-red-600">
                        Rejeitado
                      </div>
                      <div className="mt-1 font-display text-base font-bold text-emerald-950">
                        {DOC_LABELS[d.type].pt}
                      </div>
                      <p className="mt-2 text-sm text-foreground/90 bg-background p-2.5 rounded border border-border">
                        <span className="font-bold text-red-700">Motivo:</span> {d.rejectionReason ?? "—"}
                      </p>
                    </div>
                    <label className="shrink-0 cursor-pointer">
                      <Button asChild variant="destructive" className="gap-2 bg-red-600 hover:bg-red-700 text-white cursor-pointer">
                        <span>
                          <RefreshCcw className="h-4 w-4" /> Reenviar
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) reupload(d.type, f);
                            }}
                          />
                        </span>
                      </Button>
                    </label>
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    <UploadCloud className="h-4 w-4 text-emerald-600" />
                    Ficheiro anterior: <span className="font-medium text-foreground">{d.fileName}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Button variant="outline" onClick={() => navigate("/painel")} className="cursor-pointer">
            {t("back")}
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}