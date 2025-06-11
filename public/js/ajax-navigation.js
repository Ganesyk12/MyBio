document.querySelectorAll('a[data-ajax-nav]').forEach(link => {
    link.addEventListener('click', async (e) => {
        e.preventDefault();
        const url = link.getAttribute('href');

        try {
            const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (!res.ok) throw new Error('Failed to load page');
            const html = await res.text();
            document.querySelector('main').innerHTML = html;

            // Optional: update title jika mau
            document.title = link.textContent + ' | Portfolio Ganes';

            // Optional: update active nav
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
        } catch (err) {
            console.error(err);
            document.querySelector('main').innerHTML = '<p>Failed to load page.</p>';
        }
    });
});
