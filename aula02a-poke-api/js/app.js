const API_URL = 'https://pokeapi.co/api/v2/pokemon';
const pokemonCache = new Map();

const pokemonGrid = document.getElementById('pokemonGrid');
const pokemonSentinel = document.getElementById('pokemonSentinel');
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

const pokemonTypeThemes = {
	normal: ['#8b95a5', '#566170'],
	fighting: ['#c94b4b', '#7f2934'],
	flying: ['#7198d4', '#45649a'],
	poison: ['#a15ab5', '#683578'],
	ground: ['#b8955b', '#795d31'],
	rock: ['#9b8b70', '#625642'],
	bug: ['#86a846', '#536b29'],
	ghost: ['#7668ad', '#493d79'],
	steel: ['#71818c', '#48545d'],
	fire: ['#e47743', '#a94627'],
	water: ['#4e91d9', '#2d5e9e'],
	grass: ['#5da36b', '#367045'],
	electric: ['#d6a928', '#8e6d0d'],
	psychic: ['#d05a86', '#8f3457'],
	ice: ['#62b8c8', '#397d8c'],
	dragon: ['#6e69c7', '#403c8d'],
	dark: ['#68636f', '#3e3946'],
	fairy: ['#d889a8', '#96506d'],
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


const PAGE_SIZE = 20;
let currentOffset = 0;
let isLoadingPage = false;
let hasMorePokemon = true;
let isSearchMode = false;

async function loadPokemonPage(reset = false) {
	if (isLoadingPage || (!hasMorePokemon && !reset)) return;

	if (reset) {
		currentOffset = 0;
		hasMorePokemon = true;
		pokemonGrid.innerHTML = '';
	}

	isLoadingPage = true;
	renderSkeletonCards(PAGE_SIZE);

	try {
		const response = await fetch(`${API_URL}?limit=${PAGE_SIZE}&offset=${currentOffset}`);
		if (!response.ok) throw new Error('Não foi possível carregar a página de Pokémon');

		const data = await response.json();

		// Faz requisição paralela dos detalhes de cada um dos itens listados
		const pokemonPromises = data.results.map((item) =>
			fetchPokemonData(item.url)
		);
		const pokemonList = await Promise.all(pokemonPromises);

		const skeletons = [...pokemonGrid.querySelectorAll('.skeleton-item')];
		pokemonList.forEach((pokemon, index) => {
			renderPokemonCard(pokemon, skeletons[index]);
		});
		currentOffset += data.results.length;
		hasMorePokemon = Boolean(data.next);
	} catch (error) {
		showError('Erro ao carregar a lista de Pokémon.');
		console.error(error);
	} finally {
		isLoadingPage = false;
		removeSkeletonCards();
	}
}

function loadInitialPokemon() {
	loadPokemonPage(true);
}

function renderSkeletonCards(count) {
	const skeletonHTML = Array.from({ length: count }, () => `
		<div class="col skeleton-item" aria-hidden="true">
			<div class="card h-100 shadow-sm border-0 skeleton-card p-3">
				<div class="skeleton-image rounded mb-3"></div>
				<div class="skeleton-line w-75 mb-3"></div>
				<div class="skeleton-line w-50 mb-4"></div>
				<div class="row g-2">
					<div class="col-6"><div class="skeleton-line"></div></div>
					<div class="col-6"><div class="skeleton-line"></div></div>
				</div>
			</div>
		</div>
	`).join('');

	pokemonGrid.insertAdjacentHTML('beforeend', skeletonHTML);
}

function removeSkeletonCards() {
	pokemonGrid.querySelectorAll('.skeleton-item').forEach((skeleton) => skeleton.remove());
}

// Função para criar a estrutura visual do Card no Bootstrap
function renderPokemonCard(pokemon, skeleton = null) {
  console.log('Rendering Pokémon:', pokemon); // Log do Pokémon para depuração
	// Pega a imagem oficial de alta qualidade (dream_world ou official-artwork)
	const imageUrl =
		pokemon.sprites.other['official-artwork'].front_default ||
		pokemon.sprites.front_default;
	const primaryType = pokemon.types[0]?.type.name || 'normal';
	const [cardTypeColor, cardTypeDark] = pokemonTypeThemes[primaryType] || pokemonTypeThemes.normal;

	// Mapeia os tipos para Badges do Bootstrap
	const typesBadges = pokemon.types
		.map(
			(t) =>
				`<span class="badge badge-type" style="background-color: ${(pokemonTypeThemes[t.type.name] || pokemonTypeThemes.normal)[0]};">${t.type.name}</span>`
		)
		.join('');

	// Formata peso (em kg) e altura (em m)
	const heightInMeters = (pokemon.height / 10).toFixed(1);
	const weightInKg = (pokemon.weight / 10).toFixed(1);

	const cardHTML = `
        <div class="col">
          <div class="card h-100 shadow-sm pokemon-card border-0" style="--card-type-color: ${cardTypeColor}; --card-type-dark: ${cardTypeDark};" data-pokemon-id="${pokemon.id}" role="button" tabindex="0" aria-label="Ver detalhes de ${pokemon.name}">
            <div class="pokemon-card-image text-center p-3 rounded-top d-flex align-items-center justify-content-center">
              <img src="${imageUrl}" class="card-img-top img-fluid" style="max-height: 170px; object-fit: contain;" alt="${pokemon.name}">
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title pokemon-font text-capitalize fw-bold m-0">${pokemon.name}</h5>
                <small class="pokemon-number text-muted">#${String(pokemon.id).padStart(3, '0')}</small>
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
              <div class="pokemon-details-hint text-center border-top mt-3 pt-3">Ver detalhes</div>
            </div>
          </div>
        </div>
      `;

	if (skeleton) {
		skeleton.outerHTML = cardHTML;
	} else {
		pokemonGrid.insertAdjacentHTML('beforeend', cardHTML);
	}
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
		<div class="row row-cols-1 row-cols-sm-2 g-2">
			${abilities
				.map(
					({ ability, is_hidden }, index) => `
						<div class="col">
							<div class="ability-item">
								<span class="ability-number">${index + 1}</span>
								<div>
									<div class="ability-name text-capitalize">${ability.name}</div>
									${is_hidden ? '<small class="ability-hidden-label text-secondary">Habilidade oculta</small>' : ''}
								</div>
							</div>
						</div>
					`
				)
				.join('')}
		</div>
	`;
}

function renderPokemonCryButton(cries) {
	const cryUrl = cries.latest || cries.legacy;

	if (!cryUrl) return '';

	return `
		<button type="button" class="btn btn-light btn-sm rounded-pill pokemon-cry-button" data-cry-url="${cryUrl}">
			<img class="pokemon-cry-icon" src="img/pokebola-audio-player.svg" alt="" aria-hidden="true" />
			<span class="pokemon-cry-label">Ouvir som</span>
		</button>
		<audio class="pokemon-cry-audio d-none" src="${cryUrl}"></audio>
	`;
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

function renderPokemonOverview(pokemon) {
	const imageUrl =
		pokemon.sprites.other?.['official-artwork']?.front_default ||
		pokemon.sprites.front_default;
	const types = pokemon.types
		.map(({ type }) => {
			const [color] = pokemonTypeThemes[type.name] || pokemonTypeThemes.normal;
			return `<span class="badge text-capitalize me-1" style="background-color: ${color};">${type.name}</span>`;
		})
		.join('');

	return `
		<div class="row align-items-stretch g-0 mb-4 pokemon-overview">
			<div class="col-12 col-md-5 pokemon-overview-media text-center p-3 d-flex align-items-center justify-content-center">
				<img src="${imageUrl}" class="img-fluid pokemon-modal-image" alt="${pokemon.name}" />
				${renderPokemonCryButton(pokemon.cries)}
			</div>
			<div class="col-12 col-md-7 p-4 d-flex flex-column justify-content-center">
				<p class="text-secondary mb-1">#${String(pokemon.id).padStart(3, '0')}</p>
				<h4 class="pokemon-font text-capitalize fw-bold mb-2">${pokemon.name}</h4>
				<div class="mb-3">${types}</div>
				<div class="row text-center g-2">
					<div class="col-6">
						<div class="bg-light rounded p-2">
							<small class="text-secondary d-block">Altura</small>
							<strong>${(pokemon.height / 10).toFixed(1)} m</strong>
						</div>
					</div>
					<div class="col-6">
						<div class="bg-light rounded p-2">
							<small class="text-secondary d-block">Peso</small>
							<strong>${(pokemon.weight / 10).toFixed(1)} kg</strong>
						</div>
					</div>
				</div>
			</div>
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
		const primaryType = pokemon.types[0]?.type.name || 'normal';
		const [pokemonColor, pokemonColorDark] =
			pokemonTypeThemes[primaryType] || pokemonTypeThemes.normal;
		pokemonModalElement.style.setProperty('--pokemon-color', pokemonColor);
		pokemonModalElement.style.setProperty('--pokemon-color-dark', pokemonColorDark);
		pokemonModalTitle.textContent = `#${String(pokemon.id).padStart(3, '0')} ${pokemon.name}`;
		pokemonModalBody.innerHTML = `
			${renderPokemonOverview(pokemon)}
			<section class="pokemon-detail-section" aria-labelledby="pokemonStatsTitle">
				<h6 id="pokemonStatsTitle" class="border-bottom pb-2 mb-3">Status base</h6>
				${renderPokemonStats(pokemon.stats)}
			</section>

			<section class="pokemon-detail-section mt-4" aria-labelledby="pokemonAbilitiesTitle">
				<h6 id="pokemonAbilitiesTitle" class="border-bottom pb-2 mb-3">Habilidades</h6>
				${renderPokemonAbilities(pokemon.abilities)}
			</section>

			<section class="pokemon-detail-section mt-4" aria-labelledby="pokemonSpritesTitle">
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
		isSearchMode = false;
		loadInitialPokemon();
		return;
	}

	isSearchMode = true;
	pokemonGrid.innerHTML = '';
	renderSkeletonCards(1);

	try {
		const pokemon = await fetchPokemonData(query);
		const skeleton = pokemonGrid.querySelector('.skeleton-item');
		renderPokemonCard(pokemon, skeleton);
		removeSkeletonCards();
	} catch (error) {
		showError(`Nenhum Pokémon encontrado com o termo "${query}".`);
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

const pokemonObserver = new IntersectionObserver(
	(entries) => {
		if (entries[0].isIntersecting && !isSearchMode) {
			loadPokemonPage();
		}
	},
	{ rootMargin: '300px' }
);

pokemonObserver.observe(pokemonSentinel);

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

pokemonModalBody.addEventListener('click', (event) => {
	const button = event.target.closest('[data-cry-url]');
	if (!button) return;

	const audio = pokemonModalBody.querySelector('.pokemon-cry-audio');
	if (!audio) return;

	audio.currentTime = 0;
	audio.play().then(() => {
		button.classList.add('is-playing');
		button.querySelector('.pokemon-cry-label').textContent = 'Reproduzindo...';
	});
	audio.addEventListener('ended', () => {
		button.classList.remove('is-playing');
		button.querySelector('.pokemon-cry-label').textContent = 'Ouvir som';
	}, { once: true });
});

// Inicialização
loadInitialPokemon();
