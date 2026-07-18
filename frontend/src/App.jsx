import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { AppProviders } from './lib/providers'; 
import { Toaster } from '@/components/ui/Sonner';

//  Páginas Públicas, de Informação e Autenticação
import Home from './pages/Home';        
import Register from './pages/Register';
import Login from './pages/Login';
import About from './pages/About';

// Páginas da Área do Aluno (Candidato)
import Painel from './pages/PainelAluno';
import CandidaturaDados from './pages/CandidaturaDados';
import CandidaturaDocumentos from './pages/CandidaturaDocumentos';
import CandidaturaCorrigir from './pages/CandidaturaCorrigir';

// Páginas da Área da Câmara Municipal (Administrador)
import AdminDashboard from './pages/AdminDashboard';
import DetalhesCandidatura from './pages/DetalhesCandidatura';
import CriarFuncionario from './pages/CriarFuncionario';

// Componente auxiliar para trancar rotas privadas 
function PrivateRoute({ children, allowedType }) {
  const { authenticated, user, loading } = useContext(AuthContext);
  
  console.log("[PrivateRoute] A verificar acesso para:", { 
    urlAtual: window.location.pathname,
    autenticado: authenticated, 
    utilizador: user, 
    tipoEsperado: allowedType,
    contextoCarregando: loading 
  });

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-sm text-muted-foreground animate-pulse">
        A carregar sessão...
      </div>
    );
  }
  
  if (!authenticated) {
    console.log("❌ [PrivateRoute] Expulso: Utilizador não está autenticado (token em falta).");
    return <Navigate to="/login" />;
  }
  
  if (allowedType && user?.tipo !== allowedType) {
    console.log(`❌ [PrivateRoute] Expulso: Tipo incorreto. Esperado: "${allowedType}", mas o user tem: "${user?.tipo}".`);
    return <Navigate to="/login" />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors/> 
        <AuthProvider>
            <AppProviders>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/about" element={<About />} />
              <Route path="/" element={<Home />} /> 
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              {/* Rotas Protegidas do Aluno (Candidato) */}
              <Route path="/painel" element={
                <PrivateRoute allowedType="candidato">
                  <Painel />
                </PrivateRoute>
              } />
              <Route path="/candidatura/dados" element={
                <PrivateRoute allowedType="candidato">
                  <CandidaturaDados />
                </PrivateRoute>
              } />
              <Route path="/candidatura/documentos" element={
                <PrivateRoute allowedType="candidato">
                  <CandidaturaDocumentos />
                </PrivateRoute>
              } />
              <Route path="/candidatura/corrigir" element={
                <PrivateRoute allowedType="candidato">
                  <CandidaturaCorrigir />
                </PrivateRoute>
              } />

              {/* Rotas Protegidas da Câmara Municipal (Admin) */}
              <Route path="/admin/dashboard" element={
                <PrivateRoute allowedType="admin">
                  <AdminDashboard />
                </PrivateRoute>
              } />
              <Route path="/admin/candidatura/:id" element={
                <PrivateRoute allowedType="admin">
                  <DetalhesCandidatura />
                </PrivateRoute>
              } />
              <Route path="/admin/criar-funcionario" element={
                <PrivateRoute allowedType="admin">
                  <CriarFuncionario />
                </PrivateRoute>
              } />

              {/* Redirecionamento padrão caso a rota não exista */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </AppProviders>
        </AuthProvider>
    </BrowserRouter>
  );
}

export default App;