
rows = 20
cols = 30
lastworld = 1#5
reqs = []

def process_stage(stg):
    global reqs
    objects1 = []
    objects2 = []
    objects3 = []
    objects4 = []
    for i in range(rows):
        for j in range(cols):
            obj = stg[i][j].strip()
            if 'P' == obj:
                objects1 += [[str(j), str(i), 'Prophet']]
            elif 'N' == obj:
                objects2 += [[str(j), str(i), 'NPC']]
            elif 'L' == obj:
                objects3 += [[str(j), str(i), 'Lava']]
            elif 'X' == obj:
                objects4 += [[str(j), str(i), 'Floor']]
            elif 0 < len(obj) and '0' == obj[0]:
                objects3 += [[str(j), str(i), 'Counter']]
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
        stagesxy += [process_stage(lines[s*20:(s+1)*20])]
    return stagesxy

def compile_stages(infp, otfp):
    inf = open(infp, 'rt', newline='')
    otf = open(otfp, 'wt', newline='')
    currentstage = []
    stages = read_stages(inf)
    world = 1
    stage = 1
    otf.write('[\n')
    otf.write('  {\n')
    def worldheader(w):
        otf.write('    "world":'+str(w)+',\n')
        otf.write('    "bgm":"bgm'+str(w)+'.mp3,\n')
        otf.write('    "stages":[\n')
    def worldfooter(last=False):
        otf.write('    ]\n')
        if (last):
            otf.write('  }\n')
        else:
            otf.write('  },\n')
    def stageheader(w, s, r):
        otf.write('      "name":"'+str(w)+'-'+str(s)+',\n')
        otf.write('      "required":'+str(r)+',\n')
        otf.write('      "objects": [\n')
    def stagefooter(last=False):
        if (last):
            otf.write('      ]')
        else:
            otf.write('      ],')
    def object(o, first=False):
        if not first:
            otf.write(',\n')
        otf.write('        {\n')
        otf.write('          "x":'+o[0]+',\n')
        otf.write('          "y":'+o[1]+',\n')
        otf.write('          "type":'+o[2]+',\n')
        otf.write('        }')
    for s in stages:
        if 1 == stage:
            worldheader(world)
        stageheader(world, stage, reqs[(world-1) * 10 + (stage-1)])
        firsto=True
        for o in s:
            object(o, firsto)
            firsto=False
        stage += 1
        if 10 < stage:
            stage -= 10
            world += 1
            stagefooter(True)
            if lastworld < world:
                worldfooter(True)
            else:
                worldfooter(False)
                worldheader(world)
        else:
            stagefooter(False)

if __name__ == '__main__':
    compile_stages('stage_data.txt', 'stage_data.json')