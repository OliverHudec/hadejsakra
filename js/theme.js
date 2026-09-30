(function () {
    const storageKey = "hadejsakra-theme";
    let initialTheme = "light";

    try {
        const savedTheme = localStorage.getItem(storageKey);
        if (savedTheme === "light" || savedTheme === "dark") {
            initialTheme = savedTheme;
        } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            initialTheme = "dark";
        }
    } catch {
        initialTheme = "light";
    }

    function applyTheme(theme, shouldSave) {
        document.documentElement.dataset.theme = theme;

        document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
            const isDark = theme === "dark";
            const label = isDark ? "Světlý režim" : "Tmavý režim";
            const icon = button.querySelector(".theme-toggle-icon");
            const text = button.querySelector(".theme-toggle-label");

            button.setAttribute("aria-label", "Přepnout na " + label.toLowerCase());
            button.setAttribute("aria-pressed", String(isDark));
            button.setAttribute("title", label);

            if (icon) icon.textContent = isDark ? "☼" : "☾";
            if (text) text.textContent = label;
        });

        if (shouldSave) {
            try {
                localStorage.setItem(storageKey, theme);
            } catch {}
        }
    }

    applyTheme(initialTheme, false);

    function attachThemeToggles() {
        applyTheme(document.documentElement.dataset.theme || initialTheme, false);

        document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
            button.addEventListener("click", function () {
                const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
                applyTheme(nextTheme, true);
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", attachThemeToggles, { once: true });
    } else {
        attachThemeToggles();
    }
})();