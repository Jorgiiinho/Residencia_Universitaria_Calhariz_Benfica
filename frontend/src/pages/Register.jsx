import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  
  const { login } = useContext(AuthContext); 

  const [formData, setFormData] = useState({
    nome: '',
    apelido: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // 1. Faz o registo do aluno normalmente no Backend
      const response = await api.post('/auth/register', formData);

      if (response.data.ok) {
        setSuccess('Conta criada com sucesso! A iniciar sessão...');

        // Chamamos a função login 
        const resultadoLogin = await login(formData.email, formData.password);

        if (resultadoLogin.sucess) {
          // Se o login correu bem (o token já está no sítio e guardado), avançamos sem espirrar!
          navigate('/painel');
        } else {
          // Caso o login automático falhe por algum motivo raro, avisa o aluno
          setError('Conta criada, mas ocorreu um erro ao entrar automaticamente. Por favor, tente fazer login.');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro ao efetuar o registo. Tente novamente.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '20px', fontFamily: 'Arial, sans-serif', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', color: '#0056b3' }}>Município da Ribeira Brava</h2>
      <h4 style={{ textAlign: 'center', color: '#666', marginTop: '-10px' }}>Portal de Inscrição - Residência de Benfica</h4>
      
      <h3 style={{ marginTop: '25px', borderBottom: '2px solid #0056b3', paddingBottom: '5px' }}>Criar Conta</h3>

      {error && <div style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold' }}>⚠️ {error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '15px', fontWeight: 'bold' }}>✅ {success}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ fontWeight: 'bold' }}>Nome:</label>
          <input type="text" name="nome" value={formData.nome} onChange={handleChange} required placeholder="Ex: João Pedro" style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Apelido:</label>
          <input type="text" name="apelido" value={formData.apelido} onChange={handleChange} required placeholder="Ex: Costa Silva" style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>E-mail:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="estudante@ribeirabrava.pt" style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Palavra-passe:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Defina a sua senha" style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <button type="submit" style={{ padding: '12px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>
          Registar e Continuar
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        Já tem uma conta? <span onClick={() => navigate('/login')} style={{ color: '#0056b3', textDecoration: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Faça login aqui</span>.
      </p>
    </div>
  );
}