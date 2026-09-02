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
const telInput = document.getElementById('telefone');
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
      <td class="fw-semibold text-body"><i class="ri-user-smile-fill text-primary me-2" aria-hidden="true"></i>${paciente.nome}</td>
      <td>${paciente.email}</td>
      <td class="text-nowrap">${formatarData(paciente.nascimento)}</td>
      <td class="text-nowrap">${formatarTelefone(paciente.telefone)}</td>
	  <td class="text-center">${paciente.idade}</td>
	  <td class="text-center"><button class="btn btn-outline-danger btn-sm" type="button" title="Remover paciente" aria-label="Remover paciente ${paciente.nome}" onclick="removerPaciente('${paciente.email}')"><i class="ri-delete-bin-line" aria-hidden="true"></i></button></td>
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

	

	pacientes.some(paciente => paciente.nome.toLowerCase().includes(termoBusca)) ? renderizarTabela() : tabela.innerHTML = '<tr><td class="py-4 text-center text-body-secondary" colspan="6"><i class="ri-search-line me-1" aria-hidden="true"></i>Nenhum paciente encontrado</td></tr>';

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

    if (!nome || !email || !nascimento || !telefone) {

		exibirModalErro('Erro de Validação', 'Por favor, preencha todos os campos!');
		return;
	}

	 if (pacientes.some(paciente => paciente.email === email)) {
		exibirModalErro('Erro de Validação', 'Este e-mail já está cadastrado!');
		return; // Sai da função sem adicionar o paciente
	}
	adicionarPaciente(nome, email, nascimento, removerMascara(telefone), checkLocal);
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

telInput.addEventListener('input', (event) => {
    event.target.value = formatarTelefone(event.target.value);
});

function formatarTelefone(valor) {
    if (!valor) return ""; 
    
    let v = String(valor).replace(/\D/g, ""); 
    v = v.substring(0, 11); 
    
    let formatado = v;
    
    if (v.length > 2) {
        if (v[2] === '9') {
            formatado = `(${v.substring(0, 2)}) ${v.substring(2, 7)}`;
            if (v.length >= 8) formatado += `-${v.substring(7, 11)}`;
        } else {
            formatado = `(${v.substring(0, 2)}) ${v.substring(2, 6)}`;
            if (v.length >= 7) formatado += `-${v.substring(6, 10)}`;
        }
    } else if (v.length === 2) {
        formatado = `(${v}`;
    }
    
    return formatado; 
}

function removerMascara(valor) {
    // Retorna apenas os números da string
    return valor.replace(/\D/g, "");
}

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o array tem 1 ou mais itens
    if (pacientes.length > 0) {
        renderizarTabela();
    }
});


function exibirModalErro(titulo, mensagem) {

  document.getElementById('modalDeErroTitulo').textContent = titulo;
  document.getElementById('modalDeErroMensagem').textContent = mensagem;


  const elementoModal = document.getElementById('modalDeErro');


  const instanciaModal = bootstrap.Modal.getOrCreateInstance(elementoModal);

  instanciaModal.show();
}
