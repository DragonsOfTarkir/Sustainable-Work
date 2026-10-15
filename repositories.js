/* Repositories page: search, topic filter and sort over window.PUBLICATIONS (see publications-data.js). */
(function () {
	var data = (window.PUBLICATIONS || []).slice();

	var form = document.getElementById('repo-form');
	var qEl = document.getElementById('q');
	var toggle = document.getElementById('filter-toggle');
	var panel = document.getElementById('filter-panel');
	var topicEl = document.getElementById('topic');
	var sortEl = document.getElementById('sort');
	var list = document.getElementById('results');
	var count = document.getElementById('count');
	var clearBtn = document.getElementById('clear');
	var empty = document.getElementById('empty');

	function el(tag, cls, text) {
		var e = document.createElement(tag);
		if (cls) { e.className = cls; }
		if (text) { e.textContent = text; }
		return e;
	}

	// Topic options come straight from the tags in the data, so new tags appear automatically.
	var seen = {};
	data.forEach(function (p) { (p.tags || []).forEach(function (t) { seen[t] = true; }); });
	Object.keys(seen).sort().forEach(function (t) {
		var o = el('option', '', t);
		o.value = t;
		topicEl.appendChild(o);
	});

	// Starting state from the address (for example repositories.html?topic=Job%20quality).
	var params = new URLSearchParams(window.location.search);
	qEl.value = params.get('q') || '';
	if (params.get('topic') && seen[params.get('topic')]) {
		topicEl.value = params.get('topic');
		setPanel(true);
	}

	function setPanel(open) {
		panel.hidden = !open;
		toggle.setAttribute('aria-expanded', String(open));
	}

	function haystack(p) {
		// Keywords are searched but never displayed.
		return [p.title, p.authors, p.abstract, (p.tags || []).join(' '), (p.keywords || []).join(' ')].join(' ').toLowerCase();
	}

	function time(p) {
		var t = Date.parse(p.date);
		return isNaN(t) ? 0 : t;
	}

	function card(p) {
		var li = el('li', 'paper');
		li.appendChild(el('h2', '', p.title));

		var meta = [p.authors, p.date].filter(Boolean).join(' · ');
		if (meta) { li.appendChild(el('p', 'paper-meta', meta)); }
		if (p.abstract) { li.appendChild(el('p', 'paper-abstract', p.abstract)); }

		if (p.tags && p.tags.length) {
			var ul = el('ul', 'chips');
			p.tags.forEach(function (t) {
				var item = el('li');
				var a = el('a', '', t);
				a.href = '?topic=' + encodeURIComponent(t);
				a.addEventListener('click', function (ev) {
					ev.preventDefault();
					topicEl.value = t;
					setPanel(true);
					render();
				});
				item.appendChild(a);
				ul.appendChild(item);
			});
			li.appendChild(ul);
		}

		var links = el('p', 'paper-links');
		if (p.pdf) {
			var d = el('a', '', 'Download PDF');
			d.href = p.pdf;
			links.appendChild(d);
		}
		if (p.url) {
			var r = el('a', '', 'Read online');
			r.href = p.url;
			r.target = '_blank';
			r.rel = 'noopener';
			links.appendChild(r);
		}
		if (links.childNodes.length) { li.appendChild(links); }

		if (p.sample) {
			var tag = el('p', '', '');
			tag.style.marginTop = '12px';
			tag.appendChild(el('span', 'sample-tag', 'Sample entry'));
			li.appendChild(tag);
		}
		return li;
	}

	function render() {
		var words = qEl.value.toLowerCase().split(/\s+/).filter(Boolean);
		var topic = topicEl.value;

		var out = data.filter(function (p) {
			if (topic && (p.tags || []).indexOf(topic) === -1) { return false; }
			var h = haystack(p);
			return words.every(function (w) { return h.indexOf(w) !== -1; });
		});

		var how = sortEl.value;
		out.sort(function (a, b) {
			if (how === 'title') { return a.title.localeCompare(b.title); }
			if (how === 'oldest') { return time(a) - time(b); }
			return time(b) - time(a);
		});

		list.textContent = '';
		out.forEach(function (p) { list.appendChild(card(p)); });
		empty.hidden = out.length !== 0;

		var bits = [];
		if (qEl.value.trim()) { bits.push('matching “' + qEl.value.trim() + '”'); }
		if (topic) { bits.push('in ' + topic); }
		count.textContent = out.length + (out.length === 1 ? ' result' : ' results') + (bits.length ? ' ' + bits.join(' ') : '');
		clearBtn.hidden = !(qEl.value.trim() || topic);

		try {
			var next = new URLSearchParams();
			if (qEl.value.trim()) { next.set('q', qEl.value.trim()); }
			if (topic) { next.set('topic', topic); }
			var s = next.toString();
			window.history.replaceState(null, '', s ? '?' + s : window.location.pathname);
		} catch (e) { /* some browsers block this for local files; the page still works */ }
	}

	form.addEventListener('submit', function (ev) { ev.preventDefault(); render(); });
	qEl.addEventListener('input', render);
	topicEl.addEventListener('change', render);
	sortEl.addEventListener('change', render);
	toggle.addEventListener('click', function () { setPanel(panel.hidden); });
	clearBtn.addEventListener('click', function () {
		qEl.value = '';
		topicEl.value = '';
		render();
		qEl.focus();
	});

	render();
})();
