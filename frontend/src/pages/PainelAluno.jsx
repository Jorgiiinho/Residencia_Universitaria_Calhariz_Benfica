import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function PainelAluno() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [candidatura, setCandidatura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCandidatura = async () => {
      try {
        setError(''); // Limpa erros antigos
        const response = await api.get(`/candidatura/minha`);

        // Verifica se o backend responde com a estrutura embrulhada ou direta
        if (response.data && response.data.ok && response.data.candidatura) {
          setCandidatura(response.data.candidatura);
        } else if (response.data && !response.data.ok) {
          setError('Erro ao obter candidatura. Tente novamente mais tarde.');
        } else {
          // Caso o teu backend envie a candidatura diretamente na raiz do JSON
          setCandidatura(response.data);
        }
      } catch (err) {
        // Significa apenas que o aluno é novo e não tem candidatura. Tratamos isso com carinho:
        if (err.response && err.response.status === 404) {
          console.log(" O aluno ainda não possui nenhuma candidatura criada.");
          setCandidatura(null); // Mantém null para mostrar o Cenário A (Botão verde)
        } else {
          console.error("Erro real na API:", err);
          setError('Erro ao ligar ao servidor. Tente novamente mais tarde.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidatura();
  }, []);

  const obterEstiloEstado = (estado) => {
    switch (estado) {
      case 'rascunho':
      case 'aguarda_documentos':
        return { cor: '#6c757d', texto: 'Incompleta', bg: '#f8f9fa', border: '#6c757d' };
      case 'aguarda_validacao':
        return { cor: '#fd7e14', texto: 'Aguardar Validação', bg: '#fff3cd', border: '#ffeba2' };
      case 'em_analise':
        return { cor: '#0d6efd', texto: 'Em Análise técnica', bg: '#cfe2ff', border: '#b6d4fe' };
      case 'pendente_correcao':
        return { cor: '#dc3545', texto: 'Correção Urgente Necessária', bg: '#f8d7da', border: '#f5c2c7' };
      case 'aprovado':
        return { cor: '#198754', texto: 'Candidatura Aprovada! 🎉', bg: '#d1e7dd', border: '#badbcc' };
      case 'rejeitado':
        return { cor: '#842029', texto: 'Não Admitido', bg: '#f8d7da', border: '#f5c2c7' };
      default:
        return { cor: '#333', texto: estado || 'Pendente', bg: '#fff', border: '#ddd' };
    }
  };

  // Criar a variável estiloStatus chamando a função protetora
  // Só fazemos isto se a candidatura existir, para não quebrar o código!
  const estiloStatus = candidatura ? obterEstiloEstado(candidatura.estado) : null;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
        <h2>A carregar o seu portal...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '25px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0056b3', paddingBottom: '15px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#0056b3', margin: 0, fontSize: '28px' }}>Portal do Candidato</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Bem-vindo, <strong>{user?.nome}</strong></p>
        </div>
        <button 
          onClick={() => { logout(); navigate('/login'); }}
          style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Sair da Conta
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px', fontWeight: 'bold' }}>⚠️ {error}</div>}

      {/* 🟢 CENÁRIO A: O ALUNO NÃO TEM CANDIDATURA NO BANCO DE DADOS */}
      {!candidatura ? (
        <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed #bbb', borderRadius: '8px', backgroundColor: '#fafafa' }}>
          <h2 style={{ color: '#333' }}>Ainda não iniciou a sua inscrição</h2>
          <p style={{ color: '#666', maxWidth: '500px', margin: '10px auto 30px auto', lineHeight: '1.5' }}>
            Para concorrer a uma vaga na Residência Universitária de Calhariz-Benfica pelo Município da Ribeira Brava, deve preencher a sua ficha de dados e anexar os documentos exigidos.
          </p>
          <button
            onClick={() => navigate('/candidatura/dados')}
            style={{ padding: '15px 30px', background: '#198754', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          >
            Iniciar Nova Candidatura
          </button>
        </div>
      ) : (
        /* 🔵 CENÁRIO B: O ALUNO JÁ TEM UMA INSCRIÇÃO ATIVA */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ padding: '25px', backgroundColor: estiloStatus?.bg, border: `1px solid ${estiloStatus?.border}`, borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Estado da sua Candidatura:</h3>
            <span style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '20px', backgroundColor: estiloStatus?.cor, color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
              {estiloStatus?.texto}
            </span>
            <p style={{ marginTop: '15px', color: '#444', fontSize: '15px', lineHeight: '1.4' }}>
              O seu processo deu entrada nos serviços municipais e está associado ao Ano Letivo <strong>{candidatura.ano_letivo || '2026/2027'}</strong> para o curso de <strong>{candidatura.curso}</strong>.
            </p>
          </div>

          {/* ALERTA INTERATIVO SE ESTIVER PENDENTE DE CORREÇÃO */}
          {candidatura.estado === 'pendente_correcao' && (
            <div style={{ padding: '20px', border: '1px solid #f5c2c7', backgroundColor: '#f8d7da', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#842029' }}>⚠️ Atenção: Documentos Rejeitados</h4>
                <p style={{ margin: 0, color: '#842029', fontSize: '14px' }}>A equipa de análise detetou inconformidades nos teus ficheiros. Substitua-os imediatamente.</p>
              </div>
              <button 
                onClick={() => navigate('/candidatura/corrigir')}
                style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Corrigir Documentos
              </button>
            </div>
          )}

          {/* RESUMO INFORMATIVO */}
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Opções Selecionadas:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#555', lineHeight: '1.6' }}>
              <li><strong>Gestão de Ensino Principal:</strong> {candidatura.instituicao_1}</li>
              {candidatura.instituicao_2 && <li><strong>Opção Alternativa 2:</strong> {candidatura.instituicao_2}</li>}
              {candidatura.instituicao_3 && <li><strong>Opção Alternativa 3:</strong> {candidatura.instituicao_3}</li>}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
}