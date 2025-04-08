const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function generateRandomToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateActivationToken() {
  return generateRandomToken();
}

function generateForgotPasswordToken() {
  return generateRandomToken();
}

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
    throw new Error('Failed to send activation email');
  }
}

async function sendPasswordResetEmail(email, firstName, resetLink) {
  const msg = {
    to: email,
    from: 'kocesabchev3@gmail.com',
    subject: 'Reset Your Password',
    html: `
      <p>Hi ${firstName},</p>
      <p>You requested to reset your password. Please click the link below to reset it:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

async function sendOrderConfirmationEmail(email, firstName, orderDetails) {
  const { orderId, customerName, customerCountry, deliveryAddress, paymentMethod, items } = orderDetails;

  const itemsHtml = items
    .map(item => `<li>${item.name} - ${item.quantity} x ${item.price} BGN</li>`)
    .join('');

  const msg = {
    to: email,
    from: 'kocesabchev3@gmail.com',
    subject: 'Your Order Confirmation',
    html: `
      <p>Hi ${firstName},</p>
      <p>Thank you for your order! Here are your order details:</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Country:</strong> ${customerCountry}</p>
      <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p><strong>Products:</strong></p>
      <ul>${itemsHtml}</ul>
      <p>We will process your order soon. Thank you for shopping with us!</p>
    `,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw new Error('Failed to send order confirmation email');
  }
}

const emailOptions = {
  protocol: "http",
  address: 'localhost',
  port: '3000', 
};

module.exports = { 
  generateActivationToken, 
  generateForgotPasswordToken,
  sendActivationEmail, 
  sendPasswordResetEmail,
  sendOrderConfirmationEmail, 
  emailOptions
};
