import os
import shutil

BASE = os.path.dirname(os.path.dirname(os.path.normpath(__file__)))
TARGET = os.path.join(BASE, 'deploy', 'stuff')
UGLIFY_CMDLINE = f"uglifyjs {os.path.join(BASE, 'game.js')} -c -m -o {os.path.join(TARGET, 'game.min.js')}"


def ignore(src, names):
    return [n for n in names if n.lower().endswith('.txt')]


def copytree(dir_name):
    shutil.copytree(os.path.join(BASE, dir_name), os.path.join(TARGET, dir_name), ignore=ignore)


def copy(fn):
    shutil.copy(os.path.join(BASE, fn), os.path.join(TARGET, fn))


def deploy():
    if os.path.exists(TARGET):
        shutil.rmtree(TARGET)
    os.makedirs(TARGET)
    copytree('assets')
    copytree('lib')
    # copy('index.html')
    # copy('game.js')

    # game.min.js
    os.system(UGLIFY_CMDLINE)

    # game.min.html
    game_html = open(os.path.join(BASE, 'game.html'), 'rb').read()
    game_min_html = game_html.replace(b'game.js', b'game.min.js')
    open(os.path.join(TARGET, 'game.min.html'), 'wb').write(game_min_html)


if __name__ == '__main__':
    deploy()
