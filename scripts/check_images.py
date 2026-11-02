"""Validate committed local image references and decode image assets before deployment."""
import argparse
import posixpath
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree

from PIL import Image

EXTENSIONS = {'.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.avif'}
CSS_URL = re.compile(r'url\(\s*[\"\']?([^\"\')]+)[\"\']?\s*\)', re.I)


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
        self.styles = []
        self.css = []
        self.in_style = False
        self.base = None

    def handle_starttag(self, tag, pairs):
        a = dict(pairs)
        if tag == 'base':
            self.base = a.get('href')
        if tag == 'style':
            self.in_style = True
        if tag == 'link' and 'stylesheet' in a.get('rel', '').split():
            self.styles.append(a.get('href', ''))
        for key in ('src', 'poster', 'href'):
            value = a.get(key, '')
            if (tag in ('img', 'image') and key == 'src') or (tag == 'video' and key == 'poster') or Path(urlsplit(value).path).suffix.lower() in EXTENSIONS:
                self.refs.append(value)
        # Data URLs are embedded assets; do not split their internal commas.
        for entry in a.get('srcset', '').split(','):
            if entry.strip() and not a.get('srcset', '').startswith('data:'):
                self.refs.append(entry.strip().split()[0])
        if 'style' in a:
            self.css.append(a['style'])

    def handle_endtag(self, tag):
        if tag == 'style':
            self.in_style = False

    def handle_data(self, data):
        if self.in_style:
            self.css.append(data)


def check(root):
    files = {p.relative_to(root).as_posix(): p for p in root.rglob('*')
             if p.is_file() and '.git' not in p.relative_to(root).parts}
    lower = {p.lower(): p for p in files}
    errors, refs, external = [], set(), set()

    def resolve(source, url):
        parts = urlsplit(url.strip())
        if parts.scheme or parts.netloc or not parts.path:
            if parts.scheme in ('http', 'https') or parts.netloc:
                external.add(url)
            return None
        path = unquote(parts.path).replace('\\', '/')
        return posixpath.normpath(path.lstrip('/') if path.startswith('/') else posixpath.join(posixpath.dirname(source), path))

    def reference(source, url):
        path = resolve(source, url)
        if path is None:
            return
        refs.add(path)
        if path not in files:
            hint = f' (case mismatch: {lower[path.lower()]})' if path.lower() in lower else ''
            errors.append(f'{source}: missing {url} -> {path}{hint}')

    def css_references(source, css, styles=()):
        for match in CSS_URL.finditer(css):
            origin = source
            # A URL in a custom property resolves where the property is consumed.
            declaration = css[css.rfind(';', 0, match.start()) + 1:match.start()]
            variable = re.search(r'(--[\w-]+)\s*:\s*$', declaration)
            if variable:
                consumers = [s for s in styles if s in files and re.search(r'var\(\s*' + re.escape(variable[1]) + r'\s*[,)]', files[s].read_text())]
                if consumers:
                    origin = consumers[0]
            reference(origin, match[1])

    for name, path in files.items():
        if path.suffix == '.html':
            parser = References()
            parser.feed(path.read_text())
            if parser.base:
                errors.append(f'{name}: base URL needs explicit validation: {parser.base}')
            for url in parser.refs:
                reference(name, url)
            styles = [resolve(name, s) for s in parser.styles]
            for css in parser.css:
                css_references(name, css, styles)
        elif path.suffix == '.css':
            css_references(name, re.sub(r'/\*.*?\*/', '', path.read_text(), flags=re.S))
        elif path.suffix == '.js':
            for url in re.findall(r'[\"\']([^\"\'\n]+\.(?:webp|png|jpe?g|gif|svg|ico)(?:[?#][^\"\']*)?)[\"\']', path.read_text(), re.I):
                # Website scripts run in the document URL, not the script directory.
                reference('index.html', url)

    images = [p for p in files.values() if p.suffix.lower() in EXTENSIONS]
    for path in images:
        try:
            if path.suffix.lower() == '.svg':
                ElementTree.parse(path)
            else:
                with Image.open(path) as image:
                    image.verify()
                with Image.open(path) as image:
                    image.load()
                    if path.suffix.lower() == '.webp' and image.format != 'WEBP':
                        raise ValueError('extension says WebP but bytes have a different format')
        except Exception as error:
            errors.append(f'{path.relative_to(root)}: invalid image: {error}')
    print(f'Checked {sum(p.suffix == ".html" for p in files.values())} HTML pages, {len(refs)} local asset paths and {len(images)} image files.')
    print(f'External URLs excluded from local file check: {len(external)}')
    for error in errors:
        print('ERROR:', error)
    print('PASS: image files and references are valid.' if not errors else f'FAIL: {len(errors)} errors.')
    return bool(errors)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    sys.exit(check(parser.parse_args().root.resolve()))
