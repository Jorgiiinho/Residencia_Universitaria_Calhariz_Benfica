import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
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
import { ArrowLeft, Check, X, Download, FileText, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { AdminAPI, DocumentosAPI } from "@/services/api";

//ESTADOS MANUAIS PERMITIDOS AO ADMINISTRADOR
const ADMIN_MANUAL_STATES = [
  "em_analise",
  "pendente_correcao",
  "aprovada",
  "rejeitada",
  "arquivada"
];

// Auxiliares de parsing seguro para JSONs/Arrays
const parseData = (data) => {
  if (!data) return {};
  if (typeof data === "string") {
    try { return JSON.parse(data); } catch (e) { return {}; }
  }
  return typeof data === "object" ? data : {};
};

const parseArray = (data) => {
  if (!data) return [];
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }
  return Array.isArray(data) ? data : [];
};

export default function AppDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, authenticated } = useContext(AuthContext);
  const { store, updateApplication } = useStore();

  const [remoteApp, setRemoteApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [rejectFor, setRejectFor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const transitionTriggered = useRef(false);

  // 1. DECLARAÇÃO DE 'app' NO TOPO (Evita ReferenceError)
  const app = remoteApp || store?.applications?.find((a) => String(a.id) === String(id));
  const currentUserId = app?.userId || app?.user_id;
  const storeUser = store?.users?.find((u) => String(u.id) === String(currentUserId));

  // 2. SEGURANÇA DE ACESSO À ROTA
  useEffect(() => {
    if (!authenticated) navigate("/login");
    else if (currentUser?.tipo !== "admin") navigate("/painel");
  }, [currentUser, authenticated, navigate]);

  // 3. OBTENÇÃO DOS DADOS DA API
  useEffect(() => {
    if (!id || !authenticated || currentUser?.tipo !== "admin") return;

    setLoading(true);
    AdminAPI.obterCandidatura(id)
      .then((res) => {
        const data = res?.data;
        console.log("📥 [AppDetail API] Candidatura recebida:", data);

        if (data?.ok && data?.candidatura) {
          const fullApp = {
            ...data.candidatura,
            family: data.agregado_familiar || data.agregado || data.candidatura.family || [],
            documents: data.documentos || data.ficheiros || data.candidatura.documents || [],
          };
          setRemoteApp(fullApp);
          if (fullApp.status) setStatus(fullApp.status);
        } else if (data?.id) {
          setRemoteApp(data);
          if (data.status) setStatus(data.status);
        }
      })
      .catch((err) => {
        console.warn("⚠️ [AppDetail API] Erro ao buscar via API:", err?.message);
      })
      .finally(() => setLoading(false));
  }, [id, authenticated, currentUser]);

  // 4. TRANSIÇÃO AUTOMÁTICA PARA "EM ANÁLISE" E NOTIFICAÇÃO
  useEffect(() => {
    if (!app || transitionTriggered.current) return;

    const currentStatus = app.status || "rascunho";

    if (["aguarda_validacao", "incompleta", "rascunho"].includes(currentStatus)) {
      transitionTriggered.current = true;
      const autoMsg = "O seu processo deu entrada em análise técnica pelos serviços do Município da Ribeira Brava.";

      console.log(`🚀 [Auto-Status] A alterar o processo #${app.id} para 'em_analise'...`);

      setStatus("em_analise");
      if (remoteApp) setRemoteApp((prev) => ({ ...prev, status: "em_analise" }));
      updateApplication(app.id, { status: "em_analise" });

      AdminAPI.atualizarEstadoCandidatura(app.id, "em_analise", autoMsg)
        .then(() => {
          toast.success("Processo transitado para 'Em Análise' e notificação enviada.");
        })
        .catch((err) => {
          console.warn("⚠️ [Auto-Status] Alterado no ecrã. Aviso do servidor:", err?.message);
        });
    }
  }, [app, remoteApp, updateApplication]);

  // 5. SINCRONIZA ESTADO SELECCIONADO
  useEffect(() => {
    if (app?.status && !status) {
      setStatus(app.status);
    }
  }, [app, status]);

  // CARREGAMENTO E ERRO
  if (loading && !app) {
    return (
      <AdminShell title="A carregar processo...">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </AdminShell>
    );
  }

  if (!app) {
    return (
      <AdminShell title="Candidatura não encontrada">
        <div className="p-6 text-center">
          <p className="mb-4 text-muted-foreground">Não foi possível localizar o processo #{id}.</p>
          <Button variant="outline" onClick={() => navigate("/admin/dashboard")} className="cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
          </Button>
        </div>
      </AdminShell>
    );
  }

  // EXTRAÇÃO DE DADOS
  const personal = parseData(app.personal);
  const academic = parseData(app.academic);

  // Agregado Familiar
  let family = parseArray(app.family);
  if (family.length === 0) family = parseArray(app.agregado_familiar);
  if (family.length === 0) family = parseArray(app.agregado);

  // Documentos
  let documents = parseArray(app.documents);
  if (documents.length === 0) documents = parseArray(app.documentos);
  if (documents.length === 0) documents = parseArray(app.ficheiros);

  // Nome e Contactos
  const firstName = personal.firstName || personal.nome || app.first_name || app.firstName || app.user_nome || storeUser?.firstName || storeUser?.nome || app.nome || "";
  const lastName = personal.lastName || personal.apelido || app.last_name || app.lastName || app.user_apelido || storeUser?.lastName || storeUser?.apelido || app.apelido || "";
  const candidateName = `${firstName} ${lastName}`.trim() || app.email || storeUser?.email || "Candidato";
  const candidateEmail = storeUser?.email || app.email || app.user_email || personal.email || "—";

  // MAPA TOTAL DOS DADOS DO CANDIDATO (INCLUI 'freguesia' E 'parish')
  const candidateInfo = {
    telefone: personal.phone || personal.telefone || app.telefone || app.phone || app.telemovel || "—",
    birthdate: personal.birthdate || personal.dataNascimento || personal.data_nascimento || app.data_nascimento || app.dataNascimento || app.birthdate || "—",
    cc: personal.ccNumber || personal.cc || app.cc || app.num_cc || app.cartao_cidadao || app.ccNumber || "—",
    nif: personal.nif || app.nif || "—",
    
    // RESGUARDO PARA 'freguesia' (BD) E 'parish' (Frontend/JSON)
    freguesia: personal.freguesia || personal.parish || app.freguesia || app.parish || 
               personal.freguesiaOrigem || personal.freguesia_origem || app.freguesia_origem || 
               app.freguesiaOrigem || app.freguesia_nome || "—",
               
    morada: personal.address || personal.morada || app.morada || app.address || "—",
    codigoPostal: personal.postalCode || personal.codigoPostal || personal.codigo_postal || app.codigo_postal || app.codigoPostal || app.postalCode || "—",
    localidade: personal.city || personal.localidade || app.localidade || app.cidade || app.city || "",
    
    // Ensino Superior
    instituicao: personal.institution || academic.institution || app.instituicao || app.instituicao_ensino || app.institution || "—",
    instituicaoAlt2: personal.institutionAlt2 || academic.institutionAlt2 || app.instituicao_alt2 || app.institutionAlt2 || "—",
    instituicaoAlt3: personal.institutionAlt3 || academic.institutionAlt3 || app.instituicao_alt3 || app.institutionAlt3 || "—",
    curso: personal.course || academic.course || app.curso || app.course || "—",
    anoLectivo: personal.academicYear || academic.academicYear || app.anoLectivo || app.ano_lectivo || app.ano_letivo || app.academicYear || "—"
  };

  // AÇÕES SOBRE DOCUMENTOS
  const setDocStatus = async (type, s, reason) => {
    const doc = documents.find((d) => (d.type || d.tipo || d.tipo_documento) === type);
    try {
      if (doc?.id) {
        await DocumentosAPI.atualizarEstado(doc.id, s, reason);
      }
    } catch (err) {
      console.warn("[api] atualizar estado documento falhou", err?.message);
    }
    const newDocs = documents.map((d) =>
      (d.type || d.tipo || d.tipo_documento) === type ? { ...d, status: s, rejectionReason: s === "rejeitado" ? reason : undefined } : d
    );
    
    updateApplication(app.id, { documents: newDocs });
    if (remoteApp) setRemoteApp((prev) => ({ ...prev, documents: newDocs }));
    toast.success(s === "aprovado" ? "Documento aprovado" : "Documento rejeitado");
  };

  // DECISÃO GLOBAL
  const saveStatus = async () => {
    if (!status) return;
    try {
      await AdminAPI.atualizarEstadoCandidatura(app.id, status, observacoes);
      toast.success("Decisão gravada com sucesso! E-mail de notificação enviado ao candidato.");
    } catch (err) {
      console.warn("[api] atualizar estado candidatura falhou", err?.message);
      toast.error("Decisão salva localmente no painel.");
    }
    
    updateApplication(app.id, { status });
    if (remoteApp) setRemoteApp((prev) => ({ ...prev, status }));
  };

  const meta = statusMeta(status || app.status || "em_analise") || { tone: "neutral", label: status || "Em Análise" };

  return (
    <AdminShell title={`Dossiê — ${candidateName}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" asChild className="cursor-pointer">
          <Link to="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono text-xs text-muted-foreground">ID: {app.id}</span>
          <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
        </div>
      </div>

      <Tabs defaultValue="dados">
        <TabsList className="bg-muted p-1 rounded-lg">
          <TabsTrigger value="dados" className="cursor-pointer">1. Dados Gerais</TabsTrigger>
          <TabsTrigger value="familia" className="cursor-pointer">2. Agregado Familiar ({family.length})</TabsTrigger>
          <TabsTrigger value="docs" className="cursor-pointer">3. Ficheiros e Validação ({documents.length})</TabsTrigger>
          <TabsTrigger value="decisao" className="cursor-pointer font-semibold text-emerald-900">4. Decisão Global</TabsTrigger>
        </TabsList>

        {/* SECÇÃO 1: DADOS GERAIS */}
        <TabsContent value="dados">
          <Card className="mt-4 border-border">
            <CardContent className="p-6">
              <SectionTitle>Identificação do Candidato</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Info label="Nome Completo">{candidateName}</Info>
                <Info label="Email">{candidateEmail}</Info>
                <Info label="Telefone">{candidateInfo.telefone}</Info>
                <Info label="Data de Nascimento">{candidateInfo.birthdate}</Info>
                <Info label="Cartão de Cidadão / CC">{candidateInfo.cc}</Info>
                <Info label="NIF">{candidateInfo.nif}</Info>
                <Info label="Freguesia de Origem">{candidateInfo.freguesia}</Info>
                <Info label="Morada de Residência" className="sm:col-span-2 lg:col-span-2">
                  {candidateInfo.morada} {candidateInfo.codigoPostal !== "—" ? `, ${candidateInfo.codigoPostal}` : ""} {candidateInfo.localidade}
                </Info>
              </div>

              <div className="my-6 border-t border-border" />

              <SectionTitle>Ensino Superior</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Info label="Instituição (1ª Opção)">{candidateInfo.instituicao}</Info>
                <Info label="2ª Preferência">{candidateInfo.instituicaoAlt2}</Info>
                <Info label="3ª Preferência">{candidateInfo.instituicaoAlt3}</Info>
                <Info label="Curso">{candidateInfo.curso}</Info>
                <Info label="Ano Letivo">{candidateInfo.anoLectivo}</Info>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECÇÃO 2: AGREGADO FAMILIAR */}
        <TabsContent value="familia">
          <Card className="mt-4 border-border">
            <CardContent className="p-6">
              <SectionTitle>Membros do Agregado Familiar</SectionTitle>
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
                    {family.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                          Nenhum membro do agregado familiar registado neste processo.
                        </TableCell>
                      </TableRow>
                    )}
                    {family.map((m, idx) => (
                      <TableRow key={m.id || `fam-${idx}`}>
                        <TableCell className="font-medium text-emerald-950">{m.fullName || m.nome || m.nome_completo || "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{m.nif || "—"}</TableCell>
                        <TableCell>{m.phone || m.telefone || "—"}</TableCell>
                        <TableCell>{m.kinship || m.parentesco || m.grau_parentesco || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECÇÃO 3: DOCUMENTOS E VALIDAÇÃO */}
        <TabsContent value="docs">
          <Card className="mt-4 border-border">
            <CardContent className="p-6">
              <SectionTitle>Documentos Submetidos pelo Candidato</SectionTitle>
              <div className="space-y-3">
                {documents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6 border rounded-lg bg-slate-50">
                    Nenhum ficheiro foi anexado a este processo até ao momento.
                  </p>
                )}
                {documents.map((d, idx) => {
                  const docType = d.type || d.tipo || d.tipo_documento || `doc-${idx}`;
                  const docStatus = d.status || d.estado || "pendente";
                  const tone = docStatus === "aprovado" ? "success" : docStatus === "rejeitado" ? "danger" : "neutral";
                  const currentLabel = docStatus === "aprovado" ? "Aprovado" : docStatus === "rejeitado" ? "Rejeitado" : "Pendente";
                  const labelDoc = DOC_LABELS[docType]?.pt || docType;
                  
                  // Resguardo de URL para visualização do PDF
                  const fileUrl = d.url || d.caminho || d.path || d.fileUrl || (d.fileName ? `http://localhost:5000/uploads/${d.fileName}` : null);

                  return (
                    <div key={docType || idx} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4 shadow-xs">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-display text-sm font-bold text-emerald-950">
                            {labelDoc}
                          </div>
                          <div className="truncate text-xs text-muted-foreground font-mono mt-0.5">
                            {d.fileName || d.nome_ficheiro || d.nome || "Ficheiro Anexo"}
                          </div>
                          {d.rejectionReason && (
                            <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 w-fit">
                              Motivo da rejeição: {d.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge tone={tone}>{currentLabel}</StatusBadge>
                        {fileUrl && (
                          <Button size="sm" variant="ghost" className="gap-1.5 cursor-pointer" onClick={() => window.open(fileUrl, "_blank")}>
                            <Download className="h-3.5 w-3.5" /> Abrir PDF
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-emerald-500/50 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                          onClick={() => setDocStatus(docType, "aprovado")}
                        >
                          <Check className="h-3.5 w-3.5" /> Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-red-500/50 text-red-600 hover:bg-red-50 cursor-pointer"
                          onClick={() => {
                            setRejectFor(docType);
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

        {/* SECÇÃO 4: DECISÃO GLOBAL */}
        <TabsContent value="decisao">
          <Card className="mt-4 border-border">
            <CardContent className="p-6">
              <SectionTitle>Decisão Global do Município</SectionTitle>
              
              <div className="mb-4">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Observações / Justificação (Enviadas no e-mail ao candidato)
                </label>
                <Textarea 
                  className="mt-2"
                  placeholder="Escreva notas ou informações que devam constar da notificação por e-mail..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Selecione a Decisão do Processo
                  </label>
                  <Select value={status} onValueChange={(v) => setStatus(v)}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ADMIN_MANUAL_STATES.map((s) => (
                        <SelectItem key={s} value={s}>{statusMeta(s).label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={saveStatus} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm font-bold">
                  <Send className="h-4 w-4" /> Guardar Decisão e Notificar Candidato
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground bg-slate-50 p-3 rounded border border-slate-200">
                💡 <strong>Garantia de Notificação:</strong> Qualquer alteração guardada nesta secção envia um e-mail direto para <strong>{candidateEmail}</strong> com o novo estado e a mensagem fornecida.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIÁLOGO DE MOTIVO DE REJEIÇÃO DE DOCUMENTO */}
      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent className="bg-background border border-border">
          <DialogHeader>
            <DialogTitle className="text-emerald-950 font-display">Motivo da Rejeição do Documento</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Descreva detalhadamente a razão da rejeição do ficheiro..."
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
              Confirmar Rejeição
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