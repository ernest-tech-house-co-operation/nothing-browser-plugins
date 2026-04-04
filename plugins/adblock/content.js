(function () {
    'use strict';
    if (window.__NB_ADBLOCK__) return;
    window.__NB_ADBLOCK__ = true;

    // ── Ad/tracker domains ────────────────────────────────────────────────
    const BLOCKED_DOMAINS = new Set([
        // Google ads
        'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
        'adservice.google.com', 'pagead2.googlesyndication.com',
        'tpc.googlesyndication.com', 'adservice.google.co.uk',

        // Major ad networks
        'adnxs.com', 'adsrvr.org', 'advertising.com', 'adblade.com',
        'adform.net', 'adtech.de', 'adjug.com', 'adroll.com',
        'rubiconproject.com', 'openx.net', 'pubmatic.com',
        'casalemedia.com', 'smartadserver.com', 'smaato.net',
        'criteo.com', 'criteo.net', 'lijit.com', 'sovrn.com',
        'bidswitch.net', 'sharethrough.com', 'triplelift.com',
        'indexexchange.com', 'appnexus.com', 'contextweb.com',
        'undertone.com', 'yieldmo.com', '33across.com',

        // Amazon ads
        'adsystem.amazon.com', 'amazon-adsystem.com',

        // Content recommendation (outbrain/taboola)
        'taboola.com', 'outbrain.com', 'revcontent.com',
        'content.ad', 'mgid.com', 'zergnet.com',

        // Analytics / trackers
        'scorecardresearch.com', 'quantserve.com', 'chartbeat.com',
        'newrelic.com', 'nr-data.net', 'fullstory.com',
        'hotjar.com', 'mouseflow.com', 'logrocket.com',
        'heap.io', 'mixpanel.com', 'segment.com', 'segment.io',
        'amplitude.com', 'kissmetrics.com', 'crazyegg.com',
        'optimizely.com', 'conductrics.com',

        // Social trackers
        'facebook.net', 'connect.facebook.net',
        'platform.twitter.com', 'syndication.twitter.com',
        'ads.linkedin.com', 'snap.licdn.com',
        'bat.bing.com', 'clarity.ms',

        // Misc
        'moatads.com', 'doubleverify.com', 'adsafeprotected.com',
        'cdn.pixfuture.com', 'adligature.com', 'adtelligent.com',
    ]);

    // ── URL path/query patterns ───────────────────────────────────────────
    const BLOCKED_PATTERNS = [
        /\/pagead\//i,
        /\/ads?\//i,
        /\/adserver\//i,
        /\/adservice\//i,
        /[?&]ad_type=/i,
        /[?&]adunit=/i,
        /\/pcs\/activeview/i,
        /\/pagead\/gen_204/i,
        /\/beacon\?/i,
        /\/track(ing)?\//i,
        /\/pixel\//i,
        /\/collect\?/i,
        /\/analytics\/collect/i,
    ];

    // ── DOM selectors to nuke ─────────────────────────────────────────────
    const BLOCKED_SELECTORS = [
        // Google
        'ins.adsbygoogle',
        'div[id^="google_ads"]',
        'div[class*="adsbygoogle"]',
        'iframe[src*="googlesyndication"]',
        'iframe[src*="doubleclick"]',
        'iframe[src*="googleadservices"]',

        // Taboola / Outbrain
        'div[id*="taboola"]',
        'div[class*="taboola"]',
        'div[id*="outbrain"]',
        'div[class*="outbrain"]',

        // Generic ad containers
        'div[id*="advert"]',
        'div[class*="advert"]',
        'div[id*="banner-ad"]',
        'div[class*="banner-ad"]',
        'div[id*="ad-container"]',
        'div[class*="ad-container"]',
        'div[id*="ad-slot"]',
        'div[class*="ad-slot"]',
        'div[data-ad-unit]',
        'div[data-ad-slot]',
        'div[data-google-query-id]',

        // Sticky/overlay ads
        'div[class*="sticky-ad"]',
        'div[class*="floating-ad"]',
        'div[id*="floating-ad"]',
        'div[class*="interstitial"]',
    ];

    // ── Core: is this URL an ad? ──────────────────────────────────────────
    function isBlocked(url) {
        if (!url || url.startsWith('data:') || url.startsWith('blob:')) return false;
        try {
            const u    = new URL(url, window.location.href);
            const host = u.hostname.replace(/^www\./, '');

            // Exact domain or subdomain match
            for (const d of BLOCKED_DOMAINS) {
                if (host === d || host.endsWith('.' + d)) return true;
            }

            // Path/query pattern match
            const full = u.pathname + u.search;
            for (const p of BLOCKED_PATTERNS) {
                if (p.test(full)) return true;
            }
        } catch (e) {}
        return false;
    }

    // ── Block fetch ───────────────────────────────────────────────────────
    const _fetch = window.fetch;
    window.fetch = function (input) {
        const url = typeof input === 'string' ? input
                  : input instanceof Request  ? input.url
                  : String(input);
        if (isBlocked(url)) {
            return Promise.reject(new TypeError('[NB Adblock] blocked: ' + url));
        }
        return _fetch.apply(this, arguments);
    };

    // ── Block XHR ─────────────────────────────────────────────────────────
    const _xhrOpen = XMLHttpRequest.prototype.open;
    const _xhrSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
        this.__nb_blocked__ = isBlocked(String(url));
        if (!this.__nb_blocked__)
            return _xhrOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function () {
        if (this.__nb_blocked__) return;
        return _xhrSend.apply(this, arguments);
    };

    // ── Block dynamic script/iframe/img src assignment ────────────────────
    function patchSrc(el, tag) {
        if (!['script','iframe','img','link'].includes(tag)) return;
        let _srcVal = el.getAttribute('src') || '';
        const descriptor = {
            get() { return _srcVal; },
            set(val) {
                if (isBlocked(String(val))) {
                    console.log('[NB Adblock] blocked src:', val);
                    return;
                }
                _srcVal = val;
                // Use the original setAttribute to avoid infinite loop
                HTMLElement.prototype.setAttribute.call(el, 'src', val);
            },
            configurable: true,
        };
        try { Object.defineProperty(el, 'src', descriptor); } catch (e) {}
    }

    const _createElement = document.createElement.bind(document);
    document.createElement = function (tag) {
        const el = _createElement(tag);
        patchSrc(el, tag.toLowerCase());
        return el;
    };

    // ── Block appendChild / insertBefore with ad scripts ──────────────────
    const _appendChild      = Element.prototype.appendChild;
    const _insertBefore     = Element.prototype.insertBefore;

    function isAdElement(node) {
        if (!node || node.nodeType !== 1) return false;
        const tag = node.tagName?.toLowerCase();
        if (tag === 'script' || tag === 'iframe') {
            const src = node.getAttribute('src') || node.src || '';
            if (isBlocked(src)) return true;
        }
        if (tag === 'ins' && node.classList.contains('adsbygoogle')) return true;
        return false;
    }

    Element.prototype.appendChild = function (node) {
        if (isAdElement(node)) {
            console.log('[NB Adblock] blocked appendChild:', node.tagName, node.src || '');
            return node;
        }
        return _appendChild.call(this, node);
    };

    Element.prototype.insertBefore = function (node, ref) {
        if (isAdElement(node)) {
            console.log('[NB Adblock] blocked insertBefore:', node.tagName, node.src || '');
            return node;
        }
        return _insertBefore.call(this, node, ref);
    };

    // ── DOM sweeper — catches anything that slipped through ───────────────
    function sweep() {
        for (const sel of BLOCKED_SELECTORS) {
            try {
                document.querySelectorAll(sel).forEach(el => {
                    el.remove();
                });
            } catch (e) {}
        }
    }

    // Run on every DOM mutation
    const observer = new MutationObserver(sweep);
    observer.observe(document.documentElement, {
        childList: true,
        subtree:   true,
    });

    // Initial sweep once DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', sweep);
    } else {
        sweep();
    }

    console.log('[NB Adblock] v1.0.0 active');
})();