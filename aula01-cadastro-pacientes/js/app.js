// Implemente as funcionalidades abaixo no projeto para praticar a manipulação do DOM, manipulação de arrays e eventos no JavaScript.

// Parte 1: Exercícios Principais (NR 8)
// [x] Campo Telefone: Adicionar o campo telefone ao formulário e exibi-lo na tabela.
// [x] Cálculo de Idade: Adicionar a coluna "Idade" na tabela, calculando automaticamente a partir da data de nascimento.
// [x] Contador de Pacientes: Exibir acima da tabela o texto "Total de pacientes: X", atualizado automaticamente.
// [x] Validação de E-mail: Impedir o cadastro de e-mails duplicados (exibir alert() se já existir no array).

// Parte 2: Extensões e Tarefas Extras (NR 9)
// [x] Remoção: Adicionar botão "Remover" em cada linha da tabela.
// [x] Busca em Tempo Real: Criar campo de busca para filtrar a tabela por nome (evento input).
// [x] Ordenação: Permitir ordenar a tabela por nome ao clicar no cabeçalho da coluna.
// [x] Persistência Local: Salvar e carregar os dados no localStorage do navegador.

// Array que guarda os pacientes cadastrados (em memória, só nesta sessão)
const pacientes = localStorage.getItem('pacientes') ? JSON.parse(localStorage.getItem('pacientes')) : [];

// Referências aos elementos do DOM que vamos usar várias vezes
const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const buscarInput = document.getElementById('busca');
const thOrdenar = document.getElementById('ordenar');
let ordemCrescente = true;

function calcularIdade(dataNascimento) {
   dataNascimento = new Date(dataNascimento);
   const hoje = new Date();
   let idade = hoje.getFullYear() - dataNascimento.getFullYear();
   const mes = hoje.getMonth() - dataNascimento.getMonth();


   if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
	   idade--;
   }

   return Math.max(0, idade);
}

function atualizarContador() {
	const contador = document.getElementById('total-pacientes');
	contador.textContent = pacientes.length;
}

function removerPaciente(email) {
    const index = pacientes.findIndex(paciente => paciente.email === email);
    
    if (index !== -1) {
  
        pacientes.splice(index, 1);
        
        renderizarTabela();
        atualizarContador();

        // 3. Verifica se a lista estava salva no localStorage
        if (localStorage.getItem('pacientes')) {
            if (pacientes.length === 0) {
                // Se o array ficou vazio, removemos a chave inteira do localStorage
                localStorage.removeItem('pacientes');
            } else {
                // Se ainda restam pacientes, salvamos o array atualizado por cima do antigo
                localStorage.setItem('pacientes', JSON.stringify(pacientes));
            }
        }
    }
}


// Função responsável por adicionar um paciente ao array
function adicionarPaciente(nome, email, nascimento, telefone, checkLocal) {
    const novoPaciente = { nome, email, nascimento, telefone, idade: calcularIdade(nascimento) };

    pacientes.push(novoPaciente);

    ordenarArrayPorTexto(pacientes, 'nome', ordemCrescente);
    if (checkLocal) {
		localStorage.setItem('pacientes', JSON.stringify(pacientes));
	}
    atualizarContador();
    renderizarTabela();
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
	  <td><button class="btn btn-danger btn-sm" onclick="removerPaciente('${paciente.email}')"><i class="ri-delete-bin-line"></i></button></td>
    `;

		tabela.appendChild(linha);
	});
}

// Função utilitária só para formatar a data no padrão dd/mm/aaaa
function formatarData(dataISO) {
	const [ano, mes, dia] = dataISO.split('-');
	return `${dia}/${mes}/${ano}`;
}


buscarInput.addEventListener('input', () => {
	const termoBusca = buscarInput.value.toLowerCase();

	console.log('Termo de busca:', termoBusca); 

	pacientes.some(paciente => paciente.nome.toLowerCase().includes(termoBusca)) ? renderizarTabela() : tabela.innerHTML = '<tr><td  class="text-center align-middle" colspan="6">Nenhum paciente encontrado</td></tr>';

});



// Evento disparado quando o formulário é enviado
formulario.addEventListener('submit', (event) => {
	event.preventDefault(); // evita o recarregamento da página

	const nome = document.getElementById('nome').value;
	const email = document.getElementById('email').value;
	const nascimento = document.getElementById('nascimento').value;
	const telefone = document.getElementById('telefone').value;
	const checkLocal = document.getElementById('checkSalvar').checked;

	console.log(checkLocal ? 'Salvar localmente' : 'Não salvar localmente');

	 if (pacientes.some(paciente => paciente.email === email)) {
		alert('Este e-mail já está cadastrado!');
		return; // Sai da função sem adicionar o paciente
	}
	adicionarPaciente(nome, email, nascimento, telefone, checkLocal);
	renderizarTabela();

	formulario.reset(); // limpa os campos do formulário
});

thOrdenar.addEventListener('click', () => {
    const icone = thOrdenar.querySelector('i');

    ordenarArrayPorTexto(pacientes, 'nome', ordemCrescente);

    if (ordemCrescente) {
        icone.className = "ri-arrow-up-s-fill"; // Ícone para cima (A-Z)
    } else {
        icone.className = "ri-arrow-down-s-fill"; // Ícone para baixo (Z-A)
    }

    ordemCrescente = !ordemCrescente; 

    renderizarTabela();
});


function ordenarArrayPorTexto(array, chave, crescente = true) {
    return array.sort((a, b) => {
        // Garantimos que o valor seja uma string para o localeCompare não quebrar
        const valorA = String(a[chave] || ""); 
        const valorB = String(b[chave] || "");

        if (crescente) {
            return valorA.localeCompare(valorB);
        } else {
            return valorB.localeCompare(valorA);
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o array tem 1 ou mais itens
    if (pacientes.length > 0) {
        renderizarTabela();
    }
});
