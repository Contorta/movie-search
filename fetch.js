const searchForm = document.querySelector("#search-form");
const movies = document.querySelector("#movies")
const urlPoster = "https://image.tmdb.org/t/p/w500";

function apiSearch (event){

    event.preventDefault();

    const searchText = document.querySelector(".form-control").value;

    if (searchText.trim().length === 0){
        movies.innerHTML = '<h4 class="col-12 text-center text-info">Поле поиска не должно быть пустым</h4>'
        return;
    };

    movies.innerHTML = '<div class="spinner"></div>';
    
    fetch("https://api.themoviedb.org/3/search/multi?api_key=81a6188ced5b5548d14f3e2aad0fb921&language=ru&query=---" + searchText)
        .then(function(value){
            if(value.status !== 200){
                    return Promise.reject(value);
            };

            return value.json();
        })
        .then(function(output){
            let inner = '';

            if (output.results.length == 0){
                inner = '<h4 class="col-12 text-center text-info">По вашему запросу ничего не найдено</h4>';
            };

			output.results.forEach(function(item){
                let nameItem = item.name || item.title;

                const poster = item.poster_path ? urlPoster + item.poster_path : './img/noposter.png';

                let dataInfo = '';
                if (item.media_type !== 'person'){
                    dataInfo = `data-id="${item.id}" data-type="${item.media_type}";`
                };
                inner +=
                `<div class="col-12 col-md-6 col-xl-3 item">
                <img src='${poster}' class='img_poster' alt='${nameItem}' ${dataInfo}/>
                 <h5>${nameItem}</h5>
                </div>`;
			}); 

            movies.innerHTML = inner;

            addEventMedia();

        })

        .catch(function(reason){
            movies.innerHTML = 'Увы и ах!';
            console.error(reason || reason.status);
        });
    };
	
    searchForm.addEventListener("submit", apiSearch);

    function addEventMedia (){
        const media = movies.querySelectorAll('img[data-id]');
        media.forEach(function(elem){
                elem.style.cursor = 'pointer';
                elem.addEventListener('click', showFullInfo);
        });
    };

function showFullInfo (){
    let url = 'https://api.themoviedb.org/3/movie/{movie_id}?api_key=81a6188ced5b5548d14f3e2aad0fb921&language=ru';
    if (this.dataset.type === 'movie'){
        url = `https://api.themoviedb.org/3/movie/${this.dataset.id}?api_key=81a6188ced5b5548d14f3e2aad0fb921&language=ru`;
    }else if(this.dataset.type === 'tv'){
        url = `https://api.themoviedb.org/3/tv/${this.dataset.id}?api_key=81a6188ced5b5548d14f3e2aad0fb921&language=ru`;
    }else{
        movies.innerHTML = '<h4 class="col-12 text-center text-info">Произошла ошибка, повторите позже</h4>';
    };
    const mediaType = this.dataset.type;

    fetch(url)
        .then(function(value){
            if(value.status !== 200){
                    return Promise.reject(value);
            };

            return value.json();
        })
        .then(function(output){
            movies.innerHTML = `
            <h4 class="col-12 text-center text-info">${output.name || output.title}</h4>
            <div class="col-4"><img src="${urlPoster + output.poster_path}" alt="${output.name || output.title}">
            ${(output.homepage) ? `<p class="text-center"><a href="${output.homepage} target="_blank">Официальная страница</a></p>` : ''}
            ${(output.homepage) ? `<p class="text-center"><a href="https://imdb.com/title/${output.imdb_id}" target="_blank">Сраница на IMDB.com</a></p>` : ''}
            </div>
            <div class="col-8">
            <p> Рейтинг: ${output.vote_average}</p>
            <p> Статус: ${output.status}</p>
            <p> Примьера: ${output.release_date || output.first_air_date}</p>
            <p> Бюджет: ${output.budget || "неизвестно"}$</p>
            ${(output.last_episode_to_air) ? `<p>Сезонов вышло:${output.number_of_seasons}<br>Серий вышло:${output.last_episode_to_air.episode_number}</p>` : ''}
            <p>Описание: ${output.overview}</p>
            <br>
            </div>
            <div class="youtube"></div>
            `;

            getTrailer (mediaType, output.id);
        })

        .catch(function(reason){
            movies.innerHTML = 'Увы и ах!';
            console.error(reason || reason.status);
        });
    };

document.addEventListener('DOMContentLoaded', function(){
    fetch('https://api.themoviedb.org/3/trending/all/week?api_key=81a6188ced5b5548d14f3e2aad0fb921&language=ru')
        .then(function(value){
            if(value.status !== 200){
                return Promise.reject(value);
            };

            return value.json();
        })
        .then(function(output){
            let inner = '<div class="col-12 text-center text-info">Популярные за неделю</div>';

            if (output.results.length == 0){
                inner = '<h4 class="col-12 text-center text-info">По вашему запросу ничего не найдено</h4>';
            };

			output.results.forEach(function(item){
                let nameItem = item.name || item.title;
                let mediaType = item.title ? 'movie' : 'tv';
                const poster = item.poster_path ? urlPoster + item.poster_path : './img/noposter.png';

                let dataInfo = `data-id="${item.id}" data-type="${mediaType}"`;
                
                inner +=
                `<div class="col-12 col-md-6 col-xl-3 item">
                <img src='${poster}' class='img_poster' alt='${nameItem}' ${dataInfo}/>
                 <h5>${nameItem}</h5>
                </div>`;    
			}); 

            movies.innerHTML = inner;

            addEventMedia();
        })

        .catch(function(reason){
            movies.innerHTML = '<div class="col-12 text-center">Увы и ах!</div>';
            console.error(reason || reason.status);
        });
});

function getTrailer (type, id){
    let youtube = movies.querySelector('.youtube');
    fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=81a6188ced5b5548d14f3e2aad0fb921&language=ru`)

        .then(function(value){
            console.log(value);
            if(value.status !== 200){
                return Promise.reject(value);
            };

            return value.json();

        })
        .then((output) => {
            console.log(output);
            youtube.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${output.results[0].key}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        })
        .catch((reason) => {
            youtube.innerHTML = 'Видео отсутствует!';
            console.error (reason || reason.status);
        });
};

