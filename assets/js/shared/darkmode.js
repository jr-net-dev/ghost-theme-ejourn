(function () {
    var toggles = document.querySelectorAll('.gh-darkmode-input');
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    toggles.forEach(function (t) {
        t.checked = isDark;
    });

    toggles.forEach(function (toggle) {
        toggle.addEventListener('change', function () {
            var theme = this.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            toggles.forEach(function (t) {
                t.checked = theme === 'dark';
            });
        });
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem('theme')) {
            var theme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            toggles.forEach(function (t) {
                t.checked = theme === 'dark';
            });
        }
    });
})();
