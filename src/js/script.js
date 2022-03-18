import Swiper from 'swiper';

function slider() {
    const slider = new Swiper('.swiper', {
        slidesPerView: 4,
        spaceBetween: 20,
        breakpoints: {
            0: {
                slidesPerView: 1.3,
                spaceBetween: 20,
            },
            426: {
                slidesPerView: 1.7,
                spaceBetween: 20,
            },
            576: {
                slidesPerView: 2.5,
                spaceBetween: 20,
            },
            767: {
                slidesPerView: 2.8,
                spaceBetween: 20,
            },
            992: {
                slidesPerView: 3.2,
                spaceBetween: 20,
            },
            1201: {
                slidesPerView: 4,
                spaceBetween: 20,
            }
        }
    })
}
slider();