import axios from "axios";

// Suporte para variável de ambiente (.env) com fallback automático
const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor de Pedidos: Injeta automaticamente o Token JWT nas requisições
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respostas: Trata a expiração de sessão (Erro 401)
api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
    }
    return Promise.reject(err);
  }
);

export default api;

/* --------- Endpoints (Helpers de Integração da API) --------- */

export const AuthAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (payload) => api.post("/auth/register", payload),
  me: () => api.get("/auth/me"),
};

export const CandidaturaAPI = {
  obterMinha: () => api.get("/candidaturas/me"),
  criarOuAtualizar: (dados) => api.post("/candidaturas", dados),
  adicionarAgregado: (familiares) => api.post("/candidaturas/agregado", { familiares }),
  submeter: (id) => api.post(`/candidaturas/${id}/submeter`),
};

export const DocumentosAPI = {
  listarPorCandidato: (candidatoId) => api.get(`/documentos/candidato/${candidatoId}`),
  upload: (candidatoId, tipoDocumento, file) => {
    const form = new FormData();
    form.append("tipo_documento", tipoDocumento);
    form.append("file", file);
    return api.post(`/documentos/candidato/${candidatoId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  reenviar: (documentoId, file) => {
    const form = new FormData();
    form.append("file", file);
    return api.put(`/documentos/${documentoId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  // 🌟 Blindagem de Nomes para Estado de Documento
  atualizarEstado: (documentoId, estado, motivo) =>
    api.put(`/documentos/${documentoId}/estado`, {
      estado: estado,
      status: estado,
      motivo: motivo,
      rejectionReason: motivo,
      motivo_rejeicao: motivo,
    }),
};

export const AdminAPI = {
  listarCandidaturas: (estado) =>
    api.get("/admin/candidaturas", { params: estado ? { estado, status: estado } : {} }),
  obterCandidatura: (id) => api.get(`/admin/candidaturas/${id}`),

  // 🌟 Blindagem de Nomes para Alteração do Estado da Candidatura (Envia todas as variantes)
  atualizarEstadoCandidatura: (id, estado, observacoes) =>
    api.put(`/admin/candidaturas/${id}/estado`, {
      estado: estado,
      status: estado,
      observacoes: observacoes,
      mensagem: observacoes,
      notas: observacoes,
    }),

  criarFuncionario: (payload) => api.post("/admin/funcionarios", payload),
};