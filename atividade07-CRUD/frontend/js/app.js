// Em produção (Render). Para testar localmente, troque por 'http://localhost:3000/pacientes'
const URL_API = 'https://api-clinica-walysonassis.onrender.com/pacientes';

const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const mensagem = document.getElementById('mensagem');
const mensagemCarregando = document.getElementById('carregando');

const campoId = document.getElementById('id');
const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoNascimento = document.getElementById('nascimento');
const botaoSalvar = document.getElementById('btn-salvar');
const botaoCancelar = document.getElementById('btn-cancelar');

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

		const celulaAcoes = document.createElement('td');

		const botaoEditar = document.createElement('button');
		botaoEditar.type = 'button';
		botaoEditar.textContent = 'Editar';
		botaoEditar.className = 'btn btn-sm btn-outline-primary me-2';
		botaoEditar.addEventListener('click', () => iniciarEdicao(paciente));

		const botaoExcluir = document.createElement('button');
		botaoExcluir.type = 'button';
		botaoExcluir.textContent = 'Excluir';
		botaoExcluir.className = 'btn btn-sm btn-outline-danger';
		botaoExcluir.addEventListener('click', () => excluirPaciente(paciente.id));

		celulaAcoes.appendChild(botaoEditar);
		celulaAcoes.appendChild(botaoExcluir);
		linha.appendChild(celulaAcoes);

		tabela.appendChild(linha);
	});
}

function iniciarEdicao(paciente) {
	campoId.value = paciente.id;
	campoNome.value = paciente.nome;
	campoEmail.value = paciente.email;
	campoNascimento.value = paciente.nascimento;

	botaoSalvar.textContent = 'Atualizar';
	botaoCancelar.classList.remove('d-none');
	campoNome.focus();
}

// Volta o formulário ao modo de cadastro
function limparFormulario() {
	formulario.reset();
	campoId.value = '';
	botaoSalvar.textContent = 'Salvar';
	botaoCancelar.classList.add('d-none');
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

		// Mostra o erro dentro da própria tabela, ocupando as 4 colunas
		tabela.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger py-4">
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

// POST /pacientes (cadastro) ou PUT /pacientes/:id (edição), conforme exista ou não um ID
async function salvarPaciente(dados, id) {
	const metodo = id ? 'PUT' : 'POST';
	const url = id ? `${URL_API}/${id}` : URL_API;

	const resposta = await fetch(url, {
		method: metodo,
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

// DELETE /pacientes/:id
async function excluirPaciente(id) {
	// Se o usuário cancelar a confirmação, nenhuma requisição é enviada
	if (!confirm('Deseja realmente excluir este paciente?')) {
		return;
	}

	try {
		const resposta = await fetch(`${URL_API}/${id}`, { method: 'DELETE' });

		// A resposta de sucesso é 204, sem corpo: por isso não chamamos resposta.json()
		if (!resposta.ok) {
			throw new Error(`Erro HTTP: ${resposta.status}`);
		}

		// Se o paciente excluído estava em edição, o formulário volta ao modo de cadastro
		if (campoId.value === String(id)) {
			limparFormulario();
		}

		mostrarMensagem('Paciente excluído com sucesso.', 'success');
		await listarPacientes();
		await carregarTotalPacientes();
	} catch (erro) {
		console.error('Não foi possível excluir o paciente:', erro);
		mostrarMensagem('Não foi possível excluir o paciente.');
	}
}

formulario.addEventListener('submit', async (event) => {
	event.preventDefault();

	const dados = {
		nome: campoNome.value,
		email: campoEmail.value,
		nascimento: campoNascimento.value,
	};

	const id = campoId.value;

	try {
		await salvarPaciente(dados, id);
		mostrarMensagem(id ? 'Paciente atualizado com sucesso.' : 'Paciente cadastrado com sucesso.', 'success');
		limparFormulario();
		await listarPacientes();
		await carregarTotalPacientes();
	} catch (erro) {
		console.error('Não foi possível salvar o paciente:', erro);

		// O formulário não é limpo, para o usuário não perder o que digitou.
		// TypeError indica falha de rede (servidor fora do ar), sem mensagem útil da API
		const texto = erro instanceof TypeError ? 'Não foi possível salvar o paciente. O servidor está no ar?' : erro.message;
		mostrarMensagem(texto);
	}
});

// Cancelar apenas limpa o formulário, sem enviar nada à API
botaoCancelar.addEventListener('click', limparFormulario);

// Assim que o script carrega, já dispara a busca dos dados iniciais
listarPacientes();
carregarTotalPacientes();
