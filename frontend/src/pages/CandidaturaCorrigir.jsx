import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, UploadCloud, CheckCircle2, RefreshCcw } from "lucide-react";

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

export default function CandidaturaCorrigir() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Segurança de Rota
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Carrega documentos devolvidos com rejeição do Backend
  const carregarRejeitados = async () => {
    try {
      const response = await api.get("/candidatura/minha");
      if (response.data && response.data.documentos) {
        setDocs(response.data.documentos);
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao obter documentos para correção.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) carregarRejeitados();
  }, [user]);

  // Filtra apenas os que têm o estado "rejeitado" no teu Backend
  const rejected = docs.filter((d) => d.estado === "rejeitado" || d.status === "rejeitado");

  // Reenviar o novo ficheiro PDF correto
  const reupload = async (tipoDoc, file) => {
    if (file.type !== "application/pdf") {
      alert("Selecione apenas ficheiros em formato PDF.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("ficheiro", file);
      formData.append("tipo_documento", tipoDoc);

      const response = await api.post("/candidatura/documento", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.ok) {
        alert("Documento reenviado com sucesso!");
        
        // Atualiza a lista para ver se ainda falta algum por corrigir
        await carregarRejeitados();
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao reenviar o documento.");
    }
  };

  if (loading) return <div className="p-8 text-center">A obter dados de correção...</div>;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-xs uppercase tracking-widest text-status-danger font-semibold">
          Correção urgente necessária
        </div>
        <h1 className="mt-1 font-display text-3xl font-bold text-deep">
          Reenviar documentos rejeitados
        </h1>
        <div className="gov-gold-rule mt-2 w-16" />

        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ação necessária</AlertTitle>
          <AlertDescription>
            A equipa de análise do município rejeitou {rejected.length} documento(s).
            Reenvie apenas os ficheiros listados abaixo — os restantes dados da sua candidatura permanecem intactos.
          </AlertDescription>
        </Alert>

        {rejected.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="flex items-center gap-3 p-6">
              <CheckCircle2 className="h-6 w-6 text-status-success" />
              <div>
                <div className="font-semibold text-foreground">Todos os documentos corrigidos!</div>
                <p className="text-sm text-muted-foreground">A candidatura voltou para a fila de análise.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 space-y-4">
            {rejected.map((d) => (
              <Card key={d.tipo} className="border-status-danger/40 bg-status-danger/5">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-status-danger">
                        Rejeitado
                      </div>
                      <div className="mt-1 font-display text-base font-bold text-deep">
                        {DOC_LABELS[d.tipo]?.pt || d.tipo}
                      </div>
                      <p className="mt-2 text-sm text-foreground/80">
                        <span className="font-semibold">Motivo:</span> {d.motivo_rejeicao || d.rejectionReason || "Não especificado"}
                      </p>
                    </div>
                    <label className="shrink-0 cursor-pointer">
                      <Button asChild variant="destructive" className="gap-2">
                        <span>
                          <RefreshCcw className="h-4 w-4" /> Reenviar
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) reupload(d.tipo, f);
                            }}
                          />
                        </span>
                      </Button>
                    </label>
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    <UploadCloud className="h-4 w-4" />
                    Ficheiro anterior: {d.nome_ficheiro || d.fileName || "—"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Button variant="outline" onClick={() => navigate("/painel")}>
            Voltar ao Painel
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}