import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Ajusta o caminho se necessário!
import { Button } from "./ui/Button";
import { Globe, LogOut, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// 🌐 Dicionário de Traduções para o Candidato / Público
const traducoesPublicas = {
  pt: {
    brand: "Município da Ribeira Brava",
    subbrand: "Município da Ribeira Brava",
    nav_home: "Início",
    nav_panel: "Painel Aluno",
    nav_login: "Entrar",
    nav_register: "Registar",
    nav_logout: "Sair da Conta",
    admin_dashboard: "Painel do Admin"
  },
  en: {
    brand: "Ribeira Brava Municipality",
    subbrand: "Ribeira Brava Municipality",
    nav_home: "Home",
    nav_panel: "Student Panel",
    nav_login: "Login",
    nav_register: "Register",
    nav_logout: "Logout",
    admin_dashboard: "Admin Dashboard"
  }
};

export function PublicHeader({ lang, setLang, t }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="gov-header-band">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs">
          <span className="font-medium tracking-wide uppercase opacity-90">
            {t("brand")}
          </span>
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 opacity-70" />
            <button
              onClick={() => setLang("pt")}
              className={`px-1.5 py-0.5 rounded ${lang === "pt" ? "bg-gold text-gold-foreground font-semibold" : "opacity-80 hover:opacity-100"}`}
            >
              PT
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-1.5 py-0.5 rounded ${lang === "en" ? "bg-gold text-gold-foreground font-semibold" : "opacity-80 hover:opacity-100"}`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-deep text-deep-foreground shadow-sm">
            <span className="font-display text-lg font-bold text-gold">RB</span>
          </div>
          <div className="min-w-0">
            <div className="font-display text-base font-bold leading-tight text-deep sm:text-lg">
              {t("subbrand")}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Portal de Candidaturas
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/"
            className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary"
          >
            {t("nav_home")}
          </Link>
          {user?.tipo === "candidato" && (
            <Link
              to="/painel"
              className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary"
            >
              {t("nav_panel")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserRound className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {user?.nome}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user?.tipo === "candidato" && (
                  <DropdownMenuItem onClick={() => navigate("/painel")}>
                    {t("nav_panel")}
                  </DropdownMenuItem>
                )}
                {user?.tipo === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                    {t("admin_dashboard")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> {t("nav_logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">{t("nav_login")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">{t("nav_register")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="gov-gold-rule" />
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-deep text-deep-foreground/90">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="font-display text-lg font-bold text-gold">Município da Ribeira Brava</div>
            <p className="mt-2 text-sm opacity-80">
              Câmara Municipal da Ribeira Brava — Madeira, Portugal.
            </p>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold">Residência</div>
            <p className="text-sm opacity-80">
              Calhariz-Benfica, Lisboa — vagas para estudantes deslocados naturais do concelho.
            </p>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold">Contactos</div>
            <p className="text-sm opacity-80">
              geral@cm-ribeirabrava.pt<br />
              (+351) 291 952 548
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-4 text-xs opacity-70">
          © {new Date().getFullYear()} Município da Ribeira Brava — Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

export function PublicShell({ children }) {
  const [lang, setLang] = useState("pt");
  const t = (key) => traducoesPublicas[lang]?.[key] || key;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader lang={lang} setLang={setLang} t={t} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

export function PublicLayout({ children }) {
  return <PublicShell>{children}</PublicShell>;
}