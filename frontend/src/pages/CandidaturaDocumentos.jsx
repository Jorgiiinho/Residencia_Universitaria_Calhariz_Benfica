import { useNavigate } from "react-router-dom"; 
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext"; 
import { PublicLayout } from "@/components/PublicLayout"; 
import { Button } from "@/components/ui/Button";
import { 
  useI18n, 
  useStore, 
  ALL_DOC_TYPES, 
  REQUIRED_DOC_TYPES, 
  DOC_LABELS, 
  DOC_BACKEND_ENUM 
} from "@/lib/providers";
import { Card, CardContent } from "@/components/ui/Card";
import { UploadCloud, FileText, CheckCircle2, X, Send } from "lucide-react";
import { toast } from "sonner";
import { WizardHeader } from "./CandidaturaDados"; 
import { CandidaturaAPI, DocumentosAPI } from "@/services/api";

const SERVER_BASE_URL = (import.meta.env?.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

export default function WizardDocs() {
  const { t } = useI18n();
  const { user, authenticated } = useContext(AuthContext); 
  const { store, updateApplication, syncCandidatura } = useStore();
  const navigate = useNavigate();

  const currentUserId = user?.id || user?.userId;
  const app = store.applications.find((a) => String(a.userId) === String(currentUserId)) || null;
  
  const [docs, setDocs] = useState([]);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    if (!authenticated) navigate("/login");
  }, [authenticated, navigate]);

  useEffect(() => {
    if (authenticated && !app && syncCandidatura && user) {
      syncCandidatura(user.id || user.userId, user.role || user.tipo);
    }
  }, [authenticated, app, syncCandidatura, user]);

  useEffect(() => {
    if (app?.documents) {
      setDocs(app.documents);
    }
  }, [app]);

  if (!app) {
    return (
      <PublicLayout>
        <div className="flex h-[50vh] items-center justify-center text-emerald-950 font-medium animate-pulse">
          A carregar dossiê de candidatura...
        </div>
      </PublicLayout>
    );
  }

  const handleUpload = async (type, file) => {
    setProgress((p) => ({ ...p, [type]: 10 }));
    try {
      // Mapeia para o tipo do ENUM exato na base de dados
      const tipoBackend = DOC_BACKEND_ENUM[type] ?? type;
      const candidatoId = app.id; 
      
      await DocumentosAPI.upload(candidatoId, tipoBackend, file);
      
      setProgress((p) => ({ ...p, [type]: 100 }));
      toast.success(`${DOC_LABELS[type]?.pt || type} carregado com sucesso.`);
    } catch (err) {
      console.error("❌ [Docs] Erro no upload:", err);
      setProgress((p) => ({ ...p, [type]: 100 }));
      toast.error("Erro ao carregar ficheiro. Verifique o formato.");
    }
    
    setDocs((prev) => {
      const filtered = prev.filter((d) => d.type !== type);
      return [
        ...filtered,
        { type, fileName: file.name, uploadedAt: new Date().toISOString(), status: "pendente" },
      ];
    });
    
    setTimeout(() => setProgress((p) => {
      const c = { ...p };
      delete c[type];
      return c;
    }), 400);
  };

  const removeDoc = (type) => setDocs((d) => d.filter((x) => x.type !== type));
  const uploadedFor = (type) => docs.find((d) => d.type === type);

  // VERIFICA APENAS SE OS DOCUMENTOS OBRIGATÓRIOS FORAM CARREGADOS
  const allUploaded = REQUIRED_DOC_TYPES.every((t2) => !!uploadedFor(t2));

  // Cálculo de progresso visual no Wizard
  const countUploadedRequired = REQUIRED_DOC_TYPES.filter((t2) => !!uploadedFor(t2)).length;
  const wizardProgress = 45 + (countUploadedRequired / REQUIRED_DOC_TYPES.length) * 50;

  const submitFinal = async () => {
    try {
      await CandidaturaAPI.submeter(app.id);
    } catch (err) {
      console.warn("[api] submeter falhou", err?.message);
    }
    updateApplication(app.id, { documents: docs, status: "aguarda_validacao" });
    toast.success("Candidatura submetida com sucesso!");
    navigate("/painel");
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <WizardHeader current={2} progress={wizardProgress} />

        <Card className="mt-6 border-border shadow-xs">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-bold text-emerald-900">
              2. Upload de documentos
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Para o Cartão de Cidadão, aceitamos PDF ou Imagem (JPG, PNG). Os restantes devem ser ficheiros PDF.
            </p>
            <div className="gov-gold-rule mt-2 mb-6 w-12 bg-amber-500 h-0.5" />

            <div className="grid gap-4 sm:grid-cols-2">
              {ALL_DOC_TYPES.map((dt) => {
                const uploaded = uploadedFor(dt);
                const pct = progress[dt];
                const uploading = typeof pct === "number";
                const isRequired = REQUIRED_DOC_TYPES.includes(dt);
                const isCC = dt === "CC_frente" || dt === "CC_verso";
                const metaDoc = DOC_LABELS[dt] || {};

                return (
                  <div
                    key={dt}
                    className={`rounded-xl border-2 border-dashed p-4 transition flex flex-col justify-between ${
                      uploaded 
                        ? "border-emerald-500/40 bg-emerald-500/5" 
                        : "border-border bg-muted/30 hover:border-emerald-500/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className={`text-[11px] font-bold uppercase tracking-wider ${
                            isRequired 
                              ? "text-emerald-700" 
                              : "text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded w-fit border border-amber-300"
                          }`}>
                            {isRequired ? "Obrigatório" : "Opcional"}
                          </div>
                          <div className="font-display text-sm font-bold text-emerald-950 mt-1">
                            {metaDoc.pt || dt}
                          </div>
                        </div>
                        {uploaded ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                        ) : (
                          <UploadCloud className="h-5 w-5 shrink-0 text-muted-foreground" />
                        )}
                      </div>

                      {metaDoc.desc && (
                        <p className="mt-1.5 text-xs text-muted-foreground leading-snug">
                          {metaDoc.desc}
                        </p>
                      )}
                    </div>

                    <div>
                      {uploading && (
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      )}

                      {uploaded && !uploading && (
                        <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs">
                          <div className="flex min-w-0 items-center gap-2">
                            <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                            <a 
                              href={`${SERVER_BASE_URL}/uploads/${uploaded.fileName}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="truncate font-medium text-emerald-700 hover:underline cursor-pointer"
                            >
                              {uploaded.fileName}
                            </a>
                          </div>
                          <button 
                            onClick={() => removeDoc(dt)} 
                            className="text-red-500 hover:opacity-70 cursor-pointer p-1"
                            title="Remover ficheiro"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {!uploaded && !uploading && (
                        <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                          <UploadCloud className="h-4 w-4 text-muted-foreground" />
                          {isCC ? "Selecionar ficheiro" : "Selecionar PDF"}
                          <input
                            type="file"
                            accept={isCC ? "application/pdf, image/jpeg, image/jpg, image/png" : "application/pdf"}
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleUpload(dt, f);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate("/candidatura/dados")} className="cursor-pointer">
            {t("back") || "Voltar"}
          </Button>
          <Button 
            size="lg" 
            onClick={submitFinal} 
            disabled={!allUploaded} 
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> {t("submit_final") || "Submeter Candidatura"}
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}