/* Repository entries. This is the only file you edit to add, change or remove a publication.
   Each entry is one { ... } block, separated by commas.

   title     Shown as the entry heading.
   authors   Shown under the title.
   date      Shown under the title. Use a form like "March 2026" or "2026-03-01" so sorting by date works.
   abstract  The short description shown on the card.
   tags      Topic tags. They become the topic filter and the clickable tags on each card.
   keywords  Hidden search words. People can find the entry by them, but they are never shown
             (this is the "keywords should be embedded, not visible to the user" note on the wireframe).
   pdf       Link to a PDF for the "Download PDF" link. Leave "" if there is none.
   url       Link to read it online (SSRN, a journal, etc.). Leave "" if there is none.
   sample    true shows a "Sample entry" tag. Delete this line once the entry has real content.

   Later this data can move into the database from the team's tech-stack note; the page only needs a
   list of objects shaped like these. */

window.PUBLICATIONS = [
	{
		title: "Research: Job Quality",
		authors: "Author name(s)",
		date: "Date of publication",
		abstract: "Small description / abstract goes here.",
		tags: ["Job quality"],
		keywords: ["job quality", "employment quality", "EQIL"],
		pdf: "",
		url: "https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=55317",
		sample: true
	},
	{
		title: "Research: Working Hours / 4-Day Workweeks / Flexible Scheduling",
		authors: "Author name(s)",
		date: "Date of publication",
		abstract: "Small description / abstract goes here.",
		tags: ["Golden hours / SHOWWW", "Working time"],
		keywords: ["working hours", "four day week", "4 day week", "scheduling", "flexible schedule"],
		pdf: "",
		url: "",
		sample: true
	},
	{
		title: "Research: Work and Health Outcomes",
		authors: "Author name(s)",
		date: "Date of publication",
		abstract: "Small description / abstract goes here.",
		tags: ["Salutogenic work design", "Well-being"],
		keywords: ["health", "salutogenic", "autonomy", "supportive supervisors"],
		pdf: "",
		url: "",
		sample: true
	},
	{
		title: "Research: Underemployment, Overemployment, Multiple Job Holding",
		authors: "Author name(s)",
		date: "Date of publication",
		abstract: "Small description / abstract goes here.",
		tags: ["Job quality", "Working time"],
		keywords: ["underemployment", "overemployment", "multiple jobs", "moonlighting"],
		pdf: "",
		url: "",
		sample: true
	},
	{
		title: "Research: Happiness and Work",
		authors: "Author name(s)",
		date: "Date of publication",
		abstract: "Small description / abstract goes here.",
		tags: ["Well-being"],
		keywords: ["happiness", "life satisfaction", "well-being"],
		pdf: "",
		url: "",
		sample: true
	}
];
