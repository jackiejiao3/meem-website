# meem-website

## Bluehost deployment

Production document root: `/home1/mdhiglob/public_html/menergy/`.

After merging an approved PR into `main`, update the Bluehost Git checkout
from the remote, then select **Deploy HEAD Commit**. A GitHub merge alone
does not confirm a Bluehost deployment. Check that Bluehost is deploying
`main` and the expected commit.

`.cpanel.yml` copies root-level HTML pages (except the two map previews),
`css/`, `images/`, `script.js`, `form-handler.php`, `robots.txt` and
`sitemap.xml`. Content checksums ensure changed files are copied even if
their size and modification time match. Existing destination permissions
are preserved; newly created files/directories use 644/755 permissions.

Repository metadata, scripts, documentation, quarantine/backups, environment
files and the two map preview pages are excluded from new deployments.
Previously deployed excluded files remain on the server until separately reviewed.

There is deliberately no `--delete`: unrelated server files, server-managed
configuration and old assets remain untouched. For a removed/renamed file,
list the old path and a separate quarantine/removal plan in the PR.
Do not add broad deletion or permission-reset commands to routine deployments.

## When to change .cpanel.yml

Every PR must review deployment impact; not every PR must edit the YAML.

- Editing existing pages, styles, images or the allowed JS/PHP files: no YAML change.
- Adding root HTML pages or files inside `css/` or `images/`: normally no YAML change;
  confirm they are production assets and not excluded above.
- Adding a new asset directory, JS/PHP file, download, font or configuration file
  outside the allowed paths: update the allowlist in the same PR.
- Changing the document root, build process or deployment behavior: update the
  YAML and explain the change in the same PR.
- Removing or renaming a file: check incoming links and document the old server
  path; the deployment does not remove it automatically.

`design.html` has been removed together with its navigation links and homepage card.
After deploying this removal, separately remove the old server file
`/home1/mdhiglob/public_html/menergy/design.html` (download a backup first if needed).
The normal deployment intentionally does not delete files from the server.
The two excluded preview pages are `location-map-preview.html` and `map-comparison.html`.

## PR validation and production checks

1. Confirm all new local image/CSS/JS references are committed, including case-sensitive filenames.
2. Confirm the **Image integrity** check passes; it checks images, not all links or deployment behavior.
3. Complete the deployment section in the PR template. Update the allowlist when required.
4. After Bluehost deployment, verify the changed pages, images, navigation and contact form.
   Confirm the deployed commit before troubleshooting browser cache.
