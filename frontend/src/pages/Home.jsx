import { Link } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { Button } from "@/components/ui/Button";
import { GraduationCap, ShieldCheck, FileCheck2, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <PublicLayout>
      {/* Seção Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,var(--color-cream),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-deep">
              <ShieldCheck className="h-3.5 w-3.5" /> Candidaturas 2026/2027
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-deep sm:text-5xl">
              Residência Universitária de<br />
              <span className="text-primary">Calhariz-Benfica</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-xl leading-relaxed">
              Portal oficial do Município da Ribeira Brava para atribuição de vagas de alojamento a estudantes do concelho deslocados no Ensino Superior na área metropolitana de Lisboa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/register">
                  Iniciar Candidatura <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Aceder ao Portal</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/10 to-transparent" />
            <div className="h-full w-full rounded-2xl border border-border/80 bg-muted/20 p-8 flex flex-col justify-between min-h-[320px]">
              <div className="space-y-2">
                <div className="font-display text-xl font-bold text-deep">Residência de Benfica</div>
                <div className="text-xs uppercase tracking-wider text-gold font-semibold">Protocolo Municipal</div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Um apoio social estratégico e focado na promoção do sucesso académico dos jovens estudantes da Ribeira Brava em Lisboa.
              </p>
              <div className="text-xs text-muted-foreground/80">
                Câmara Municipal da Ribeira Brava
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vantagens / Recursos */}
      <section className="border-t border-border/60 bg-muted/20 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12">
            <h2 className="font-display text-2xl font-bold tracking-tight text-deep sm:text-3xl">
              Processo simples, transparente e seguro
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: GraduationCap,
                title: "Para estudantes deslocados",
                text: "Reservado a naturais do concelho da Ribeira Brava a frequentar o ensino superior em Lisboa.",
              },
              {
                icon: FileCheck2,
                title: "Documentação digital",
                text: "Envie IRS, matrícula, comprovativos de rendimento e outros documentos em PDF.",
              },
              {
                icon: ShieldCheck,
                title: "Acompanhamento em tempo real",
                text: "Consulte o estado do processo e corrija documentos rejeitados sem começar de novo.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-deep">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}