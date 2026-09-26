module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'descubre-rd-admin-secret-2026-very-secure-key'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'descubre-rd-token-salt-2026-very-secure-salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'descubre-rd-transfer-salt-2026-very-secure-salt'),
    },
  },
  flags: {
    nps: false,
    promoteEE: false,
  },
});
