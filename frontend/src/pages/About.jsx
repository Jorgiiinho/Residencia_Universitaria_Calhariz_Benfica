import { Link } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { useI18n } from "@/lib/providers";
import {
  Building2,
  MapPin,
  Users,
  GraduationCap,
  BookOpen,
  Wifi,
  UtensilsCrossed,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Dumbbell,
  Tv
} from "lucide-react";

import vista from "@/assets/vista.jpg";
import anfiteatro from "@/assets/anfiteatro.jpg";
import casa_de_banho from "@/assets/casa_de_banho.jpg";
import cozinha from "@/assets/cozinha.jpg";
import quartos from "@/assets/quartos.jpg";
import sala_de_estudo from "@/assets/estudo.jpg"; 
import convivio from "@/assets/convivio.jpg";
import residencia from "@/assets/residencia.jpg"; 
import fachada from "@/assets/fachada.jpg"; 

export default function About() {
  const { lang } = useI18n();

  return (
    <PublicLayout>
      {/* Hero / Introdução com a foto geral da Residência */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,var(--color-cream),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1fr_1fr] md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-deep">
              <Sparkles className="h-3.5 w-3.5" /> {lang === "pt" ? "Oportunidade Única" : "Unique Opportunity"}
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-deep sm:text-5xl">
              {lang === "pt" ? (
                <>
                  Uma parceria exclusiva para<br />
                  <span className="text-primary">os estudantes da Ribeira Brava</span>
                </>
              ) : (
                <>
                  An exclusive partnership for<br />
                  <span className="text-primary">Ribeira Brava students</span>
                </>
              )}
            </h1>
            <div className="gov-gold-rule mt-4 w-24" />
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              {lang === "pt" 
                ? "A Residência Universitária de Calhariz-Benfica é uma infraestrutura de excelência construída pela Junta de Freguesia de Benfica, inaugurada no ano letivo de 2024/2025. Através de um protocolo pioneiro, o Município da Ribeira Brava afirma-se como o único município de toda a Região Autónoma da Madeira a dispor de 5 vagas garantidas e exclusivas para apoiar os seus estudantes residentes deslocados na capital."
                : "The Calhariz-Benfica University Residence is a facility of excellence built by the Benfica Parish Council, inaugurated in the 2024/2025 academic year. Through a pioneering protocol, the性能 Municipality of Ribeira Brava stands out as the only municipality in the entire Autonomous Region of Madeira to provide 5 guaranteed and exclusive vacancies to support its resident students displaced in the capital."}
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-lg bg-linear-to-br from-gold/20 via-transparent to-primary/10 blur-2xl" />
            <div className="relative aspect-4/3 overflow-hidden rounded-lg border border-border/60 shadow-xl">
              <img
                src={residencia}
                alt="Edifício da Residência Universitária de Calhariz-Benfica"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-deep/70 to-transparent p-4">
                <p className="text-xs uppercase tracking-wider text-white">Calhariz-Benfica · Lisboa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enquadramento Histórico com a foto da Fachada */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="aspect-4/3 overflow-hidden rounded-lg border border-border/60 shadow-md">
            <img 
              src={vista} 
              alt="Vista exterior da residência" 
              className="h-full w-full object-cover" 
            />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              {lang === "pt" ? "Sobre o Espaço" : "About the Space"}
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold text-deep">
              {lang === "pt" ? "Infraestrutura moderna e acessos privilegiados" : "Modern infrastructure and privileged access"}
            </h2>
            <div className="gov-gold-rule mt-3 w-16" />
            <p className="mt-5 text-muted-foreground">
              {lang === "pt"
                ? "Inaugurado recentemente no ano letivo de 2024/2025, o complexo dispõe de 120 camas no total, sendo 72 delas disponibilizadas especificamente para os estudantes deslocados do Politécnico de Lisboa. O alojamento está distribuído por quartos individuais e duplos, todos equipados com casa de banho privativa, além de estarem disponíveis apartamentos independentes compostos por três quartos duplos, duas casas de banho e kitchenette."
                : "Recently inaugurated in the 2024/2025 academic year, the complex features a total of 120 beds, 72 of which are specifically made available for displaced students from the Polytechnic of Lisbon. Accommodation is divided into single and double rooms, all equipped with a private bathroom, alongside independent apartments consisting of three double rooms, two bathrooms, and a kitchenette."}
            </p>
            <p className="mt-4 text-muted-foreground">
              {lang === "pt"
                ? "Estrategicamente localizada em Benfica, a escassos 10 minutos a pé do Campus de Benfica do IPL, a residência fica junto à estação de caminho de ferro (servida pela Linha de Sintra). Isto assegura uma mobilidade exemplar e rápida ligação aos demais polos de ensino superior e ao centro de Lisboa."
                : "Strategically located in Benfica, just a 10-minute walk from the IPL Benfica Campus, the residence sits right next to the railway station (served by the Sintra Line). This ensures exemplary mobility and fast connections to other higher education hubs and the center of Lisbon."}
            </p>
          </div>
        </div>
      </section>

      {/* Instalações — Galeria Simétrica com 6 fotos reais */}
      <section className="bg-cream/40 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              {lang === "pt" ? "Galeria do Espaço" : "Space Gallery"}
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold text-deep">
              {lang === "pt" ? "Áreas pensadas para o bem-estar e o estudo" : "Areas designed for well-being and studying"}
            </h2>
            <div className="gov-gold-rule mx-auto mt-3 w-16" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 1. Quartos */}
            <figure className="group overflow-hidden rounded-lg border border-border/60 bg-background shadow-sm">
              <div className="aspect-4/3 overflow-hidden">
                <img
                  src={quartos}
                  alt="Quartos da Residência"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <figcaption className="p-5">
                <h3 className="font-display text-lg font-bold text-deep">
                  {lang === "pt" ? "Quartos Individuais e Duplos" : "Single and Double Rooms"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lang === "pt"
                    ? "Acomodações totalmente mobiladas, organizadas para garantir privacidade, conforto e uma rotina académica tranquila."
                    : "Fully furnished accommodations, organized to ensure privacy, comfort, and a peaceful academic routine."}
                </p>
              </figcaption>
            </figure>

            {/* 2. Casa de Banho */}
            <figure className="group overflow-hidden rounded-lg border border-border/60 bg-background shadow-sm">
              <div className="aspect-4/3 overflow-hidden">
                <img
                  src={casa_de_banho}
                  alt="Casa de banho privativa"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <figcaption className="p-5">
                <h3 className="font-display text-lg font-bold text-deep">
                  {lang === "pt" ? "Casas de Banho Integradas" : "En-suite Bathrooms"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lang === "pt"
                    ? "Todas as tipologias de quartos da residência incluem casa de banho privativa completa, promovendo maior comodidade."
                    : "All room typologies in the residence feature an integrated full private bathroom, promoting greater convenience."}
                </p>
              </figcaption>
            </figure>

            {/* 3. Cozinha */}
            <figure className="group overflow-hidden rounded-lg border border-border/60 bg-background shadow-sm">
              <div className="aspect-4/3 overflow-hidden">
                <img
                  src={cozinha}
                  alt="Cozinhas e Kitchenette"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <figcaption className="p-5">
                <h3 className="font-display text-lg font-bold text-deep">
                  {lang === "pt" ? "Cozinha Comum & Kitchenettes" : "Common Kitchen & Kitchenettes"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lang === "pt"
                    ? "Zonas partilhadas de refeições e apartamentos equipados com kitchenettes funcionais para total autonomia diária."
                    : "Shared dining areas and apartments equipped with functional kitchenettes for full daily autonomy."}
                </p>
              </figcaption>
            </figure>

            {/* 4. Sala de Estudo */}
            <figure className="group overflow-hidden rounded-lg border border-border/60 bg-background shadow-sm">
              <div className="aspect-4/3 overflow-hidden">
                <img
                  src={sala_de_estudo}
                  alt="Sala de estudo"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <figcaption className="p-5">
                <h3 className="font-display text-lg font-bold text-deep">
                  {lang === "pt" ? "Salas de Estudo Focadas" : "Focused Study Rooms"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lang === "pt"
                    ? "Ambiente calmo, iluminado e com pontos de energia adequados para trabalhos de grupo ou sessões individuais de estudo."
                    : "Quiet, well-lit environment with proper power outlets for group projects or individual study sessions."}
                </p>
              </figcaption>
            </figure>

            {/* 5. Espaço de Convívio */}
            <figure className="group overflow-hidden rounded-lg border border-border/60 bg-background shadow-sm">
              <div className="aspect-4/3 overflow-hidden">
                <img
                  src={convivio}
                  alt="Área social de convívio"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <figcaption className="p-5">
                <h3 className="font-display text-lg font-bold text-deep">
                  {lang === "pt" ? "Salas de Convívio Social" : "Social Gathering Lounges"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lang === "pt"
                    ? "Amplos espaços comuns destinados à descontração, encontros e atividades sociais entre os residentes."
                    : "Ample common spaces designated for relaxation, gatherings, and social activities among residents."}
                </p>
              </figcaption>
            </figure>

            {/* 6. Anfiteatro */}
            <figure className="group overflow-hidden rounded-lg border border-border/60 bg-background shadow-sm">
              <div className="aspect-4/3 overflow-hidden">
                <img
                  src={anfiteatro}
                  alt="Anfiteatro multiusos"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <figcaption className="p-5">
                <h3 className="font-display text-lg font-bold text-deep">
                  {lang === "pt" ? "Anfiteatro Multiusos" : "Multipurpose Amphitheater"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lang === "pt"
                    ? "Sala multiusos integrada, ideal para palestras, workshops, apresentações académicas ou projeções multimédia."
                    : "Integrated multipurpose hall, perfect for lectures, workshops, academic presentations, or multimedia screenings."}
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Serviços incluídos */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">
            {lang === "pt" ? "Serviços e Valências" : "Services & Amenities"}
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold text-deep">
            {lang === "pt" ? "Estrutura completa de apoio ao estudante" : "A comprehensive structure supporting the student"}
          </h2>
          <div className="gov-gold-rule mt-3 w-16" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Wifi, titlePt: "Internet Permanente", titleEn: "Permanent Internet", textPt: "Ligação Wi-Fi de alta velocidade em todo o edifício.", textEn: "High-speed Wi-Fi connection throughout the entire building." },
            { icon: UtensilsCrossed, titlePt: "Cozinha Comum", titleEn: "Common Kitchen", textPt: "Cozinha comunitária totalmente equipada para preparação de refeições.", textEn: "Fully equipped community kitchen for day-to-day meal preparation." },
            { icon: BookOpen, titlePt: "Salas de Estudo", titleEn: "Study Rooms", textPt: "Espaços calmos e otimizados para concentração e trabalhos escolares.", textEn: "Quiet, optimized environments for concentration and schoolwork." },
            { icon: Dumbbell, titlePt: "Ginásio Integrado", titleEn: "In-House Gym", textPt: "Espaço equipado para a prática de exercício físico sem sair da residência.", textEn: "Equipped fitness space to exercise without leaving the premises." },
            { icon: Tv, titlePt: "Anfiteatro", titleEn: "Amphitheater", textPt: "Sala multiusos preparada para palestras, eventos e projeções.", textEn: "Multipurpose room tailored for talks, events, and screenings." },
            { icon: Building2, titlePt: "Lavandaria Própria", titleEn: "In-house Laundry", textPt: "Acesso facilitado a equipamentos de lavagem e secagem de roupa.", textEn: "Easy access to clothes washing and drying appliances." },
            { icon: MapPin, titlePt: "Estação a 1 Minuto", titleEn: "Train Station Next Door", textPt: "Colado à estação de Benfica, facilitando a deslocação na Linha de Sintra.", textEn: "Right by Benfica station, easing travel through the Sintra Line." },
            { icon: GraduationCap, titlePt: "Pólo IPL Próximo", titleEn: "Near IPL Campus", textPt: "Apenas a 10 minutos de caminhada do Campus de Benfica do IPL.", textEn: "Merely a 10-minute walk away from the IPL Benfica Campus." },
          ].map(({ icon: Icon, titlePt, titleEn, textPt, textEn }) => (
            <div
              key={titlePt}
              className="rounded-lg border border-border/60 bg-background p-5 shadow-sm transition hover:border-gold/60 hover:shadow-md"
            >
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-deep">
                {lang === "pt" ? titlePt : titleEn}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {lang === "pt" ? textPt : textEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Números — Dados Reais e Estatísticas Oficiais */}
      <section className="bg-deep py-16 text-deep-foreground">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 text-center md:grid-cols-4">
            {[
              { n: "120", labelPt: "Camas no Total", labelEn: "Total Beds Available" },
              { n: "72", labelPt: "Vagas Alocadas ao IPL", labelEn: "Slots Allocated to IPL" },
              { n: "5", labelPt: "Vagas Exclusivas Ribeira Brava", labelEn: "Exclusive Ribeira Brava Slots" },
              { n: "10 min", labelPt: "A pé do Campus do IPL", labelEn: "Walk to IPL Campus" },
            ].map(({ n, labelPt, labelEn }) => (
              <div key={labelPt}>
                <div className="font-display text-4xl font-bold text-gold sm:text-5xl">{n}</div>
                <div className="mt-2 text-xs uppercase tracking-wider opacity-80">
                  {lang === "pt" ? labelPt : labelEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galeria Fotográfica Oficial & Fonte de Dados do IPL */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="font-display text-3xl font-bold text-deep">
          {lang === "pt" ? "Galeria Fotográfica Oficial" : "Official Photo Gallery"}
        </h2>
        <div className="gov-gold-rule mx-auto mt-3 w-16" />
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          {lang === "pt"
            ? "Pode visualizar detalhadamente todas as instalações, incluindo os quartos com casa de banho privativa, cozinhas, ginásio e áreas comuns no álbum oficial do Politécnico de Lisboa."
            : "You can view all facilities in detail, including rooms with private bathrooms, kitchens, the gym, and common areas in the official album of the Polytechnic of Lisbon."}
        </p>

        {/* Botão Flickr com Logo em CSS Puro */}
        <div className="mt-8 flex justify-center">
          <a
            href="https://www.flickr.com/photos/politecnicodelisboa/albums/72177720332076177/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow px-5 py-3 rounded-xl transition-all group text-gray-700"
          >
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100 select-none">
              <span className="h-3 w-3 rounded-full bg-[#0063dc]"></span>
              <span className="h-3 w-3 rounded-full bg-[#ff0084]"></span>
              <span className="text-xs font-bold tracking-tight text-black ml-1 font-sans">flickr</span>
            </div>
            <span className="text-sm font-medium group-hover:text-primary transition-colors">
              {lang === "pt" ? "Ver Álbum de Fotos da Residência" : "View Residence Photo Album"}
            </span>
            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
          </a>
        </div>

        {/* Créditos Claros e Link da Fonte (IPL) */}
        <div className="mt-12 pt-6 border-t border-border/60 max-w-2xl mx-auto">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {lang === "pt"
              ? "Aviso institucional: Todos os dados regulamentares, serviços, localização e valências apresentados nesta plataforma foram coligidos e têm como fonte oficial o portal do Instituto Politécnico de Lisboa."
              : "Institutional notice: All regulatory data, services, location, and amenities presented on this platform have been compiled from and find their official source on the Polytechnic Institute of Lisbon portal."}
            <br />
            <a
              href="https://www.ipl.pt/residencia-universitaria-de-benfica"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium mt-1.5"
            >
              {lang === "pt" ? "Consultar site oficial da Residência (IPL)" : "Consult official Residence website (IPL)"}{" "}
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}