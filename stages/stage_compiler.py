import json


rows = 20
cols = 30
reqs = []

titles = [
    [
        "One Potato",
        "Two Potato",
        "Three Potato?!",
        "They Can't Jump",
        "Leave None Behind",
        "Go Forth, My Minion",
        "Patience",
        "Choices",
        "Careful",
        "Beach Volcano",
    ], [
        "Watch Your Step", #2-1
        "Eliminate the Spares",
        "Ant Farm",
        "Ant Farm's Revenge",
        "One Way",
        "Rooftops",
        "Star-Cross'd",
        "Vents",
        "Jump, Man!",
        "Village Volcano",
    ], [
        "No Girls Allowed", #3-1
        "Watch Her Step",
        "Ladies' Night",
        "Tree of Eden",
        "Ice and Fire",
        "Zig Zag",
        "The True Path",
        "RUN!",
        "Choose Your Fighter",
        "Forest Volcano",
    ], [
        "Locked and Loaded", #4-1
        "Face / Off",
        "Saving face",
        "Mind Games",
        "Switched on",
        "Trash Compactor",
        "Hand Holding",
        "Guardian Prophet",
        "One of Three",
        "Temple Volcano",
    ], [
        "Enemy at the Crater", #5-1
        "Underground Lair",
        "Warrior Princess",
        "Bloody Nose",
        "UNLIMITED POWER!!!*<br /><br /><font size=-2>* some limitations may apply</font>",
        "All in one Place",
        "Not Just for your Friends!",
        "Sharp Shooter",
        "Final Exam",
        "Volcano Volcano",
        "Volcano Volcano",
        "Volcano Volcano",
        "...",
        "Well?",
    ]
]



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

wall_types = [
    'X', 'Y', 'x', 'y', 'W',
    'L', 'G', 'l'
]

def is_wall(obj):
    if len(obj) < 1:
        return False
    return obj[0] in wall_types
    

def process_stage(stg, w):
    global reqs
    objects1 = []
    objects2 = []
    objects3 = []
    objects4 = []
    objects5 = []
    for i in range(rows):
        for j in range(cols):
            obj = stg[i][j].strip()
            under_wall = False
            under_mwall = False
            under_wwall = False
            requires_invis = False
            if 0 < i:
                uobj = stg[i-1][j].strip()
                under_wall = is_wall(uobj)
                under_mwall = under_wall or 'H' == uobj
                under_wwall = under_wall or 'F' == uobj
            if 'P' == obj:
                objects1 += [[j, i, 'Prophet']]
            elif 'N' == obj:
                objects2 += [[j, i, 'NPC', 'facing', 'right']]
            elif 'n' == obj:
                objects2 += [[j, i, 'NPC', 'facing', 'left']]
            elif 'M' == obj:
                objects2 += [[j, i, 'NPC2', 'facing', 'right']]
            elif 'm' == obj:
                objects2 += [[j, i, 'NPC2', 'facing', 'left']]
            elif 'H' == obj:
                objects3 += [[j, i, 'MBlock']]
                if not under_mwall:
                    objects5 += [[j, i, 'MInvisiblePlatform']]
            elif 'F' == obj:
                objects3 += [[j, i, 'WBlock']]
                if not under_wwall:
                    objects5 += [[j, i, 'WInvisiblePlatform']]
            elif 'L' == obj:
                tp = 'Lava'
                if under_wall:
                    tp = 'Deeplava'
                objects3 += [[j, i, tp]]
            elif 'G' == obj:
                objects3 += [[j, i, 'LavaGen']]
            elif 'l' == obj:
                tp = 'Ice'
                if under_wall:
                    tp = 'Deepice'
                objects3 += [[j, i, tp]]
            elif 'I' == obj:
                objects3 += [[j, i, 'IceShrine']]
            elif 'i' == obj:
                objects3 += [[j, i, 'LavaShrine']]
            elif 'K1' == obj:
                objects3 += [[j, i, 'Key1']]
            elif 'D1' == obj:
                if not under_wall:
                    objects3 += [[j, i, 'Door1']]
                else:
                    objects3 += [[j, i, 'DeepDoor1']]
            elif 'K2' == obj:
                objects3 += [[j, i, 'Key2']]
            elif 'D2' == obj:
                if not under_wall:
                    objects3 += [[j, i, 'Door2']]
                else:
                    objects3 += [[j, i, 'DeepDoor2']]
            elif 'K3' == obj:
                objects3 += [[j, i, 'Key3']]
            elif 'D3' == obj:
                if not under_wall:
                    objects3 += [[j, i, 'Door3']]
                else:
                    objects3 += [[j, i, 'DeepDoor3']]
            elif 's' == obj:
                objects3 += [[j, i, 'Switch']]
            elif 'S' == obj:
                objects3 += [[j, i, 'DGate']]
            elif '$' == obj:
                objects3 += [[j, i, 'UGate']]
            elif 'z' == obj:
                objects3 += [[j, i, 'LGate']]
            elif 'Z' == obj:
                objects3 += [[j, i, 'RGate']]
            elif 'E' == obj:
                objects3 += [[j, i, 'Enemy', 'facing', 'right']]
            elif 'e' == obj:
                objects3 += [[j, i, 'Enemy', 'facing', 'left']]
            elif 'A' == obj:
                objects3 += [[j, i, 'Amulet']]
            elif 'X' == obj:
                wlind = wallindex_xy(stg, i, j, w, obj)
                objects4 += [[j, i, 'Wall', 'spriteindex', wlind]]
                requires_invis = True
            elif 'Y' == obj:
                wlind = wallindex_xy(stg, i, j, w, obj) + 20
                objects4 += [[j, i, 'Wall', 'spriteindex', wlind]]
                requires_invis = True
            elif 'x' == obj:
                wlind = wallindex_xy(stg, i, j, w, obj) - 40
                objects4 += [[j, i, 'Wall', 'spriteindex', wlind]]
                requires_invis = True
            elif 'y' == obj:
                wlind = wallindex_xy(stg, i, j, w, obj) - 20
                objects4 += [[j, i, 'Wall', 'spriteindex', wlind]]
                requires_invis = True
            elif '^' == obj:
                objects3 += [[j, i, 'Floor']]
                requires_invis = True
            elif '~' == obj:
                objects3 += [[j, i, 'Trap']]
            elif 0 < len(obj):
                if '0' == obj[0]:
                    objects3 += [[j, i, 'Counter']]
                    reqs += [int(obj[2:])]
                elif '!' == obj[0]:
                    objects3 += [[j, i, 'Note', 'text', obj[1:]]]
                elif 'W' == obj[0]:
                    objects3 += [[j, i, 'Wall', 'spriteindex', int(obj[1:])]]
                    requires_invis = True
                else:
                    print('Unexpected object type: "'+ obj+'"')
            if not under_wall and requires_invis:
                objects5 += [[j, i, 'InvisiblePlatform']]
    return objects1 + objects2 + objects3 + objects4 + objects5
            
def read_stages(inf):
    lines = []
    for r in inf:
        lines += [r.split('\t')]
    stagecount = int(len(lines) / rows)
    stagesxy = []
    for s in range(stagecount):
        stagesxy += [process_stage(lines[s*20:(s+1)*20], min(int(s/10), 4))]
    return stagesxy

def world(w, stgs):
    wrd = {}
    wrd['world'] = w
    wrd['bgm'] = 'bgm'+str(w)+'.mp3'
    wrd['stages'] = stgs
    return wrd

def stage(w, s, r, objs):
    stg = {}
    stg['name'] = str(w)+'-'+str(min(s,10))
    stg['title'] = titles[w-1][s-1]
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
        if 10 < sind and 5 > wind:
            wrds += [world(wind, stgs)]
            stgs = []
            sind -= 10
            wind += 1
    if 0 < len(stgs):
        wrds += [world(wind, stgs)]
    json.dump(wrds, otf, sort_keys=False)

if __name__ == '__main__':
    compile_stages('stage_data.txt', 'stage_data.json')