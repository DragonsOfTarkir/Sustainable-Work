/* Get Connected page: fills the Upcoming and Past grids from window.EVENTS (see events-data.js). */
(function () {
	var events = (window.EVENTS || []).slice();
	var today = new Date();
	today.setHours(0, 0, 0, 0);

	function parse(s) {
		var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
		return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
	}

	function el(tag, cls, text) {
		var e = document.createElement(tag);
		if (cls) { e.className = cls; }
		if (text) { e.textContent = text; }
		return e;
	}

	function row(dl, label, value) {
		dl.appendChild(el('dt', '', label));
		dl.appendChild(el('dd', '', value));
	}

	function card(ev) {
		var d = parse(ev.date);
		var li = el('li', 'event');

		var media = el('div', 'event-media');
		if (ev.image) {
			var img = document.createElement('img');
			img.src = ev.image;
			img.alt = '';
			media.appendChild(img);
		} else if (d) {
			var badge = el('div', 'date-badge');
			badge.appendChild(el('span', 'm', d.toLocaleDateString('en-US', { month: 'short' })));
			badge.appendChild(el('span', 'd', String(d.getDate())));
			media.appendChild(badge);
		} else {
			media.appendChild(el('span', '', 'Date to be announced'));
		}
		li.appendChild(media);

		var body = el('div', 'event-body');
		if (ev.kind) { body.appendChild(el('p', 'event-kind', ev.kind)); }
		body.appendChild(el('h3', '', ev.title));

		var dl = el('dl');
		row(dl, 'When', d ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'To be announced');
		row(dl, 'Where', ev.where || 'To be announced');
		body.appendChild(dl);

		if (ev.url) {
			var a = el('a', 'more', 'Details');
			a.href = ev.url;
			a.target = '_blank';
			a.rel = 'noopener';
			body.appendChild(a);
		}
		if (ev.sample) { body.appendChild(el('span', 'sample-tag', 'Sample entry')); }

		li.appendChild(body);
		return li;
	}

	function fill(id, emptyId, items) {
		var box = document.getElementById(id);
		items.forEach(function (ev) { box.appendChild(card(ev)); });
		document.getElementById(emptyId).hidden = items.length !== 0;
	}

	function when(ev) { var d = parse(ev.date); return d ? d.getTime() : Infinity; }

	var upcoming = events.filter(function (e) { var d = parse(e.date); return !d || d >= today; })
		.sort(function (a, b) { return when(a) - when(b); });
	var past = events.filter(function (e) { var d = parse(e.date); return d && d < today; })
		.sort(function (a, b) { return when(b) - when(a); });

	fill('upcoming', 'upcoming-empty', upcoming);
	fill('past', 'past-empty', past);
})();
