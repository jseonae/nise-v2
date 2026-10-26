#!/usr/bin/env python3
"""경로·생성 구간·자체 스크립트 문법을 검사합니다. 프로젝트 파일은 변경하지 않습니다."""
import ast
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent


def main():
    failed = False
    for script, args in [
        ('check_paths.py', []),
        ('build_edu_status.py', ['--check']),
        ('build_main_stat_svg.py', ['--check']),
    ]:
        result = subprocess.run([sys.executable, str(ROOT / '_tools' / script), *args], cwd=ROOT)
        failed |= result.returncode != 0

    python_files = sorted((ROOT / '_tools').glob('*.py'))
    for source in python_files:
        try:
            ast.parse(source.read_text(encoding='utf-8'), filename=str(source))
        except SyntaxError as error:
            print(error, file=sys.stderr)
            failed = True
    print(f'Python 문법 검사 : {len(python_files)}개', flush=True)

    node = shutil.which('node')
    if node is None:
        print('JavaScript 문법 검사에 필요한 node 명령을 찾지 못했습니다.', file=sys.stderr)
        failed = True
    else:
        scripts = sorted(source for source in (ROOT / 'js').rglob('*.js')
                         if 'lib' not in source.relative_to(ROOT).parts
                         and 'backup' not in source.relative_to(ROOT).parts
                         and source.name != 'prism.js')
        for source in scripts:
            result = subprocess.run([node, '--check', str(source)], cwd=ROOT)
            failed |= result.returncode != 0
        print(f'JavaScript 문법 검사 : {len(scripts)}개')

    print('프로젝트 검사 실패' if failed else '프로젝트 검사 통과')
    return 1 if failed else 0


if __name__ == '__main__':
    raise SystemExit(main())
