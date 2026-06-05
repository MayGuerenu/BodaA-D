/**
 * Invitación reel — Ariel & Daiana
 * Intro con sobre, transición cinematográfica, secciones full-screen,
 * cuenta regresiva, regalo, playlist en localStorage.
 * Sin frameworks.
 */

(function () {
  "use strict";

  // --- Configuración editable ---
  /** Fecha y hora del evento (recepción) — hora local del navegador */
  const WEDDING_DATE = new Date(2026, 10, 24, 18, 0, 0);

  /** Alias para transferencias */
  const GIFT_ALIAS = "alias.boda.ejemplo";

  /**
   * URL opcional para “Sugerir canción” (Google Form, Spotify colaborativa, etc.).
   * Dejala vacía ("") para ocultar el enlace.
   */
  const SUGGEST_SONG_FORM_URL = "";

  /** Tiempos de secuencia intro → reel (ms) */
  const TIMING = {
    letterPause: 2100,
    exitFade: 1250,
    reducedMultiplier: 0.08,
  };

  const STORAGE_KEY = "ariel-daiana-playlist-v1";

  const intro = document.getElementById("intro");
  const reel = document.getElementById("reel");
  const envelopeBtn = document.getElementById("envelopeBtn");
  const envelope = document.getElementById("envelope");

  const cdDays = document.getElementById("cd-days");
  const cdHours = document.getElementById("cd-hours");
  const cdMins = document.getElementById("cd-mins");
  const cdSecs = document.getElementById("cd-secs");

  const aliasValueEl = document.getElementById("aliasValue");
  const copyAliasBtn = document.getElementById("copyAliasBtn");
  const copyToast = document.getElementById("copyToast");

  const songInput = document.getElementById("songInput");
  const addSongBtn = document.getElementById("addSongBtn");
  const playlistList = document.getElementById("playlistList");
  const suggestSongLink = document.getElementById("suggestSongLink");

  let introDone = false;
  let toastTimer = null;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function scaleTiming(ms) {
    return prefersReducedMotion() ? Math.max(40, Math.round(ms * TIMING.reducedMultiplier)) : ms;
  }

  // --- Intro: abrir sobre → salida cinematográfica → reel ---
  function startReelExperience() {
    if (introDone) return;
    introDone = true;
    envelope.classList.add("envelope--open");

    const waitLetter = scaleTiming(TIMING.letterPause);
    const waitExit = scaleTiming(TIMING.exitFade);

    window.setTimeout(() => {
      intro.classList.add("intro--exit");
    }, waitLetter);

    window.setTimeout(() => {
      intro.classList.add("intro--gone");
      intro.setAttribute("aria-hidden", "true");
      reel.hidden = false;
      reel.setAttribute("aria-hidden", "false");
      document.body.classList.remove("body--intro");
      envelopeBtn.setAttribute("tabindex", "-1");

      window.scrollTo(0, 0);
      initRevealObservers();
    }, waitLetter + waitExit);
  }

  if (envelopeBtn && envelope) {
    envelopeBtn.addEventListener("click", startReelExperience);
    envelopeBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        startReelExperience();
      }
    });
  }

  // --- Cuenta regresiva ---
  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function tickCountdown() {
    const now = new Date().getTime();
    let diff = WEDDING_DATE.getTime() - now;

    if (diff <= 0) {
      ["cd-days", "cd-hours", "cd-mins", "cd-secs"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = "00";
      });
      return;
    }

    const sec = Math.floor(diff / 1000) % 60;
    const min = Math.floor(diff / (1000 * 60)) % 60;
    const hour = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));

    cdDays.textContent = day >= 100 ? String(day) : pad2(day);
    cdHours.textContent = pad2(hour);
    cdMins.textContent = pad2(min);
    cdSecs.textContent = pad2(sec);
  }

  tickCountdown();
  window.setInterval(tickCountdown, 1000);

  // --- Copiar alias ---
  if (aliasValueEl) aliasValueEl.textContent = GIFT_ALIAS;

  async function copyAlias() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(GIFT_ALIAS);
      } else {
        fallbackCopy(GIFT_ALIAS);
      }
      showToast();
    } catch {
      fallbackCopy(GIFT_ALIAS);
      showToast();
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
      /* vacío */
    }
    document.body.removeChild(ta);
  }

  function showToast() {
    if (!copyToast) return;
    copyToast.hidden = false;
    copyToast.textContent = "Alias copiado ✔";
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      copyToast.hidden = true;
    }, 2800);
  }

  if (copyAliasBtn) copyAliasBtn.addEventListener("click", copyAlias);

  // --- Playlist (localStorage) ---
  function loadSongs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data.filter((s) => typeof s === "string") : [];
    } catch {
      return [];
    }
  }

  function saveSongs(songs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
    } catch {
      /* almacenamiento lleno o modo privado */
    }
  }

  function renderPlaylist(songs) {
    if (!playlistList) return;
    playlistList.innerHTML = "";
    songs.forEach((song, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${song}`;
      playlistList.appendChild(li);
    });
  }

  function addSong() {
    if (!songInput || !playlistList) return;
    const value = songInput.value.trim();
    if (!value) {
      songInput.focus();
      return;
    }
    const songs = loadSongs();
    songs.push(value);
    saveSongs(songs);
    renderPlaylist(songs);
    songInput.value = "";
    songInput.focus();
  }

  let songsCache = loadSongs();
  renderPlaylist(songsCache);

  if (addSongBtn) addSongBtn.addEventListener("click", addSong);
  if (songInput) {
    songInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addSong();
      }
    });
  }

  // Enlace opcional “Sugerir canción”
  if (suggestSongLink) {
    if (SUGGEST_SONG_FORM_URL) {
      suggestSongLink.href = SUGGEST_SONG_FORM_URL;
    } else {
      suggestSongLink.hidden = true;
    }
  }

  // --- Intersection Observer: animaciones al scroll (reel) ---
  let revealObserved = false;

  function initRevealObservers() {
    if (revealObserved) return;
    revealObserved = true;

    const blocks = document.querySelectorAll("[data-reveal]");
    if (!blocks.length || !("IntersectionObserver" in window)) {
      blocks.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        blocks.forEach((el) => io.observe(el));
      });
    });
  }

  // Si el usuario recarga estando en el reel (sin intro), habilitar observadores
  if (reel && !reel.hidden) {
    document.body.classList.remove("body--intro");
    initRevealObservers();
  }
})();

 //Boton regalo
const toggleBtn = document.getElementById("toggleGiftBtn");
const giftDetails = document.getElementById("giftDetails");

toggleBtn.addEventListener("click", () => {
  giftDetails.classList.toggle("active");

  if (giftDetails.classList.contains("active")) {
    toggleBtn.textContent = "Ocultar datos";
  } else {
    toggleBtn.textContent = "Ver datos para regalo";
  }
});

const input = document.getElementById("songInput");
const button = document.getElementById("addSongBtn");
const list = document.getElementById("playlistList");

button.addEventListener("click", () => {
  const value = input.value.trim();

  if (value === "") return;

  const li = document.createElement("li");
  li.textContent = value;

  list.appendChild(li);

  input.value = "";
});