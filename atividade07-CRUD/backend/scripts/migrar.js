const pool = require('../banco');
const aplicarMigracoes = require('./migracoes');

async function migrar() {
	const conexao = await pool.connect();
	try {
		await conexao.query('BEGIN');
		await aplicarMigracoes(conexao);
		await conexao.query('COMMIT');
		console.log('Migrações aplicadas: telefone e criado_em prontos.');
	} catch (erro) {
		await conexao.query('ROLLBACK');
		throw erro;
	} finally {
		conexao.release();
	}
}

migrar().catch((erro) => {
	console.error('Falha ao aplicar migrações:', erro.message);
	process.exitCode = 1;
}).finally(() => pool.end());
