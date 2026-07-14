import { createContext, useContext, useState, useEffect } from "react";

// Dicionário Oficial de Traduções (PT / EN)
export const dict = {
  pt: {
    brand: "Município da Ribeira Brava",
    subbrand: "Residência Universitária de Calhariz-Benfica",
    nav_home: "Início",
    nav_about: "Sobre a Residência",
    nav_login: "Entrar",
    nav_register: "Criar conta",
    nav_panel: "A minha área",
    nav_logout: "Sair",
    login_title: "Entrar no portal",
    login_subtitle: "Aluno candidato ou funcionário municipal",
    register_title: "Criar conta de candidato",
    email: "Email",
    password: "Palavra-passe",
    confirm_password: "Confirmar palavra-passe",
    first_name: "Nome",
    last_name: "Apelido",
    submit_login: "Entrar",
    submit_register: "Criar conta",
    have_account: "Já tenho conta",
    no_account: "Ainda não tenho conta",
    welcome: "Bem-vindo/a",
    panel_title: "A minha candidatura",
    no_application: "Ainda não tem uma candidatura ativa para o presente ano letivo.",
    start_application: "Iniciar Nova Candidatura",
    application_state: "Estado da candidatura",
    continue_application: "Continuar candidatura",
    fix_documents: "Corrigir documentos",
    view_details: "Ver detalhes",
    step: "Passo",
    of: "de",
    personal_data: "Dados Pessoais",
    documents: "Documentos",
    review: "Revisão",
    save_continue: "Guardar e continuar",
    back: "Voltar",
    submit_final: "Submeter Candidatura Definitiva",
    add_member: "Adicionar Membro da Família",
    remove: "Remover",
    full_name: "Nome completo",
    nif: "NIF",
    phone: "Telefone",
    kinship: "Grau de parentesco",
    birthdate: "Data de nascimento",
    cc_number: "Número do Cartão de Cidadão",
    address: "Morada",
    postal_code: "Código Postal",
    city: "Localidade",
    institution: "Instituição de Ensino Superior",
    course: "Curso",
    academic_year: "Ano letivo",
    admin_dashboard: "Painel de Administração",
    admin_applications: "Candidaturas",
    admin_new_staff: "Novo Funcionário",
    total_registered: "Total inscritos",
    pending: "Pendentes",
    approved: "Aprovados",
    rejected: "Rejeitados",
    process_id: "ID Processo",
    candidate: "Candidato",
    state: "Estado",
    actions: "Ações",
    view_process: "Ver Processo",
    approve: "Aprovar",
    reject: "Rejeitar",
    reason: "Motivo",
    global_state: "Estado geral da candidatura",
    save: "Guardar",
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
    save: "Save",
  },
};

// Estruturas auxiliares que as páginas de Documentos e Analise necessitam
export const ALL_DOC_TYPES = [
  'Formulario_candidatura',
  'CC',
  'Declaracao_Residencia',
  'Declaracao_Domicilio_Fiscal',
  'Comprovativo_Inscricao_Matricula',
  'Documento_bolsa_estudo',
  'IRS',
  'Comprovativos_Rendimento_Anuais'
];

export const DOC_LABELS = {
  Formulario_candidatura: { pt: "Formulário de Candidatura Assinado", en: "Signed Application Form" },
  CC: { pt: "Cópia do Cartão de Cidadão", en: "ID Card Copy" },
  Declaracao_Residencia: { pt: "Declaração de Residência", en: "Residence Declaration" },
  Declaracao_Domicilio_Fiscal: { pt: "Declaração de Domicílio Fiscal", en: "Fiscal Domicile Declaration" },
  Comprovativo_Inscricao_Matricula: { pt: "Comprovativo de Inscrição / Matrícula", en: "Proof of Enrollment" },
  Documento_bolsa_estudo: { pt: "Documento de Bolsa de Estudo", en: "Scholarship Document" },
  IRS: { pt: "Declaração de IRS", en: "Tax Return (IRS)" },
  Comprovativos_Rendimento_Anuais: { pt: "Comprovativos de Rendimentos Anuais", en: "Annual Income Statements" }
};

// Criar o contexto React global para a Tradução
const I18nContext = createContext(null);

export function AppProviders({ children }) {
  // Guarda a preferência de língua no disco local para não se perder ao atualizar a página!
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem("lang") || "pt";
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  };

  // Função tradutora
  const t = (key) => {
    return dict[lang]?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook personalizado para ler o idioma em qualquer página
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n deve ser usado dentro de um AppProviders");
  return ctx;
}