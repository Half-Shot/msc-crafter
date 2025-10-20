# MSC Crafter

A webapp that renders [Matrix Spec Changes](https://spec.matrix.org/proposals/) with intelligent linking, better formatting
and a much snappier interface than GitHub. The intention is this will serve as a useful way to view and edit MSCs without
having to use GitHub's clunky UI. All data is sourced from GitHub with a 5 minute cache on the client.

![basic rendering of MSC4201](image-1.png)


### Features

- [x] Simple identification of linked MSCs.
- [x] Syntax highlighting.
- [x] Table of contents for PRs.
- [ ] Offline support (Partial: Caches, but does not support offline app APIs yet)
- [ ] Renders converstaion threads.
- [ ] Renders FCP status (Partial: badge, but not member votes or timers).
- [ ] Editing MSCs in the browser
