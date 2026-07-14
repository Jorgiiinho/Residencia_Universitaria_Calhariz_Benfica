import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

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
  SidebarFooter,
} from "./ui/Sidebar";
import { LayoutDashboard, Users, UserPlus, LogOut, Globe } from "lucide-react";
import { Button } from "./ui/button";

// Dicionário de Traduções para o Administrador
const traducoesAdmin = {
  pt: {
    admin_dashboard: "Painel Municipal",
    admin_applications: "Candidaturas",
    admin_new_staff: "Criar Funcionário",
    nav_logout: "Sair da Conta"
  },
  en: {
    admin_dashboard: "Municipal Dashboard",
    admin_applications: "Applications",
    admin_new_staff: "Create Staff",
    nav_logout: "Logout"
  }
};

const items = [
  { title: "admin_dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "admin_applications", url: "/admin/dashboard", icon: Users },
  { title: "admin_new_staff", url: "/admin/criar-funcionario", icon: UserPlus },
];

function AdminSidebar({ lang, setLang, t }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/50 px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-gold text-gold-foreground">
            <span className="font-display text-sm font-bold">RB</span>
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="font-display text-sm font-bold leading-tight text-sidebar-foreground">
              Ribeira Brava
            </div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Painel Municipal
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("admin_dashboard")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title + item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{t(item.title)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50 p-2">
        <div className="flex items-center gap-1 px-2 pb-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
          <Globe className="h-3 w-3" />
          <button
            onClick={() => setLang("pt")}
            className={`px-1 ${lang === "pt" ? "font-semibold text-gold" : ""}`}
          >
            PT
          </button>
          <span>·</span>
          <button
            onClick={() => setLang("en")}
            className={`px-1 ${lang === "en" ? "font-semibold text-gold" : ""}`}
          >
            EN
          </button>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>{t("nav_logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 pt-2 text-[10px] text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
          {user?.nome} {user?.apelido}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AdminShell({ title, children }) {
  const [lang, setLang] = useState("pt");
  const t = (key) => traducoesAdmin[lang]?.[key] || key;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AdminSidebar lang={lang} setLang={setLang} t={t} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-background px-4">
            <SidebarTrigger />
            <div className="gov-gold-rule w-8" />
            <h1 className="font-display text-lg font-bold text-deep truncate">
              {title}
            </h1>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function AdminLayout({ title, children }) {
  return <AdminShell title={title}>{children}</AdminShell>;
}

export function StatusBadge({ tone, children }) {
  const cls = {
    neutral: "bg-muted text-muted-foreground border-border",
    info: "bg-status-info/10 text-status-info border-status-info/30",
    warn: "bg-status-warn/10 text-status-warn border-status-warn/40",
    danger: "bg-status-danger/10 text-status-danger border-status-danger/40",
    "danger-dark": "bg-status-danger/20 text-status-danger border-status-danger/50",
    success: "bg-status-success/10 text-status-success border-status-success/40",
  }[tone];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {children}
    </span>
  );
}

export { Button };