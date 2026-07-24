import axios from "axios";

const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

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

/* --------- Endpoints --------- */

export const AuthAPI = {
  login: (emailOrObject, password) => {
    if (typeof emailOrObject === "object") {
      return api.post("/auth/login", emailOrObject);
    }
    return api.post("/auth/login", { email: emailOrObject, password });
  },
  register: (payload) => api.post("/auth/register", payload),
  me: () => api.get("/auth/me"),
  recuperarPassword: (email) => api.post("/auth/recuperar-password", { email }),
  reenviarVerificacao: (email) => api.post("/auth/reenviar-verificacao", { email }),
  redefinirPassword: (token, password) => api.post("/auth/redefinir-password", { token, password })
};

export const ConfigAPI = {
  // Endpoint público para consultar o período ativo
  obterEstadoPeriodo: () => api.get("/admin/periodo-candidaturas/estado"),
};

export const CandidaturaAPI = {
  obterMinha: () => api.get("/candidaturas/me"),
  criarOuAtualizar: (dados) => api.post("/candidaturas", dados),
  guardarRascunho: (dados) => api.post("/candidaturas", dados),
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
  atualizarEstado: (documentoId, estado, motivo) =>
    api.put(`/documentos/${documentoId}/estado`, {
      estado,
      status: estado,
      motivo,
      rejectionReason: motivo,
      motivo_rejeicao: motivo,
    }),
};

export const FaqAPI = {
  listar: () => api.get("/faqs"),
  criar: (payload) => api.post("/admin/faqs", payload),
  atualizar: (id, payload) => api.put(`/admin/faqs/${id}`, payload),
  eliminar: (id) => api.delete(`/admin/faqs/${id}`),
};

export const AdminAPI = {
  listarCandidaturas: (params) =>
    api.get("/admin/candidaturas", { params: typeof params === "string" ? { estado: params } : params }),
  
  obterAnosLetivos: () => api.get("/admin/anos-letivos"),
  obterCandidatura: (id) => api.get(`/admin/candidaturas/${id}`),
  obterDetalhes: (id) => api.get(`/admin/candidaturas/${id}`),

  // 🟢 NOVO: Método para adicionar observação permanente ao histórico
  adicionarObservacao: (id, texto) =>
    api.post(`/admin/candidaturas/${id}/observacoes`, { texto }),
  adicionarNota: (id, texto) =>
    api.post(`/admin/candidaturas/${id}/observacoes`, { texto }),

  atualizarEstadoCandidatura: (id, estado, observacoes) =>
    api.put(`/admin/candidaturas/${id}/estado`, {
      estado,
      status: estado,
      observacoes,
      mensagem: observacoes,
      notas: observacoes,
    }),
  atualizarEstado: (id, estado, observacoes) =>
    api.put(`/admin/candidaturas/${id}/estado`, {
      estado,
      status: estado,
      observacoes,
      mensagem: observacoes,
      notas: observacoes,
    }),

  atualizarEstadoDocumento: (docId, estado, motivo) =>
    api.put(`/admin/documentos/${docId}/estado`, {
      estado,
      status: estado,
      motivo,
      rejectionReason: motivo,
    }),

  criarFuncionario: (payload) => api.post("/admin/criar-admin", payload),
  criarAdmin: (payload) => api.post("/admin/criar-admin", payload),
  
  togglePeriodoCandidaturas: (candidaturasAbertas, anoLetivo) =>
    api.put("/admin/periodo-candidaturas", { candidaturasAbertas, anoLetivo }),
};
