/* Dashboard Builder 8.0 - published dashboard helpers (7.x bottom.php print / export_image)
 * @copyright (C) 2016-2026 Dashboardbuilder.net
 */
(function () {
	'use strict';
	function target() {
		return document.getElementById('npl-query-data') || document.getElementById('details') || document.body;
	}
	function fileName() {
		var t = document.querySelector('.view-title');
		var n = t ? t.textContent.trim() : (document.title.split('·')[0] || '').trim();
		return (n || 'Download').replace(/[\\\/:*?"<>|]+/g, '_');
	}
	function snap(cb) {
		if (typeof html2canvas !== 'function') { alert('html2canvas is not loaded'); return; }
		var el = target();
		var bg = getComputedStyle(document.body).backgroundColor;
		html2canvas(el, { backgroundColor: bg && bg !== 'rgba(0, 0, 0, 0)' ? bg : '#ffffff', width: el.scrollWidth, height: el.scrollHeight, windowWidth: document.documentElement.scrollWidth, scale: window.devicePixelRatio > 1 ? 2 : 1 })
			.then(cb);
	}
	window.DBView = {
		/* 7.x export_image(): PNG named after the dashboard */
		image: function () {
			snap(function (canvas) {
				var a = document.createElement('a');
				a.href = canvas.toDataURL('image/png');
				a.download = fileName() + '.png';
				document.body.appendChild(a);
				a.click();
				a.remove();
			});
		},
		/* 7.x print(): the dashboard as one image in a print window */
		print: function () {
			snap(function (canvas) {
				var w = window.open('', '', 'height=600,width=900');
				if (!w) { return; }
				w.document.write('<!doctype html><html><head><title>Print Dashboard</title><style>@page{size:auto;margin:0}body{margin:0}img{width:100%;display:block}</style></head><body></body></html>');
				var img = w.document.createElement('img');
				img.src = canvas.toDataURL('image/png');
				w.document.body.appendChild(img);
				setTimeout(function () { w.document.close(); w.focus(); w.print(); w.close(); }, 500);
			});
		},
		/* light / dark (same setting as the builder) */
		theme: function () {
			var dark = document.documentElement.dataset.theme === 'dark';
			if (dark) { delete document.documentElement.dataset.theme; } else { document.documentElement.dataset.theme = 'dark'; }
			try { localStorage.setItem('db80-theme', dark ? 'light' : 'dark'); } catch (e) {}
		}
	};
	/* charts follow the card size */
	function fit() {
		if (!window.DashboardBuilder) { return; }
		document.querySelectorAll('.view-card .js-plotly-plot').forEach(function (gd) {
			var body = gd.closest('.card-body');
			if (!body || !gd.id) { return; }
			try { DashboardBuilder.relayout(gd.id, { width: Math.max(60, body.clientWidth - 16) }); } catch (e) {}
		});
	}
	var tm;
	window.addEventListener('resize', function () { clearTimeout(tm); tm = setTimeout(fit, 150); });
	window.addEventListener('load', function () { setTimeout(fit, 50); });
})();
