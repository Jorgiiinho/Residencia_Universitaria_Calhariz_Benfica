import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext"; 
import { AdminShell, StatusBadge } from "@/components/AdminLayout"; 
import { useStore, statusMeta, DOC_LABELS } from "@/lib/providers";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/Table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/Dialog";
import { ArrowLeft, Check, X, Download, FileText, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminAPI, DocumentosAPI } from "@/services/api";

const STATES = [
  "incompleta",
  "aguarda_validacao",
  "em_analise",
  "pendente_correcao",
  "aprovada",
  "rejeitada",
  "arquivada"
];

export default function AppDetail() {
  const { id } = useParams(); // Captura dinâmica do ID da URL com react-router-dom
  const navigate = useNavigate();
  const { user: currentUser, authenticated } = useContext(AuthContext); // Sessão real do funcionário
  const { store, updateApplication } = useStore();

  useEffect(() => {
    if (!authenticated) navigate("/login");
    else if (currentUser?.tipo !== "admin") navigate("/painel");
  }, [currentUser, authenticated, navigate]);

  const app = store.applications.find((a) => a.id === id);
  const candidateUser = app ? store.users.find((u) => u.id === app.userId) : null;
  const [status, setStatus] = useState(app?.status);
  const [rejectFor, setRejectFor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [observacoes, setObservacoes] = useState("");

  if (!app || !candidateUser) {
    return (
      <AdminShell title="Candidatura não encontrada">
        <Button variant="outline" onClick={() => navigate("/admin/dashboard")} className="cursor-pointer">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
        </Button>
      </AdminShell>
    );
  }

  const setDocStatus = async (type, s, reason) => {
    const doc = app.documents.find((d) => d.type === type);
    try {
      if (doc?.id) {
        await DocumentosAPI.atualizarEstado(doc.id, s, reason);
      }
    } catch (err) {
      console.warn("[api] atualizar estado documento falhou", err?.message);
    }
    const newDocs = app.documents.map((d) =>
      d.type === type ? { ...d, status: s, rejectionReason: s === "rejeitado" ? reason : undefined } : d
    );
    updateApplication(app.id, { documents: newDocs });
    toast.success(s === "aprovado" ? "Documento aprovado" : "Documento rejeitado");
  };

  const saveStatus = async () => {
    if (!status) return;
    try {
      await AdminAPI.atualizarEstadoCandidatura(app.id, status, observacoes);
    } catch (err) {
      console.warn("[api] atualizar estado candidatura falhou", err?.message);
    }
    updateApplication(app.id, { status });
    toast.success("Decisão gravada e e-mail enviado ao aluno");
  };

  const meta = statusMeta(app.status);

  return (
    <AdminShell title={`Dossiê — ${candidateUser.firstName} ${candidateUser.lastName}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" asChild className="cursor-pointer">
          <Link to="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono text-xs text-muted-foreground">{app.id}</span>
          <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
        </div>
      </div>

      <Tabs defaultValue="dados">
        <TabsList className="bg-muted p-1 rounded-lg">
          <TabsTrigger value="dados" className="cursor-pointer">1. Dados Gerais</TabsTrigger>
          <TabsTrigger value="familia" className="cursor-pointer">2. Agregado Familiar</TabsTrigger>
          <TabsTrigger value="docs" className="cursor-pointer">3. Ficheiros e Validação</TabsTrigger>
          <TabsTrigger value="decisao" className="cursor-pointer">4. Decisão Global</TabsTrigger>
        </TabsList>

        <TabsContent value="dados">
          <Card className="mt-4 border-border">
            <CardContent className="p-6">
              <SectionTitle>Identificação</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Info label="Nome">{candidateUser.firstName} {candidateUser.lastName}</Info>
                <Info label="Email">{candidateUser.email}</Info>
                <Info label="Telefone">{app.personal.phone ?? "—"}</Info>
                <Info label="Data de nascimento">{app.personal.birthdate ?? "—"}</Info>
                <Info label="CC">{app.personal.ccNumber ?? "—"}</Info>
                <Info label="NIF">{app.personal.nif ?? "—"}</Info>
                <Info label="Morada" className="sm:col-span-2 lg:col-span-3">
                  {app.personal.address ?? "—"}, {app.personal.postalCode ?? "—"} {app.personal.city ?? ""}
                </Info>
              </div>

              <div className="my-6 border-t border-border" />

              <SectionTitle>Ensino Superior</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Info label="Instituição (1ª)">{app.personal.institution ?? "—"}</Info>
                <Info label="2ª preferência">{app.personal.institutionAlt2 ?? "—"}</Info>
                <Info label="3ª preferência">{app.personal.institutionAlt3 ?? "—"}</Info>
                <Info label="Curso">{app.personal.course ?? "—"}</Info>
                <Info label="Ano letivo">{app.personal.academicYear ?? "—"}</Info>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="familia">
          <Card className="mt-4 border-border">
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
                    {app.family.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                          Sem membros registados no agregado.
                        </TableCell>
                      </TableRow>
                    )}
                    {app.family.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium text-emerald-950">{m.fullName}</TableCell>
                        <TableCell className="font-mono text-xs">{m.nif}</TableCell>
                        <TableCell>{m.phone}</TableCell>
                        <TableCell>{m.kinship}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card className="mt-4 border-border">
            <CardContent className="p-6">
              <SectionTitle>Documentos submetidos</SectionTitle>
              <div className="space-y-3">
                {app.documents.map((d) => {
                  const tone = d.status === "aprovado" ? "success" : d.status === "rejeitado" ? "danger" : "neutral";
                  const currentLabel = d.status === "aprovado" ? "Aprovado" : d.status === "rejeitado" ? "Rejeitado" : "Pendente";
                  return (
                    <div key={d.type} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4 shadow-xs">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-display text-sm font-bold text-emerald-950">
                            {DOC_LABELS[d.type].pt}
                          </div>
                          <div className="truncate text-xs text-muted-foreground font-mono mt-0.5">
                            {d.fileName || "—"}
                          </div>
                          {d.rejectionReason && (
                            <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 w-fit">
                              Motivo: {d.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge tone={tone}>{currentLabel}</StatusBadge>
                        <Button size="sm" variant="ghost" className="gap-1.5 cursor-pointer">
                          <Download className="h-3.5 w-3.5" /> PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-emerald-500/50 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                          onClick={() => setDocStatus(d.type, "aprovado")}
                        >
                          <Check className="h-3.5 w-3.5" /> Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-red-500/50 text-red-600 hover:bg-red-50 cursor-pointer"
                          onClick={() => {
                            setRejectFor(d.type);
                            setRejectReason(d.rejectionReason ?? "");
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
          <Card className="mt-4 border-border">
            <CardContent className="p-6">
              <SectionTitle>Decisão global da candidatura</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Estado geral do processo
                  </label>
                  <Select value={status} onValueChange={(v) => setStatus(v)}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATES.map((s) => (
                        <SelectItem key={s} value={s}>{statusMeta(s).label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={saveStatus} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm">
                  <Save className="h-4 w-4" /> Guardar decisão
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground bg-slate-50 p-2.5 rounded border border-slate-100">
                A alteração do estado global gera uma notificação automatizada enviada diretamente para o e-mail do candidato.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent className="bg-background border border-border">
          <DialogHeader>
            <DialogTitle className="text-emerald-950 font-display">Motivo da rejeição</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Descreva detalhadamente o motivo da rejeição do documento para orientar o aluno..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectFor(null)} className="cursor-pointer">Cancelar</Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              onClick={() => {
                if (rejectFor && rejectReason.trim()) {
                  setDocStatus(rejectFor, "rejeitado", rejectReason.trim());
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
    </AdminShell>
  );
}

function SectionTitle({ children }) {
  return (
    <>
      <h3 className="font-display text-base font-bold text-emerald-900">{children}</h3>
      <div className="gov-gold-rule mt-1 mb-4 w-10 bg-amber-500 h-0.5" />
    </>
  );
}

function Info({ label, children, className }) {
  return (
    <div className={className}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-emerald-950">{children}</div>
    </div>
  );
}