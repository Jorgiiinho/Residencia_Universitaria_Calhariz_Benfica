import { Link, useNavigate, useLocation } from "react-router-dom"; 
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext"; 
import { useI18n } from "@/lib/providers";
import { LayoutDashboard, Users, UserPlus, LogOut, Globe, HelpCircle } from "lucide-react";
import brasao from "@/assets/brasao.png";

// Preservados os imports em PascalCase
import { Button } from "@/components/ui/Button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter
} from "@/components/ui/Sidebar";

const items = [
  { title: "admin_dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "admin_applications", url: "/admin/dashboard", icon: Users },
  { title: "Gerir FAQs", url: "/admin/faqs", icon: HelpCircle },
  { title: "admin_new_staff", url: "/admin/criar-funcionario", icon: UserPlus }
];

function AdminSidebar() {
  const { t, lang, setLang } = useI18n();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/50 px-3 py-4 bg-background">
        {/* 🌟 group-data-[collapsible=icon]:hidden esconde todo o bloco (incluindo o brasão) ao fechar */}
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
          <img 
            className="h-9 w-9 shrink-0 object-contain rounded-md font-bold text-sm shadow-xs" 
            src={brasao} 
            alt="Brasão" 
          />
          <div className="flex flex-col min-w-0">
            <span className="font-display text-sm font-bold text-emerald-950 truncate">
              Ribeira Brava
            </span>
            <span className="text-[10px] font-semibold text-amber-700 tracking-wide uppercase">
              Área de Gestão
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-bold text-muted-foreground/70 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            Menu Administrativo
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={t(item.title) || item.title}>
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors">
                        <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-emerald-600" : "text-muted-foreground"}`} />
                        <span className="group-data-[collapsible=icon]:hidden">{t(item.title) || item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 p-3 bg-background">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-emerald-900 group-data-[collapsible=icon]:hidden mb-2 px-1">
          <div className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 opacity-70" />
            <button onClick={() => setLang("pt")} className={`px-1 py-0.5 rounded cursor-pointer ${lang === "pt" ? "font-bold text-amber-700" : "opacity-60"}`}>PT</button>
            <button onClick={() => setLang("en")} className={`px-1 py-0.5 rounded cursor-pointer ${lang === "en" ? "font-bold text-amber-700" : "opacity-60"}`}>EN</button>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="h-7 w-7 text-destructive cursor-pointer" tooltip="Sair da Conta">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-3 border-t border-sidebar-border/30 pt-3 group-data-[collapsible=icon]:hidden px-1">
          <div className="flex flex-col min-w-0">
            <div className="text-xs font-bold text-emerald-950 truncate">
              {user?.nome || "Funcionário"}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {user?.email}
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AdminShell({ title, children }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-background px-4">
            <SidebarTrigger className="cursor-pointer" />
            <div className="gov-gold-rule w-8 h-0.5 bg-amber-500" />
            <h1 className="font-display text-lg font-bold text-emerald-950 truncate">
              {title}
            </h1>
          </header>
          <main className="flex-1 p-6 w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function StatusBadge({ tone, children }) {
  const cls = {
    neutral: "bg-muted text-muted-foreground border-border",
    info: "bg-status-info/10 text-status-info border-status-info/30",
    warn: "bg-status-warn/10 text-status-warn border-status-warn/40",
    danger: "bg-status-danger/10 text-status-danger border-status-danger/40",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200"
  }[tone] || "bg-muted text-muted-foreground border-border";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}