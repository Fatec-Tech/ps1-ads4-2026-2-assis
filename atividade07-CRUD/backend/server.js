const express = require('express');
const cors = require('cors');

const app = express();

// Libera o acesso para que o frontend, rodando em outra origem, possa consumir esta API
app.use(cors());
// Permite ler o corpo das requisições enviadas em JSON
app.use(express.json());

// Por enquanto, os dados ainda vivem em memória, dentro do próprio servidor
const pacientes = [
	{
		id: 1,
		nome: 'Maria Silva',
		email: 'maria.silva@email.com',
		nascimento: '1990-04-12',
	},
	{
		id: 2,
		nome: 'João Pereira',
		email: 'joao.pereira@email.com',
		nascimento: '1985-11-30',
	},
	{
		id: 3,
		nome: 'Ana Costa',
		email: 'ana.costa@email.com',
		nascimento: '2001-07-08',
	},
	{
		id: 4,
		nome: 'Carlos Souza',
		email: 'carlos.souza@email.com',
		nascimento: '1978-02-21',
	},
];

// Contador separado do tamanho do array, para não reaproveitar IDs após exclusões
let proximoId = pacientes.length + 1;

app.get('/pacientes', (req, res) => {
	res.status(200).json(pacientes);
});

// Declarada antes de /pacientes/:id para que "total" não seja tratado como ID
app.get('/pacientes/total', (req, res) => {
	res.status(200).json({ total: pacientes.length });
});

app.get('/pacientes/:id', (req, res) => {
	// O parâmetro chega como texto na URL, mas os IDs do array são números
	const id = Number(req.params.id);
	const paciente = pacientes.find((p) => p.id === id);

	if (!paciente) {
		res.status(404).json({ erro: 'Paciente não encontrado' });
		return;
	}

	res.status(200).json(paciente);
});

app.post('/pacientes', (req, res) => {
	// Sem corpo na requisição, o Express deixa req.body indefinido
	const { nome, email, nascimento } = req.body || {};

	if (!nome || !email || !nascimento) {
		res.status(400).json({ erro: 'Os campos nome, email e nascimento são obrigatórios' });
		return;
	}

	const paciente = { id: proximoId++, nome, email, nascimento };
	pacientes.push(paciente);

	res.status(201).json(paciente);
});

// Qualquer outra rota/método não tratado cai aqui
app.use((req, res) => {
	res.status(404).json({ erro: 'Rota não encontrada' });
});

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
	console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
