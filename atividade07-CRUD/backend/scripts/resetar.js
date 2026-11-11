const fs = require('fs');
const path = require('path');
const pool = require('../banco');
const aplicarMigracoes = require('./migracoes');

async function resetar() {
	// O .env pode apontar para o Supabase: exige uma opção explícita antes de apagar.
	if (!process.argv.includes('--confirmar')) {
		throw new Error('Este comando apaga os pacientes. Para executar, use npm run db:reset -- --confirmar');
	}

	const conexao = await pool.connect();
	try {
		await conexao.query('BEGIN');
		await conexao.query('DROP TABLE IF EXISTS pacientes');
		const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
		await conexao.query(sql);
		await aplicarMigracoes(conexao);
		await conexao.query('COMMIT');
		console.log('Tabela pacientes recriada com os três pacientes iniciais e as novas colunas.');
	} catch (erro) {
		await conexao.query('ROLLBACK');
		throw erro;
	} finally {
		conexao.release();
	}
}

resetar().catch((erro) => {
	console.error('Falha ao resetar a tabela:', erro.message);
	process.exitCode = 1;
}).finally(() => pool.end());
