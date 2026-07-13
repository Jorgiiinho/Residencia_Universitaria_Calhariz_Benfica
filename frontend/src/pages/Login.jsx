import {useState, useEffect,useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
    const { login, authenticated, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (authenticated && user) {
            if (user.tipo === 'admin') {
                navigate('/admin/dashboard');
            } else{
                navigate('/painel');
            }
        }   
    },[authenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        setLoading(false);  

        if (result.success) {
            if (result.tipo === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/painel');
            }
        }else{
            setError(result.message || 'Credenciais inválidas ou erro no servidor.');
        }
    };

   return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px', fontFamily: 'Arial, sans-serif', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0,0,0,0.05)', backgroundColor: '#fff', color: '#333' }}>
      <h2 style={{ textAlign: 'center', color: '#0056b3', marginBottom: '5px' }}>Município da Ribeira Brava</h2>
      <h4 style={{ textAlign: 'center', color: '#666', marginTop: '0px', marginBottom: '30px' }}>Portal de Candidaturas - Residência de Benfica</h4>
      
      <h3 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '5px', marginBottom: '20px' }}>Entrar no Sistema</h3>

      {error && <div style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold' }}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Ex: estudante@ribeirabrava.pt"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Palavra-passe:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Introduza a sua senha"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            background: loading ? '#cccccc' : '#0056b3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '10px'
          }}
        >
          {loading ? 'A verificar...' : 'Iniciar Sessão'}
        </button>
      </form>

      <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px' }}>
        Ainda não tem conta de estudante? <span onClick={() => navigate('/register')} style={{ color: '#0056b3', fontWeight: 'bold',cursor: 'pointer', textDecoration: 'none' }}>Registe-se aqui</span>.
        {/*Esqueceu-se da sua palavra-passe? <span style={{ color: '#0056b3', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none' }} onClick={() => navigate('/recuperar_password')}> Recuperar Password</span>.*/}
      </p>
    </div>
  );
}