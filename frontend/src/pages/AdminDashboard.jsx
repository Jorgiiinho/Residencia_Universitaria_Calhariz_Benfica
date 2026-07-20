import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { AdminShell, StatusBadge } from "@/components/AdminLayout";
import { useStore, statusMeta, useI18n } from "@/lib/providers";

import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/Dialog";

import { Users, ClipboardList, CheckCircle2, XCircle, Search, Eye, MessageSquare, Send, User, Calendar } from "lucide-react";
import { AdminAPI } from "@/services/api";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { t } = useI18n();
  const { store, updateApplication } = useStore();
  const { user, authenticated } = useContext(AuthContext); // Sessão real do utilizador
  const navigate = useNavigate();
  
  const [q, setQ] = useState("");
  const [remoteApps, setRemoteApps] = useState(null);

  // Estado para a Modal de Observações
  const [obsApp, setObsApp] = useState(null); // Candidatura selecionada para ver/escrever obs
  const [novaObservacao, setNovaObservacao] = useState("");
  const [savingObs, setSavingObs] = useState(false);

  // Segurança de Rota
  useEffect(() => {
    if (!authenticated) {
      navigate("/login");
    } else if (user?.tipo !== "admin") {
      navigate("/painel");
    }
  }, [user, authenticated, navigate]);

  // Chamada à API para listar candidaturas
  useEffect(() => {
    if (!authenticated || user?.tipo !== "admin") return;
    
    AdminAPI.listarCandidaturas()
      .then((res) => {
        const data = res?.data;
        if (Array.isArray(data)) {
          setRemoteApps(data);
        } else if (Array.isArray(data?.candidaturas)) {
          setRemoteApps(data.candidaturas);
        } else if (Array.isArray(data?.data)) {
          setRemoteApps(data.data);
        } else if (Array.isArray(data?.applications)) {
          setRemoteApps(data.applications);
        } else {
          setRemoteApps([]);
        }
      })
      .catch((err) => {
        console.error("❌ [AdminDashboard API] Erro ao listar candidaturas:", err);
        setRemoteApps(null);
      });
  }, [user, authenticated]);

  const apps = (remoteApps && remoteApps.length > 0) 
    ? remoteApps 
    : (store?.applications ?? []);

  const metrics = useMemo(
    () => ({
      total: apps.length,
      pending: apps.filter((a) => ["aguarda_validacao", "em_analise", "incompleta", "pendente_correcao", "rascunho"].includes(a?.status)).length,
      approved: apps.filter((a) => a?.status === "aprovada").length,
      rejected: apps.filter((a) => a?.status === "rejeitada").length
    }),
    [apps]
  );

  // Extração universal de dados para a tabela
  const extractAppData = (a, usersList) => {
    const currentUserId = a.userId || a.user_id;
    const u = usersList?.find((x) => String(x.id) === String(currentUserId));

    let personal = {};
    let academic = {};
    try { personal = typeof a.personal === 'string' ? JSON.parse(a.personal || '{}') : (a.personal || {}); } catch (e) {}
    try { academic = typeof a.academic === 'string' ? JSON.parse(a.academic || '{}') : (a.academic || {}); } catch (e) {}

    const firstName = personal.firstName || personal.nome || a.first_name || a.firstName || a.user_nome || u?.firstName || u?.nome || "";
    const lastName = personal.lastName || personal.apelido || a.last_name || a.lastName || a.user_apelido || u?.lastName || u?.apelido || "";
    
    let candidateName = `${firstName} ${lastName}`.trim() || a.email || u?.email || "Candidato";
    const course = personal.course || personal.curso || academic.course || academic.curso || a.course || a.curso || "—";
    const academicYear = personal.academicYear || personal.anoLectivo || academic.academicYear || a.academicYear || a.anoLectivo || "—";

    return { candidateName, course, academicYear };
  };

  const filtered = apps.filter((a) => {
    const { candidateName, course } = extractAppData(a, store?.users);
    const processId = String(a.id || a.candidatura_id || "").toLowerCase();
    const query = q.toLowerCase();

    return !q || candidateName.toLowerCase().includes(query) || processId.includes(query) || course.toLowerCase().includes(query);
  });

  // Função para Guardar uma Nova Observação
  const handleAdicionarObservacao = async () => {
    if (!novaObservacao.trim() || !obsApp) return;

    setSavingObs(true);
    const adminNome = `${user?.nome || user?.firstName || 'Admin'} ${user?.apelido || user?.lastName || ''}`.trim();
    const dataHora = new Date().toLocaleString("pt-PT");

    // Formato da entrada de observação
    const novaEntrada = `[${dataHora}] ${adminNome}: ${novaObservacao.trim()}`;

    // Concatena com as observações já existentes
    const observacoesExistentes = obsApp.observacoes || "";
    const observacoesAtualizadas = observacoesExistentes 
      ? `${observacoesExistentes}\n\n${novaEntrada}` 
      : novaEntrada;

    try {
      await AdminAPI.atualizarEstadoCandidatura(
        obsApp.id, 
        obsApp.status || "em_analise", 
        observacoesAtualizadas
      );

      // Atualiza o estado localmente
      const appAtualizada = { ...obsApp, observacoes: observacoesAtualizadas };
      setObsApp(appAtualizada);
      
      if (remoteApps) {
        setRemoteApps(remoteApps.map((a) => String(a.id) === String(obsApp.id) ? appAtualizada : a));
      }
      updateApplication(obsApp.id, { observacoes: observacoesAtualizadas });

      setNovaObservacao("");
      toast.success("Observação registada com sucesso!");
    } catch (err) {
      console.error("❌ Erro ao guardar observação:", err);
      toast.error("Não foi possível guardar a observação no servidor.");
    } finally {
      setSavingObs(false);
    }
  };

  const isAdmin = user?.tipo === "admin";

  return (
    <AdminShell title={t("admin_dashboard")}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Users} label={t("total_registered")} value={metrics.total} tone="deep" />
        <MetricCard icon={ClipboardList} label={t("pending")} value={metrics.pending} tone="warn" />
        <MetricCard icon={CheckCircle2} label={t("approved")} value={metrics.approved} tone="success" />
        <MetricCard icon={XCircle} label={t("rejected")} value={metrics.rejected} tone="danger" />
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-deep">Candidaturas</h2>
              <p className="text-xs text-muted-foreground">
                Todos os processos submetidos por candidatos.
              </p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, ID ou curso..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>{t("process_id")}</TableHead>
                  <TableHead>{t("candidate")}</TableHead>
                  <TableHead>{t("course")}</TableHead>
                  <TableHead>{t("academic_year")}</TableHead>
                  <TableHead>{t("state")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                      Nenhuma candidatura encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((a, index) => {
                  const { candidateName, course, academicYear } = extractAppData(a, store?.users);
                  const meta = statusMeta(a.status || "rascunho") || { tone: "neutral", label: a.status || "Sem Estado" };
                  const appId = a.id ?? a.candidatura_id;

                  return (
                    <TableRow key={appId ? String(appId) : `app-${index}`}>
                      <TableCell className="font-mono text-xs">{appId || "—"}</TableCell>
                      <TableCell className="font-medium">
                        {candidateName}
                      </TableCell>
                      <TableCell>{course}</TableCell>
                      <TableCell>{academicYear}</TableCell>
                      <TableCell>
                        <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* 🌟 BOTÃO OBSERVAÇÕES */}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-1.5 cursor-pointer border-slate-300 hover:bg-slate-100"
                            onClick={() => setObsApp(a)}
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-slate-600" /> Observações
                          </Button>

                          {/* BOTÃO VER PROCESSO */}
                          <Button asChild size="sm" variant="outline" className="gap-1.5 cursor-pointer">
                            <Link to={`/admin/candidatura/${appId}`}>
                              <Eye className="h-3.5 w-3.5" /> {t("view_process")}
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

      {/* 🌟 MODAL DE OBSERVAÇÕES DO PROCESSO */}
      <Dialog open={!!obsApp} onOpenChange={(o) => !o && setObsApp(null)}>
        <DialogContent className="max-w-lg bg-background border border-border">
          <DialogHeader>
            <DialogTitle className="text-emerald-950 font-display flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" /> Observações — Processo #{obsApp?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Histórico de Notas */}
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Histórico de Notas Internas
            </div>
            
            <div className="max-h-60 overflow-y-auto rounded-md border border-border bg-slate-50 p-3 space-y-2">
              {obsApp?.observacoes ? (
                obsApp.observacoes.split("\n\n").map((nota, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded border border-slate-200 text-xs shadow-2xs">
                    <p className="whitespace-pre-wrap text-slate-800 font-medium">{nota}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Ainda não existem observações registadas neste processo.
                </p>
              )}
            </div>

            {/* Campo de Escrita - APENAS PARA ADMINISTRADORES */}
            {isAdmin ? (
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-semibold uppercase tracking-wider text-emerald-950">
                  Adicionar Nova Observação (Visível para Administradores)
                </label>
                <Textarea
                  value={novaObservacao}
                  onChange={(e) => setNovaObservacao(e.target.value)}
                  placeholder="Escreva notas técnicas ou apontamentos sobre o candidato..."
                  rows={3}
                />
              </div>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
                🔒 Apenas administradores têm permissão para adicionar novas observações.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setObsApp(null)} className="cursor-pointer">
              Fechar
            </Button>
            {isAdmin && (
              <Button 
                onClick={handleAdicionarObservacao} 
                disabled={savingObs || !novaObservacao.trim()}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" /> Adicionar Nota
              </Button>
            )}
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
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </div>
          <div className="font-display text-2xl font-bold text-deep">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}