(() => {
    // ============================================================
    // MOBILE DRAWER TOGGLE
    // ============================================================
    const menuToggle = document.getElementById('menuToggle');
    const navBackdrop = document.getElementById('navBackdrop');
    const isMobile = () => window.matchMedia('(max-width: 820px)').matches;
    const setNavOpen = (open) => {
        document.body.classList.toggle('nav-open', open);
        if (menuToggle) menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    menuToggle?.addEventListener('click', () => {
        setNavOpen(!document.body.classList.contains('nav-open'));
    });
    navBackdrop?.addEventListener('click', () => setNavOpen(false));

    // ============================================================
    // VIEW SWITCHING (day / week / month)
    // ============================================================
    const views = document.querySelectorAll('.view');
    const viewBtns = document.querySelectorAll('[data-view]');

    const showView = (key) => {
        views.forEach((v) => v.classList.toggle('is-active', v.dataset.view === key));
        viewBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.view === key));
        if (isMobile()) setNavOpen(false);
    };

    // ============================================================
    // MODALS
    // ============================================================
    const openModal = (id) => {
        const m = document.getElementById(id);
        if (!m) return;
        m.classList.add('is-open');
    };

    const closeAllModals = () => {
        document.querySelectorAll('.modal.is-open').forEach((m) => m.classList.remove('is-open'));
    };

    // ============================================================
    // GLOBAL CLICK ROUTER
    // ============================================================
    document.addEventListener('click', (event) => {
        const target = event.target;

        // Close button inside modal
        if (target.closest('[data-close]')) {
            event.preventDefault();
            closeAllModals();
            return;
        }

        // Click on backdrop closes modal
        if (target.matches('[data-modal-overlay]')) {
            event.preventDefault();
            closeAllModals();
            return;
        }

        // Click on element with data-modal opens modal (and may have closed an existing one)
        const opener = target.closest('[data-modal]');
        if (opener) {
            event.preventDefault();
            // If clicked from inside another modal (e.g. Modifier button), close first
            if (target.closest('.modal.is-open')) closeAllModals();
            openModal(opener.dataset.modal);
            return;
        }

        // Click on event tile inside calendar
        const evt = target.closest('[data-event]');
        if (evt) {
            event.preventDefault();
            openModal(evt.dataset.event);
            return;
        }

        // View toggle
        const viewBtn = target.closest('[data-view]');
        if (viewBtn) {
            event.preventDefault();
            showView(viewBtn.dataset.view);
            return;
        }

        // External href
        const link = target.closest('[data-href]');
        if (link) {
            event.preventDefault();
            window.location.href = link.dataset.href;
            return;
        }

        // Week strip day selection
        const day = target.closest('[data-day]');
        if (day) {
            event.preventDefault();
            document.querySelectorAll('.cal__day').forEach((d) => d.classList.remove('cal__day--active'));
            day.classList.add('cal__day--active');
            return;
        }
    });

    // ============================================================
    // KEYBOARD: Esc closes modal or drawer
    // ============================================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (document.body.classList.contains('nav-open')) setNavOpen(false);
            else closeAllModals();
        }
    });

    // Close drawer when navigating to a modal from the drawer
    document.querySelectorAll('.flow-nav [data-modal]').forEach((btn) => {
        btn.addEventListener('click', () => { if (isMobile()) setNavOpen(false); });
    });

    // ============================================================
    // BUILD MONTH GRID
    // ============================================================
    const monthGrid = document.getElementById('monthGrid');
    if (monthGrid) {
        // May 2026 starts on Friday (using ISO Monday-first week)
        const daysInMonth = 31;
        const offsetBefore = 4; // Mon=0, Fri=4
        const offsetAfter = (7 - ((daysInMonth + offsetBefore) % 7)) % 7;

        // Phases: example cycle, day 5 = today, folliculaire
        const phaseFor = (d) => {
            if (d >= 1 && d <= 4) return 'menstruel';
            if (d >= 5 && d <= 10) return 'folliculaire';
            if (d >= 11 && d <= 16) return 'ovulatoire';
            if (d >= 17 && d <= 31) return 'luteale';
            return null;
        };

        const eventsFor = (d) => {
            const map = { 5: ['purple', 'pink'], 6: ['orange'], 7: ['purple', 'orange', 'purple'], 8: ['orange'], 9: ['purple'], 12: ['orange'], 14: ['purple', 'pink'], 20: ['orange'], 22: ['purple'], 27: ['pink'] };
            return map[d] || [];
        };

        // Previous month dates (Apr 2026 ends on day 30)
        for (let i = 0; i < offsetBefore; i++) {
            const d = 30 - offsetBefore + i + 1;
            const cell = document.createElement('div');
            cell.className = 'month-cell month-cell--out';
            cell.innerHTML = `<span class="month-cell__num">${d}</span>`;
            monthGrid.appendChild(cell);
        }

        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            const cell = document.createElement('div');
            const isToday = d === 5;
            cell.className = 'month-cell' + (isToday ? ' month-cell--today' : '');
            const phase = phaseFor(d);
            const events = eventsFor(d);
            const dots = events.map((c) => `<span class="month-cell__dot month-cell__dot--${c}"></span>`).join('');
            cell.innerHTML = `
                <span class="month-cell__num">${d}</span>
                ${phase ? `<span class="month-cell__phase month-cell__phase--${phase}"></span>` : ''}
                <div class="month-cell__dots">${dots}</div>
            `;
            if (isToday) {
                cell.addEventListener('click', () => showView('day'));
            }
            monthGrid.appendChild(cell);
        }

        // Next month dates
        for (let i = 1; i <= offsetAfter; i++) {
            const cell = document.createElement('div');
            cell.className = 'month-cell month-cell--out';
            cell.innerHTML = `<span class="month-cell__num">${i}</span>`;
            monthGrid.appendChild(cell);
        }
    }

    // ============================================================
    // SCROLL TIMELINE TO ~08:00 BY DEFAULT
    // ============================================================
    const timeline = document.getElementById('timeline');
    if (timeline) {
        // events are positioned starting at top:0 = 08:00, so just scroll to top
        timeline.scrollTop = 0;
    }
})();
