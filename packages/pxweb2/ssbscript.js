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

  // document.addEventListener('DOMContentLoaded', function () {
  //   const html = `
  //     <div id="alert-container" class="container oldLinkClass">
  //       <svg
  //         xmlns="http://www.w3.org/2000/svg"
  //         viewBox="0 0 24 24"
  //         width="24"
  //         height="24"
  //         role="img"
  //         aria-hidden="true"
  //         class="info-icon"
  //       >
  //         <path
  //           d="M12 21.75C17.3848 21.75 21.75 17.3848 21.75 12C21.75 6.61522 17.3848 2.25 12 2.25C6.61522 2.25 2.25 6.61522 2.25 12C2.25 17.3848 6.61522 21.75 12 21.75ZM11 8C11 7.44771 11.4477 7 12 7C12.5523 7 13 7.44771 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8ZM12 10.25C12.4142 10.25 12.75 10.5858 12.75 11L12.75 16.5C12.75 16.9142 12.4142 17.25 12 17.25C11.5858 17.25 11.25 16.9142 11.25 16.5L11.25 11C11.25 10.5858 11.5858 10.25 12 10.25Z"
  //           fill="#0179C8"
  //         />
  //       </svg>
  //       <div id="info-text-container">
  //     </div>
  //     </div>
  //   `;

  //   // Insert at the very start of <body>
  //   document.body.insertAdjacentHTML('afterbegin', html);
  // });

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
