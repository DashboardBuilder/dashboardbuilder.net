/* Dashboard Builder 8.0 – single-page app (hash routing)
 *
 * Screens:  #/            dashboard canvas (builder)
 *           #/chart/<n>   chart settings of panel n
 *           #/data/<n>    data source of panel n
 *           #/theme       theme
 *           #/preview     view the saved dashboard
 *           #/auto        Auto Visualize (AI dashboard generator)
 * Server:   api/<action>  (lib/api.php)
 *
 * @author Diginix Technologies www.diginixtech.com
 * @copyright (C) 2016-2026 Dashboardbuilder.net
 * @version 8.0
 */
(() => {
	'use strict';

	const BASE = window.DB80_BASE || './';

	/* chart scripts resize their plots on window resize; skip plots that are no longer on the page */
	if (window.DashboardBuilder && DashboardBuilder.relayout && !DashboardBuilder.__db80) {
		const relayout0 = DashboardBuilder.relayout;
		DashboardBuilder.relayout = function (gd, ...rest) {
			const el = typeof gd === 'string' ? document.getElementById(gd) : gd;
			if (!el || !el._fullLayout) return Promise.resolve(el);
			return relayout0.call(this, gd, ...rest);
		};
		DashboardBuilder.__db80 = true;
	}
	const ICONS = window.DB80_ICONS || {};

	// ------------------------------------------------------------ helpers
	const $ = (s, el = document) => el.querySelector(s);
	const $$ = (s, el = document) => [...el.querySelectorAll(s)];
	const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
	const store = {
		get: (k) => { try { return localStorage.getItem('db80-' + k); } catch (e) { return null; } },
		set: (k, v) => { try { localStorage.setItem('db80-' + k, v); } catch (e) {} },
	};
	const S = {
		boot: null, T: {}, csrf: '', state: {}, canvas: null, sel: 0, colSize: 0,
		route: '', routeParam: null, filterOpen: false, edition: '', busy: 0,
	};
	const h = (html) => { const t = document.createElement('template'); t.innerHTML = String(html).trim(); return t.content.firstElementChild; };
	const debounce = (fn, ms) => { let tm; return (...a) => { clearTimeout(tm); tm = setTimeout(() => fn(...a), ms); }; };
	const strip = (s) => String(s ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

	/* language strings (7.x language files + 8.0 additions). Some 7.x strings contain HTML. */
	const t = (k, fb) => (S.T && S.T[k] != null ? S.T[k] : (fb != null ? fb : k));
	const tx = (k, fb) => esc(strip(t(k, fb)));
	const tc = (k, fb) => strip(t(k, fb)).replace(/:\s*$/, '');

	const ic = (n, cls = '') => {
		const p = ICONS[n] || ICONS.help_center || '';
		return `<svg class="i ${cls}" viewBox="0 -960 960 960" aria-hidden="true"><path d="${p}"/></svg>`;
	};
	const fa = (cls, style = '') => `<i class="${cls}" aria-hidden="true"${style ? ` style="${style}"` : ''}></i>`;

	// ---------------------------------------------------------------- API
	async function api(action, { method = 'GET', body, query, retry = true } = {}) {
		let url = BASE + 'api/' + action;
		if (query) {
			const qs = new URLSearchParams();
			Object.entries(query).forEach(([k, v]) => { if (v !== undefined && v !== null) qs.append(k, v); });
			url += '?' + qs.toString();
		}
		const opts = { method, credentials: 'same-origin', headers: { 'X-CSRF-Token': S.csrf, Accept: 'application/json' } };
		if (body !== undefined) {
			opts.method = 'POST';
			opts.body = body instanceof FormData ? body : toForm(body);
		}
		let res;
		try {
			res = await fetch(url, opts);
		} catch (e) {
			throw new Error(t('NOTCONNECTED', 'Network error'));
		}
		let data = null;
		const text = await res.text();
		try { data = JSON.parse(text); } catch (e) {
			const m = text.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
			throw new Error(m.slice(0, 300) || ('HTTP ' + res.status));
		}
		if (data && data.csrf && data.csrfToken && retry) {
			S.csrf = data.csrfToken;
			return api(action, { method, body, query, retry: false });
		}
		if (res.status === 401 && data && data.login) {
			/* cloud edition: members sign in on the cloud site */
			if (data.redirect) { location.href = data.redirect; throw Object.assign(new Error(data.error || 'Login'), { silent: true }); }
			showLogin();
			throw Object.assign(new Error(data.error || 'Login'), { silent: true });
		}
		if (!res.ok && data && data.ok === false && !data.noFile) {
			throw Object.assign(new Error(data.error || ('HTTP ' + res.status)), { data });
		}
		return data;
	}

	/* {a:1, b:[1,2], c:{0:[..]}} -> FormData with PHP style names */
	function toForm(obj) {
		const fd = new FormData();
		const add = (key, v) => {
			if (v === undefined || v === null) return;
			if (Array.isArray(v)) { v.forEach((x) => add(key + '[]', x)); return; }
			if (typeof v === 'object' && !(v instanceof Blob)) { Object.entries(v).forEach(([k, x]) => add(key + '[' + k + ']', x)); return; }
			if (typeof v === 'boolean') v = v ? 'true' : 'false';
			fd.append(key, v);
		};
		Object.entries(obj || {}).forEach(([k, v]) => add(k, v));
		return fd;
	}

	// ----------------------------------------------------------------- UI
	function toast(msg, type = 'ok') {
		let host = $('.x-toasts');
		if (!host) { host = h('<div class="x-toasts" role="status" aria-live="polite"></div>'); document.body.append(host); }
		const el = h(`<div class="x-toast ${type}">${ic(type === 'ok' ? 'check_circle' : 'error')}<span>${esc(msg)}</span></div>`);
		host.append(el);
		setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 320); }, type === 'ok' ? 2600 : 5200);
	}

	function errToast(e) {
		if (e && e.silent) return;
		toast((e && e.message) || String(e), 'bad');
	}

	function busy(on, label) {
		let el = $('#x-busy');
		if (on) {
			S.busy++;
			if (!el) {
				el = h(`<div id="x-busy" class="x-modal-wrap" style="background:rgba(11,28,48,.18);backdrop-filter:none;z-index:1250"><div class="x-card" style="padding:16px 20px;display:flex;gap:12px;align-items:center"><div class="x-spinner sm"></div><span class="x-busy-text"></span></div></div>`);
				document.body.append(el);
			}
			$('.x-busy-text', el).textContent = label || '…';
		} else {
			S.busy = Math.max(0, S.busy - 1);
			if (!S.busy && el) el.remove();
		}
	}

	function setBtnBusy(btn, on) {
		if (!btn) return;
		if (on) {
			btn.dataset.html = btn.innerHTML;
			btn.disabled = true;
			btn.innerHTML = '<span class="x-spinner sm"></span>' + btn.innerHTML;
		} else if (btn.dataset.html != null) {
			btn.disabled = false;
			btn.innerHTML = btn.dataset.html;
			delete btn.dataset.html;
		}
	}

	/* modal({title, icon, body, foot, size, onClose, closeable}) */
	function modal(o) {
		const wrap = h(`<div class="x-modal-wrap" role="dialog" aria-modal="true"><div class="x-modal ${o.size || ''}">
			<div class="x-modal-head"><h2>${o.icon ? `<span class="x-modal-icon">${o.icon}</span>` : ''}<span>${o.title || ''}</span></h2>
			${o.closeable === false ? '' : `<button type="button" class="x-btn x-btn-ghost x-icon-only x-close" aria-label="${tx('CLOSE')}">${ic('close')}</button>`}</div>
			<div class="x-modal-body"></div>${o.foot !== false ? '<div class="x-modal-foot"></div>' : ''}</div></div>`);
		const body = $('.x-modal-body', wrap);
		if (typeof o.body === 'string') body.innerHTML = o.body; else if (o.body) body.append(o.body);
		const foot = $('.x-modal-foot', wrap);
		if (foot) { if (typeof o.foot === 'string') foot.innerHTML = o.foot; else if (o.foot) foot.append(o.foot); }
		let closed = false;
		const close = (v) => {
			if (closed) return;
			closed = true;
			wrap.remove();
			document.removeEventListener('keydown', onKey);
			if (!$('.x-modal-wrap:not(#x-busy)')) document.body.classList.remove('x-lock');
			o.onClose && o.onClose(v);
		};
		const onKey = (e) => { if (e.key === 'Escape' && o.closeable !== false && wrap === $$('.x-modal-wrap:not(#x-busy)').pop()) close(); };
		document.addEventListener('keydown', onKey);
		wrap.addEventListener('mousedown', (e) => { if (e.target === wrap && o.closeable !== false && o.backdrop !== false) close(); });
		$$('.x-close, [data-close]', wrap).forEach((b) => b.addEventListener('click', () => close()));
		document.body.append(wrap);
		document.body.classList.add('x-lock');
		const f = $('[autofocus]', wrap) || $('input:not([type=hidden]):not([readonly]), select, textarea', body);
		if (f) setTimeout(() => f.focus(), 30);
		return { el: wrap, body, foot, close };
	}

	function confirmBox(text, { title, ok, danger, icon } = {}) {
		return new Promise((resolve) => {
			const m = modal({
				size: 'sm', title: title || tx('EDIT'), icon: icon || ic(danger ? 'warning' : 'help'),
				body: `<p style="margin:0;color:var(--muted)">${text}</p>`,
				foot: `<button class="x-btn" data-close>${tx('CONFIRM_NO')}</button><button class="x-btn ${danger ? 'x-btn-danger' : 'x-btn-primary'}" data-ok>${ok || tx('CONFIRM_YES')}</button>`,
				onClose: (v) => resolve(v === true),
			});
			$('[data-ok]', m.el).addEventListener('click', () => m.close(true));
			$('[data-ok]', m.el).focus();
		});
	}

	function alertBox(html, { title, icon, type = 'danger', onClose } = {}) {
		const m = modal({
			size: 'sm', title: title || 'Dashboard Builder', icon: icon || ic(type === 'danger' ? 'error' : 'info'),
			body: `<div class="x-alert x-alert-${type}">${html}</div>`,
			foot: `<button class="x-btn x-btn-primary" data-close>${tx('OK')}</button>`,
			onClose,
		});
		return m;
	}

	/* dropdown menu; items: {label, icon, onClick, disabled, danger, sep, static, html, check, href, end} */
	let openMenu = null;
	function menu(anchor, items, { align = 'start', width } = {}) {
		closeMenu();
		const el = h('<div class="x-menu" role="menu"></div>');
		if (width) el.style.minWidth = width + 'px';
		items.filter(Boolean).forEach((it) => {
			if (it.sep) { el.append(h('<div class="x-menu-sep"></div>')); return; }
			if (it.title) { el.append(h(`<div class="x-menu-label x-label">${it.title}</div>`)); return; }
			if (it.node) { el.append(it.node); return; }
			const tag = it.href ? 'a' : 'button';
			const b = h(`<${tag} class="x-menu-item${it.disabled ? ' is-disabled' : ''}${it.danger ? ' danger' : ''}${it.static ? ' static' : ''}${it.blink ? ' blink' : ''}${it.check != null ? ' check' + (it.check ? ' on' : '') : ''}" role="menuitem"${it.href ? ` href="${esc(it.href)}" target="_blank" rel="noopener"` : ' type="button"'}>${it.icon || ''}<span class="x-grow">${it.html || esc(it.label)}</span>${it.end ? `<span class="x-menu-end">${it.end}</span>` : ''}</${tag}>`);
			if (it.onClick) b.addEventListener('click', (e) => { if (!it.keepOpen) closeMenu(); it.onClick(e); });
			else if (it.href) b.addEventListener('click', () => closeMenu());
			el.append(b);
		});
		document.body.append(el);
		const r = anchor.getBoundingClientRect();
		const rtl = document.documentElement.dir === 'rtl';
		let left = (align === 'end') !== rtl ? r.right - el.offsetWidth : r.left;
		left = Math.max(8, Math.min(left, window.innerWidth - el.offsetWidth - 8));
		let top = r.bottom + 6;
		if (top + el.offsetHeight > window.innerHeight - 8) top = Math.max(8, r.top - el.offsetHeight - 6);
		el.style.left = left + 'px';
		el.style.top = top + 'px';
		anchor.setAttribute('aria-expanded', 'true');
		openMenu = { el, anchor };
		setTimeout(() => document.addEventListener('mousedown', menuOutside), 0);
		return el;
	}
	function menuOutside(e) { if (openMenu && !openMenu.el.contains(e.target) && !openMenu.anchor.contains(e.target)) closeMenu(); }
	function closeMenu() {
		if (!openMenu) return;
		openMenu.anchor.setAttribute('aria-expanded', 'false');
		openMenu.el.remove();
		openMenu = null;
		document.removeEventListener('mousedown', menuOutside);
	}
	document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
	window.addEventListener('resize', () => closeMenu());

	function copyText(text) {
		const done = () => toast(tc('COPY') + ' ✓');
		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(text).then(done, () => fallback());
		} else fallback();
		function fallback() {
			const ta = h('<textarea style="position:fixed;opacity:0"></textarea>');
			ta.value = text;
			document.body.append(ta);
			ta.select();
			try { document.execCommand('copy'); done(); } catch (e) {}
			ta.remove();
		}
	}

	/* run the scripts inside a chart snippet (7.x charts are HTML + <script>) */
	function runHtml(el, html) {
		if (window.jQuery) { window.jQuery(el).html(html); return; }
		el.innerHTML = html;
		$$('script', el).forEach((old) => { const s = document.createElement('script'); s.text = old.textContent; old.replaceWith(s); });
	}

	function globalEval(code) {
		if (!code || !String(code).trim()) return;
		try {
			if (window.jQuery) window.jQuery.globalEval(code); else (0, eval)(code);
		} catch (e) { console.warn('[Dashboard Builder] script', e); }
	}

	const fmtDate = (ts) => { try { return new Date(ts * 1000).toLocaleString(); } catch (e) { return ''; } };
	const initials = (n) => (n || '?').split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

	// =============================================================== boot
	const LANGS = [
		['ar-sa', 'عربي'], ['zh-cn', '中文'], ['de-de', 'Deutsch'], ['en-us', 'English'], ['es-es', 'Español'],
		['fr-fr', 'Français'], ['it-it', 'Italiano'], ['ja-ja', '日本語'], ['pt-br', 'Português'], ['ru-ru', 'Русский'],
	];

	const isDark = () => document.documentElement.dataset.theme === 'dark';
	function applyTheme(mode) {
		if (mode === 'dark') document.documentElement.dataset.theme = 'dark';
		else delete document.documentElement.dataset.theme;
	}
	function toggleTheme() {
		const next = isDark() ? 'light' : 'dark';
		store.set('theme', next);
		applyTheme(next);
		paintShell();
	}

	async function boot() {
		let d;
		try {
			d = await api('boot');
		} catch (e) {
			$('#app').innerHTML = `<div class="view-message"><div class="x-alert x-alert-danger">${esc(e.message)}</div></div>`;
			return;
		}
		S.boot = d;
		S.T = d.text || {};
		S.csrf = d.csrf;
		S.state = d.state || {};
		S.edition = d.license ? d.license.edition : '';
		document.documentElement.lang = (d.language || 'en').slice(0, 2);
		document.documentElement.dir = d.dir || 'ltr';
		if (window.moment && S.T.MONTHS) {
			try {
				moment.locale('en', {
					months: S.T.MONTHS.split('_'), monthsShort: S.T.MONTHSSHORT.split('_'), monthsParseExact: true,
					weekdays: S.T.WEEKDAYS.split('_'), weekdaysShort: S.T.WEEKDAYSSHORT.split('_'), weekdaysMin: S.T.WEEKDAYSMIN.split('_'), weekdaysParseExact: true,
				});
			} catch (e) {}
		}
		if (!d.license.valid) {
			$('#app').innerHTML = `<div class="view-message"><div class="x-alert x-alert-danger">${ic('error')}<div><strong>Error! Invalid Product Key</strong></div></div></div>`;
			return;
		}
		if (d.takeatour) { showTour(true); return; }
		if (!d.loggedIn) { showLogin(); return; }
		mountShell();
		route();
	}

	// ============================================================== login
	function showLogin() {
		closeMenu();
		$$('.x-modal-wrap, .x-sheet').forEach((m) => m.remove());
		document.body.classList.remove('x-lock');
		S.canvas = null;
		const first = S.boot && S.boot.firstRun;
		const app = $('#app');
		app.innerHTML = `<div class="x-auth">
			<div class="x-auth-art">
				<div style="display:flex;align-items:center;gap:10px"><img src="${BASE}assets/img/dashboardbuilder_logo_white.png" alt="" style="height:80px;border-radius:8px;padding:3px"></div>
				<div><h2>${esc(t('ART_TITLE'))}</h2><p>${esc(t('ART_TEXT'))}</p></div>
				<div class="x-auth-chart" aria-hidden="true">${[38, 62, 48, 80, 55, 92, 70, 100, 84].map((v) => `<span style="height:${v}%"></span>`).join('')}</div>
			</div>
			<div class="x-auth-form">
				<form class="x-auth-card" autocomplete="off" novalidate>
					<img src="${BASE}assets/img/dashboardbuilder_logo.png" alt="Dashboard Builder" style="height:80px;">
					<div><h1>${tx('LOGIN')}</h1><p class="x-muted" style="margin:4px 0 0">${first ? esc(t('FIRST_RUN')) : esc(t('SIGN_IN_TEXT'))}</p></div>
					<div class="x-login-msg"></div>
					<div class="x-field"><label for="lg-user">${tx('USER')}</label>
						<input class="x-input" id="lg-user" name="username" autocomplete="username" ${first ? 'value="admin" readonly' : ''} required></div>
					<div class="x-field"><label for="lg-pass">${tx('PASSWORD')}</label>
						<div class="x-input-group"><input class="x-input" type="password" id="lg-pass" name="mypassword" autocomplete="${first ? 'new-password' : 'current-password'}" required>
						<button type="button" class="x-btn x-btn-ghost x-btn-sm x-icon-only x-input-btn" data-eye="lg-pass" aria-label="Show password">${ic('visibility')}</button></div></div>
					${first ? `<div class="x-field"><label for="lg-confirm">${tx('CONFIRMPASSWORD')}</label><input class="x-input" type="password" id="lg-confirm" name="confirmpassword" autocomplete="new-password" required></div>` : ''}
					${first ? '' : `<label class="x-check"><input type="checkbox" name="remember" value="yes" checked> ${tx('REMEMBER')}</label>`}
					<button class="x-btn x-btn-primary x-btn-lg x-btn-block" type="submit">${ic('login')}${tx('LOGIN')}</button>
					<div class="x-row x-between" style="font-size:12px">
						<span class="x-muted">Dashboard Builder ${esc(S.boot ? S.boot.version : '')}</span>
						<button type="button" class="x-btn x-btn-ghost x-btn-xs" data-lang>${ic('language', 'i-xs')}${esc((LANGS.find((l) => l[0] === (S.boot && S.boot.language)) || LANGS[3])[1])}</button>
					</div>
				</form>
			</div></div>`;
		bindEyes(app);
		const form = $('form', app);
		$('[data-lang]', app).addEventListener('click', (e) => languageMenu(e.currentTarget));
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const msg = $('.x-login-msg', form);
			msg.innerHTML = '';
			if (first && form.mypassword.value !== form.confirmpassword.value) {
				msg.innerHTML = `<div class="x-alert x-alert-danger">${ic('error')}${tx('PASSWORDMISMATCH')}</div>`;
				return;
			}
			const btn = $('button[type=submit]', form);
			setBtnBusy(btn, true);
			try {
				const r = await api('login', { body: new FormData(form) });
				if (r && r.ok) {
					S.boot = null;
					location.hash = '#/';
					boot();
					return;
				}
				msg.innerHTML = `<div class="x-alert x-alert-danger">${ic('error')}${esc(r.error || t('INVALIDPASSWORD'))}</div>`;
			} catch (err) {
				msg.innerHTML = `<div class="x-alert x-alert-danger">${ic('error')}${esc(err.message)}</div>`;
			}
			setBtnBusy(btn, false);
		});
		setTimeout(() => (first ? $('#lg-pass') : $('#lg-user')).focus(), 50);
	}

	function bindEyes(root) {
		$$('[data-eye]', root).forEach((b) => b.addEventListener('click', () => {
			const inp = $('#' + b.dataset.eye);
			inp.type = inp.type === 'password' ? 'text' : 'password';
			b.innerHTML = ic(inp.type === 'password' ? 'visibility' : 'visibility_off');
		}));
	}

	// ============================================================== shell
	function mountShell() {
		const u = S.boot.user || {};
		$('#app').innerHTML = `<div class="x-app">
			<header class="x-header">
				<div class="x-topbar">
					<a class="x-brand" href="#/" title="Dashboard Builder"><img src="${BASE}assets/img/logo_small.png" alt=""><span class="x-brand-name">Dashboard Builder</span></a>
					<div class="x-crumbs" id="x-crumbs"></div>
					<nav class="x-menubar" aria-label="Menu">
						<button class="x-btn x-btn-ghost" data-menu="file" aria-haspopup="true" aria-expanded="false">${tx('FILE')}</button>
						<button class="x-btn x-btn-ghost" data-menu="edit" aria-haspopup="true" aria-expanded="false">${tx('EDIT')}</button>
						<button class="x-btn x-btn-ghost" data-menu="publish" aria-haspopup="true" aria-expanded="false">${tx('PUBLISH')}</button>
						<button class="x-btn x-btn-ghost" data-menu="window" aria-haspopup="true" aria-expanded="false">${tx('WINDOW')}</button>
					</nav>
					<div class="x-top-actions">
						<button class="x-btn x-btn-ghost x-hide-sm" data-act="reset" title="${tx('RESET')}">${ic('restart_alt')}<span class="x-tool-label">${tx('RESET')}</span></button>
						<button class="x-btn x-btn-primary" data-act="view" title="${tx('VIEW')}">${ic('visibility')}<span class="x-tool-label">${tx('VIEW')}</span></button>
						<button class="x-btn x-btn-ghost x-icon-only" data-act="theme-mode" title="Light / Dark"></button>
						<button class="x-btn x-btn-ghost x-icon-only ${S.boot.license.expired ? 'x-notify' : ''}" data-menu="help" aria-haspopup="true" aria-expanded="false" title="${tx('SUPPORT')}">${ic('help')}</button>
						<button class="x-avatar" data-menu="user" aria-haspopup="true" aria-expanded="false" title="${esc(u.name)}">${esc(initials(u.name))}</button>
					</div>
				</div>
				<div class="x-subbar">
					<nav class="x-tabs" id="x-tabs" aria-label="Screens"></nav>
					<div class="x-status" id="x-status"></div>
				</div>
			</header>
			<div class="x-body"><aside class="x-aside" id="x-aside"></aside><main class="x-main" id="x-main"></main></div>
		</div>`;
		$$('[data-menu]').forEach((b) => b.addEventListener('click', () => {
			if (openMenu && openMenu.anchor === b) { closeMenu(); return; }
			openMainMenu(b.dataset.menu, b);
		}));
		$('[data-act="reset"]').addEventListener('click', () => resetView());
		$('[data-act="view"]').addEventListener('click', () => go('/preview'));
		$('[data-act="theme-mode"]').addEventListener('click', toggleTheme);
		paintShell();
	}

	/* show / hide the left panel (remembered in this browser) */
	function toggleAside() {
		store.set('aside', store.get('aside') === 'off' ? 'on' : 'off');
		paintShell();
		onWinResize();
	}

	function paintShell() {
		const tm = $('[data-act="theme-mode"]');
		if (tm) tm.innerHTML = ic(isDark() ? 'light_mode' : 'dark_mode');
		const off = store.get('aside') === 'off';
		const app = $('.x-app');
		if (app) app.classList.toggle('aside-off', off);
		paintAsideToggle();
		paintCrumbs();
	}

	/* the show / hide button sits in the left panel, after the "Dashboard" heading;
	   hidden = the panel shrinks to its item icons */
	function paintAsideToggle() {
		const off = store.get('aside') === 'off';
		$$('[data-act="aside"]').forEach((at) => {
			at.innerHTML = ic(off ? 'left_panel_open' : 'left_panel_close', 'i-sm');
			const lbl = strip(off ? t('SHOW_PANEL', 'Show Panel') : t('HIDE_PANEL', 'Hide Panel'));
			at.title = lbl;
			at.setAttribute('aria-label', lbl);
			at.setAttribute('aria-expanded', String(!off));
		});
	}

	function paintCrumbs() {
		const el = $('#x-crumbs');
		if (!el) return;
		const st = S.state || {};
		const u = (S.boot && S.boot.user) || {};
		el.innerHTML = `<span class="sep">/</span><span class="file" title="${esc(st.file || '')}">${esc(st.file || strip(t('UNTITLE')))}</span>
			${st.shared ? `<span title="${tx('SHARE')}" style="color:var(--subtle);display:inline-flex">${ic('group', 'i-sm')}</span>` : ''}
			${st.page ? `<span class="sep page">/</span><span class="x-badge brand page">${tx('PAGE')} ${st.page}</span>` : ''}
			<span class="user">/ ${esc(u.name || '')}</span>`;
	}

	function setState(st) {
		if (st) S.state = st;
		paintCrumbs();
		paintAside();
	}

	function paintTabs() {
		const el = $('#x-tabs');
		if (!el) return;
		const sel = S.sel || 0;
		const panel = S.canvas && S.canvas.panels ? S.canvas.panels[sel] : null;
		const ready = panelReady(panel);
		const tabs = [
			['/', 'dashboard', tx('DASHBOARD')],
			['/chart/' + sel, 'insert_chart', tx('CHART_SETTINGS'), !ready],
			['/data/' + sel, 'database', tc('DATA_SOURCE_SETTING')],
			['/theme', 'palette', tx('THEME')],
		];
		const cur = S.route === '/' ? '/' : (S.route === 'chart' ? '/chart/' + S.routeParam : S.route === 'data' ? '/data/' + S.routeParam : '/' + S.route);
		el.innerHTML = tabs.map(([path, icon, label, dis]) => {
			const active = cur === path || (S.route === 'chart' && path.startsWith('/chart/')) || (S.route === 'data' && path.startsWith('/data/'));
			return `<a class="x-tab${active ? ' active' : ''}${dis && !active ? ' is-disabled' : ''}" href="#${path}">${ic(icon, 'i-sm')}${label}</a>`;
		}).join('');
	}

	function paintStatus(html) {
		const el = $('#x-status');
		if (el) el.innerHTML = html || '';
	}

	function panelReady(p) {
		if (!p) return false;
		return !!(p.status && (p.status.connected || ['excel', 'pdf', 'cloud', 'json'].includes(p.status.kind)));
	}

	// ------------------------------------------------------------- menus
	function openMainMenu(which, anchor) {
		const st = S.state || {};
		const lic = S.boot.license;
		const p = S.canvas && S.canvas.panels ? S.canvas.panels[S.sel] : null;
		const inPage = !!st.page;
		if (which === 'file') {
			menu(anchor, [
				{ label: strip(t('NEW')), icon: ic('note_add'), onClick: fileNew },
				{ label: strip(t('OPEN')), icon: ic('folder_open'), onClick: fileOpen },
				{ label: strip(t('SAVE')), icon: ic('save'), onClick: fileSave },
				{ label: strip(t('SAVEAS')), icon: ic('save_as'), onClick: () => fileSaveAs() },
				{ sep: true },
				{ label: strip(t('AUTO_VISUALIZE')), icon: `<span style="color:#7c3aed">${ic('auto_awesome')}</span>`, onClick: () => go('/auto') },
				{ sep: true },
				{ label: strip(t('PRINT')), icon: ic('print'), onClick: () => go('/preview') },
			]);
		} else if (which === 'edit') {
			menu(anchor, [
				{ label: strip(t('PANEL')), icon: ic('add_chart'), onClick: addPanel },
				{ label: strip(t('ADDDATA')), icon: ic('database'), onClick: () => go('/data/' + (S.sel || 0)) },
				{ label: strip(t('CHART_SETTINGS')), icon: ic('insert_chart'), disabled: !panelReady(p), onClick: () => go('/chart/' + (S.sel || 0)) },
				{ label: strip(t('THEME')), icon: ic('palette'), onClick: () => go('/theme') },
				{ sep: true },
				{ label: strip(t('FILTERLABEL')), icon: ic('filter_alt'), check: !!S.filterOpen, onClick: toggleFilter },
				{ label: strip(t('ADD_PAGE')), icon: ic('add_box'), disabled: inPage, onClick: addPage },
			]);
		} else if (which === 'publish') {
			menu(anchor, [
				{ label: strip(t('SHARE')), icon: ic('share'), onClick: showShare },
				{ label: strip(t('GENERATE')), icon: fa('fa-brands fa-php', 'width:18px;text-align:center;color:#777bb3'), onClick: () => showCode('php') },
				{ label: strip(t('HTML')), icon: fa('fa-brands fa-html5', 'width:18px;text-align:center;color:#fc6c05'), onClick: () => showCode('html') },
				{ label: strip(t('WPPLUGIN')), icon: fa('fa-brands fa-wordpress', 'width:18px;text-align:center;color:#207196'), onClick: () => showPackage('wp') },
				{ label: strip(t('LARAVEL')), icon: fa('fa-brands fa-laravel', 'width:18px;text-align:center;color:#EB4E43'), onClick: () => showPackage('laravel') },
				{ label: strip(t('JOOMLA')), icon: fa('fa-brands fa-joomla', 'width:18px;text-align:center;color:#f44336'), onClick: () => showPackage('joomla') },
			]);
		} else if (which === 'window') {
			const items = [
				{ label: strip(t('VIEW')), icon: ic('visibility'), onClick: () => go('/preview') },
				{ sep: true },
				{ label: strip(t('MAIN')), icon: ic('home'), check: !inPage, onClick: () => openPage(0) },
			];
			for (let i = 1; i <= (st.pages || 0); i++) {
				const del = h(`<span class="x-mini" role="button" title="${tx('DELETE')}" style="display:inline-grid;place-items:center;width:22px;height:22px;border-radius:6px;color:var(--danger)">${ic('cancel', 'i-sm')}</span>`);
				items.push({
					label: strip(t('PAGE')) + ' ' + i, icon: ic('description'), check: st.page === i,
					onClick: (e) => { if (e.target.closest('.x-mini')) deletePage(i); else openPage(i); },
					end: del.outerHTML,
				});
			}
			menu(anchor, items);
		} else if (which === 'help') {
			const langSel = h(`<div style="padding:6px 10px 8px"><label class="x-label" style="display:block;margin-bottom:6px">${ic('language', 'i-xs')} ${tx('SELECT_LANGUAGE')}</label>
				<select class="x-select x-input-sm">${LANGS.map(([c, n]) => `<option value="${c}"${c === S.boot.language ? ' selected' : ''}>${n}</option>`).join('')}</select></div>`);
			$('select', langSel).addEventListener('change', (e) => setLanguage(e.target.value));
			menu(anchor, [
				{ node: langSel },
				{ sep: true },
				{ label: strip(t('DOCUMENTAION')), icon: ic('menu_book'), href: 'https://dashboardbuilder.net/documentation' },
				{ label: strip(t('VIDEO_TUTORIAL')), icon: ic('smart_display'), onClick: () => showVideo('guaFfl2sR-M') },
				{ label: strip(t('TAKE_A_TOUR')), icon: ic('explore'), onClick: () => showTour(false) },
				{ label: strip(t('SUPPORT')), icon: ic('support_agent'), href: 'https://dashboardbuilder.net/support' },
				{ sep: true },
				{ label: strip(t('VALID_TILL')) + ': ' + lic.expiry, icon: ic('event'), static: true },
				{ label: strip(t('VERSION')) + ': ' + S.boot.version, icon: ic('info'), static: true },
				{ label: strip(t('LICENSE')) + ': ' + lic.edition, icon: ic('verified'), static: true },
				{ label: strip(t('UPGRADE_LICENSE')), icon: ic('workspace_premium'), href: lic.upgrade, blink: lic.expired },
			], { align: 'end', width: 250 });
		} else if (which === 'user') {
			const u = S.boot.user;
			menu(anchor, [
				{ html: `<div style="display:flex;flex-direction:column"><b>${esc(u.name)}</b><span class="x-muted" style="font-size:11px">${u.admin ? 'Administrator' : (S.boot.cloud ? 'Member #' : 'User #') + esc(u.id)}</span></div>`, static: true, icon: `<span class="x-avatar" style="width:28px;height:28px;font-size:11px">${esc(initials(u.name))}</span>` },
				{ sep: true },
				...(S.boot.cloud ? [] : [   // cloud: users and passwords are managed on the cloud site
					{ label: strip(t('ADDUSER')), icon: ic('person_add'), disabled: !S.boot.canAddUser, onClick: showAddUser },
					{ label: strip(t('CHANGEPASS')), icon: ic('key'), onClick: showChangePass },
					{ label: strip(t('SETTINGS')), icon: ic('settings'), disabled: !S.boot.canSettings, onClick: showSettings },
					{ sep: true },
				]),
				S.boot.cloud   // cloud: no Logout, members go back to the cloud control panel
					? { label: strip(t('BACK_TO_CPANEL', 'Back to Control Panel')), icon: ic('arrow_back'), onClick: () => { location.href = S.boot.cloud.panel; } }
					: { label: strip(t('LOGOUT')), icon: ic('logout'), danger: true, onClick: logout },
			], { align: 'end', width: 230 });
		}
	}

	function languageMenu(anchor) {
		menu(anchor, LANGS.map(([c, n]) => ({ label: n, check: S.boot && c === S.boot.language, onClick: () => setLanguage(c) })), { align: 'end' });
	}

	async function setLanguage(code) {
		try {
			await api('language', { body: { language: code } });
			location.reload();
		} catch (e) { errToast(e); }
	}

	async function logout() {
		const cloud = S.boot && S.boot.cloud;
		let r = null;
		try { r = await api('logout', { body: {} }); } catch (e) {}
		if (cloud) { location.href = (r && r.redirect) || cloud.logout; return; }
		S.boot = null;
		S.canvas = null;
		location.hash = '#/';
		boot();
	}

	function resetView() {
		if (S.route === '/') loadCanvas(true);
		else if (S.route === 'chart') openChart(S.routeParam);
		else if (S.route === 'data') openData(S.routeParam);
		else route();
	}

	// ============================================================== router
	const go = (path) => {
		if (location.hash !== '#' + path) location.hash = path;
		else route();
	};

	let leaveGuard = null;     // returns true when the current screen may be left
	let lastHash = location.hash || '#/';
	async function route() {
		if (!S.boot || !S.boot.loggedIn) return;
		const hash = (location.hash.slice(1) || '/').split('?')[0];
		const parts = hash.split('/').filter(Boolean);
		const name = parts[0] || '';
		const main = $('#x-main');
		if (!main) { mountShell(); return route(); }
		closeMenu();
		/* the preview / auto visualize sheets float above the current screen */
		if (name === 'preview' || name === 'auto') {
			if (!S.sheetFrom) S.sheetFrom = (lastHash && !/^#\/(preview|auto)/.test(lastHash)) ? lastHash : '#/';
			lastHash = location.hash;
			$$('.x-sheet').forEach((s) => s.remove());
			if (!main.children.length) { S.route = '/'; showAside(true); paintTabs(); openCanvas(); }
			if (name === 'preview') openPreview(); else openAuto();
			return;
		}
		if ($('.x-sheet') && S.sheetFrom && (location.hash || '#/') === S.sheetFrom && main.children.length && !S.sheetReload) {
			$$('.x-sheet').forEach((s) => s.remove());
			document.body.classList.remove('x-lock');
			S.sheetFrom = null;
			lastHash = location.hash || '#/';
			return;
		}
		$$('.x-sheet').forEach((s) => s.remove());
		S.sheetFrom = null;
		S.sheetReload = false;
		if (leaveGuard && (location.hash || '#/') !== lastHash) {
			const ok = await leaveGuard();
			if (!ok) { history.replaceState(null, '', lastHash || '#/'); return; }
		}
		leaveGuard = null;
		lastHash = location.hash || '#/';
		main.innerHTML = '';
		document.body.classList.remove('x-lock');
		if (name === 'chart') {
			S.route = 'chart'; S.routeParam = parseInt(parts[1] || '0', 10) || 0; S.sel = S.routeParam;
			showAside(false); paintTabs(); openChart(S.routeParam);
		} else if (name === 'data') {
			S.route = 'data'; S.routeParam = parseInt(parts[1] || '0', 10) || 0; S.sel = S.routeParam;
			showAside(false); paintTabs(); openData(S.routeParam);
		} else if (name === 'theme') {
			S.route = 'theme'; showAside(false); paintTabs(); openTheme();
		} else {
			S.route = '/'; S.routeParam = null; showAside(true); paintTabs(); openCanvas();
		}
	}

	/* close a sheet (preview, auto visualize); reload=true refreshes the screen below */
	function closeSheet(reload) {
		const back = S.sheetFrom || '#/';
		if (reload) S.sheetReload = true;
		if ((location.hash || '#/') === back) { $$('.x-sheet').forEach((s) => s.remove()); S.sheetFrom = null; if (reload) route(); return; }
		location.hash = back;
	}
	window.addEventListener('hashchange', route);


	function showAside(on) {
		const a = $('#x-aside');
		if (!a) return;
		a.classList.toggle('x-hidden', !on);
		const at = $('[data-act="aside"]');
		if (at) at.hidden = !on;
		if (on) paintAside();
	}

	// ============================================================= canvas
	const GAP = 10;                  // space between panels (px)
	const MIN_H = 120;

	const TYPE_ICON = {
		area: 'area_chart', bar: 'bar_chart', line: 'show_chart', histogram: 'equalizer', stack: 'stacked_bar_chart',
		pie: 'pie_chart', donut: 'donut_large', bubble: 'bubble_chart', sunburst: 'data_usage', kpichart: 'trending_up',
		charttable: 'table_chart', gauge: 'speed', map: 'public', heatmap: 'grid_on', scatter3d: 'view_in_ar', sankey: 'alt_route',
		number: 'pin', numberchart: 'pin',
	};
	const typeIcon = (type) => TYPE_ICON[type] || 'insert_chart';

	function panelTitle(p) {
		const raw = strip(p.title || '');
		return raw && raw !== ' ' ? raw : (p.type ? p.defaultTitle : '');
	}

	function openCanvas() {
		const main = $('#x-main');
		main.innerHTML = `
			<div class="x-toolbar" role="toolbar">
				<button class="x-tool" data-t="new" title="${tx('OPEN_NEW_DASHBOARD')}">${ic('note_add')}<span class="x-tool-label opt">${tx('NEW')}</span></button>
				<button class="x-tool" data-t="open" title="${tx('FILE_OPEN')}">${ic('folder_open')}<span class="x-tool-label opt">${tx('OPEN')}</span></button>
				<button class="x-tool" data-t="save" title="${tx('SAVE_CHANGES')}">${ic('save')}<span class="x-tool-label opt">${tx('SAVE')}</span></button>
				<span class="x-sep"></span>
				<button class="x-tool brand" data-t="add" title="${tx('ADD_PANEL')}">${ic('add_chart')}<span class="x-tool-label">${tx('ADD_PANEL')}</span></button>
				<button class="x-tool" data-t="data" title="${tx('ADDDATA')}">${ic('database')}<span class="x-tool-label">${tx('ADDDATA')}</span></button>
				<button class="x-tool" data-t="chart" title="${tx('CHART_SETTINGS')}">${ic('insert_chart')}<span class="x-tool-label">${tx('CHART_SETTINGS')}</span></button>
				<button class="x-tool" data-t="theme" title="${tx('THEME')}">${ic('palette')}<span class="x-tool-label">${tx('THEME')}</span></button>
				<button class="x-tool" data-t="filter" title="${tx('FILTERLABEL')}">${ic('filter_alt')}<span class="x-tool-label">${tx('FILTERLABEL')}</span>${ic('toggle_off', 'x-filter-toggle')}</button>
				<span class="x-sep"></span>
				<button class="x-tool ai" data-t="auto" title="${tx('AUTO_VISUALIZE')}">${ic('auto_awesome')}<span class="x-tool-label">${tx('AUTO_VISUALIZE')}</span></button>
				<button class="x-tool" data-t="php" title="${tx('GENERATE')}">${fa('fa-brands fa-php', 'font-size:17px;color:#777bb3')}<span class="x-tool-label opt">PHP</span></button>
				<button class="x-tool" data-t="share" title="${tx('SHARE')}">${ic('share')}<span class="x-tool-label opt">${tx('SHARE')}</span></button>
				<button class="x-tool" data-t="preview" title="${tx('PREVIEW')}">${ic('visibility')}<span class="x-tool-label opt">${tx('PREVIEW')}</span></button>
				<span class="x-grow"></span>
				<button class="x-btn x-btn-success x-btn-sm" data-t="sample">${ic('dataset', 'i-sm')}${tx('SAMPLE_DATA')}</button>
			</div>
			<div class="x-ruler" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<span>col-${i + 1}</span>`).join('')}</div>
			<div class="x-workspace">
				<div class="x-filterbar x-hidden" id="showhide-filterid"></div>
				<div id="details" class="x-canvas"><div class="x-empty" style="padding-top:120px"><div class="x-spinner"></div></div></div>
			</div>`;
		const actions = {
			new: fileNew, open: fileOpen, save: fileSave, add: addPanel,
			data: () => go('/data/' + (S.sel || 0)), chart: () => go('/chart/' + (S.sel || 0)), theme: () => go('/theme'),
			filter: toggleFilter, auto: () => go('/auto'), php: () => showCode('php'), share: showShare, preview: () => go('/preview'),
			sample: loadSample,
		};
		$$('[data-t]', main).forEach((b) => b.addEventListener('click', () => actions[b.dataset.t] && actions[b.dataset.t]()));
		loadCanvas(false);
	}

	async function loadCanvas(force) {
		const details = $('#details');
		if (!details) return;
		if (force) details.innerHTML = '<div class="x-empty" style="padding-top:120px"><div class="x-spinner"></div></div>';
		try {
			const d = await api('canvas');
			S.canvas = d;
			setState(d.state);
			if (S.sel >= d.panels.length) S.sel = 0;
			S.filterOpen = d.filter.state === 'show' || d.filter.smartquery;
			renderCanvas();
		} catch (e) {
			if (!e.silent) details.innerHTML = `<div class="x-empty">${ic('error')}<div>${esc(e.message)}</div><button class="x-btn x-btn-sm" onclick="location.reload()">${tx('RESET')}</button></div>`;
		}
	}

	function canvasColSize() {
		const c = $('#details');
		return c ? c.clientWidth / 12 : 80;
	}

	function panelRect(p, cs) {
		return {
			left: Math.round(p.left * cs + GAP / 2),
			top: Math.round(p.top),
			width: Math.max(40, Math.round(p.width * cs - GAP)),
			height: Math.max(MIN_H, Math.round(p.height)),
		};
	}

	/* columns run right-to-left in Arabic, like the ruler */
	function place(el, r) {
		const rtl = document.documentElement.dir === 'rtl';
		Object.assign(el.style, { left: rtl ? 'auto' : r.left + 'px', right: rtl ? r.left + 'px' : 'auto', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
	}

	function renderCanvas() {
		const d = S.canvas;
		const details = $('#details');
		if (!d || !details) return;
		// theme of the dashboard (7.x col.php: body colour, panel colour)
		details.classList.toggle('has-theme', !!d.theme.body);
		details.style.setProperty('--canvas-bg', d.theme.body || 'transparent');
		details.style.setProperty('--paper', d.theme.bg || '#ffffff');
		details.innerHTML = '';
		const cs = S.colSize = canvasColSize();
		let bottom = 0;
		d.panels.forEach((p) => {
			const el = buildPanel(p);
			const r = panelRect(p, cs);
			place(el, r);
			details.append(el);
			bottom = Math.max(bottom, r.top + r.height);
		});
		details.style.height = Math.max(bottom + 60, window.innerHeight - 240) + 'px';
		/* the chart scripts write into the filter bar (#filteridshow ...), so it is built first */
		renderFilterBar();
		// charts (7.x engine output)
		d.panels.forEach((p) => {
			if (p.empty || p.failed) return;
			const body = $(`.x-panel[data-i="${p.i}"] .result`, details);
			if (!body) return;
			try { runHtml(body, p.html); } catch (e) { console.warn(e); }
		});
		relayoutAll();
		runFilterScripts();
		selectPanel(S.sel, true);
		paintAside();
	}

	function buildPanel(p) {
		const st = p.status || {};
		let statusBtn;
		if (st.kind === 'excel') statusBtn = `<button class="x-panel-btn file" data-a="data" title="${esc(st.name || tc('CHANGEDATA'))}">${ic('table_view')}</button>`;
		else if (st.kind === 'pdf') statusBtn = `<button class="x-panel-btn pdf" data-a="data" title="${esc(st.name || tc('CHANGEDATA'))}">${ic('picture_as_pdf')}</button>`;
		else if (st.kind === 'cloud') statusBtn = `<button class="x-panel-btn file" data-a="data" title="${tx('GOOGLE_SHEET_FILE')}">${ic('cloud_download')}<i class="x-st ok"></i></button>`;
		else if (st.kind === 'json') statusBtn = `<button class="x-panel-btn file" data-a="data" title="${tx('JSON')}">${ic('data_object')}<i class="x-st ok"></i></button>`;
		else statusBtn = `<button class="x-panel-btn" data-a="data" title="${st.connected ? tx('CHANGEDATA') : tx('ADDDATA')}">${ic('database')}<i class="x-st ${st.connected ? 'ok' : 'bad'}"></i></button>`;

		const title = panelTitle(p);
		const el = h(`<div class="x-panel" data-i="${p.i}" tabindex="0" aria-label="${esc(title || (strip(t('PANEL')) + ' ' + (p.i + 1)))}">
			<div class="x-panel-head" title="${tx('DBL_CLICK_CHARTSETTINGS')}">
				<span class="x-panel-no">${p.i + 1}</span>
				<span class="x-panel-title">${esc(title)}</span>
				${statusBtn}
				<button class="x-panel-btn" data-a="menu" aria-haspopup="true" aria-expanded="false" title="${tx('MENU')}">${ic('more_vert')}</button>
			</div>
			<div class="x-panel-body"><div class="card-body result bgcolor" id="bgcolorid${p.i}"></div></div>
			<div class="x-resize" title="${tx('SIZE')}"></div>
		</div>`);
		const body = $('.x-panel-body', el);
		const result = $('.result', el);
		if (p.chartBg) result.style.background = p.chartBg;
		if (p.numberBg) { el.style.setProperty('--paper', p.numberBg); result.style.background = p.numberBg; result.style.color = p.numberFont || ''; }
		if (p.status && p.status.error) {
			body.append(h(`<div class="x-panel-error"><div class="x-alert x-alert-danger">${ic('error')}<div><strong>${tx('NOTCONNECTED')}</strong><div style="margin-top:4px">${esc(p.status.error)}</div><div style="margin-top:6px">${tx('MOREDETAILS')} <a href="https://dashboardbuilder.net/documentation" target="_blank" rel="noopener">${tx('USERGUIDE')}</a></div></div></div></div>`));
		} else if (p.failed) {
			const box = h('<div class="x-panel-error"></div>');
			runHtml(box, p.html);
			body.append(box);
		} else if (p.empty) {
			const ready = panelReady(p);
			const empty = h(`<div class="x-panel-empty">
				<div class="x-empty-art"><span style="height:45%"></span><span style="height:80%"></span><span style="height:60%"></span><span style="height:95%"></span></div>
				<b>${ready ? tx('CHART_SETTINGS') : tx('ADDDATA')}</b>
				<small>${ready ? tx('SELECT_X_Y') : tx('HOW_CONNECT_YOUR_DATA')}</small>
				<button class="x-btn x-btn-sm" type="button">${ic(ready ? 'insert_chart' : 'database', 'i-sm')}${ready ? tx('CHART_SETTINGS') : tx('ADDDATA')}</button>
			</div>`);
			empty.addEventListener('click', () => go(ready ? '/chart/' + p.i : '/data/' + p.i));
			body.append(empty);
		}
		const head = $('.x-panel-head', el);
		head.addEventListener('dblclick', (e) => { if (!e.target.closest('button')) go(panelReady(p) ? '/chart/' + p.i : '/data/' + p.i); });
		el.addEventListener('mousedown', () => selectPanel(p.i));
		el.addEventListener('focus', () => selectPanel(p.i));
		el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target === el) go(panelReady(p) ? '/chart/' + p.i : '/data/' + p.i); });
		$('[data-a="data"]', el).addEventListener('click', (e) => { e.stopPropagation(); go('/data/' + p.i); });
		$('[data-a="menu"]', el).addEventListener('click', (e) => {
			e.stopPropagation();
			const b = e.currentTarget;
			if (openMenu && openMenu.anchor === b) { closeMenu(); return; }
			menu(b, [
				{ label: strip(t('CHART_SETTINGS')), icon: ic('settings'), disabled: !panelReady(p), onClick: () => go('/chart/' + p.i) },
				{ label: strip(t('ADDDATA')), icon: ic('database'), onClick: () => go('/data/' + p.i) },
				{ label: strip(t('DUPLICATE')), icon: ic('content_copy'), onClick: () => copyPanel(p.i) },
				{ sep: true },
				{ label: strip(t('DELETE')), icon: ic('delete'), danger: true, disabled: p.i === 0, onClick: () => deletePanel(p.i) },
			], { align: 'end' });
		});
		bindDrag(el, head, p);
		bindResize(el, $('.x-resize', el), p);
		return el;
	}

	function relayoutPanel(i) {
		const el = $(`.x-panel[data-i="${i}"]`);
		const gd = document.getElementById('col' + i);
		if (!el || !gd || !window.DashboardBuilder) return;
		const body = $('.x-panel-body', el);
		if (!gd.classList.contains('js-plotly-plot') && !gd._fullLayout) return;
		try {
			DashboardBuilder.relayout('col' + i, { width: Math.max(60, body.clientWidth - 12), height: Math.max(60, body.clientHeight - 10) });
		} catch (e) {}
	}

	function relayoutAll() {
		if (!S.canvas) return;
		S.canvas.panels.forEach((p) => relayoutPanel(p.i));
	}

	const onWinResize = debounce(() => {
		if (S.route !== '/' || !S.canvas || !$('#details .x-panel')) return;
		const cs = S.colSize = canvasColSize();
		S.canvas.panels.forEach((p) => {
			const el = $(`.x-panel[data-i="${p.i}"]`);
			if (!el) return;
			const r = panelRect(p, cs);
			place(el, r);
		});
		relayoutAll();
	}, 120);
	window.addEventListener('resize', onWinResize);

	function selectPanel(i, quiet) {
		if (!S.canvas) return;
		S.sel = i;
		$$('#details .x-panel').forEach((el) => el.classList.toggle('active', +el.dataset.i === i));
		const p = S.canvas.panels[i];
		const el = $(`.x-panel[data-i="${i}"]`);
		if (p && el) {
			paintStatus(`<span><b>${tx('PANEL')}</b> ${i + 1}</span><span><b>${tx('SIZE')}</b> ${Math.round(el.offsetWidth)}, ${Math.round(el.offsetHeight)}</span><span><b>${tx('POSITION')}</b> ${Math.round(el.offsetLeft)}, ${Math.round(el.offsetTop)}</span><span><b>col</b> ${p.left + 1}–${Math.min(12, p.left + p.width)}</span>`);
		}
		const ready = panelReady(p);
		const tb = $('.x-toolbar [data-t="chart"]');
		if (tb) tb.classList.toggle('is-disabled', !ready);
		if (!quiet) paintTabs();
		else paintTabs();
		$$('#x-aside [data-panel]').forEach((n) => n.classList.toggle('active', +n.dataset.panel === i));
	}

	// ------------------------------------------------------- drag & resize
	function bindDrag(el, handle, p) {
		handle.addEventListener('pointerdown', (e) => {
			if (e.button !== 0 || e.target.closest('button')) return;
			e.preventDefault();
			selectPanel(p.i);
			const start = { x: e.clientX, y: e.clientY, l: el.offsetLeft, t: el.offsetTop };
			const cs = S.colSize;
			const ghost = h('<div class="x-snap"></div>');
			el.parentNode.append(ghost);
			el.classList.add('dragging');
			handle.setPointerCapture(e.pointerId);
			let col = p.left;
			let top = p.top;
			const move = (ev) => {
				let nl = start.l + (ev.clientX - start.x);
				let nt = Math.max(0, start.t + (ev.clientY - start.y));
				el.style.left = nl + 'px';
				el.style.right = 'auto';
				el.style.top = nt + 'px';
				const rtl = document.documentElement.dir === 'rtl';
				col = Math.round((rtl ? el.parentNode.clientWidth - nl - el.offsetWidth - GAP / 2 : nl - GAP / 2) / cs);
				col = Math.max(0, Math.min(11, col));
				top = Math.round(nt);
				const r = panelRect({ left: col, top, width: p.width, height: p.height }, cs);
				place(ghost, r);
				paintStatus(`<span><b>${tx('PANEL')}</b> ${p.i + 1}</span><span><b>${tx('POSITION')}</b> ${Math.round(nl)}, ${top}</span><span><b>col</b> ${col + 1}</span>`);
			};
			const up = () => {
				handle.removeEventListener('pointermove', move);
				handle.removeEventListener('pointerup', up);
				handle.removeEventListener('pointercancel', up);
				ghost.remove();
				el.classList.remove('dragging');
				const changed = col !== p.left || top !== p.top;
				p.left = col;
				p.top = top;
				const r = panelRect(p, S.colSize);
				place(el, r);
				growCanvas();
				selectPanel(p.i);
				if (changed) saveLayout();
			};
			handle.addEventListener('pointermove', move);
			handle.addEventListener('pointerup', up);
			handle.addEventListener('pointercancel', up);
		});
	}

	function bindResize(el, grip, p) {
		grip.addEventListener('pointerdown', (e) => {
			if (e.button !== 0) return;
			e.preventDefault();
			e.stopPropagation();
			selectPanel(p.i);
			const start = { x: e.clientX, y: e.clientY, w: el.offsetWidth, h: el.offsetHeight };
			const cs = S.colSize;
			el.classList.add('resizing');
			grip.setPointerCapture(e.pointerId);
			let width = p.width;
			let height = p.height;
			const move = (ev) => {
				const nw = Math.max(cs * 0.6, start.w + (ev.clientX - start.x) * (document.documentElement.dir === 'rtl' ? -1 : 1));
				const nh = Math.max(MIN_H, start.h + (ev.clientY - start.y));
				el.style.width = nw + 'px';
				el.style.height = nh + 'px';
				/* 7.x adjustwidth(): the width snaps to whole columns */
				width = Math.max(1, Math.min(12, Math.ceil((nw + GAP) / cs - 0.15)));
				height = Math.round(nh);
				paintStatus(`<span><b>${tx('PANEL')}</b> ${p.i + 1}</span><span><b>${tx('SIZE')}</b> ${Math.round(nw)}, ${height}</span><span><b>col</b> ${width}</span>`);
			};
			const up = () => {
				grip.removeEventListener('pointermove', move);
				grip.removeEventListener('pointerup', up);
				grip.removeEventListener('pointercancel', up);
				el.classList.remove('resizing');
				const changed = width !== p.width || height !== p.height;
				p.width = width;
				p.height = height;
				const r = panelRect(p, S.colSize);
				el.style.width = r.width + 'px';
				el.style.height = r.height + 'px';
				relayoutPanel(p.i);
				growCanvas();
				selectPanel(p.i);
				if (changed) saveLayout();
			};
			grip.addEventListener('pointermove', move);
			grip.addEventListener('pointerup', up);
			grip.addEventListener('pointercancel', up);
		});
	}

	function growCanvas() {
		const details = $('#details');
		if (!details || !S.canvas) return;
		let bottom = 0;
		$$('.x-panel', details).forEach((el) => { bottom = Math.max(bottom, el.offsetTop + el.offsetHeight); });
		details.style.height = Math.max(bottom + 60, window.innerHeight - 240) + 'px';
	}

	/* 7.x col.php: left[], top[], height[], width[] (+ showhidefilter) */
	const saveLayout = debounce(async () => {
		if (!S.canvas) return;
		const ps = S.canvas.panels;
		try {
			await api('layout_save', { body: {
				left: ps.map((p) => p.left), top: ps.map((p) => p.top), height: ps.map((p) => p.height), width: ps.map((p) => p.width),
				showhidefilter: S.filterOpen ? 'show' : 'hide',
			} });
		} catch (e) { errToast(e); }
	}, 250);

	// ------------------------------------------------------ panel actions
	async function addPanel() {
		if (S.route !== '/') { go('/'); setTimeout(addPanel, 600); return; }
		if (!S.canvas) return;
		const ps = S.canvas.panels;
		let bottom = 0;
		ps.forEach((p) => { bottom = Math.max(bottom, p.top + p.height); });
		const p = {
			i: ps.length, title: '', defaultTitle: '', type: '', source: '', status: { kind: 'db-off', connected: false, error: '' },
			left: 0, top: ps.length ? Math.round(bottom + GAP) : 0, width: 4, height: 450, html: '', empty: true, failed: false,
		};
		ps.push(p);
		const el = buildPanel(p);
		const r = panelRect(p, S.colSize || canvasColSize());
		place(el, r);
		$('#details').append(el);
		growCanvas();
		selectPanel(p.i);
		paintAside();
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		saveLayout();
	}

	async function deletePanel(i) {
		const p = S.canvas && S.canvas.panels[i];
		if (!p || i === 0) return;
		const ok = await confirmBox(`${tx('DELETE')} <b>${esc(panelTitle(p) || (strip(t('PANEL')) + ' ' + (i + 1)))}</b>?`, { title: tx('DELETE'), danger: true, ok: tx('DELETE'), icon: ic('delete') });
		if (!ok) return;
		try {
			await api('panel_delete', { body: { col: i } });
			if (S.sel === i) S.sel = Math.max(0, i - 1);
			loadCanvas(true);
		} catch (e) { errToast(e); }
	}

	async function copyPanel(i) {
		try {
			busy(true, tc('DUPLICATE'));
			await api('panel_copy', { body: { col: i } });
			S.sel = S.canvas.panels.length;
			await loadCanvas(true);
			const el = $(`.x-panel[data-i="${S.sel}"]`);
			if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		} catch (e) { errToast(e); } finally { busy(false); }
	}

	// --------------------------------------------------------------- filter
	function toggleFilter() {
		if (S.route !== '/') { go('/'); return; }
		S.filterOpen = !S.filterOpen;
		paintFilterToggle();
		saveLayout();
	}

	function paintFilterToggle() {
		const bar = $('#showhide-filterid');
		const tgl = $('.x-toolbar [data-t="filter"]');
		if (tgl) {
			tgl.classList.toggle('active', !!S.filterOpen);
			const ti = $('.x-filter-toggle', tgl);
			if (ti) ti.outerHTML = ic(S.filterOpen ? 'toggle_on' : 'toggle_off', 'x-filter-toggle');
		}
		if (bar) bar.classList.toggle('x-hidden', !S.filterOpen);
	}

	/* 7.x col.php filter bar: date / number / list filters + Smart Query */
	function renderFilterBar() {
		const bar = $('#showhide-filterid');
		const d = S.canvas;
		paintFilterToggle();
		if (!bar || !d) return;
		const spans = '<span id="defaultfilterid" class="x-filter-spans"><span id="datefilteridshow"></span><span id="numberfilteridshow"></span><span id="filteridshow"></span></span>';
		if (!d.filter.found) {
			bar.innerHTML = `${ic('filter_alt_off', 'x-filter-ico')}<span>${tx('NO_FILTER')} <a href="https://dashboardbuilder.net/apply-filter-to-a-chart" target="_blank" rel="noopener">${tx('HOWTO_APPLY_FILTER')}</a></span><span hidden>${spans}</span>`;
			return;
		}
		bar.innerHTML = `${ic('filter_alt', 'x-filter-ico')}
			${spans}
			${d.filter.smartquery ? `<form class="x-smart" id="nlp-query" autocomplete="off">
				${ic('auto_awesome', 'i-sm')}<input class="x-input" type="text" name="smart-query" id="smart-query" placeholder="Ask Smart Query" aria-label="Smart Query">
				<button class="x-btn x-btn-primary x-btn-sm x-icon-only" type="submit" title="Submit Query">${ic('send', 'i-sm')}</button></form>` : ''}
			<button class="x-btn x-btn-ghost x-btn-sm x-icon-only" type="button" data-refresh title="${tx('RESET')}">${ic('refresh', 'i-sm')}</button>`;
		$('[data-refresh]', bar).addEventListener('click', () => loadCanvas(true));
		const f = $('#nlp-query', bar);
		if (f) f.addEventListener('submit', (e) => { e.preventDefault(); smartQuery(f['smart-query'].value); });
	}

	/* 7.x filter widgets (generated by the chart engine) */
	function runFilterScripts() {
		const d = S.canvas;
		if (!d || !d.filter.found) return;
		globalEval(d.scripts.NF0);
		globalEval(d.scripts.NF);
		if (window.jQuery && jQuery.fn.selectpicker) { try { jQuery('#filteridshow .selectpicker').selectpicker(); } catch (e) {} }
		if (d.scripts.DF && window.DateRangePicker && $('#datetimerange-input1')) {
			try {
				const fn = new Function('start', 'end', d.scripts.DF);
				new DateRangePicker('datetimerange-input1', {
					timePicker: false, alwaysShowCalendars: true,
					ranges: {
						[strip(t('TODAY'))]: [moment().startOf('day'), moment().endOf('day')],
						[strip(t('YESTERDAY'))]: [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
						[strip(t('LAST7DAYS'))]: [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
						[strip(t('THISMONTH'))]: [moment().startOf('month').startOf('day'), moment().endOf('month').endOf('day')],
					},
					locale: { direction: document.documentElement.dir, format: 'YYYY-MM-DD', applyLabel: strip(t('APPLY')), cancelLabel: strip(t('CANCEL')), customRangeLabel: strip(t('CUSTOMRANGE')) },
				}, function (start, end) { fn(start, end); });
			} catch (e) { console.warn(e); }
		}
	}

	/* 7.x col.php: Smart Query answers come from the published dashboard */
	async function smartQuery(q) {
		if (!q.trim()) return;
		const details = $('#details');
		details.innerHTML = '<div class="x-empty" style="padding-top:120px"><div class="x-spinner"></div></div>';
		details.style.height = '';
		try {
			const fd = new FormData();
			fd.append('smart-query', q);
			fd.append('sq-filename', S.state.file || '');
			const r = await fetch(BASE + 'dashboard?fragment=1', { method: 'POST', body: fd, credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
			const html = await r.text();
			details.classList.add('x-canvas-view');
			runHtml(details, html);
		} catch (e) { errToast(e); }
	}

	// ---------------------------------------------------------------- pages
	async function openPage(n) {
		if (S.route !== '/') location.hash = '#/';
		try {
			const r = await api('page', { body: n ? { do: 'open', page: n } : { do: 'main' } });
			setState(r.state);
			S.sel = 0;
			if (S.route === '/') loadCanvas(true);
		} catch (e) { errToast(e); }
	}

	async function addPage() {
		if (S.state.page) return;
		try {
			const r = await api('page', { body: { do: 'add' } });
			setState(r.state);
			S.sel = 0;
			toast(strip(t('PAGE')) + ' ' + r.state.page);
			if (S.route === '/') loadCanvas(true); else go('/');
		} catch (e) { errToast(e); }
	}

	async function deletePage(n) {
		const ok = await confirmBox(esc(strip(t('PAGE_DEL_CONFIRM'))) + ' #' + n, { title: tx('DELETE'), danger: true, ok: tx('DELETE'), icon: ic('delete') });
		if (!ok) return;
		try {
			const r = await api('page', { body: { do: 'delete', page: n } });
			setState(r.state);
			S.sel = 0;
			if (S.route === '/') loadCanvas(true);
		} catch (e) { errToast(e); }
	}

	/* drill-through pages and Smart Query open inside the canvas; "back" returns here */
	function backToCanvas() {
		const details = $('#details');
		if (details) details.classList.remove('x-canvas-view');
		if (S.route === '/') loadCanvas(true); else go('/');
	}

	// ---------------------------------------------------------------- aside
	function paintAside() {
		const a = $('#x-aside');
		if (!a || a.classList.contains('x-hidden')) return;
		const st = S.state || {};
		const ps = (S.canvas && S.canvas.panels) || [];
		let pages = `<div class="x-nav-item x-nav-main${!st.page ? ' active' : ''}" data-page="0" role="button" tabindex="0" title="${tx('MAIN')}">${ic('dashboard', 'i-sm')}<span class="x-nav-text">${tx('MAIN')}</span>
			<button class="x-btn x-btn-ghost x-btn-xs x-icon-only x-aside-tgl" data-act="aside" aria-controls="x-aside"></button></div>`;
		for (let i = 1; i <= (st.pages || 0); i++) {
			pages += `<div class="x-nav-item${st.page === i ? ' active' : ''}" data-page="${i}" role="button" tabindex="0" title="${tx('PAGE')} ${i}">${ic('description', 'i-sm')}<span class="x-nav-text">${tx('PAGE')} ${i}</span>
				<span class="x-nav-act"><button class="x-mini" data-delpage="${i}" title="${tx('DELETE')}">${ic('close', 'i-xs')}</button></span></div>`;
		}
		const layers = ps.map((p) => {
			const ttl = panelTitle(p) || (strip(t('PANEL')) + ' ' + (p.i + 1));
			const ok = panelReady(p);
			return `<div class="x-nav-item${p.i === S.sel ? ' active' : ''}" data-panel="${p.i}" role="button" tabindex="0" title="${esc(ttl)}">
				${ic(p.type ? typeIcon(p.type) : 'crop_square', 'i-sm')}<span class="x-nav-text">${esc(ttl)}</span>
				<span class="x-dot ${ok ? 'ok' : (p.status && p.status.error ? 'bad' : '')}" title="${ok ? tx('CONNECTED') : tx('ADDDATA')}"></span></div>`;
		}).join('');
		a.innerHTML = `
			<div class="x-aside-sec">
				<div class="x-aside-title"><span class="x-label">${tx('DRILLTHROUGH')}</span>
					<button class="x-btn x-btn-ghost x-btn-xs x-icon-only" data-addpage title="${tx('ADD_PAGE')}" ${st.page ? 'disabled' : ''}>${ic('add', 'i-sm')}</button></div>
				${pages}
			</div>
			<div class="x-aside-sec">
				<div class="x-aside-title"><span class="x-label">${tx('DASHBOARD')} · ${ps.length}</span>
					<button class="x-btn x-btn-ghost x-btn-xs x-icon-only" data-addpanel title="${tx('ADD_PANEL')}">${ic('add', 'i-sm')}</button></div>
				${layers || `<div class="x-help" style="padding:4px 8px">${tx('HOW_CONNECT_YOUR_DATA')}</div>`}
			</div>
			<div class="x-aside-foot">
				<button class="x-nav-item" data-go="/auto" title="${tx('AUTO_VISUALIZE')}">${ic('auto_awesome', 'i-sm')}<span class="x-nav-text">${tx('AUTO_VISUALIZE')}</span></button>
				<a class="x-nav-item" href="https://dashboardbuilder.net/documentation" target="_blank" rel="noopener" title="${tx('DOCUMENTAION')}">${ic('menu_book', 'i-sm')}<span class="x-nav-text">${tx('DOCUMENTAION')}</span></a>
				<button class="x-nav-item" data-tour title="${tx('TAKE_A_TOUR')}">${ic('explore', 'i-sm')}<span class="x-nav-text">${tx('TAKE_A_TOUR')}</span></button>
			</div>`;
		$$('[data-page]', a).forEach((n) => {
			const open = (e) => { if (e.target.closest('[data-delpage], [data-act="aside"]')) return; openPage(+n.dataset.page); };
			n.addEventListener('click', open);
			n.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(e); });
		});
		$$('[data-delpage]', a).forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); deletePage(+b.dataset.delpage); }));
		$$('[data-panel]', a).forEach((n) => {
			const i = +n.dataset.panel;
			n.addEventListener('click', () => {
				selectPanel(i);
				const el = $(`.x-panel[data-i="${i}"]`);
				if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			});
			n.addEventListener('dblclick', () => { const p = S.canvas.panels[i]; go(panelReady(p) ? '/chart/' + i : '/data/' + i); });
			n.addEventListener('keydown', (e) => { if (e.key === 'Enter') n.click(); });
		});
		const ap = $('[data-addpage]', a); if (ap) ap.addEventListener('click', addPage);
		$('[data-addpanel]', a).addEventListener('click', addPanel);
		$('[data-go="/auto"]', a).addEventListener('click', () => go('/auto'));
		$('[data-tour]', a).addEventListener('click', () => showTour(false));
		$('[data-act="aside"]', a).addEventListener('click', (e) => { e.stopPropagation(); toggleAside(); });
		paintAsideToggle();
	}

	// ============================================================== files
	/* a sortable list of stored dashboards (7.x showfiles.php) */
	function fileTable(files, { onPick, onOpen, current }) {
		const wrap = h(`<div class="x-table-wrap" style="max-height:46vh"><table class="x-table x-files">
			<thead><tr><th style="width:36px"></th><th data-k="name" role="button">${tx('FILE_NAME')}</th><th data-k="bytes" role="button" style="width:110px">${tx('SIZE')}</th><th data-k="time" role="button" style="width:190px">${tx('DATE', 'Date')}</th></tr></thead>
			<tbody></tbody></table></div>`);
		const tbody = $('tbody', wrap);
		let sortKey = 'name';
		let dir = 1;
		const paint = () => {
			const rows = files.slice().sort((a, b) => {
				const x = a[sortKey], y = b[sortKey];
				return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))) * dir;
			});
			if (!rows.length) {
				tbody.innerHTML = `<tr><td colspan="4"><div class="x-empty" style="padding:28px">${ic('folder_off')}<div>${tx('SELECT_FILE')}</div></div></td></tr>`;
				return;
			}
			tbody.innerHTML = rows.map((f) => {
				const icon = f.ext === 'link' ? ic('link') : ic('dashboard');
				const name = f.ext === 'link'
					? `<a href="${esc(f.link)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${esc(f.name)}</a>${f.by ? ` <span class="x-muted" style="font-size:11px">· ${esc(f.by)}</span>` : ''}`
					: esc(f.name);
				return `<tr data-v="${esc(f.value)}" data-n="${esc(f.name)}" data-e="${esc(f.ext)}" tabindex="0" class="${current && f.name === current && f.ext !== 'link' ? 'cur' : ''}">
					<td style="color:var(--primary-2)">${icon}</td><td><b>${name}</b></td><td class="x-mono" style="font-size:12px">${esc(f.size)}</td><td class="x-muted" style="font-size:12px">${esc(fmtDate(f.time))}</td></tr>`;
			}).join('');
			$$('tr[data-v]', tbody).forEach((tr) => {
				const pick = () => { $$('tr', tbody).forEach((r) => r.classList.remove('active')); tr.classList.add('active'); onPick && onPick(tr.dataset); };
				tr.addEventListener('click', pick);
				tr.addEventListener('dblclick', () => { pick(); onOpen && onOpen(tr.dataset); });
				tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') { pick(); onOpen && onOpen(tr.dataset); } });
			});
		};
		$$('th[data-k]', wrap).forEach((th) => th.addEventListener('click', () => {
			const k = th.dataset.k;
			dir = sortKey === k ? -dir : 1;
			sortKey = k;
			$$('th[data-k]', wrap).forEach((x) => x.removeAttribute('aria-sort'));
			th.setAttribute('aria-sort', dir > 0 ? 'ascending' : 'descending');
			paint();
		}));
		paint();
		return wrap;
	}

	/* after the working dashboard changed (new / open / sample) */
	function afterFileChange(st) {
		setState(st);
		S.sel = 0;
		if (S.route === '/') loadCanvas(true); else go('/');
	}

	async function fileNew() {
		const ok = await confirmBox(esc(strip(t('SURE_NEW_DASHBOARD'))), { title: tx('OPEN_NEW_DASHBOARD'), icon: ic('note_add'), ok: tx('CONFIRM_YES') });
		if (!ok) return;
		try {
			const r = await api('file_new', { body: {} });
			afterFileChange(r.state);
		} catch (e) { errToast(e); }
	}

	async function fileOpen() {
		let d;
		try { busy(true, tc('OPEN')); d = await api('files', { query: { type: 'open' } }); } catch (e) { errToast(e); return; } finally { busy(false); }
		let picked = null;
		const body = h(`<div class="x-col" style="gap:12px">
			<div class="x-row" style="gap:8px"><span class="x-label">${tx('FILE_NAME')}:</span><b class="x-picked" style="color:var(--primary)">—</b></div>
			<div class="x-search">${ic('search', 'i-sm')}<input class="x-input x-input-sm" type="search" placeholder="${tx('SEARCH', 'Search')}" aria-label="${tx('SEARCH', 'Search')}"></div>
		</div>`);
		let table;
		const doOpen = async () => {
			if (!picked) { $('.x-picked', body).innerHTML = `<span style="color:var(--danger)">${tx('SELECT_FILE')}</span>`; return; }
			const btn = $('[data-ok]', m.el);
			setBtnBusy(btn, true);
			try {
				const r = await api('file_open', { body: { file: picked.v } });
				if (r.redirect) { m.close(); window.open(r.redirect, '_blank', 'noopener'); return; }
				m.close();
				afterFileChange(r.state);
				toast(strip(t('OPEN')) + ': ' + picked.n);
			} catch (e) { errToast(e); setBtnBusy(btn, false); }
		};
		const mkTable = (list) => fileTable(list, {
			current: d.current,
			onPick: (row) => { picked = row; $('.x-picked', body).textContent = row.n; },
			onOpen: (row) => { picked = row; doOpen(); },
		});
		table = mkTable(d.files);
		body.append(table);
		$('input[type=search]', body).addEventListener('input', (e) => {
			const q = e.target.value.trim().toLowerCase();
			const nt = mkTable(d.files.filter((f) => !q || f.name.toLowerCase().includes(q)));
			table.replaceWith(nt);
			table = nt;
		});
		const m = modal({
			title: tx('FILE_OPEN'), icon: ic('folder_open'), size: 'lg', body,
			foot: `<button class="x-btn" data-close>${tx('CANCEL')}</button><button class="x-btn x-btn-primary" data-ok>${ic('folder_open', 'i-sm')}${tx('OPEN')}</button>`,
		});
		$('[data-ok]', m.el).addEventListener('click', doOpen);
	}

	async function fileSave() {
		try {
			busy(true, tc('SAVE'));
			const r = await api('file_save', { body: {} });
			busy(false);
			if (r.needName) { fileSaveAs(); return; }
			setState(r.state);
			toast(strip(t('SAVE')) + ': ' + (r.state.file || ''));
		} catch (e) { busy(false); errToast(e); }
	}

	async function fileSaveAs() {
		let d;
		try { busy(true, tc('SAVEAS')); d = await api('files', { query: { type: 'save' } }); } catch (e) { errToast(e); return; } finally { busy(false); }
		const body = h(`<form class="x-col" style="gap:12px" autocomplete="off" novalidate>
			<div class="x-field"><label for="sv-name">${tx('FILE_NAME')}</label>
				<input class="x-input" id="sv-name" name="filename" placeholder="Dashboard Name" maxlength="120" value="${esc(S.state.file || '')}" required autofocus>
				<div class="x-err" hidden>${tx('ENTER_FILE_NAME')}</div></div>
		</form>`);
		const inp = $('#sv-name', body);
		body.append(fileTable(d.files, {
			current: d.current,
			onPick: (row) => { inp.value = row.n; },
			onOpen: (row) => { inp.value = row.n; doSave(); },
		}));
		const doSave = async () => {
			const name = inp.value.trim();
			const err = $('.x-err', body);
			if (!name) { err.hidden = false; inp.focus(); return; }
			err.hidden = true;
			const btn = $('[data-ok]', m.el);
			setBtnBusy(btn, true);
			try {
				const r = await api('file_saveas', { body: { filename: name } });
				m.close();
				setState(r.state);
				toast(strip(t('SAVE')) + ': ' + r.state.file);
			} catch (e) { errToast(e); setBtnBusy(btn, false); }
		};
		body.addEventListener('submit', (e) => { e.preventDefault(); doSave(); });
		const m = modal({
			title: tx('FILE') + ' ' + tx('SAVE'), icon: ic('save_as'), size: 'lg', body,
			foot: `<button class="x-btn" data-close>${tx('CANCEL')}</button><button class="x-btn x-btn-primary" data-ok>${ic('save', 'i-sm')}${tx('SAVE')}</button>`,
		});
		$('[data-ok]', m.el).addEventListener('click', doSave);
		setTimeout(() => { inp.focus(); inp.select(); }, 40);
	}

	async function loadSample() {
		try {
			busy(true, tc('SAMPLE_DATA'));
			const r = await api('sample_load', { body: {} });
			afterFileChange(r.state);
		} catch (e) { errToast(e); } finally { busy(false); }
	}

	/* 7.x: "Please save the dashboard first" */
	function noFileBox(title) {
		alertBox(tx('NO_FILE_NAME'), { title: title || tx('FILE_SHARE'), icon: ic('save') });
	}

	// ============================================================ publish
	async function showShare() {
		let d;
		try { busy(true, tc('SHARE')); d = await api('share'); } catch (e) { errToast(e); return; } finally { busy(false); }
		if (d.noFile) { noFileBox(tx('FILE_SHARE')); return; }
		const sel = new Set((d.selected || []).map(String));
		const body = h(`<div class="x-col" style="gap:16px">
			<div class="x-field"><label>${tx('COPYLINK')}</label>
				<div class="x-input-group"><input class="x-input x-mono" readonly value="${esc(d.link)}" aria-label="Link" style="font-size:12px">
				<button type="button" class="x-btn x-btn-soft x-btn-sm x-input-btn" data-copy>${ic('link', 'i-sm')}${tx('COPYLINK')}</button></div></div>
			<div class="x-field"><label>${tx('SHARE')}</label>
				<div class="x-seg" role="radiogroup">
					<label><input type="radio" name="linkoption" value="globe" ${d.option !== 'restricted' ? 'checked' : ''}><span>${ic('public', 'i-sm')}${tx('PUBLICLINK')}</span></label>
					<label><input type="radio" name="linkoption" value="restricted" ${d.option === 'restricted' ? 'checked' : ''}><span>${ic('lock', 'i-sm')}${tx('RESTRICTED')}</span></label>
				</div></div>
			<div class="x-field x-users" ${d.option === 'restricted' ? '' : 'hidden'}><label>${tx('ADDPEOPLE')}</label>
				<div class="x-multi">${(d.users || []).map((u) => `<label class="x-chip${sel.has(String(u.userid)) ? ' on' : ''}"><input type="checkbox" value="${esc(u.userid)}" ${sel.has(String(u.userid)) ? 'checked' : ''}>${ic('person', 'i-xs')}${esc(u.username)}</label>`).join('') || `<span class="x-muted">—</span>`}</div></div>
		</div>`);
		$('[data-copy]', body).addEventListener('click', () => copyText(d.link));
		$$('input[name=linkoption]', body).forEach((r) => r.addEventListener('change', () => { $('.x-users', body).hidden = r.value !== 'restricted' || !r.checked; }));
		$$('.x-chip input', body).forEach((c) => c.addEventListener('change', () => c.parentNode.classList.toggle('on', c.checked)));
		const m = modal({
			title: tx('FILE_SHARE'), icon: ic('share'), body,
			foot: `<button class="x-btn" data-close>${tx('CLOSE')}</button><button class="x-btn x-btn-primary" data-ok>${ic('share', 'i-sm')}${tx('SHARE')}</button>`,
		});
		$('[data-ok]', m.el).addEventListener('click', async (e) => {
			const btn = e.currentTarget;
			setBtnBusy(btn, true);
			try {
				const opt = $('input[name=linkoption]:checked', body).value;
				const users = $$('.x-chip input:checked', body).map((c) => c.value);
				const r = await api('share_save', { body: { linkoption: opt, listuser: users } });
				m.close();
				setState(r.state);
				toast(strip(t('SHARE')) + ' ✓');
			} catch (err) { errToast(err); setBtnBusy(btn, false); }
		});
	}

	async function showCode(kind) {
		let d;
		try { busy(true, kind === 'html' ? tc('HTML') : tc('GENERATE')); d = await api('code', { query: { kind } }); } catch (e) { errToast(e); return; } finally { busy(false); }
		if (d.noFile) { noFileBox(kind === 'html' ? tx('HTML') : tx('GENERATE')); return; }
		const body = h(`<div><textarea class="x-code" dir="ltr" spellcheck="false" readonly aria-label="Code" rows="${kind === 'html' ? 12 : 20}"></textarea></div>`);
		$('textarea', body).value = d.code;
		const m = modal({
			title: kind === 'html' ? tx('HTML') : tx('GENERATE'),
			icon: kind === 'html' ? fa('fa-brands fa-html5', 'color:#fc6c05') : fa('fa-brands fa-php', 'color:#777bb3'),
			size: 'xl', body,
			foot: `<button class="x-btn" data-close>${tx('CANCEL')}</button><button class="x-btn x-btn-primary" data-ok>${ic('content_copy', 'i-sm')}${tx('COPY')}</button>`,
		});
		$('[data-ok]', m.el).addEventListener('click', () => copyText(d.code));
	}

	async function showPackage(kind) {
		const names = { wp: ['WPPLUGIN', 'fa-brands fa-wordpress', '#207196'], laravel: ['LARAVEL', 'fa-brands fa-laravel', '#EB4E43'], joomla: ['JOOMLA', 'fa-brands fa-joomla', '#f44336'] };
		const [key, icon, color] = names[kind];
		let d;
		try { busy(true, tc(key)); d = await api('package', { body: { kind } }); } catch (e) { errToast(e); return; } finally { busy(false); }
		if (d.noFile) { noFileBox(tx(key)); return; }
		const body = h(`<div class="x-col" style="gap:16px">
			${d.error ? `<div class="x-alert x-alert-danger">${ic('error')}<div>${d.error}</div></div>` : ''}
			${d.ok ? `<a class="x-btn x-btn-primary x-btn-lg" style="align-self:flex-start" href="${esc(d.download)}" download>${ic('download')}${esc(strip(d.label))}</a>` : ''}
			<div class="x-help-steps">${d.help || ''}</div>
		</div>`);
		$$('code[data-copy]', body).forEach((c) => c.addEventListener('click', () => copyText(c.textContent)));
		modal({
			title: esc(strip(d.title || t(key))), icon: fa(icon, `color:${color}`), size: 'lg', body,
			foot: `<button class="x-btn" data-close>${tx('CLOSE')}</button>`,
		});
	}

	// ============================================================ account
	function showAddUser() {
		const body = h(`<form class="x-col" style="gap:14px" autocomplete="off" novalidate>
			<div class="x-msg"></div>
			<div class="x-field"><label for="au-user">${tx('USER')}</label><input class="x-input" id="au-user" name="username" autocomplete="off" required autofocus></div>
			<div class="x-field"><label for="au-pass">${tx('PASSWORD')}</label>
				<div class="x-input-group"><input class="x-input" type="password" id="au-pass" name="mypassword" autocomplete="new-password" required>
				<button type="button" class="x-btn x-btn-ghost x-btn-sm x-icon-only x-input-btn" data-eye="au-pass" aria-label="Show password">${ic('visibility')}</button></div></div>
			<div class="x-field"><label for="au-confirm">${tx('CONFIRMPASSWORD')}</label><input class="x-input" type="password" id="au-confirm" name="confirmpassword" autocomplete="new-password" required></div>
			<button type="submit" hidden></button>
		</form>`);
		bindEyes(body);
		const msg = $('.x-msg', body);
		const say = (html, ok) => { msg.innerHTML = `<div class="x-alert ${ok ? 'x-alert-success' : 'x-alert-danger'}">${ic(ok ? 'check_circle' : 'error')}<div>${html}</div></div>`; };
		const submit = async () => {
			if (!body.username.value.trim() || !body.mypassword.value) { say(tx('INVALIDPASSWORD')); return; }
			if (body.mypassword.value !== body.confirmpassword.value) { say(tx('PASSWORDMISMATCH')); return; }
			const btn = $('[data-ok]', m.el);
			setBtnBusy(btn, true);
			try {
				const r = await api('adduser', { body: new FormData(body) });
				if (r.ok) { say(esc(strip(r.message || t('USERADDED'))), true); body.reset(); S.boot.canAddUser = true; }
				else say(esc(strip(r.error)));
			} catch (e) { say(esc(e.message)); }
			setBtnBusy(btn, false);
		};
		body.addEventListener('submit', (e) => { e.preventDefault(); submit(); });
		const m = modal({
			title: tx('ADDUSER'), icon: ic('person_add'), size: 'sm', body,
			foot: `<button class="x-btn" data-close>${tx('CLOSE')}</button><button class="x-btn x-btn-primary" data-ok>${ic('person_add', 'i-sm')}${tx('ADDUSER')}</button>`,
		});
		$('[data-ok]', m.el).addEventListener('click', submit);
	}

	/* 7.x changepass.php: after the change the user signs in again */
	function showChangePass() {
		const u = S.boot.user || {};
		const body = h(`<form class="x-col" style="gap:14px" autocomplete="off" novalidate>
			<div class="x-msg"></div>
			<div class="x-field"><label for="cp-user">${tx('USER')}</label><input class="x-input" id="cp-user" name="username" value="${esc(u.name)}" readonly></div>
			<div class="x-field"><label for="cp-cur">${tx('CURRENTPASS')}</label>
				<div class="x-input-group"><input class="x-input" type="password" id="cp-cur" name="mypassword" autocomplete="current-password" required autofocus>
				<button type="button" class="x-btn x-btn-ghost x-btn-sm x-icon-only x-input-btn" data-eye="cp-cur" aria-label="Show password">${ic('visibility')}</button></div></div>
			<div class="x-field"><label for="cp-new">${tx('NEWPASS')}</label>
				<div class="x-input-group"><input class="x-input" type="password" id="cp-new" name="newpassword" autocomplete="new-password" required>
				<button type="button" class="x-btn x-btn-ghost x-btn-sm x-icon-only x-input-btn" data-eye="cp-new" aria-label="Show password">${ic('visibility')}</button></div></div>
			<button type="submit" hidden></button>
		</form>`);
		bindEyes(body);
		const msg = $('.x-msg', body);
		let done = false;
		const submit = async () => {
			if (done) { m.close(); logout(); return; }
			if (!body.mypassword.value || !body.newpassword.value) { msg.innerHTML = `<div class="x-alert x-alert-danger">${ic('error')}<div>${tx('INVALIDPASSWORD')}</div></div>`; return; }
			const btn = $('[data-ok]', m.el);
			setBtnBusy(btn, true);
			try {
				const r = await api('changepass', { body: new FormData(body) });
				setBtnBusy(btn, false);
				if (r.ok) {
					done = true;
					msg.innerHTML = `<div class="x-alert x-alert-success">${ic('check_circle')}<div>${esc(strip(r.message))}</div></div>`;
					$$('.x-field', body).forEach((f) => { f.hidden = true; });
					btn.innerHTML = ic('logout', 'i-sm') + tx('CLOSE');
					$('[data-close]', m.el).hidden = true;
					return;
				}
				msg.innerHTML = `<div class="x-alert x-alert-danger">${ic('error')}<div>${esc(strip(r.error))}</div></div>`;
			} catch (e) { setBtnBusy(btn, false); msg.innerHTML = `<div class="x-alert x-alert-danger">${ic('error')}<div>${esc(e.message)}</div></div>`; }
		};
		body.addEventListener('submit', (e) => { e.preventDefault(); submit(); });
		const m = modal({
			title: tx('CHANGEPASS'), icon: ic('key'), size: 'sm', body,
			foot: `<button class="x-btn" data-close>${tx('CANCEL')}</button><button class="x-btn x-btn-primary" data-ok>${ic('key', 'i-sm')}${tx('CHANGEPASS')}</button>`,
			onClose: () => { if (done) logout(); },
		});
		$('[data-ok]', m.el).addEventListener('click', submit);
	}

	/* 7.x settings.php: AI integration (+ SMTP placeholder) */
	async function showSettings() {
		let d;
		try { busy(true, tc('SETTINGS')); d = await api('settings'); } catch (e) { errToast(e); return; } finally { busy(false); }
		const prov = [['chatgpt', 'openai-icon.png', 'CHATGPT'], ['gemini', 'google-gemini-icon.png', 'GEMINI'], ['deepseek', 'deepseek-icon.png', 'DEEPSEEK']];
		const body = h(`<form class="x-settings" autocomplete="off" novalidate>
			<nav class="x-settings-nav" role="tablist">
				<button type="button" class="x-nav-item active" data-pane="ai" role="tab">${ic('auto_awesome', 'i-sm')}<span class="x-nav-text">${tx('AIINTEGRATION')}</span></button>
				<button type="button" class="x-nav-item" data-pane="smtp" role="tab">${ic('mail', 'i-sm')}<span class="x-nav-text">${tx('SMTP')}</span></button>
			</nav>
			<div class="x-settings-pane" data-pane="ai">
				<div class="x-row x-between"><h3 class="x-h3">${tx('AIINTEGRATION')}</h3>
					<label class="x-switch"><input type="checkbox" id="st-enable" ${d.enable ? 'checked' : ''}><span class="x-track"></span><span class="x-sr">${tx('AIINTEGRATION')}</span></label></div>
				<div class="x-col x-ai-input" style="gap:14px" ${d.enable ? '' : 'hidden'}>
					<div class="x-seg x-seg-lg" role="radiogroup">${prov.map(([v, img, k]) => `<label><input type="radio" name="ai-options" value="${v}" ${d.options === v ? 'checked' : ''}><span><img src="${BASE}assets/img/${img}" alt="" width="18" height="18" style="object-fit:contain">${tx(k)}</span></label>`).join('')}</div>
					<p class="x-help" style="margin:0">${t('CHATGPT_DESC')}</p>
					<div class="x-field"><label for="st-key">${tx('API_KEY')}</label>
						<div class="x-input-group"><input class="x-input x-mono" type="password" id="st-key" name="ai-key" placeholder="sk-***" autocomplete="off">
						<button type="button" class="x-btn x-btn-ghost x-btn-sm x-icon-only x-input-btn" data-eye="st-key" aria-label="Show key">${ic('visibility')}</button></div></div>
					<div class="x-row x-between" style="padding-top:6px;border-top:1px solid var(--border)"><span style="font-weight:600">${tx('CACHE')}</span>
						<label class="x-switch"><input type="checkbox" name="ai-cache" ${d.cache ? 'checked' : ''}><span class="x-track"></span><span class="x-sr">${tx('CACHE')}</span></label></div>
				</div>
			</div>
			<div class="x-settings-pane" data-pane="smtp" hidden>
				<h3 class="x-h3">${tx('SMTP')}</h3>
				<p class="x-muted">Please check agian later @ <a target="_blank" rel="noopener" href="https://dashboardbuilder.net/release-notes">Dashboard Builder</a></p>
			</div>
		</form>`);
		$('#st-key', body).value = d.key || '';
		bindEyes(body);
		$('#st-enable', body).addEventListener('change', (e) => { $('.x-ai-input', body).hidden = !e.target.checked; });
		$$('.x-settings-nav [data-pane]', body).forEach((b) => b.addEventListener('click', () => {
			$$('.x-settings-nav [data-pane]', body).forEach((x) => x.classList.toggle('active', x === b));
			$$('.x-settings-pane', body).forEach((p) => { p.hidden = p.dataset.pane !== b.dataset.pane; });
		}));
		const m = modal({
			title: tx('SETTINGS'), icon: ic('settings'), size: 'lg', body,
			foot: `<button class="x-btn" data-close>${tx('CANCEL')}</button><button class="x-btn x-btn-primary" data-ok>${ic('save', 'i-sm')}${tx('SAVE_CHANGES')}</button>`,
		});
		$('[data-ok]', m.el).addEventListener('click', async (e) => {
			const btn = e.currentTarget;
			const fd = new FormData(body);
			fd.set('ai-enable', $('#st-enable', body).checked ? 'true' : 'false');
			if (!$('[name="ai-cache"]', body).checked) fd.delete('ai-cache');
			setBtnBusy(btn, true);
			try {
				await api('settings_save', { body: fd });
				S.boot.ai = Object.assign(S.boot.ai || {}, { enable: $('#st-enable', body).checked });
				m.close();
				toast(strip(t('SAVE_CHANGES')) + ' ✓');
			} catch (err) { errToast(err); setBtnBusy(btn, false); }
		});
	}

	function showVideo(id) {
		modal({
			title: tx('VIDEO_TUTORIAL'), icon: ic('smart_display'), size: 'xl', foot: false,
			body: `<div style="position:relative;padding-top:56.25%;border-radius:10px;overflow:hidden;background:#000">
				<iframe src="https://www.youtube.com/embed/${encodeURIComponent(id)}" title="${tx('VIDEO_TUTORIAL')}" style="position:absolute;inset:0;width:100%;height:100%;border:0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`,
		});
	}

	// =============================================================== tour
	/* 7.x takeatour.php: language + 15 steps. The 8.0 screens are drawn as small sketches. */
	const TOUR = [
		['CONNECT_YOUR_DATA', 'HOW_CONNECT_YOUR_DATA', 'canvas', 'data'],
		['DATABASE_SETTINGS', 'CHOOSE_DATABASE', 'ds', 'rdbms'],
		['DATABASE_SETTINGS', 'ENTER_DBSERVER', 'ds', 'host'],
		['DATABASE_SETTINGS', 'ENTER_DBUSER', 'ds', 'user'],
		['DATABASE_SETTINGS', 'ENTER_DBPASSWORD', 'ds', 'password'],
		['DATABASE_SETTINGS', 'ENTER_DBNAME', 'ds', 'dbname'],
		['DATABASE_SETTINGS', 'CLICK_CONNECT_BUTTON', 'ds', 'connect'],
		['DATABASE_SETTINGS', 'CLICK_OK_BUTTON', 'ds', 'ok'],
		['CHART_SETTINGS', 'CLICK_FOR_CHART_SETTINGS', 'canvas', 'chart'],
		['CHART_SETTINGS', 'CLICK_TABLE', 'studio', 'table'],
		['CHART_SETTINGS', 'ENTER_YOUR_QUERY', 'studio', 'sql'],
		['CHART_SETTINGS', 'HIT_RUN_QUERY', 'studio', 'run'],
		['CHART_SETTINGS', 'SELECT_X_Y', 'studio', 'xy'],
		['CHART_SETTINGS', 'SELECT_CHART_TYPE', 'studio', 'type'],
		['CHART_SETTINGS', 'CLICK_SAVE_CHANGES', 'studio', 'save'],
	];

	function tourSketch(kind, hl) {
		const b = (key, html, extra = '') => `<div class="m-box${hl === key ? ' m-hl' : ''}" ${extra}>${html}</div>`;
		if (kind === 'canvas') {
			return `<div class="x-tour-mock">
				<div class="m-row">${b('new', ic('note_add', 'i-sm'))}${b('open', ic('folder_open', 'i-sm'))}${b('save', ic('save', 'i-sm'))}${b('add', ic('add_chart', 'i-sm') + tx('ADD_PANEL'))}${b('chart', ic('insert_chart', 'i-sm') + tx('CHART_SETTINGS'))}</div>
				<div class="m-row" style="align-items:stretch">
					<div class="m-box" style="flex:2;flex-direction:column;align-items:stretch;gap:10px;min-height:150px">
						<div class="m-row" style="justify-content:space-between"><b style="color:var(--text)">${tx('PANEL')} 1</b><div class="m-row">${b('data', ic('database', 'i-sm'))}${ic('more_vert', 'i-sm')}</div></div>
						<div class="x-empty-art" style="height:80px"><span style="height:45%"></span><span style="height:80%"></span><span style="height:60%"></span><span style="height:95%"></span></div>
					</div>
					<div class="m-box" style="flex:1;min-height:150px"></div>
				</div></div>`;
		}
		if (kind === 'ds') {
			return `<div class="x-tour-mock">
				<div class="m-row">${b('rdbms', ic('database', 'i-sm') + 'MySQL ▾', 'style="flex:1"')}${b('x', ic('table_view', 'i-sm') + 'Excel / CSV', 'style="flex:1"')}</div>
				<div class="m-row">${b('host', tx('HOST', 'Host') + ': localhost', 'style="flex:2"')}${b('port', '3306', 'style="flex:1"')}</div>
				<div class="m-row">${b('user', tx('USER') + ': root', 'style="flex:1"')}${b('password', tx('PASSWORD') + ': ••••••', 'style="flex:1"')}</div>
				<div class="m-row">${b('dbname', tx('DB_NAME', 'Database') + ': sales', 'style="flex:1"')}</div>
				<div class="m-row" style="justify-content:flex-end">${b('connect', ic('power', 'i-sm') + tx('CONNECT'))}${b('ok', ic('check', 'i-sm') + tx('OK'))}</div>
			</div>`;
		}
		return `<div class="x-tour-mock">
			<div class="m-row" style="align-items:stretch">
				<div class="m-box" style="flex:0 0 120px;flex-direction:column;align-items:stretch;gap:6px">${b('table', ic('table', 'i-xs') + 'orders')}<div class="m-box">${ic('table', 'i-xs')}customers</div></div>
				<div class="m-box" style="flex:1;flex-direction:column;align-items:stretch;gap:8px">
					${b('sql', '<span class="x-mono">SELECT month, SUM(total) FROM orders …</span>')}
					<div class="m-row" style="justify-content:flex-end">${b('run', ic('play_arrow', 'i-sm') + tx('RUN_QUERY', 'Run Query'))}</div>
					<div class="m-row">${b('xy', 'X ▾ month')}${b('xy', 'Y ▾ total')}${b('type', ic('bar_chart', 'i-sm') + tx('CHART_TYPE', 'Chart type') + ' ▾')}</div>
				</div>
			</div>
			<div class="m-row" style="justify-content:flex-end">${b('cancel', tx('CANCEL'))}${b('save', ic('save', 'i-sm') + tx('SAVE_CHANGES'))}</div>
		</div>`;
	}

	function showTour(atBoot) {
		let step = 0;                                 // 0 = language
		const lang = (S.boot && S.boot.language) || 'en-us';
		const finish = async (languagechange, newLang) => {
			try { await api('tour', { body: { languagechange: languagechange ? 'yes' : 'no', take_tour_language: newLang || '' } }); } catch (e) {}
			if (languagechange) { location.reload(); return; }
			if (S.boot) S.boot.takeatour = false;
			if (atBoot) boot();
		};
		const body = h('<div class="x-col" style="gap:14px"></div>');
		const paint = () => {
			if (step === 0) {
				body.innerHTML = `<div class="x-tour-stage" style="display:grid;place-items:center;text-align:center;min-height:260px">
					<div class="x-col" style="gap:14px;align-items:center">
						<span class="x-modal-icon" style="width:52px;height:52px">${ic('language')}</span>
						<h3 class="x-h3" style="margin:0">${tx('SELECT_LANGUAGE')}</h3>
						<select class="x-select" style="min-width:220px" aria-label="${tx('SELECT_LANGUAGE')}">${LANGS.map(([c, n]) => `<option value="${c}"${c === lang ? ' selected' : ''}>${n}</option>`).join('')}</select>
					</div></div>`;
				$('select', body).addEventListener('change', (e) => finish(true, e.target.value));
			} else {
				const [group, text, kind, hl] = TOUR[step - 1];
				body.innerHTML = `<div class="x-row x-between"><span class="x-badge brand">${tx('STEP')} ${step} ${tx('OF')} ${TOUR.length}</span><b style="font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)">${tx(group)}</b></div>
					<div class="x-tour-stage">${tourSketch(kind, hl)}</div>
					<div class="x-tour-tip">${ic('lightbulb', 'i-sm')} ${esc(strip(t(text)))}</div>
					<div class="x-steps" aria-hidden="true">${TOUR.map((_, i) => `<i class="${i < step ? 'on' : ''}"></i>`).join('')}</div>`;
			}
			$('[data-prev]', m.el).hidden = step === 0;
			$('[data-skip]', m.el).hidden = step === 0;
			$('[data-next]', m.el).innerHTML = step === TOUR.length ? tx('CLOSE') : tx('NEXT') + ic(document.documentElement.dir === 'rtl' ? 'arrow_back' : 'arrow_forward', 'i-sm');
		};
		const m = modal({
			title: esc(strip(t('TAKE_A_TOUR')).toUpperCase()), icon: ic('explore'), size: 'lg', body, backdrop: false,
			foot: `<div class="x-foot-start"><button class="x-btn x-btn-ghost" data-skip>${tx('SKIP')}</button></div>
				<button class="x-btn" data-prev>${tx('PREVIOUS')}</button><button class="x-btn x-btn-primary" data-next></button>`,
			onClose: () => finish(false),
		});
		$('[data-prev]', m.el).addEventListener('click', () => { step = Math.max(0, step - 1); paint(); });
		$('[data-next]', m.el).addEventListener('click', () => { if (step === TOUR.length) { m.close(); return; } step++; paint(); });
		$('[data-skip]', m.el).addEventListener('click', () => m.close());
		paint();
	}

	// ============================================================ preview
	/* 7.x preview(): the saved dashboard with Print / Export Image / Close */
	function openPreview() {
		if (!S.state.file) {
			alertBox(tx('NO_FILE_NAME'), { title: tx('PREVIEW'), icon: ic('visibility'), onClose: () => { if (location.hash.startsWith('#/preview')) closeSheet(false); } });
			return;
		}
		const sheet = h(`<div class="x-sheet" role="dialog" aria-modal="true" aria-label="${tx('PREVIEW')}">
			<div class="x-sheet-head">
				<h2>${ic('visibility')}${tx('PREVIEW')} <span class="x-muted" style="font-weight:400">· ${esc(S.state.file)}${S.state.page ? ' / ' + tx('PAGE') + ' ' + S.state.page : ''}</span></h2>
				<div class="x-row" style="gap:6px">
					<button class="x-btn x-btn-ghost x-btn-sm" data-a="print">${ic('print', 'i-sm')}<span class="x-tool-label">${tx('PRINT')}</span></button>
					<button class="x-btn x-btn-ghost x-btn-sm" data-a="image">${ic('image', 'i-sm')}<span class="x-tool-label">${tx('EXPORT_IMAGE')}</span></button>
					<a class="x-btn x-btn-ghost x-btn-sm" data-a="tab" target="_blank" rel="noopener" title="${tx('VIEW')}">${ic('open_in_new', 'i-sm')}</a>
					<button class="x-btn x-btn-sm" data-a="close">${ic('close', 'i-sm')}${tx('CLOSE')}</button>
				</div>
			</div>
			<iframe title="${tx('PREVIEW')}"></iframe>
		</div>`);
		const src = BASE + 'dashboard?embed=1&t=' + Date.now();
		$('iframe', sheet).src = src;
		$('[data-a="tab"]', sheet).href = BASE + 'dashboard';
		const win = () => $('iframe', sheet).contentWindow;
		$('[data-a="print"]', sheet).addEventListener('click', () => { try { win().DBView.print(); } catch (e) { errToast(e); } });
		$('[data-a="image"]', sheet).addEventListener('click', () => { try { win().DBView.image(); } catch (e) { errToast(e); } });
		$('[data-a="close"]', sheet).addEventListener('click', () => closeSheet(false));
		sheet.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(false); });
		document.body.append(sheet);
		document.body.classList.add('x-lock');
		$('[data-a="close"]', sheet).focus();
	}

	// ====================================================== auto visualize
	/* 7.x importmodal.php: AI dashboard generator with Close / Import */
	function openAuto() {
		const sheet = h(`<div class="x-sheet" role="dialog" aria-modal="true" aria-label="${tx('AUTO_VISUALIZE')}">
			<div class="x-sheet-head">
				<h2><span style="color:#7c3aed;display:inline-flex">${ic('auto_awesome')}</span>${tx('AUTO_VISUALIZE')}</h2>
				<div class="x-row" style="gap:6px">
					<button class="x-btn x-btn-sm" data-a="close">${tx('CLOSE')}</button>
					<button class="x-btn x-btn-primary x-btn-sm" data-a="import">${ic('download', 'i-sm')}${tx('IMPORT')}</button>
				</div>
			</div>
			<iframe title="${tx('AUTO_VISUALIZE')}"></iframe>
		</div>`);
		$('iframe', sheet).src = BASE + 'app/ai.html';
		$('[data-a="close"]', sheet).addEventListener('click', () => closeSheet(true));
		$('[data-a="import"]', sheet).addEventListener('click', (e) => {
			const btn = e.currentTarget;
			const w = $('iframe', sheet).contentWindow;
			if (!w || typeof w.persistDashboardCache !== 'function') { closeSheet(true); return; }
			setBtnBusy(btn, true);
			let finished = false;
			const done = (saved) => {
				if (finished) return; finished = true;
				if (saved === false) { setBtnBusy(btn, false); errToast(new Error(strip(t('IMPORT')) + ': the dashboard could not be saved.')); return; }
				S.sel = 0; closeSheet(true);
			};
			try { w.persistDashboardCache(done); } catch (err) { setBtnBusy(btn, false); errToast(err); return; }
			setTimeout(() => { if (!finished) setBtnBusy(btn, false); }, 20000);
		});
		document.body.append(sheet);
		document.body.classList.add('x-lock');
	}

	// ========================================================= data source
	/* 7.x dbsetting.php: connectors, connection form, file upload / pick, URL */
	const CONNECTORS = [
		// id, kind, label key, logo, premium (locked in FREE / KickStarter), needs
		['mysql', 'db', 'MYSQL', 'logo_mysql.png', false],
		['pgsql', 'db', 'POSTGRES', 'logo_postgresql.png', true],
		['sqlite', 'file', 'SQLITE', 'logo_sqlite.png', false],
		['upload', 'file', 'UPLOAD_FILE', 'logo_fileupload.png', false, 'UPLOAD_CSV'],
		['sqlsrv', 'db', 'SQLSERVER', 'logo_sqlserver.png', true],
		['oci', 'db', 'ORACLE', 'logo_oracle.png', true, null, 'oci'],
		['excel', 'file', 'EXCEL', 'logo_excel.png', false, 'UPLOAD_EXCEL'],
		['google', 'url', 'GOOGLE_SHEET_FILE', 'logo_googlesheets.png', true],
		['json', 'url', 'JSON', 'logo_json.png', true],
		['dblib', 'db', 'SYBASE', 'logo_sybase.png', true],
		['cubrid', 'db', 'CUBRID', 'logo_cubrid.png', true],
		['odbc', 'db', 'ODBC', 'logo_odbc.png', true, null, 'odbc'],
	];

	async function openData(col) {
		const main = $('#x-main');
		main.innerHTML = `<div class="x-page"><div class="x-empty" style="padding-top:120px"><div class="x-spinner"></div></div></div>`;
		paintStatus(`<span><b>${tx('PANEL')}</b> ${col + 1}</span>`);
		let d;
		try {
			d = await api('ds', { query: { col } });
		} catch (e) {
			if (!e.silent) main.innerHTML = `<div class="x-page"><div class="x-alert x-alert-danger">${ic('error')}<div>${esc(e.message)}</div></div></div>`;
			return;
		}
		if (S.route !== 'data' || S.routeParam !== col) return;
		const boot = S.boot;
		const f = d.form;
		/* connector shown first: the one in use */
		let current = d.selected === 'csv' ? 'upload' : d.selected;
		main.innerHTML = `<div class="x-page">
			<div class="x-page-head">
				<div><h1>${tc('DATA_SOURCE_SETTING')}</h1><p>${tx('PANEL')} ${col + 1}${strip(d.title) ? ' · ' + esc(strip(d.title)) : ''} — ${tx('HOW_CONNECT_YOUR_DATA')}</p></div>
				<div class="x-row" style="gap:8px">
					<a class="x-btn x-btn-ghost x-btn-sm" href="https://dashboardbuilder.net/documentation" target="_blank" rel="noopener">${ic('menu_book', 'i-sm')}${tx('USERGUIDE')}</a>
					<button class="x-btn x-btn-sm" data-a="cancel">${ic('close', 'i-sm')}${tx('CANCEL')}</button>
				</div>
			</div>
			<div class="x-ds no-form">
				<div class="x-col" style="gap:14px;min-width:0">
					<div class="x-search">${ic('search', 'i-sm')}<input class="x-input" type="search" placeholder="${tx('SEARCH')}" aria-label="${tx('SEARCH')}"></div>
					<div class="x-connectors" role="list"></div>
				</div>
				<div class="x-ds-form" hidden></div>
			</div>
		</div>`;
		$('[data-a="cancel"]', main).addEventListener('click', () => go('/'));
		const grid = $('.x-connectors', main);
		const formHost = $('.x-ds-form', main);
		const layout = $('.x-ds', main);

		CONNECTORS.forEach(([id, kind, key, logo, premium, descKey, needs]) => {
			const locked = premium && d.limited;
			const unavailable = needs && !boot[needs];
			const label = strip(t(key));
			const desc = descKey ? strip(t(descKey)) : strip(t('CONNECTTO')) + ' ' + label + (id === 'mysql' ? ' ' + strip(t('DATABASE')) : '');
			const inUse = current === id;
			const card = h(`<button type="button" class="x-connector${locked || unavailable ? ' is-locked' : ''}${inUse ? ' active' : ''}" role="listitem" data-id="${id}" ${locked || unavailable ? 'aria-disabled="true"' : ''}>
				${locked ? `<span class="x-crown" title="${tx('UPGRADE_LICENSE')}">${ic('workspace_premium', 'i-sm')}</span>` : ''}
				<div class="x-connector-top"><span class="x-connector-logo"><img src="${BASE}assets/img/${logo}" alt=""></span>
					<div style="min-width:0"><h4>${esc(label)}</h4><p title="${esc(desc)}">${esc(desc)}</p></div></div>
				<div class="x-connector-foot"><span>${kind === 'db' ? 'DATABASE' : kind === 'file' ? 'FILE' : 'URL'}</span>
					${inUse ? `<span class="x-badge ${d.connected ? 'ok' : 'bad'}">${d.connected ? tx('CONNECTED') : tx('NOTCONNECTED')}</span>` : ic(document.documentElement.dir === 'rtl' ? 'chevron_left' : 'chevron_right', 'x-connector-arrow i-sm')}</div>
			</button>`);
			if (locked) card.title = strip(t('UPGRADE_LICENSE'));
			card.addEventListener('click', () => {
				if (locked) { toast(strip(t('UPGRADE_LICENSE')), 'bad'); return; }
				if (unavailable) return;
				pick(id);
			});
			grid.append(card);
		});

		$('input[type=search]', main).addEventListener('input', (e) => {
			const q = e.target.value.trim().toLowerCase();
			$$('.x-connector', grid).forEach((c) => { c.hidden = q && !c.textContent.toLowerCase().includes(q); });
		});

		function pick(id) {
			current = id;
			$$('.x-connector', grid).forEach((c) => c.classList.toggle('active', c.dataset.id === id));
			layout.classList.remove('no-form');
			formHost.hidden = false;
			const conn = CONNECTORS.find((c) => c[0] === id);
			renderForm(conn);
			if (window.innerWidth < 1100) formHost.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}

		function renderForm([id, kind, key, logo]) {
			const sameKind = (id === 'upload' || id === 'excel') ? d.selected === 'csv' : d.selected === id;
			const title = kind === 'file' && id !== 'sqlite' ? strip(t('SELECT_XLS_CSV')) : strip(t(key)) + ' ' + strip(t('AUTHENTICATION'));
			const card = h(`<form class="x-card" autocomplete="off" novalidate>
				<div class="x-card-head"><span class="x-connector-logo" style="width:32px;height:32px"><img src="${BASE}assets/img/${logo}" alt="" style="max-width:24px;max-height:22px"></span><h3>${esc(title)}</h3>
					<button type="button" class="x-btn x-btn-ghost x-btn-xs x-icon-only" data-a="back" style="margin-inline-start:auto" title="${tx('CANCEL')}">${ic('close', 'i-sm')}</button></div>
				<div class="x-card-body x-col" style="gap:14px">
					<div class="db-message"></div>
				</div>
				<div class="x-card-foot x-row" style="justify-content:flex-end;gap:8px;padding:12px 14px;border-top:1px solid var(--border)">
					<button type="button" class="x-btn" data-a="cancel2">${tx('CANCEL')}</button>
					<button type="submit" class="x-btn x-btn-primary" data-a="connect">${ic('power', 'i-sm')}${tx('CONNECT')}</button>
				</div>
			</form>`);
			const body = $('.x-card-body', card);
			if (kind === 'db') {
				const odbc = id === 'odbc';
				body.insertAdjacentHTML('beforeend', `
					${odbc ? '' : `<div class="x-row" style="gap:10px;align-items:flex-start">
						<div class="x-field" style="flex:2"><label for="ds-host">${tx('HOST')}</label><input class="x-input" id="ds-host" name="host" placeholder="${tx('HOST')}" value="${esc(sameKind ? f.host : '')}" required></div>
						<div class="x-field" style="flex:1"><label for="ds-port">${tx('PORT')}</label><input class="x-input" id="ds-port" name="port" placeholder="${tx('PORT')}" value="${esc(sameKind ? f.port : '')}" inputmode="numeric"></div></div>`}
					${id === 'pgsql' ? `<div class="x-field"><label for="ds-schema">${tx('SCHEMA')}</label><input class="x-input" id="ds-schema" name="schema" placeholder="${tx('SCHEMA')}" value="${esc(sameKind ? f.schema : '')}"></div>` : ''}
					<div class="x-field"><label for="ds-user">${tx('USER')}</label><input class="x-input" id="ds-user" name="user" placeholder="${tx('USER')}" value="${esc(sameKind ? f.user : '')}" autocomplete="off" ${odbc ? '' : 'required'}></div>
					<div class="x-field"><label for="ds-pass">${tx('PASSWORD')}</label>
						<div class="x-input-group"><input class="x-input" type="password" id="ds-pass" name="password" placeholder="${tx('PASSWORD')}" autocomplete="new-password">
						<button type="button" class="x-btn x-btn-ghost x-btn-sm x-icon-only x-input-btn" data-eye="ds-pass" aria-label="Show password">${ic('visibility')}</button></div></div>
					<div class="x-field"><label for="ds-dbname">${odbc ? tx('DS_NAME') : tx('DB_NAME')}</label><input class="x-input" id="ds-dbname" name="dbname" placeholder="${tx('TYPE_YOUR_DATABASE_NAME')}" value="${esc(sameKind ? f.dbname : '')}" required></div>
					<label class="x-check"><input type="checkbox" name="ssl" ${sameKind && f.ssl ? 'checked' : ''}> ${tx('SSL_ENABLED')}</label>`);
				$('#ds-pass', body).value = sameKind ? f.password : '';
				bindEyes(body);
			} else if (kind === 'file') {
				const sqlite = id === 'sqlite';
				const exts = sqlite ? ['db', 'sqlite'] : ['csv', 'xlsx', 'xls', 'pdf'];
				const accept = sqlite ? '.db,.sqlite' : '.csv,.xlsx,.xls';
				body.insertAdjacentHTML('beforeend', `
					<label class="x-drop">${ic('upload_file')}<span><b>${tx('CHOOSE_FILES')}</b></span><span>${tx('DRAG_DROP')}</span>
						<span class="x-mono" style="font-size:11px">${accept.replace(/\./g, '').toUpperCase().replace(/,/g, ' · ')}</span>
						<span class="x-drop-file">${esc(sameKind ? f.file : '')}</span>
						<input type="file" name="fileToUpload" accept="${accept}"></label>
					<input type="hidden" name="selectedfile" value="">
					<div class="x-label" style="margin-top:4px">${tx('FILE_NAME')}</div>
					<div class="x-ds-files"></div>`);
				const files = d.files.filter((x) => exts.includes(x.ext));
				const list = $('.x-ds-files', body);
				const fileIcon = (ext) => ({ pdf: 'picture_as_pdf', csv: 'csv', db: 'database', sqlite: 'database' }[ext] || 'table_view');
				list.innerHTML = files.length ? `<div class="x-table-wrap" style="max-height:260px"><table class="x-table x-files"><tbody>${files.map((x) => `
					<tr data-file="${esc(x.file)}" tabindex="0" class="${sameKind && f.file === x.file ? 'active' : ''}"><td style="width:28px;color:var(--primary-2)">${ic(fileIcon(x.ext), 'i-sm')}</td><td><b>${esc(x.file)}</b></td><td class="x-mono" style="font-size:11px;white-space:nowrap">${esc(x.size)}</td><td class="x-muted" style="font-size:11px;white-space:nowrap">${esc(fmtDate(x.time))}</td></tr>`).join('')}</tbody></table></div>`
					: `<div class="x-help">—</div>`;
				const shown = $('.x-drop-file', body);
				const input = $('input[type=file]', body);
				const drop = $('.x-drop', body);
				$$('tr[data-file]', list).forEach((tr) => {
					const sel = () => {
						$$('tr', list).forEach((r) => r.classList.remove('active'));
						tr.classList.add('active');
						card.selectedfile.value = tr.dataset.file;
						input.value = '';
						shown.textContent = tr.dataset.file;
					};
					tr.addEventListener('click', sel);
					tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') sel(); });
				});
				const checkFile = () => {
					const msg = $('.db-message', body);
					msg.innerHTML = '';
					const file = input.files[0];
					if (!file) return;
					const ok = new RegExp('\\.(' + accept.replace(/\./g, '').split(',').join('|') + ')$', 'i').test(file.name);
					if (!ok) {
						input.value = '';
						msg.innerHTML = `<div class="x-alert x-alert-danger">${ic('error')}<div><strong>${tx('INVALID_FILE')}</strong><div>${tx('MOREDETAILS')} <a href="https://dashboardbuilder.net/documentation" target="_blank" rel="noopener">${tx('USERGUIDE')}</a></div></div></div>`;
						shown.textContent = '';
						return;
					}
					card.selectedfile.value = '';
					$$('tr', list).forEach((r) => r.classList.remove('active'));
					shown.textContent = file.name;
				};
				input.addEventListener('change', checkFile);
				['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.add('over')));
				['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove('over')));
			} else {
				body.insertAdjacentHTML('beforeend', `
					<div class="x-field"><label for="ds-url">${id === 'json' ? tx('JSON') : tx('GOOGLE_SHEET_FILE')} URL</label>
						<input class="x-input x-mono" type="url" id="ds-url" name="url" placeholder="${tx('VALID_URL')}" pattern="https?://.*" value="${esc(sameKind ? f.url : '')}" required style="font-size:12px"></div>
					<input type="hidden" name="urltype" value="${id === 'json' ? 'json' : 'google'}">`);
			}
			$('[data-a="back"]', card).addEventListener('click', closeForm);
			$('[data-a="cancel2"]', card).addEventListener('click', () => go('/'));
			card.addEventListener('submit', (e) => { e.preventDefault(); connect(card, id, kind); });
			formHost.innerHTML = '';
			formHost.append(card);
			const first = $('input:not([type=hidden]):not([type=file]):not([type=checkbox])', card);
			if (first) setTimeout(() => first.focus(), 30);
		}

		function closeForm() {
			formHost.hidden = true;
			formHost.innerHTML = '';
			layout.classList.add('no-form');
			$$('.x-connector', grid).forEach((c) => c.classList.toggle('active', false));
		}

		async function connect(form, id, kind) {
			const msg = $('.db-message', form);
			msg.innerHTML = '';
			/* required fields (7.x browser validation) */
			const bad = $$('input[required]', form).find((i) => !i.value.trim() || (i.type === 'url' && !/^https?:\/\//i.test(i.value.trim())));
			if (bad) {
				bad.focus();
				const lbl = bad.type === 'url' ? t('VALID_URL') : (bad.name === 'dbname' ? t('TYPE_YOUR_DATABASE_NAME') : strip(t(bad.name === 'host' ? 'HOST' : bad.name === 'user' ? 'USER' : 'DB_NAME')));
				msg.innerHTML = `<div class="x-alert x-alert-danger">${ic('error')}<div>${esc(strip(lbl))}</div></div>`;
				return;
			}
			if (kind === 'file' && !form.selectedfile.value && !(form.fileToUpload.files && form.fileToUpload.files[0])) {
				msg.innerHTML = `<div class="x-alert x-alert-danger">${ic('error')}<div>${tx('SELECT_FILE')}</div></div>`;
				return;
			}
			const fd = new FormData(form);
			fd.append('col', col);
			if (kind === 'db') { fd.append('source', 'ADatabase'); fd.append('rdbms', id); }
			else if (kind === 'file') { fd.append('source', id === 'sqlite' ? 'ADatabase' : 'upload'); fd.append('rdbms', id === 'sqlite' ? 'sqlite' : ''); }
			else { fd.append('source', 'url'); fd.append('rdbms', ''); }
			if (!fd.get('fileToUpload') || !fd.get('fileToUpload').name) fd.delete('fileToUpload');
			const btn = $('[data-a="connect"]', form);
			setBtnBusy(btn, true);
			try {
				const r = await api('ds_save', { body: fd });
				setBtnBusy(btn, false);
				if (r.connected) {
					msg.innerHTML = `<div class="x-alert x-alert-success" style="flex-direction:column;align-items:center;text-align:center">
						<strong>${ic('check_circle')} ${esc(strip(r.message))}</strong>
						<button type="button" class="x-btn x-btn-success x-btn-sm" data-ok>${tx('OK')}</button></div>`;
					$('[data-ok]', msg).addEventListener('click', () => go('/'));
					$('[data-ok]', msg).focus();
				} else {
					msg.innerHTML = `<div class="x-alert x-alert-danger">${ic('error')}<div><strong>${esc(strip(r.message))}</strong>
						${r.error ? `<div style="margin-top:4px;word-break:break-word">${esc(r.error)}</div>` : ''}
						<div style="margin-top:4px">${tx('MOREDETAILS')} <a href="https://dashboardbuilder.net/documentation" target="_blank" rel="noopener">${tx('USERGUIDE')}</a></div></div></div>`;
				}
				msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			} catch (e) {
				setBtnBusy(btn, false);
				msg.innerHTML = `<div class="x-alert x-alert-danger">${ic('error')}<div>${esc(e.message)}</div></div>`;
			}
		}

		if (current) pick(current);
	}

	// ======================================================= chart studio
	/* 7.x layoutsetting.php (Chart settings): traces, data analysis, style,
	   drill-through, properties, SQL tabs, tables, pivot, preview, save / clear */
	const CHART_TYPES = [
		['area', 'area_chart', 'Area'], ['bar', 'bar_chart', 'Bar'], ['line', 'show_chart', 'Line'],
		['histogram', 'equalizer', 'Histogram'], ['stack', 'stacked_bar_chart', 'Stack'], ['pie', 'pie_chart', 'Pie'],
		['donut', 'donut_large', 'Donut'], ['bubble', 'bubble_chart', 'Bubble'], ['sunburst', 'data_usage', 'Sunburst'],
		['kpichart', 'trending_up', 'KPI Chart'], ['charttable', 'table_chart', 'Table'], ['gauge', 'speed', 'Gauge'],
		['map', 'public', 'Map'], ['heatmap', 'grid_on', 'Heatmap'], ['scatter3d', 'view_in_ar', '3D Chart'], ['sankey', 'alt_route', 'Sankey'],
	];
	const FREE_TYPES = ['area', 'bar', 'line'];
	const TRACE_TYPES = ['area', 'bar', 'line', 'histogram', 'stack'];
	const NO_ADD_TRACE = ['numberchart', 'number', 'map', 'sunburst', 'gauge', 'charttable', 'donut', 'pie', 'kpichart', 'heatmap'];
	const REFRESH_TYPES = ['line', 'bar', 'area', 'stack', 'histogram', 'pie', 'donut', 'gauge', 'kpichart', 'bubble'];
	const STREAM_TYPES = ['line', 'bar', 'area', 'stack', 'histogram'];
	const NUM_MODELS = [['SUM', 'SUM'], ['AVG', 'AVG'], ['COUNT', 'COUNT'], ['MAX', 'MAX'], ['MIN', 'MIN'], ['VAR', 'VAR'], ['STD', 'STDEV']];
	const DATE_MODELS = [['YEAR', 'YEAR'], ['QTR', 'QUARTER'], ['MON', 'MONTH']];
	const MAPS = [['world', 'World'], ['usa', 'USA'], ['africa', 'Africa'], ['asia', 'Asia'], ['europe', 'Europe'], ['north america', 'North America'], ['south america', 'South America']];
	const UNICODE = [36, 163, 165, 8364, 8377, 9888, 10004, 10060, 128308, 128994, 128993, 128276, 11088, 128077, 128078, 128200, 128201, 128202,
		128295, 128736, 128187, 128221, 128100, 128101, 128337, 9993, 128197, 10145, 11014, 11015, 128679, 128640, 128161, 128214, 128681, 9989,
		9940, 9889, 128172, 128246, 127760, 128206, 128712, 128275, 128190, 128193, 128467, 128421, 128188];

	const colOf = (v) => { const m = /\{col\}([^{]*)\{\/col\}/i.exec(String(v || '')); return m ? m[1] : ''; };
	const typeLabel = (ty) => (CHART_TYPES.find((c) => c[0] === ty) || [ty, '', ty === 'number' || ty === 'numberchart' ? 'Number' : ty])[2];

	/* 7.x colorshade() */
	function colorshade(col, amt) {
		let c = String(col || '#ffffff').replace('#', '');
		const num = parseInt(c, 16) || 0;
		const cl = (v) => Math.max(0, Math.min(255, v));
		const r = cl((num >> 16) + amt), g = cl(((num >> 8) & 0xff) + amt), b = cl((num & 0xff) + amt);
		return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
	}

	let E = null;      // state of the open chart settings screen

	async function openChart(col) {
		const main = $('#x-main');
		main.innerHTML = `<div class="x-page"><div class="x-empty" style="padding-top:120px"><div class="x-spinner"></div></div></div>`;
		paintStatus(`<span><b>${tx('PANEL')}</b> ${col + 1}</span>`);
		let d;
		try {
			d = await api('editor', { query: { col } });
		} catch (e) {
			if (!e.silent) main.innerHTML = `<div class="x-page"><div class="x-alert x-alert-danger">${ic('error')}<div>${esc(e.message)}</div></div></div>`;
			return;
		}
		if (S.route !== 'chart' || S.routeParam !== col) return;
		const v = d.values;
		const isDb = d.source === 'ADatabase';
		const nTr = Math.max(1, v.xaxis.filter((x, i) => i === 0 || x).length);
		const traces = [];
		for (let i = 0; i < nTr; i++) {
			traces.push({
				type: v.type[i] || (i === 0 ? 'area' : 'area'),
				X: v.xaxis[i] || '', Y: v.yaxis[i] || '', size: v.size[i] || '', text: v.text[i] || '',
				maptype: v.maptype[i] || 'world', tracename: v.tracename[i] || '', yntitle: v.yntitle[i] || '',
				xmodel: v.xmodel[i] || '', xsort: v.xsort[i] || '', ymodel: v.ymodel[i] || '', ysort: v.ysort[i] || '',
				forecast: v.forecast[i] || '0', color: v.color[i] || '#ffffff', open: i === 0, pane: 'data',
			});
		}
		E = {
			col, d, isDb, traces,
			queries: v.sql.length ? v.sql.slice() : [''],
			tab: 1,
			result: isDb ? { cols: [], rows: [], types: [], tab: 0 } : (d.result || { cols: [], rows: [], types: [] }),
			options: isDb ? [] : (d.options || []),
			ran: false,
			p: {
				title: v.title, name: v.name, xaxistitle: v.xaxistitle, yaxistitle: v.yaxistitle,
				height: v.height || '0', width: v.width || '0', legposition: v.legposition,
				smartquery: v.smartquery === 'true' ? 'true' : 'false', filter: v.filter === 'true' ? 'true' : 'false',
				csvdata: v.csvdata === 'true' ? 'true' : 'false', dropdown: v.dropdown === 'true' ? 'true' : 'false',
				datalabel: v.datalabel === 'true' ? 'true' : 'false', showgrid: v.showgrid === 'false' ? 'false' : 'true',
				showline: v.showline === 'false' ? 'false' : 'true', orientation: v.orientation === 'h' ? 'h' : 'v',
				side: v.side === 'right' ? 'right' : 'left', plot: v.plot === 'static' ? 'static' : 'dynamic',
				refresh: v.refresh || '0', streaming: v.streaming === 'y' ? 'y' : 'n',
				chart_font_color: v.chart_font_color || '', chart_bg_color: v.chart_bg_color || '', border_color: v.border_color || '',
				borderwidth: v.borderwidth || '0', tablefontsize: v.tablefontsize || '9',
				total_show: v.total_show === 'true' ? 'true' : 'false', total_width: v.total_width || '1',
				kpichartformula: v.kpichartformula || 'SUM', kpichartpar: v.kpichartpar || '100', sparkline: v.sparkline === 'on',
				indicator: v.indicator === 'on', percentage: v.percentage === 'on', prefix: v.prefix || '', suffix: v.suffix || '',
				sumfield: v.sumfield.slice(), tablefield: v.tablefield.slice(),
				drill_enable: v.drillthrough_enable === 'on' || v.drillthrough_enable === 'filter',
				drillthrough: v.drillthrough || '', drillthrough_comprision: v.drillthrough_comprision || '==', drillthrough_page: v.drillthrough_page || '1',
			},
			dirty: false,
			open: { drill: false, props: false, result: false },
			table: '',
		};
		if (!d.inPage && !E.p.drillthrough) E.p.drillthrough = 'x';
		leaveGuard = async () => !E || !E.dirty || confirmBox(tx('LEAVE_UNSAVED', 'You have unsaved changes. Leave this screen?'), { title: tx('CHART_SETTINGS'), icon: ic('warning'), danger: true, ok: tx('CONFIRM_YES') });
		renderStudio();
		if (isDb) {
			if (strip(E.queries[0]).trim()) runQuery(1, true);
			else if (!E.traces[0].X && d.tables && d.tables.length) selectTable(d.tables[0]);
			else updateChart();
		} else {
			fillDefaults();
			renderTraces();
			renderSide();
			renderResult();
			updateChart();
		}
	}

	function dirty() { if (E) E.dirty = true; }

	/* the option list of a column select (X, Y, size, text) */
	function fieldOptions(saved) {
		const out = [];
		if (saved) out.push({ value: saved, label: E.isDb ? saved.slice(0, 5) + ' ' + colOf(saved) : colOf(saved) });
		E.options.forEach((o) => { if (o.value !== saved) out.push(o); });
		return out;
	}

	/* 7.x: a select shows its first option when nothing was saved */
	function fillDefaults() {
		if (!E.options.length) return;
		const first = E.options[0].value;
		E.traces.forEach((tr) => { ['X', 'Y', 'size', 'text'].forEach((k) => { if (!tr[k]) tr[k] = first; }); });
	}

	/* column type from the result grid: number / date / string, or '' when the column is not in it.
	   7.x looked at the first row only; here all shown rows count, so dates such as
	   "2026-01-01 00:00:00" and numbers with empty cells are recognised. */
	function isType(name) {
		const cols = E.result.cols || [];
		const i = cols.indexOf(name);
		if (i < 0) return '';
		const vals = (E.result.rows || []).map((r) => r[i]).filter((v) => v !== null && v !== undefined && String(v).trim() !== '');
		if (!vals.length) return (E.result.types || [])[i] || 'string';
		if (vals.every((v) => /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(String(v).trim()))) return 'number';
		const isDate = (v) => {
			const t = String(v).trim();
			if (!/\d/.test(t) || /^\d+$/.test(t)) return false;
			if (!/^(\d{4}[-/.]\d{1,2}([-/.]\d{1,2})?|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|[A-Za-z]{3,9}[ -]\d{1,2},? \d{4}|\d{1,2}[ -][A-Za-z]{3,9}[ -]\d{2,4}|[A-Za-z]{3}-\d{2,4})/.test(t)) return false;
			return !isNaN(Date.parse(t.replace(' ', 'T'))) || !isNaN(Date.parse(t));
		};
		if (vals.every(isDate)) return 'date';
		return 'string';
	}

	// ------------------------------------------------------------- layout
	function renderStudio() {
		const d = E.d;
		const main = $('#x-main');
		main.innerHTML = `
			<div class="x-studio-head">
				<span class="x-modal-icon">${ic('insert_chart')}</span>
				<div style="min-width:0"><h1>${tx('CHART_SETTINGS')} <span class="x-badge">${tx('PANEL')} ${E.col + 1}</span></h1>
					<p>${E.isDb ? `${ic('database', 'i-xs')} ${esc((d.rdbms || '').toUpperCase())}` : `${ic('table_view', 'i-xs')} ${esc(d.file || '')}`}${d.error ? ` · <span style="color:var(--danger)">${esc(d.error)}</span>` : ''}</p></div>
			</div>
			<div class="x-studio${E.isDb ? '' : ' no-right'}">
				<div class="x-studio-col" id="st-left">
					<div id="st-traces" class="x-col" style="gap:10px"></div>
					<div id="st-drill"></div>
					<div id="st-props"></div>
				</div>
				<div class="x-studio-col" id="st-center">
					${E.isDb ? `<div class="x-sql" id="st-sql"></div>` : ''}
					<div class="x-card x-preview-card">
						<div class="x-card-head"><h3>${ic('monitoring', 'i-sm')} ${tx('PREVIEW')}</h3>
							<span class="x-muted x-mono st-type-name" style="font-size:11px;margin-inline-start:auto"></span></div>
						<div class="x-preview-stage" id="layoutsettingchart">
							<!-- charts with Filter on write their filter widgets into this bar (as on the dashboard); hidden here -->
							<span id="defaultfilterid" hidden><span id="datefilteridshow"></span><span id="numberfilteridshow"></span><span id="filteridshow"></span></span>
							<div id="chartupdate"></div>
							<div class="x-preview-empty" id="st-empty">${ic('insert_chart')}<b>${tx('SELECT_X_Y')}</b><span>${E.isDb ? tx('ENTER_YOUR_QUERY') : ''}</span></div></div>
					</div>
					<div class="x-card" id="st-result"></div>
				</div>
				${E.isDb ? `<div class="x-studio-col" id="st-right"></div>` : ''}
			</div>
			<div class="x-studio-foot">
				<span class="x-muted" style="font-size:12px" id="st-dirty"></span>
				<span class="x-grow"></span>
				<button class="x-btn" data-a="cancel">${tx('CANCEL')}</button>
				<button class="x-btn x-btn-success" data-a="clear">${ic('backspace', 'i-sm')}${tx('CLEAR_DATA')}</button>
				<button class="x-btn x-btn-primary" data-a="save">${ic('save', 'i-sm')}${tx('SAVE_CHANGES')}</button>
			</div>`;
		$('[data-a="cancel"]', main).addEventListener('click', () => { E.dirty = false; go('/'); });
		$('[data-a="clear"]', main).addEventListener('click', clearChart);
		$('[data-a="save"]', main).addEventListener('click', saveChart);
		main.addEventListener('input', () => { dirty(); paintDirty(); });
		main.addEventListener('change', () => { dirty(); paintDirty(); });
		renderTraces();
		renderSide();
		if (E.isDb) { renderSql(); renderRight(); }
		renderResult();
	}

	function paintDirty() {
		const el = $('#st-dirty');
		if (el) el.innerHTML = E.dirty ? `${ic('edit', 'i-xs')} ${tx('UNSAVED', 'Unsaved changes')}` : '';
	}

	// ------------------------------------------------------------- traces
	function selectHtml(name, opts, value, attrs = '') {
		return `<select class="x-select x-input-sm" data-f="${name}" ${attrs}>${opts.map((o) => `<option value="${esc(o.value)}"${o.value === value ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
	}

	function renderTraces() {
		const host = $('#st-traces');
		if (!host) return;
		const t0 = E.traces[0].type;
		const lim = E.d.limited;
		host.innerHTML = '';
		E.traces.forEach((tr, i) => {
			const card = h(`<section class="x-card x-trace${tr.open ? '' : ' is-closed'}" data-tr="${i}">
				<div class="x-trace-head" role="button" tabindex="0" aria-expanded="${tr.open}">
					<span class="x-trace-no">${i + 1}</span>
					<span class="x-trace-name">${tx('TRACE')} ${i + 1}</span>
					<span class="x-trace-sub">${esc(typeLabel(i === 0 ? t0 : tr.type))}${tr.X ? ' · ' + esc(colOf(tr.X)) : ''}</span>
					${i === 0 ? `<button class="x-btn x-btn-ghost x-btn-xs x-icon-only" data-a="add" title="${tx('ADD_TRACE')}" ${NO_ADD_TRACE.includes(t0) || E.traces.length >= 20 ? 'hidden' : ''}>${ic('add', 'i-sm')}</button>`
					: `<button class="x-btn x-btn-ghost x-btn-xs x-icon-only" data-a="remove" title="${tx('REMOVE_TRACE')}">${ic('remove', 'i-sm')}</button>`}
					${ic('expand_more', 'x-chev i-sm')}
				</div>
				<div class="x-trace-body">
					<div class="x-subtabs" role="tablist"><button type="button" data-pane="data" class="${tr.pane === 'data' ? 'active' : ''}">${tx('DATA', 'Data')}</button><button type="button" data-pane="style" class="${tr.pane === 'style' ? 'active' : ''}">${tx('STYLE')}</button></div>
					<div class="x-col st-pane-data" style="gap:10px" ${tr.pane === 'data' ? '' : 'hidden'}></div>
					<div class="x-col st-pane-style" style="gap:10px" ${tr.pane === 'style' ? '' : 'hidden'}></div>
				</div>
			</section>`);
			const head = $('.x-trace-head', card);
			const toggle = (e) => { if (e.target.closest('button')) return; tr.open = !tr.open; card.classList.toggle('is-closed', !tr.open); head.setAttribute('aria-expanded', tr.open); };
			head.addEventListener('click', toggle);
			head.addEventListener('keydown', (e) => { if (e.key === 'Enter') toggle(e); });
			const add = $('[data-a="add"]', card); if (add) add.addEventListener('click', addTrace);
			const rm = $('[data-a="remove"]', card); if (rm) rm.addEventListener('click', () => removeTrace(i));
			$$('.x-subtabs button', card).forEach((b) => b.addEventListener('click', () => {
				tr.pane = b.dataset.pane;
				$$('.x-subtabs button', card).forEach((x) => x.classList.toggle('active', x === b));
				$('.st-pane-data', card).hidden = tr.pane !== 'data';
				$('.st-pane-style', card).hidden = tr.pane !== 'style';
			}));
			buildTraceData($('.st-pane-data', card), tr, i, t0, lim);
			buildTraceStyle($('.st-pane-style', card), tr, i, t0);
			host.append(card);
		});
		const nm = $('.st-type-name');
		if (nm) nm.textContent = typeLabel(t0);
	}

	function field(label, html, cls = '') {
		return `<div class="x-field x-field-inline ${cls}"><label>${label}</label><div class="x-grow">${html}</div></div>`;
	}

	function buildTraceData(el, tr, i, t0, lim) {
		const first = i === 0;
		/* labels and visibility - 7.x mySelection() */
		let xl = 'X', yl = 'Y', sizeL = strip(t('SIZE')), textL = strip(t('TEXT'));
		let showX = true, showY = true, showSize = false, showText = false, showMap = false, showType = true, showYn = !first, showLegend = true, showAnalytic = true;
		if (t0 === 'bubble') { showSize = true; showText = true; if (!first) { showType = false; showYn = false; } }
		if (t0 === 'sankey') { showSize = true; sizeL = strip(t('VALUE')); showText = true; if (!first) { showType = false; showYn = false; } }
		if (t0 === 'map') {
			showText = first; xl = strip(t('LOC')); yl = first ? strip(t('VALUE')) : 'Z'; showMap = true;
			if (!first) { showType = false; showYn = false; }
		}
		if (t0 === 'scatter3d') { showSize = true; sizeL = 'Z'; if (!first) showType = false; }
		if (t0 === 'sunburst') { showSize = true; sizeL = strip(t('LABEL')); if (first) { xl = 'Ids'; yl = 'Parent'; } }
		if (first) {
			if (t0 === 'numberchart' || t0 === 'number') { xl = 'Num'; showY = false; }
			if (t0 === 'gauge') { xl = strip(t('VALUE')); yl = strip(t('MAX')); }
			if (t0 === 'pie' || t0 === 'donut') { xl = strip(t('VALUE')); yl = strip(t('TEXT')); }
			if (t0 === 'charttable') { showX = false; showY = false; showLegend = false; showAnalytic = false; }
			if (t0 === 'kpichart') { xl = 'Y'; showY = false; }
		}
		const types = first ? CHART_TYPES : CHART_TYPES.filter((c) => TRACE_TYPES.includes(c[0]));
		const cur = tr.type === 'number' ? 'numberchart' : tr.type;
		el.innerHTML = `
			${showType ? `<div class="x-type-current" role="button" tabindex="0" aria-expanded="false" data-a="types">
				<span class="x-modal-icon">${ic(typeIcon(cur === 'numberchart' ? 'number' : cur))}</span><div><div class="x-label">${tx('CHART_TYPE', 'Chart type')}</div><b>${esc(typeLabel(cur))}</b></div>${ic('expand_more', 'x-chev i-sm')}</div>
				<div class="x-types" hidden>${types.map(([ty, icon, label]) => {
					const locked = lim && !FREE_TYPES.includes(ty);
					return `<button type="button" class="x-type${ty === cur ? ' active' : ''}${locked ? ' is-locked' : ''}" data-type="${ty}" title="${esc(label)}${locked ? ' · ' + tx('UPGRADE_LICENSE') : ''}" ${locked ? 'aria-disabled="true"' : ''}>${ic(icon)}<span>${esc(label)}</span></button>`;
				}).join('')}</div>` : ''}
			${first && t0 === 'kpichart' ? `<label class="x-row x-between"><span>${tx('SPARKLINE')}</span><span class="x-switch"><input type="checkbox" data-p="sparkline" ${E.p.sparkline ? 'checked' : ''}><span class="x-track"></span></span></label>` : ''}
			${showX ? field(esc(xl), selectHtml('X', fieldOptions(tr.X), tr.X)) : ''}
			${showY ? field(esc(yl), selectHtml('Y', fieldOptions(tr.Y), tr.Y)) : ''}
			${first && t0 === 'kpichart' ? kpiHtml() : ''}
			${showSize ? field(esc(sizeL), selectHtml('size', fieldOptions(tr.size), tr.size)) : ''}
			${showText ? field(esc(textL), selectHtml('text', fieldOptions(tr.text), tr.text)) : ''}
			${showMap ? field(tx('MAP'), `<select class="x-select x-input-sm" data-f="maptype">${MAPS.map(([v2, l]) => `<option value="${v2}"${tr.maptype === v2 ? ' selected' : ''}>${l}</option>`).join('')}</select>`) : ''}
			${showLegend ? field(tx('LEGEND'), `<input class="x-input x-input-sm" data-f="tracename" value="${esc(tr.tracename)}">`) : ''}
			${first && t0 === 'charttable' ? tableFieldsHtml() : ''}
			${showYn ? field(`Y${i + 1}-${tx('TITLE')}`, `<input class="x-input x-input-sm" data-f="yntitle" value="${esc(tr.yntitle)}">`) : ''}
			${showAnalytic ? analyticsHtml(tr) : ''}`;

		/* chart type */
		const cb = $('[data-a="types"]', el);
		if (cb) {
			const grid = $('.x-types', el);
			const tg = () => { grid.hidden = !grid.hidden; cb.setAttribute('aria-expanded', !grid.hidden); };
			cb.addEventListener('click', tg);
			cb.addEventListener('keydown', (e) => { if (e.key === 'Enter') tg(); });
			$$('.x-type', grid).forEach((b) => b.addEventListener('click', () => {
				if (b.classList.contains('is-locked')) return;
				chartChange(b.dataset.type, i);
			}));
		}
		/* column selects + inputs */
		$$('[data-f]', el).forEach((inp) => {
			const f = inp.dataset.f;
			const ev = inp.tagName === 'SELECT' ? 'change' : 'input';
			inp.addEventListener(ev, () => {
				tr[f] = inp.value;
				if (f === 'X' || f === 'Y') { paintAnalytics(el, tr); const sub = $(`.x-trace[data-tr="${i}"] .x-trace-sub`); if (sub) sub.textContent = typeLabel(i === 0 ? E.traces[0].type : tr.type) + (tr.X ? ' · ' + colOf(tr.X) : ''); }
				updateChartSoon();
			});
		});
		bindKpi(el);
		bindTableFields(el);
		bindAnalytics(el, tr);
	}

	function kpiHtml() {
		const p = E.p;
		return `<div class="x-col" style="gap:8px">
			${field('&#x2211;(Y)', `<select class="x-select x-input-sm" data-p="kpichartformula">${['SUM', 'AVG', 'COUNT', 'MAX', 'MIN', 'VAR', 'STD'].map((f) => `<option${p.kpichartformula === f ? ' selected' : ''}>${f}</option>`).join('')}</select>`)}
			<div class="x-card" style="padding:10px;display:flex;flex-direction:column;gap:8px;box-shadow:none">
				<label class="x-row x-between"><span>${tx('INDICATOR')}</span><span class="x-switch"><input type="checkbox" data-p="indicator" ${p.indicator ? 'checked' : ''}><span class="x-track"></span></span></label>
				<div class="x-row st-target" style="gap:8px" ${p.indicator ? '' : 'hidden'}>
					<label class="x-label" style="min-width:56px">${tx('TARGET')}</label>
					<input class="x-input x-input-sm" type="number" data-p="kpichartpar" value="${esc(p.kpichartpar)}" style="width:90px">
					<label class="x-row" style="gap:6px;cursor:pointer"><span>%</span><span class="x-switch"><input type="checkbox" data-p="percentage" ${p.percentage ? 'checked' : ''}><span class="x-track"></span></span></label>
				</div>
			</div>
			${field(tx('PREFIX'), `<div style="position:relative"><input class="x-input x-input-sm" data-p="prefix" value="${esc(p.prefix)}" style="padding-inline-end:34px">
				<button type="button" class="x-btn x-btn-ghost x-btn-xs x-icon-only" data-a="unicode" title="Insert Unicode" style="position:absolute;inset-inline-end:2px;top:50%;transform:translateY(-50%)">&#128512;</button>
				<div class="x-unicode" hidden>${UNICODE.map((c) => `<button type="button" data-code="${c}">&#${c};</button>`).join('')}</div></div>`)}
			${field(tx('SUFFIX'), `<input class="x-input x-input-sm" data-p="suffix" value="${esc(p.suffix)}">`)}
		</div>`;
	}

	function bindKpi(el) {
		$$('[data-p]', el).forEach((inp) => {
			const k = inp.dataset.p;
			const ev = inp.type === 'checkbox' || inp.tagName === 'SELECT' ? 'change' : 'input';
			inp.addEventListener(ev, () => {
				E.p[k] = inp.type === 'checkbox' ? inp.checked : inp.value;
				if (k === 'indicator') { const tg = $('.st-target', el); if (tg) tg.hidden = !inp.checked; }
				updateChartSoon();
			});
		});
		const ub = $('[data-a="unicode"]', el);
		if (ub) {
			const menuEl = $('.x-unicode', el);
			ub.addEventListener('click', (e) => { e.stopPropagation(); menuEl.hidden = !menuEl.hidden; });
			$$('button[data-code]', menuEl).forEach((b) => b.addEventListener('click', () => {
				const inp = $('[data-p="prefix"]', el);
				inp.value += '&#' + b.dataset.code + ';';
				E.p.prefix = inp.value;
				menuEl.hidden = true;
				dirty();
				updateChart();
			}));
			document.addEventListener('mousedown', (e) => { if (!menuEl.hidden && !e.target.closest('.x-unicode') && e.target !== ub) menuEl.hidden = true; });
		}
	}

	function tableFieldsHtml() {
		const cols = E.result.cols && E.result.cols.length ? E.result.cols : null;
		const chips = (key) => {
			const list = cols || E.p[key];
			return `<div class="x-multi" data-multi="${key}">${list.map((c) => `<label class="x-chip${E.p[key].includes(c) ? ' on' : ''}"><input type="checkbox" value="${esc(c)}" ${E.p[key].includes(c) ? 'checked' : ''} hidden>${esc(c)}</label>`).join('') || '<span class="x-muted" style="font-size:11px">—</span>'}</div>`;
		};
		return `<div class="x-col" style="gap:6px"><span class="x-label">${tx('EMPTYROW')}</span>${chips('tablefield')}
			<span class="x-label">&Sigma; ${tx('TOTAL')}</span>${chips('sumfield')}</div>`;
	}

	function bindTableFields(el) {
		$$('[data-multi]', el).forEach((box) => {
			const key = box.dataset.multi;
			$$('input', box).forEach((c) => c.addEventListener('change', () => {
				c.parentNode.classList.toggle('on', c.checked);
				const all = $$('input', box);
				E.p[key] = all.filter((x) => x.checked).map((x) => x.value);
				paintTotals();
				updateChartSoon();
			}));
		});
	}

	/* Data analysis (7.x engine rules, inc/dashboard_dist.php):
	   - Summarise Y (SUM, AVG ...) + Group X  -> one value per X group
	   - Summarise Y without a group on X      -> one grand total
	   - Group X: each value, or by Year / Quarter / Month for dates
	   - Sort: one axis per trace (number or date values)
	   "GRP" = group by each value as it is (the engine groups by the raw X value). */
	const GROUP_EACH = ['GRP', 'Each value'];
	function analyticsHtml(tr) {
		const open = tr.xmodel || tr.xsort || tr.ymodel || tr.ysort || (tr.forecast && tr.forecast !== '0');
		return `<details class="x-collapse-d x-an" ${open ? 'open' : ''}>
			<summary class="x-label" style="cursor:pointer;padding:6px 0">${ic('analytics', 'i-xs')} ${tx('DATA_ANALYSIS')}</summary>
			<div class="x-col" style="gap:8px;padding-top:6px">
				<div class="x-an-row"><span class="x-axis-tag">Y</span><div class="x-an-f"><label>Summarise</label><select class="x-select x-input-sm" data-an="ymodel"></select></div><div class="x-an-f"><label>Sort</label><select class="x-select x-input-sm" data-an="ysort"></select></div></div>
				<div class="x-an-row"><span class="x-axis-tag">X</span><div class="x-an-f"><label>Group by</label><select class="x-select x-input-sm" data-an="xmodel"></select></div><div class="x-an-f"><label>Sort</label><select class="x-select x-input-sm" data-an="xsort"></select></div></div>
				<div class="x-an-hint x-help"></div>
				<div class="x-field x-field-inline"><label>${tx('FORECAST')}</label><input class="x-input x-input-sm" type="number" min="0" max="10" data-an="forecast" value="${esc(tr.forecast || '0')}" style="width:80px"></div>
			</div></details>`;
	}

	function anOptions(ax, ty, cur) {
		/* what the 7.x engine can do with this column type */
		let list;
		if (ax === 'y') list = ty === 'number' || ty === '' ? NUM_MODELS : (ty === 'date' ? [GROUP_EACH].concat(DATE_MODELS) : [GROUP_EACH]);
		else list = ty === 'date' ? [GROUP_EACH].concat(DATE_MODELS) : (ty === 'number' ? [GROUP_EACH].concat(NUM_MODELS) : [GROUP_EACH]);
		if (cur && !list.find((m) => m[0] === cur)) list = list.concat([[cur, cur === 'GRP' ? 'Each value' : cur]]);   // keep a saved value we cannot check
		return list;
	}

	function paintAnalytics(el, tr) {
		const nameX = colOf(tr.X), nameY = colOf(tr.Y);
		const tX = isType(nameX), tY = isType(nameY);
		const m = (ax) => $(`[data-an="${ax}"]`, el);
		if (!m('xmodel')) return;
		const yList = anOptions('y', tY, tr.ymodel);
		m('ymodel').innerHTML = `<option value="">None</option>` + yList.map(([v, l]) => `<option value="${v}"${tr.ymodel === v ? ' selected' : ''} title="${l}(${esc(nameY)})">${l}</option>`).join('');
		const xList = anOptions('x', tX, tr.xmodel);
		m('xmodel').innerHTML = `<option value="">None</option>` + xList.map(([v, l]) => `<option value="${v}"${tr.xmodel === v ? ' selected' : ''}>${l}</option>`).join('');
		const sortOpts = (cur, ty) => `<option value="">None</option><option value="ASC"${cur === 'ASC' ? ' selected' : ''}>${ty === 'date' ? 'Oldest first' : 'Low → High'}</option><option value="DSC"${cur === 'DSC' ? ' selected' : ''}>${ty === 'date' ? 'Newest first' : 'High → Low'}</option>`;
		m('ysort').innerHTML = sortOpts(tr.ysort, tY);
		m('xsort').innerHTML = sortOpts(tr.xsort, tX);
		/* the engine only sorts number or date values */
		m('xsort').disabled = tX === 'string' && !tr.xsort && !tr.xmodel;
		m('ysort').disabled = tY === 'string' && !tr.ysort;
		const fc = $('[data-an="forecast"]', el);
		if (fc) fc.disabled = tX !== 'date' && !(tr.forecast && tr.forecast !== '0');
		/* plain-language summary of what the chart will show */
		const NUMS = NUM_MODELS.map((x) => x[0]);
		const lab = (v) => (NUM_MODELS.concat(DATE_MODELS, [GROUP_EACH]).find((x) => x[0] === v) || [v, v])[1];
		let hint = '';
		if (NUMS.includes(tr.ymodel) && tr.xmodel) hint = `${lab(tr.ymodel)} of <b>${esc(nameY)}</b> for ${tr.xmodel === 'GRP' ? 'each' : 'each ' + lab(tr.xmodel).toLowerCase() + ' of'} <b>${esc(nameX)}</b>`;
		else if (NUMS.includes(tr.ymodel)) hint = `One total: ${lab(tr.ymodel)} of <b>${esc(nameY)}</b> (choose a Group by to get one bar per ${esc(nameX)})`;
		else if (NUMS.includes(tr.xmodel) && tr.ymodel) hint = `${lab(tr.xmodel)} of <b>${esc(nameX)}</b> for each <b>${esc(nameY)}</b>`;
		else if (tr.xmodel && !tr.ymodel) hint = `Choose how to summarise <b>${esc(nameY)}</b> (e.g. SUM) to group by ${esc(nameX)}`;
		const h = $('.x-an-hint', el);
		if (h) { h.innerHTML = hint; h.hidden = !hint; }
	}

	function bindAnalytics(el, tr) {
		if (!$('[data-an]', el)) return;
		paintAnalytics(el, tr);
		const NUMS = NUM_MODELS.map((x) => x[0]);
		$$('[data-an]', el).forEach((inp) => inp.addEventListener(inp.tagName === 'SELECT' ? 'change' : 'input', () => {
			const k = inp.dataset.an;
			tr[k] = inp.value;
			if ((k === 'xsort' || k === 'ysort') && inp.value) {
				const other = k === 'xsort' ? 'ysort' : 'xsort';
				tr[other] = '';
			}
			/* summarising Y normally means one value per X: group X by each value unless a grouping is set */
			if (k === 'ymodel' && NUMS.includes(inp.value) && !tr.xmodel) tr.xmodel = 'GRP';
			if (k === 'ymodel' && !inp.value && tr.xmodel === 'GRP') tr.xmodel = '';
			/* the engine sums X when X is summarised and Y is not grouped */
			if (k === 'xmodel' && NUMS.includes(inp.value) && !tr.ymodel) tr.ymodel = 'GRP';
			if (k === 'xmodel' && tr.xmodel === 'GRP' && tr.forecast && tr.forecast !== '0') tr.forecast = '0';
			paintAnalytics(el, tr);
			const fc = $('[data-an="forecast"]', el);
			if (fc && fc.value !== String(tr.forecast || '0')) fc.value = tr.forecast || '0';
			updateChartSoon();
		}));
	}

	function buildTraceStyle(el, tr, i, t0) {
		const p = E.p;
		const colorVal = (() => {
			const c = tr.color || '#ffffff';
			if (c.trim().startsWith('[')) { try { return JSON.parse(c)[0] || '#ffffff'; } catch (e) { return '#ffffff'; } }
			return /^#[0-9a-f]{6}$/i.test(c) ? c : '#ffffff';
		})();
		const colorRow = (label, key, val) => field(label, `<div class="x-row" style="gap:6px"><input type="color" class="x-color" data-s="${key}" value="${esc(/^#[0-9a-f]{6}$/i.test(val) ? val : '#ffffff')}"><span class="x-mono x-muted" style="font-size:11px">${esc(val || 'auto')}</span></div>`);
		let html = colorRow(tx('COLOR'), 'color', colorVal);
		if (i === 0) {
			html += colorRow(tx('FONT'), 'chart_font_color', p.chart_font_color);
			html += colorRow(tx('BACKGROUND'), 'chart_bg_color', p.chart_bg_color);
			html += colorRow(tx('BORDERCOLOR'), 'border_color', p.border_color);
			html += rangeRow(tx('BORDERWIDTH'), 'borderwidth', 0, 20, 1, p.borderwidth, 'px');
			if (t0 === 'charttable' || t0 === 'kpichart') {
				html += rangeRow(tx('FONT'), 'tablefontsize', 9, 40, 3, p.tablefontsize, 'px');
				html += `<div class="st-totals" ${(p.sumfield.length || p.tablefield.length) ? '' : 'hidden'}>${field(tx('TOTAL'), `<div class="x-row" style="gap:8px">${segHtml('total_show', [['true', tx('SHOW')], ['false', tx('HIDE')]], p.total_show)}
					<input class="x-input x-input-sm" type="number" min="1" data-s="total_width" value="${esc(p.total_width)}" style="width:64px"></div>`)}</div>`;
			}
		}
		el.innerHTML = html;
		$$('[data-s]', el).forEach((inp) => inp.addEventListener('input', () => {
			const k = inp.dataset.s;
			if (k === 'color') tr.color = inp.value; else E.p[k] = inp.value;
			const lab = inp.nextElementSibling;
			if (inp.type === 'color' && lab) lab.textContent = inp.value;
			if (inp.type === 'range') showSlider(inp);
			if (inp.type === 'range' && inp.dataset.s !== 'tablefontsize' && inp.dataset.s !== 'borderwidth') return;
			updateChartSoon();
		}));
		bindSegs(el, () => updateChartSoon());
	}

	function rangeRow(label, key, min, max, step, val, unit, attr = 'data-s') {
		const v = val === '' || val == null ? String(min) : String(val);
		return field(label, `<div class="x-row" style="gap:8px"><input type="range" class="x-range" ${attr}="${key}" min="${min}" max="${max}" step="${step}" value="${esc(v)}" data-unit="${unit}" style="flex:1">
			<output class="x-mono" style="font-size:11px;min-width:56px;text-align:end">${sliderText(v, unit, key)}</output></div>`);
	}
	function sliderText(v, unit, key) {
		if (key === 'refresh') return +v === 0 ? '<span class="x-muted">disable</span>' : esc(v) + ' sec';
		return +v === 0 ? '<span class="x-muted">auto</span>' : esc(v) + unit;
	}
	function showSlider(inp) {
		const out = inp.parentNode.querySelector('output');
		if (out) out.innerHTML = sliderText(inp.value, inp.dataset.unit || 'px', inp.dataset.s || inp.dataset.pp);
	}

	function segHtml(name, opts, val) {
		const id = 'sg' + Math.random().toString(36).slice(2, 8);
		return `<div class="x-seg" role="radiogroup" data-seg="${name}">${opts.map(([v2, l]) => `<label><input type="radio" name="${id}" value="${v2}" ${String(val) === v2 ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>`;
	}
	function bindSegs(el, cb) {
		$$('[data-seg]', el).forEach((sg) => $$('input', sg).forEach((r) => r.addEventListener('change', () => { E.p[sg.dataset.seg] = r.value; cb(sg.dataset.seg, r.value); })));
	}

	function paintTotals() {
		const tt = $('.st-totals');
		if (tt) tt.hidden = !(E.p.sumfield.length || E.p.tablefield.length);
	}

	function addTrace() {
		if (E.traces.length >= 20) return;
		const t0 = E.traces[0];
		const k = E.traces.length;
		const scheme = E.d.colorScheme || [];
		let color = '#ffffff';
		const c0 = String(t0.color || '#ffffff');
		if (c0 !== '#ffffff' && c0 !== '') {
			if (scheme[k] !== undefined) color = scheme[k];
			else color = colorshade(c0.startsWith('[') ? (JSON.parse(c0)[0] || '#ffffff') : c0, (k + 1) * 30);
		}
		E.traces.forEach((tr) => { tr.open = false; });
		E.traces.push({
			type: 'area', X: t0.X, Y: t0.Y, size: t0.size, text: t0.text, maptype: 'world', tracename: '', yntitle: '',
			xmodel: '', xsort: '', ymodel: '', ysort: '', forecast: '0', color, open: true, pane: 'data',
		});
		dirty(); paintDirty();
		renderTraces();
		updateChart();
	}

	function removeTrace(i) {
		if (i === 0) return;
		E.traces.splice(i, 1);
		dirty(); paintDirty();
		renderTraces();
		updateChart();
	}

	/* 7.x chart_change(): type of a trace (+ colour scheme and drill-through options) */
	function chartChange(type, c) {
		const scheme = E.d.colorScheme || [];
		if (c === 0 && scheme.length) {
			E.traces[0].color = (type === 'pie' || type === 'donut') ? JSON.stringify(scheme) : scheme[0];
		}
		E.traces[c].type = type;
		if (c === 0) {
			if (!E.d.inPage && E.d.hasPages) {
				const opts = drillFromOptions(type).map((o) => o[0]);
				if (!opts.includes(E.p.drillthrough)) E.p.drillthrough = opts[0];
			}
			if (NO_ADD_TRACE.includes(type)) E.traces.forEach((tr) => { tr.open = false; });
			E.traces[0].open = true;
		}
		dirty(); paintDirty();
		renderTraces();
		renderSide();
		updateChart();
	}

	// ----------------------------------------------- drill-through + properties
	function drillFromOptions(type) {
		if (type === 'pie' || type === 'donut' || type === 'map') return [['x', strip(t('VALUE'))], ['y', strip(t('TEXT'))]];
		if (type === 'bubble') return [['x', 'X'], ['y', 'Y'], ['size', strip(t('SIZE'))], ['text', strip(t('TEXT'))]];
		return [['x', 'X'], ['y', 'Y']];
	}

	function collapsible(id, title, icon, body, key) {
		return `<section class="x-card x-collapse${E.open[key] ? '' : ' is-closed'}" id="${id}" data-key="${key}">
			<div class="x-card-head" role="button" tabindex="0"><h3>${ic(icon, 'i-sm')} ${title}</h3>${ic('expand_more', 'x-chev i-sm')}</div>
			<div class="x-card-body x-col" style="gap:10px">${body}</div></section>`;
	}
	function bindCollapse(root) {
		$$('.x-collapse > .x-card-head', root).forEach((hd) => {
			const sec = hd.parentNode;
			const tg = () => { sec.classList.toggle('is-closed'); E.open[sec.dataset.key] = !sec.classList.contains('is-closed'); };
			hd.addEventListener('click', tg);
			hd.addEventListener('keydown', (e) => { if (e.key === 'Enter') tg(); });
		});
	}

	function renderSide() {
		const d = E.d;
		const p = E.p;
		const t0 = E.traces[0].type;
		/* drill-through: shown on a page, or when the dashboard has pages */
		const dh = $('#st-drill');
		if (dh) {
			if (d.inPage || d.hasPages) {
				let fromSel;
				if (d.inPage) {
					const cols = E.result.cols && E.result.cols.length ? E.result.cols : [];
					if (!p.drillthrough && cols[0]) p.drillthrough = cols[0];
					const list = cols.length ? cols : [p.drillthrough];
					fromSel = `<select class="x-select x-input-sm" data-pp="drillthrough">${list.map((c) => `<option value="${esc(c)}"${c === p.drillthrough ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select>`;
				} else {
					fromSel = `<select class="x-select x-input-sm" data-pp="drillthrough">${drillFromOptions(t0).map(([v2, l]) => `<option value="${v2}"${v2 === p.drillthrough ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
				}
				const cmp = [['==', 'EQUALTO'], ['>', 'GREATERTHAN'], ['<', 'LESSTHAN'], ['!=', 'NOTEQUALTO'], ['!>', 'NOTGREATERTHAN'], ['!<', 'NOTLESSTHAN'], ['>=', 'GREATERTHANOREQUALTO'], ['<=', 'LESSTHANOREQUALTO']];
				const pages = [];
				for (let n = 1; n <= (d.pages || 0); n++) pages.push(n);
				dh.innerHTML = collapsible('st-drill-sec', tx('DRILLTHROUGH'), 'account_tree', `
					<label class="x-row x-between"><span>${tx('ENABLE')}</span><span class="x-switch"><input type="checkbox" data-pp="drill_enable" ${p.drill_enable ? 'checked' : ''}><span class="x-track"></span></span></label>
					${field(tx('DRILLTHROUGH_FROM'), fromSel)}
					${d.inPage ? field(tx('DRILLTHROUGH_WHEN'), `<select class="x-select x-input-sm" data-pp="drillthrough_comprision">${cmp.map(([v2, k]) => `<option value="${esc(v2)}"${p.drillthrough_comprision === v2 ? ' selected' : ''}>${tx(k)}</option>`).join('')}</select>`)
					: field(tx('PAGE'), `<select class="x-select x-input-sm" data-pp="drillthrough_page">${pages.map((n) => `<option value="${n}"${String(p.drillthrough_page) === String(n) ? ' selected' : ''}>${tx('PAGE')} ${n}</option>`).join('')}</select>`)}`, 'drill');
				bindCollapse(dh);
				$$('[data-pp]', dh).forEach((inp) => inp.addEventListener('change', () => { p[inp.dataset.pp] = inp.type === 'checkbox' ? inp.checked : inp.value; }));
			} else dh.innerHTML = '';
		}
		/* properties */
		const ph = $('#st-props');
		if (!ph) return;
		const refreshOk = d.refreshAllowed && REFRESH_TYPES.includes(t0);
		const yesNo = [['true', tx('YES')], ['false', tx('NO')]];
		const showHide = [['true', tx('SHOW')], ['false', tx('HIDE')]];
		ph.innerHTML = collapsible('st-props-sec', tx('PROPERTIES'), 'tune', `
			${field(tx('CAPTION'), `<input class="x-input x-input-sm" data-pp="title" value="${esc(p.title)}" placeholder="${tx('CHART')} ${tx('TITLE')}">`)}
			${field(tx('NAME'), `<input class="x-input x-input-sm" data-pp="name" value="${esc(p.name)}" placeholder="Pie1">`)}
			${field(tx('TITLE') + ' X', `<input class="x-input x-input-sm" data-pp="xaxistitle" data-live="1" value="${esc(p.xaxistitle)}" placeholder="Sales">`)}
			${field(tx('TITLE') + ' Y', `<input class="x-input x-input-sm" data-pp="yaxistitle" data-live="1" value="${esc(p.yaxistitle)}" placeholder="Products">`)}
			${rangeRow(tx('HEIGHT'), 'height', 0, 700, 50, p.height, 'px', 'data-pp')}
			${rangeRow(tx('WIDTH'), 'width', 0, 700, 50, p.width, 'px', 'data-pp')}
			${field(tx('LEGEND'), `<select class="x-select x-input-sm" data-pp="legposition" data-live="1">${[['bottomcenter', 'BOTTOM_CENTER'], ['bottomleft', 'BOTTOM_LEFT'], ['topcenter', 'TOP_CENTER'], ['topleft', 'TOP_LEFT'], ['', 'RIGHT']].map(([v2, k]) => `<option value="${v2}"${p.legposition === v2 ? ' selected' : ''}>${tx(k)}</option>`).join('')}</select>`)}
			${field(tx('SMARTQUERY'), segHtml('smartquery', yesNo, p.smartquery))}
			${field(tx('FILTERLABEL'), segHtml('filter', showHide, p.filter))}
			${field(tx('VIEW_DATA'), segHtml('csvdata', showHide, p.csvdata))}
			${field(tx('DROPDOWN'), segHtml('dropdown', showHide, p.dropdown))}
			${field(tx('DATALABEL'), segHtml('datalabel', showHide, p.datalabel))}
			${field(tx('GRID'), segHtml('showgrid', showHide, p.showgrid))}
			${field(tx('BORDER'), segHtml('showline', showHide, p.showline))}
			${field(tx('LAYOUT'), segHtml('orientation', [['h', tx('HORIZ')], ['v', tx('VERT')]], p.orientation))}
			${field(tx('SIDE'), segHtml('side', [['left', tx('LEFT')], ['right', tx('RIGHT')]], p.side))}
			${field(tx('PLOT'), segHtml('plot', [['dynamic', tx('DYNAMIC')], ['static', tx('STATIC')]], p.plot))}
			<div class="st-refresh" ${refreshOk ? '' : 'hidden'}>${rangeRow(tx('REFRESH'), 'refresh', 0, 60, 1, p.refresh, ' sec', 'data-pp')}</div>
			<div class="st-stream" ${refreshOk && +p.refresh > 0 && STREAM_TYPES.includes(t0) ? '' : 'hidden'}>${field(tx('STREAMING'), segHtml('streaming', [['y', tx('YES')], ['n', tx('NO')]], p.streaming))}</div>`, 'props');
		bindCollapse(ph);
		$$('[data-pp]', ph).forEach((inp) => inp.addEventListener(inp.tagName === 'SELECT' ? 'change' : 'input', () => {
			const k = inp.dataset.pp;
			p[k] = inp.value;
			if (inp.type === 'range') {
				const out = inp.parentNode.querySelector('output');
				if (out) out.innerHTML = sliderText(inp.value, inp.dataset.unit, k);
				if (k === 'refresh') { const sv = $('.st-stream', ph); if (sv) sv.hidden = !(+inp.value > 0 && STREAM_TYPES.includes(E.traces[0].type)); }
				return;
			}
			if (inp.dataset.live && (k === 'xaxistitle' || k === 'yaxistitle')) return;   // applied on change
			if (inp.dataset.live) chartProperties();
		}));
		$$('[data-pp="xaxistitle"], [data-pp="yaxistitle"]', ph).forEach((inp) => inp.addEventListener('change', chartProperties));
		bindSegs(ph, (k) => {
			if (['dropdown', 'showgrid', 'showline'].includes(k)) chartProperties();
			else if (k !== 'streaming') updateChartSoon();
		});
	}

	// ------------------------------------------------------------ SQL editor
	function renderSql() {
		const box = $('#st-sql');
		if (!box) return;
		const n = E.queries.length;
		box.innerHTML = `<div class="x-sql-tabs" role="tablist">
				${E.queries.map((q, i) => `<button type="button" class="x-sql-tab${E.tab === i + 1 ? ' active' : ''}" data-tab="${i + 1}" role="tab">${ic('code', 'i-xs')}SQL ${i + 1}${i > 0 && i === n - 1 ? `<span class="x-x" data-rm title="${tx('REMOVE_SQL')}">${ic('close', 'i-xs')}</span>` : ''}</button>`).join('')}
				${n < 10 ? `<button type="button" class="x-btn x-btn-ghost x-btn-xs x-icon-only" data-a="addsql" title="${tx('ADD_SQL')}">${ic('add', 'i-sm')}</button>` : ''}
				<span class="x-grow"></span>
				${E.d.qb ? `<button type="button" class="x-btn x-btn-soft x-btn-xs" data-a="qb">${ic('bolt', 'i-xs')}${tx('LAUNCHQB')}</button>` : ''}
			</div>
			<textarea spellcheck="false" dir="ltr" aria-label="SQL" placeholder="SELECT …"></textarea>
			<div class="x-sql-foot">
				<button type="button" class="x-btn x-btn-primary x-btn-sm" data-a="run">${ic('play_arrow', 'i-sm')}${tx('RUN_QUERY')}</button>
				<span class="x-sql-msg" id="st-sql-msg"></span>
				<span class="x-grow"></span>
				<span class="x-kbd" title="Ctrl + Enter">Ctrl ↵</span>
			</div>`;
		const ta = $('textarea', box);
		ta.value = E.queries[E.tab - 1] || '';
		ta.addEventListener('input', () => { E.queries[E.tab - 1] = ta.value; });
		ta.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runQuery(E.tab); } });
		$$('.x-sql-tab', box).forEach((b) => b.addEventListener('click', (e) => {
			if (e.target.closest('[data-rm]')) {
				E.queries.pop();
				E.tab = 1;
				renderSql();
				return;
			}
			E.tab = +b.dataset.tab;
			renderSql();
		}));
		const add = $('[data-a="addsql"]', box);
		if (add) add.addEventListener('click', () => { if (E.queries.length >= 10) return; E.queries.push(''); E.tab = E.queries.length; renderSql(); $('#st-sql textarea').focus(); });
		$('[data-a="run"]', box).addEventListener('click', () => runQuery(E.tab));
		const qb = $('[data-a="qb"]', box);
		if (qb) qb.addEventListener('click', openQB);
		paintSqlMsg();
	}

	function paintSqlMsg(html, cls) {
		const el = $('#st-sql-msg');
		if (!el) return;
		el.className = 'x-sql-msg' + (cls ? ' ' + cls : '');
		if (html != null) { el.innerHTML = html; return; }
		el.innerHTML = E.result.tab ? `${ic('check_circle', 'i-xs')} SQL ${E.result.tab} · ${(E.result.rows || []).length} ${tx('ROW')}` : '';
		if (E.result.tab) el.classList.add('ok');
	}

	async function runQuery(tab, initial) {
		E.tab = tab;
		if (!initial) renderSql();
		else { const ta = $('#st-sql textarea'); if (ta) ta.value = E.queries[0]; }
		paintSqlMsg('<span class="x-spinner sm"></span>');
		try {
			const r = await api('editor_query', { body: { col: E.col, tabs: tab, query: E.queries } });
			E.queries = r.queries && r.queries.length ? r.queries : E.queries;
			const ta = $('#st-sql textarea');
			if (ta && ta.value !== E.queries[E.tab - 1]) ta.value = E.queries[E.tab - 1] || '';
			if (r.error) {
				paintSqlMsg(`${ic('error', 'i-xs')} ${esc(r.error)}`, 'bad');
				E.result = { cols: [], rows: [], types: [], tab: 0 };
				E.options = [];
			} else {
				E.result = { cols: r.cols, rows: r.rows, types: r.types, tab, sql: r.optionSql };
				E.options = r.cols.map((c) => ({ label: c, value: `SQL${tab}:{col}${c}{/col}{data}${r.optionSql}{/data}` }));
				E.ran = true;
				paintSqlMsg();
				if (!initial) { E.open.result = true; dirty(); paintDirty(); }
			}
			if (E.d.inPage && !E.p.drillthrough && E.result.cols[0]) E.p.drillthrough = E.result.cols[0];
			fillDefaults();
			renderTraces();
			renderSide();
			renderResult();
			renderRightFields();
			updateChart();
		} catch (e) {
			paintSqlMsg(`${ic('error', 'i-xs')} ${esc(e.message)}`, 'bad');
		}
	}

	/* 7.x tableSelection() */
	function selectTable(name) {
		E.table = name;
		const rd = E.d.rdbms;
		let q;
		if (rd === 'sqlsrv' || rd === 'odbc') q = 'SELECT TOP 10 * FROM  [' + name + ']';
		else if (rd === 'pgsql') q = 'SELECT * FROM  ' + name + ' LIMIT 10';
		else q = 'SELECT * FROM  `' + name + '` LIMIT 10';
		E.queries[E.tab - 1] = q;
		$$('#st-right .x-table-item').forEach((b) => b.classList.toggle('active', b.dataset.t === name));
		runQuery(E.tab);
	}

	// ----------------------------------------------------- tables & pivot
	function renderRight() {
		const r = $('#st-right');
		if (!r) return;
		const tables = E.d.tables || [];
		r.innerHTML = `<section class="x-card">
			<div class="x-subtabs" style="margin:10px" role="tablist">
				<button type="button" class="active" data-rp="tables">${tx('TABLE_FROM')}</button>
				${E.d.qb ? `<button type="button" data-rp="fields">${tx('FIELDS')}</button>` : ''}
			</div>
			<div data-rpane="tables" style="padding:0 10px 10px">
				<div class="x-search" style="margin-bottom:8px">${ic('search', 'i-sm')}<input class="x-input x-input-sm" type="search" placeholder="${tx('SEARCH')}" aria-label="${tx('SEARCH')}"></div>
				<div class="x-tables">${tables.map((tb) => `<button type="button" class="x-table-item${tb === E.table ? ' active' : ''}" data-t="${esc(tb)}">${ic('table', 'i-sm')}<span style="overflow:hidden;text-overflow:ellipsis">${esc(tb)}</span></button>`).join('') || `<div class="x-help">${E.d.error ? esc(E.d.error) : '—'}</div>`}</div>
			</div>
			<div data-rpane="fields" hidden style="padding:0 12px 12px" id="st-fields"></div>
		</section>`;
		$$('[data-rp]', r).forEach((b) => b.addEventListener('click', () => {
			$$('[data-rp]', r).forEach((x) => x.classList.toggle('active', x === b));
			$$('[data-rpane]', r).forEach((p) => { p.hidden = p.dataset.rpane !== b.dataset.rp; });
		}));
		$$('.x-table-item', r).forEach((b) => b.addEventListener('click', () => selectTable(b.dataset.t)));
		$('input[type=search]', r).addEventListener('input', (e) => {
			const q = e.target.value.trim().toLowerCase();
			$$('.x-table-item', r).forEach((b) => { b.hidden = q && !b.dataset.t.toLowerCase().includes(q); });
		});
		renderRightFields();
	}

	/* 7.x pivot: Row / Column / Value / Compute / Limits -> SQL 1 */
	function renderRightFields() {
		const f = $('#st-fields');
		if (!f) return;
		const sql = (E.queries[(E.result.tab || 1) - 1] || '');
		const m = /FROM `([^`]+)`/i.exec(sql);
		const table = m ? m[1].replace(/['",;()]/g, ' ') : (sql ? strip(t('CLICKTABLE')) : '');
		const cols = E.result.cols || [];
		const sel = (id) => `<select class="x-select x-input-sm" id="pv-${id}">${cols.map((c) => `<option>${esc(c)}</option>`).join('')}</select>`;
		f.innerHTML = `<div class="x-row" style="gap:6px;padding:4px 0 8px;border-bottom:1px solid var(--border)">${ic('table', 'i-sm')}<b class="x-mono" style="font-size:12px">${esc(table)}</b></div>
			<div class="x-col" style="gap:8px;padding-top:10px">
				<div class="x-field"><label>${tx('ROW')}</label>${sel('row')}</div>
				<div class="x-field"><label>${tx('COLUMN')}</label>${sel('column')}</div>
				<div class="x-field"><label>${tx('VALUE')}</label>${sel('value')}</div>
				<div class="x-field"><label>${tx('COMPUTE')}</label><select class="x-select x-input-sm" id="pv-compute">${['SUM', 'AVG', 'COUNT', 'MAX', 'MIN'].map((c) => `<option>${c}</option>`).join('')}</select></div>
				<div class="x-field"><label>${tx('LIMITS')}</label><input class="x-input x-input-sm" id="pv-limits" type="number" min="0" placeholder="default"></div>
				<div id="pivot-message"></div>
				<button type="button" class="x-btn x-btn-success x-btn-sm" data-a="pivot">${tx('APPLY')}</button>
			</div>`;
		$('[data-a="pivot"]', f).addEventListener('click', async (e) => {
			const btn = e.currentTarget;
			const msg = $('#pivot-message', f);
			msg.innerHTML = '';
			setBtnBusy(btn, true);
			try {
				const r = await api('pivot', { body: {
					col: E.col, table: m ? table : '', row: $('#pv-row', f).value, column: $('#pv-column', f).value,
					value: $('#pv-value', f).value, compute: $('#pv-compute', f).value, limits: $('#pv-limits', f).value,
				} });
				setBtnBusy(btn, false);
				if (!r.ok) { msg.innerHTML = `<div class="x-alert x-alert-danger" style="font-size:12px">${esc(strip(r.error))}</div>`; return; }
				E.queries[0] = r.sql;
				runQuery(1);
			} catch (err) { setBtnBusy(btn, false); msg.innerHTML = `<div class="x-alert x-alert-danger" style="font-size:12px">${esc(err.message)}</div>`; }
		});
	}

	// ----------------------------------------------------------- result
	function renderResult() {
		const box = $('#st-result');
		if (!box) return;
		const r = E.result;
		const has = r.cols && r.cols.length;
		box.className = 'x-card x-collapse' + (E.open.result ? '' : ' is-closed');
		box.dataset.key = 'result';
		box.innerHTML = `<div class="x-card-head" role="button" tabindex="0"><h3>${ic('table_view', 'i-sm')} ${tx('SHOWING_SQL_RESULT')}${E.isDb && r.tab ? ' ' + r.tab : ''}</h3>
			<span class="x-badge" style="margin-inline-start:8px">${has ? (r.rows || []).length : 0}</span>${ic('expand_more', 'x-chev i-sm')}</div>
			<div class="x-card-body" style="padding:0">${has ? `<div class="x-table-wrap" style="max-height:360px;border:0;border-radius:0"><table class="x-table x-result" id="tabledata"><thead><tr>${r.cols.map((c, i) => `<th title="${esc(r.types[i] || '')}">${esc(c)}<span class="x-type-tag">${(r.types[i] || 'string').slice(0, 3)}</span></th>`).join('')}</tr></thead>
				<tbody>${(r.rows || []).map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
				: `<div class="x-help" style="padding:14px">${E.isDb ? tx('ENTER_YOUR_QUERY') : '—'}</div>`}</div>`;
		const hd = $('.x-card-head', box);
		const tg = () => { box.classList.toggle('is-closed'); E.open.result = !box.classList.contains('is-closed'); };
		hd.addEventListener('click', tg);
		hd.addEventListener('keydown', (e) => { if (e.key === 'Enter') tg(); });
	}

	// ------------------------------------------------------------ preview
	function typeValues() {
		const t0 = E.traces[0].type;
		return E.traces.map((tr, i) => {
			let ty = (t0 === 'scatter3d' || t0 === 'sunburst') ? t0 : tr.type;
			if (i === 0 && ty === 'numberchart') ty = 'number';
			return ty;
		});
	}
	const colorOut = (c) => (c === '#ffffff' ? '' : c);

	/* 7.x updateChart(): renders the chart from the current settings (chartupdate.php) */
	let chartReq = 0;
	async function updateChart() {
		if (!E) return;
		const t0 = E.traces[0].type;
		const p = E.p;
		const stage = $('#chartupdate');
		const empty = $('#st-empty');
		if (!stage) return;
		if (!(E.traces[0].X || t0 === 'charttable')) { stage.innerHTML = ''; if (empty) empty.hidden = false; return; }
		const body = {
			col: E.col,
			type: typeValues(),
			xvalues: E.traces.map((tr) => tr.X), yvalues: E.traces.map((tr) => tr.Y),
			xmodel: E.traces.map((tr) => tr.xmodel), xsort: E.traces.map((tr) => tr.xsort),
			ymodel: E.traces.map((tr) => tr.ymodel), ysort: E.traces.map((tr) => tr.ysort),
			forecastvalue: E.traces.map((tr) => tr.forecast || '0'),
			sizevalues: E.traces.map((tr) => tr.size), textvalues: E.traces.map((tr) => tr.text),
			tracenamevalues: E.traces.map((tr) => tr.tracename), yntitlevalues: E.traces.map((tr) => tr.yntitle),
			colorvalues: E.traces.map((tr) => colorOut(tr.color)),
			font_color: p.chart_font_color, bg_color: p.chart_bg_color, border_color: p.border_color, borderwidth: p.borderwidth,
			orientation: p.orientation, filter: p.filter, csvdata: p.csvdata, dropdown: p.dropdown, side: p.side, plot: p.plot,
			legposition: p.legposition, xaxistitle: p.xaxistitle, yaxistitle: p.yaxistitle,
			datalabel: p.datalabel === 'true' ? 'true' : 'false', showgrid: p.showgrid === 'true' ? 'true' : 'false', showline: p.showline === 'true' ? 'true' : 'false',
			tablefontsize: p.tablefontsize, sumfield: p.sumfield, tablefield: p.tablefield,
			total_show: p.total_show === 'true' ? 'true' : 'false', total_width: p.total_width,
		};
		if (t0 === 'map') body.maptype = E.traces.map((tr) => tr.maptype);
		/* table / heatmap read the query that was run last (7.x sends it as "sql", quotes as ^) */
		if (E.isDb) {
			const q = E.queries[(E.result.tab || E.tab || 1) - 1] || E.queries[0] || '';
			body.sql = E.result.sql || String(q).replace(/'/g, '^');
		}
		if (t0 === 'kpichart') Object.assign(body, {
			kpichartformula: p.kpichartformula, kpichartpar: p.kpichartpar, prefix: p.prefix, suffix: p.suffix,
			sparkline: p.sparkline ? 'on' : '', indicator: p.indicator ? 'on' : 'off', percentage: p.percentage ? 'on' : '',
		});
		const req = ++chartReq;
		$('#layoutsettingchart').classList.add('is-loading');
		try {
			const r = await api('preview', { body });
			if (req !== chartReq || !$('#chartupdate')) return;
			if (empty) empty.hidden = !!(r.html && r.html.trim());
			runHtml(stage, r.html || '');
			const kpiBg = (t0 === 'numberchart' || t0 === 'number') && colorOut(E.traces[0].color);
			$('#layoutsettingchart').style.background = kpiBg || '';
			$('#layoutsettingchart').style.color = kpiBg ? '#fff' : '';
			fitPreview();
		} catch (e) {
			if (req === chartReq) { stage.innerHTML = `<div class="x-alert x-alert-danger">${ic('error')}<div>${esc(e.message)}</div></div>`; if (empty) empty.hidden = true; }
		} finally {
			if (req === chartReq && $('#layoutsettingchart')) $('#layoutsettingchart').classList.remove('is-loading');
		}
	}
	const updateChartSoon = debounce(updateChart, 350);

	function fitPreview() {
		const gd = document.getElementById('collayoutsettings');
		const stage = $('#layoutsettingchart');
		if (!gd || !stage || !window.DashboardBuilder || !gd._fullLayout) return;
		try { DashboardBuilder.relayout('collayoutsettings', { width: Math.max(200, stage.clientWidth - 28) }); } catch (e) {}
	}
	window.addEventListener('resize', debounce(() => { if (S.route === 'chart') fitPreview(); }, 150));

	/* 7.x chartProperties(): axis titles, legend, grid, border, dropdown without a reload */
	function chartProperties() {
		const gd = document.getElementById('collayoutsettings');
		if (!gd || !window.DashboardBuilder) return;
		const p = E.p;
		let xl = '', yl = '';
		if (p.legposition === 'topleft') { xl = '0.0'; yl = '1.2'; }
		else if (p.legposition === 'topcenter') { xl = '0.4'; yl = '1.2'; }
		else if (p.legposition === 'bottomcenter') { xl = '0.4'; yl = '0.-2'; }
		let updatemenus = null;
		let update = { visible: true };
		if (p.dropdown === 'true') {
			const names = E.traces.map((tr, i) => { if (!tr.tracename) tr.tracename = 'Trace ' + (i + 1); return tr.tracename; });
			const buttons = names.map((n, i) => { const vs = new Array(names.length).fill(false); vs[i] = [true]; return { method: 'restyle', args: ['visible', vs], label: n }; });
			updatemenus = [{ y: 1.2, x: 0.1, yanchor: 'right', buttons }];
			const vs = new Array(names.length).fill(false); vs[0] = [true];
			update = { visible: vs };
			$$('[data-f="tracename"]').forEach((inp, i) => { if (!inp.value && names[i]) inp.value = names[i]; });
		}
		const layout = {
			updatemenus, legend: { x: xl, y: yl },
			xaxis: { title: p.xaxistitle || 'X-axis', showticklabels: true, showgrid: p.showgrid === 'true', showline: p.showline === 'true' },
			yaxis: { title: p.yaxistitle || 'Y-axis', showticklabels: true, showgrid: p.showgrid === 'true', showline: p.showline === 'true' },
		};
		try { DashboardBuilder.update(gd, update, layout); } catch (e) { console.warn(e); }
	}

	// ------------------------------------------------------- query builder
	function openQB() {
		const m = modal({
			title: tx('LAUNCHQB'), icon: ic('bolt'), size: 'xl', foot: false,
			body: `<iframe src="${BASE}app/qb?col=${E.col}" title="${tx('LAUNCHQB')}" style="width:100%;height:calc(100vh - 170px);min-height:420px;border:0;border-radius:8px;background:var(--surface)"></iframe>`,
		});
		E.qbModal = m;
	}

	/* called by the designer (lib/qb.php): 7.x puts the SQL into SQL 1 */
	function qbInsert(sql) {
		if (!E) return;
		E.queries[0] = String(sql || '').trim();
		E.tab = 1;
		dirty(); paintDirty();
		renderSql();
		if (E.qbModal) { E.qbModal.close(); E.qbModal = null; }
	}

	// ------------------------------------------------------- save / clear
	function saveBody() {
		const p = E.p;
		const d = E.d;
		const t0 = E.traces[0].type;
		const body = {
			col: E.col,
			X: E.traces.map((tr) => tr.X), Y: E.traces.map((tr) => tr.Y), type: E.traces.map((tr) => tr.type),
			query: E.queries,
			size: E.traces.map((tr) => tr.size), text: E.traces.map((tr) => tr.text), maptype: E.traces.map((tr) => tr.maptype || 'world'),
			tracename: E.traces.map((tr) => tr.tracename), yntitle: E.traces.map((tr) => tr.yntitle),
			color: E.traces.map((tr) => tr.color || '#ffffff'),
			chart_font_color: [p.chart_font_color], chart_bg_color: [p.chart_bg_color], chart_border_color: p.border_color,
			borderwidth: p.borderwidth, forecast: E.traces.map((tr) => tr.forecast || '0'),
			title: p.title, name: p.name, csvdata: p.csvdata, xaxistitle: p.xaxistitle, yaxistitle: p.yaxistitle,
			height: p.height, tablefontsize: p.tablefontsize, total_width: p.total_width, total_show: p.total_show,
			width: p.width, datalabel: p.datalabel, showgrid: p.showgrid, showline: p.showline, orientation: p.orientation,
			filter: p.filter, smartquery: p.smartquery, dropdown: p.dropdown, side: p.side, plot: p.plot, legposition: p.legposition,
			refresh: p.refresh, streaming: p.streaming,
			xanalytics: {}, yanalytics: {},
		};
		E.traces.forEach((tr, i) => {
			const xa = [tr.xmodel, tr.xsort].filter(Boolean);
			const ya = [tr.ymodel, tr.ysort].filter(Boolean);
			if (xa.length) body.xanalytics[i] = xa;
			if (ya.length) body.yanalytics[i] = ya;
		});
		if (t0 === 'charttable') { body.sumfield = p.sumfield; body.tablefield = p.tablefield; }
		if (t0 === 'kpichart') {
			Object.assign(body, { kpichartformula: p.kpichartformula, kpichartpar: p.kpichartpar, prefix: p.prefix, suffix: p.suffix, percentage: p.percentage ? 'on' : '', sparkline: p.sparkline ? 'on' : '' });
			if (p.indicator) body.indicator = 'on';
		}
		if (d.inPage || d.hasPages) {
			body.drillthrough = p.drillthrough;
			body.drillthrough_enable = p.drill_enable ? 'on' : '';
			if (d.inPage) body.drillthrough_comprision = p.drillthrough_comprision;
			else body.drillthrough_page = p.drillthrough_page;
		}
		return body;
	}

	async function saveChart(e) {
		const btn = e.currentTarget;
		setBtnBusy(btn, true);
		try {
			await api('editor_save', { body: saveBody() });
			E.dirty = false;
			toast(strip(t('SAVE_CHANGES')) + ' ✓');
			go('/');
		} catch (err) { errToast(err); setBtnBusy(btn, false); }
	}

	async function clearChart() {
		const ok = await confirmBox(tx('CLEAR_DATA') + '?', { title: tx('CLEAR_DATA'), danger: true, ok: tx('CLEAR_DATA'), icon: ic('backspace') });
		if (!ok) return;
		try {
			await api('editor_clear', { body: { col: E.col } });
			E.dirty = false;
			openChart(E.col);
		} catch (err) { errToast(err); }
	}

	// ============================================================== theme
	/* 7.x theme.php: active theme (7 chart colours, font, background) + gallery */
	const THEME_SAMPLE = {
		x: ['10/18/2014', '11/7/2011', '10/31/2016', '4/10/2010'],
		y1: ['437.20', '154.06', '159.28', '205.70'], y2: ['263.33', '90.93', '255.28', '117.11'],
		pv: ['1517', '3018', '3322', '8446'], pl: ['North Africa', 'Middle East', 'Europe', 'Asia'],
	};
	const isWhite = (c) => !c || /^#?f{6}$/i.test(String(c));

	function miniPlots(prefix, colors, bg) {
		if (!window.DashboardBuilder) return;
		const c = colors && colors.length && !isWhite(colors[0]) ? colors : null;
		const paper = bg && !isWhite(bg) ? bg : '#ffffff';
		const base = { margin: { l: 0, r: 0, b: 4, t: 4, pad: 0 }, showlegend: false, hovermode: false, paper_bgcolor: paper, plot_bgcolor: paper,
			xaxis: { showticklabels: false, showgrid: false, showline: false, zeroline: false }, yaxis: { showticklabels: false, showgrid: false, showline: false, zeroline: false } };
		const size = (el) => ({ width: Math.max(60, el.clientWidth - 4), height: Math.max(50, el.clientHeight - 4) });
		const draw = (id, data, extra = {}) => {
			const el = document.getElementById(id);
			if (!el) return;
			try { DashboardBuilder.newPlot(id, data, Object.assign({}, base, size(el), extra), { staticPlot: true, displayModeBar: false }); } catch (e) {}
		};
		/* Plotly rejects keys set to undefined: only add colours when the theme has them */
		const tr = (y, i, type) => {
			const o = { x: THEME_SAMPLE.x, y, type, line: { shape: 'spline' } };
			if (type === 'scatter') o.fill = 'tozeroy';
			if (c) { o.line.color = c[i]; o.marker = { color: c[i] }; }
			return o;
		};
		const pie = { type: 'pie', textinfo: 'none', values: THEME_SAMPLE.pv, labels: THEME_SAMPLE.pl, hole: 0 };
		if (c) pie.marker = { colors: c.slice(0, 4) };
		draw(prefix + '-pie', [pie]);
		draw(prefix + '-area', [tr(THEME_SAMPLE.y1, 0, 'scatter'), tr(THEME_SAMPLE.y2, 1, 'scatter')]);
		draw(prefix + '-bar', [tr(THEME_SAMPLE.y1, 0, 'bar'), tr(THEME_SAMPLE.y2, 1, 'bar')]);
	}

	function miniHtml(prefix, name, colors, font, bg, active) {
		const paper = bg && !isWhite(bg) ? bg : '#ffffff';
		const body = isWhite(paper) ? paper : colorshade(paper, -10);
		const head = isWhite(paper) ? colorshade('#ffffff', -10) : colorshade(paper, -12);
		const num = colors && colors.length && !isWhite(colors[0]) ? colors[0] : paper;
		return `<div class="x-theme-card-head" style="background:${esc(head)};color:${esc(isWhite(font) ? '#0b1c30' : font)}"><span>${esc(name)}${active ? ` <span style="font-weight:400;opacity:.7">(Active)</span>` : ''}</span>
				<span class="x-theme-swatches">${(colors || []).slice(0, 7).map((c) => `<i style="background:${esc(c)}"></i>`).join('')}</span></div>
			<div class="x-theme-mini" style="background:${esc(body)}">
				<div class="x-mini-number" style="background:${esc(num)};color:${esc(isWhite(font) ? '#000' : font)}">Number</div>
				<div style="background:${esc(paper)}" id="${prefix}-pie"></div>
				<div style="background:${esc(paper)}" id="${prefix}-area"></div>
				<div style="background:${esc(paper)}" id="${prefix}-bar"></div>
			</div>`;
	}

	async function openTheme() {
		const main = $('#x-main');
		main.innerHTML = `<div class="x-page"><div class="x-empty" style="padding-top:120px"><div class="x-spinner"></div></div></div>`;
		paintStatus(`<span><b>${tx('THEME')}</b></span>`);
		let d;
		try { d = await api('theme'); } catch (e) {
			if (!e.silent) main.innerHTML = `<div class="x-page"><div class="x-alert x-alert-danger">${ic('error')}<div>${esc(e.message)}</div></div></div>`;
			return;
		}
		if (S.route !== 'theme') return;
		const cur = d.current;
		const T = {
			theme: cur.theme || '',
			colors: Array.from({ length: 7 }, (_, i) => (cur.colors && cur.colors[i]) || '#ffffff'),
			font: cur.font || '#ffffff',
			bg: cur.bg || '#ffffff',
			name: cur.theme ? cur.theme : 'Default',
			dirty: false,
		};
		main.innerHTML = `<div class="x-page">
			<div class="x-page-head"><div><h1>${tx('THEME')}</h1><p>${tx('CHART')} · ${tx('FONT')} · ${tx('BACKGROUND')}</p></div>
				<div class="x-row" style="gap:8px"><button class="x-btn" data-a="cancel">${tx('CANCEL')}</button><button class="x-btn x-btn-primary" data-a="apply">${ic('check', 'i-sm')}${tx('APPLY')}</button></div></div>
			<div class="x-theme-top">
				<div class="x-theme-card x-theme-active" id="th-active"></div>
				<div class="x-card"><div class="x-card-head"><h3>${ic('palette', 'i-sm')} ${tx('THEME')}</h3></div>
					<div class="x-card-body x-col" style="gap:14px">
						<div class="x-field"><label>${tx('CHART')}</label><div class="x-row x-wrap" style="gap:6px" id="th-colors"></div></div>
						<div class="x-field x-field-inline"><label for="th-font">${tx('FONT')}</label><div class="x-row" style="gap:8px"><input type="color" class="x-color" id="th-font"><span class="x-mono x-muted" style="font-size:11px" id="th-font-v"></span></div></div>
						<div class="x-field x-field-inline"><label for="th-bg">${tx('BACKGROUND')}</label><div class="x-row" style="gap:8px"><input type="color" class="x-color" id="th-bg"><span class="x-mono x-muted" style="font-size:11px" id="th-bg-v"></span></div></div>
					</div></div>
			</div>
			<div class="x-row x-between" style="margin-top:6px"><h2 style="margin:0;font-size:16px;font-weight:600">${tx('THEME')}</h2><span class="x-muted" style="font-size:12px">${d.themes.length + 1}</span></div>
			<div class="x-theme-grid" id="th-grid"></div>
		</div>`;
		const paintActive = () => {
			$('#th-active').innerHTML = miniHtml('th-act', T.name, T.colors, T.font, T.bg, true);
			$('#th-colors').innerHTML = T.colors.map((c, i) => `<input type="color" class="x-color" data-ci="${i}" value="${esc(c)}" title="${i + 1}">`).join('');
			$('#th-font').value = T.font; $('#th-font-v').textContent = T.font;
			$('#th-bg').value = T.bg; $('#th-bg-v').textContent = T.bg;
			$$('#th-colors [data-ci]').forEach((inp) => inp.addEventListener('input', () => {
				T.colors[+inp.dataset.ci] = inp.value;
				T.theme = 'Custom'; T.name = 'Custom'; T.dirty = true;
				repaintActive();
			}));
			requestAnimationFrame(() => miniPlots('th-act', T.colors, T.bg));
		};
		const repaintActive = debounce(() => {
			const box = $('#th-active');
			if (!box) return;
			box.innerHTML = miniHtml('th-act', T.name, T.colors, T.font, T.bg, true);
			miniPlots('th-act', T.colors, T.bg);
		}, 60);
		$('#th-font').addEventListener('input', (e) => { T.font = e.target.value; $('#th-font-v').textContent = T.font; T.theme = 'Custom'; T.name = 'Custom'; T.dirty = true; repaintActive(); });
		$('#th-bg').addEventListener('input', (e) => { T.bg = e.target.value; $('#th-bg-v').textContent = T.bg; T.theme = 'Custom'; T.name = 'Custom'; T.dirty = true; repaintActive(); });

		const gallery = [{ name: 'default', label: 'Default', fontColor: '#ffffff', backgroundColor: '#ffffff', chartColors: [] }]
			.concat(d.themes.map((x) => ({ name: x.name, label: x.name.charAt(0).toUpperCase() + x.name.slice(1), fontColor: x.fontColor, backgroundColor: x.backgroundColor, chartColors: x.chartColors || [] })));
		const grid = $('#th-grid');
		gallery.forEach((g, gi) => {
			const card = h(`<button type="button" class="x-theme-card${(g.name === 'default' ? !T.theme : g.name === T.theme) ? ' active' : ''}" data-theme="${esc(g.name)}">${miniHtml('th-g' + gi, g.label, g.chartColors, g.fontColor, g.backgroundColor, false)}</button>`);
			card.addEventListener('click', () => {
				$$('.x-theme-card', grid).forEach((c) => c.classList.toggle('active', c === card));
				if (g.name === 'default') {
					T.theme = ''; T.name = 'default';
					T.colors = Array(7).fill('#ffffff'); T.font = '#ffffff'; T.bg = '#ffffff';
				} else {
					T.theme = g.name; T.name = g.name;
					T.colors = Array.from({ length: 7 }, (_, i) => g.chartColors[i] || '#ffffff');
					T.font = g.fontColor; T.bg = g.backgroundColor;
				}
				T.dirty = true;
				paintActive();
			});
			grid.append(card);
		});
		paintActive();
		requestAnimationFrame(() => gallery.forEach((g, gi) => miniPlots('th-g' + gi, g.chartColors, g.backgroundColor)));

		$('[data-a="cancel"]', main).addEventListener('click', () => go('/'));
		$('[data-a="apply"]', main).addEventListener('click', async (e) => {
			const btn = e.currentTarget;
			setBtnBusy(btn, true);
			try {
				await api('theme_save', { body: { theme: T.theme, org_chart_color: T.colors, chart_color: T.colors, font_color: T.font, bg_color: T.bg } });
				T.dirty = false;
				toast(strip(t('THEME')) + ' ✓');
				go('/');
			} catch (err) { errToast(err); setBtnBusy(btn, false); }
		});
		leaveGuard = async () => !T.dirty || confirmBox(tx('LEAVE_UNSAVED', 'You have unsaved changes. Leave this screen?'), { title: tx('THEME'), icon: ic('warning'), danger: true, ok: tx('CONFIRM_YES') });
	}

	// ============================================================== start
	/* used by pages loaded inside the app (published view, query designer) */
	window.DB80 = {
		backToCanvas,
		qbInsert,
		reloadCanvas: () => loadCanvas(true),
	};

	boot();
})();
