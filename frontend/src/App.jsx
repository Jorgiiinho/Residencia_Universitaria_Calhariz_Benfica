import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { AppProviders } from './lib/providers'; 
import { Toaster } from '@/components/ui/Sonner';

// Páginas Públicas e de Autenticação
import Home from './pages/Home';        
import Register from './pages/Register';
import Login from './pages/Login';
import About from './pages/About';
import FaqPage from './pages/Faq';
import RedefinirPassword from './pages/RedefinirPassword';

// Páginas da Área do Aluno (Candidato)
import Painel from './pages/PainelAluno';
import CandidaturaDados from './pages/CandidaturaDados';
import CandidaturaDocumentos from './pages/CandidaturaDocumentos';
import CandidaturaCorrigir from './pages/CandidaturaCorrigir';

// Páginas da Área da Câmara Municipal (Admin e SuperAdmin)
import AdminDashboard from './pages/AdminDashboard';
import AdminHistorico from './pages/AdminHistorico';
import DetalhesCandidatura from './pages/DetalhesCandidatura';
import CriarFuncionario from './pages/CriarFuncionario';
import AdminFaqs from './pages/AdminFaqs';

// Componente auxiliar para trancar rotas privadas (Corrigido contra loops)
function PrivateRoute({ children, allowedTypes }) {
  const { authenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-sm text-muted-foreground animate-pulse">
        A carregar sessão...
      </div>
    );
  }
  
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Normaliza os tipos permitidos numa lista (suporta "candidato", ["admin", "superadmin"], etc.)
  const allowedList = Array.isArray(allowedTypes) 
    ? allowedTypes 
    : typeof allowedTypes === 'string' 
      ? allowedTypes.split(',').map(t => t.trim()) 
      : [];

  // Se forem especificadas permissões e o tipo de utilizador não constar na lista
  if (allowedList.length > 0 && !allowedList.includes(user?.tipo)) {
    // Evita loop enviando o utilizador para a sua respetiva área em vez de /login
    const fallbackRoute = (user?.tipo === "admin" || user?.tipo === "superadmin") 
      ? "/admin/dashboard" 
      : "/painel";

    return <Navigate to={fallbackRoute} replace />;
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
            <Route path="/" element={<Home />} /> 
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/redefinir-password" element={<RedefinirPassword />} />

            {/* Rotas Protegidas do Aluno (Candidato) */}
            <Route path="/painel" element={
              <PrivateRoute allowedTypes={["candidato"]}>
                <Painel />
              </PrivateRoute>
            } />
            <Route path="/candidatura/dados" element={
              <PrivateRoute allowedTypes={["candidato"]}>
                <CandidaturaDados />
              </PrivateRoute>
            } />
            <Route path="/candidatura/documentos" element={
              <PrivateRoute allowedTypes={["candidato"]}>
                <CandidaturaDocumentos />
              </PrivateRoute>
            } />
            <Route path="/candidatura/corrigir" element={
              <PrivateRoute allowedTypes={["candidato"]}>
                <CandidaturaCorrigir />
              </PrivateRoute>
            } />

            {/* Rotas Protegidas da Câmara Municipal (Admin e SuperAdmin) */}
            <Route path="/admin/dashboard" element={
              <PrivateRoute allowedTypes={["admin", "superadmin"]}>
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/historico" element={
              <PrivateRoute allowedTypes={["admin", "superadmin"]}>
                <AdminHistorico />
              </PrivateRoute>
            } />
            <Route path="/admin/faqs" element={
              <PrivateRoute allowedTypes={["admin", "superadmin"]}>
                <AdminFaqs />
              </PrivateRoute>
            } />
            <Route path="/admin/candidatura/:id" element={
              <PrivateRoute allowedTypes={["admin", "superadmin"]}>
                <DetalhesCandidatura />
              </PrivateRoute>
            } />
            <Route path="/admin/criar-funcionario" element={
              <PrivateRoute allowedTypes={["superadmin"]}>
                <CriarFuncionario />
              </PrivateRoute>
            } />

            {/* Redirecionamento padrão seguro */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AppProviders>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;