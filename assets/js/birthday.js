/**
 * Birthday Theme UI & Celebration Controller
 * Features:
 * - Automated Countdown Timer: Activates every September 1st (00:00:00 PHT / UTC+8) until September 4th.
 * - Automated Birthday Theme UI: Activates every September 4th (00:00:00 to 23:59:59 PHT / UTC+8).
 * - Canvas confetti physics engine (multi-color, ribbons, stars, 60fps).
 * - Jaunty SVG party hats mounted over desktop & mobile profile avatars.
 * - Celebratory floating banner pills with minimize/expand controls.
 * - Interactive frosted-glass Birthday Cake modal with blowout candle, Web Audio chime fanfare, and wish effect.
 */

// Philippine Standard Time is UTC+8 (no Daylight Saving Time)
export const PHT_OFFSET_MS = 8 * 60 * 60 * 1000;

// Global state
let confettiCanvas = null;
let confettiCtx = null;
let confettiParticles = [];
let confettiAnimId = null;
let isCandleBlown = false;
let countdownInterval = null;

/**
 * Get current time shifted to Philippine Standard Time (PHT / UTC+8)
 */
export function getNowPHT() {
    return new Date(Date.now() + PHT_OFFSET_MS);
}

/**
 * Get target countdown and celebration timestamps relative to current PHT year
 */
export function getBirthdayTimestampsPHT() {
    const nowPHT = getNowPHT();
    const year = nowPHT.getUTCFullYear();

    // September 1, 00:00:00 PHT (Month index 8 in JS)
    const countdownStartUtc = Date.UTC(year, 8, 1, 0, 0, 0) - PHT_OFFSET_MS;
    // September 4, 00:00:00 PHT
    const bdayTargetUtc = Date.UTC(year, 8, 4, 0, 0, 0) - PHT_OFFSET_MS;
    // September 5, 00:00:00 PHT (End of birthday celebration)
    const bdayEndUtc = Date.UTC(year, 8, 5, 0, 0, 0) - PHT_OFFSET_MS;

    return { countdownStartUtc, bdayTargetUtc, bdayEndUtc, year };
}

/**
 * Check if the Birthday Celebration UI should be active
 * Triggers automatically if now is September 4th in Philippine Time (+8),
 * or if overridden via URL parameter (?birthday=true / ?birthday=preview) or sessionStorage.
 */
export function isBirthdayActive() {
    try {
        const params = new URLSearchParams(window.location.search);
        const urlOverride = params.get('birthday');
        if (urlOverride === 'true' || urlOverride === '1' || urlOverride === 'preview') {
            return true;
        }
        if (urlOverride === 'false' || urlOverride === '0') {
            return false;
        }

        const sessionOverride = sessionStorage.getItem('portfolio_birthday_active');
        if (sessionOverride === 'true') return true;
        if (sessionOverride === 'false') return false;

        const { bdayTargetUtc, bdayEndUtc } = getBirthdayTimestampsPHT();
        const now = Date.now();
        return now >= bdayTargetUtc && now < bdayEndUtc;
    } catch (e) {
        console.warn('Error checking birthday state:', e);
        return false;
    }
}

/**
 * Check if the Countdown Timer should be active
 * Triggers automatically starting September 1st (00:00:00 PHT) until September 4th (00:00:00 PHT),
 * or if overridden via URL parameter (?countdown=true) or sessionStorage.
 */
export function isCountdownActive() {
    try {
        const params = new URLSearchParams(window.location.search);
        const cdOverride = params.get('countdown') || params.get('countdown-preview');
        if (cdOverride === 'true' || cdOverride === '1') {
            return true;
        }
        if (cdOverride === 'false' || cdOverride === '0') {
            return false;
        }

        // Birthday celebration takes priority over countdown
        if (isBirthdayActive()) {
            return false;
        }

        const sessionCdOverride = sessionStorage.getItem('portfolio_countdown_active');
        if (sessionCdOverride === 'true') return true;
        if (sessionCdOverride === 'false') return false;

        const { countdownStartUtc, bdayTargetUtc } = getBirthdayTimestampsPHT();
        const now = Date.now();
        return now >= countdownStartUtc && now < bdayTargetUtc;
    } catch (e) {
        console.warn('Error checking countdown state:', e);
        return false;
    }
}

/**
 * Initialize Birthday Theme or Countdown Controller
 */
export function initBirthday() {
    const isBday = isBirthdayActive();
    const isCd = !isBday && isCountdownActive();

    if (isBday) {
        cleanupCountdown();
        activateBirthdayCelebration();
    } else if (isCd) {
        document.documentElement.removeAttribute('data-birthday');
        mountCountdownTimer();
    } else {
        document.documentElement.removeAttribute('data-birthday');
        cleanupCountdown();
    }
}

/**
 * Activate the full celebratory Birthday Theme
 */
function activateBirthdayCelebration() {
    document.documentElement.setAttribute('data-birthday', 'true');

    // 1. Setup full-screen confetti canvas
    initConfettiCanvas();

    // 2. Attach SVG Party Hats to Profile Avatars (Desktop + Mobile)
    mountPartyHats();

    // 3. Attach Birthday Badges to Profile cards
    mountBirthdayBadges();

    // 4. Inject Floating Top Celebration Capsule Banner
    mountCelebrationBanner();

    // 5. Inject Interactive Birthday Cake Modal
    mountBirthdayModal();

    // 6. Launch welcoming confetti celebration shower
    setTimeout(() => {
        launchWelcomeConfetti();
    }, 600);
}

/**
 * ==========================================================================
 * Countdown Timer Module (Every September 1st to 4th, PHT / UTC+8)
 * ==========================================================================
 */
function mountCountdownTimer() {
    cleanupCountdown();

    const { bdayTargetUtc } = getBirthdayTimestampsPHT();

    // Create and inject Countdown Capsule Banner
    const banner = document.createElement('div');
    banner.id = 'bdayCountdownBanner';
    banner.className = 'bday-countdown-capsule';
    banner.setAttribute('role', 'timer');
    banner.innerHTML = `
        <div class="bday-countdown-title">
            <span>⏳</span>
            <span class="bday-full-text">Birthday in</span>
            <span class="bday-sparkle-text">(PHT)</span>
        </div>
        <div class="bday-countdown-clock">
            <div class="bday-countdown-unit"><span class="bday-countdown-num" id="cdDays">00</span><span class="bday-countdown-label">d</span></div>
            <span class="bday-countdown-colon">:</span>
            <div class="bday-countdown-unit"><span class="bday-countdown-num" id="cdHours">00</span><span class="bday-countdown-label">h</span></div>
            <span class="bday-countdown-colon">:</span>
            <div class="bday-countdown-unit"><span class="bday-countdown-num" id="cdMins">00</span><span class="bday-countdown-label">m</span></div>
            <span class="bday-countdown-colon">:</span>
            <div class="bday-countdown-unit"><span class="bday-countdown-num" id="cdSecs">00</span><span class="bday-countdown-label">s</span></div>
        </div>
        <div class="d-flex align-items-center gap-1">
            <a href="#contact" class="bday-btn bday-btn-primary" id="cdEarlyWishBtn" title="Send an early birthday wish!">
                🎂 <span class="d-none d-sm-inline">Early </span>Wish
            </a>
            <button type="button" class="bday-btn-close" id="cdCloseBtn" aria-label="Minimize countdown" title="Minimize">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Minimized Pill
    const minPill = document.createElement('div');
    minPill.id = 'cdMinimizedPill';
    minPill.className = 'bday-minimized-pill';
    minPill.title = "Timothy's Birthday Countdown (Sept 4 PHT). Click to expand.";
    minPill.innerHTML = `
        <span>⏳</span>
        <span>Bday in <span id="cdMinTime">--</span> (PHT)</span>
    `;

    document.body.appendChild(banner);
    document.body.appendChild(minPill);
    document.body.classList.add('has-bday-banner');

    // Mount countdown badges in sidebar and mobile profile
    mountCountdownBadges();

    // Event listeners
    const closeBtn = banner.querySelector('#cdCloseBtn');
    closeBtn.addEventListener('click', () => {
        banner.style.display = 'none';
        minPill.style.display = 'inline-flex';
        document.body.classList.remove('has-bday-banner');
    });

    minPill.addEventListener('click', () => {
        minPill.style.display = 'none';
        banner.style.display = 'flex';
        document.body.classList.add('has-bday-banner');
    });

    const earlyWishBtn = banner.querySelector('#cdEarlyWishBtn');
    earlyWishBtn.addEventListener('click', () => {
        setTimeout(() => {
            const subjectInput = document.getElementById('subject') || document.querySelector('input[name="subject"]');
            if (subjectInput && !subjectInput.value) {
                subjectInput.value = '🎉 Early Birthday Greeting, Timothy!';
            }
        }, 300);
    });

    // Update function
    const updateCountdown = () => {
        const now = Date.now();
        const diffMs = bdayTargetUtc - now;

        if (diffMs <= 0) {
            // Reached September 4th 00:00:00 PHT!
            clearInterval(countdownInterval);
            countdownInterval = null;
            cleanupCountdown();

            // Automatically switch to celebration
            activateBirthdayCelebration();
            playBirthdayFanfare();
            return;
        }

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        const pad = (n) => String(n).padStart(2, '0');

        const elDays = document.getElementById('cdDays');
        const elHours = document.getElementById('cdHours');
        const elMins = document.getElementById('cdMins');
        const elSecs = document.getElementById('cdSecs');
        const elMinTime = document.getElementById('cdMinTime');

        if (elDays) elDays.textContent = pad(days);
        if (elHours) elHours.textContent = pad(hours);
        if (elMins) elMins.textContent = pad(minutes);
        if (elSecs) elSecs.textContent = pad(seconds);

        let shortTime;
        if (days > 0) {
            shortTime = `${days}d ${hours}h`;
        } else if (hours > 0) {
            shortTime = `${hours}h ${pad(minutes)}m`;
        } else {
            shortTime = `${minutes}m ${pad(seconds)}s`;
        }
        if (elMinTime) elMinTime.textContent = shortTime;

        // Update badge labels with compact formatting
        let badgeText;
        if (days > 0) {
            badgeText = `${days}d ${hours}h ${pad(minutes)}m`;
        } else if (hours > 0) {
            badgeText = `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
        } else {
            badgeText = `${minutes}m ${pad(seconds)}s`;
        }
        const badgeTimeDesktop = document.getElementById('cdBadgeTimeDesktop');
        const badgeTimeMobile = document.getElementById('cdBadgeTimeMobile');
        if (badgeTimeDesktop) badgeTimeDesktop.textContent = badgeText;
        if (badgeTimeMobile) badgeTimeMobile.textContent = badgeText;
    };

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function mountCountdownBadges() {
    const desktopAvailability = document.querySelector('aside .availability-badge');
    if (desktopAvailability && !document.getElementById('cdBadgeDesktop')) {
        const badge = document.createElement('span');
        badge.id = 'cdBadgeDesktop';
        badge.className = 'bday-countdown-badge badge text-wrap mw-100 px-3 py-2 lh-sm rounded-pill d-inline-block text-center mb-2';
        badge.innerHTML = '<span class="d-block"><i class="fas fa-hourglass-half me-1"></i> Bday in</span><span class="d-block" id="cdBadgeTimeDesktop">--</span>';
        badge.title = 'Countdown to Timothy’s Birthday on Sept 4 (Philippine Time)';
        desktopAvailability.parentNode.insertBefore(badge, desktopAvailability);
    }

    const mobileAvailability = document.querySelector('aside.d-lg-none .availability-badge');
    if (mobileAvailability && !document.getElementById('cdBadgeMobile')) {
        const parent = mobileAvailability.parentNode;
        parent.classList.add('flex-wrap', 'gap-2');
        const badge = document.createElement('span');
        badge.id = 'cdBadgeMobile';
        badge.className = 'bday-countdown-badge badge text-wrap mw-100 px-3 py-2 lh-sm rounded-pill d-inline-flex align-items-center justify-content-center gap-1 mb-2';
        badge.innerHTML = '<i class="fas fa-hourglass-half me-1"></i> Bday in <span id="cdBadgeTimeMobile">--</span>';
        badge.title = 'Countdown to Timothy’s Birthday on Sept 4 (Philippine Time)';
        parent.insertBefore(badge, mobileAvailability);
    }
}

function cleanupCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    const banner = document.getElementById('bdayCountdownBanner');
    if (banner) banner.remove();
    const minPill = document.getElementById('cdMinimizedPill');
    if (minPill) minPill.remove();
    const badgeDesktop = document.getElementById('cdBadgeDesktop');
    if (badgeDesktop) badgeDesktop.remove();
    const badgeMobile = document.getElementById('cdBadgeMobile');
    if (badgeMobile) badgeMobile.remove();
    if (!document.getElementById('bdayBanner')) {
        document.body.classList.remove('has-bday-banner');
    }
}

/**
 * ==========================================================================
 * Birthday Celebration Components (Party Hat, Badges, Modals, Confetti)
 * ==========================================================================
 */

/**
 * Mount Jaunty SVG Party Hats onto profile ring containers
 */
function mountPartyHats() {
    const getHatSVG = (uid) => `
        <svg viewBox="0 0 80 95" width="100%" height="100%" style="overflow: visible;">
            <defs>
                <linearGradient id="bdayCone_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ec4899" />
                    <stop offset="50%" stop-color="#8b5cf6" />
                    <stop offset="100%" stop-color="#f59e0b" />
                </linearGradient>
                <radialGradient id="bdayPom_${uid}" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stop-color="#fffbeb" />
                    <stop offset="45%" stop-color="#fbbf24" />
                    <stop offset="100%" stop-color="#d97706" />
                </radialGradient>
            </defs>

            <!-- Hat Base Cone -->
            <path d="M 40,16 L 64,76 Q 40,84 16,76 Z" fill="url(#bdayCone_${uid})" stroke="#fef08a" stroke-width="1.2" stroke-linejoin="round" />

            <!-- Decorative Festive Stripes following cone curve -->
            <!-- Top Gold Stripe -->
            <path d="M 33,35 Q 40,39 47,35 L 50,43 Q 40,47 30,43 Z" fill="#fbbf24" opacity="0.95" />
            <!-- Middle Purple Stripe -->
            <path d="M 26,51 Q 40,57 54,51 L 58,60 Q 40,66 22,60 Z" fill="#c084fc" opacity="0.9" />

            <!-- Confetti Stars / Polka Dots -->
            <circle cx="40" cy="27" r="2.2" fill="#ffffff" opacity="0.95" />
            <circle cx="34" cy="55" r="2" fill="#ffffff" opacity="0.9" />
            <circle cx="46" cy="56" r="2" fill="#ffffff" opacity="0.9" />
            <circle cx="27" cy="70" r="2.2" fill="#fef08a" opacity="0.9" />
            <circle cx="40" cy="73" r="2.5" fill="#ffffff" opacity="0.95" />
            <circle cx="53" cy="70" r="2.2" fill="#fef08a" opacity="0.9" />

            <!-- Fluffy Scalloped Trim at base -->
            <ellipse cx="16" cy="76" rx="4" ry="4" fill="#fbbf24" />
            <ellipse cx="24" cy="78.5" rx="4" ry="4" fill="#ffffff" />
            <ellipse cx="32" cy="80.5" rx="4.2" ry="4.2" fill="#f472b6" />
            <ellipse cx="40" cy="81.5" rx="4.5" ry="4.5" fill="#ffffff" />
            <ellipse cx="48" cy="80.5" rx="4.2" ry="4.2" fill="#a78bfa" />
            <ellipse cx="56" cy="78.5" rx="4" ry="4" fill="#ffffff" />
            <ellipse cx="64" cy="76" rx="4" ry="4" fill="#fbbf24" />

            <!-- Golden Sparkling Pom-pom on tip -->
            <circle cx="40" cy="14" r="8" fill="url(#bdayPom_${uid})" filter="drop-shadow(0 0 6px rgba(251, 191, 36, 0.8))" />
            <!-- Little 4-point star sparkle on pom-pom -->
            <path d="M 40,4 L 41.8,11.5 L 48,13.5 L 41.8,15.5 L 40,23 L 38.2,15.5 L 32,13.5 L 38.2,11.5 Z" fill="#ffffff" opacity="0.95" />
        </svg>
    `;

    // Find all profile rings (sidebar desktop and mobile)
    const profileRings = document.querySelectorAll('.profile-ring');
    profileRings.forEach(ring => {
        // Ensure relative positioning
        ring.style.position = 'relative';

        // Check if hat already mounted
        if (ring.querySelector('.bday-party-hat-wrapper')) return;

        const hatDiv = document.createElement('div');
        hatDiv.className = 'bday-party-hat-wrapper';
        hatDiv.title = "🎉 Celebrating Timothy's Birthday today! Tap for confetti!";
        const uid = Math.random().toString(36).substring(2, 7);
        hatDiv.innerHTML = getHatSVG(uid);

        // Interactive confetti blast on hat click
        hatDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = hatDiv.getBoundingClientRect();
            fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
        });

        ring.appendChild(hatDiv);
    });
}

/**
 * Mount Birthday Badge next to or above availability badge
 */
function mountBirthdayBadges() {
    const desktopAvailability = document.querySelector('aside .availability-badge');
    if (desktopAvailability && !document.getElementById('bdayBadgeDesktop')) {
        const badge = document.createElement('span');
        badge.id = 'bdayBadgeDesktop';
        badge.className = 'bday-badge badge text-wrap mw-100 px-3 py-2 lh-sm rounded-pill d-inline-block text-center mb-2';
        badge.innerHTML = '<span class="d-block"><i class="fas fa-cake-candles me-1"></i> Celebrating Birthday</span><span class="d-block">Today! 🎉</span>';
        badge.title = 'Click to open birthday celebration!';
        badge.setAttribute('role', 'button');
        badge.setAttribute('tabindex', '0');
        badge.addEventListener('click', openBirthdayModal);
        badge.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openBirthdayModal();
            }
        });
        desktopAvailability.parentNode.insertBefore(badge, desktopAvailability);
    }

    const mobileAvailability = document.querySelector('aside.d-lg-none .availability-badge');
    if (mobileAvailability && !document.getElementById('bdayBadgeMobile')) {
        const parent = mobileAvailability.parentNode;
        parent.classList.add('flex-wrap', 'gap-2');
        const badge = document.createElement('span');
        badge.id = 'bdayBadgeMobile';
        badge.className = 'bday-badge badge text-wrap mw-100 px-3 py-2 lh-sm rounded-pill d-inline-flex align-items-center justify-content-center gap-1 mb-2';
        badge.innerHTML = '<i class="fas fa-cake-candles me-1"></i> Celebrating Birthday Today! 🎉';
        badge.title = 'Click to open birthday celebration!';
        badge.setAttribute('role', 'button');
        badge.setAttribute('tabindex', '0');
        badge.addEventListener('click', openBirthdayModal);
        badge.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openBirthdayModal();
            }
        });
        parent.insertBefore(badge, mobileAvailability);
    }
}

/**
 * Mount Top Floating Celebration Banner Capsule
 */
function mountCelebrationBanner() {
    if (document.getElementById('bdayBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'bdayBanner';
    banner.className = 'bday-banner-capsule';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = `
        <div class="bday-banner-text d-flex align-items-center gap-1 text-nowrap">
            <span>🎉</span>
            <span class="d-none d-md-inline">Today is Timothy's Birthday!</span>
            <span class="bday-sparkle-text">Sept 4 🎂</span>
        </div>
        <div class="d-flex align-items-center gap-1 gap-sm-2 ms-1">
            <button type="button" class="btn btn-sm bday-btn bday-btn-primary rounded-pill text-nowrap" id="bdayConfettiBtn" title="Celebrate with confetti!">
                <i class="fas fa-sparkles"></i> <span class="d-none d-sm-inline">Pop </span>Confetti
            </button>
            <button type="button" class="btn btn-sm bday-btn bday-btn-subtle rounded-pill text-nowrap" id="bdayWishBtn" title="Make a wish & blow out the candle">
                🎂 <span class="d-none d-sm-inline">Make a </span>Wish
            </button>
            <button type="button" class="btn btn-sm bday-btn-close rounded-circle p-0" id="bdayCloseBtn" aria-label="Minimize celebration banner" title="Minimize">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Minimized Pill
    const minPill = document.createElement('div');
    minPill.id = 'bdayMinimizedPill';
    minPill.className = 'bday-minimized-pill';
    minPill.title = "It's Timothy's Birthday! Click to celebrate!";
    minPill.innerHTML = `
        <span>🎂</span>
        <span>Timothy's Birthday (Sept 4)</span>
        <span>🎉</span>
    `;

    document.body.appendChild(banner);
    document.body.appendChild(minPill);
    document.body.classList.add('has-bday-banner');

    // Event listeners
    const confettiBtn = banner.querySelector('#bdayConfettiBtn');
    confettiBtn.addEventListener('click', (e) => {
        const rect = confettiBtn.getBoundingClientRect();
        fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 60);
    });

    const wishBtn = banner.querySelector('#bdayWishBtn');
    wishBtn.addEventListener('click', openBirthdayModal);

    const closeBtn = banner.querySelector('#bdayCloseBtn');
    closeBtn.addEventListener('click', () => {
        banner.style.display = 'none';
        minPill.style.display = 'inline-flex';
        document.body.classList.remove('has-bday-banner');
    });

    minPill.addEventListener('click', () => {
        minPill.style.display = 'none';
        banner.style.display = 'flex';
        document.body.classList.add('has-bday-banner');
    });
}

/**
 * Mount Interactive Birthday Cake Modal with blowout candle
 */
function mountBirthdayModal() {
    if (document.getElementById('birthdayModal')) return;

    const modalHTML = `
    <div class="modal fade" id="birthdayModal" tabindex="-1" aria-labelledby="birthdayModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 460px;">
            <div class="modal-content p-4 text-center">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge bday-badge px-3 py-1"><i class="fas fa-sparkles me-1"></i> September 4 Celebration</span>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                
                <h3 class="h4 fw-bold mt-2 mb-1" id="bdayModalTitle">Happy Birthday, Timothy! 🎂</h3>
                <p class="small text-muted mb-3" id="bdayModalSubtitle">Wishing Timothy another year of secure code, high-impact systems, and continuous growth!</p>
                
                <!-- Interactive Animated Cake & Candle Stage -->
                <div class="bday-cake-stage position-relative" id="bdayCakeStage">
                    <div class="bday-smoke-puff" id="bdaySmokePuff">
                        <svg viewBox="0 0 40 40" width="100%" height="100%">
                            <circle cx="20" cy="20" r="10" fill="#94a3b8" opacity="0.6" filter="blur(2px)" />
                            <circle cx="15" cy="14" r="7" fill="#cbd5e1" opacity="0.7" filter="blur(1px)" />
                            <circle cx="25" cy="12" r="8" fill="#e2e8f0" opacity="0.5" filter="blur(2px)" />
                        </svg>
                    </div>

                    <svg viewBox="0 0 200 160" width="200" height="160" style="overflow: visible;">
                        <defs>
                            <!-- Cake Top Frosting Gradient -->
                            <linearGradient id="cakeTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#f472b6" />
                                <stop offset="100%" stop-color="#db2777" />
                            </linearGradient>
                            <!-- Cake Base Gradient -->
                            <linearGradient id="cakeBaseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#4f46e5" />
                                <stop offset="50%" stop-color="#7c3aed" />
                                <stop offset="100%" stop-color="#9333ea" />
                            </linearGradient>
                            <linearGradient id="cakePlateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#e2e8f0" />
                                <stop offset="50%" stop-color="#ffffff" />
                                <stop offset="100%" stop-color="#cbd5e1" />
                            </linearGradient>
                            <!-- Candle Flame Gradient -->
                            <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                                <stop offset="0%" stop-color="#ef4444" />
                                <stop offset="50%" stop-color="#f59e0b" />
                                <stop offset="100%" stop-color="#fef08a" />
                            </linearGradient>
                        </defs>

                        <!-- Plate -->
                        <ellipse cx="100" cy="148" rx="85" ry="10" fill="url(#cakePlateGrad)" opacity="0.9" />
                        <ellipse cx="100" cy="147" rx="80" ry="7" fill="#f8fafc" />

                        <!-- Bottom Tier Cake -->
                        <path d="M 35,105 C 35,118 165,118 165,105 L 165,140 C 165,152 35,152 35,140 Z" fill="url(#cakeBaseGrad)" />
                        <!-- Frosting Swags Bottom Tier -->
                        <path d="M 35,112 Q 55,124 75,112 Q 100,126 125,112 Q 145,124 165,112 L 165,105 C 165,95 35,95 35,105 Z" fill="#fbbf24" opacity="0.85" />

                        <!-- Top Tier Cake -->
                        <path d="M 55,70 C 55,82 145,82 145,70 L 145,105 C 145,117 55,117 55,105 Z" fill="url(#cakeTopGrad)" />
                        <!-- Cream Drips Top Tier -->
                        <path d="M 55,76 Q 70,88 85,76 Q 100,90 115,76 Q 130,88 145,76 L 145,70 C 145,60 55,60 55,70 Z" fill="#fbcfe8" />

                        <!-- Star Candies / Berries -->
                        <circle cx="70" cy="69" r="4.5" fill="#fbbf24" />
                        <circle cx="100" cy="73" r="5" fill="#60a5fa" />
                        <circle cx="130" cy="69" r="4.5" fill="#fbbf24" />

                        <!-- Candle Stick -->
                        <rect x="96" y="28" width="8" height="38" rx="3" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
                        <!-- Candle Stripes -->
                        <line x1="96" y1="36" x2="104" y2="34" stroke="#ec4899" stroke-width="2.5" />
                        <line x1="96" y1="46" x2="104" y2="44" stroke="#8b5cf6" stroke-width="2.5" />
                        <line x1="96" y1="56" x2="104" y2="54" stroke="#f59e0b" stroke-width="2.5" />
                        <!-- Wick -->
                        <line x1="100" y1="28" x2="100" y2="21" stroke="#334155" stroke-width="1.8" stroke-linecap="round" />

                        <!-- Interactive Flickering Flame -->
                        <g transform="translate(100, 20)">
                            <g class="bday-flame" id="bdayCandleFlame">
                                <path d="M 0,-18 C -7,-9 -6,0 0,0 C 6,0 7,-9 0,-18 Z" fill="url(#flameGrad)" />
                                <ellipse cx="0" cy="-6" rx="2.5" ry="5" fill="#ffffff" opacity="0.9" />
                            </g>
                        </g>
                    </svg>
                </div>

                <div class="my-2" id="bdayActionPromptArea">
                    <button type="button" class="bday-blow-hint-badge" id="bdayBlowCandleBtn">
                        <i class="fas fa-wind me-1"></i> Tap the Candle to Blow It Out! 🕯️
                    </button>
                    <div class="bday-blow-prompt mt-1">Make a wish for Timothy's upcoming year!</div>
                </div>

                <div id="bdayWishGrantedMsg" class="d-none mb-3">
                    <div class="p-3 rounded-3" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.45); backdrop-filter: blur(8px);">
                        <p class="fw-bold mb-1" style="color: #fbbf24; font-size: 1.05rem;">✨ Wish Made! Happy Birthday, Timothy! 🥳</p>
                        <p class="small mb-0 text-muted">Thank you for visiting and celebrating with me today. Here's to building amazing things together!</p>
                    </div>
                </div>

                <div class="d-flex flex-wrap gap-2 justify-content-center mt-3">
                    <a href="#contact" class="bday-btn bday-btn-primary px-3 py-2 text-decoration-none" id="bdaySendGreetBtn">
                        <i class="fas fa-paper-plane me-1"></i> Send Birthday Message
                    </a>
                    <button type="button" class="bday-btn bday-btn-subtle px-3 py-2" id="bdayModalConfettiBtn">
                        <i class="fas fa-party-horn me-1"></i> Pop Confetti!
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = modalHTML;
    document.body.appendChild(container.firstElementChild);

    // Setup interactive blow candle handler
    const modalEl = document.getElementById('birthdayModal');
    const flameEl = document.getElementById('bdayCandleFlame');
    const blowBtn = document.getElementById('bdayBlowCandleBtn');
    const cakeStage = document.getElementById('bdayCakeStage');
    const wishGrantedMsg = document.getElementById('bdayWishGrantedMsg');
    const promptArea = document.getElementById('bdayActionPromptArea');
    const modalConfettiBtn = document.getElementById('bdayModalConfettiBtn');
    const sendGreetBtn = document.getElementById('bdaySendGreetBtn');

    const handleBlowCandle = () => {
        if (isCandleBlown) return;
        isCandleBlown = true;

        cakeStage.classList.add('candle-blown');
        promptArea.classList.add('d-none');
        wishGrantedMsg.classList.remove('d-none');

        // Play gentle synthesized celebration chime
        playBirthdayFanfare();

        // Launch celebratory confetti cascade
        const rect = cakeStage.getBoundingClientRect();
        fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 90);
        setTimeout(() => {
            launchWelcomeConfetti();
        }, 300);
    };

    if (flameEl) flameEl.addEventListener('click', handleBlowCandle);
    if (blowBtn) blowBtn.addEventListener('click', handleBlowCandle);

    if (modalConfettiBtn) {
        modalConfettiBtn.addEventListener('click', () => {
            const rect = modalConfettiBtn.getBoundingClientRect();
            fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 60);
        });
    }

    if (sendGreetBtn) {
        sendGreetBtn.addEventListener('click', () => {
            // Dismiss modal
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();

            // Smooth scroll or navigate to contact section
            window.location.hash = '#contact';

            // Optional: prefill contact form message subject or body if on contact page
            setTimeout(() => {
                const subjectInput = document.getElementById('subject') || document.querySelector('input[name="subject"]');
                if (subjectInput && !subjectInput.value) {
                    subjectInput.value = '🎉 Happy Birthday, Timothy!';
                }
            }, 300);
        });
    }
}

/**
 * Open the interactive birthday modal
 */
export function openBirthdayModal() {
    const modalEl = document.getElementById('birthdayModal');
    if (!modalEl) return;
    const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
    bsModal.show();
}

/**
 * Web Audio API Celebration Fanfare / Chime
 * Native, lightweight, zero dependencies, zero audio file network requests.
 */
function playBirthdayFanfare() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        // Musical note frequencies: C5, E5, G5, C6 (Happy celebratory arpeggio)
        const notes = [
            { freq: 523.25, time: 0.0, duration: 0.15 }, // C5
            { freq: 659.25, time: 0.14, duration: 0.15 }, // E5
            { freq: 783.99, time: 0.28, duration: 0.2 }, // G5
            { freq: 1046.50, time: 0.44, duration: 0.45 } // C6
        ];

        notes.forEach(({ freq, time, duration }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

            gain.gain.setValueAtTime(0.001, ctx.currentTime + time);
            gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + time + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime + time);
            osc.stop(ctx.currentTime + time + duration + 0.05);
        });
    } catch (e) {
        // Silently skip if user hasn't interacted or audio not allowed
    }
}

/**
 * Initialize high-performance Canvas Confetti
 */
function initConfettiCanvas() {
    if (document.getElementById('birthdayConfettiCanvas')) return;

    confettiCanvas = document.createElement('canvas');
    confettiCanvas.id = 'birthdayConfettiCanvas';
    document.body.appendChild(confettiCanvas);

    confettiCtx = confettiCanvas.getContext('2d');

    const handleResize = () => {
        if (!confettiCanvas) return;
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
}

/**
 * Launch welcoming dual-cannon celebration from bottom corners
 */
function launchWelcomeConfetti() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Burst from bottom-left
    fireConfetti(w * 0.15, h * 0.9, 50, { angle: 60, spread: 55, velocity: 16 });
    // Burst from bottom-right
    setTimeout(() => {
        fireConfetti(w * 0.85, h * 0.9, 50, { angle: 120, spread: 55, velocity: 16 });
    }, 180);
}

/**
 * Fire Confetti particles from given coordinates
 */
export function fireConfetti(originX, originY, count = 40, options = {}) {
    if (!confettiCanvas || !confettiCtx) return;

    const colors = ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#fbbf24', '#ffffff', '#f43f5e'];
    const shapes = ['rect', 'circle', 'star'];

    const angle = options.angle ?? null;
    const spread = options.spread ?? 360;
    const baseVelocity = options.velocity ?? 12;

    for (let i = 0; i < count; i++) {
        let launchAngle;
        if (angle !== null) {
            launchAngle = (angle - spread / 2 + Math.random() * spread) * (Math.PI / 180);
        } else {
            launchAngle = Math.random() * Math.PI * 2;
        }

        const speed = (baseVelocity * 0.5) + Math.random() * baseVelocity;

        confettiParticles.push({
            x: originX,
            y: originY,
            vx: Math.cos(launchAngle) * speed,
            vy: -Math.abs(Math.sin(launchAngle) * speed), // upward bias
            gravity: 0.35 + Math.random() * 0.2,
            drag: 0.96,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 12,
            size: 6 + Math.random() * 7,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            opacity: 1,
            decay: 0.008 + Math.random() * 0.012,
            wobble: Math.random() * 10
        });
    }

    if (!confettiAnimId) {
        animateConfetti();
    }
}

/**
 * Confetti physics update & render loop
 */
function animateConfetti() {
    if (!confettiCtx || !confettiCanvas) return;

    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];

        p.vx *= p.drag;
        p.vy = (p.vy * p.drag) + p.gravity;
        p.x += p.vx + Math.sin(p.wobble) * 0.8;
        p.y += p.vy;
        p.wobble += 0.08;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0 || p.y > confettiCanvas.height + 40) {
            confettiParticles.splice(i, 1);
            continue;
        }

        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.globalAlpha = Math.max(0, p.opacity);
        confettiCtx.fillStyle = p.color;

        if (p.shape === 'circle') {
            confettiCtx.beginPath();
            confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            confettiCtx.fill();
        } else if (p.shape === 'star') {
            drawStar(confettiCtx, 0, 0, 5, p.size / 2, p.size / 4);
            confettiCtx.fill();
        } else {
            // Rectangle
            confettiCtx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
        }

        confettiCtx.restore();
    }

    if (confettiParticles.length > 0) {
        confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
        confettiAnimId = null;
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

/**
 * Draw star shape on canvas
 */
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
}

/**
 * Expose testing/preview methods to window for easy debugging & console invocation
 */
window.triggerBirthdayConfetti = (count = 60) => {
    fireConfetti(window.innerWidth / 2, window.innerHeight / 3, count);
};

window.openBirthdayCelebration = openBirthdayModal;

window.setBirthdayThemePreview = (enable = true) => {
    sessionStorage.setItem('portfolio_birthday_active', enable ? 'true' : 'false');
    sessionStorage.removeItem('portfolio_countdown_active');
    window.location.reload();
};

window.setCountdownPreview = (enable = true) => {
    sessionStorage.setItem('portfolio_countdown_active', enable ? 'true' : 'false');
    sessionStorage.removeItem('portfolio_birthday_active');
    window.location.reload();
};

window.getPhilippineTimeInfo = () => {
    const nowPHT = getNowPHT();
    const timestamps = getBirthdayTimestampsPHT();
    const remainingMs = Math.max(0, timestamps.bdayTargetUtc - Date.now());
    return {
        currentTimePHT: nowPHT.toISOString().replace('Z', ' PHT (UTC+8)'),
        targetBirthdayPHT: new Date(timestamps.bdayTargetUtc + PHT_OFFSET_MS).toISOString().replace('Z', ' PHT'),
        isCountdownActive: isCountdownActive(),
        isBirthdayActive: isBirthdayActive(),
        remainingSeconds: Math.floor(remainingMs / 1000)
    };
};
