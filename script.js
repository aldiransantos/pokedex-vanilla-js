const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const listPokemon = document.getElementById('pokemon-list');
const previousButton = document.getElementById('previous');
const nextButton = document.getElementById('next');
const paginationContainer = document.getElementById('pagination');
const clearSearchButton = document.getElementById('clear-search');

let limit = 18;
let allPokemons = [];
let currentList = [];
let currentPage = 1;

async function fetchPokemon(id) {
  let url;
  if (typeof id === 'number') {
    url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  } else {
    url = id;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Carregando Pokédex...');
    }

    const data = await response.json();
    const pokemon = {
      id: data.id,
      name: data.name,
      image: data.sprites.other['official-artwork'].front_default,
      type: data.types.map((type) => type.type.name).join(', '),
    };

    return pokemon;
  } catch (error) {
    console.error(error.message);
  }
}

async function fetchAllPokemons() {
  try {
    const response = await fetch(
      'https://pokeapi.co/api/v2/pokemon?limit=2000',
    );
    const data = await response.json();
    allPokemons = data.results;

    currentList = allPokemons;
    updateRender(1);
  } catch (error) {
    console.error('Surgiram alguns problemas na Pokédex:', error);
  }
}

async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
}

function togglePagination(show) {
  const displayStyle = show ? 'flex' : 'none';
  paginationContainer.style.display = displayStyle;
  previousButton.style.display = displayStyle;
  nextButton.style.display = displayStyle;
}

async function renderPokemonCards(pokemons) {
  listPokemon.innerHTML = '';

  if (!pokemons || pokemons.length === 0) {
    listPokemon.innerHTML = `<p style="text-align: center; color: #888;">Pokémon não encontrado.</p>`;
    return;
  }

  const renderPromises = pokemons.map(async (pokemon) => {
    await loadImage(pokemon.image);
    return `<li class="pokemon-card" data-type="pokemon-type">
            <div class="pokemon-card__header">
                <span class="pokemon-card__type">${pokemon.type}</span> 
                <span class="pokemon-card__id">#${pokemon.id}</span>
            </div>
            <img class="pokemon-card__image" src="${pokemon.image}" />
            <p class="pokemon-card__title">${pokemon.name}</p>
        </li>`;
  });

  const cardHTMLArray = await Promise.all(renderPromises);
  listPokemon.innerHTML = cardHTMLArray.join('');
}

function pagination(totalPages) {
  paginationContainer.innerHTML = '';

  if (totalPages <= 1) {
    togglePagination(false);
    return;
  }

  togglePagination(true);

  let startPage = 1;
  let endPage = 3;

  if (currentPage > 1) {
    startPage = Math.max(1, currentPage - 1);
    endPage = Math.min(totalPages, currentPage + 1);
  }

  endPage = Math.min(totalPages, endPage);

  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement('button');
    button.innerText = i;

    if (i === currentPage) {
      button.classList.add('active');
      button.disabled = true;
    }

    button.addEventListener('click', () => {
      updateRender(i);
    });
    paginationContainer.appendChild(button);
  }

  previousButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
}

async function updateRender(pageNumber) {
  currentPage = pageNumber;

  if (currentList.length === 0) {
    renderPokemonCards([]);
    pagination(0);
    return;
  }

  listPokemon.innerHTML = `<p style="text-align: center; color: #888; font-size: 1.2em;">Capturando pokémons...</p>`;

  const newOffsetIndex = (pageNumber - 1) * limit;
  const listToRender = currentList.slice(
    newOffsetIndex,
    newOffsetIndex + limit,
  );

  const fetchPromises = listToRender.map((p) => fetchPokemon(p.url));
  const detailedPokemons = await Promise.all(fetchPromises);

  await renderPokemonCards(detailedPokemons.filter((p) => p !== null));

  const totalItems = currentList.length;
  const totalPages = Math.ceil(totalItems / limit);
  pagination(totalPages);
}

async function handleSearch() {
  const searchWord = searchInput.value.toLowerCase();

  if (searchWord === '') {
    currentList = allPokemons;
    updateRender(1);
    return;
  }

  isSearching = true;
  currentList = allPokemons.filter((p) => p.name.includes(searchWord));
  updateRender(1);
}

searchInput.addEventListener('input', () => {
  if (searchInput.value.length > 0) {
    clearSearchButton.style.display = 'block';
  } else {
    clearSearchButton.style.display = 'none';
    handleSearch();
  }
});

clearSearchButton.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchButton.style.display = 'none';
  handleSearch();
});

previousButton.addEventListener('click', () => {
  if (currentPage > 1) {
    updateRender(currentPage - 1);
  }
});

nextButton.addEventListener('click', () => {
  const totalPages = Math.ceil(currentList.length / limit);
  if (currentPage < totalPages) {
    updateRender(currentPage + 1);
  }
});

searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleSearch();
  }
});

fetchAllPokemons();
