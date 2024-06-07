let currentPage = 1;
const pageSize = 20;
const typeFilter = document.getElementById('type-filter');
const pageNumber = document.getElementById('page-number');

const addPokemonToTable = (pokemonData) => {
    const tableBody = document.querySelector('#pokemon-table tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${pokemonData.name}</td>
        <td><img src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}"></td>
        <td>${pokemonData.height}</td>
        <td>${pokemonData.weight}</td>
    `;
    tableBody.appendChild(row);
};

document.getElementById('search-button').addEventListener('click', () => {
    const search = document.getElementById('search').value.toLowerCase();
    const errorMessage = document.getElementById('error-message');
    const pokemon = document.getElementById('pokemon');
    const spinner = document.getElementById('spinner');
    errorMessage.innerHTML = ''; // Clear previous errors
    pokemon.innerHTML = ''; // Clear previous results
    spinner.style.display = 'block'; // Show spinner

    fetch(`https://pokeapi.co/api/v2/pokemon/${search}`)
        .then(response => {
            spinner.style.display = 'none'; // Hide spinner
            if (!response.ok) {
                throw new Error('PokÃ©mon no encontrado');
            }
            return response.json();
        })
        .then(data => {
            pokemon.innerHTML = `
                <h2>${data.name}</h2>
                <img src="${data.sprites.front_default}" alt="${data.name}">
                <p>Altura: ${data.height}</p>
                <p>Peso: ${data.weight}</p>
            `;
            addPokemonToTable(data);
        })
        .catch(error => {
            errorMessage.innerHTML = `<p style="color: red;">${error.message}</p>`;
        });
});

document.getElementById('random-button').addEventListener('click', () => {
    const randomId = Math.floor(Math.random() * 898) + 1;
    const errorMessage = document.getElementById('error-message');
    const pokemon = document.getElementById('pokemon');
    const spinner = document.getElementById('spinner');
    errorMessage.innerHTML = ''; // Clear previous errors
    pokemon.innerHTML = ''; // Clear previous results
    spinner.style.display = 'block'; // Show spinner

    fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
        .then(response => {
            spinner.style.display = 'none'; // Hide spinner
            if (!response.ok) {
                throw new Error('PokÃ©mon no encontrado');
            }
            return response.json();
        })
        .then(data => {
            pokemon.innerHTML = `
                <h2>${data.name}</h2>
                <img src="${data.sprites.front_default}" alt="${data.name}">
                <p>Altura: ${data.height}</p>
                <p>Peso: ${data.weight}</p>
            `;
            addPokemonToTable(data);
        })
        .catch(error => {
            errorMessage.innerHTML = `<p style="color: red;">${error.message}</p>`;
        });
});

document.getElementById('clear-button').addEventListener('click', () => {
    document.getElementById('pokemon').innerHTML = '';
    document.getElementById('error-message').innerHTML = '';
    document.querySelector('#pokemon-table tbody').innerHTML = '';
});

document.getElementById('filter-button').addEventListener('click', () => {
    currentPage = 1;
    fetchPokemonByType(typeFilter.value);
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchPokemonByType(typeFilter.value);
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    currentPage++;
    fetchPokemonByType(typeFilter.value);
});

const fetchPokemonByType = (type) => {
    const offset = (currentPage - 1) * pageSize;
    const spinner = document.getElementById('spinner');
    const tableBody = document.querySelector('#pokemon-table tbody');
    const errorMessage = document.getElementById('error-message');
    tableBody.innerHTML = ''; // Clear previous results
    spinner.style.display = 'block'; // Show spinner
    errorMessage.innerHTML = ''; // Clear previous errors

    fetch(`https://pokeapi.co/api/v2/type/${type}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el tipo de PokÃ©mon');
            }
            return response.json();
        })
        .then(data => {
            const pokemonList = data.pokemon.slice(offset, offset + pageSize);
            if (pokemonList.length === 0) {
                throw new Error('No hay mÃ¡s PokÃ©mon de este tipo');
            }
            return Promise.all(pokemonList.map(p => fetch(p.pokemon.url).then(res => res.json())));
        })
        .then(pokemonData => {
            spinner.style.display = 'none'; // Hide spinner
            pokemonData.forEach(data => addPokemonToTable(data));
            pageNumber.innerText = currentPage;
        })
        .catch(error => {
            spinner.style.display = 'none'; // Hide spinner
            errorMessage.innerHTML = `<p style="color: red;">${error.message}</p>`;
        });
};

document.getElementById('advanced-filter-button').addEventListener('click', () => {
    currentPage = 1;
    fetchFilteredPokemon();
});

const fetchFilteredPokemon = () => {
    const minHeight = document.getElementById('min-height').value;
    const maxHeight = document.getElementById('max-height').value;
    const minWeight = document.getElementById('min-weight').value;
    const maxWeight = document.getElementById('max-weight').value;
    const minBaseExp = document.getElementById('min-base-exp').value;
    const maxBaseExp = document.getElementById('max-base-exp').value;
    const spinner = document.getElementById('spinner');
    const tableBody = document.querySelector('#pokemon-table tbody');
    const errorMessage = document.getElementById('error-message');
    tableBody.innerHTML = ''; // Clear previous results
    spinner.style.display = 'block'; // Show spinner
    errorMessage.innerHTML = ''; // Clear previous errors

    fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener la lista de PokÃ©mon');
            }
            return response.json();
        })
        .then(data => {
            const filteredPokemonPromises = data.results.map(pokemon => {
                return fetch(pokemon.url)
                    .then(res => res.json())
                    .then(details => {
                        if (
                            (!minHeight || details.height >= minHeight) &&
                            (!maxHeight || details.height <= maxHeight) &&
                            (!minWeight || details.weight >= minWeight) &&
                            (!maxWeight || details.weight <= maxWeight) &&
                            (!minBaseExp || details.base_experience >= minBaseExp) &&
                            (!maxBaseExp || details.base_experience <= maxBaseExp)
                        ) {
                            return details;
                        }
                    });
            });

            return Promise.all(filteredPokemonPromises);
        })
        .then(filteredData => {
            spinner.style.display = 'none'; // Hide spinner
            const validData = filteredData.filter(data => data !== undefined);
            if (validData.length === 0) {
                throw new Error('No hay PokÃ©mon que coincidan con los filtros');
            }
            validData.forEach(data => addPokemonToTable(data));
        })
        .catch(error => {
            spinner.style.display = 'none'; // Hide spinner
            errorMessage.innerHTML = `<p style="color: red;">${error.message}</p>`;
        });
};
