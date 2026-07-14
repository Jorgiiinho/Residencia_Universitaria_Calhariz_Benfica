import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AdminLayout, StatusBadge } from "../components/AdminLayout";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/Table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/Select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/Dialog";
import { ArrowLeft, Check, X, Download, FileText, Save } from "lucide-react";

// Dicionário dos documentos do Candidato
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
const STATES = [
  "rascunho",
  "aguarda_documentos",
  "aguarda_validacao",
  "em_analise",
  "pendente_correcao",
  "aprovado",
  "rejeitado",
  "arquivado",
];

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
    case 'arquivada':
      return { tone: 'neutral', label: 'Arquivada' };
    default:
      return { tone: 'neutral', label: estado || 'Incompleta' };
  }
};

export default function DetalhesCandidatura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [candidatura, setCandidatura] = useState(null);
  const [candidato, setCandidato] = useState(null);
  const [familia, setFamilia] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  
  const [status, setStatus] = useState(undefined);
  const [rejectFor, setRejectFor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(true);

  // 🛡️ Segurança
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.tipo !== "admin") {
      navigate("/painel");
    }
  }, [user, navigate]);

  // 📥 LIGAÇÃO REAL: Vai buscar os dados unificados da candidatura do aluno
  useEffect(() => {
    const carregarDossie = async () => {
      try {
        const response = await api.get(`/admin/candidatura/${id}`); // Rota detalhada do backend
        if (response.data) {
          setCandidatura(response.data.candidatura);
          setCandidato(response.data.candidato); // O utilizador dono da candidatura
          setFamilia(response.data.familia || []); // Se tiveres agregado
          setDocumentos(response.data.documentos || []); // Os ficheiros do upload
          setStatus(response.data.candidatura.estado);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) carregarDossie();
  }, [id]);

  if (loading) return <div className="p-8">A carregar dossiê técnico...</div>;

  if (!candidatura || !candidato) {
    return (
      <AdminLayout title="Candidatura não encontrada">
        <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </AdminLayout>
    );
  }

  // ⚡ LIGAÇÃO REAL: Aprovar ou rejeitar documento individual
  const updateDocStatus = async (docType, novoEstado, motivo = "") => {
    try {
      const response = await api.put(`/admin/candidatura/${id}/documento`, {
        tipo_documento: docType,
        estado: novoEstado,
        motivo_rejeicao: motivo
      });

      if (response.data.ok) {
        // Atualiza a lista localmente para refletir o ecrã instantaneamente
        setDocumentos(prev =>
          prev.map((d) => d.tipo === docType ? { ...d, estado: novoEstado, motivo_rejeicao: motivo } : d)
        );
        alert(novoEstado === "aprovado" ? "Documento aprovado com sucesso!" : "Documento rejeitado com sucesso!");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao alterar o estado do documento.");
    }
  };

  // ⚡ LIGAÇÃO REAL: Atualizar decisão global da candidatura
  const saveStatus = async () => {
    if (!status) return;
    try {
      const response = await api.put(`/admin/candidatura/${id}/estado`, { estado: status });
      if (response.data.ok) {
        alert("Estado geral da candidatura atualizado com sucesso!");
        // Atualiza candidatura local
        setCandidatura(prev => ({ ...prev, estado: status }));
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao guardar a decisão global.");
    }
  };

  const meta = statusMeta(candidatura.estado);

  return (
    <AdminLayout title={`Dossiê — ${candidato.nome} ${candidato.apelido}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono text-xs text-muted-foreground">Processo #{candidatura.id}</span>
          <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
        </div>
      </div>

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">1. Dados Gerais</TabsTrigger>
          <TabsTrigger value="familia">2. Agregado Familiar</TabsTrigger>
          <TabsTrigger value="docs">3. Ficheiros e Validação</TabsTrigger>
          <TabsTrigger value="decisao">4. Decisão Global</TabsTrigger>
        </TabsList>

        <TabsContent value="dados">
          <Card className="mt-4">
            <CardContent className="p-6">
              <SectionTitle>Identificação</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Info label="Nome">{candidato.nome} {candidato.apelido}</Info>
                <Info label="Email">{candidato.email}</Info>
                <Info label="Telefone">{candidatura.telefone ?? "—"}</Info>
                <Info label="Data de nascimento">{candidatura.data_nascimento ?? "—"}</Info>
                <Info label="CC">{candidatura.num_cc ?? "—"}</Info>
                <Info label="NIF">{candidatura.nif ?? "—"}</Info>
                <Info label="Morada" className="sm:col-span-2 lg:col-span-3">
                  {candidatura.morada ?? "—"}, {candidatura.codigo_postal ?? "—"}
                </Info>
              </div>

              <div className="my-6 border-t border-border" />

              <SectionTitle>Ensino Superior</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Info label="Instituição (1ª)">{candidatura.instituicao_1 ?? "—"}</Info>
                <Info label="2ª preferência">{candidatura.instituicao_2 ?? "—"}</Info>
                <Info label="3ª preferência">{candidatura.instituicao_3 ?? "—"}</Info>
                <Info label="Curso">{candidatura.curso ?? "—"}</Info>
                <Info label="Ano letivo">{candidatura.ano_letivo ?? "—"}</Info>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="familia">
          <Card className="mt-4">
            <CardContent className="p-6">
              <SectionTitle>Membros do agregado familiar</SectionTitle>
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Nome completo</TableHead>
                      <TableHead>NIF</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Parentesco</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {familia.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                          Sem membros registados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      familia.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.fullName || m.nome}</TableCell>
                          <TableCell className="font-mono text-xs">{m.nif}</TableCell>
                          <TableCell>{m.phone || m.telefone || "—"}</TableCell>
                          <TableCell>{m.kinship || m.parentesco}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card className="mt-4">
            <CardContent className="p-6">
              <SectionTitle>Documentos submetidos</SectionTitle>
              <div className="space-y-3">
                {documentos.map((d) => {
                  const tone = d.estado === "aprovado" ? "success" : d.estado === "rejeitado" ? "danger" : "neutral";
                  const label = d.estado === "aprovado" ? "Aprovado" : d.estado === "rejeitado" ? "Rejeitado" : "Pendente";
                  return (
                    <div
                      key={d.tipo}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-display text-sm font-bold text-deep">
                            {DOC_LABELS[d.tipo]?.pt || d.tipo}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {d.nome_ficheiro || "—"}
                          </div>
                          {d.motivo_rejeicao && (
                            <div className="mt-1 text-xs text-status-danger">
                              Motivo: {d.motivo_rejeicao}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge tone={tone}>{label}</StatusBadge>
                        <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => window.open(`${api.defaults.baseURL}/ficheiros/${d.caminho_ficheiro}`, "_blank")}>
                          <Download className="h-3.5 w-3.5" /> PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-status-success/50 text-status-success hover:bg-status-success/10"
                          onClick={() => updateDocStatus(d.tipo, "aprovado")}
                        >
                          <Check className="h-3.5 w-3.5" /> Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-status-danger/50 text-status-danger hover:bg-status-danger/10"
                          onClick={() => {
                            setRejectFor(d.tipo);
                            setRejectReason(d.motivo_rejeicao ?? "");
                          }}
                        >
                          <X className="h-3.5 w-3.5" /> Rejeitar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisao">
          <Card className="mt-4">
            <CardContent className="p-6">
              <SectionTitle>Decisão global da candidatura</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Estado geral
                  </label>
                  <Select value={status} onValueChange={(v) => setStatus(v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {statusMeta(s).label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={saveStatus} className="gap-2">
                  <Save className="h-4 w-4" /> Guardar decisão
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                A alteração do estado é registada e o candidato é notificado por email.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motivo da rejeição</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Descreva o motivo da rejeição do documento..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectFor(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (rejectFor && rejectReason.trim()) {
                  updateDocStatus(rejectFor, "rejeitado", rejectReason.trim());
                  setRejectFor(null);
                  setRejectReason("");
                }
              }}
            >
              Confirmar rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function SectionTitle({ children }) {
  return (
    <>
      <h3 className="font-display text-base font-bold text-deep">{children}</h3>
      <div className="gov-gold-rule mt-1 mb-4 w-10" />
    </>
  );
}

function Info({ label, children, className }) {
  return (
    <div className={className}>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}