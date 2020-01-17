const mailer = require('nodemailer');
const uuid = require('uuid');
const ms = require('ms');

const PASSWORD_RESET_TOKEN_EXPIRES_IN = ms(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN || '1h') || 3600000;

function getResetTokenExpiresIn() {
  return PASSWORD_RESET_TOKEN_EXPIRES_IN;
}

async function sendMail(mail) {
  const smtpTransport = mailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    await smtpTransport.sendMail(mail);
  } finally {
    smtpTransport.close();
  }
}

function getResetToken() {
  return uuid.v4();
}

function getForgotPasswordMail(email, token, login) {
  const resetUrlWithToken = `${process.env.FRONTEND_URL}/password/reset?token=${token}&login=${login}`;
  return {
    to: email,
    // TODO: add site name? for example 'Reset your password on ${siteName}'
    subject: `Reset your ${process.env.APP_NAME} password`,
    html: getResetPasswordHtml(resetUrlWithToken),
  };
}

function getResetPasswordHtml(resetUrlWithToken) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
    </head>
    <body>
      <h1 style="color: black"></h1>
      <div style="font-size: 18px; margin-bottom: 15px; color: black">
        You are receiving this email because you (or someone else) have requested the reset of the password for your account.
        <br>
        Please click on the following link, or paste this into your browser to complete the process: ${resetUrlWithToken}
        <br>
        If you did not request this, please ignore this email and your password will remain unchanged.
      </div>
    </body>
  </html>
  `;
}

function getSuccessfulPasswordResetMail(to) {
  return {
    to,
    subject: `Your ${process.env.APP_NAME} password has been changed`,
    html: getSuccessfulPasswordResetHtml(to),
  };
}

function getSuccessfulPasswordResetHtml(email) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
    </head>
    <body>
      <h1 style="color: black"></h1>
      <div style="font-size: 18px; margin-bottom: 15px; color: black">
        Hello,
        <br>
        This is a confirmation that the password for your account ${email} has just been changed.
      </div>
    </body>
  </html>
  `;
}

module.exports = {
  sendMail,
  getResetToken,
  getResetTokenExpiresIn,
  getForgotPasswordMail,
  getSuccessfulPasswordResetMail,
};