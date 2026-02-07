// Function to load page content
async function loadPage(url, push = true) {
    try {
        const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        if (!res.ok) throw new Error('Failed to load page');
        const html = await res.text();
        document.querySelector('main').innerHTML = html;

        // Update URL
        if (push) {
            history.pushState(null, null, url);
        }

        // Update active nav
        document.querySelectorAll('nav a').forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === url) {
                a.classList.add('active');
            }
        });

        // Scroll to top
        window.scrollTo(0, 0);

        // Re-init AOS if needed
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }

    } catch (err) {
        console.error(err);
        window.location.href = url; // Fallback to normal navigation
    }
}

document.querySelectorAll('a[data-ajax-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const url = link.getAttribute('href');
        loadPage(url);
    });
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    loadPage(window.location.pathname, false);
});
