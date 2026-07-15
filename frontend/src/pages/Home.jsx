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
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-linear-to-br from-primary/20 via-gold/20 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <div className="gov-header-band px-6 py-4">
                <div className="text-xs uppercase tracking-widest opacity-80">Processo</div>
                <div className="font-display text-xl font-bold">Como candidatar-se</div>
              </div>
              <ol className="divide-y divide-border">
                {[
                  { n: 1, t: "Criar conta no portal com o seu email pessoal" },
                  { n: 2, t: "Preencher os dados pessoais e o agregado familiar" },
                  { n: 3, t: "Submeter os documentos comprovativos em PDF" },
                  { n: 4, t: "Acompanhar o estado do processo online" },
                ].map((s) => (
                  <li key={s.n} className="flex items-start gap-4 px-6 py-4">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                      {s.n}
                    </div>
                    <p className="pt-1 text-sm text-foreground">{s.t}</p>
                  </li>
                ))}
              </ol>
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