import { Link, useNavigate, useLocation } from "react-router-dom";
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
      <div className="gov-header-band">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1 text-xs">
          <span className="font-medium tracking-wide uppercase opacity-90 text-white"> 
            <img src={brasao} alt="Brasão da Ribeira Brava" className="inline h-8 w-8 mr-1" />
            {t("brand") || "Câmara Municipal da Ribeira Brava"}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-white">
              <Globe className="h-3.5 w-3.5 opacity-70" />
              <button
                onClick={() => setLang("pt")}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${lang === "pt" ? "bg-amber-500 text-amber-950 font-semibold" : "opacity-80 hover:opacity-100"}`}
              >
                PT
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${lang === "en" ? "bg-amber-500 text-amber-950 font-semibold" : "opacity-80 hover:opacity-100"}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-emerald-800">
          <span className="text-emerald-950"> Residência Universitária de Calhariz-Benfica</span> 
        </Link>

        <nav className="flex items-center gap-6">
          {/* Links de Navegação */}
          <Link to="/" className="text-sm font-medium text-emerald-950 hover:text-emerald-600 transition-colors">
            {lang === "pt" ? "Início" : "Home"}
          </Link>
          <Link to="/" className="text-sm font-medium text-emerald-950 hover:text-emerald-600 transition-colors">
            {lang === "pt" ?  "Sobre" : "About"}
          </Link>

          {/* Lógica de Autenticação */}
          {authenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 cursor-pointer">
                  <UserRound className="h-4 w-4 text-emerald-700" />
                  <span className="hidden sm:inline font-medium">{user?.nome || user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background border border-border">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to={user?.tipo === "admin" ? "/admin/dashboard" : "/painel"} className="flex items-center gap-2 w-full">
                    <LayoutDashboard className="h-4 w-4" /> {user?.tipo === "admin" ? "Painel Admin" : "O Meu Painel"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> {t("logout") || "Sair da Conta"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="cursor-pointer">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
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

function PublicFooter() {
  return (
    <footer className="border-t border-border/40 bg-emerald-950 text-emerald-50/90">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="font-display text-lg font-bold text-amber-500">Município da Ribeira Brava</div>
            <p className="mt-2 text-sm opacity-80">
              Câmara Municipal da Ribeira Brava — Madeira, Portugal.
            </p>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-500">Residência</div>
            <p className="text-sm opacity-80">
              Calhariz-Benfica, Lisboa — vagas para estudantes deslocados naturais do concelho.
            </p>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-500">Contactos</div>
            <p className="text-sm opacity-80">
               alojamento@sas.ipl.pt <br/>
               +351 210 464 970 <br/>
               Estrada do Calhariz de Benfica 1500-124, Lisboa
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

export function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 w-full">{children}</main>
      <PublicFooter />
    </div>
  );
}