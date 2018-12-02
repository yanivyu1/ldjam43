import json


rows = 20
cols = 30
reqs = []

def wallindex(u, d, l, r, w, t):
    ind = w * 40
    if u: ind += 1
    if d: ind += 2
    if l: ind += 4
    if r: ind += 8
    if u and d and l and r:
        if 6 == t:
            ind += 1
        elif 14 == t:
            ind += 2
        elif 19 == t:
            ind += 3
        elif 9 == t:
            ind += 4
    return ind

def wallindex_xy(stg, y, x, w, obj):
    uobj = obj
    if 0 < y: uobj = stg[y-1][x].strip()
    dobj = obj
    if rows - 1 > y: dobj = stg[y+1][x].strip()
    lobj = obj
    if 0 < x: lobj = stg[y][x-1].strip()
    robj = obj
    if cols - 1 > x: robj = stg[y][x+1].strip()
    return wallindex(uobj == obj, dobj == obj, lobj == obj, robj == obj, w, (y * cols + x) % 25)

def process_stage(stg, w):
    global reqs
    objects1 = []
    objects2 = []
    objects3 = []
    objects4 = []
    for i in range(rows):
        for j in range(cols):
            obj = stg[i][j].strip()
            if 'P' == obj:
                objects1 += [[j, i, 'Prophet']]
            elif 'N' == obj:
                objects2 += [[j, i, 'NPC']]
            elif 'M' == obj:
                objects2 += [[j, i, 'NPC2']]
            elif 'L' == obj:
                tp = 'Lava'
                if 0 < i and 0 < len(stg[i-1][j].strip()):
                    tp = 'Deeplava'
                objects3 += [[j, i, tp]]
            elif 'X' == obj:
                wlind = wallindex_xy(stg, i, j, w, obj)
                objects4 += [[j, i, 'Wall', 'spriteindex', wlind]]
            elif 'Y' == obj:
                wlind = wallindex_xy(stg, i, j, w, obj) + 20
                objects4 += [[j, i, 'Wall', 'spriteindex', wlind]]
            elif '^' == obj:
                objects3 += [[j, i, 'Floor']]
            elif '~' == obj:
                objects3 += [[j, i, 'Trap']]
            elif 0 < len(obj) and '0' == obj[0]:
                objects3 += [[j, i, 'Counter']]
                reqs += [int(obj[2:])]
            elif 0 < len(obj):
                print('Unexpected object type: "'+ obj+'"')
    return objects1 + objects2 + objects3 + objects4
            
def read_stages(inf):
    lines = []
    for r in inf:
        lines += [r.split('\t')]
    stagecount = int(len(lines) / rows)
    stagesxy = []
    for s in range(stagecount):
        stagesxy += [process_stage(lines[s*20:(s+1)*20], int(s/10))]
    return stagesxy

def world(w, stgs):
    wrd = {}
    wrd['world'] = w
    wrd['bgm'] = 'bgm'+str(w)+'.mp3'
    wrd['stages'] = stgs
    return wrd

def stage(w, s, r, objs):
    stg = {}
    stg['name'] = str(w)+'-'+str(s)
    stg['required'] = r
    stg['objects'] = objs
    return stg

def object(o):
    obj = {}
    obj['x'] = o[0]
    obj['y'] = o[1]
    obj['type'] = o[2]
    if 4 < len(o):
        obj[o[3]] = o[4]
    return obj

def compile_stages(infp, otfp):
    inf = open(infp, 'rt', newline='')
    otf = open(otfp, 'wt', newline='')
    stages = read_stages(inf)
    wind = 1
    sind = 1
    wrds = []
    stgs = []
    for s in stages:
        objs = [object(o) for o in s]
        stgs += [stage(wind, sind, reqs[(wind-1) * 10 + (sind-1)], objs)]
        sind += 1
        if 10 < sind:
            wrds += [world(wind, stgs)]
            stgs = []
            sind -= 10
            wind += 1
    json.dump(wrds, otf, sort_keys=False)

if __name__ == '__main__':
    compile_stages('stage_data.txt', 'stage_data.json')