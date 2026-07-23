import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { AdminShell, StatusBadge } from "@/components/AdminLayout";
import { useStore, statusMeta, useI18n } from "@/lib/providers";

import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/Table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/Dialog";

import { 
  Users, 
  ClipboardList, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Eye, 
  MessageSquare, 
  Send, 
  Power, 
  Calendar, 
  Archive 
} from "lucide-react";
import { AdminAPI, ConfigAPI } from "@/services/api";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { t } = useI18n();
  const { store, updateApplication } = useStore();
  const { user, authenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [q, setQ] = useState("");
  const [remoteApps, setRemoteApps] = useState(null);

  // Modal de Observações
  const [obsApp, setObsApp] = useState(null);
  const [novaObservacao, setNovaObservacao] = useState("");
  const [savingObs, setSavingObs] = useState(false);

  // Modal de Gestão do Período (SuperAdmin)
  const [periodoModal, setPeriodoModal] = useState(false);
  const [candidaturasAbertas, setCandidaturasAbertas] = useState(true);
  const [anoLetivo, setAnoLetivo] = useState("2026/2027");
  const [savingPeriodo, setSavingPeriodo] = useState(false);

  const isSuperAdmin = user?.tipo === "superadmin";
  const isAdminOrSuper = user?.tipo === "admin" || user?.tipo === "superadmin";

  useEffect(() => {
    if (!authenticated) {
      navigate("/login", { replace: true });
    } else if (user && !isAdminOrSuper) {
      navigate("/painel", { replace: true });
    }
  }, [authenticated, user, isAdminOrSuper, navigate]);

  // Carregar dados iniciais do período ativo
  useEffect(() => {
    ConfigAPI.obterEstadoPeriodo()
      .then((res) => {
        if (res.data?.ok) {
          setCandidaturasAbertas(res.data.candidaturasAbertas);
          if (res.data.anoLetivo) setAnoLetivo(res.data.anoLetivo);
        }
      })
      .catch(() => {});
  }, []);

  // Carregar APENAS candidaturas do Ano Letivo Ativo
  useEffect(() => {
    if (!authenticated || !isAdminOrSuper) return;
    
    AdminAPI.listarCandidaturas({ apenas_atual: "true" })
      .then((res) => {
        const data = res?.data;
        if (Array.isArray(data)) setRemoteApps(data);
        else if (Array.isArray(data?.candidaturas)) setRemoteApps(data.candidaturas);
        else setRemoteApps([]);
      })
      .catch((err) => console.error("❌ Erro ao listar candidaturas:", err));
  }, [user, authenticated, isAdminOrSuper, location.pathname]);

  const apps = useMemo(() => {
    const localApps = store?.applications ?? [];
    if (!remoteApps || remoteApps.length === 0) return localApps;

    return remoteApps.map((remote) => {
      const remoteId = String(remote.id || remote.candidatura_id);
      const localApp = localApps.find((a) => String(a.id || a.candidatura_id) === remoteId);
      return localApp ? { ...remote, ...localApp } : remote;
    });
  }, [remoteApps, store?.applications]);

  // Métricas do Ano Ativo
  const metrics = useMemo(
    () => ({
      total: apps.length,
      pending: apps.filter((a) => ["aguarda_validacao", "em_analise", "incompleta", "pendente_correcao", "rascunho"].includes(a?.status || a?.estado)).length,
      approved: apps.filter((a) => (a?.status || a?.estado) === "aprovada").length,
      rejected: apps.filter((a) => (a?.status || a?.estado) === "rejeitada").length
    }),
    [apps]
  );

  const extractAppData = (a, usersList) => {
    const currentUserId = a.userId || a.user_id;
    const u = usersList?.find((x) => String(x.id) === String(currentUserId));

    let personal = {};
    let candidato = {};
    try { personal = typeof a.personal === 'string' ? JSON.parse(a.personal || '{}') : (a.personal || {}); } catch (e) {}
    try { candidato = typeof a.candidato === 'string' ? JSON.parse(a.candidato || '{}') : (a.candidato || {}); } catch (e) {}

    const firstName = personal.firstName || personal.nome || candidato.nome || a.first_name || u?.nome || "";
    const lastName = personal.lastName || personal.apelido || candidato.apelido || a.last_name || u?.apelido || "";
    
    let candidateName = a.nome_completo || candidato.nome_completo || `${firstName} ${lastName}`.trim() || a.email || u?.email || "Candidato";
    const course = personal.course || personal.curso || candidato.curso || a.course || a.curso || "—";
    const academicYear = personal.academicYear || candidato.ano_letivo || a.academicYear || a.ano_letivo || "—";
    const nif = personal.nif || candidato.nif || a.nif || "";

    return { candidateName, course, academicYear, nif };
  };

  const filtered = apps.filter((a) => {
    const { candidateName, course, nif } = extractAppData(a, store?.users);
    const query = q.toLowerCase().trim();

    return (
      !query ||
      candidateName.toLowerCase().includes(query) ||
      course.toLowerCase().includes(query) ||
      String(nif).toLowerCase().includes(query)
    );
  });

  // Guardar Estado do Período (SuperAdmin)
  const handleGuardarPeriodo = async () => {
    setSavingPeriodo(true);
    try {
      await AdminAPI.togglePeriodoCandidaturas(candidaturasAbertas, anoLetivo);
      toast.success("Definições do período atualizadas com sucesso!");
      setPeriodoModal(false);
    } catch (err) {
      toast.error("Erro ao guardar definições do período.");
    } finally {
      setSavingPeriodo(false);
    }
  };

  // Adicionar Observação
  const handleAdicionarObservacao = async () => {
    if (!novaObservacao.trim() || !obsApp) return;

    setSavingObs(true);
    const adminNome = `${user?.nome || 'Admin'} ${user?.apelido || ''}`.trim();
    const dataHora = new Date().toLocaleString("pt-PT");

    const novaEntrada = `[${dataHora}] ${adminNome}: ${novaObservacao.trim()}`;
    const observacoesExistentes = obsApp.observacoes || "";
    const observacoesAtualizadas = observacoesExistentes 
      ? `${observacoesExistentes}\n\n${novaEntrada}` 
      : novaEntrada;

    try {
      await AdminAPI.atualizarEstadoCandidatura(obsApp.id || obsApp.candidatura_id, obsApp.status || obsApp.estado || "em_analise", observacoesAtualizadas);

      const appAtualizada = { ...obsApp, observacoes: observacoesAtualizadas };
      setObsApp(appAtualizada);
      if (remoteApps) {
        setRemoteApps(remoteApps.map((a) => String(a.id || a.candidatura_id) === String(obsApp.id || obsApp.candidatura_id) ? appAtualizada : a));
      }
      updateApplication(obsApp.id || obsApp.candidatura_id, { observacoes: observacoesAtualizadas });

      setNovaObservacao("");
      toast.success("Observação registada com sucesso!");
    } catch (err) {
      toast.error("Não foi possível guardar a observação.");
    } finally {
      setSavingObs(false);
    }
  };

  return (
    <AdminShell title={t("admin_dashboard") || "Painel de Administração"}>
      {/* BARRA SUPER ADMIN */}
      {isSuperAdmin && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-emerald-800" />
            <div>
              <div className="text-sm font-bold text-emerald-950">
                Estado Atual: {candidaturasAbertas ? "🟢 Candidaturas Abertas" : "🔴 Candidaturas Fechadas"}
              </div>
              <div className="text-xs text-emerald-700">Ano Letivo Ativo: <strong>{anoLetivo}</strong></div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button 
              onClick={() => setPeriodoModal(true)} 
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-2 cursor-pointer"
            >
              <Power className="h-4 w-4" /> Gerir Período
            </Button>
          </div>
        </div>
      )}

      {/* METRICAS DO ANO ATIVO */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Users} label="Registados (Ano Ativo)" value={metrics.total} tone="deep" />
        <MetricCard icon={ClipboardList} label="Pendentes" value={metrics.pending} tone="warn" />
        <MetricCard icon={CheckCircle2} label="Aprovados" value={metrics.approved} tone="success" />
        <MetricCard icon={XCircle} label="Rejeitados" value={metrics.rejected} tone="danger" />
      </div>

      {/* TABELA DE CANDIDATURAS */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-deep">Candidaturas ({anoLetivo})</h2>
              <p className="text-xs text-muted-foreground">Processos submetidos para o ano letivo em vigor.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* BOTÃO PARA O HISTÓRICO GLOBAL */}
              <Button asChild variant="outline" size="sm" className="gap-2 border-emerald-600 text-emerald-800 hover:bg-emerald-50 cursor-pointer">
                <Link to="/admin/historico">
                  <Archive className="h-4 w-4" /> Histórico Global
                </Link>
              </Button>

              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-bold text-emerald-950">Nome do Candidato</TableHead>
                  <TableHead className="font-bold text-emerald-950">Curso</TableHead>
                  <TableHead className="font-bold text-emerald-950">Ano Letivo</TableHead>
                  <TableHead className="font-bold text-emerald-950">Estado</TableHead>
                  <TableHead className="text-right font-bold text-emerald-950">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                      Nenhuma candidatura encontrada para o ano letivo {anoLetivo}.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((a, index) => {
                  const { candidateName, course, academicYear, nif } = extractAppData(a, store?.users);
                  const statusVal = a.status || a.estado || "rascunho";
                  const meta = statusMeta(statusVal) || { tone: "neutral", label: statusVal };
                  const appId = a.id ?? a.candidatura_id;

                  return (
                    <TableRow key={appId ? String(appId) : `app-${index}`}>
                      <TableCell>
                        <div className="font-bold text-emerald-950">{candidateName}</div>
                        {nif && <div className="text-[11px] font-mono text-muted-foreground">NIF: {nif}</div>}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{course}</TableCell>
                      <TableCell className="text-sm font-semibold text-emerald-800">{academicYear}</TableCell>
                      <TableCell>
                        <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-1.5 cursor-pointer border-slate-300 hover:bg-slate-100"
                            onClick={() => setObsApp(a)}
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-slate-600" /> Observações
                          </Button>

                          <Button asChild size="sm" variant="outline" className="gap-1.5 cursor-pointer">
                            <Link to={`/admin/candidatura/${appId}`}>
                              <Eye className="h-3.5 w-3.5" /> Ver Processo
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL DE GESTÃO DO PERÍODO (SUPER ADMIN) */}
      <Dialog open={periodoModal} onOpenChange={setPeriodoModal}>
        <DialogContent className="max-w-md bg-background border border-border">
          <DialogHeader>
            <DialogTitle className="text-emerald-950 font-display flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" /> Gerir Período de Candidaturas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="space-y-1.5">
              <Label htmlFor="anoLetivo">Ano Letivo de Candidatura</Label>
              <Input
                id="anoLetivo"
                placeholder="Ex: 2026/2027"
                value={anoLetivo}
                onChange={(e) => setAnoLetivo(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <Label>Estado das Candidaturas</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={candidaturasAbertas ? "default" : "outline"}
                  className={`flex-1 cursor-pointer ${candidaturasAbertas ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                  onClick={() => setCandidaturasAbertas(true)}
                >
                  🟢 Abertas
                </Button>
                <Button
                  type="button"
                  variant={!candidaturasAbertas ? "destructive" : "outline"}
                  className="flex-1 cursor-pointer"
                  onClick={() => setCandidaturasAbertas(false)}
                >
                  🔴 Fechadas
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setPeriodoModal(false)} className="cursor-pointer">
              Cancelar
            </Button>
            <Button 
              onClick={handleGuardarPeriodo} 
              disabled={savingPeriodo || !anoLetivo.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-bold"
            >
              {savingPeriodo ? "A guardar..." : "Guardar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE OBSERVAÇÕES */}
      <Dialog open={!!obsApp} onOpenChange={(o) => !o && setObsApp(null)}>
        <DialogContent className="max-w-lg bg-background border border-border">
          <DialogHeader>
            <DialogTitle className="text-emerald-950 font-display flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" /> Observações — {obsApp ? extractAppData(obsApp, store?.users).candidateName : "Candidato"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Histórico de Notas Internas</div>
            <div className="max-h-60 overflow-y-auto rounded-md border border-border bg-slate-50 p-3 space-y-2">
              {obsApp?.observacoes ? (
                obsApp.observacoes.split("\n\n").map((nota, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded border border-slate-200 text-xs shadow-2xs">
                    <p className="whitespace-pre-wrap text-slate-800 font-medium">{nota}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Ainda não existem observações registadas neste processo.</p>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-semibold uppercase tracking-wider text-emerald-950">Adicionar Nova Observação</label>
              <Textarea
                value={novaObservacao}
                onChange={(e) => setNovaObservacao(e.target.value)}
                placeholder="Escreva notas técnicas..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setObsApp(null)} className="cursor-pointer">Fechar</Button>
            <Button 
              onClick={handleAdicionarObservacao} 
              disabled={savingObs || !novaObservacao.trim()}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" /> Adicionar Nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  const bg = {
    deep: "bg-deep text-deep-foreground",
    warn: "bg-status-warn/10 text-status-warn",
    success: "bg-status-success/10 text-status-success",
    danger: "bg-status-danger/10 text-status-danger"
  }[tone] || "bg-muted text-foreground";

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-md ${bg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="font-display text-2xl font-bold text-deep">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}