const axios = require('axios').default;
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';

//----- params ----- /////

const url = "https://pixabay.com/api/"
const params = {
        key: "28194425-a39cc5ed971e198ecf1a97b89",
        q: "",
        image_type: "photo",
        orientation : "horizontal",
        safesearch: "true",
        per_page: 40,
        page: 1,
    }

///--- const ----///

const search = document.querySelector(".search-form")
const main = document.querySelector("main")
const footer = document.querySelector("footer")
let gallery = document.querySelector(".gallery")
let loadMore;
var lightbox = new SimpleLightbox('.gallery .photo-card a', {
        captions:true,captionPosition:'bottom',captionSelector:'img',
        captionType: 'atrr', captionsData: "alt", captionDelay: 250,})

///--- function----///

async function getImage(params) {
    
    try {
        const response = await axios.get(url, { params });
        if (response.data.total < 1) {
            Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        } else if (response.data.total > 500 ) {
            renderImage(response.data.hits)

            lightbox.refresh()

            Notiflix.Notify.info(`Your query found ${response.data.total } pictures, but we can show you no more than 500 pictures`);
        } else {
            renderImage(response.data.hits)

            lightbox.refresh()

            Notiflix.Notify.success(`We found ${response.data.total } pictures for you`);
        }
        if((response.data.total / 40) > 1){
            setTimeout(addLoadMore, 2000)
        }
        
    } catch (error) {
        console.error(error);
    }
}

async function getImageMore(params) {
    
    try {
        const response = await axios.get(url, { params });
        renderImage(response.data.hits)

        lightbox.refresh()
        
        const maxPage = Number(response.data.totalHits) / 40
        if (maxPage <= params.page) {
            deliteLoadMore()
            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        }

    } catch (error) {
        console.error(error);
    }
}

function renderImage(hits) {
    
    const images = hits.reduce((acc, {webformatURL,largeImageURL, tags, likes, views, comments, downloads}) => {
        return acc + `
            <div class="photo-card">
                <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
                <div class="info">
                    <p class="info-item">
                    <b>Likes</b></br>
                        ${likes}
                    </p>
                    <p class="info-item">
                    <b>Views</b></br>
                        ${views}
                    </p>
                    <p class="info-item">
                    <b>Comments</b></br>
                        ${comments}
                    </p>
                    <p class="info-item">
                    <b>Downloads</b></br>
                        ${downloads}
                    </p>
                </div>
            </div>
            `
    }, "")
    
    gallery.insertAdjacentHTML("beforeend", images);
}

function removeGallery() {
    gallery.remove();
    const galleryHtml = `<div class="gallery"></div>`
    main.insertAdjacentHTML("beforeend", galleryHtml);
    gallery = document.querySelector(".gallery")
}

function addLoadMore() {
    footer.insertAdjacentHTML("beforeend", `<button type="button" class="load-more">Load more</button>`);
    loadMore = document.querySelector(".load-more")
    loadMore.addEventListener("click", loadMoreCallback)
}

function deliteLoadMore() {
    if (loadMore) {
        loadMore.removeEventListener("click", loadMoreCallback)
        loadMore.remove();
    }
}

function searchCallback() {
    if (document.querySelector(".search_input").value === "") {
        deliteLoadMore()
        removeGallery()
        Notiflix.Notify.failure("Please enter text");
    } else {
        deliteLoadMore()
        removeGallery()
        params.page = 1
        params.q =  document.querySelector(".search_input").value
        getImage(params)   
    }
}

function loadMoreCallback() {
    params.page += 1
    getImageMore(params)
}
///--- listener ---////

search.addEventListener("submit", e => {
    e.preventDefault()
    searchCallback()
})


// setTimeout(() => {
//                 const { height: cardHeight } = document
//                     .querySelector(".gallery")
//                     .firstElementChild.getBoundingClientRect();

//                     window.scrollBy({
//                     top: cardHeight * 2,
//                     behavior: "smooth",
//                     });},2000)