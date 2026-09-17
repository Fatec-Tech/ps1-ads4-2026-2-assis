const API_URL = 'https://pokeapi.co/api/v2/pokemon';
const pokemonCache = new Map();

const pokemonGrid = document.getElementById('pokemonGrid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const pokemonModalElement = document.getElementById('pokemonModal');
const pokemonModalTitle = document.getElementById('pokemonModalTitle');
const pokemonModalBody = document.getElementById('pokemonModalBody');

const statLabels = {
	hp: 'HP',
	attack: 'Ataque',
	defense: 'Defesa',
	speed: 'Velocidade',
};

const statBarColors = {
	hp: 'bg-success',
	attack: 'bg-danger',
	defense: 'bg-warning',
	speed: 'bg-info',
};

const statColors = {
	hp: '#198754',
	attack: '#dc3545',
	defense: '#ffc107',
	speed: '#0dcaf0',
};

// Função para buscar os detalhes individuais de um Pokémon
async function fetchPokemonData(urlOrName) {
	const url = urlOrName.startsWith('http')
		? urlOrName
		: `${API_URL}/${urlOrName.toLowerCase().trim()}`;

	if (pokemonCache.has(url)) {
		return pokemonCache.get(url);
	}

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error('Pokémon não encontrado');
  }
  console.log('Response:', response); // Log da resposta para depuração
	const pokemon = await response.json();
	pokemonCache.set(url, pokemon);
	return pokemon;
}

// Função para carregar a lista inicial (ex: primeiros 20)
async function loadInitialPokemon(limit = 20) {
	showLoading(true);
	pokemonGrid.innerHTML = '';

	try {
		const response = await fetch(`${API_URL}?limit=${limit}`);
		const data = await response.json();

		// Faz requisição paralela dos detalhes de cada um dos itens listados
		const pokemonPromises = data.results.map((item) =>
			fetchPokemonData(item.url)
		);
		const pokemonList = await Promise.all(pokemonPromises);

		// Renderiza cada card
		pokemonList.forEach(renderPokemonCard);
	} catch (error) {
		showError('Erro ao carregar a lista de Pokémon.');
		console.error(error);
	} finally {
		showLoading(false);
	}
}

// Função para criar a estrutura visual do Card no Bootstrap
function renderPokemonCard(pokemon) {
  console.log('Rendering Pokémon:', pokemon); // Log do Pokémon para depuração
	// Pega a imagem oficial de alta qualidade (dream_world ou official-artwork)
	const imageUrl =
		pokemon.sprites.other['official-artwork'].front_default ||
		pokemon.sprites.front_default;

	// Mapeia os tipos para Badges do Bootstrap
	const typesBadges = pokemon.types
		.map(
			(t) =>
				`<span class="badge bg-secondary badge-type">${t.type.name}</span>`
		)
		.join('');

	// Formata peso (em kg) e altura (em m)
	const heightInMeters = (pokemon.height / 10).toFixed(1);
	const weightInKg = (pokemon.weight / 10).toFixed(1);

	const cardHTML = `
        <div class="col">
          <div class="card h-100 shadow-sm pokemon-card border-0" data-pokemon-id="${pokemon.id}" role="button" tabindex="0" aria-label="Ver detalhes de ${pokemon.name}">
            <div class="text-center p-3 bg-white rounded-top">
              <img src="${imageUrl}" class="card-img-top img-fluid" style="max-height: 160px; object-fit: contain;" alt="${pokemon.name}">
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title text-capitalize fw-bold m-0">${pokemon.name}</h5>
                <small class="text-muted">#${String(pokemon.id).padStart(3, '0')}</small>
              </div>
              <div class="mb-3">
                ${typesBadges}
              </div>
              <div class="row text-center border-top pt-2">
                <div class="col-6 border-end">
                  <small class="text-muted d-block">Altura</small>
                  <strong>${heightInMeters} m</strong>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block">Peso</small>
                  <strong>${weightInKg} kg</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

	pokemonGrid.insertAdjacentHTML('beforeend', cardHTML);
}

function renderPokemonStats(stats) {
	return Object.entries(statLabels)
		.map(([statName, label]) => {
			const stat = stats.find((item) => item.stat.name === statName);
			const value = stat ? stat.base_stat : 0;
			const progressValue = Math.min(value, 100);

			return `
				<div class="mb-3">
					<div class="d-flex justify-content-between mb-1">
						<small class="fw-bold">${label}</small>
						<small class="text-secondary">${value}</small>
					</div>
					<div class="progress stat-progress" style="--stat-width: ${progressValue}%; --stat-color: ${statColors[statName]}; height: 18px;" aria-label="${label}: ${value}">
						<div
							class="progress-bar ${statBarColors[statName]}"
							role="progressbar"
							aria-valuenow="${value}"
							aria-valuemin="0"
							aria-valuemax="100"
						></div>
						<span class="stat-pokemon" aria-hidden="true"></span>
					</div>
				</div>
			`;
		})
		.join('');
}

function renderPokemonAbilities(abilities) {
	if (!abilities.length) {
		return '<p class="text-secondary mb-0">Nenhuma habilidade encontrada.</p>';
	}

	return `
		<ul class="list-group list-group-flush">
			${abilities
				.map(
					({ ability }) =>
						`<li class="list-group-item text-capitalize px-0">${ability.name}</li>`
				)
				.join('')}
		</ul>
	`;
}

function renderPokemonCries(cries) {
	const cryUrl = cries.latest || cries.legacy;

	if (!cryUrl) {
		return '<p class="text-secondary mb-0">Áudio não disponível.</p>';
	}

	return `<audio class="w-100" controls preload="none" src="${cryUrl}">
		Seu navegador não suporta a reprodução de áudio.
	</audio>`;
}

function renderPokemonSprites(sprites) {
	const spriteItems = [
		['Frente normal', sprites.front_default],
		['Costas normal', sprites.back_default],
		['Frente shiny', sprites.front_shiny],
		['Costas shiny', sprites.back_shiny],
	].filter(([, imageUrl]) => imageUrl);

	if (!spriteItems.length) {
		return '<p class="text-secondary mb-0">Sprites não disponíveis.</p>';
	}

	return `
		<div class="row row-cols-2 g-3 text-center">
			${spriteItems
				.map(
					([label, imageUrl]) => `
						<div class="col">
							<div class="border rounded p-2 h-100">
								<img src="${imageUrl}" class="img-fluid" alt="${label}" style="max-height: 110px;" />
								<small class="d-block text-capitalize text-secondary mt-1">${label}</small>
							</div>
						</div>
					`
				)
				.join('')}
		</div>
	`;
}

// Abre o modal e prepara o espaço para os detalhes do Pokémon selecionado.
async function openPokemonModal(id) {
	pokemonModalTitle.textContent = 'Carregando...';
	pokemonModalBody.innerHTML = `
		<div class="text-center py-4">
			<div class="spinner-border text-danger" role="status">
				<span class="visually-hidden">Carregando detalhes...</span>
			</div>
		</div>
	`;

	bootstrap.Modal.getOrCreateInstance(pokemonModalElement).show();

	try {
		const pokemon = await fetchPokemonData(id);
		pokemonModalTitle.textContent = pokemon.name;
		pokemonModalBody.innerHTML = `
			<section aria-labelledby="pokemonStatsTitle">
				<h6 id="pokemonStatsTitle" class="border-bottom pb-2 mb-3">Status base</h6>
				${renderPokemonStats(pokemon.stats)}
			</section>

			<section class="mt-4" aria-labelledby="pokemonAbilitiesTitle">
				<h6 id="pokemonAbilitiesTitle" class="border-bottom pb-2 mb-3">Habilidades</h6>
				${renderPokemonAbilities(pokemon.abilities)}
			</section>

			<section class="mt-4" aria-labelledby="pokemonCriesTitle">
				<h6 id="pokemonCriesTitle" class="border-bottom pb-2 mb-3">Som do Pokémon</h6>
				${renderPokemonCries(pokemon.cries)}
			</section>

			<section class="mt-4" aria-labelledby="pokemonSpritesTitle">
				<h6 id="pokemonSpritesTitle" class="border-bottom pb-2 mb-3">Galeria de sprites</h6>
				${renderPokemonSprites(pokemon.sprites)}
			</section>
		`;
	} catch (error) {
		pokemonModalTitle.textContent = 'Erro';
		pokemonModalBody.innerHTML = '<div class="alert alert-warning mb-0" role="alert">Não foi possível carregar os detalhes deste Pokémon.</div>';
		console.error(error);
	}
}

// Busca específica por nome ou ID
async function handleSearch() {
	const query = searchInput.value.trim();
	if (!query) {
		loadInitialPokemon();
		return;
	}

	showLoading(true);
	pokemonGrid.innerHTML = '';

	try {
		const pokemon = await fetchPokemonData(query);
		renderPokemonCard(pokemon);
	} catch (error) {
		showError(`Nenhum Pokémon encontrado com o termo "${query}".`);
	} finally {
		showLoading(false);
	}
}

// Utilitários de UI
function showLoading(state) {
	if (state) {
		loading.classList.remove('d-none');
	} else {
		loading.classList.add('d-none');
	}
}

function showError(message) {
	pokemonGrid.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning text-center" role="alert">
            ${message}
          </div>
        </div>
      `;
}

// Eventos
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
	if (e.key === 'Enter') handleSearch();
});

pokemonGrid.addEventListener('click', (event) => {
	const card = event.target.closest('[data-pokemon-id]');
	if (card) openPokemonModal(card.dataset.pokemonId);
});

pokemonGrid.addEventListener('keydown', (event) => {
	if (event.key !== 'Enter' && event.key !== ' ') return;

	const card = event.target.closest('[data-pokemon-id]');
	if (card) {
		event.preventDefault();
		openPokemonModal(card.dataset.pokemonId);
	}
});

// Inicialização
loadInitialPokemon();
