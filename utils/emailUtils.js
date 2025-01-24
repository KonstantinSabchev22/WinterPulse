const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Generate an activation token.
 */
function generateActivationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Send activation email.
 */
async function sendActivationEmail(email, firstName, activationLink) {
  const msg = {
    to: email,
    from: 'kocesabchev3@gmail.com',
    subject: 'Activate Your Account',
    html: `
      <p>Hi ${firstName},</p>
      <p>Thank you for registering! Please click the link below to activate your account:</p>
      <a href="${activationLink}">Activate Account</a>
      <p>If you did not sign up for this account, you can ignore this email.</p>
    `,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending activation email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw new Error('Failed to send activation email');
  }
}

module.exports = { generateActivationToken, sendActivationEmail };