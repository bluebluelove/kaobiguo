const nodemailer = require('nodemailer');
const config = require('../config/config');

let transporter = null;

function getTransporter() {
  if (!config.mail.user || !config.mail.pass) {
    throw new Error('邮件未配置，请在 .env 中设置 MAIL_USER 和 MAIL_PASS（QQ 邮箱授权码）');
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.secure,
      auth: {
        user: config.mail.user,
        pass: config.mail.pass,
      },
    });
  }
  return transporter;
}

/**
 * 发送验证码邮件（QQ 邮箱）
 * @param {string} to - 收件人邮箱
 * @param {string} code - 6 位验证码
 * @param {string} type - 'register' | 'login'
 */
async function sendVerificationCode(to, code, type) {
  const subject = type === 'register' ? '【考必过】注册验证码' : '【考必过】登录验证码';
  const text = `您的验证码是：${code}，${config.verificationCodeExpireMinutes} 分钟内有效。如非本人操作请忽略。`;
  const html = `
    <p>您的验证码是：<strong style="font-size:20px;letter-spacing:2px;">${code}</strong></p>
    <p>${config.verificationCodeExpireMinutes} 分钟内有效，如非本人操作请忽略。</p>
  `;
  const transport = getTransporter();
  await transport.sendMail({
    from: config.mail.from || config.mail.user,
    to: String(to).trim(),
    subject,
    text,
    html,
  });
}

module.exports = { sendVerificationCode };
