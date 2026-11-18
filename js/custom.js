/* =====================================================================
   MARLEIGH / Wedding Invitation & RSVP HTML Template
   File     : js/custom.js
   Version  : 1.0.0
   Updated  : 2 September 2026
   Author   : rix_designs
   Depends  : nothing. Vanilla ES2020, no jQuery, no external library.

   ---------------------------------------------------------------------
   TABLE OF CONTENTS
   ---------------------------------------------------------------------
   01. Helpers and shared state
   02. Opening curtain
   03. Sticky bar, reading progress
   04. Section spy (navigation highlighting)
   05. Menu sheet
   06. Countdown to the ceremony
   07. Reveal on scroll
   08. Story timeline progress
   09. Draggable tracks: party and voices
   10. Gallery viewer with keys and swipe
   12. Save the date file, built in the browser
   13. Small odds and ends
   ===================================================================== */

(function () {
  'use strict';

  /* ===================================================================
     01. HELPERS AND SHARED STATE
     =================================================================== */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Respect the operating system setting for reduced motion.
  const calmMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The moment everything counts down to: Saturday 19 December 2026 in
  // Buea (UTC+1, no daylight saving), counting to the 1:30 pm white
  // wedding. Keep php/calendar.php and
  // calendarFile() below in step with it.
  const CEREMONY = new Date('2026-12-19T13:30:00+01:00');

  // Small throttle built on requestAnimationFrame for scroll handlers.
  function onFrame(fn) {
    let ticking = false;
    return function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { fn(); ticking = false; });
    };
  }

  /* ===================================================================
     02. OPENING CURTAIN
     Lifts once the page has painted, then leaves the document.
     =================================================================== */
  function openCurtain() {
    const curtain = $('#curtain');
    document.body.classList.remove('is-loading');
    if (!curtain) return;
    curtain.classList.add('is-open');
    window.setTimeout(() => curtain.remove(), calmMotion ? 60 : 1600);
  }
  window.addEventListener('load', () => window.setTimeout(openCurtain, calmMotion ? 0 : 520));
  // Safety net in case the load event never fires.
  window.setTimeout(openCurtain, 4000);

  /* ===================================================================
     03. STICKY BAR AND READING PROGRESS
     The bar is sticky in CSS. This only swaps it into its compact state
     and draws the progress hairline along its lower edge.
     =================================================================== */
  const bar = $('#bar');
  const barProgress = $('#barProgress');

  const handleScroll = onFrame(function () {
    const y = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(y / max, 1) : 0;

    if (bar) bar.classList.toggle('is-stuck', y > 70);
    if (barProgress) barProgress.style.width = (pct * 100).toFixed(2) + '%';
  });

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll);
  handleScroll();

  /* ===================================================================
     04. SECTION SPY
     One observer keeps the gold dot under whichever section fills the
     middle of the screen.
     =================================================================== */
  const navLinks = $$('[data-nav]');
  const watched  = $$('main section[id], #countdown');

  if ('IntersectionObserver' in window && watched.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + id));
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    watched.forEach(sec => spy.observe(sec));
  }

  /* ===================================================================
     05. MENU SHEET
     Opens with a circular wipe from the burger corner, staggers the
     links, closes on Escape, on a link tap and on resize to desktop.
     =================================================================== */
  const burger = $('#burger');
  const sheet  = $('#sheet');

  function setSheet(open) {
    if (!sheet || !burger) return;

    if (open) sheet.hidden = false;
    // A frame of delay lets the browser apply the starting state first.
    requestAnimationFrame(() => {
      sheet.classList.toggle('is-open', open);
      burger.classList.toggle('is-on', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
    });

    // Stagger each entry so the list assembles instead of appearing.
    $$('[data-sheet-link]', sheet).forEach((a, i) => {
      a.style.transitionDelay = open ? (0.16 + i * 0.05) + 's' : '0s';
    });

    if (!open) window.setTimeout(() => { sheet.hidden = true; }, 900);
  }

  if (burger) burger.addEventListener('click', () => setSheet(sheet.hidden));
  $$('[data-sheet-link]').forEach(a => a.addEventListener('click', () => setSheet(false)));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setSheet(false); });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && sheet && !sheet.hidden) setSheet(false);
  });

  /* ===================================================================
     06. COUNTDOWN
     Only the digits that actually changed are repainted, so the tick
     animation fires once per real change.
     =================================================================== */
  const cdCells = {
    days:    $('[data-cd="days"]'),
    hours:   $('[data-cd="hours"]'),
    minutes: $('[data-cd="minutes"]'),
    seconds: $('[data-cd="seconds"]')
  };

  const pad = (n, len) => String(Math.max(n, 0)).padStart(len, '0');

  function paintCell(cell, value) {
    if (!cell || cell.textContent === value) return;
    cell.textContent = value;
    if (calmMotion) return;
    cell.classList.remove('is-tick');
    void cell.offsetWidth;          // force a reflow so the animation restarts
    cell.classList.add('is-tick');
  }

  function tickCountdown() {
    const gap = CEREMONY.getTime() - Date.now();

    if (gap <= 0) {
      paintCell(cdCells.days, '0');
      paintCell(cdCells.hours, '00');
      paintCell(cdCells.minutes, '00');
      paintCell(cdCells.seconds, '00');
      return;
    }

    const s = Math.floor(gap / 1000);
    paintCell(cdCells.days,    String(Math.floor(s / 86400)));
    paintCell(cdCells.hours,   pad(Math.floor(s / 3600) % 24, 2));
    paintCell(cdCells.minutes, pad(Math.floor(s / 60) % 60, 2));
    paintCell(cdCells.seconds, pad(s % 60, 2));
  }

  if (cdCells.days) { tickCountdown(); window.setInterval(tickCountdown, 1000); }

  /* ===================================================================
     07. REVEAL ON SCROLL
     =================================================================== */
  const revealables = $$('[data-reveal]');
  if ('IntersectionObserver' in window && revealables.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add('is-in'));
  }

  /* ===================================================================
     08. STORY TIMELINE PROGRESS
     The gold hairline fills as the list travels up the viewport, and
     each medallion lights when its row reaches the middle.
     =================================================================== */
  const railList = $('#railList');
  const railFill = $('#railFill');
  const storyRows = $$('.row-story');

  const paintRail = onFrame(function () {
    if (!railList || !railFill) return;
    const box = railList.getBoundingClientRect();
    const middle = window.innerHeight * 0.55;
    const done = Math.min(Math.max((middle - box.top) / box.height, 0), 1);
    railFill.style.height = (done * 100).toFixed(2) + '%';

    storyRows.forEach(row => {
      const r = row.getBoundingClientRect();
      row.classList.toggle('is-in', r.top < middle && r.bottom > 0);
    });
  });

  if (railList) {
    window.addEventListener('scroll', paintRail, { passive: true });
    window.addEventListener('resize', paintRail);
    paintRail();
  }

  /* ===================================================================
     09. DRAGGABLE TRACKS
     Used by the wedding party row and the quotes row. Mouse drag,
     finger swipe, arrow buttons, dots and the keyboard all move the
     same scroll position, and vertical scrolling is left to the
     browser.
     =================================================================== */
  function buildDragger(node) {
    const name  = node.dataset.dragger;
    const track = $('.dragger__track', node);
    if (!track) return;

    let down = false, startX = 0, startLeft = 0, moved = 0;

    node.addEventListener('pointerdown', e => {
      // Fingers already get native momentum scrolling, so only the
      // mouse needs the manual drag. Mixing both doubles the speed.
      if (e.pointerType === 'touch') return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      down = true; moved = 0;
      startX = e.clientX;
      startLeft = node.scrollLeft;
      node.classList.add('is-grabbing');
    });

    node.addEventListener('pointermove', e => {
      if (!down) return;
      const delta = e.clientX - startX;
      moved = Math.abs(delta);
      if (moved > 6) e.preventDefault();
      node.scrollLeft = startLeft - delta;
    });

    function release() {
      if (!down) return;
      down = false;
      node.classList.remove('is-grabbing');
    }
    node.addEventListener('pointerup', release);
    node.addEventListener('pointercancel', release);
    node.addEventListener('pointerleave', release);

    // A finished drag should not also trigger the link underneath.
    node.addEventListener('click', e => {
      if (moved > 8) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    // Step helper shared by the arrows, the dots and the keyboard.
    function step(dir) {
      const card = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap || '30') || 30;
      const size = card ? card.getBoundingClientRect().width + gap : 330;
      node.scrollBy({ left: dir * size, behavior: calmMotion ? 'auto' : 'smooth' });
    }

    $$('[data-drag="' + name + '"]').forEach(btn => {
      btn.addEventListener('click', () => step(parseInt(btn.dataset.dir, 10)));
    });

    node.setAttribute('tabindex', '0');
    node.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); step(-1); }
    });

    // Optional paging rules, one per card.
    const dotsBox = $('[data-dots="' + name + '"]');
    if (dotsBox) {
      const cards = Array.from(track.children);
      cards.forEach((card, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Go to item ' + (i + 1));
        b.addEventListener('click', () => {
          node.scrollTo({
            left: card.offsetLeft - track.offsetLeft,
            behavior: calmMotion ? 'auto' : 'smooth'
          });
        });
        dotsBox.appendChild(b);
      });

      const marks = Array.from(dotsBox.children);
      const syncDots = onFrame(function () {
        let best = 0, gapBest = Infinity;
        cards.forEach((card, i) => {
          const d = Math.abs(card.offsetLeft - track.offsetLeft - node.scrollLeft);
          if (d < gapBest) { gapBest = d; best = i; }
        });
        marks.forEach((m, i) => m.classList.toggle('is-on', i === best));
      });
      node.addEventListener('scroll', syncDots, { passive: true });
      syncDots();
    }

    // ----------------------------------------------------------- autoplay
    if (node.dataset.autoplay === 'on' && !calmMotion) {
      let timer = null;
      let paused = false;

      const advance = () => {
        if (paused) return;
        const end = node.scrollWidth - node.clientWidth - 2;
        if (node.scrollLeft >= end) {
          // Back to the first card, then carry on from there.
          node.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          step(1);
        }
      };

      // A card every two seconds. One was quick enough that a name was
      // gone before it had been read.
      const start = () => { if (!timer) timer = window.setInterval(advance, 2000); };
      const stop  = () => { window.clearInterval(timer); timer = null; };

      // A visitor reading a card always wins over the timer.
      ['pointerenter', 'pointerdown', 'focusin'].forEach(ev =>
        node.addEventListener(ev, () => { paused = true; }));
      ['pointerleave', 'focusout'].forEach(ev =>
        node.addEventListener(ev, () => { paused = false; }));
      node.addEventListener('pointerup', () => {
        window.setTimeout(() => { paused = false; }, 1200);
      });

      // No point animating a row that is off screen.
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
          entries.forEach(entry => (entry.isIntersecting ? start() : stop()));
        }, { threshold: 0.2 }).observe(node);
      } else {
        start();
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop(); else start();
      });
    }

    // Arrow buttons dim when the track reaches either end.
    const arrows = $$('[data-drag="' + name + '"]');
    const syncArrows = onFrame(function () {
      const end = node.scrollWidth - node.clientWidth - 2;
      arrows.forEach(btn => {
        const dir = parseInt(btn.dataset.dir, 10);
        btn.disabled = dir < 0 ? node.scrollLeft <= 2 : node.scrollLeft >= end;
      });
    });
    node.addEventListener('scroll', syncArrows, { passive: true });
    window.addEventListener('resize', syncArrows);
    syncArrows();
  }

  $$('[data-dragger]').forEach(buildDragger);

  /* ===================================================================
     10. GALLERY VIEWER
     Opens on click, moves with the arrow keys or a swipe, closes on
     Escape or a tap on the backdrop, and hands focus back afterwards.
     =================================================================== */
  const lightbox = $('#lightbox');
  const lbImage  = $('#lbImage');
  const lbCap    = $('#lbCaption');
  const frames   = $$('[data-lb]');
  const lbCrop   = $('.lightbox__crop');
  let lbIndex = 0, lbOpener = null;

  // Match the viewer to the tile: same ratio, same crop, larger.
  function shapeStage(btn) {
    if (!lbCrop || !btn) return;
    const box = btn.getBoundingClientRect();
    const ratio = box.height ? box.width / box.height : 1;
    const thumb = btn.querySelector('img');

    lbCrop.style.aspectRatio = ratio;
    lbCrop.style.width = 'min(92vw, ' + (window.innerHeight * 0.78 * ratio).toFixed(0) + 'px)';
    if (thumb) {
      lbImage.style.objectPosition = getComputedStyle(thumb).objectPosition;
    }
  }

  function showFrame(i) {
    if (!frames.length) return;
    lbIndex = (i + frames.length) % frames.length;
    const btn = frames[lbIndex];
    lbImage.style.opacity = '0';
    const next = new Image();
    next.onload = () => {
      lbImage.src = next.src;
      const inner = btn.querySelector('img');
      lbImage.alt = inner ? inner.alt : '';
      lbImage.style.opacity = '1';
    };
    next.src = btn.dataset.lb;
    shapeStage(btn);
    lbCap.textContent = btn.dataset.cap || '';
  }

  function openLightbox(i, opener) {
    if (!lightbox) return;
    lbOpener = opener || null;
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    document.body.classList.add('is-locked');
    showFrame(i);
    const close = $('[data-lb-close]', lightbox);
    if (close) close.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    window.setTimeout(() => { lightbox.hidden = true; }, 320);
    if (lbOpener) lbOpener.focus();
  }

  frames.forEach((btn, i) => btn.addEventListener('click', () => openLightbox(i, btn)));
  // A turned phone changes the tile shape, so the viewer follows it.
  window.addEventListener('resize', () => {
    if (lightbox && !lightbox.hidden) shapeStage(frames[lbIndex]);
  });
  $$('[data-lb-step]').forEach(btn => {
    btn.addEventListener('click', () => showFrame(lbIndex + parseInt(btn.dataset.lbStep, 10)));
  });
  const lbClose = $('[data-lb-close]');
  if (lbClose) lbClose.addEventListener('click', closeLightbox);

  if (lightbox) {
    // A click on the backdrop closes, a click on the photo does not.
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

    window.addEventListener('keydown', e => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showFrame(lbIndex + 1);
      if (e.key === 'ArrowLeft')  showFrame(lbIndex - 1);
    });

    // Swipe support on the stage itself.
    const stage = $('.lightbox__stage', lightbox);
    let swipeX = null;
    stage.addEventListener('pointerdown', e => { swipeX = e.clientX; });
    stage.addEventListener('pointerup', e => {
      if (swipeX === null) return;
      const delta = e.clientX - swipeX;
      if (Math.abs(delta) > 45) showFrame(lbIndex + (delta < 0 ? 1 : -1));
      swipeX = null;
    });
  }


  /* ===================================================================
     12. SAVE THE DATE FILE
     php/calendar.php streams the same file from a server. Opened from
     a folder there is no server to answer, so the browser shows the
     PHP source instead of downloading anything. The file is small and
     entirely predictable, so it is built here as well: the link is
     intercepted, the calendar is assembled in memory and handed to the
     browser as a download. Without scripting the PHP link still works
     on a live host.
     =================================================================== */
  function calendarFile() {
    // A calendar file is line based and the separator is a real
    // carriage return and line feed. Written as escaped text the whole
    // file arrives as one line, the date fails to parse, and the app
    // falls back to whatever it likes. That is what put the wrong day
    // in the calendar.
    const CRLF = String.fromCharCode(13) + String.fromCharCode(10);

    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Yvonne and Henry//Wedding//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',

      // Cameroon is on West Africa Time all year, so one fixed rule.
      'BEGIN:VTIMEZONE',
      'TZID:Africa/Douala',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:+0100',
      'TZOFFSETTO:+0100',
      'TZNAME:WAT',
      'DTSTART:19700101T000000',
      'END:STANDARD',
      'END:VTIMEZONE',

      // White wedding, 1:30 pm to 4:00 pm.
      'BEGIN:VEVENT',
      'UID:yvonne-and-henry-wedding-20261219T133000@wedding.local',
      'DTSTAMP:' + stamp,
      'DTSTART;TZID=Africa/Douala:20261219T133000',
      'DTEND;TZID=Africa/Douala:20261219T160000',
      'SUMMARY:Yvonne and Henry: white wedding',
      'LOCATION:Presbyterian Church Buea Station\\, Buea\\, Cameroon',
      'DESCRIPTION:White wedding of Yvonne and Henry at the Presbyterian Church Buea Station.',
      'END:VEVENT',

      // Reception from 5:00 pm. No end time was given, so none is set.
      'BEGIN:VEVENT',
      'UID:yvonne-and-henry-reception-20261219T170000@wedding.local',
      'DTSTAMP:' + stamp,
      'DTSTART;TZID=Africa/Douala:20261219T170000',
      'SUMMARY:Yvonne and Henry: reception',
      'LOCATION:NASLA Multipurpose Hall\\, Buea\\, Cameroon',
      'DESCRIPTION:Reception for Yvonne and Henry at NASLA Multipurpose Hall.',
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    return lines.join(CRLF) + CRLF;
  }

  $$('a[href$="calendar.php"]').forEach(link => {
    link.addEventListener('click', e => {
      // Nothing to intercept if the browser cannot make a file.
      if (!window.Blob || !window.URL || !URL.createObjectURL) return;
      e.preventDefault();

      const blob = new Blob([calendarFile()], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'yvonne-and-henry.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  });

  /* ===================================================================
     13. SMALL ODDS AND ENDS
     =================================================================== */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Only one schedule panel stays open at a time.
  const slots = $$('.slot');
  slots.forEach(slot => {
    slot.addEventListener('toggle', () => {
      if (!slot.open) return;
      slots.forEach(other => { if (other !== slot) other.open = false; });
    });
  });

})();
