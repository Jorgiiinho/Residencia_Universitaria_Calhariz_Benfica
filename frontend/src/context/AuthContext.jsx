import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

// Função Protetora para ler o localStorage sem quebrar o site
const obterUtilizadorInicial = () => {
  const usuarioGuardado = localStorage.getItem('user');

  if (!usuarioGuardado || usuarioGuardado === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(usuarioGuardado);
  } catch (error) {
    console.error("Erro ao ler o utilizador do localStorage:", error);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(obterUtilizadorInicial);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se quiseres ser extra cuidadoso:
    const token = localStorage.getItem("token");
    setLoading(false);
}, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data.ok) {
        const tokenRecebido = response.data.token;
        const dadosUser = response.data.user;

        localStorage.setItem("token", tokenRecebido);
        localStorage.setItem("user", JSON.stringify(dadosUser));

        setToken(tokenRecebido);
        setUser(dadosUser);

        return { sucess: true, tipo: dadosUser.tipo };
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return {
        sucess: false,
        message: error.response?.data?.error || "Credenciais inválidas ou erro no servidor."
      };
    }
  };

  // FUNÇÃO DE REGISTO CORRIGIDA E ADICIONADA
  const register = async (dados) => {
    try {
      // Ajusta o endpoint '/auth/register' se o teu backend usar outro caminho
      const response = await api.post("/auth/register", dados);

      if (response.data.ok) {
        return { ok: true };
      } else {
        return { ok: false, error: response.data.error || "Erro ao criar conta." };
      }
    } catch (error) {
      console.error("Erro no registo:", error);
      return { 
        ok: false, 
        error: error.response?.data?.error || "Serviço de registo indisponível." 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        token, 
        setUser, 
        setToken, 
        login, 
        logout, 
        register,
        authenticated: !!token, 
        loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}