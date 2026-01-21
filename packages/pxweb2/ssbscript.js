(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const html = `
      <div id="alert-container" class="container oldLinkClass">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          role="img"
          aria-hidden="true"
          class="info-icon"
        >
          <path
            d="M12 21.75C17.3848 21.75 21.75 17.3848 21.75 12C21.75 6.61522 17.3848 2.25 12 2.25C6.61522 2.25 2.25 6.61522 2.25 12C2.25 17.3848 6.61522 21.75 12 21.75ZM11 8C11 7.44771 11.4477 7 12 7C12.5523 7 13 7.44771 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8ZM12 10.25C12.4142 10.25 12.75 10.5858 12.75 11L12.75 16.5C12.75 16.9142 12.4142 17.25 12 17.25C11.5858 17.25 11.25 16.9142 11.25 16.5L11.25 11C11.25 10.5858 11.5858 10.25 12 10.25Z"
            fill="#0179C8"
          />
        </svg>
        <div id="info-text-container">
      </div>
      </div>
    `;

    // Insert at the very start of <body>
    document.body.insertAdjacentHTML('afterbegin', html);
  });

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
    let newUrl;

    if (checkLanguage() === 'en') {
      // Replace it with '/en/statbank/'
      newUrl = url.pathname.replace('/statbank2/en/', '/en/statbank/');
    } else {
      newUrl = url.pathname.replace('/statbank2/', '/statbank/');
    }
    return newUrl.toString();
  }
  function update() {
    const language = checkLanguage();
    const outerContainer = document.getElementById('alert-container');
    if (outerContainer) {
      let mySpan = document.querySelector('span.sr-only');
      if (!mySpan) {
        mySpan = document.createElement('span');
      }
      mySpan.textContent = language === 'en' ? 'Information' : 'Informasjon';
      mySpan.classList.add('sr-only');
      outerContainer.prepend(mySpan);
    } else {
      return;
    }

    const container = document.getElementById('info-text-container');
    let before;
    let mytext;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    if (language === 'en') {
      before = document.createTextNode(
        "Welcome to the new Statbank! We're still fine-tuning things. " +
          'If something is missing, you can still ',
      );
      mytext = 'access the old version';
    } else {
      before = document.createTextNode(
        'Velkommen til nye Statistikkbanken! Vi jobber med de siste detaljene. ' +
          'Skulle du savne noe, kan du fortsatt ',
      );
      mytext = 'bruke den gamle løsningen';
    }
    const newUrl = computeTransformedUrl();
    const linkId = 'myLink';

    const link = document.createElement('a');
    link.id = linkId;
    link.className = 'oldLinkClass';
    link.href = newUrl;
    link.textContent = mytext; // Safe text assignment
    link.target = '_blank'; // open in new tab
    link.rel = 'noopener noreferrer'; // safe when target=_blank

    const after = document.createTextNode('.');

    // Sørg for at alt ligger i samme linje (standard inline flow):
    container.appendChild(before);
    container.appendChild(link);
    container.appendChild(after);
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

  // Listen for both our custom event and browser back/forward
  globalThis.addEventListener('rr-nav', update);
  globalThis.addEventListener('popstate', update);

  // Initial run after DOM is ready
  document.addEventListener('DOMContentLoaded', update);
})();
