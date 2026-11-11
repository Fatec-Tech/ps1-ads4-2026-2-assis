const express = require('express');
const cors = require('cors');
const pool = require('./banco');

const app = express();
const COLUNAS = 'id, nome, email, nascimento, telefone, criado_em';

// Libera o acesso para que o frontend, rodando em outra origem, possa consumir esta API
app.use(cors());
// Permite ler o corpo das requisições enviadas em JSON
app.use(express.json());

function idValido(id) {
	return Number.isInteger(id) && id > 0;
}

function telefoneValido(telefone) {
	return telefone == null || (typeof telefone === 'string' && telefone.trim().length <= 20);
}

app.get('/pacientes', async (req, res) => {
	const { nome } = req.query;

	try {
		// Sem ?nome= na URL, consulta todos os pacientes no banco.
		// ILIKE mantém a busca parcial sem diferenciar maiúsculas de minúsculas.
		const resultado = nome
			? await pool.query(
					`SELECT ${COLUNAS} FROM pacientes WHERE nome ILIKE $1 ORDER BY id`,
					[`%${nome}%`]
				)
			: await pool.query(`SELECT ${COLUNAS} FROM pacientes ORDER BY id`);

		res.status(200).json(resultado.rows);
	} catch (erro) {
		console.error('Falha ao listar pacientes:', erro.message);
		res.status(500).json({ erro: 'Erro interno do servidor' });
	}
});

// Declarada antes de /pacientes/:id para que "total" não seja tratado como ID
app.get('/pacientes/total', async (req, res) => {
	try {
		const resultado = await pool.query('SELECT COUNT(*) AS total FROM pacientes');
		// COUNT retorna bigint no PostgreSQL, que o pg entrega como texto.
		res.status(200).json({ total: Number(resultado.rows[0].total) });
	} catch (erro) {
		console.error('Falha ao contar pacientes:', erro.message);
		res.status(500).json({ erro: 'Erro interno do servidor' });
	}
});

app.get('/pacientes/:id', async (req, res) => {
	const id = Number(req.params.id);

	if (!idValido(id)) {
		return res.status(400).json({ erro: 'ID inválido' });
	}

	try {
		// O ID é enviado separado do SQL, como parâmetro da consulta.
		const resultado = await pool.query(
			`SELECT ${COLUNAS} FROM pacientes WHERE id = $1`,
			[id]
		);

		if (resultado.rowCount === 0) {
			return res.status(404).json({ erro: 'Paciente não encontrado' });
		}

		res.status(200).json(resultado.rows[0]);
	} catch (erro) {
		console.error('Falha ao buscar paciente:', erro.message);
		res.status(500).json({ erro: 'Erro interno do servidor' });
	}
});

app.post('/pacientes', async (req, res) => {
	// Sem corpo na requisição, o Express deixa req.body indefinido
	const { nome, email, nascimento, telefone } = req.body || {};

	if (!nome || !email || !nascimento) {
		res.status(400).json({ erro: 'Os campos nome, email e nascimento são obrigatórios' });
		return;
	}

	if (!telefoneValido(telefone)) {
		return res.status(400).json({ erro: 'O telefone deve ser um texto com até 20 caracteres' });
	}

	try {
		// O banco gera o ID e devolve o paciente salvo com RETURNING.
		const resultado = await pool.query(
			`INSERT INTO pacientes (nome, email, nascimento, telefone)
			 VALUES ($1, $2, $3, $4)
			 RETURNING ${COLUNAS}`,
			[nome, email, nascimento, telefone?.trim() || null]
		);

		res.status(201).json(resultado.rows[0]);
	} catch (erro) {
		console.error('Falha ao cadastrar paciente:', erro.message);

		// 23505 é o código do PostgreSQL para violação da restrição UNIQUE.
		if (erro.code === '23505') {
			return res.status(409).json({ erro: 'Já existe um paciente cadastrado com este e-mail' });
		}

		res.status(500).json({ erro: 'Erro interno do servidor' });
	}
});

app.put('/pacientes/:id', async (req, res) => {
	const id = Number(req.params.id);

	if (!idValido(id)) {
		return res.status(400).json({ erro: 'ID inválido' });
	}

	const { nome, email, nascimento, telefone } = req.body || {};

	// Valida antes de alterar, para que uma atualização inválida mantenha os dados anteriores
	if (!nome || !email || !nascimento) {
		res.status(400).json({ erro: 'Os campos nome, email e nascimento são obrigatórios' });
		return;
	}

	if (!telefoneValido(telefone)) {
		return res.status(400).json({ erro: 'O telefone deve ser um texto com até 20 caracteres' });
	}

	try {
		// Os valores e o ID são enviados como parâmetros, separados do SQL.
		const resultado = await pool.query(
			`UPDATE pacientes
			 SET nome = $1, email = $2, nascimento = $3, telefone = $4
			 WHERE id = $5
			 RETURNING ${COLUNAS}`,
			[nome, email, nascimento, telefone?.trim() || null, id]
		);

		if (resultado.rowCount === 0) {
			return res.status(404).json({ erro: 'Paciente não encontrado' });
		}

		res.status(200).json(resultado.rows[0]);
	} catch (erro) {
		console.error('Falha ao atualizar paciente:', erro.message);

		if (erro.code === '23505') {
			return res.status(409).json({ erro: 'Já existe um paciente cadastrado com este e-mail' });
		}

		res.status(500).json({ erro: 'Erro interno do servidor' });
	}
});

app.delete('/pacientes/:id', async (req, res) => {
	const id = Number(req.params.id);

	if (!idValido(id)) {
		return res.status(400).json({ erro: 'ID inválido' });
	}

	try {
		// Exclui somente o paciente cujo ID corresponde ao parâmetro $1.
		const resultado = await pool.query('DELETE FROM pacientes WHERE id = $1', [id]);

		if (resultado.rowCount === 0) {
			return res.status(404).json({ erro: 'Paciente não encontrado' });
		}

		// 204 indica sucesso sem corpo de resposta.
		res.status(204).end();
	} catch (erro) {
		console.error('Falha ao excluir paciente:', erro.message);
		res.status(500).json({ erro: 'Erro interno do servidor' });
	}
});

// Qualquer outra rota/método não tratado cai aqui
app.use((req, res) => {
	res.status(404).json({ erro: 'Rota não encontrada' });
});

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
	console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
