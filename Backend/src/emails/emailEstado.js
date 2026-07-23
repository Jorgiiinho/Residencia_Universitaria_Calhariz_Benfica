const React = require('react');
const { Html, Head, Body, Container, Section, Heading, Text, Button, Hr, Preview } = require('@react-email/components');

function EmailEstado({ nome, novoEstado, observacoes, linkPainel }) {
  const metaEstados = {
    pendente_correcao: { title: "Correção Solicitada", color: "#d97706", bannerBg: "#fffbeb", text: "A sua candidatura necessita de retificação de dados ou reenvio de documentos." },
    em_analise: { title: "Em Análise", color: "#0284c7", bannerBg: "#f0f9ff", text: "A sua candidatura está sob avaliação técnica dos Serviços de Ação Social." },
    aprovada: { title: "Candidatura Aprovada 🎉", color: "#059669", bannerBg: "#ecfdf5", text: "Parabéns! A sua candidatura para acesso à Residência Universitária foi aprovada." },
    rejeitada: { title: "Candidatura Indeferida", color: "#dc2626", bannerBg: "#fef2f2", text: "A sua candidatura não foi selecionada." },
  };

  const info = metaEstados[novoEstado] || {
    title: "Atualização de Estado",
    color: "#065f46",
    bannerBg: "#f8fafc",
    text: `O estado do seu processo foi alterado para: ${novoEstado}`
  };

  return React.createElement(Html, null,
    React.createElement(Head),
    React.createElement(Preview, null, `Atualização da Candidatura — ${info.title}`),
    React.createElement(Body, { style: mainStyle },
      React.createElement(Container, { style: containerStyle },
        React.createElement(Section, { style: headerStyle },
          React.createElement(Heading, { style: headerTitleStyle }, "Residência Universitária Calhariz-Benfica"),
          React.createElement(Text, { style: headerSubStyle }, "Município da Ribeira Brava")
        ),
        React.createElement(Section, { style: contentStyle },
          React.createElement(Text, { style: textStyle }, "Olá ", React.createElement("strong", null, nome || 'Candidato'), ","),
          React.createElement(Text, { style: textStyle }, "Informamos que houve uma atualização no estado da sua candidatura à Residência Universitária."),
          React.createElement(Section, { style: { ...bannerStyle, backgroundColor: info.bannerBg, borderLeftColor: info.color } },
            React.createElement(Heading, { as: "h3", style: { ...bannerTitleStyle, color: info.color } }, info.title),
            React.createElement(Text, { style: bannerTextStyle }, info.text)
          ),
          observacoes ? React.createElement(Section, { style: obsStyle },
            React.createElement(Text, { style: obsTitleStyle }, "Notas do Avaliador:"),
            React.createElement(Text, { style: obsTextStyle }, `"${observacoes}"`)
          ) : null,
          React.createElement(Section, { style: buttonContainerStyle },
            React.createElement(Button, { href: linkPainel, style: buttonStyle }, "Aceder ao Painel de Candidato")
          )
        ),
        React.createElement(Hr, { style: hrStyle }),
        React.createElement(Section, { style: footerStyle },
          React.createElement(Text, { style: footerTextStyle }, "Serviços de Ação Social — Câmara Municipal da Ribeira Brava")
        )
      )
    )
  );
}

const mainStyle = { backgroundColor: '#f8fafc', fontFamily: 'Arial, sans-serif', padding: '30px 10px' };
const containerStyle = { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', maxWidth: '600px', margin: '0 auto' };
const headerStyle = { backgroundColor: '#065f46', padding: '24px', textAlign: 'center' };
const headerTitleStyle = { color: '#ffffff', margin: 0, fontSize: '20px', fontWeight: 'bold' };
const headerSubStyle = { color: '#a7f3d0', margin: '4px 0 0 0', fontSize: '13px' };
const contentStyle = { padding: '30px' };
const textStyle = { color: '#1e293b', fontSize: '14px', lineHeight: '1.6' };
const bannerStyle = { borderLeftWidth: '4px', borderLeftStyle: 'solid', padding: '16px', borderRadius: '6px', margin: '20px 0' };
const bannerTitleStyle = { margin: '0 0 6px 0', fontSize: '16px' };
const bannerTextStyle = { margin: 0, fontSize: '13px', color: '#334155' };
const obsStyle = { backgroundColor: '#f1f5f9', padding: '14px', borderRadius: '6px', marginBottom: '20px' };
const obsTitleStyle = { fontWeight: 'bold', fontSize: '12px', color: '#334155', margin: '0 0 4px 0' };
const obsTextStyle = { fontStyle: 'italic', fontSize: '13px', color: '#475569', margin: 0 };
const buttonContainerStyle = { textAlign: 'center', margin: '30px 0' };
const buttonStyle = { backgroundColor: '#059669', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' };
const hrStyle = { borderColor: '#e2e8f0', margin: 0 };
const footerStyle = { backgroundColor: '#f1f5f9', padding: '15px', textAlign: 'center' };
const footerTextStyle = { color: '#94a3b8', fontSize: '11px', margin: 0 };

module.exports = { EmailEstado };