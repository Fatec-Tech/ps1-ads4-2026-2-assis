// Abertura animada: logo → login automático → conexão com o servidor.
// O plano gratuito do Render adormece a API, e a primeira requisição leva cerca de 1 minuto.
const DURACAO_ABERTURA = 60000;

const ETAPAS_ABERTURA = [
	{ texto: 'Abrindo a sua clínica', duracao: 11300 },
	{ texto: 'Confirmando o seu acesso', duracao: 6300 },
	{ texto: 'Reunindo os cadastros dos pacientes', duracao: 6300 },
	{ texto: 'Organizando os contatos', duracao: 5300 },
	{ texto: 'Calculando os indicadores do dia', duracao: 5300 },
	{ texto: 'Deixando tudo pronto', duracao: 4300 },
];

const DICAS_ABERTURA = [
	'Use a busca por nome para encontrar um paciente em segundos.',
	'Os indicadores do topo separam pacientes adultos de crianças e adolescentes.',
	'Nome, e-mail e data de nascimento são tudo o que você precisa para um novo cadastro.',
	'A lista se atualiza sozinha sempre que você salva ou exclui um paciente.',
	'Clique em Editar em qualquer linha da lista para corrigir os dados de um paciente.',
	'O botão Novo cadastro fica sempre à mão no menu lateral.',
];

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function iniciarAbertura(carregamento) {
	const abertura = document.getElementById('abertura');
	if (document.documentElement.classList.contains('abertura-vista')) {
		abertura.remove();
		return carregamento;
	}

	const cartao = abertura.querySelector('.abertura-cartao');
	const cursor = abertura.querySelector('.abertura-cursor');
	const status = document.getElementById('abertura-status');
	const fundo = [...document.body.children].filter((elemento) => elemento !== abertura && elemento.tagName !== 'SCRIPT');
	const inicio = performance.now();
	let servidorPronto = false;
	let etapasConcluidas = 0;

	const pronto = carregamento
		.catch((erro) => ({ ok: false, erro }))
		.then((resultado) => { servidorPronto = true; return resultado; });
	// Depois que a API responde, as etapas restantes passam rapidamente.
	const aguardarEtapa = (ms) => Promise.race([esperar(ms), pronto.then(() => esperar(350))]);

	fundo.forEach((elemento) => { elemento.inert = true; });
	// Centraliza a logo enquanto o cartão ainda não apareceu
	abertura.style.setProperty('--deslocamento-logo', `${(cartao.offsetHeight + 28) / 2}px`);

	function moverCursor(alvo) {
		const area = cartao.getBoundingClientRect();
		const posicao = alvo.getBoundingClientRect();
		cursor.style.transform = `translate(${posicao.left - area.left + posicao.width * 0.7}px, ${posicao.top - area.top + posicao.height * 0.55}px)`;
	}

	async function digitar(campo, texto, intervalo) {
		const valor = campo.firstElementChild;
		campo.classList.add('digitando');
		for (const letra of texto) {
			valor.textContent += letra;
			await esperar(intervalo + Math.random() * 70);
		}
		campo.classList.remove('digitando');
	}

	async function animarLogin() {
		const email = document.getElementById('abertura-email');
		const senha = document.getElementById('abertura-senha');
		const botao = document.getElementById('abertura-entrar');
		abertura.dataset.fase = 'login';
		await esperar(900);
		cursor.classList.add('visivel');
		moverCursor(email);
		await esperar(900);
		cursor.classList.add('clicando');
		email.classList.add('focado');
		await esperar(250);
		cursor.classList.remove('clicando');
		await digitar(email, 'rafael.mendes@bemquerer.com', 85);
		await esperar(400);
		email.classList.remove('focado');
		moverCursor(senha);
		await esperar(800);
		cursor.classList.add('clicando');
		senha.classList.add('focado');
		await esperar(250);
		cursor.classList.remove('clicando');
		await digitar(senha, '••••••••••', 140);
		await esperar(400);
		senha.classList.remove('focado');
		moverCursor(botao);
		await esperar(850);
		cursor.classList.add('clicando');
		botao.classList.add('pressionado');
		await esperar(200);
		cursor.classList.remove('clicando');
		botao.classList.remove('pressionado');
		botao.classList.add('carregando');
		botao.querySelector('.abertura-botao-texto').textContent = 'Entrando…';
		await esperar(1600);
		cursor.classList.remove('visivel');
	}

	function atualizarProgresso() {
		const decorrido = performance.now() - inicio;
		const porTempo = Math.min(decorrido / DURACAO_ABERTURA, 0.96);
		const porEtapa = etapasConcluidas / ETAPAS_ABERTURA.length;
		const fracao = abertura.dataset.fase === 'final' ? 1 : Math.max(porTempo, porEtapa);
		const restante = Math.ceil((DURACAO_ABERTURA - decorrido) / 1000);
		document.getElementById('abertura-barra').style.transform = `scaleX(${fracao})`;
		document.getElementById('abertura-porcentagem').textContent = `${Math.round(fracao * 100)}%`;
		document.getElementById('abertura-restante').textContent = servidorPronto ? 'Dados carregados'
			: restante > 5 ? `Faltam cerca de ${restante} segundos` : 'Quase lá…';
	}

	async function animarConexao() {
		const lista = document.getElementById('abertura-etapas');
		const pontos = document.getElementById('abertura-pontos');
		const contador = document.getElementById('abertura-contador');
		const itens = ETAPAS_ABERTURA.map(({ texto }) => {
			const item = document.createElement('li');
			item.textContent = texto;
			lista.appendChild(item);
			pontos.appendChild(document.createElement('span'));
			return item;
		});
		const dica = document.getElementById('abertura-dica');
		let indiceDica = 0;
		dica.textContent = DICAS_ABERTURA[0];
		const trocarDica = setInterval(() => {
			indiceDica = (indiceDica + 1) % DICAS_ABERTURA.length;
			dica.classList.add('trocando');
			setTimeout(() => { dica.textContent = DICAS_ABERTURA[indiceDica]; dica.classList.remove('trocando'); }, 300);
		}, 7000);
		const progresso = setInterval(atualizarProgresso, 250);

		abertura.dataset.fase = 'conexao';
		atualizarProgresso();
		for (const [indice, etapa] of ETAPAS_ABERTURA.entries()) {
			itens[indice].classList.add('ativa');
			pontos.children[indice].classList.add('ativo');
			contador.textContent = `ETAPA ${indice + 1} DE ${ETAPAS_ABERTURA.length}`;
			status.textContent = `${etapa.texto}.`;
			const ultima = indice === ETAPAS_ABERTURA.length - 1;
			await aguardarEtapa(etapa.duracao);
			// Se o minuto acabar e a API ainda não respondeu, a última etapa espera por ela
			if (ultima) await pronto;
			itens[indice].classList.replace('ativa', 'concluida');
			pontos.children[indice].classList.replace('ativo', 'feito');
			etapasConcluidas = indice + 1;
			atualizarProgresso();
			// Mostra o check por um instante e então a etapa sobe para dar lugar à próxima
			await esperar(servidorPronto ? 300 : 700);
			if (!ultima) itens[indice].classList.add('saiu');
		}
		clearInterval(trocarDica);
		clearInterval(progresso);
	}

	async function executar() {
		await esperar(4200);
		await animarLogin();
		await animarConexao();
		const resultado = await pronto;

		if (resultado.ok) {
			abertura.dataset.fase = 'final';
			atualizarProgresso();
			status.textContent = 'Tudo pronto. Bem-vindo, Dr. Rafael.';
			await esperar(1600);
		}
		abertura.classList.add('saindo');
		await esperar(650);
		abertura.remove();
		fundo.forEach((elemento) => { elemento.inert = false; });
		if (resultado.ok) {
			try { sessionStorage.setItem('abertura-vista', '1'); } catch (erro) { /* a abertura só volta a aparecer */ }
		}
		return resultado;
	}

	return executar();
}
