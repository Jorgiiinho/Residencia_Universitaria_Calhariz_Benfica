import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthAPI, CandidaturaAPI } from "@/services/api";

const dict = {
  pt: {
    brand: "Munic\xEDpio da Ribeira Brava",
    subbrand: "Resid\xEAncia Universit\xE1ria de Calhariz-Benfica",
    nav_home: "In\xEDcio",
    nav_about: "Sobre a Resid\xEAncia",
    nav_login: "Entrar",
    nav_register: "Criar conta",
    nav_panel: "A minha \xE1rea",
    nav_logout: "Sair",
    login_title: "Entrar no portal",
    login_subtitle: "Aluno candidato ou funcion\xE1rio municipal",
    register_title: "Criar conta de candidato",
    email: "Email",
    password: "Palavra-passe",
    confirm_password: "Confirmar palavra-passe",
    first_name: "Nome",
    last_name: "Apelido",
    submit_login: "Entrar",
    submit_register: "Criar conta",
    have_account: "J\xE1 tenho conta",
    no_account: "Ainda n\xE3o tenho conta",
    welcome: "Bem-vindo/a",
    panel_title: "A minha candidatura",
    no_application: "Ainda n\xE3o tem uma candidatura activa para o presente ano letivo.",
    start_application: "Iniciar Nova Candidatura",
    application_state: "Estado da candidatura",
    continue_application: "Continuar candidatura",
    fix_documents: "Corrigir documentos",
    view_details: "Ver detalhes",
    step: "Passo",
    of: "de",
    personal_data: "Dados Pessoais",
    documents: "Documentos",
    review: "Revis\xE3o",
    save_continue: "Guardar e continuar",
    back: "Voltar",
    submit_final: "Submeter Candidatura Definitiva",
    add_member: "Adicionar Membro da Fam\xEDlia",
    remove: "Remover",
    full_name: "Nome completo",
    nif: "NIF",
    phone: "Telefone",
    kinship: "Grau de parentesco",
    birthdate: "Data de nascimento",
    cc_number: "N\xFAmero do Cart\xE3o de Cidad\xE3o",
    address: "Morada",
    postal_code: "C\xF3digo Postal",
    freguesia: "Freguesia",
    city: "Localidade",
    institution: "Institui\xE7\xE3o de Ensino Superior",
    course: "Curso",
    academic_year: "Ano letivo",
    admin_dashboard: "Painel de Administra\xE7\xE3o",
    admin_applications: "Candidaturas",
    admin_new_staff: "Novo Funcion\xE1rio",
    total_registered: "Total inscritos",
    pending: "Pendentes",
    approved: "Aprovados",
    rejected: "Rejeitados",
    process_id: "ID Processo",
    candidate: "Candidato",
    state: "Estado",
    actions: "A\xE7\xF5es",
    view_process: "Ver Processo",
    approve: "Aprovar",
    reject: "Rejeitar",
    reason: "Motivo",
    global_state: "Estado geral da candidatura",
    save: "Guardar"
  },
  en: {
    brand: "Municipality of Ribeira Brava",
    subbrand: "Calhariz-Benfica University Residence",
    nav_home: "Home",
    nav_about: "About the Residence",
    nav_login: "Sign in",
    nav_register: "Create account",
    nav_panel: "My area",
    nav_logout: "Sign out",
    login_title: "Sign in to the portal",
    login_subtitle: "Applicant student or municipal staff",
    register_title: "Create applicant account",
    email: "Email",
    password: "Password",
    confirm_password: "Confirm password",
    first_name: "First name",
    last_name: "Last name",
    submit_login: "Sign in",
    submit_register: "Create account",
    have_account: "I already have an account",
    no_account: "I don't have an account yet",
    welcome: "Welcome",
    panel_title: "My application",
    no_application: "You don't have an active application for this academic year yet.",
    start_application: "Start New Application",
    application_state: "Application status",
    continue_application: "Continue application",
    fix_documents: "Fix documents",
    view_details: "View details",
    step: "Step",
    of: "of",
    personal_data: "Personal Data",
    documents: "Documents",
    review: "Review",
    save_continue: "Save and continue",
    back: "Back",
    submit_final: "Submit Final Application",
    add_member: "Add Family Member",
    remove: "Remove",
    full_name: "Full name",
    nif: "Tax number (NIF)",
    phone: "Phone",
    kinship: "Kinship",
    birthdate: "Date of birth",
    cc_number: "Citizen Card number",
    address: "Address",
    postal_code: "Postal code",
    freguesia: "Parish",
    city: "City",
    institution: "Higher Education Institution",
    course: "Course",
    academic_year: "Academic year",
    admin_dashboard: "Admin Dashboard",
    admin_applications: "Applications",
    admin_new_staff: "New Staff Member",
    total_registered: "Total registered",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    process_id: "Process ID",
    candidate: "Candidate",
    state: "State",
    actions: "Actions",
    view_process: "View Process",
    approve: "Approve",
    reject: "Reject",
    reason: "Reason",
    global_state: "Overall application state",
    save: "Save"
  }
};

const I18nContext = createContext(null);

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n outside provider");
  return ctx;
}

const STORAGE_KEY = "rub-portal-store-v1";

const EMPTY_STORE = {
  users: [],
  passwords: {},
  applications: [],
  currentUserId: null
};

function loadStore() {
  if (typeof window === "undefined") return EMPTY_STORE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(EMPTY_STORE));
      return EMPTY_STORE;
    }
    return JSON.parse(raw);
  } catch {
    return EMPTY_STORE;
  }
}

function persist(s) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }
}

const StoreContext = createContext(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}

export function AppProviders({ children }) {
  const [lang, setLangState] = useState("pt");
  const [store, setStore] = useState(() => typeof window === "undefined" ? EMPTY_STORE : loadStore());

  useEffect(() => {
    setStore(loadStore());
    const l = typeof window !== "undefined" ? localStorage.getItem("rub-lang") : null;
    if (l === "pt" || l === "en") setLangState(l);
  }, []);

  const setLang = useCallback((l) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("rub-lang", l);
  }, []);

  const t = useCallback((k) => dict[lang][k] ?? dict.pt[k], [lang]);

  const commit = useCallback((next) => {
    persist(next);
    setStore(next);
  }, []);

  // Utilizador Ativo
  const currentUser = useMemo(() => {
    if (typeof window === "undefined") return null;
    const localUserRaw = localStorage.getItem("auth_user");
    if (localUserRaw) {
      try {
        const localUser = JSON.parse(localUserRaw);
        const norm = {
          id: String(localUser.id),
          email: localUser.email,
          firstName: localUser.firstName || localUser.nome || "",
          lastName: localUser.lastName || localUser.apelido || "",
          role: localUser.role || localUser.tipo || "candidato",
          phone: localUser.phone || localUser.telefone
        };
        return norm;
      } catch (e) {
        return null;
      }
    }
    return store.users.find((u) => u.id === store.currentUserId) ?? null;
  }, [store]);

  // Sincronização detalhada com o TiDB
  // Agora aceita opcionalmente o ID e Cargo enviados pelas páginas
  const syncCandidatura = useCallback(async (forcedUserId, forcedRole) => {
    const currentId = forcedUserId || currentUser?.id;
    const currentRole = forcedRole || currentUser?.role;

    console.log("🔍 [Sync] syncCandidatura() acionado no Provider. ID:", currentId, "Role:", currentRole);

    if (!currentId || (currentRole !== "candidato" && currentRole !== "candidate")) {
      console.warn("⚠️ [Sync] Abortado: utilizador não autenticado ou não é candidato.");
      return;
    }

    try {
      console.log("🚀 [Sync] A efetuar pedido GET a /api/candidaturas/me ...");
      const { data } = await CandidaturaAPI.obterMinha();
      console.log("📥 [Sync] Resposta do TiDB Cloud:", data);

      if (data && data.ok && data.candidatura) {
        const apiApp = data.candidatura;
        console.log("📦 [Sync] Dossiê recebido do TiDB com Sucesso:", apiApp);
        
        const candidaturaNormalizada = {
          id: apiApp.id,
          userId: String(apiApp.userId),
          status: apiApp.status || "rascunho",
          personal: {
            ...apiApp.personal,
            freguesia: apiApp.personal.freguesia || ""
          },
          family: apiApp.family || [],
          documents: apiApp.documents || []
        };

        setStore((prevStore) => {
          const outrasCandidaturas = prevStore.applications.filter(
            (a) => String(a.userId) !== String(currentId)
          );
          
          const novoStore = { 
            ...prevStore, 
            applications: [...outrasCandidaturas, candidaturaNormalizada] 
          };
          console.log("💾 [Sync] Store local atualizado com a candidatura!", novoStore.applications);
          persist(novoStore);
          return novoStore;
        });
      } else {
        console.warn("⚠️ [Sync] API respondeu OK mas não encontrou candidatura para o ID:", currentId);
      }
    } catch (error) {
      console.error("❌ [Sync] Erro de rede/API ao chamar obterMinha():", error);
    }
  }, [currentUser?.id, currentUser?.role]);

  const login = async (email, pwd) => {
    try {
      const { data } = await AuthAPI.login(email, pwd);
      const apiUser = data.user ?? data;
      const token = data.token;
      if (token && typeof window !== "undefined") localStorage.setItem("token", token);
      const normalized = {
        id: String(apiUser.id),
        email: apiUser.email,
        firstName: apiUser.nome ?? apiUser.firstName ?? "",
        lastName: apiUser.apelido ?? apiUser.lastName ?? "",
        role: apiUser.tipo ?? apiUser.role ?? "candidato",
        phone: apiUser.telefone ?? apiUser.phone,
      };
      if (typeof window !== "undefined") localStorage.setItem("auth_user", JSON.stringify(normalized));
      const existing = store.users.find((u) => u.id === normalized.id);
      const users = existing ? store.users.map((u) => u.id === normalized.id ? normalized : u) : [...store.users, normalized];
      commit({ ...store, users, currentUserId: normalized.id });
      return { ok: true, role: normalized.role };
    } catch (err) {
      const u = store.users.find((x) => x.email.toLowerCase() === email.toLowerCase());
      if (!u) return { ok: false, error: "Utilizador não encontrado." };
      if (store.passwords && store.passwords[u.email] !== pwd) return { ok: false, error: "Palavra-passe incorreta." };
      commit({ ...store, currentUserId: u.id });
      return { ok: true, role: u.role };
    }
  };

  const register = async ({ firstName, lastName, email, password }) => {
    try {
      const { data } = await AuthAPI.register({
        nome: firstName,
        apelido: lastName,
        email,
        password,
        tipo: "candidato",
      });
      const apiUser = data.user ?? data;
      const token = data.token;
      if (token && typeof window !== "undefined") localStorage.setItem("token", token);
      const normalized = {
        id: String(apiUser.id ?? `cand-${Date.now()}`),
        email,
        firstName,
        lastName,
        role: "candidato",
      };
      if (typeof window !== "undefined") localStorage.setItem("auth_user", JSON.stringify(normalized));
      commit({
        ...store,
        users: [...store.users, normalized],
        currentUserId: normalized.id,
      });
      return { ok: true };
    } catch (err) {
      if (store.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { ok: false, error: "Já existe uma conta com este email." };
      }
      const id = `cand-${Date.now()}`;
      const user = { id, email, firstName, lastName, role: "candidato" };
      commit({
        ...store,
        users: [...store.users, user],
        passwords: { ...store.passwords, [email]: password },
        currentUserId: id,
      });
      return { ok: true };
    }
  };

  const createAdmin = async ({ firstName, lastName, email, password, phone }) => {
    try {
      const { AdminAPI } = await import("@/services/api");
      await AdminAPI.criarFuncionario({
        nome: firstName,
        apelido: lastName,
        email,
        password,
        telefone: phone,
        tipo: "admin",
      });
      return { ok: true };
    } catch (err) {
      if (store.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { ok: false, error: "Já existe uma conta com este email." };
      }
      const id = `admin-${Date.now()}`;
      const user = { id, email, firstName, lastName, role: "admin", phone };
      commit({
        ...store,
        users: [...store.users, user],
        passwords: { ...store.passwords, [email]: password },
      });
      return { ok: true };
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
    }
    commit({ ...store, currentUserId: null });
  };

  // 🌟 DIAGNÓSTICO: Log ao pesquisar candidatura na memória
  const getApplicationForCurrent = () => {
    if (!currentUser) {
      console.log("🔍 [GetApp] currentUser é null!");
      return null;
    }
    const found = store.applications.find((a) => String(a.userId) === String(currentUser.id)) ?? null;
    console.log("🔍 [GetApp] Procurar app para:", currentUser.id, "| Encontrado:", found);
    return found;
  };

  const createApplicationForCurrent = () => {
    if (!currentUser) return "";
    const id = `APP-${new Date().getFullYear()}-${String(store.applications.length + 1).padStart(4, "0")}`;
    const app = {
      id,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      status: "incompleta",
      personal: {},
      family: [],
      documents: []
    };
    commit({ ...store, applications: [...store.applications, app] });
    return id;
  };

  const updateApplication = (id, patch) => {
    const existe = store.applications.some((a) => a.id === id);
    let novasCandidaturas;

    if (existe) {
      novasCandidaturas = store.applications.map((a) => a.id === id ? { ...a, ...patch } : a);
    } else {
      novasCandidaturas = [
        ...store.applications,
        {
          id,
          userId: currentUser?.id,
          createdAt: new Date().toISOString(),
          status: "incompleta",
          personal: patch.personal || {},
          family: patch.family || [],
          documents: patch.documents || []
        }
      ];
    }

    commit({
      ...store,
      applications: novasCandidaturas
    });
  };

  const storeValue = useMemo(
    () => ({
      store,
      currentUser,
      login,
      register,
      logout,
      updateApplication,
      createApplicationForCurrent,
      getApplicationForCurrent,
      createAdmin,
      syncCandidatura
    }),
    [store, currentUser, syncCandidatura]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      <StoreContext.Provider value={storeValue}>{children}</StoreContext.Provider>
    </I18nContext.Provider>
  );
}

export const DOC_LABELS = {
  CC_Frente: { pt: "Cartão de Cidadão (Frente)", en: "Citizen Card (Front)" },
  CC_Verso: { pt: "Cartão de Cidadão (Verso)", en: "Citizen Card (Back)" },
  IRS: { pt: "Declaração de IRS", en: "Tax Return (IRS)" },
  DeclaracaoResidencia: { pt: "Declaração de Residência", en: "Residence Declaration" },
  DomicilioFiscal: { pt: "Declaração de Domicílio Fiscal", en: "Fiscal Domicile" },
  Matricula: { pt: "Comprovativo de Matrícula", en: "Enrollment Proof" },
  Bolsa: { pt: "Documento de Bolsa de Estudo", en: "Scholarship Document" },
  Rendimentos: { pt: "Comprovativos de Rendimento", en: "Income Statements" }
};

export const ALL_DOC_TYPES = [
  "CC_Frente",
  "CC_Verso",
  "IRS",
  "DeclaracaoResidencia",
  "DomicilioFiscal",
  "Matricula",
  "Bolsa",
  "Rendimentos"
];

export const DOC_BACKEND_ENUM = {
  CC_Frente: "CC_frente",
  CC_Verso: "CC_verso",
  IRS: "IRS",
  DeclaracaoResidencia: "Declaracao_Residencia",
  DomicilioFiscal: "Declaracao_Domicilio_Fiscal",
  Matricula: "Comprovativo_Inscricao_Matricula",
  Bolsa: "Documento_bolsa_estudo",
  Rendimentos: "Comprovativos_Rendimento_Anuais",
  Formulario: "Formulario_candidatura",
};

export function statusMeta(s) {
  switch (s) {
    case "incompleta":
    case "rascunho":
    case "aguarda_documentos":
      return { label: "Incompleta", tone: "neutral" };
    case "aguarda_validacao":
      return { label: "Aguarda Validação", tone: "info" };
    case "em_analise":
      return { label: "Em Análise", tone: "warn" };
    case "pendente_correcao":
    case "correcao_urgente":
      return { label: "Correção Urgente", tone: "danger" };
    case "aprovada":
    case "aprovado":
      return { label: "Aprovada", tone: "success" };
    case "rejeitada":
    case "rejeitado":
      return { label: "Rejeitada", tone: "danger-dark" };
    case "arquivada":
    case "arquivado":
      return { label: "Arquivada", tone: "neutral" };
    case "desistencia":
      return { label: "Desistência", tone: "neutral" };
    default:
      return { label: s ?? "—", tone: "neutral" };
  }
}