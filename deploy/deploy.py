import os
import shutil

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET = os.path.join(BASE, 'deploy', 'stuff')
UGLIFY_CMDLINE = f"uglifyjs {os.path.join(BASE, 'game.js')} -c -m -o {os.path.join(TARGET, 'game.min.js')}"


def is_ignored(item):
    return item.lower().endswith('.txt')


def ignore(src, names):
    return [n for n in names if is_ignored(n)]


def copytree_workaround(src, dst):
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if not is_ignored(item):
            shutil.copy2(s, d)


def copytree(dir_name, to_target=False):
    if to_target:
        copytree_workaround(os.path.join(BASE, dir_name), TARGET)
    else:
        shutil.copytree(os.path.join(BASE, dir_name), os.path.join(TARGET, dir_name),
                        ignore=ignore)

def copy(fn):
    shutil.copy(os.path.join(BASE, fn), os.path.join(TARGET, fn))


def deploy():
    if os.path.exists(TARGET):
        shutil.rmtree(TARGET)
    os.makedirs(TARGET)
    copytree('assets')
    copytree('lib')
    # copytree('website', to_target=True)

    # game.min.js
    os.system(UGLIFY_CMDLINE)

    # game.min.html
    game_html = open(os.path.join(BASE, 'game.html'), 'rb').read()
    game_min_html = game_html.replace(b'game.js', b'game.min.js')
    open(os.path.join(TARGET, 'game.min.html'), 'wb').write(game_min_html)

    # game_extended.min.html
    game_html = open(os.path.join(BASE, 'game_extended.html'), 'rb').read()
    game_min_html = game_html.replace(b'game.js', b'game.min.js')
    open(os.path.join(TARGET, 'game_extended.min.html'), 'wb').write(game_min_html)

    # game_full.min.html
    game_html = open(os.path.join(BASE, 'game_full.html'), 'rb').read()
    game_min_html = game_html.replace(b'game.js', b'game.min.js')
    open(os.path.join(TARGET, 'game_full.min.html'), 'wb').write(game_min_html)


if __name__ == '__main__':
    deploy()
