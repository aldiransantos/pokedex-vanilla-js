const listPokemon = document.getElementById('pokemon-list');
const previousButton = document.getElementById('previous');
const nextButton = document.getElementById('next');

let limit = 3;
let offset = 1;

async function fetchPokemon(id) {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Carregando Pokedéx...');
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

async function listPokemons(offset, limit) {
  listPokemon.innerHTML = '';

  for (let i = offset; i < offset + limit; i++) {
    pokemonData = await fetchPokemon(i);

    listPokemon.innerHTML += `<li class="card">
              <div class="card__header">
                <span>${pokemonData.type}</span> <span>#${pokemonData.id}</span>
              </div>
              <img class="card__image" src="${pokemonData.image}" />
              <p class="card__title">${pokemonData.name}</p>
            </li>`;
  }
}

function pagination() {
  fetch(`https://pokeapi.co/api/v2/pokemon/`)
    .then((res) => res.json())
    .then((data) => {
      const totalCount = data.count;
      const totalPages = Math.ceil(totalCount / limit);
      const paginationContainer = document.getElementById('pagination');
      paginationContainer.innerHTML = '';

      const currentPage = Math.ceil(offset / limit);

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
          offset = (i - 1) * limit + 1;
          listPokemons(offset, limit);

          pagination();
        });
        paginationContainer.appendChild(button);
      }
    });
}

previousButton.addEventListener('click', () => {
  if (offset > 1) {
    offset -= limit;
    listPokemons(offset, limit);
    pagination();
  }
});

nextButton.addEventListener('click', () => {
  offset += limit;
  listPokemons(offset, limit);
  pagination();
});

listPokemons(offset, limit);
pagination();
