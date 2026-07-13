import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CandidaturaDados() {
  const navigate = useNavigate();
  
  // Controla em que passo o aluno está (1 = Pessoais, 2 = Académicos)
  const [passo, setPasso] = useState(1);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado com TODOS os teus campos exatos do Backend
  const [formData, setFormData] = useState({
    data_nascimento: '',
    num_cc: '',
    nif: '',
    morada: '',
    codigo_postal: '',
    telefone: '',
    instituicao_1: '',
    instituicao_2: '',
    instituicao_3: '',
    curso: '',
    ano_letivo: '2026/2027' // Padrão sugerido, mas editável
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Função para avançar para o Passo 2 (Valida apenas o Passo 1 localmente)
  const avancarPasso = (e) => {
    e.preventDefault();
    setError('');
    setPasso(2);
  };

  // Função final que envia tudo reunido para o teu Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Dispara o POST para a tua rota de candidaturas
      const response = await api.post('/candidatura', formData);

      if (response.data.ok) {
        // 🌟 DAQUI ENVIAMOS DIRETO PARA OS DOCUMENTOS CONFORME PEDISTE!
        navigate('/candidatura/documentos');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro ao guardar a candidatura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '25px', fontFamily: 'Arial, sans-serif', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      
      <h2 style={{ color: '#0056b3', margin: '0 0 5px 0' }}>Ficha de Candidatura</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Passo {passo} de 2: {passo === 1 ? 'Dados Pessoais' : 'Dados Académicos'}
      </p>

      {/* Indicador visual simples de passos */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <div style={{ flex: 1, height: '6px', backgroundColor: '#0056b3', borderRadius: '3px' }}></div>
        <div style={{ flex: 1, height: '6px', backgroundColor: passo === 2 ? '#0056b3' : '#eee', borderRadius: '3px', transition: '0.3s' }}></div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px', fontWeight: 'bold' }}>⚠️ {error}</div>}

      {/* 👤 PASSO 1: DADOS PESSOAIS */}
      {passo === 1 && (
        <form onSubmit={avancarPasso} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label style={{ fontWeight: 'bold' }}>Data de Nascimento:</label>
            <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Nº Cartão de Cidadão:</label>
              <input type="text" name="num_cc" maxLength="9" value={formData.num_cc} onChange={handleChange} required placeholder="9 dígitos" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontWeight: 'bold' }}>NIF:</label>
              <input type="text" name="nif" maxLength="9" value={formData.nif} onChange={handleChange} required placeholder="9 dígitos" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Contacto Telefónico:</label>
            <input type="tel" name="telefone" maxLength="9" value={formData.telefone} onChange={handleChange} required placeholder="Ex: 9xxxxxxxx" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Morada Completa:</label>
            <input type="text" name="morada" value={formData.morada} onChange={handleChange} required placeholder="Rua, Porta, Andar..." style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Código Postal:</label>
            <input type="text" name="codigo_postal" maxLength="7" value={formData.codigo_postal} onChange={handleChange} required placeholder="Ex: 9350100" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
            <button type="button" onClick={() => navigate('/painel')} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Voltar ao Painel
            </button>
            <button type="submit" style={{ padding: '10px 25px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Seguinte ➡️
            </button>
          </div>
        </form>
      )}

      {/* 🎓 PASSO 2: DADOS ACADÉMICOS */}
      {passo === 2 && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label style={{ fontWeight: 'bold' }}>Ano Letivo:</label>
            <input type="text" name="ano_letivo" value={formData.ano_letivo} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Curso Universitário:</label>
            <input type="text" name="curso" value={formData.curso} onChange={handleChange} required placeholder="Ex: Direito, Medicina, Gestão" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Instituição de Ensino (Opção 1 - Principal):</label>
            <input type="text" name="instituicao_1" value={formData.instituicao_1} onChange={handleChange} required placeholder="Ex: Universidade de Lisboa" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Instituição de Ensino (Opção 2 - Alternativa):</label>
            <input type="text" name="instituicao_2" value={formData.instituicao_2} onChange={handleChange} placeholder="Opcional" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Instituição de Ensino (Opção 3 - Alternativa):</label>
            <input type="text" name="instituicao_3" value={formData.instituicao_3} onChange={handleChange} placeholder="Opcional" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
            <button type="button" onClick={() => setPasso(1)} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              ⬅️ Anterior
            </button>
            <button type="submit" disabled={loading} style={{ padding: '10px 30px', background: '#198754', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
              {loading ? 'A guardar...' : 'Gravar e Avançar ➡️'}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}