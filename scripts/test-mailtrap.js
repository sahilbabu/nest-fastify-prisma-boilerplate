#!/usr/bin/env node

/**
 * Mailtrap Connection Test
 * This script tests the Mailtrap SMTP connection directly
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

async function testMailtrapConnection() {
  console.log('🧪 Testing Mailtrap SMTP Connection...\n');

  // Check environment variables
  const requiredEnvVars = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASS'];
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    console.log('\n📝 Make sure your .env file contains:');
    console.log('MAIL_HOST=sandbox.smtp.mailtrap.io');
    console.log('MAIL_PORT=2525');
    console.log('MAIL_USER=your-mailtrap-username');
    console.log('MAIL_PASS=your-mailtrap-password');
    process.exit(1);
  }

  console.log('📋 Configuration:');
  console.log(`   Host: ${process.env.MAIL_HOST}`);
  console.log(`   Port: ${process.env.MAIL_PORT}`);
  console.log(`   User: ${process.env.MAIL_USER}`);
  console.log(`   Pass: ${'*'.repeat(process.env.MAIL_PASS.length)}`);
  console.log('');

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10),
    secure: false, // Mailtrap doesn't use SSL
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    debug: true, // Enable debug output
  });

  try {
    // Test connection
    console.log('🔌 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || 'Test App'}" <${process.env.MAIL_FROM_EMAIL || 'test@example.com'}>`,
      to: 'recipient@example.com',
      subject: 'Mailtrap Connection Test ✅',
      html: `
        <h1>Mailtrap Connection Test</h1>
        <p>If you're seeing this email in your Mailtrap inbox, the connection is working perfectly!</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
        <hr>
        <p><em>This is an automated test email from your NestJS application.</em></p>
      `,
      text: `
        Mailtrap Connection Test

        If you're seeing this email in your Mailtrap inbox, the connection is working perfectly!

        Timestamp: ${new Date().toISOString()}
        Environment: ${process.env.NODE_ENV || 'development'}

        This is an automated test email from your NestJS application.
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log('\n🎉 Mailtrap integration is working correctly!');
    console.log('📧 Check your Mailtrap inbox at: https://mailtrap.io/inboxes');

  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error(error.message);

    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   1. Your Mailtrap username and password are correct');
      console.log('   2. You\'re using the credentials from the correct inbox');
      console.log('   3. Your Mailtrap account is active');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Host not found. Please check:');
      console.log('   1. MAIL_HOST is set to: sandbox.smtp.mailtrap.io');
      console.log('   2. Your internet connection is working');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused. Please check:');
      console.log('   1. MAIL_PORT is set to: 2525 (or 587)');
      console.log('   2. No firewall is blocking the connection');
    }

    process.exit(1);
  }
}

// Run the test
testMailtrapConnection().catch(console.error);
