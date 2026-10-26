#!/usr/bin/env python3
"""HTML·템플릿·CSS의 로컬 참조를 검사합니다. 파일은 변경하지 않습니다."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
ERRORS = []
COUNT = 0
ATTRIBUTES = {'src', 'href', 'poster', 'data-src', 'data-include-file', 'action'}


def check(value, source, line, contexts=None):
    global COUNT
    if not value or value.startswith(('#', 'data:', 'javascript:', 'mailto:', 'tel:', '(')):
        return
    url = urlsplit(value)
    if url.scheme or url.netloc or not url.path:
        return
    if value.startswith('{{root}}'):
        candidates = [ROOT / unquote(url.path[len('{{root}}'):])]
    elif value.startswith('{{html}}'):
        candidates = [ROOT / 'html/kr' / unquote(url.path[len('{{html}}'):])]
    elif '{{' in value:
        ERRORS.append(f'{source.relative_to(ROOT)}:{line}: 해석하지 못한 경로 {value}')
        return
    elif url.path.startswith('/'):
        candidates = [ROOT / unquote(url.path.lstrip('/'))]
    else:
        candidates = [p.parent / unquote(url.path) for p in (contexts or [source])]
    COUNT += 1
    if not any(p.is_file() for p in candidates):
        ERRORS.append(f'{source.relative_to(ROOT)}:{line}: {value}')


class Scan(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.source = source
        self.contexts = [source]
        relative = source.relative_to(ROOT).as_posix()
        if relative.startswith('html/common/code/'):
            self.contexts.append(ROOT / 'html/styleguide/styleguide.html')
        if relative == 'html/common/code/ext_search_result.html':
            self.contexts.append(ROOT / 'html/kr/search/search_result.html')
        if relative.startswith('html/kr/code/'):
            self.contexts.append(ROOT / 'html/kr/main.html')

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for name in ATTRIBUTES:
            if name in attrs:
                check(attrs[name], self.source, self.getpos()[0], self.contexts)
        if attrs.get('data-include'):
            check('{{root}}tmpl/kr/' + attrs['data-include'] + '.html', self.source, self.getpos()[0])

    handle_startendtag = handle_starttag


def main():
    html_files = list((ROOT / 'html').rglob('*.html')) + list((ROOT / 'tmpl').rglob('*.html'))
    css_files = list((ROOT / 'css').rglob('*.css'))
    for source in html_files:
        Scan(source).feed(source.read_text(encoding='utf-8'))
    for source in css_files:
        text = source.read_text(encoding='utf-8')
        for match in re.finditer(r'url\(\s*[\"\x27]?([^\)\"\x27]+)', text):
            check(match[1].strip(), source, text.count('\n', 0, match.start()) + 1)
    for error in ERRORS:
        print(error, file=sys.stderr)
    print(f'HTML {len(html_files)} · CSS {len(css_files)} · 로컬 참조 {COUNT} · 오류 {len(ERRORS)}')
    return bool(ERRORS)


if __name__ == '__main__':
    sys.exit(main())
