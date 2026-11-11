const fs = require('fs');
const path = require('path');

// A mesma sequência deve ser aplicada em todos os bancos do projeto.
const ARQUIVOS = ['adicionar-telefone.sql', 'adicionar-criado-em.sql'];

async function aplicarMigracoes(conexao) {
	for (const arquivo of ARQUIVOS) {
		const sql = fs.readFileSync(path.join(__dirname, arquivo), 'utf8');
		await conexao.query(sql);
	}
}

module.exports = aplicarMigracoes;
