(function () {
  'use strict';

  var NAV_ID = 'hnd-right-nav';
  var HEADING_SELECTOR = 'h2, h3, h4';
  var MIN_HEADINGS = 2;

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function ensureStylesheet() {
    var href = 'right-nav.css';
    var existing = Array.prototype.slice.call(document.querySelectorAll('link[rel="stylesheet"]'))
      .some(function (link) {
        return (link.getAttribute('href') || '').indexOf(href) !== -1;
      });

    if (!existing) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }

  function guessContentRoot() {
    var selectors = [
      '#topic-content',
      '#topic_content',
      '.topic-content',
      '.topic_content',
      '.page-content',
      '.main-content',
      'article',
      'main'
    ];

    for (var i = 0; i < selectors.length; i++) {
      var node = document.querySelector(selectors[i]);
      if (node && node.querySelector(HEADING_SELECTOR)) {
        return node;
      }
    }

    var candidates = Array.prototype.slice.call(document.body.querySelectorAll('div, section'));
    var best = null;
    var bestCount = 0;

    candidates.forEach(function (candidate) {
      if (candidate.closest('#' + NAV_ID)) return;
      if (candidate.matches && (candidate.matches('nav') || candidate.matches('aside'))) return;
      var count = candidate.querySelectorAll(HEADING_SELECTOR).length;
      var textLength = (candidate.innerText || '').trim().length;
      if (count > bestCount && textLength > 300) {
        best = candidate;
        bestCount = count;
      }
    });

    return best || document.body;
  }

  function getHeadings(root) {
    var headings = Array.prototype.slice.call(root.querySelectorAll(HEADING_SELECTOR))
      .filter(function (heading) {
        var text = (heading.textContent || '').trim();
        if (!text) return false;
        if (heading.closest && heading.closest('#' + NAV_ID)) return false;
        return true;
      });

    headings.forEach(function (heading, index) {
      if (!heading.id) {
        heading.id = 'section-' + slugify(heading.textContent) + '-' + (index + 1);
      }
      heading.setAttribute('data-hnd-rnav-heading', '1');
    });

    return headings;
  }

  function ensureNav() {
    var nav = document.getElementById(NAV_ID);
    if (!nav) {
      nav = document.createElement('aside');
      nav.id = NAV_ID;
      nav.innerHTML = '<div class="hnd-rnav-title">On this page</div><ul class="hnd-rnav-list"></ul>';
      document.body.appendChild(nav);
    }
    return nav;
  }

  function buildNav(nav, headings) {
    var list = nav.querySelector('.hnd-rnav-list');
    list.innerHTML = '';

    headings.forEach(function (heading) {
      var level = parseInt((heading.tagName || 'H2').replace('H', ''), 10) || 2;
      var li = document.createElement('li');
      li.className = 'hnd-rnav-item level-' + level;

      var a = document.createElement('a');
      a.className = 'hnd-rnav-link';
      a.href = '#' + heading.id;
      a.textContent = heading.textContent.trim();
      a.setAttribute('data-target-id', heading.id);
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function updateActiveHeading() {
    var headings = Array.prototype.slice.call(document.querySelectorAll('[data-hnd-rnav-heading="1"]'));
    var links = Array.prototype.slice.call(document.querySelectorAll('#' + NAV_ID + ' .hnd-rnav-link'));
    if (!headings.length || !links.length) return;

    var current = headings[0];
    headings.forEach(function (heading) {
      var rect = heading.getBoundingClientRect();
      if (rect.top <= 140) {
        current = heading;
      }
    });

    links.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('data-target-id') === current.id);
    });
  }

  function applyVisibility(nav, headings) {
    var show = headings.length >= MIN_HEADINGS;
    nav.classList.toggle('is-hidden', !show);
    document.body.classList.toggle('hnd-has-right-nav', show);
  }

  function initializeRightNav() {
    ensureStylesheet();

    var root = guessContentRoot();
    var headings = getHeadings(root);
    var nav = ensureNav();

    buildNav(nav, headings);
    applyVisibility(nav, headings);
    updateActiveHeading();
  }

  var scrollHandlerBound = false;
  function bindScrollHandler() {
    if (scrollHandlerBound) return;
    scrollHandlerBound = true;
    window.addEventListener('scroll', updateActiveHeading, { passive: true });
  }

  function scheduleInit() {
    window.setTimeout(function () {
      initializeRightNav();
      bindScrollHandler();
    }, 80);
  }

  document.addEventListener('DOMContentLoaded', scheduleInit);

  if (window.app && window.app.EVENTS) {
    var previous = window.app.EVENTS.onTopicChanged;
    window.app.EVENTS.onTopicChanged = function (sUrl) {
      if (typeof previous === 'function') {
        try {
          previous(sUrl);
        } catch (err) {
          console.warn('Previous HelpNDoc onTopicChanged handler failed:', err);
        }
      }
      scheduleInit();
    };
  }
})();
