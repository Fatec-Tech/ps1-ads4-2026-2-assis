// Em produção (Render). Para testar localmente, troque por 'http://localhost:3000/pacientes'
const URL_API = 'https://api-clinica-walysonassis.onrender.com/pacientes';

const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const mensagemCarregando = document.getElementById('carregando');

const campoId = document.getElementById('id');
const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoNascimento = document.getElementById('nascimento');
const botaoSalvar = document.getElementById('btn-salvar');
const botaoCancelar = document.getElementById('btn-cancelar');
const dialogCadastro = document.getElementById('dialog-cadastro');
const buscaPaciente = document.getElementById('busca-paciente');
const resultadoBusca = document.getElementById('resultado-busca');
const botaoRecarregar = document.getElementById('btn-recarregar');
let pacientesCarregados = [];
let nomeFiltrado = '';
const botaoBuscar = document.getElementById('btn-buscar');
const botaoLimparBusca = document.getElementById('btn-limpar-busca');

function definirBotaoComIcone(botao, texto, icone) {
	const simbolo = document.createElement('span');
	simbolo.className = `solar-icon solar-${icone}`;
	simbolo.setAttribute('aria-hidden', 'true');
	botao.replaceChildren(simbolo, document.createTextNode(` ${texto}`));
}

function definirCarregamento(ativo, atualizarIndicadores = true) {
	const painel = document.getElementById('pacientes');
	const resumo = document.getElementById('resumo');
	painel.setAttribute('aria-busy', String(ativo));
	painel.classList.toggle('is-loading', ativo);
	if (atualizarIndicadores) {
		resumo.setAttribute('aria-busy', String(ativo));
		resumo.classList.toggle('is-loading', ativo);
		resumo.classList.toggle('dados-prontos', !ativo);
	}
	mensagemCarregando.textContent = ativo ? 'Carregando pacientes.' : '';
	if (!ativo) return;

	const quantidade = Math.min(Math.max(pacientesCarregados.length, 4), 6);
	const fragmento = document.createDocumentFragment();
	for (let indice = 0; indice < quantidade; indice++) {
		const linha = document.createElement('tr');
		linha.className = 'linha-skeleton';
		linha.setAttribute('aria-hidden', 'true');
		linha.style.setProperty('--atraso', `${indice * 65}ms`);
		// Estrutura fixa: nenhum dado da API é inserido como HTML.
		linha.innerHTML = `
			<td><div class="skeleton-paciente"><span class="skeleton skeleton-avatar"></span><span class="skeleton skeleton-nome"></span></div></td>
			<td><span class="skeleton skeleton-email"></span></td>
			<td><span class="skeleton skeleton-data"></span></td>
			<td><div class="skeleton-acoes"><span class="skeleton skeleton-botao"></span><span class="skeleton skeleton-botao"></span></div></td>`;
		fragmento.appendChild(linha);
	}
	tabela.replaceChildren(fragmento);
	if (atualizarIndicadores) {
		['total', 'total-adultos', 'total-menores'].forEach((id) => {
			document.getElementById(id).textContent = '';
		});
	}
	resultadoBusca.textContent = '';
}

function atualizarResumo() {
	const hoje = new Date();
	let adultos = 0;
	let menores = 0;
	pacientesCarregados.forEach((paciente) => {
		const [ano, mes, dia] = paciente.nascimento.split('-').map(Number);
		let idade = hoje.getFullYear() - ano;
		if (hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)) idade--;
		if (idade >= 18) adultos++;
		else if (idade >= 0) menores++;
	});
	document.getElementById('total').textContent = pacientesCarregados.length;
	document.getElementById('total-adultos').textContent = adultos;
	document.getElementById('total-menores').textContent = menores;
}

function formatarData(dataISO) {
	const [ano, mes, dia] = dataISO.split('-');
	return `${dia}/${mes}/${ano}`;
}

const dialogStatus = document.getElementById('dialog-status');
const statusConfirmar = document.getElementById('status-confirmar');
const statusCancelar = document.getElementById('status-cancelar');
let resolverStatus;
let statusOcupado = false;
let statusConfirmado = false;

function mostrarStatus({ tipo = 'info', titulo, texto, confirmar = 'Entendi', cancelar = false }) {
	if (resolverStatus) resolverStatus(false);
	statusOcupado = tipo === 'processando';
	statusConfirmado = false;
	dialogStatus.dataset.tipo = tipo;
	dialogStatus.setAttribute('aria-busy', String(statusOcupado));
	const categorias = { sucesso: 'CONCLUÍDO', erro: 'NÃO FOI POSSÍVEL CONCLUIR', info: 'INFORMAÇÃO', confirmacao: 'CONFIRMAÇÃO', processando: 'EM ANDAMENTO' };
	const icones = { sucesso: 'check', erro: 'close', info: 'info', confirmacao: 'delete', processando: 'refresh' };
	document.getElementById('status-categoria').textContent = categorias[tipo];
	document.getElementById('status-icone').className = `solar-icon solar-${icones[tipo]}`;
	document.getElementById('status-titulo').textContent = titulo;
	document.getElementById('status-descricao').textContent = texto;
	statusConfirmar.textContent = confirmar;
	statusConfirmar.disabled = statusOcupado;
	statusConfirmar.classList.toggle('btn-danger', tipo === 'confirmacao');
	statusConfirmar.classList.toggle('btn-primary', tipo !== 'confirmacao');
	statusCancelar.hidden = !cancelar;
	if (!dialogStatus.open) dialogStatus.showModal();
	if (!statusOcupado) (cancelar ? statusCancelar : statusConfirmar).focus();
	return new Promise((resolve) => { resolverStatus = resolve; });
}

statusConfirmar.addEventListener('click', () => {
	if (statusOcupado) return;
	statusConfirmado = true;
	dialogStatus.close();
});
statusCancelar.addEventListener('click', () => dialogStatus.close());
dialogStatus.addEventListener('cancel', (event) => {
	if (statusOcupado) event.preventDefault();
});
dialogStatus.addEventListener('close', () => {
	if (resolverStatus) resolverStatus(statusConfirmado);
	resolverStatus = undefined;
});

async function criarErroResposta(resposta) {
	const dados = await resposta.json().catch(() => ({}));
	const mensagens = {
		400: 'Revise os campos obrigatórios e tente novamente.',
		404: 'Este paciente não foi encontrado. Atualize a lista e tente novamente.',
		409: 'Este e-mail já está cadastrado. Informe outro e-mail.'
	};
	return new Error(mensagens[resposta.status] || dados.erro || 'O servidor não conseguiu concluir a operação. Tente novamente.');
}

function textoErro(erro) {
	return erro instanceof TypeError ? 'Não foi possível conectar à clínica. Verifique sua conexão e tente novamente.' : erro.message;
}

function criarCelula(texto) {
	const celula = document.createElement('td');
	celula.textContent = texto;
	return celula;
}

function renderizarTabela(pacientes) {
	// Limpa antes de desenhar, para não duplicar registros a cada nova consulta
	tabela.innerHTML = '';
	if (pacientes.length === 0) {
		const linha = document.createElement('tr');
		const celula = criarCelula(nomeFiltrado
			? 'Nenhum paciente encontrado para esta busca.'
			: 'Nenhum paciente cadastrado. Clique em Novo paciente para começar.');
		celula.colSpan = 4;
		celula.className = 'text-center py-5';
		linha.appendChild(celula);
		tabela.appendChild(linha);
	}

	pacientes.forEach((paciente, indice) => {
		const linha = document.createElement('tr');
		linha.className = 'linha-paciente';
		linha.style.setProperty('--atraso', `${Math.min(indice, 8) * 30}ms`);
		// Guarda o ID devolvido pela API, usado depois na edição e na exclusão
		linha.dataset.id = paciente.id;

		linha.appendChild(criarCelula(paciente.nome));
		linha.appendChild(criarCelula(paciente.email));
		linha.appendChild(criarCelula(formatarData(paciente.nascimento)));

		const celulaAcoes = document.createElement('td');

		const botaoEditar = document.createElement('button');
		botaoEditar.type = 'button';
		definirBotaoComIcone(botaoEditar, 'Editar', 'edit');
		botaoEditar.className = 'btn btn-sm btn-outline-primary me-2';
		botaoEditar.addEventListener('click', () => iniciarEdicao(paciente));

		const botaoExcluir = document.createElement('button');
		botaoExcluir.type = 'button';
		definirBotaoComIcone(botaoExcluir, 'Excluir', 'delete');
		botaoExcluir.className = 'btn btn-sm btn-outline-danger';
		botaoExcluir.addEventListener('click', () => excluirPaciente(paciente));

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

	definirBotaoComIcone(botaoSalvar, 'Atualizar', 'save');
	document.getElementById('titulo-cadastro').textContent = 'Editar paciente';
	dialogCadastro.showModal();
	campoNome.focus();
}

// Volta o formulário ao modo de cadastro
function limparFormulario() {
	formulario.reset();
	campoId.value = '';
	definirBotaoComIcone(botaoSalvar, 'Salvar paciente', 'save');
	document.getElementById('titulo-cadastro').textContent = 'Novo paciente';
}

// GET /pacientes — a tabela sempre reflete o que está no servidor
async function listarPacientes(acao = '') {
	let resultado;
	const atualizarIndicadores = !['busca', 'limpar'].includes(acao);
	botaoRecarregar.disabled = true;
	buscaPaciente.disabled = true;
	botaoBuscar.disabled = true;
	botaoLimparBusca.disabled = true;
	definirCarregamento(true, atualizarIndicadores);
	document.getElementById('filtro-legenda').textContent = nomeFiltrado ? `Nome: ${nomeFiltrado}` : 'Todos os pacientes';
	try {
		// O filtro é aplicado pela API; a lista completa mantém os indicadores globais.
		const urlBusca = new URL(URL_API);
		if (nomeFiltrado) urlBusca.searchParams.set('nome', nomeFiltrado);
		const urls = nomeFiltrado && atualizarIndicadores ? [urlBusca.href, URL_API] : [urlBusca.href];
		const listas = await Promise.all(urls.map(async (url) => {
			const resposta = await fetch(url);
			if (!resposta.ok) throw await criarErroResposta(resposta);
			return resposta.json();
		}));
		const pacientes = listas[0];
		if (atualizarIndicadores) {
			pacientesCarregados = nomeFiltrado ? listas[1] : pacientes;
			atualizarResumo();
		}
		renderizarTabela(pacientes);
		resultadoBusca.textContent = `${pacientes.length} de ${pacientesCarregados.length} pacientes`;
		resultado = { ok: true, quantidade: pacientes.length };
	} catch (erro) {
		resultadoBusca.textContent = 'Falha no carregamento. Use Atualizar lista para tentar novamente.';
		if (atualizarIndicadores) {
			['total', 'total-adultos', 'total-menores'].forEach((id) => {
				document.getElementById(id).textContent = '—';
			});
		}
		resultado = { ok: false, erro };
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
		definirCarregamento(false, atualizarIndicadores);
		botaoRecarregar.disabled = false;
		buscaPaciente.disabled = false;
		botaoBuscar.disabled = false;
		botaoLimparBusca.disabled = false;
	}
	if (!resultado.ok && acao !== 'silencioso') {
		mostrarStatus({ tipo: 'erro', titulo: 'Não foi possível carregar a lista', texto: textoErro(resultado.erro) });
	}
	return resultado;
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

	if (!resposta.ok) throw await criarErroResposta(resposta);

	return resposta.json();
}

async function notificarConclusao(titulo, texto) {
	buscaPaciente.value = '';
	nomeFiltrado = '';
	const lista = await listarPacientes('silencioso');
	mostrarStatus({ tipo: lista.ok ? 'sucesso' : 'info', titulo,
		texto: lista.ok ? texto : `${texto} A lista não pôde ser atualizada. Use Atualizar lista para consultar os dados recentes.` });
}

// DELETE /pacientes/:id — só envia a requisição após confirmação no modal.
async function excluirPaciente(paciente) {
	const confirmado = await mostrarStatus({ tipo: 'confirmacao', titulo: 'Excluir paciente?',
		texto: `Deseja excluir o cadastro de ${paciente.nome}? Esta ação não pode ser desfeita.`, confirmar: 'Sim, excluir', cancelar: true });
	if (!confirmado) {
		mostrarStatus({ tipo: 'info', titulo: 'Exclusão cancelada', texto: 'O cadastro do paciente foi mantido.' });
		return;
	}
	mostrarStatus({ tipo: 'processando', titulo: 'Excluindo paciente', texto: 'Aguarde enquanto o cadastro é removido.' });
	try {
		const resposta = await fetch(`${URL_API}/${paciente.id}`, { method: 'DELETE' });
		if (!resposta.ok) throw await criarErroResposta(resposta);
		await notificarConclusao('Paciente excluído', `O cadastro de ${paciente.nome} foi excluído com sucesso.`);
	} catch (erro) {
		mostrarStatus({ tipo: 'erro', titulo: 'Não foi possível excluir', texto: textoErro(erro) });
	}
}

formulario.addEventListener('submit', async (event) => {
	event.preventDefault();
	if (!formulario.checkValidity()) {
		const invalido = formulario.querySelector(':invalid');
		await mostrarStatus({ tipo: 'erro', titulo: 'Revise os dados do paciente', texto: invalido.validity.valueMissing
			? 'Preencha todos os campos obrigatórios antes de salvar.' : 'Informe um e-mail válido para continuar.' });
		invalido.focus();
		return;
	}

	const dados = {
		nome: campoNome.value,
		email: campoEmail.value,
		nascimento: campoNascimento.value,
	};

	const id = campoId.value;
	botaoSalvar.disabled = true;
	botaoCancelar.disabled = true;
	document.getElementById('btn-fechar-cadastro').disabled = true;

	mostrarStatus({ tipo: 'processando', titulo: id ? 'Atualizando paciente' : 'Cadastrando paciente', texto: 'Aguarde enquanto os dados são salvos.' });
	try {
		await salvarPaciente(dados, id);
		dialogCadastro.close();
		limparFormulario();
		await notificarConclusao(id ? 'Paciente atualizado' : 'Paciente cadastrado',
			`Os dados de ${dados.nome} foram ${id ? 'atualizados' : 'cadastrados'} com sucesso.`);
	} catch (erro) {
		console.error('Não foi possível salvar o paciente:', erro);

		mostrarStatus({ tipo: 'erro', titulo: id ? 'Não foi possível atualizar' : 'Não foi possível cadastrar', texto: textoErro(erro) });
	} finally {
		botaoSalvar.disabled = false;
		botaoCancelar.disabled = false;
		document.getElementById('btn-fechar-cadastro').disabled = false;
	}
});

// Cancelar apenas limpa o formulário, sem enviar nada à API
function fecharCadastro() {
	dialogCadastro.close();
	limparFormulario();
}

botaoCancelar.addEventListener('click', fecharCadastro);
document.getElementById('btn-fechar-cadastro').addEventListener('click', fecharCadastro);
dialogCadastro.addEventListener('cancel', (event) => {
	event.preventDefault();
	if (!botaoSalvar.disabled) fecharCadastro();
});
dialogCadastro.addEventListener('close', limparFormulario);
document.querySelectorAll('[data-novo-paciente]').forEach((botao) => {
	botao.addEventListener('click', () => {
		limparFormulario();
		dialogCadastro.showModal();
		campoNome.focus();
	});
});
document.getElementById('form-busca').addEventListener('submit', (event) => {
	event.preventDefault();
	nomeFiltrado = buscaPaciente.value.trim();
	listarPacientes('busca');
});
botaoLimparBusca.addEventListener('click', () => {
	buscaPaciente.value = '';
	nomeFiltrado = '';
	listarPacientes('limpar');
});
buscaPaciente.addEventListener('input', () => {
	if (!buscaPaciente.value.trim() && nomeFiltrado) {
		nomeFiltrado = '';
		listarPacientes('limpar');
	}
});
botaoRecarregar.addEventListener('click', () => listarPacientes('atualizar'));

// Assim que o script carrega, já dispara a busca dos dados iniciais.
// Na primeira visita da sessão, a abertura cobre o minuto em que o servidor do Render acorda.
iniciarAbertura(listarPacientes('silencioso')).then((resultado) => {
	if (!resultado.ok) mostrarStatus({ tipo: 'erro', titulo: 'Não foi possível carregar a lista', texto: textoErro(resultado.erro) });
});
