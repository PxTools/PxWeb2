(function () {
  const WIP_STATUS_TEXT = {
    en: {
      before:
        "Welcome to the new Statbank! We're still fine-tuning things. If something is missing, you can still ",
      linkText: 'access the old version',
    },
    no: {
      before:
        'Velkommen til nye Statistikkbanken! Vi jobber med de siste detaljene. Skulle du savne noe, kan du fortsatt ',
      linkText: 'bruke den gamle løsningen',
    },
  };

  function checkLanguage() {
    const url = new URL(globalThis.location.href);
    if (url.pathname.includes('/en/')) {
      return 'en';
    } else {
      return 'no';
    }
  }
  /**
   * Fires update() on initial load and on every SPA navigation:
   * - history.pushState / replaceState (programmatic navigation)
   * - popstate (back/forward)
   */
  function computeTransformedUrl() {
    const url = new URL(globalThis.location.href);
    const newUrl = url.pathname.replace('/statbank', '/statbank1');
    return newUrl.toString();
  }
  // ---------------------------------------------
  // Track last language to detect language changes
  // ---------------------------------------------
  let lastLang = null;

  function update() {
    const bodyLong = document.querySelector(
      '#wip-status-message div[class*="bodylong"]',
    );
    if (!bodyLong) {
      return;
    }

    const language = checkLanguage();
    const content = WIP_STATUS_TEXT[language] || WIP_STATUS_TEXT.no;
    const before = document.createTextNode(content.before);
    const newUrl = computeTransformedUrl();
    const linkId = 'myLink';

    const link = document.createElement('a');
    link.id = linkId;
    link.className = 'oldLinkClass';
    link.href = newUrl;
    link.textContent = content.linkText;
    link.target = '_blank'; // open in new tab
    link.rel = 'noopener noreferrer'; // safe when target=_blank

    const after = document.createTextNode('.');
    bodyLong.textContent = '';

    bodyLong.appendChild(before);
    bodyLong.appendChild(link);
    bodyLong.appendChild(after);
    // ---------------------------------------------
    // Cookie Banner Language Sync
    // ---------------------------------------------
    if (language !== lastLang) {
      // Language changed => reinitialize banner content
      const content = bannerContent[language];
      initCookieConsent(content);
      lastLang = language;
    }
  }

  function scheduleUpdate() {
    update();
    requestAnimationFrame(update);
    setTimeout(update, 400);
  }

  // Patch pushState / replaceState to emit a custom event
  ['pushState', 'replaceState'].forEach((method) => {
    const original = history[method];
    history[method] = function () {
      const ret = original.apply(this, arguments);
      globalThis.dispatchEvent(new Event('rr-nav')); // custom event for SPA navigation
      return ret;
    };
  });

  // --- Persistent link binder setup ---
  let boundResetLink = null;

  function onResetConsentClick(e) {
    e.preventDefault();
    if (typeof resetCookieConsent === 'function') {
      resetCookieConsent();
    }
  }

  function bindResetConsentLink() {
    const language = checkLanguage();
    const link = document.querySelector(
      `a[href$="change-cookie-consent-${language}"]`,
    );

    if (boundResetLink && !boundResetLink.isConnected) {
      boundResetLink = null;
    }

    if (link && link !== boundResetLink) {
      boundResetLink = link;
      link.addEventListener('click', onResetConsentClick);
    }

    if (!link) {
      boundResetLink = null;
    }
  }

  // --- No observer: rebind on known lifecycle/navigation points ---
  function scheduleBindResetConsentLink() {
    // immediate attempt
    bindResetConsentLink();
    // after paint (for SPA updates that render slightly later)
    requestAnimationFrame(bindResetConsentLink);
    // delayed fallback (for async content loading)
    setTimeout(bindResetConsentLink, 600);
  }

  function onNavigationUpdate() {
    scheduleBindResetConsentLink();
    scheduleUpdate();
  }

  // --- Bind on initial DOM load ---
  document.addEventListener('DOMContentLoaded', () => {
    scheduleBindResetConsentLink();
    scheduleUpdate();
  });

  // --- Bind on SPA navigation & back/forward ---
  globalThis.addEventListener('rr-nav', onNavigationUpdate);

  globalThis.addEventListener('popstate', onNavigationUpdate);
})();
