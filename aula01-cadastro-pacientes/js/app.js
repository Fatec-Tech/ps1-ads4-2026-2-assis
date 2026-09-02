// Implemente as funcionalidades abaixo no projeto para praticar a manipulação do DOM, manipulação de arrays e eventos no JavaScript.

// Parte 1: Exercícios Principais (NR 8)
// [x] Campo Telefone: Adicionar o campo telefone ao formulário e exibi-lo na tabela.
// [x] Cálculo de Idade: Adicionar a coluna "Idade" na tabela, calculando automaticamente a partir da data de nascimento.
// [x] Contador de Pacientes: Exibir acima da tabela o texto "Total de pacientes: X", atualizado automaticamente.
// [x] Validação de E-mail: Impedir o cadastro de e-mails duplicados (exibir alert() se já existir no array).

// Parte 2: Extensões e Tarefas Extras (NR 9)
// [ ] Remoção: Adicionar botão "Remover" em cada linha da tabela.
// [ ] Busca em Tempo Real: Criar campo de busca para filtrar a tabela por nome (evento input).
// [ ] Ordenação: Permitir ordenar a tabela por nome ao clicar no cabeçalho da coluna.
// [ ] Persistência Local: Salvar e carregar os dados no localStorage do navegador.

// Array que guarda os pacientes cadastrados (em memória, só nesta sessão)
const pacientes = [];

// Referências aos elementos do DOM que vamos usar várias vezes
const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');

function calcularIdade(dataNascimento) {
   dataNascimento = new Date(dataNascimento);
   const hoje = new Date();
   let idade = hoje.getFullYear() - dataNascimento.getFullYear();
   const mes = hoje.getMonth() - dataNascimento.getMonth();


   if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
	   idade--;
   }

   return idade;
}

function atualizarContador() {
	const contador = document.getElementById('contador-pacientes');
	contador.textContent = `Total de pacientes: ${pacientes.length}`;
}

// Função responsável por adicionar um paciente ao array
function adicionarPaciente(nome, email, nascimento, telefone) {
	const novoPaciente = { nome, email, nascimento, telefone, idade: calcularIdade(nascimento) };
	pacientes.push(novoPaciente);
	atualizarContador();
}

// Função responsável por desenhar a tabela inteira a partir do array
function renderizarTabela() {
	tabela.innerHTML = ''; // limpa a tabela antes de redesenhar

	pacientes.forEach((paciente) => {
		const linha = document.createElement('tr');

		linha.innerHTML = `
      <td>${paciente.nome}</td>
      <td>${paciente.email}</td>
      <td>${formatarData(paciente.nascimento)}</td>
      <td>${paciente.telefone}</td>
	  <td>${paciente.idade}</td>
    `;

		tabela.appendChild(linha);
	});
}

// Função utilitária só para formatar a data no padrão dd/mm/aaaa
function formatarData(dataISO) {
	const [ano, mes, dia] = dataISO.split('-');
	return `${dia}/${mes}/${ano}`;
}

// Evento disparado quando o formulário é enviado
formulario.addEventListener('submit', (event) => {
	event.preventDefault(); // evita o recarregamento da página

	const nome = document.getElementById('nome').value;
	const email = document.getElementById('email').value;
	const nascimento = document.getElementById('nascimento').value;
	const telefone = document.getElementById('telefone').value;

	 if (pacientes.some(paciente => paciente.email === email)) {
		alert('Este e-mail já está cadastrado!');
		return; // Sai da função sem adicionar o paciente
	}
	adicionarPaciente(nome, email, nascimento, telefone);
	renderizarTabela();

	formulario.reset(); // limpa os campos do formulário
});
