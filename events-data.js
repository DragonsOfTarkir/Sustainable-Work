/* Events, conferences and appearances. This is the only file you edit to add, change or remove one.
   The page sorts them into "Upcoming" and "Past" by date on its own, so nothing needs to be moved by hand.

   title   Shown as the card heading.
   kind    A short label: "Event", "Conference" or "Appearance" (from the wireframe note on conferences/appearances).
   date    YYYY-MM-DD, for example "2026-11-10". Leave "" if the date is not set yet; it then shows as "To be announced".
   where   The location, or "Online".
   image   Optional path to a picture. Without one, the card shows a date badge.
   url     Optional link for a "Details" link.
   sample  true shows a "Sample entry" tag. Delete this line once the entry is real. */

window.EVENTS = [
	{ title: "Sample event title", kind: "Conference", date: "2026-11-10", where: "Location", image: "", url: "", sample: true },
	{ title: "Sample event title", kind: "Appearance", date: "2026-12-03", where: "Online",   image: "", url: "", sample: true },
	{ title: "Sample event title", kind: "Event",      date: "2027-02-18", where: "Location", image: "", url: "", sample: true },

	{ title: "Sample event title", kind: "Conference", date: "2026-09-22", where: "Location", image: "", url: "", sample: true },
	{ title: "Sample event title", kind: "Appearance", date: "2026-06-05", where: "Online",   image: "", url: "", sample: true },
	{ title: "Sample event title", kind: "Event",      date: "2026-03-12", where: "Location", image: "", url: "", sample: true }
];
