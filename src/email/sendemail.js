// Email Service
// Handles sending emails for password recovery and purchase notifications

const nodemailer = require('nodemailer');
const { log } = require('../utilities/logger');

// Create and return a nodemailer transporter using environment variables
function createTransporter() {
  const host = process.env.EMAIL_HOST || 'smtp.example.com';
  const port = process.env.EMAIL_PORT || 587;
  const user = process.env.EMAIL_USER || 'user@example.com';
  const pass = process.env.EMAIL_PASS || 'password';
  
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for port 465, false otherwise
    auth: { user, pass }
  });
}

// Send a password reset email
async function sendPasswordResetEmail(email, resetToken, username) {
  try {
    const transporter = createTransporter();
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"E-Commerce Support" <${process.env.EMAIL_USER || 'support@example.com'}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 5px;">
          <h2 style="text-align: center;">Password Reset Request</h2>
          <p>Hello ${username},</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p style="margin-top: 30px; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} E-Commerce Store. All rights reserved.
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    log.info('Password reset email sent', { messageId: info.messageId, to: email });
    return true;
  } catch (error) {
    log.error('Error sending password reset email', { error: error.message, to: email });
    return false;
  }
}

// Send a purchase confirmation email
async function sendPurchaseConfirmationEmail(email, ticket) {
  try {
    const transporter = createTransporter();
    
    let productsHtml = '';
    ticket.products.forEach(product => {
      const itemTotal = product.price * product.quantity;
      productsHtml += `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e6e6e6;">${product.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e6e6e6; text-align: center;">${product.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e6e6e6; text-align: right;">$${product.price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e6e6e6; text-align: right;">$${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    });
    
    const mailOptions = {
      from: `"E-Commerce Store" <${process.env.EMAIL_USER || 'orders@example.com'}>`,
      to: email,
      subject: `Order Confirmation #${ticket.code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 5px;">
          <h2 style="text-align: center;">Order Confirmation</h2>
          <p>Thank you for your purchase!</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${ticket.code}</p>
            <p><strong>Date:</strong> ${new Date(ticket.purchase_datetime).toLocaleString()}</p>
            <p><strong>Total Amount:</strong> $${ticket.amount.toFixed(2)}</p>
          </div>
          <h3>Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 12px; text-align: left;">Product</th>
                <th style="padding: 12px; text-align: center;">Quantity</th>
                <th style="padding: 12px; text-align: right;">Price</th>
                <th style="padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${productsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 12px; text-align: right; font-weight: bold;">$${ticket.amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <p>If you have any questions about your order, please contact our customer service.</p>
          <p style="margin-top: 30px; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} E-Commerce Store. All rights reserved.
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    log.info('Purchase confirmation email sent', { messageId: info.messageId, to: email, orderId: ticket.code });
    return true;
  } catch (error) {
    log.error('Error sending purchase confirmation email', { error: error.message, to: email });
    return false;
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendPurchaseConfirmationEmail
};
