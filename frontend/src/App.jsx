import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import Register from './pages/Register';
import Login from './pages/Login';
import Painel from './pages/PainelAluno';
import CandidaturaDados from './pages/CandidaturaDados';

// Componente auxiliar para trancar rotas privadas 
function PrivateRoute({ children, allowedType }) {
  const { authenticated, user, loading } = useContext(AuthContext);
  
  // Mostra o estado real do utilizador no milissegundo em que a rota tenta abrir
  console.log("[PrivateRoute] A verificar acesso para:", { 
    urlAtual: window.location.pathname,
    autenticado: authenticated, 
    utilizador: user, 
    tipoEsperado: allowedType,
    contextoCarregando: loading 
  });

  // Se o contexto ainda estiver a ler o localStorage, espera e não redireciona já
  if (loading) {
    return <div>A carregar sessão...</div>;
  }
  
  if (!authenticated) {
    console.log("❌ [PrivateRoute] Expulso: Utilizador não está autenticado (token em falta).");
    return <Navigate to="/login" />;
  }
  
  if (allowedType && user?.tipo !== allowedType) {
    console.log(`❌ [PrivateRoute] Expulso: Tipo incorreto. Esperado: "${allowedType}", mas o user tem: "${user?.tipo}".`);
    return <Navigate to="/login" />; // Corrigido de / para /login para evitar a armadilha do *
  }
  
  console.log("✅ [PrivateRoute] Acesso Autorizado! A renderizar o ecrã.");
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas do Aluno (Candidato) */}
          <Route path="/painel" element={<PrivateRoute allowedType="candidato"><Painel /></PrivateRoute>} />
          <Route path="/candidatura/dados" element={<PrivateRoute allowedType="candidato"><CandidaturaDados /></PrivateRoute>} />
          <Route path="/candidatura/documentos" element={<PrivateRoute allowedType="candidato"><div><h3>Upload de Ficheiros</h3></div></PrivateRoute>} />
          <Route path="/candidatura/corrigir" element={<PrivateRoute allowedType="candidato"><div><h3>Ecrã de Correção Urgente</h3></div></PrivateRoute>} />

          {/* Rotas Protegidas da Câmara Municipal (Admin) */}
          <Route path="/admin/dashboard" element={<PrivateRoute allowedType="admin"><div><h3>Dashboard do Admin</h3></div></PrivateRoute>} />
          <Route path="/admin/candidatura/:id" element={<PrivateRoute allowedType="admin"><div><h3>Dossiê do Aluno</h3></div></PrivateRoute>} />
          <Route path="/admin/criar-funcionario" element={<PrivateRoute allowedType="admin"><div><h3>Registar Staff</h3></div></PrivateRoute>} />

          {/* Redirecionamento padrão caso a rota não exista */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;