const URL_API = 'http://localhost:3000/pacientes';

const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const mensagem = document.getElementById('mensagem');
const mensagemCarregando = document.getElementById('carregando');

const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoNascimento = document.getElementById('nascimento');

function formatarData(dataISO) {
	const [ano, mes, dia] = dataISO.split('-');
	return `${dia}/${mes}/${ano}`;
}

function mostrarMensagem(texto, tipo = 'danger') {
	mensagem.innerHTML = '';
	const alerta = document.createElement('div');
	alerta.className = `alert alert-${tipo}`;
	alerta.textContent = texto; // textContent evita injeção de HTML
	mensagem.appendChild(alerta);
}

function criarCelula(texto) {
	const celula = document.createElement('td');
	celula.textContent = texto;
	return celula;
}

function renderizarTabela(pacientes) {
	// Limpa antes de desenhar, para não duplicar registros a cada nova consulta
	tabela.innerHTML = '';

	pacientes.forEach((paciente) => {
		const linha = document.createElement('tr');
		// Guarda o ID devolvido pela API, usado depois na edição e na exclusão
		linha.dataset.id = paciente.id;

		linha.appendChild(criarCelula(paciente.nome));
		linha.appendChild(criarCelula(paciente.email));
		linha.appendChild(criarCelula(formatarData(paciente.nascimento)));

		tabela.appendChild(linha);
	});
}

// GET /pacientes — a tabela sempre reflete o que está no servidor
async function listarPacientes() {
	try {
		const resposta = await fetch(URL_API);

		if (!resposta.ok) {
			throw new Error(`Erro HTTP: ${resposta.status}`);
		}

		const pacientes = await resposta.json();
		renderizarTabela(pacientes);
	} catch (erro) {
		console.error('Não foi possível carregar os pacientes:', erro);

		// Mostra o erro dentro da própria tabela, ocupando as 3 colunas
		tabela.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-danger py-4">
          Não foi possível carregar os pacientes. Verifique se o servidor está rodando e tente novamente.
        </td>
      </tr>
    `;
	} finally {
		// Executa tanto no sucesso quanto no erro
		mensagemCarregando.style.display = 'none';
	}
}

async function carregarTotalPacientes() {
	try {
		const resposta = await fetch(URL_API + '/total');

		if (!resposta.ok) {
			throw new Error(`Erro HTTP: ${resposta.status}`);
		}

		const dados = await resposta.json();

		document.querySelector('#total').textContent = dados.total;
	} catch (erro) {
		console.error('Não foi possível carregar o total de pacientes:', erro);
	}
}

// POST /pacientes
async function cadastrarPaciente(dados) {
	const resposta = await fetch(URL_API, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(dados), // objeto JS → texto JSON
	});

	if (!resposta.ok) {
		// Se a resposta de erro não vier em JSON, usa a mensagem genérica abaixo
		const erro = await resposta.json().catch(() => ({}));
		throw new Error(erro.erro || `Erro HTTP: ${resposta.status}`);
	}

	return resposta.json();
}

formulario.addEventListener('submit', async (event) => {
	event.preventDefault();

	const dados = {
		nome: campoNome.value,
		email: campoEmail.value,
		nascimento: campoNascimento.value,
	};

	try {
		await cadastrarPaciente(dados);
		mostrarMensagem('Paciente cadastrado com sucesso.', 'success');
		formulario.reset();
		await listarPacientes();
		await carregarTotalPacientes();
	} catch (erro) {
		console.error('Não foi possível cadastrar o paciente:', erro);

		// O formulário não é limpo, para o usuário não perder o que digitou.
		// TypeError indica falha de rede (servidor fora do ar), sem mensagem útil da API
		const texto = erro instanceof TypeError ? 'Não foi possível cadastrar o paciente. O servidor está no ar?' : erro.message;
		mostrarMensagem(texto);
	}
});

// Assim que o script carrega, já dispara a busca dos dados iniciais
listarPacientes();
carregarTotalPacientes();
