/**
 * Invitación reel — Ariel & Daiana
 * Intro con sobre, música, countdown, calendario, RSVP, regalo y playlist.
 */

(function () {
  "use strict";

  // --- Configuración editable ---
  /** 24 de octubre 2026, 18:00 (mes 0-indexado: 9 = octubre) */
  const WEDDING_DATE = new Date(2026, 9, 24, 17, 30, 0);

  const GIFT_ALIAS = "boda.ariel.dai";

  /**
   * WhatsApp RSVP: reemplazá el número (código país + número, sin + ni espacios).
   * Ejemplo Argentina: 54911XXXXXXXX
   */
  const RSVP_WHATSAPP = "5493329664805";
  const RSVP_MESSAGE =
    "¡Hola! Confirmo mi asistencia a la boda de Ariel y Daiana el 24/10/2026.";

  const EVENT = {
    title: "Boda Ariel & Daiana",
    details: "Ceremonia y fiesta — La Barra Eventos",
    location: "La Barra Eventos",
    durationHours: 8,
  };

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
  const toggleGiftBtn = document.getElementById("toggleGiftBtn");
  const giftDetails = document.getElementById("giftDetails");

  const songInput = document.getElementById("songInput");
  const addSongBtn = document.getElementById("addSongBtn");
  const playlistList = document.getElementById("playlistList");

  const bgMusic = document.getElementById("bgMusic");
  const musicToggle = document.getElementById("musicToggle");
  const addToCalendarBtn = document.getElementById("addToCalendarBtn");
  const googleCalendarLink = document.getElementById("googleCalendarLink");
  const rsvpBtn = document.getElementById("rsvpBtn");
  const calendarGrid = document.getElementById("calendarGrid");

  let introDone = false;
  let toastTimer = null;
  let musicEnabled = false;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function scaleTiming(ms) {
    return prefersReducedMotion()
      ? Math.max(40, Math.round(ms * TIMING.reducedMultiplier))
      : ms;
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  // --- Música de fondo ---
  function setMusicUi(playing) {
    if (!musicToggle) return;
    musicToggle.hidden = false;
    musicToggle.setAttribute("aria-pressed", playing ? "true" : "false");
    musicToggle.setAttribute(
      "aria-label",
      playing ? "Pausar música" : "Reproducir música"
    );
    musicToggle.classList.toggle("music-toggle--on", playing);
  }

  async function playMusic() {
    if (!bgMusic) return;
    try {
      bgMusic.volume = 0.45;
      await bgMusic.play();
      musicEnabled = true;
      setMusicUi(true);
    } catch {
      musicEnabled = false;
      setMusicUi(false);
    }
  }

  function pauseMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    musicEnabled = false;
    setMusicUi(false);
  }

  function toggleMusic() {
    if (musicEnabled && bgMusic && !bgMusic.paused) {
      pauseMusic();
    } else {
      playMusic();
    }
  }

  if (musicToggle) {
    musicToggle.addEventListener("click", toggleMusic);
  }

  // --- Intro ---
  function startReelExperience() {
    if (introDone) return;
    introDone = true;
    envelope.classList.add("envelope--open");
    playMusic();

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
      if (musicToggle) musicToggle.hidden = false;

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
  function tickCountdown() {
    const now = Date.now();
    const diff = WEDDING_DATE.getTime() - now;

    if (diff <= 0) {
      [cdDays, cdHours, cdMins, cdSecs].forEach((el) => {
        if (el) el.textContent = "00";
      });
      return;
    }

    const sec = Math.floor(diff / 1000) % 60;
    const min = Math.floor(diff / (1000 * 60)) % 60;
    const hour = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (cdDays) cdDays.textContent = day >= 100 ? String(day) : pad2(day);
    if (cdHours) cdHours.textContent = pad2(hour);
    if (cdMins) cdMins.textContent = pad2(min);
    if (cdSecs) cdSecs.textContent = pad2(sec);
  }

  tickCountdown();
  window.setInterval(tickCountdown, 1000);

  // --- Calendario visual (octubre 2026, día 24 marcado) ---
  function buildVisualCalendar() {
    if (!calendarGrid) return;

    const year = 2026;
    const month = 9; // octubre
    const markedDay = 24;
    const first = new Date(year, month, 1);
    // Lunes = 0 … Domingo = 6
    let startOffset = first.getDay() - 1;
    if (startOffset < 0) startOffset = 6;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarGrid.innerHTML = "";

    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement("span");
      empty.className = "visual-calendar__day visual-calendar__day--empty";
      empty.setAttribute("aria-hidden", "true");
      calendarGrid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("span");
      cell.className = "visual-calendar__day";
      cell.textContent = String(day);
      if (day === markedDay) {
        cell.classList.add("visual-calendar__day--marked");
        cell.setAttribute("aria-label", "24 de octubre — día de la boda");
      }
      calendarGrid.appendChild(cell);
    }
  }

  buildVisualCalendar();

  // --- Agendar fecha (.ics + Google Calendar) ---
  function toIcsDate(date) {
    return (
      date.getFullYear() +
      pad2(date.getMonth() + 1) +
      pad2(date.getDate()) +
      "T" +
      pad2(date.getHours()) +
      pad2(date.getMinutes()) +
      pad2(date.getSeconds())
    );
  }

  function toGoogleDate(date) {
    return (
      date.getFullYear() +
      pad2(date.getMonth() + 1) +
      pad2(date.getDate()) +
      "T" +
      pad2(date.getHours()) +
      pad2(date.getMinutes()) +
      pad2(date.getSeconds())
    );
  }

  function buildIcs() {
    const end = new Date(
      WEDDING_DATE.getTime() + EVENT.durationHours * 60 * 60 * 1000
    );
    const stamp = toIcsDate(new Date());
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ariel&Daiana//Invitacion//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:boda-ariel-daiana-20261024@invitation",
      "DTSTAMP:" + stamp,
      "DTSTART:" + toIcsDate(WEDDING_DATE),
      "DTEND:" + toIcsDate(end),
      "SUMMARY:" + EVENT.title,
      "DESCRIPTION:" + EVENT.details,
      "LOCATION:" + EVENT.location,
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    return lines.join("\r\n");
  }

  function downloadIcs() {
    const blob = new Blob([buildIcs()], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "boda-ariel-daiana.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function setupGoogleCalendarLink() {
    if (!googleCalendarLink) return;
    const end = new Date(
      WEDDING_DATE.getTime() + EVENT.durationHours * 60 * 60 * 1000
    );
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: EVENT.title,
      details: EVENT.details,
      location: EVENT.location,
      dates: toGoogleDate(WEDDING_DATE) + "/" + toGoogleDate(end),
    });
    googleCalendarLink.href =
      "https://calendar.google.com/calendar/render?" + params.toString();
  }

  if (addToCalendarBtn) {
    addToCalendarBtn.addEventListener("click", downloadIcs);
  }
  setupGoogleCalendarLink();

  // --- RSVP ---
  if (rsvpBtn) {
    const waUrl =
      "https://wa.me/" +
      RSVP_WHATSAPP +
      "?text=" +
      encodeURIComponent(RSVP_MESSAGE);
    rsvpBtn.href = waUrl;
  }

  // --- Regalo ---
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

  if (toggleGiftBtn && giftDetails) {
    toggleGiftBtn.addEventListener("click", () => {
      const open = giftDetails.classList.toggle("active");
      toggleGiftBtn.textContent = open
        ? "Ocultar datos"
        : "Ver datos para regalo";
      toggleGiftBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // --- Playlist ---
  function loadSongs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data)
        ? data.filter((s) => typeof s === "string")
        : [];
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
      li.textContent = index + 1 + ". " + song;
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

  renderPlaylist(loadSongs());

  if (addSongBtn) addSongBtn.addEventListener("click", addSong);
  if (songInput) {
    songInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addSong();
      }
    });
  }

  // --- Reveal al scroll ---
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
        threshold: 0.28,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        blocks.forEach((el) => io.observe(el));
      });
    });
  }

  if (reel && !reel.hidden) {
    document.body.classList.remove("body--intro");
    if (musicToggle) musicToggle.hidden = false;
    initRevealObservers();
  }
})();
