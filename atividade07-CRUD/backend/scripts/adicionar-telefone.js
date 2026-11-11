const fs = require('fs');
const path = require('path');
const pool = require('../banco');

async function adicionarTelefone() {
	try {
		const sql = fs.readFileSync(path.join(__dirname, 'adicionar-telefone.sql'), 'utf8');
		await pool.query(sql);
		console.log('Coluna "telefone" pronta.');
	} finally {
		await pool.end();
	}
}

adicionarTelefone().catch((erro) => {
	console.error('Falha ao adicionar telefone:', erro.message);
	process.exitCode = 1;
});
