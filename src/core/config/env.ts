import 'dotenv/config';

export const environmentVariables = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL,

  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,

  DATABASE_URL: process.env.DATABASE_URL,

  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  JWT_ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  JWT_PASSWORD_RESET_TOKEN_EXPIRES_IN: process.env.JWT_PASSWORD_RESET_TOKEN_EXPIRES_IN,

  OPTIMIZE_API_KEY: process.env.OPTIMIZE_API_KEY,

  // Mail Configuration
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,
  MAIL_FROM_EMAIL: process.env.MAIL_FROM_EMAIL,
  MAIL_SECURE: process.env.MAIL_SECURE,
};
