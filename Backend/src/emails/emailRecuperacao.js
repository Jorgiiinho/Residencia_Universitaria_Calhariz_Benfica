const React = require('react');
const { Html, Head, Body, Container, Section, Heading, Text, Button, Hr, Preview } = require('@react-email/components');

function EmailRecuperacao({ nome, link }) {
  return React.createElement(Html, null,
    React.createElement(Head),
    React.createElement(Preview, null, "Pedido de redefinição de palavra-passe"),
    React.createElement(Body, { style: mainStyle },
      React.createElement(Container, { style: containerStyle },
        React.createElement(Section, { style: headerStyle },
          React.createElement(Heading, { style: headerTitleStyle }, "Residência Universitária Calhariz-Benfica"),
          React.createElement(Text, { style: headerSubStyle }, "Município da Ribeira Brava")
        ),
        React.createElement(Section, { style: contentStyle },
          React.createElement(Heading, { as: "h2", style: titleStyle }, "Recuperação de Palavra-passe"),
          React.createElement(Text, { style: textStyle }, "Olá ", React.createElement("strong", null, nome || 'Candidato'), ","),
          React.createElement(Text, { style: textStyle }, "Recebemos um pedido para redefinir a palavra-passe de acesso ao portal de candidaturas."),
          React.createElement(Text, { style: textStyle }, "Clique no botão abaixo para criar uma nova palavra-passe de forma segura:"),
          React.createElement(Section, { style: buttonContainerStyle },
            React.createElement(Button, { href: link, style: buttonStyle }, "Redefinir Palavra-passe")
          ),
          React.createElement(Text, { style: subtextStyle }, "Se não solicitou esta alteração, pode ignorar esta mensagem em segurança.")
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
const titleStyle = { color: '#065f46', fontSize: '18px', marginTop: 0 };
const textStyle = { color: '#1e293b', fontSize: '14px', lineHeight: '1.6' };
const buttonContainerStyle = { textAlign: 'center', margin: '30px 0' };
const buttonStyle = { backgroundColor: '#059669', color: '#ffffff', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' };
const subtextStyle = { color: '#64748b', fontSize: '12px' };
const hrStyle = { borderColor: '#e2e8f0', margin: 0 };
const footerStyle = { backgroundColor: '#f1f5f9', padding: '15px', textAlign: 'center' };
const footerTextStyle = { color: '#94a3b8', fontSize: '11px', margin: 0 };

module.exports = { EmailRecuperacao };