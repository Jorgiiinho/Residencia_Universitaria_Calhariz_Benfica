import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { UploadCloud, FileText, CheckCircle2, X, Send } from "lucide-react";
import { WizardHeader } from "./CandidaturaDados";

const ALL_DOC_TYPES = [
  'Formulario_candidatura',
  'CC',
  'Declaracao_Residencia',
  'Declaracao_Domicilio_Fiscal',
  'Comprovativo_Inscricao_Matricula',
  'Documento_bolsa_estudo',
  'IRS',
  'Comprovativos_Rendimento_Anuais'
];

const DOC_LABELS = {
  Formulario_candidatura: { pt: "Formulário de Candidatura Assinado", en: "Signed Application Form" },
  CC: { pt: "Cópia do Cartão de Cidadão", en: "ID Card Copy" },
  Declaracao_Residencia: { pt: "Declaração de Residência", en: "Residence Declaration" },
  Declaracao_Domicilio_Fiscal: { pt: "Declaração de Domicílio Fiscal", en: "Fiscal Domicile Declaration" },
  Comprovativo_Inscricao_Matricula: { pt: "Comprovativo de Inscrição / Matrícula", en: "Proof of Enrollment" },
  Documento_bolsa_estudo: { pt: "Documento de Bolsa de Estudo", en: "Scholarship Document" },
  IRS: { pt: "Declaração de IRS", en: "Tax Return (IRS)" },
  Comprovativos_Rendimento_Anuais: { pt: "Comprovativos de Rendimentos Anuais", en: "Annual Income Statements" }
};

export default function CandidaturaDocumentos() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [docs, setDocs] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🛡️ Segurança de Rota
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  //Carrega documentos já enviados
  useEffect(() => {
    const carregarDocumentos = async () => {
      try {
        const response = await api.get("/candidatura/minha");
        if (response.data && response.data.documentos) {
          setDocs(response.data.documentos);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) carregarDocumentos();
  }, [user]);

  //Enviar ficheiro PDF verdadeiro para o Backend
  const handleUpload = async (tipoDoc, file) => {
    if (file.type !== "application/pdf") {
      alert("Por favor, selecione apenas ficheiros PDF.");
      return;
    }

    try {
      setProgress((p) => ({ ...p, [tipoDoc]: 20 }));
      
      const formData = new FormData();
      formData.append("ficheiro", file); // Chave recebida pelo teu Multer no Backend
      formData.append("tipo_documento", tipoDoc);

      setProgress((p) => ({ ...p, [tipoDoc]: 60 }));

      const response = await api.post("/candidatura/documento", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.ok) {
        setProgress((p) => ({ ...p, [tipoDoc]: 100 }));
        
        // Atualiza o estado visual
        setDocs((prev) => {
          const filtered = prev.filter((d) => d.tipo !== tipoDoc);
          return [
            ...filtered,
            { tipo: tipoDoc, nome_ficheiro: file.name, estado: "pendente" }
          ];
        });

        setTimeout(() => {
          setProgress((p) => {
            const copy = { ...p };
            delete copy[tipoDoc];
            return copy;
          });
        }, 400);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar o ficheiro.");
      setProgress((p) => {
        const copy = { ...p };
        delete copy[tipoDoc];
        return copy;
      });
    }
  };

  // Remover documento do Backend
  const removeDoc = async (tipoDoc) => {
    try {
      const response = await api.delete(`/candidatura/documento/${tipoDoc}`);
      if (response.data.ok) {
        setDocs((d) => d.filter((x) => x.tipo !== tipoDoc));
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao remover documento.");
    }
  };

  const uploadedFor = (type) => docs.find((d) => d.tipo === type);
  const allUploaded = ALL_DOC_TYPES.every((t) => !!uploadedFor(t));

  //Submeter candidatura finalizada
  const submitFinal = async () => {
    try {
      const response = await api.put("/candidatura/submeter", { estado: "aguarda_validacao" });
      if (response.data.ok) {
        alert("Candidatura submetida com sucesso!");
        navigate("/painel");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar candidatura.");
    }
  };

  if (loading) return <div className="p-8 text-center">A carregar documentos...</div>;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <WizardHeader current={2} progress={45 + (docs.length / ALL_DOC_TYPES.length) * 50} />

        {error && <div className="mt-4 text-red-600 font-bold">⚠️ {error}</div>}

        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-bold text-deep">
              2. Upload de documentos
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Envie todos os documentos abaixo em formato PDF. Máx. 10MB por ficheiro.
            </p>
            <div className="gov-gold-rule mt-2 mb-6 w-12" />

            <div className="grid gap-4 sm:grid-cols-2">
              {ALL_DOC_TYPES.map((dt) => {
                const uploaded = uploadedFor(dt);
                const pct = progress[dt];
                const uploading = typeof pct === "number";
                return (
                  <div
                    key={dt}
                    className={`rounded-lg border-2 border-dashed p-4 transition ${
                      uploaded
                        ? "border-status-success/40 bg-status-success/5"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                          Obrigatório
                        </div>
                        <div className="font-display text-sm font-bold text-deep">
                          {DOC_LABELS[dt].pt}
                        </div>
                      </div>
                      {uploaded ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-status-success" />
                      ) : (
                        <UploadCloud className="h-5 w-5 shrink-0 text-muted-foreground" />
                      )}
                    </div>

                    {uploading && (
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}

                    {uploaded && !uploading && (
                      <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs">
                        <div className="flex min-w-0 items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-primary" />
                          <span className="truncate">{uploaded.nome_ficheiro || uploaded.fileName}</span>
                        </div>
                        <button
                          onClick={() => removeDoc(dt)}
                          className="text-status-danger hover:opacity-70"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {!uploaded && !uploading && (
                      <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium hover:bg-accent">
                        <UploadCloud className="h-4 w-4" />
                        Selecionar PDF
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUpload(dt, f);
                          }}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => navigate("/candidatura/dados")}>
            Voltar
          </Button>
          <Button
            size="lg"
            onClick={submitFinal}
            disabled={!allUploaded}
            className="gap-2"
          >
            <Send className="h-4 w-4" /> Submeter Candidatura
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}