(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealTargets = document.querySelectorAll(
        ".home-section .text > section, #herniMody .herniMod"
    );

    if (!revealTargets.length) return;

    revealTargets.forEach((element) => element.setAttribute("data-reveal", ""));

    if (motionPreference.matches || !("IntersectionObserver" in window)) {
        revealTargets.forEach((element) => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealTargets.forEach((element) => observer.observe(element));
})();
