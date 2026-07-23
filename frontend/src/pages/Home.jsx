import { Link, useNavigate } from "react-router-dom"; 
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout"; 
import { Button } from "@/components/ui/Button"; 
import { useI18n, useStore } from "@/lib/providers";
import { GraduationCap, ShieldCheck, FileCheck2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { ConfigAPI } from "@/services/api";

export default function Home() {
  const { t } = useI18n();
  const { currentUser } = useStore(); 
  const navigate = useNavigate();

  // 🌟 Estado dinâmico do período de candidaturas
  const [periodo, setPeriodo] = useState({
    candidaturasAbertas: true,
    anoLetivo: "2026/2027"
  });

  useEffect(() => {
    ConfigAPI.obterEstadoPeriodo()
      .then((res) => {
        if (res.data?.ok) {
          setPeriodo({
            candidaturasAbertas: res.data.candidaturasAbertas,
            anoLetivo: res.data.anoLetivo || "2026/2027"
          });
        }
      })
      .catch(() => {});
  }, []);

  // Lógica para Iniciar Candidatura
  const handleStartApplication = () => {
    if (!periodo.candidaturasAbertas) {
      toast.error("Candidaturas Encerradas", {
        description: `O período de candidaturas para o ano letivo ${periodo.anoLetivo} encontra-se encerrado.`,
      });
      return;
    }

    if (!currentUser) {
      toast.error("Acesso restrito", {
        description: "Para iniciar uma candidatura, precisa de ter sessão iniciada.",
      });
      return;
    }
    navigate("/painel"); 
  };

  const handleLoginClick = () => {
    if (currentUser) {
      toast.info("Já está autenticado", {
        description: "Já se encontra logado no portal.",
      });
      return;
    }
    navigate("/login");
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,var(--color-cream),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 items-center md:py-24">
          <div>
            {/* 🌟 CRACHÁ DINÂMICO DE ANO LETIVO E ESTADO */}
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${periodo.candidaturasAbertas ? "border-gold/40 bg-gold/10 text-emerald-950" : "border-red-300 bg-red-50 text-red-800"}`}>
              <ShieldCheck className="h-3.5 w-3.5" /> 
              {periodo.candidaturasAbertas 
                ? `Candidaturas ${periodo.anoLetivo}` 
                : `Candidaturas ${periodo.anoLetivo} (Fechadas)`}
            </span>

            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-emerald-950 sm:text-5xl">
              Residência Universitária de<br />
              <span className="text-primary">Calhariz-Benfica</span>
            </h1>
            <div className="gov-gold-rule mt-4 w-24 h-0.5" />
            <p className="mt-6 max-w-xl text-base text-muted-foreground leading-relaxed">
              Portal oficial do Município da Ribeira Brava para a atribuição de vagas
              a estudantes deslocados naturais do concelho, com alojamento em Lisboa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {/* Botão Iniciar Candidatura */}
              <Button 
                onClick={handleStartApplication} 
                size="lg" 
                className={`gap-2 ${!periodo.candidaturasAbertas ? "opacity-80 bg-slate-700 hover:bg-slate-800" : ""}`}
              >
                {periodo.candidaturasAbertas ? "Iniciar candidatura" : "Candidaturas Encerradas"} <ArrowRight className="h-4 w-4" />
              </Button>
              
              {!currentUser && (
                <Button onClick={handleLoginClick} size="lg" variant="outline" className="cursor-pointer">
                  {t("nav_login")}
                </Button>
              )}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-linear-to-br from-emerald-500/20 via-amber-500/20 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <div className="gov-header-band px-6 py-4 bg-emerald-950 text-white">
                <div className="text-xs uppercase tracking-widest opacity-80">Processo</div>
                <div className="font-display text-xl font-bold">Como candidatar-se</div>
              </div>
              <ol className="divide-y divide-border">
                {[
                  { n: 1, t: "Criar conta no portal com o seu email pessoal" },
                  { n: 2, t: "Preencher os dados pessoais e o agregado familiar" },
                  { n: 3, t: "Submeter os documentos comprovativos em PDF" },
                  { n: 4, t: "Acompanhar o estado do processo online" }
                ].map((s) => (
                  <li key={s.n} className="flex items-start gap-4 px-6 py-4 bg-background">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                      {s.n}
                    </div>
                    <p className="pt-1 text-sm text-emerald-950 font-medium">{s.t}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-10 max-w-2xl">
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
              Um processo simples, transparente e seguro
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: GraduationCap,
                title: "Para estudantes deslocados",
                text: "Reservado a naturais do concelho da Ribeira Brava a frequentar o ensino superior em Lisboa."
              },
              {
                icon: FileCheck2,
                title: "Documentação digital",
                text: "Envie IRS, matrícula, comprovativos de rendimento e outros documentos em PDF."
              },
              {
                icon: ShieldCheck,
                title: "Acompanhamento em tempo real",
                text: "Consulte o estado do processo e corrija documentos rejeitados sem começar de novo."
              }
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6 shadow-xs">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-emerald-950">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}