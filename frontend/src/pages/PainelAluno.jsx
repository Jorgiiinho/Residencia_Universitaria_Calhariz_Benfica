import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { StatusBadge } from "../components/AdminLayout";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilePlus, AlertTriangle, CheckCircle2, Clock, FileCheck2, ArrowRight } from "lucide-react";

export default function PainelAluno() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const carregarEstadoCandidatura = async () => {
      try {
        const response = await api.get("/candidatura/minha");
        if (response.data) {
          setApp(response.data.candidatura || response.data);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setApp(null); // Aluno novo, sem candidatura
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) carregarEstadoCandidatura();
  }, [user]);

  if (loading) return <div className="p-8 text-center">A carregar o seu portal académico...</div>;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-deep sm:text-3xl">
            O meu painel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe o estado da sua inscrição para a Residência de Benfica.
          </p>
          <div className="gov-gold-rule mt-2 w-16" />
        </div>

        {/* 🟢 SE NÃO TEM CANDIDATURA (Erro 404 intercetado) */}
        {!app ? (
          <Card className="border-dashed border-border/80 bg-muted/20">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <FilePlus className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-display text-lg font-bold text-deep">
                Ainda não iniciou a sua candidatura
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                Para concorrer a uma vaga na Residência Universitária de Calhariz-Benfica, preencha os seus dados gerais e envie os documentos exigidos pelo regulamento municipal.
              </p>
              <Button onClick={() => navigate("/candidatura/dados")} className="mt-6 gap-2" size="lg">
                Iniciar Nova Candidatura <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* 🔵 SE JÁ TEM CANDIDATURA ATIVA */
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Candidatura Ativa
                  </div>
                  <h3 className="font-display text-base font-bold text-deep">
                    Ano Letivo {app.ano_letivo || "2026/2027"}
                  </h3>
                </div>
                <StatusBadge 
                  tone={
                    app.estado === "aprovado" ? "success" : 
                    app.estado === "pendente_correcao" ? "danger" : 
                    app.estado === "aguarda_validacao" ? "warn" : "info"
                  }
                >
                  {app.estado || "Pendente"}
                </StatusBadge>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <StatBlock label="Curso" value={app.curso} />
                <StatBlock label="Instituição Principal" value={app.instituicao_1} />
              </div>

              {/* Alerta de Correção Urgente */}
              {app.estado === "pendente_correcao" && (
                <div className="mt-6 rounded-md border border-status-danger/30 bg-status-danger/5 p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-status-danger shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display text-sm font-bold text-status-danger">
                        Correção Urgente Necessária
                      </h4>
                      <p className="mt-1 text-xs text-status-danger/90 leading-relaxed">
                        A equipa técnica municipal detetou erros ou documentos ilegíveis. Clique abaixo para reenviar imediatamente.
                      </p>
                      <Button asChild className="mt-3 gap-2" variant="destructive" size="sm">
                        <Link to="/candidatura/corrigir">
                          Corrigir Documentos <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Estados de Continuação de Rascunho */}
              {(app.estado === "rascunho" || app.estado === "aguarda_documentos") && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="sm">
                    <Link to="/candidatura/dados">Continuar candidatura</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/candidatura/documentos">Ir para documentos</Link>
                  </Button>
                </div>
              )}

              {(app.estado === "aguarda_validacao" || app.estado === "em_analise") && (
                <p className="mt-6 text-sm text-muted-foreground bg-muted/40 p-4 rounded border border-border/40">
                  ℹ️ <strong>Processo em avaliação:</strong> A sua candidatura deu entrada nos serviços municipais e está a ser analisada. Será notificado por email assim que houver atualizações.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PublicLayout>
  );
}

function StatBlock({ label, value }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-medium text-foreground">{value || "—"}</div>
    </div>
  );
}