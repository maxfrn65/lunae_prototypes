(() => {
    const screens = document.querySelectorAll('[data-screen]');
    const navItems = document.querySelectorAll('.flow-nav__item');
    const resetBtn = document.getElementById('resetBtn');
    const FIRST = 'slide-1';

    // On mobile, the sidebar is hidden entirely on the onboarding (linear flow,
    // no debug nav). Kept for desktop only — see styles.css.

    const showScreen = (id) => {
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;

        screens.forEach((s) => s.classList.remove('is-active'));
        target.classList.add('is-active');

        navItems.forEach((item) => {
            item.classList.toggle('is-active', item.dataset.goto === id);
        });

        const activeNavItem = document.querySelector(`.flow-nav__item[data-goto="${id}"]`);
        if (activeNavItem) {
            activeNavItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }

        target.querySelectorAll('.screen__body, .app').forEach((el) => { el.scrollTop = 0; });
    };

    document.addEventListener('click', (event) => {
        const nextBtn = event.target.closest('[data-next]');
        if (nextBtn) {
            event.preventDefault();
            showScreen(nextBtn.dataset.next);
            return;
        }

        const navBtn = event.target.closest('.flow-nav__item');
        if (navBtn) {
            event.preventDefault();
            showScreen(navBtn.dataset.goto);
        }
    });

    resetBtn?.addEventListener('click', () => showScreen(FIRST));

    document.querySelectorAll('.otp__digit').forEach((input, idx, all) => {
        input.addEventListener('input', () => {
            if (input.value && idx < all.length - 1) {
                all[idx + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && idx > 0) {
                all[idx - 1].focus();
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        const active = document.querySelector('.screen.is-active');
        if (!active) return;
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

        const order = Array.from(navItems).map((i) => i.dataset.goto);
        const currentIdx = order.indexOf(active.id);

        if (e.key === 'ArrowRight' && currentIdx < order.length - 1) {
            showScreen(order[currentIdx + 1]);
        } else if (e.key === 'ArrowLeft' && currentIdx > 0) {
            showScreen(order[currentIdx - 1]);
        }
    });
})();
