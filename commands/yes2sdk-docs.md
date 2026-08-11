---
description: Searches the Yes2SDK documentation.
argument-hint: <query>
allowed-tools:
  - mcp__yes2sdk__search_docs
  - mcp__yes2sdk__get_quickstart
  - mcp__yes2sdk__get_api_reference
---

Call `yes2sdk:search_docs` with the query "$ARGUMENTS".
Present the top matches: for each, show the doc slug, the heading, and a one-line
excerpt. If a result looks like the full answer, offer to pull it with
`yes2sdk:get_quickstart` or `yes2sdk:get_api_reference`.
