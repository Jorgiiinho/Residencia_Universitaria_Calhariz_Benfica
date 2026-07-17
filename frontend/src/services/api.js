import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
    }
    return Promise.reject(err);
  },
);

export default api;

/* --------- Endpoints (helpers) --------- */

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
  atualizarEstado: (documentoId, estado, motivo) =>
    api.put(`/documentos/${documentoId}/estado`, { estado, motivo }),
};

export const AdminAPI = {
  listarCandidaturas: (estado) =>
    api.get("/admin/candidaturas", { params: estado ? { estado } : {} }),
  obterCandidatura: (id) => api.get(`/admin/candidaturas/${id}`),
  atualizarEstadoCandidatura: (id, estado, observacoes) =>
    api.put(`/admin/candidaturas/${id}/estado`, { estado, observacoes }),
  criarFuncionario: (payload) => api.post("/admin/funcionarios", payload),
};