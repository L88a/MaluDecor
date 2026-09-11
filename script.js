document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Ano atual no rodapé ---------- */
    var anoEl = document.getElementById('ano-atual');
    if (anoEl) anoEl.textContent = new Date().getFullYear();

    /* ---------- Menu mobile ---------- */
    var menuToggle = document.getElementById('menu-toggle');
    var menu = document.getElementById('menu-principal');
    var menuBackdrop = document.getElementById('menu-backdrop');

    function fecharMenu() {
        menuToggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('aberto');
        if (menuBackdrop) menuBackdrop.classList.remove('visivel');
    }

    if (menuToggle && menu) {
        menuToggle.addEventListener('click', function () {
            var aberto = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', String(!aberto));
            menu.classList.toggle('aberto');
            if (menuBackdrop) menuBackdrop.classList.toggle('visivel', !aberto);
        });

        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', fecharMenu);
        });

        if (menuBackdrop) menuBackdrop.addEventListener('click', fecharMenu);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.classList.contains('aberto')) fecharMenu();
        });
    }

    /* ---------- Slider principal (hero) ---------- */
    var slidesWrap = document.getElementById('slides');
    var dotsWrap = document.getElementById('slider-dots');
    var btnAnterior = document.getElementById('seta-anterior');
    var btnProxima = document.getElementById('seta-proxima');
    var slider = document.getElementById('slider');

    if (slidesWrap && dotsWrap) {
        var slides = Array.prototype.slice.call(slidesWrap.querySelectorAll('.slide'));
        var indiceAtual = 0;
        var autoplayId = null;
        var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        slides.forEach(function (_, i) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', 'Ir para o slide ' + (i + 1));
            dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            dot.addEventListener('click', function () { irParaSlide(i); });
            dotsWrap.appendChild(dot);
        });

        function irParaSlide(indice) {
            indiceAtual = (indice + slides.length) % slides.length;
            slidesWrap.style.transform = 'translateX(-' + (indiceAtual * 100) + '%)';
            Array.prototype.forEach.call(dotsWrap.children, function (dot, i) {
                dot.setAttribute('aria-selected', i === indiceAtual ? 'true' : 'false');
            });
        }

        function iniciarAutoplay() {
            if (reduzMovimento) return;
            pararAutoplay();
            autoplayId = window.setInterval(function () { irParaSlide(indiceAtual + 1); }, 5000);
        }
        function pararAutoplay() {
            if (autoplayId) window.clearInterval(autoplayId);
        }

        if (btnAnterior) btnAnterior.addEventListener('click', function () { irParaSlide(indiceAtual - 1); iniciarAutoplay(); });
        if (btnProxima) btnProxima.addEventListener('click', function () { irParaSlide(indiceAtual + 1); iniciarAutoplay(); });

        if (slider) {
            slider.addEventListener('mouseenter', pararAutoplay);
            slider.addEventListener('mouseleave', iniciarAutoplay);
            slider.addEventListener('focusin', pararAutoplay);
            slider.addEventListener('focusout', iniciarAutoplay);
        }

        irParaSlide(0);
        iniciarAutoplay();

        /* Arrastar com o dedo (swipe) para trocar de slide no celular */
        var toqueInicioX = 0;
        var toqueFimX = 0;

        slidesWrap.addEventListener('touchstart', function (e) {
            toqueInicioX = e.touches[0].clientX;
            pararAutoplay();
        }, { passive: true });

        slidesWrap.addEventListener('touchmove', function (e) {
            toqueFimX = e.touches[0].clientX;
        }, { passive: true });

        slidesWrap.addEventListener('touchend', function () {
            var distancia = toqueInicioX - toqueFimX;
            var limiar = 40;
            if (distancia > limiar) {
                irParaSlide(indiceAtual + 1);
            } else if (distancia < -limiar) {
                irParaSlide(indiceAtual - 1);
            }
            toqueInicioX = 0;
            toqueFimX = 0;
            iniciarAutoplay();
        });
    }

    /* ---------- Carrossel de festas (arrastar / botões) ---------- */
    var trackFestas = document.getElementById('carousel-festas');
    var botaoAnteriorFestas = document.getElementById('festas-anterior');
    var botaoProximaFestas = document.getElementById('festas-proxima');

    if (trackFestas && botaoAnteriorFestas && botaoProximaFestas) {
        var passoScroll = function () {
            var item = trackFestas.querySelector('.carousel-item');
            return item ? item.getBoundingClientRect().width + 20 : 300;
        };
        botaoAnteriorFestas.addEventListener('click', function () {
            trackFestas.scrollBy({ left: -passoScroll(), behavior: 'smooth' });
        });
        botaoProximaFestas.addEventListener('click', function () {
            trackFestas.scrollBy({ left: passoScroll(), behavior: 'smooth' });
        });
    }

    /* ---------- Lightbox da galeria de festas ---------- */
    var lightbox = document.getElementById('lightbox');
    var lightboxImagem = document.getElementById('lightbox-imagem');
    var lightboxLegenda = document.getElementById('lightbox-legenda');
    var lightboxFechar = document.getElementById('lightbox-fechar');
    var ultimoFoco = null;

    function abrirLightbox(src, legenda) {
        if (!lightbox) return;
        ultimoFoco = document.activeElement;
        lightboxImagem.src = src;
        lightboxImagem.alt = legenda || '';
        lightboxLegenda.textContent = legenda || '';
        lightbox.hidden = false;
        lightboxFechar.focus();
        document.body.style.overflow = 'hidden';
    }

    function fecharLightbox() {
        if (!lightbox) return;
        lightbox.hidden = true;
        lightboxImagem.src = '';
        document.body.style.overflow = '';
        if (ultimoFoco) ultimoFoco.focus();
    }

    document.querySelectorAll('[data-lightbox]').forEach(function (botao) {
        botao.addEventListener('click', function () {
            abrirLightbox(botao.getAttribute('data-lightbox'), botao.getAttribute('data-legenda'));
        });
    });

    if (lightboxFechar) lightboxFechar.addEventListener('click', fecharLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) fecharLightbox();
        });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox && !lightbox.hidden) fecharLightbox();
    });

    /* ---------- Sombra no cabeçalho ao rolar ---------- */
    var cabecalho = document.getElementById('cabecalho');
    if (cabecalho) {
        window.addEventListener('scroll', function () {
            cabecalho.style.boxShadow = window.scrollY > 10
                ? '0 4px 16px rgba(74, 39, 79, 0.18)'
                : '0 2px 12px rgba(74, 39, 79, 0.12)';
        });
    }
});
