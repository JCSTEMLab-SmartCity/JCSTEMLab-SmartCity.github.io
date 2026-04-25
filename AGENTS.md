# JC STEM Lab Website Agent Instructions

## Required Workflow

- Before making any code or content modifications, run `git pull` to sync the latest remote changes first.
- Keep JSON list updates additive at the top when adding new publication, news, or team entries, so newly added items are shown first by default.
- Preserve the existing static-site structure and styling patterns unless the user explicitly asks for a redesign.

## Main Data Sources

- Publications are maintained in `data/publications.json`.
- News items are maintained in `data/news.json`.
- Team member profiles are maintained in `data/team-members.json`.
- Member avatars are stored in `data/avatars/`.
- Member CV and profile files are stored under `data/files/` and `data/profile/`.
- News images are stored under `assets/news-assets/`, with one folder per news item using the format `YYYY-M-D-ShortName`.

## Content Rules

- When updating a member's current role or affiliation, keep historical roles in the member's `experience` timeline instead of overwriting them.
- Use `role` for the current position only.
- Use `education` for degrees and academic training; do not duplicate education entries in `experience`.
- For current affiliations and career moves, prefer official university or institutional pages when checking details.
- Keep new website content in English unless the user explicitly asks for Chinese text.

## Preview And Git

- Use `python3 -m http.server <port>` for local static previews.
- Do not commit or push unless the user explicitly asks.
