# JC STEM Lab Website Agent Instructions

## Scope

- This repository is a static website. Most routine content updates should modify JSON data files rather than rebuilding templates or introducing new tooling.
- Preserve the current site structure, interaction patterns, and visual language unless the user explicitly asks for a redesign.

## Homepage Visual Style

- Treat the existing homepage as the visual source of truth before changing or adding any section. Inspect nearby homepage sections and reuse their established components and CSS variables instead of designing a standalone visual system.
- The homepage uses a restrained, modern academic style built around Montserrat typography, generous whitespace, dark text, muted gray supporting text, white and `#faf8f9` surfaces, and the warm burgundy `#BD384B` as the single primary accent color.
- Use burgundy consistently for links, section-title underlines, icons, active states, and subtle hover feedback. Do not introduce per-card rainbow palettes, unrelated accent colors, decorative gradients, or colored icon badges unless the user explicitly requests them.
- Keep cards and content blocks simple: light `#eaeaea` borders, restrained shadows, existing rounded corners, and subtle motion. Prefer small color changes or slight horizontal movement over prominent lifts, glow effects, or oversized shadows.
- New homepage sections must follow the existing `.section`, `.container`, and `.section-title` structure. Match the spacing, content width, typography scale, border treatment, and interaction behavior of adjacent sections.
- Preserve the current hierarchy and readability. Do not add pills, badges, buttons, cards, or decorative containers when plain text or the site's existing list treatment is sufficient.

## Required Workflow

- Before making any code or content modifications, run `git pull` to sync the latest remote changes first.
- Do not commit or push unless the user explicitly asks.
- Use `python3 -m http.server <port>` for local static previews when a browser preview is requested.

## Canonical Data Sources

- Homepage/profile metadata is maintained in `data/profile-info.json`.
- News items are maintained in `data/news.json`.
- Publications are maintained in `data/publications.json`.
- Team member data is maintained in `data/team-members.json`.
- Team profile pages are rendered from `data/profile/profile.html` plus `data/team-members.json`.
- Team avatars are stored in `data/avatars/`.
- CVs and other downloadable member files are stored under `data/files/`.
- News images are stored under `assets/news-assets/`.

## News Rules

- Add new news items to the top of `data/news.json`. The homepage renders the first 12 items from the array, and `pages/all-news.html` renders the full array in order.
- Keep news content in English unless the user explicitly asks for Chinese text.
- Use exact dates instead of relative wording like `today` when adding time-sensitive news.
- If a news item has images, place them in `assets/news-assets/YYYY-M-D-ShortName/` and reference them with absolute site paths such as `/assets/news-assets/...`.
- Keep the image order intentional. The first image is the lead image shown first in galleries.
- When adding a news item that involves a member's career move, promotion, new affiliation, or other position change, also update that member's profile in `data/team-members.json`.
- For career-related news, verify the updated position and affiliation online when possible, preferably using the person's official homepage or institutional profile.
- Sync related profile fields together, including `role`, `experience`, `biography`, homepage links, and affiliation text when relevant.
- Homepage hero slides are manual HTML in `index.html`. Adding a news item does not automatically add it to the hero slider.

## Publication Rules

- Add newly accepted or newly added publications to the top of `data/publications.json`.
- `pages/publications.html` groups papers by the `year` field and preserves JSON order within each year, so order inside the array matters.
- The homepage publication section only shows papers from the current year and previous year, loaded from `data/publications.json`.
- Include `title`, `authors`, `venue`, `year`, and `tags` for each paper.
- Use `type: "accepted"` when a paper should be displayed as an accepted paper, and use `type: "preprint"` only when appropriate.
- Keep venue tags concise and consistent, for example `TDSC`, `TMC`, `CVPR'26`.
- If a PDF or project page exists, include it in `tags` as a linked `code-tag`.

## Team Data Rules

- `data/team-members.json` is the active source of truth for team data. Do not revive the old `data/people/**` content model.
- Keep member IDs unique. The profile loader finds the first matching `id`, so duplicate IDs can route to the wrong profile.
- When editing a member in `data/team-members.json`, anchor the change on that member's unique `id` and verify the surrounding `title`. Do not patch by generic fields such as `"text": "Professor"` because many members share the same role text.
- If the same person appears in multiple categories or roles, use distinct IDs in the existing repo style, for example `faculty-name` and `formerphd-name`.
- When adding a new member inside a category, place the new entry at the top of that category's `members` array unless the user requests a different order.
- `role` is for the current displayed position only.
- Historical positions belong in `experience`, with explicit `title`, `institution`, and `period`.
- `education` is for degrees and academic training only. Do not duplicate educational or visiting-student entries in `experience`.
- When updating a member's current affiliation, preserve older affiliations in `experience` rather than overwriting history.
- For current positions, affiliations, and career moves, prefer official university or institutional pages when checking details.
- Update related fields together when needed: `role`, `experience`, `biography`, and relevant social links such as email or homepage.

## Repo-Specific Page Notes

- Team cards are rendered by `js/team-loader.js` from `data/team-members.json`.
- Individual profile pages are rendered by `js/profile-loader.js` from `data/team-members.json` through the route `data/profile/profile.html?id=<member-id>`.
- Publications on the homepage are loaded by `script.js`.
- News on the homepage and on `pages/all-news.html` are loaded by `script.js`.

## Asset And Content Conventions

- Use ASCII filenames and stable folder names unless there is a clear reason not to.
- Keep new website prose in English by default.
- Use `Senkang Hu` as the display name in website content and publication author lists unless the user explicitly asks for a different form.
- Preserve existing path conventions when moving assets. If an asset path changes, update every JSON or HTML reference that uses it.
