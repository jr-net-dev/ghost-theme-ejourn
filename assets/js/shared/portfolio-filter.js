(function () {
    var path = window.location.pathname.replace(/\/$/, '') + '/';
    document.querySelectorAll('.gh-filter-pill').forEach(function (pill) {
        if (pill.getAttribute('href') === path) {
            pill.classList.add('gh-filter-active');
        }
    });
})();
