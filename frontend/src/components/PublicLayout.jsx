import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext"; 
import { useI18n } from "@/lib/providers";
import { Globe, LogOut, UserRound, LayoutDashboard } from "lucide-react";
import brasao from "@/assets/brasao.png";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/DropdownMenu";

function PublicHeader() {
  const { t, lang, setLang } = useI18n();
  const { user, authenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur">
      {/* BANDA SUPERIOR MUNICIPAL (Compacta no Telemóvel) */}
      <div className="gov-header-band">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-2.5 sm:px-4 py-0.5 sm:py-1 text-[10px] sm:text-xs">
          <span className="font-medium tracking-wide uppercase opacity-90 text-white flex items-center gap-1 min-w-0 truncate"> 
            <img src={brasao} alt="Brasão da Ribeira Brava" className="h-4 w-4 sm:h-6 sm:w-6 shrink-0" />
            <span className="truncate">{t("brand") || "Câmara Municipal da Ribeira Brava"}</span>
          </span>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1 text-white text-[10px] sm:text-xs">
              <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-70" />
              <button
                onClick={() => setLang("pt")}
                className={`px-1 py-0.5 rounded cursor-pointer transition-colors ${lang === "pt" ? "bg-amber-500 text-amber-950 font-semibold" : "opacity-80 hover:opacity-100"}`}
              >
                PT
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-1 py-0.5 rounded cursor-pointer transition-colors ${lang === "en" ? "bg-amber-500 text-amber-950 font-semibold" : "opacity-80 hover:opacity-100"}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA PRINCIPAL DE NAVEGAÇÃO */}
      <div className="mx-auto flex h-11 sm:h-16 max-w-7xl items-center justify-between px-2.5 sm:px-4 gap-1.5 sm:gap-2">
        {/* TÍTULO RESPONSIVO */}
        <Link to="/" className="flex items-center gap-1.5 font-display font-bold text-emerald-800 min-w-0">
          <span className="text-emerald-950 text-[10px] xs:text-xs sm:text-base md:text-lg leading-tight truncate sm:whitespace-nowrap"> 
            Residência Universitária Calhariz-Benfica
          </span> 
        </Link>

        {/* LINKS DE NAVEGAÇÃO E BOTÕES */}
        <nav className="flex items-center gap-1.5 xs:gap-2 sm:gap-4 shrink-0">
          <Link to="/" className="text-[11px] sm:text-sm font-medium text-emerald-950 hover:text-emerald-600 transition-colors">
            {lang === "pt" ? "Início" : "Home"}
          </Link>
          <Link to="/about" className="text-[11px] sm:text-sm font-medium text-emerald-950 hover:text-emerald-600 transition-colors">
            {lang === "pt" ? "Sobre" : "About"}
          </Link>
          <Link to="/faq" className="text-[11px] sm:text-sm font-medium text-emerald-950 hover:text-emerald-600 transition-colors">
            FAQ
          </Link>

          {/* AUTENTICAÇÃO */}
          {authenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 cursor-pointer px-1.5 sm:px-3 h-7 sm:h-9 text-[11px] sm:text-sm">
                  <UserRound className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-700" />
                  <span className="hidden sm:inline font-medium">{user?.nome || user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background border border-border">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to={user?.tipo === "admin" || user?.tipo === "superadmin" ? "/admin/dashboard" : "/painel"} className="flex items-center gap-2 w-full">
                    <LayoutDashboard className="h-4 w-4" /> {(user?.tipo === "admin" || user?.tipo === "superadmin") ? "Painel Admin" : "O Meu Painel"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> {t("logout") || "Sair da Conta"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button asChild variant="ghost" size="sm" className="cursor-pointer text-[11px] sm:text-sm px-1.5 sm:px-3 h-7 sm:h-9">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer text-[11px] sm:text-sm px-2 sm:px-3 h-7 sm:h-9">
                <Link to="/register">Criar Conta</Link>
              </Button>
            </div> 
          )}
        </nav>
      </div>
      <div className="gov-gold-rule" /> 
    </header>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-border/40 bg-emerald-950 text-emerald-50/90">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {/* COLUNA 1: IDENTIFICAÇÃO */}
          <div>
            <div className="font-display text-base sm:text-lg font-bold text-amber-500">
              Município da Ribeira Brava
            </div>
            <p className="mt-1.5 text-xs sm:text-sm opacity-80 leading-relaxed">
              Câmara Municipal da Ribeira Brava — Madeira, Portugal.
              <br />
              Apoio aos estudantes do concelho no acesso ao Ensino Superior.
            </p>
          </div>

          {/* COLUNA 2: CONTACTOS */}
          <div>
            <div className="mb-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-amber-500">
              Contactos
            </div>
            <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
              +351 291 952 548 <br />
              Rua do Visconde, Nº56 9350-213, Ribeira Brava <br />
              apoioensinosuperior@cm-ribeirabrava.pt
            </p>
          </div>

          {/* COLUNA 3: REDES SOCIAIS */}
          <div>
            <div className="mb-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-amber-500">
              Siga-nos
            </div>
            <p className="text-[11px] sm:text-xs opacity-80 mb-2.5">
              Acompanhe as novidades e atividades do Município:
            </p>
            <div className="flex items-center gap-2.5">
              <a
                href="https://www.facebook.com/camaramunicipaldaribeirabrava"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-lg bg-emerald-900 text-emerald-100 hover:bg-amber-500 hover:text-emerald-950 transition-colors cursor-pointer"
                title="Facebook Oficial"
              >
                <FacebookIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>

              <a
                href="https://www.instagram.com/ribeirabrava_municipio/"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-lg bg-emerald-900 text-emerald-100 hover:bg-amber-500 hover:text-emerald-950 transition-colors cursor-pointer"
                title="Instagram Oficial"
              >
                <InstagramIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>

              <a
                href="https://www.youtube.com/channel/UClrN6MwiT_IF--NJ1Cc8RvQ"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-lg bg-emerald-900 text-emerald-100 hover:bg-amber-500 hover:text-emerald-950 transition-colors cursor-pointer"
                title="Canal do YouTube"
              >
                <YoutubeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 border-t border-white/10 pt-3 sm:pt-4 text-[10px] sm:text-xs opacity-70 flex flex-wrap justify-between items-center gap-2">
          <div>
            © {new Date().getFullYear()} Município da Ribeira Brava — Todos os direitos reservados.
          </div>
          <div>
            Residência Universitária de Calhariz-Benfica
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 w-full">{children}</main>
      <PublicFooter />
    </div>
  );
}