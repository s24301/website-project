document.addEventListener('DOMContentLoaded', () => {
  function loadPage(page, push = true) {
    const contentEl = document.getElementById('content');
    
    if (contentEl.dataset.page === page) return; // no loading again
  
    fetch(page)
      .then(res => {
        if (!res.ok) throw new Error(`Could not load ${page}`);
        return res.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const contentDiv = doc.querySelector('[data-css]');
        const cssPath = contentDiv?.getAttribute('data-css');

        window.scrollTo({ top: 0, behavior: 'auto' }); // set scroll to the top of the page
  
        contentEl.innerHTML = contentDiv?.outerHTML || html;
        contentEl.dataset.page = page;
  
        // styles
        const oldStyle = document.getElementById('custom-style');
        if (oldStyle) oldStyle.remove();
  
        if (cssPath) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = cssPath;
          link.id = 'custom-style';
          document.head.appendChild(link);
        }
  
        if (push && window.location.search !== `?page=${encodeURIComponent(page)}`) {
          history.pushState({ page }, '', `?page=${encodeURIComponent(page)}`);
        }
      })
      .catch(err => {
        console.error(err);
        contentEl.innerHTML = "<p>Error loading page.</p>";
      });

      if (push) {
        const newUrl = page === 'pages/Home.html' ? window.location.pathname : `?page=${encodeURIComponent(page)}`;
        history.pushState({ page }, '', newUrl);
      }
  }

  // "Lists" – scroll down to section
  const listsLink = document.getElementById('lists-link');
  if (listsLink) {
    listsLink.addEventListener('click', e => {
      const currentPage = document.getElementById('content')?.dataset.page;
      if (currentPage === 'pages/Home.html') {
        e.preventDefault();
        document.querySelector('#lists')?.scrollIntoView({ behavior: 'smooth' });
      }
      // if Home.html not loaded → only dropdown
    });
  }

  // "About"
  const aboutLink = document.getElementById('about-link');
  if (aboutLink) {
    aboutLink.addEventListener('click', e => {
      e.preventDefault();
      const currentPage = document.getElementById('content')?.dataset.page;

      if (currentPage === 'pages/Home.html') {
        // Home → scroll down to section
        document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        // if Home.html not loaded → load Home and scroll to section
        loadPage('pages/Home.html', true);

        const tryScroll = () => {
          const aboutSection = document.querySelector('#about');
          if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth' });
          } else {
            // try again after 100 ms
            setTimeout(tryScroll, 100);
          }
        };

        setTimeout(tryScroll, 400); // wait for DOM load
      }
    });
  }

  // dropdown menu (each list has own site)
  document.querySelectorAll('.dropdown-menu a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const listName = link.dataset.list;
      if (listName) {
        loadPage(`pages/lists/${listName}.html`);
      }
    });
  });

  // choosing lists (Home.html)
  document.addEventListener('click', e => {
    const item = e.target.closest('.list-item');
    if (item && item.id?.startsWith('list-')) {
      const listName = item.id.replace('list-', '');
      loadPage(`pages/lists/${listName}.html`);
    }
  });

  // navigation
  document.querySelectorAll('a.nav-item').forEach(link => {
    link.addEventListener('click', e => {
      const page = link.getAttribute('data-page');

      if (page) {
        e.preventDefault();
        loadPage(page);
      }
      // if no data-page set default
    });
  });

  // history (back and forward buttons)
  window.addEventListener('popstate', e => {
    const page = e.state?.page;
    if (page) {
      loadPage(page, false);
    }
  });

  // if ?page= in URL, load it
  const params = new URLSearchParams(window.location.search);
  const initialPage = params.get('page');

  if (initialPage) {
    loadPage(initialPage, false);
  } else {
    loadPage('pages/Home.html', false); // ← default
  }
});
