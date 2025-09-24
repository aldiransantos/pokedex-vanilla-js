const listPokemon = document.getElementById('pokemon-list');
console.log(listPokemon.text);

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

async function getPokemon(number) {
  for (let i = 1; i <= number; i++) {
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

getPokemon(8);
