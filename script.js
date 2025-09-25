const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const listPokemon = document.getElementById('pokemon-list');
const previousButton = document.getElementById('previous');
const nextButton = document.getElementById('next');

let limit = 18;
let offset = 1;
let allPokemons = [];

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
  } catch (error) {
    console.error('Surgiram alguns problemas na Pokédex:', error);
  }
}
fetchAllPokemons();

function renderPokemonCards(pokemons) {
  listPokemon.innerHTML = '';

  if (!pokemons || pokemons.length === 0) {
    listPokemon.innerHTML = `<p style="text-align: center; color: #888;">Pokémon não encontrado.</p>`;
    return;
  }

  pokemons.forEach((pokemon) => {
    listPokemon.innerHTML += `<li class="card">
            <div class="card__header">
                <span>${pokemon.type}</span> <span>#${pokemon.id}</span>
            </div>
            <img class="card__image" src="${pokemon.image}" />
            <p class="card__title">${pokemon.name}</p>
        </li>`;
  });
}

async function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();

  if (searchTerm === '') {
    listPokemons(offset, limit);
    pagination();
    return;
  }

  const filteredPokemons = allPokemons.filter((p) =>
    p.name.includes(searchTerm),
  );

  if (filteredPokemons.length > 0) {
    const fetchPromises = filteredPokemons.map((p) => fetchPokemon(p.url));
    const detailedPokemons = await Promise.all(fetchPromises);

    renderPokemonCards(detailedPokemons.filter((p) => p !== null));
  } else {
    renderPokemonCards([]);
  }
}

searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleSearch();
  }
});

async function listPokemons(offset, limit) {
  listPokemon.innerHTML = '';

  const fetchPromises = [];
  for (let i = offset; i < offset + limit; i++) {
    fetchPromises.push(fetchPokemon(i));
  }

  const detailedPokemons = await Promise.all(fetchPromises);

  renderPokemonCards(detailedPokemons.filter((p) => p !== null));
}

function updatePage(newOffset) {
  offset = newOffset;

  listPokemons(offset, limit);
  pagination(offset, limit);
}

previousButton.addEventListener('click', () => {
  if (offset > 1) {
    updatePage(offset - limit);
  }
});

nextButton.addEventListener('click', () => {
  updatePage(offset + limit);
});

function pagination(currentOffset, currentLimit) {
  fetch(`https://pokeapi.co/api/v2/pokemon/`)
    .then((res) => res.json())
    .then((data) => {
      const totalCount = data.count;
      const totalPages = Math.ceil(totalCount / currentLimit);
      const paginationContainer = document.getElementById('pagination');
      paginationContainer.innerHTML = '';

      const currentPage = Math.ceil(currentOffset / currentLimit);

      let startPage = 1;
      let endPage = 3;

      if (currentPage > 1) {
        startPage = Math.max(1, currentPage - 1);
        endPage = Math.min(totalPages, currentPage + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        if (i === currentPage) {
          button.classList.add('active');
        }

        button.addEventListener('click', () => {
          const newOffset = (i - 1) * currentLimit + 1;
          updatePage(newOffset);
        });
        paginationContainer.appendChild(button);
      }
    });
}

listPokemons(offset, limit);
pagination(offset, limit);
