import { useEffect, useState, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { AdminShell, StatusBadge } from "@/components/AdminLayout";
import { statusMeta } from "@/lib/providers";

import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/Table";

import { Search, Eye, Filter, ArrowLeft, Archive, CheckCircle2, XCircle, Clock } from "lucide-react";
import { AdminAPI } from "@/services/api";

export default function AdminHistorico() {
  const { user, authenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [apps, setApps] = useState([]);
  const [anosLetivos, setAnosLetivos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados dos Filtros
  const [filtroAno, setFiltroAno] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [q, setQ] = useState("");

  const isAdminOrSuper = user?.tipo === "admin" || user?.tipo === "superadmin";

  // Verificação de Autenticação e Permissão
  useEffect(() => {
    if (!authenticated) navigate("/login");
    else if (!isAdminOrSuper) navigate("/painel");
  }, [authenticated, isAdminOrSuper, navigate]);

  // Carregar a lista de Anos Letivos registados na BD
  useEffect(() => {
    AdminAPI.obterAnosLetivos()
      .then((res) => {
        if (res.data?.ok) setAnosLetivos(res.data.anos || []);
      })
      .catch(() => {});
  }, []);

  // Carregar as candidaturas consoante os filtros de Ano e Estado
  useEffect(() => {
    if (!authenticated || !isAdminOrSuper) return;
    setLoading(true);

    AdminAPI.listarCandidaturas({
      ano_letivo: filtroAno,
      estado: filtroEstado
    })
      .then((res) => {
        const data = res?.data;
        if (Array.isArray(data)) setApps(data);
        else if (Array.isArray(data?.candidaturas)) setApps(data.candidaturas);
        else setApps([]);
      })
      .catch((err) => console.error("❌ Erro ao obter histórico:", err))
      .finally(() => setLoading(false));
  }, [filtroAno, filtroEstado, authenticated, isAdminOrSuper]);

  // Filtro de pesquisa de texto em memória (Nome, Curso ou E-mail)
  const filteredApps = useMemo(() => {
    const query = q.toLowerCase().trim();
    if (!query) return apps;

    return apps.filter((a) => {
      const nome = (a.nome_completo || "").toLowerCase();
      const email = (a.email || "").toLowerCase();
      const curso = (a.curso || "").toLowerCase();
      return nome.includes(query) || email.includes(query) || curso.includes(query);
    });
  }, [apps, q]);

  // Cálculo das métricas da pesquisa atual
  const metrics = useMemo(() => {
    return {
      total: filteredApps.length,
      aprovadas: filteredApps.filter(a => (a.estado || a.status) === 'aprovada').length,
      rejeitadas: filteredApps.filter(a => (a.estado || a.status) === 'rejeitada').length,
      pendentes: filteredApps.filter(a => !['aprovada', 'rejeitada'].includes(a.estado || a.status)).length,
    };
  }, [filteredApps]);

  return (
    <AdminShell title="Histórico Global de Candidaturas">
      {/* CABEÇALHO DA PÁGINA */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="cursor-pointer">
            <Link to="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
            </Link>
          </Button>
          <h1 className="font-display text-xl font-bold text-emerald-950 flex items-center gap-2">
            <Archive className="h-5 w-5 text-emerald-700" /> Histórico Geral de Processos
          </h1>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <Card className="mb-6 border-border">
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Dropdown por Ano Letivo */}
            <div>
              <label className="text-xs font-bold uppercase text-emerald-950 mb-1.5 block">
                Ano Letivo
              </label>
              <select
                value={filtroAno}
                onChange={(e) => setFiltroAno(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="todos">Todos os Anos Letivos</option>
                {anosLetivos.map((ano) => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>

            {/* Dropdown por Estado/Resultado */}
            <div>
              <label className="text-xs font-bold uppercase text-emerald-950 mb-1.5 block">
                Resultado / Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="todos">Todos os Resultados</option>
                <option value="aprovada">✅ Aprovadas</option>
                <option value="rejeitada">❌ Rejeitadas</option>
                <option value="pendente">⏳ Em Processamento / Pendentes</option>
              </select>
            </div>

            {/* Input de Pesquisa por Texto */}
            <div>
              <label className="text-xs font-bold uppercase text-emerald-950 mb-1.5 block">
                Pesquisa Direta
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Nome, curso ou e-mail..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARTÕES DE MÉTRICAS */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <div className="bg-card p-4 rounded-lg border border-border flex items-center gap-3 shadow-2xs">
          <Filter className="h-5 w-5 text-emerald-700" />
          <div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground">Total Filtrado</div>
            <div className="text-xl font-bold text-emerald-950">{metrics.total}</div>
          </div>
        </div>
        <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-200 flex items-center gap-3 shadow-2xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-800">Aprovadas</div>
            <div className="text-xl font-bold text-emerald-950">{metrics.aprovadas}</div>
          </div>
        </div>
        <div className="bg-red-50/50 p-4 rounded-lg border border-red-200 flex items-center gap-3 shadow-2xs">
          <XCircle className="h-5 w-5 text-red-600" />
          <div>
            <div className="text-[10px] uppercase font-bold text-red-800">Rejeitadas</div>
            <div className="text-xl font-bold text-red-950">{metrics.rejeitadas}</div>
          </div>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200 flex items-center gap-3 shadow-2xs">
          <Clock className="h-5 w-5 text-amber-600" />
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-800">Em Processo</div>
            <div className="text-xl font-bold text-amber-950">{metrics.pendentes}</div>
          </div>
        </div>
      </div>

      {/* TABELA COMPLETA */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-bold text-emerald-950">Nome do Candidato</TableHead>
                  <TableHead className="font-bold text-emerald-950">Ano Letivo</TableHead>
                  <TableHead className="font-bold text-emerald-950">Curso</TableHead>
                  <TableHead className="font-bold text-emerald-950">Estado</TableHead>
                  <TableHead className="text-right font-bold text-emerald-950">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground animate-pulse">
                      A carregar o histórico de processos...
                    </TableCell>
                  </TableRow>
                ) : filteredApps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      Nenhuma candidatura encontrada com os filtros selecionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApps.map((a) => {
                    const statusVal = a.estado || a.status || "rascunho";
                    const meta = statusMeta(statusVal) || { tone: "neutral", label: statusVal };
                    const appId = a.candidatura_id || a.id;

                    return (
                      <TableRow key={appId}>
                        <TableCell>
                          <div className="font-bold text-emerald-950">{a.nome_completo || "Candidato"}</div>
                          <div className="text-xs text-muted-foreground">{a.email}</div>
                        </TableCell>
                        <TableCell className="font-mono text-sm font-semibold text-emerald-800">
                          {a.ano_letivo || "—"}
                        </TableCell>
                        <TableCell className="text-sm font-medium">{a.curso || "—"}</TableCell>
                        <TableCell>
                          <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline" className="gap-1.5 cursor-pointer">
                            <Link to={`/admin/candidatura/${appId}`}>
                              <Eye className="h-3.5 w-3.5" /> Ver Ficha
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}