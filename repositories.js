// Paste your new Google Apps Script Web App Deployment URL here
const API_URL = "https://script.google.com/macros/s/AKfycbx36gYdhGNH7UK1cgHU7wOPZ7DiApEI1p3N3penQ-0Hyok2iR57npGuzzrZ4JkDHbWIPQ/exec"; 

(function () {
	var data = []; // Dynamically populated from Google Sheets
	var isEditModeActive = false; // Tracks global edit mode status

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

	// 1. DATE CLEANER ENGINE: Translates ugly raw ISO strings to beautiful dates
	function formatPublicationDate(dateStr) {
		if (!dateStr) return "";
		
		// If it's a standard text string already (like "March 2026"), leave it completely alone
		if (isNaN(Date.parse(dateStr)) || !/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
			return dateStr;
		}

		var months = [
			"January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		];
		
		var parsedDate = new Date(dateStr);
		// Adjust for local time offset shifts caused by timezone calculations
		var userTimezoneOffset = parsedDate.getTimezoneOffset() * 60000;
		var localizedDate = new Date(parsedDate.getTime() + userTimezoneOffset);

		var year = localizedDate.getFullYear();
		var month = months[localizedDate.getMonth()];
		var day = localizedDate.getDate();

		// Compute ordinal numeric day suffix flags (1st, 2nd, 3rd, 4th)
		var suffix = "th";
		if (day < 11 || day > 13) {
			switch (day % 10) {
				case 1: suffix = "st"; break;
				case 2: suffix = "nd"; break;
				case 3: suffix = "rd"; break;
			}
		}

		return month + " " + day + suffix + " " + year;
	}

	function fetchRepositoryData() {
		fetch(API_URL)
			.then(function (response) { return response.json(); })
			.then(function (fetchedData) {
				data = fetchedData.map(function (row) {
					return {
						title: row.title || "",
						authors: row.authors || row.author || "",
						// Run the raw text string into the date format filter cleanly
						date: formatPublicationDate(row.date || row.year || ""),
						abstract: row.abstract || row.description || "",
						tags: row.tags || row.topic ? (row.tags || row.topic).split(',').map(function(t){ return t.trim(); }).filter(Boolean) : [],
						keywords: row.keywords ? row.keywords.split(',').map(function(k){ return k.trim(); }).filter(Boolean) : [],
						url: row.url || "",
						pdf: row.pdf || "",
						sample: row.sample === true || row.sample === "true" || row.sample === "Sample entry",
						sheet_row_index: row.sheet_row_index
					};
				});

				buildTopicOptions();
				checkInitialUrlParams();
				render();
			})
			.catch(function (err) {
				list.textContent = '';
				list.appendChild(el('li', '', 'Failed to sync with repository database stream.'));
			});
	}

	function buildTopicOptions() {
		var seen = {};
		data.forEach(function (p) { (p.tags || []).forEach(function (t) { seen[t] = true; }); });
		
		topicEl.innerHTML = '<option value="">All topics</option>';
		Object.keys(seen).sort().forEach(function (t) {
			var o = el('option', '', t);
			o.value = t;
			topicEl.appendChild(o);
		});
	}

	function checkInitialUrlParams() {
		var params = new URLSearchParams(window.location.search);
		if (params.get('q')) qEl.value = params.get('q');
		if (params.get('topic')) {
			topicEl.value = params.get('topic');
			setPanel(true);
			render();
		}
	}

	function injectEditToggleButton() {
		var resultLine = document.querySelector('.result-line');
		if (!resultLine) return;

		// Prevent double injection if function runs multiple times
		if (document.getElementById('global-edit-toggle')) return;

		var toggleBtn = el('button', 'btn btn-light', 'Edit Mode: OFF');
		toggleBtn.id = 'global-edit-toggle';
		toggleBtn.type = 'button';
		toggleBtn.style.marginLeft = '15px';

		toggleBtn.addEventListener('click', function () {
			isEditModeActive = !isEditModeActive;
			if (isEditModeActive) {
				toggleBtn.textContent = 'Edit Mode: ON';
				toggleBtn.style.backgroundColor = '#ffc107';
				toggleBtn.style.color = '#000';
			} else {
				toggleBtn.textContent = 'Edit Mode: OFF';
				toggleBtn.style.backgroundColor = '';
				toggleBtn.style.color = '';
			}
			render();
		});

		resultLine.appendChild(toggleBtn);
	}

	function setPanel(open) {
		panel.hidden = !open;
		toggle.setAttribute('aria-expanded', String(open));
	}

	function haystack(p) {
		return [p.title, p.authors, p.abstract, (p.tags || []).join(' '), (p.keywords || []).join(' ')].join(' ').toLowerCase();
	}

	function time(p) {
		var t = Date.parse(p.date);
		return isNaN(t) ? 0 : t;
	}

	function card(p) {
		var li = el('li', 'paper');
		
		var editableAttr = isEditModeActive ? 'true' : 'false';
		var editStyle = isEditModeActive ? 'background-color: #fffde7; padding: 2px 4px; border-radius: 4px; outline: none;' : '';

		// Title (h2)
		var h2 = el('h2', '');
		h2.textContent = p.title;
		h2.setAttribute('contenteditable', editableAttr);
		h2.setAttribute('style', editStyle);
		h2.dataset.key = 'title';
		li.appendChild(h2);

		// Metadata Row
		var metaText = [p.authors, p.date].filter(Boolean).join(' · ');
		if (metaText || isEditModeActive) {
			var pMeta = el('p', 'paper-meta');
			
			var spanAuthors = el('span', '');
			spanAuthors.textContent = p.authors || (isEditModeActive ? 'Author name(s)' : '');
			spanAuthors.setAttribute('contenteditable', editableAttr);
			spanAuthors.setAttribute('style', editStyle);
			spanAuthors.dataset.key = 'authors';
			
			var divider = document.createTextNode(' · ');
			
			var spanDate = el('span', '');
			spanDate.textContent = p.date || (isEditModeActive ? 'Date' : '');
			spanDate.setAttribute('contenteditable', editableAttr);
			spanDate.setAttribute('style', editStyle);
			spanDate.dataset.key = 'date';

			pMeta.appendChild(spanAuthors);
			pMeta.appendChild(divider);
			pMeta.appendChild(spanDate);
			li.appendChild(pMeta);
		}

		// Abstract
		if (p.abstract || isEditModeActive) {
			var pAbstract = el('p', 'paper-abstract');
			pAbstract.textContent = p.abstract;
			pAbstract.setAttribute('contenteditable', editableAttr);
			pAbstract.setAttribute('style', editStyle + ' display: block;');
			pAbstract.dataset.key = 'abstract';
			li.appendChild(pAbstract);
		}

		// Tags (Chips)
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

		// Action Links Row
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
		
		if (isEditModeActive) {
			var saveBtn = el('button', 'btn', 'Save Changes');
			saveBtn.style.backgroundColor = '#007bff';
			saveBtn.style.color = '#fff';
			saveBtn.style.border = 'none';
			saveBtn.style.padding = '4px 10px';
			saveBtn.style.borderRadius = '4px';
			saveBtn.style.cursor = 'pointer';
			saveBtn.style.marginLeft = '15px';
			
			saveBtn.addEventListener('click', function (e) {
				saveItemChanges(e, p.sheet_row_index, li);
			});
			links.appendChild(saveBtn);
		}
		
		if (links.childNodes.length) { li.appendChild(links); }

		// Sample entry tag rendering
		if (p.sample) {
			var tag = el('p', '', '');
			tag.style.marginTop = '12px';
			tag.appendChild(el('span', 'sample-tag', 'Sample entry'));
			li.appendChild(tag);
		}

		return li;
	}

	function saveItemChanges(event, sheetRowIndex, cardElement) {
		var btn = event.target;
		btn.textContent = "Saving...";
		btn.disabled = true;

		var updatedData = {};
		var editableFields = cardElement.querySelectorAll("[contenteditable='true']");
		
		editableFields.forEach(function (field) {
			updatedData[field.dataset.key] = field.textContent.trim();
		});

		var payload = {
			sheet_row_index: sheetRowIndex,
			updated_data: updatedData
		};

		fetch(API_URL, {
			method: "POST",
			mode: "no-cors",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		})
		.then(function () {
			btn.textContent = "Saved!";
			btn.style.backgroundColor = "#28a745";
			setTimeout(function () {
				btn.textContent = "Save Changes";
				btn.style.backgroundColor = "#007bff";
				btn.disabled = false;
				fetchRepositoryData(); 
			}, 1500);
		})
		.catch(function () {
			alert("Network update failed.");
			btn.textContent = "Save Changes";
			btn.disabled = false;
		});
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
        } catch (e) {}
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
injectEditToggleButton();
fetchRepositoryData();
})();