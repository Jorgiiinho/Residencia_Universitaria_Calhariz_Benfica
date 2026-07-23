const { Resend } = require('resend');
const { render } = require('@react-email/render');
const React = require('react');

// Importações dos ficheiros .js na pasta src/emails/
const { EmailVerificacao } = require('../src/emails/emailVerificacao');
const { EmailRecuperacao } = require('../src/emails/emailRecuperacao');
const { EmailEstado } = require('../src/emails/emailEstado');

const resend = new Resend(process.env.RESEND_API_KEY);

const SENDER = `"${process.env.EMAIL_FROM_NAME || 'Residência Universitária'}" <${process.env.EMAIL_FROM_ADDRESS || 'notificacoes@candidaturarcb.cm-ribeirabrava.pt'}>`;

async function enviarEmail({ to, subject, html }) {
  try {
    const response = await resend.emails.send({
      from: SENDER,
      to: [to],
      subject: subject,
      html: html,
    });

    if (response.error) {
      console.error(`❌ [Resend Error]`, response.error);
      throw new Error(response.error.message);
    }

    console.log(`✉️ [Resend API] E-mail enviado com sucesso para ${to} | ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error(`❌ [Resend Exception] Falha ao enviar para ${to}:`, error.message);
    throw error;
  }
}

async function enviarEmailVerificacao(email, nome, token) {
  const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verificar-email?token=${token}`;
  const html = await render(React.createElement(EmailVerificacao, { nome, link }));

  return enviarEmail({
    to: email,
    subject: "Ativação de Conta — Residência Universitária",
    html: html,
  });
}

async function enviarEmailRecuperacao(email, nome, link) {
  const html = await render(React.createElement(EmailRecuperacao, { nome, link }));

  return enviarEmail({
    to: email,
    subject: "Recuperação de Palavra-passe — Residência Universitária",
    html: html,
  });
}

async function enviarEmailMudancaEstado(email, nome, novoEstado, observacoes = "") {
  const linkPainel = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/painel`;
  const html = await render(React.createElement(EmailEstado, { nome, novoEstado, observacoes, linkPainel }));

  return enviarEmail({
    to: email,
    subject: `Atualização de Candidatura — Residência Universitária`,
    html: html,
  });
}

module.exports = {
  enviarEmailVerificacao,
  enviarEmailRecuperacao,
  enviarEmailMudancaEstado,
};