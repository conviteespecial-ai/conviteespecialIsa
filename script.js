/**
 * Convite digital — Isabela
 * Navegação, pétalas, parallax na foto de fundo, áudio e WhatsApp (URL encode).
 */

(function () {
  "use strict";

  /** Somente dígitos: país + DDD + número (ex.: 5511987654321). Troque pelo seu WhatsApp. */
  var WHATSAPP_NUMERO = "5538991917370";

  var MSG_CONFIRMACAO =
    "Estou confirmando a minha presença, segue abaixo o nome dos convidados:";

  var paginaInicial = document.getElementById("pagina-inicial");
  var paginaConvite = document.getElementById("pagina-convite");
  var cartaoConvite = document.getElementById("cartao-convite");
  var envelope = document.getElementById("envelope");
  var btnAbrir = document.getElementById("btn-abrir");
  var audio = document.getElementById("musica");
  var btnSom = document.getElementById("btn-som");
  var petalsLayer = document.getElementById("petals-layer");
  var burstLayer = document.getElementById("burst-layer");
  var burstFlash = document.getElementById("burst-flash");
  var appBgMedia = document.getElementById("app-bg-media");
  var linkWhatsapp = document.getElementById("link-whatsapp");

  var animacaoAberturaMs = 1280;

  var FLORES_BURST = ["🌹", "🌸", "🌼", "💮", "🌺", "🏵️"];

  /**
   * Link wa.me com texto codificado (abre no app WhatsApp no celular).
   */
  function configurarWhatsapp() {
    if (!linkWhatsapp) return;
    var digitos = String(WHATSAPP_NUMERO).replace(/\D/g, "");
    if (!digitos.length) {
      linkWhatsapp.setAttribute("aria-disabled", "true");
      linkWhatsapp.addEventListener("click", function (e) {
        e.preventDefault();
      });
      return;
    }
    var url =
      "https://wa.me/" +
      digitos +
      "?text=" +
      encodeURIComponent(MSG_CONFIRMACAO);
    linkWhatsapp.href = url;
  }

  /**
   * Parallax leve só na camada da foto (movimento suave, poucos px — bom para mobile).
   */
  function iniciarParallax() {
    if (!appBgMedia) return;
    var alvoX = 0;
    var alvoY = 0;
    var atualX = 0;
    var atualY = 0;
    var idFrame = null;
    var maxPx = 12;

    function tick() {
      idFrame = null;
      atualX += (alvoX - atualX) * 0.06;
      atualY += (alvoY - atualY) * 0.06;
      appBgMedia.style.transform =
        "translate3d(" + atualX + "px," + atualY + "px,0) scale(1.06)";
      if (Math.abs(alvoX - atualX) > 0.15 || Math.abs(alvoY - atualY) > 0.15) {
        idFrame = requestAnimationFrame(tick);
      }
    }

    function agendar() {
      if (idFrame == null) idFrame = requestAnimationFrame(tick);
    }

    function limitar(v) {
      if (v > maxPx) return maxPx;
      if (v < -maxPx) return -maxPx;
      return v;
    }

    window.addEventListener(
      "scroll",
      function () {
        alvoX = limitar(window.scrollY * 0.035);
        alvoY = limitar(window.scrollY * 0.025);
        agendar();
      },
      { passive: true },
    );

    window.addEventListener(
      "mousemove",
      function (e) {
        alvoX = limitar((e.clientX / window.innerWidth - 0.5) * 22);
        alvoY = limitar((e.clientY / window.innerHeight - 0.5) * 16);
        agendar();
      },
      { passive: true },
    );
  }

  /** Poucas pétalas: menos nós no DOM, animação só com transform/opacity. */
  function iniciarPetals() {
    var quantidade = 12;
    var i;
    for (i = 0; i < quantidade; i++) {
      criarPetal(i);
    }
  }

  /**
   * Explosão de rosas e margaridas a partir do centro do envelope (só transform/opacity).
   */
  function explosaoFloral(origem) {
    if (!burstLayer || !origem) return;
    var prefereReduzido =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefereReduzido) return;

    var r = origem.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    var n = 38;
    var i;
    var fragment = document.createDocumentFragment();

    if (burstFlash) {
      burstFlash.classList.remove("is-on");
      void burstFlash.offsetWidth;
      burstFlash.classList.add("is-on");
      window.setTimeout(function () {
        burstFlash.classList.remove("is-on");
      }, 700);
    }

    for (i = 0; i < n; i++) {
      var ang = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.85;
      var dist = 140 + Math.random() * 220;
      var tx = Math.cos(ang) * dist;
      var ty = Math.sin(ang) * dist + (Math.random() - 0.5) * 40;
      var rot = 140 + Math.random() * 200;
      var sp = document.createElement("span");
      sp.className = "burst-particle";
      sp.setAttribute("aria-hidden", "true");
      sp.textContent = FLORES_BURST[i % FLORES_BURST.length];
      sp.style.left = cx + "px";
      sp.style.top = cy + "px";
      sp.style.setProperty("--tx", tx + "px");
      sp.style.setProperty("--ty", ty + "px");
      sp.style.setProperty("--rot", rot + "deg");
      sp.style.animationDelay = Math.random() * 0.06 + "s";
      fragment.appendChild(sp);
    }

    burstLayer.appendChild(fragment);

    window.setTimeout(function () {
      burstLayer.textContent = "";
    }, 1150);
  }

  function criarPetal(indice) {
    if (!petalsLayer) return;
    var el = document.createElement("span");
    el.className = "petal";
    el.style.left = Math.random() * 100 + "%";
    el.style.animationDuration = 11 + Math.random() * 9 + "s";
    el.style.animationDelay = indice * 0.55 + Math.random() * 2.5 + "s";
    var t = 8 + Math.random() * 8;
    el.style.width = t + "px";
    el.style.height = t + "px";
    if (Math.random() > 0.5) {
      el.classList.add("petal--rosa");
    }
    petalsLayer.appendChild(el);
  }

  function atualizarBotaoSom() {
    if (!audio || !btnSom) return;
    var tocando = !audio.paused && !audio.ended;
    var silenciado = audio.muted;
    btnSom.classList.toggle("playing", tocando && !silenciado);
  }

  function mostrarConvite() {
    paginaInicial.hidden = true;
    paginaInicial.classList.remove("pagina--ativa");
    paginaConvite.hidden = false;
    paginaConvite.classList.add("pagina--ativa");
    paginaInicial.setAttribute("aria-hidden", "true");
    paginaConvite.removeAttribute("aria-hidden");

    if (cartaoConvite) {
      requestAnimationFrame(function () {
        cartaoConvite.classList.add("cartao--visivel");
      });
    }

    var titulo = paginaConvite.querySelector(".titulo-manuscrito");
    if (titulo) {
      titulo.focus();
    }
  }

  function tocarMusica() {
    if (!audio) return;
    var promessa = audio.play();
    if (promessa !== undefined) {
      promessa
        .then(function () {
          atualizarBotaoSom();
        })
        .catch(function () {});
    }
  }

  function aoAbrirConvite() {
    if (!envelope.classList.contains("is-opening")) {
      explosaoFloral(envelope);
      envelope.classList.add("is-opening");
      btnAbrir.disabled = true;
    }
    tocarMusica();
    window.setTimeout(function () {
      mostrarConvite();
    }, animacaoAberturaMs);
  }

  function alternarSom() {
    if (!audio || !btnSom) return;
    audio.muted = !audio.muted;
    var silenciado = audio.muted;
    btnSom.classList.toggle("muted", silenciado);
    btnSom.setAttribute("aria-pressed", silenciado ? "false" : "true");
    btnSom.setAttribute(
      "aria-label",
      silenciado ? "Ligar som" : "Desligar som",
    );
    btnSom.setAttribute("title", silenciado ? "Som desligado" : "Som ligado");
    if (!silenciado && audio.paused) {
      tocarMusica();
    } else {
      atualizarBotaoSom();
    }
  }

  configurarWhatsapp();
  iniciarParallax();

  if (btnAbrir) {
    btnAbrir.addEventListener("click", aoAbrirConvite);
  }

  if (btnSom) {
    btnSom.addEventListener("click", alternarSom);
  }

  if (audio && btnSom) {
    btnSom.classList.toggle("muted", audio.muted);
    audio.addEventListener("play", atualizarBotaoSom);
    audio.addEventListener("pause", atualizarBotaoSom);
    audio.addEventListener("ended", atualizarBotaoSom);
  }

  iniciarPetals();
})();
