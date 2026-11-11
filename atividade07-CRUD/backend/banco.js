const { Pool, types } = require('pg');

// Mantém o tipo DATE como texto 'AAAA-MM-DD', sem conversão de fuso horário.
types.setTypeParser(1082, (valor) => valor);

// Reaproveita conexões com o PostgreSQL usando as variáveis de ambiente.
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
