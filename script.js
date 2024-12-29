let movies = [];
let currentPage = 1;
let recordsPerPage = 10;

const dataUrl = 'https://raw.githubusercontent.com/Dmitralt/Ukrainian_Movie_Catalog/main/ukrainian_old_movies_db.json';

window.addEventListener('load', () => {
    fetchData();
});

function fetchData() {
    fetch(dataUrl)
        .then(response => response.json())
        .then(jsonData => {
            movies = jsonData.movies || [];
            renderMovies();
        })
        .catch(() => {
            alert('Ошибка загрузки данных');
        });
}

document.getElementById('searchInput').addEventListener('input', () => {
    currentPage = 1;
    renderMovies();
});

document.getElementById('recordsPerPage').addEventListener('change', (event) => {
    recordsPerPage = parseInt(event.target.value, 10);
    currentPage = 1;
    renderMovies();
});

function renderMovies() {
    const movieList = document.getElementById('movieList');
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery)
    );

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

    movieList.innerHTML = '';
    paginatedMovies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'col-md-4 movie-card';

        const poster = movie.images.posters[0] || null;
        card.innerHTML = `
            ${poster ? `<img src="${poster}" alt="${movie.title} Poster">` : '<div class="no-poster">No Poster Available</div>'}
            <h5>${movie.title}</h5>
            <p><strong>Year:</strong> ${movie.year}</p>
            <p><strong>Directors:</strong> ${movie.directors.join(', ')}</p>
            <p><strong>Actors:</strong> ${movie.actors.join(', ')}</p>
            <p><strong>Country:</strong> ${movie.country}</p>
        `;

        card.addEventListener('click', () => showMovieDetails(movie));
        movieList.appendChild(card);
    });

    renderPaginationControls(filteredMovies.length);
}

function renderPaginationControls(totalRecords) {
    const paginationControls = document.getElementById('paginationControls');
    const totalPages = Math.ceil(totalRecords / recordsPerPage);

    paginationControls.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-secondary'}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderMovies();
        });
        paginationControls.appendChild(pageButton);
    }
}

function showMovieDetails(movie) {
    const modalTitle = document.getElementById('movieModalTitle');
    const modalBody = document.getElementById('movieModalBody');
    const modal = new bootstrap.Modal(document.getElementById('movieModal'));

    modalTitle.textContent = movie.title;
    modalBody.innerHTML = '';

    if (movie.images.posters && movie.images.posters.length > 0) {
        const mainPoster = document.createElement('img');
        mainPoster.src = movie.images.posters[0];
        mainPoster.alt = `${movie.title} Poster`;
        mainPoster.className = 'main-poster';
        modalBody.appendChild(mainPoster);
    }

    const infoSection = document.createElement('div');
    infoSection.className = 'info-section';
    infoSection.innerHTML = `
<p><strong>Year:</strong> ${movie.year}</p>
<p><strong>Country:</strong> ${movie.country}</p>
<p><strong>Language:</strong> ${movie.language}</p>
<p><strong>Production Company:</strong> ${movie.production_company || 'N/A'}</p>
<p><strong>Directors:</strong> ${movie.directors.join(', ')}</p>
<p><strong>Screenwriters:</strong> ${movie.screenwriters.join(', ')}</p>
<p><strong>Actors:</strong> ${movie.actors.join(', ')}</p>
<p><strong>Description:</strong> ${movie.description}</p>
<p><strong>Genres:</strong> ${movie.genres.join(', ')}</p>
<p><strong>Tags:</strong> ${movie.tags.join(', ') || 'N/A'}</p>
<p><strong>Budget:</strong> ${movie.budget == 0 ? 'Невідомо' : movie.budget}</p>
<p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
`;
    modalBody.appendChild(infoSection);

    if (movie.links && movie.links.length > 0) {
        const linksSection = document.createElement('div');
        linksSection.className = 'links-section mt-3';
        linksSection.innerHTML = `<h5>Additional Links</h5>`;
        movie.links.forEach(link => {
            const linkButton = document.createElement('a');
            linkButton.href = link.url;
            linkButton.target = '_blank';
            linkButton.className = 'btn btn-secondary btn-sm me-2 mb-2';
            linkButton.innerHTML = `<i class="bi bi-link-45deg"></i> ${link.description}`;
            linksSection.appendChild(linkButton);
        });
        modalBody.appendChild(linksSection);
    }

    const imagesSection = document.createElement('div');
    imagesSection.className = 'images-section';
    imagesSection.innerHTML = `
<h5>Posters</h5>
<div id="postersContainer" class="d-flex flex-wrap"></div>
<button id="loadMorePosters" class="btn btn-sm btn-secondary mt-2">Show More Posters</button>

<h5 class="mt-3">Stills</h5>
<div id="stillsContainer" class="d-flex flex-wrap"></div>
<button id="loadMoreStills" class="btn btn-sm btn-secondary mt-2">Show More Stills</button>
`;
    modalBody.appendChild(imagesSection);

    loadImages(movie.images.posters, 'postersContainer', 'loadMorePosters');
    loadImages(movie.images.stills, 'stillsContainer', 'loadMoreStills');

    modal.show();
}

function loadImages(images, containerId, buttonId) {
    const container = document.getElementById(containerId);
    const button = document.getElementById(buttonId);
    let loadedCount = 0;
    const batchSize = 5;

    function loadBatch() {
        const remaining = images.slice(loadedCount, loadedCount + batchSize);
        remaining.forEach(image => {
            const img = document.createElement('img');
            img.src = image;
            img.alt = 'Image';
            img.className = 'me-2 mb-2';
            container.appendChild(img);
        });
        loadedCount += batchSize;
        if (loadedCount >= images.length) button.style.display = 'none';
    }

    button.addEventListener('click', loadBatch);
    loadBatch();
}
