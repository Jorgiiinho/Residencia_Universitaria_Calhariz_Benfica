import { useEffect, useMemo, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import {
  Search,
  HelpCircle,
  FileText,
  Home,
  Calendar,
  Euro,
  Users,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { FaqAPI } from "@/services/api";

const CATEGORIES = [
  { id: "todas", label: "Todas", icon: HelpCircle },
  { id: "candidatura", label: "Candidatura", icon: FileText },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "residencia", label: "Residência", icon: Home },
  { id: "prazos", label: "Prazos", icon: Calendar },
  { id: "financeiro", label: "Custos", icon: Euro },
  { id: "elegibilidade", label: "Elegibilidade", icon: Users },
];

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todas");

  useEffect(() => {
    FaqAPI.listar()
      .then((res) => {
        if (res.data?.ok) {
          setFaqs(res.data.faqs || []);
        }
      })
      .catch((err) => console.error("❌ Erro ao carregar FAQs:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      const catOk = category === "todas" || f.categoria === category;
      const qOk =
        !q ||
        f.pergunta.toLowerCase().includes(q) ||
        f.resposta.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [faqs, query, category]);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-16">
        <div className="mb-8 sm:mb-10 text-center">
          <div className="mx-auto grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full bg-emerald-100 text-emerald-800">
            <HelpCircle className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <h1 className="mt-3 sm:mt-4 font-display text-2xl sm:text-4xl font-bold text-emerald-950">
            Perguntas Frequentes
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Respostas às dúvidas mais comuns sobre candidatura e residência.
          </p>
          <div className="gov-gold-rule mx-auto mt-3 sm:mt-4 w-20 sm:w-24" />
        </div>

        <div className="mx-auto mb-6 sm:mb-8 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por palavra-chave..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="mb-6 sm:mb-8 flex flex-wrap justify-center gap-1.5 sm:gap-2">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = c.id === category;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium transition cursor-pointer ${
                  active
                    ? "border-emerald-700 bg-emerald-700 text-white shadow-xs"
                    : "border-border bg-background text-foreground/70 hover:border-emerald-600/40 hover:text-emerald-800"
                }`}
              >
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_320px]">
          <Card className="border-border">
            <CardContent className="p-4 sm:p-6">
              {loading ? (
                <div className="py-12 text-center text-xs sm:text-sm text-muted-foreground animate-pulse">
                  A carregar perguntas frequentes...
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-8 sm:py-12 text-center text-xs sm:text-sm text-muted-foreground">
                  <Search className="mx-auto mb-3 h-7 w-7 opacity-40" />
                  Nenhuma pergunta encontrada para «{query}».
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filtered.map((f, i) => (
                    <AccordionItem key={f.id || i} value={`item-${i}`}>
                      <AccordionTrigger className="text-left font-display text-sm sm:text-base font-semibold text-emerald-950 hover:no-underline py-3">
                        {f.pergunta}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs sm:text-sm leading-relaxed text-foreground/80">
                        {f.resposta}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          <aside className="space-y-4">
            <Card className="border-2 border-emerald-600/20 bg-emerald-50/50">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-2 sm:mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                  <h3 className="font-display font-bold text-emerald-950 text-sm sm:text-base">
                    Não encontrou resposta?
                  </h3>
                </div>
                <p className="mb-3 sm:mb-4 text-xs text-muted-foreground">
                  Contacte diretamente o gabinete de apoio ao estudante do Município.
                </p>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <a
                      href="mailto:apoioensinosuperior@cm-ribeirabrava.pt"
                      className="hover:text-emerald-700 break-all"
                    >
                      apoioensinosuperior@cm-ribeirabrava.pt
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>(+351) 291 952 548</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>
                      Câmara Municipal da Ribeira Brava<br />Madeira, Portugal
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-emerald-950 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold">
                  Horário de atendimento
                </div>
                <div className="mt-2 space-y-1 text-xs sm:text-sm opacity-90">
                  <div>Segunda a Sexta</div>
                  <div className="font-display text-base sm:text-lg font-bold text-amber-500">
                    09:00 — 17:30
                  </div>
                  <div className="text-[10px] opacity-70">Exceto feriados</div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}