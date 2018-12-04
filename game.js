var assets = function() {
    var sprite_map = {
        prophet_stand_right: [0, 0],
        unbeliever_stand_right: [0, 6],
        true_believer_stand_right: [16, 6],
        tile_lava: [0, 14],
        tile_floor: [12, 14],
        tile_trap: [13, 14],
        enemy_stand_right: [12, 4],
        tile_dgate: [35, 8],
        tile_mblock: [19, 14],
        tile_wblock: [20, 14],
        tile_ice: [21, 14],
        tile_iceshrine: [24, 14],
        tile_lavashrine: [25, 14],
        tile_key1: [26, 14],
        tile_door1: [27, 14],
        tile_key2: [28, 14],
        tile_door2: [29, 14],
        tile_key3: [30, 14],
        tile_door3: [31, 14],
        tile_switch: [32, 14],
        tile_amulet: [33, 14],
    };

    for (var row = 0; row < 5; row++) {
        for (var col = 0; col < 40; col++) {
            var wall_num = row * 40 + col;
            var wall_pos = [col, row + 15];
            sprite_map['tile_Wall' + wall_num] = wall_pos;
        }
    }

    return {
        "sprites": {
            "assets/SpriteMap.png": {
                tile: 32,
                tileh: 32,
                map: sprite_map
            }
        },
        "images": [
            'assets/gfx/bg-intro.png',
            'assets/gfx/bg-world1.png',
            'assets/gfx/bg-world2.png',
            'assets/gfx/bg-world3.png',
            'assets/gfx/bg-world4.png',
            'assets/gfx/bg-world5.png'
        ],
        "audio": {
            // Background music
            'bg-intro': ['assets/music/bg-intro.mp3'],
            'bg-world1': ['assets/music/bg-world1.mp3'],
            'bg-world2': ['assets/music/bg-world2.mp3'],
            'bg-world3': ['assets/music/bg-world3.mp3'],
            'bg-world4': ['assets/music/bg-world4.mp3'],
            'bg-world5': ['assets/music/bg-world5.mp3'],
            // SFX - believers
            "Male-trap": ["assets/sound_fx/stab_male.mp3"],
            "Female-trap": ["assets/sound_fx/stab_female.mp3"],
            "Male-lava": ["assets/sound_fx/true_believer_ascends_to_hevan.mp3"],
            "Female-lava": ["assets/sound_fx/female_true_believer_ascends_to_hevan.mp3"],
            "Male-converted": ["assets/sound_fx/converted_male.mp3"],
            "Female-converted": ["assets/sound_fx/converted_female.mp3"],
            // SFX - prophet
            "Prophet-lava": ["assets/sound_fx/prophet_fired.mp3"],
        }
    };
}();

var consts = {
    tile_width: 32,
    tile_height: 32,
    level_width: 30,
    level_height: 20,
    pixel_width: 960, // 32 * 30
    pixel_height: 640, // 32 * 20
    anim_fps: 12,
    full_screen_ratio: 0.9,
    zoom_in_level: 2,
    prophet_walk_speed: 120,
    prophet_jump_speed: 305,
    believer_jump_speed: 3000,
    believer_walk_speed: 777,
    follow_x_gap_px: 16,
    wait_for_death: 2000,
    wait_for_skip: 500,
    prophet_text_timeout: 5000,
    title_text_timeout: 5000,
    ice_lava_flood_fill_timeout: 250,
    inventory_gap_y: 10
};

var game_state = {
    cur_world: 0,
    cur_level: 0,
    playing_music_for_world: null,
    scene_type: null,
    zoom_out_level: null
};

var texts = {
    win: 'And on we go!',
    lose: 'Better luck next time.',
    oops: 'Oops! Clumsy...',
    restart_level: 'Try, try again...',
    skip_level: 'Coward.',
    skip_world: 'Wuss.'
};

var zorders = {
    // higher = closer to the user's eyeballs
    default: 0,   // Crafty default
    walls: 1,
    stage_titles: 2,
    generic_items: 3,
    inventory_items: 4,
    enemies: 5,
    believers: 6,
    target_and_lightning: 7,
    prophet: 8,
    prophet_text: 9
};

function addReel(entity, anim_name, row, first_col, last_col)
{
    var frames = [];
    if (first_col <= last_col) {
        for (var col = first_col; col <= last_col; col++) {
            frames.push([col, row]);
        }
    } else {
        for (var col = first_col; col >= last_col; col--) {
            frames.push([col, row]);
        }
    }

    entity.reel(anim_name, 1000 * (Math.abs(last_col - first_col) + 1) / consts.anim_fps, frames);
}

function addEntity(entity_type, tiles_x, tiles_y, tile_type)
{
    return Crafty.e(entity_type, tile_type)
        .attr({x: tiles_x * consts.tile_width,
            y: tiles_y * consts.tile_height,
            w: consts.tile_width,
            h: consts.tile_height});
}

function addInvisiblePlatform(tiles_x, tiles_y)
{
    return addEntity('InvisiblePlatform', tiles_x, tiles_y).attr({h: 0});
}

function addLava(tiles_x, tiles_y, lava_type)
{
    var lava_obj = addEntity('Lava', tiles_x, tiles_y).setLavaType(lava_type);
    LavaAndIceManager.registerLava(tiles_x, tiles_y, lava_obj);
    return lava_obj;
}

function addIce(tiles_x, tiles_y, ice_type)
{
    var ice_obj = addEntity('Ice', tiles_x, tiles_y).setIceType(ice_type);
    LavaAndIceManager.registerIce(tiles_x, tiles_y, ice_obj);
    return ice_obj;
}

function addLavaGen(tiles_x, tiles_y)
{
    var lava_gen = addEntity('LavaGen', tiles_x, tiles_y);
    LavaAndIceManager.registerLavaGen(tiles_x, tiles_y, lava_gen);
    return lava_gen;
}

function addIceGen(tiles_x, tiles_y)
{
    var ice_gen = addEntity('IceGen', tiles_x, tiles_y);
    LavaAndIceManager.registerIceGen(tiles_x, tiles_y, ice_gen);
    return ice_gen;
}

function initScenes()
{
    Crafty.defineScene('level', function() {
        function addBackground(world_id)
        {
            Crafty.e('2D, DOM, Image')
                .attr({x: 0, y: 0})
                .image('assets/gfx/bg-world' + world_id + '.png');
        }

        function addFloor(tiles_x, tiles_y)
        {
            return addEntity('Floor', tiles_x, tiles_y);
        }

        function addWall(tiles_x, tiles_y, floorType)
        {
            return addEntity('Wall', tiles_x, tiles_y, floorType);
        }

        function addOuterWall(tiles_x, tiles_y)
        {
            return addEntity('OuterWall', tiles_x, tiles_y).attr({w: 1});
        }

        function addOuterCeiling(tiles_x, tiles_y)
        {
            return addEntity('OuterCeiling', tiles_x, tiles_y).attr({h: 1});
        }

        function addMInvisiblePlatform(tiles_x, tiles_y)
        {
            return addEntity('MInvisiblePlatform', tiles_x, tiles_y).attr({h: 0});
        }

        function addWInvisiblePlatform(tiles_x, tiles_y)
        {
            return addEntity('WInvisiblePlatform', tiles_x, tiles_y).attr({h: 0});
        }

        function addTrap(tiles_x, tiles_y)
        {
            return addEntity('Trap', tiles_x, tiles_y);
        }

        function addEnemy(tiles_x, tiles_y, facing)
        {
            var enemy = addEntity('Enemy', tiles_x, tiles_y);
            enemy.direction = facing;
            enemy.dir_animate('stand', -1);
            return enemy;
        }

        function addGate(tiles_x, tiles_y, gate_type)
        {
            return addEntity('Gate', tiles_x, tiles_y).setGateType(gate_type);
        }

        function addMBlock(tiles_x, tiles_y)
        {
            return addEntity('MBlock', tiles_x, tiles_y);
        }

        function addWBlock(tiles_x, tiles_y)
        {
            return addEntity('WBlock', tiles_x, tiles_y);
        }

        function addIceShrine(tiles_x, tiles_y)
        {
            return addEntity('IceShrine', tiles_x, tiles_y);
        }

        function addLavaShrine(tiles_x, tiles_y)
        {
            return addEntity('LavaShrine', tiles_x, tiles_y);
        }

        function addKey1(tiles_x, tiles_y)
        {
            return addEntity('Key1', tiles_x, tiles_y);
        }

        function addShallowDoor(tiles_x, tiles_y, door_type)
        {
            var invisible_platform = addEntity('InvisiblePlatformDoor', tiles_x, tiles_y).attr({h: 0});
            var door = addEntity(door_type, tiles_x, tiles_y).attr({invisiblePlatform: invisible_platform});
            invisible_platform.door = door;
            return door;
        }

        function addDeepDoor(tiles_x, tiles_y, door_type)
        {
            return addEntity(door_type, tiles_x, tiles_y);
        }

        function addKey2(tiles_x, tiles_y)
        {
            return addEntity('Key2', tiles_x, tiles_y);
        }

        function addKey3(tiles_x, tiles_y)
        {
            return addEntity('Key3', tiles_x, tiles_y);
        }

        function addSwitch(tiles_x, tiles_y)
        {
            return addEntity('Switch', tiles_x, tiles_y);
        }

        function addAmulet(tiles_x, tiles_y)
        {
            return addEntity('Amulet', tiles_x, tiles_y);
        }

        function addProphet(tiles_x, tiles_y)
        {
            return addEntity('Prophet', tiles_x, tiles_y);
        }

        function addUnbeliever(tiles_x, tiles_y, facing, type_idx)
        {
            var u = addEntity('Unbeliever' + type_idx, tiles_x, tiles_y);
            u.direction = facing;
            u.dir_animate('stand', -1);
            return u;
        }

        function addCounter(tiles_x, tiles_y)
        {
            return Crafty.e('Counter')
                .attr({x: (tiles_x - 1) * consts.tile_width,
                       y: tiles_y * consts.tile_height,
                       w: consts.tile_width * 3});
        }

        function addNote(tiles_x, tiles_y, help_text)
        {
            var n = addEntity('Note', tiles_x, tiles_y);
            n.setHelpText(help_text);
            return n;
        }

        function addLevelTitle(prophet_tiles_x, prophet_tiles_y, level_name, level_title)
        {
            var tiles_y;

            if (prophet_tiles_y < 10) {
                tiles_y = prophet_tiles_y + 3;
                if (tiles_y > 17) {
                    tiles_y = 17;
                }
            }
            else {
                tiles_y = prophet_tiles_y - 3;
                if (tiles_y < 3) {
                    tiles_y = 3;
                }
            }

            addEntity('LevelTitleText', prophet_tiles_x, tiles_y - 1/2)
                .setText(level_name, '10px', 15);
            addEntity('LevelTitleText', prophet_tiles_x, tiles_y)
                .setText(level_title, '15px', 20);
        }

        game_state.scene_type = 'level';
        zoomer.reset();
        LavaAndIceManager.reset();

        for (var i = 0; i < consts.level_height; i++) {
            addOuterWall(0, i);
            addOuterWall(consts.level_width, i);
        }

        for (var i=0; i < consts.level_width; i++) {
            addTrap(i, consts.level_height);
            addOuterCeiling(i, 0);
        }

        var world_id = worlds[game_state.cur_world].world;
        addBackground(world_id);

        if (game_state.playing_music_for_world != world_id) {
            prev_music_id = 'bg-world' + game_state.playing_music_for_world;
            if (game_state.playing_music_for_world != null && Crafty.audio.isPlaying(prev_music_id)) {
                Crafty.audio.stop(prev_music_id);
            }

            Crafty.audio.play('bg-world' + world_id, -1, 0.5);
            game_state.playing_music_for_world = world_id;
        }

        var stage = worlds[game_state.cur_world].stages[game_state.cur_level];
        var objects = stage.objects;
        for(var i=0;i<objects.length;i++){
            if(objects[i].type == 'Wall') {
                addWall(objects[i].x, objects[i].y, 'tile_' + objects[i].type +''+objects[i].spriteindex);
            }
            else if (objects[i].type == 'Floor') {
                addFloor(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'InvisiblePlatform') {
                addInvisiblePlatform(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'MInvisiblePlatform') {
                addMInvisiblePlatform(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'WInvisiblePlatform') {
                addWInvisiblePlatform(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'Prophet') {
                var prophet = addProphet(objects[i].x, objects[i].y);
                Crafty.viewport.follow(prophet, 0, 0);
                Crafty.e('ProphetText');
                addLevelTitle(objects[i].x, objects[i].y,
                    'Level ' + stage.name, stage.title);
            }
            else if (objects[i].type == 'NPC') {
                addUnbeliever(objects[i].x, objects[i].y, objects[i].facing, 1);
            }
            else if (objects[i].type == 'NPC2') {
                addUnbeliever(objects[i].x, objects[i].y, objects[i].facing, 2);
            }
            else if (objects[i].type == 'Lava') {
                addLava(objects[i].x, objects[i].y, 'shallow');
            }
            else if (objects[i].type == 'Deeplava') {
                addLava(objects[i].x, objects[i].y, 'deep');
            }
            else if (objects[i].type == 'Trap') {
                addTrap(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'Enemy') {
                addEnemy(objects[i].x, objects[i].y, objects[i].facing);
            }
            else if (objects[i].type == 'DGate') {
                addGate(objects[i].x, objects[i].y, 'down');
            }
            else if (objects[i].type == 'UGate') {
                addGate(objects[i].x, objects[i].y, 'up');
            }
            else if (objects[i].type == 'LGate') {
                addGate(objects[i].x, objects[i].y, 'left');
            }
            else if (objects[i].type == 'RGate') {
                addGate(objects[i].x, objects[i].y, 'right');
            }
            else if (objects[i].type == 'MBlock') {
                addMBlock(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'WBlock') {
                addWBlock(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'Ice') {
                addIce(objects[i].x, objects[i].y, 'shallow');
            }
            else if (objects[i].type == 'Deepice') {
                addIce(objects[i].x, objects[i].y, 'deep');
            }
            else if (objects[i].type == 'LavaGen') {
                addLavaGen(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'IceGen') {
                addIceGen(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'IceShrine') {
                addIceShrine(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'LavaShrine') {
                addLavaShrine(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'Key1') {
                addKey1(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'Door1') {
                addShallowDoor(objects[i].x, objects[i].y, 'Door1');
            }
            else if (objects[i].type == 'DeepDoor1') {
                addDeepDoor(objects[i].x, objects[i].y, 'Door1');
            }
            else if (objects[i].type == 'Key2') {
                addKey2(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'Door2') {
                addShallowDoor(objects[i].x, objects[i].y, 'Door2');
            }
            else if (objects[i].type == 'DeepDoor2') {
                addDeepDoor(objects[i].x, objects[i].y, 'Door2');
            }
            else if (objects[i].type == 'Key3') {
                addKey3(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'Door3') {
                addShallowDoor(objects[i].x, objects[i].y, 'Door3');
            }
            else if (objects[i].type == 'DeepDoor3') {
                addDeepDoor(objects[i].x, objects[i].y, 'Door3');
            }
            else if (objects[i].type == 'Switch') {
                addSwitch(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'Amulet') {
                addAmulet(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'Counter') {
                addCounter(objects[i].x, objects[i].y)
                    .setTotal(stage.required);
            }
            else if (objects[i].type == 'Note') {
                addNote(objects[i].x, objects[i].y, objects[i].text);
            }
        }
    });

    Crafty.defineScene('intro', function() {
        game_state.scene_type = 'intro';

        Crafty.e('2D, DOM, Image')
              .image('assets/gfx/bg-intro.png')
              .addComponent('FullScreenImage');
        Crafty.audio.stop();
        Crafty.audio.play('bg-intro');
    });

    Crafty.defineScene('loading', function() {
        // Cannot use assets or components, they're not yet loaded. Fonts are ok.
        Crafty.e('2D, DOM, Text')
            .text('Loading...')
            .textColor('white')
            .textFont({family: 'Amiga4ever', size:'50px'})
            .textAlign('center')
            .attr({x: 0, y: game_state.crafty_height / 3, w: game_state.crafty_width});

        Crafty.load(assets, function() {
            initComponents();
            createNonLevelEntities();
            setTimeout(function() {
                Crafty.enterScene('intro');
            }, 250);
        });
    });
}

var zoomer = {
    in_shift_zoom: false,

    handleZoomPress: function(down, shift) {
        if (down && shift && !this.in_shift_zoom) {
            // enter shift-zoom
            this.in_shift_zoom = true;
            this.zoomOut();
        }
        else if (down && shift && this.in_shift_zoom) {
            // exit shift-zoom
            this.in_shift_zoom = false;
            this.zoomIn();
        }
        else if (down && !shift && !this.in_shift_zoom) {
            // enter non-shift-zoom
            this.zoomOut();
        }
        else if (!down && !this.in_shift_zoom) {
            // exit either non-shift-zoom or shift-zoom
            this.in_shift_zoom = false;
            this.zoomIn();
        }
    },

    zoomOut: function() {
        Crafty.viewport.scale(game_state.zoom_out_level);
    },

    zoomIn: function() {
        Crafty.viewport.scale(consts.zoom_in_level);
    },

    reset: function() {
        this.in_shift_zoom = false;
        this.zoomIn();
    }
};

var LavaAndIceManager = {
    level_map: null,  // [x][y] -> {type: 'lava' or 'ice', obj: obj} or null
    lava_gens: null,  // list of {x, y, obj} of lava gens
    ice_gens: null,   // list of {x, y, obj} of ice gens
    generation: 0,

    reset: function() {
        this.level_map = new Array(consts.level_width);
        for (var i = 0; i < consts.level_width; i++) {
            this.level_map[i] = new Array(consts.level_height);
        }

        this.lava_gens = [];
        this.ice_gens = [];
        this.generation++;
    },

    fillNeighbors: function(x, y, neighbor_list) {
        if (x > 0) neighbor_list.push({x: x - 1, y: y});
        if (y > 0) neighbor_list.push({x: x, y: y - 1});
        if (x < consts.level_width - 1) neighbor_list.push({x: x + 1, y: y});
        if (y < consts.level_height - 1) neighbor_list.push({x: x, y: y + 1});
    },

    registerLava: function(x, y, obj) {
        this.level_map[x][y] = {type: 'lava', obj: obj};
    },

    registerIce: function(x, y, obj) {
        this.level_map[x][y] = {type: 'ice', obj: obj};
    },

    registerLavaGen: function(x, y, obj) {
        this.lava_gens.push({x: x, y: y, obj: obj});
    },

    registerIceGen: function(x, y, obj) {
        this.ice_gens.push({x: x, y: y, obj: obj});
    },

    replaceLavaWithIce: function(x, y, lava_obj) {
        addIce(x, y, lava_obj.lava_type); // this registers the ice
        lava_obj.destroy();
    },

    replaceIceWithLava: function(x, y, ice_obj) {
        addLava(x, y, ice_obj.ice_type); // this registers the lava
        ice_obj.destroyPlatformIfExists();
        ice_obj.destroy();
    },

    replaceLavaGenWithIceGen: function(x, y, lava_gen_obj) {
        var ice_gen_obj = addIceGen(x, y);
        this.ice_gens.push({x: x, y: y, obj: ice_gen_obj});
        lava_gen_obj.destroy();
        // this.lava_gens is going to be cleared anyway
    },

    replaceIceGenWithLavaGen: function(x, y, ice_gen_obj) {
        var lava_gen_obj = addLavaGen(x, y);
        this.lava_gens.push({x: x, y: y, obj: lava_gen_obj});
        ice_gen_obj.destroy();
        // this.ice_gens is going to be cleared anyway
    },

    onFloodFillIceToLava: function(generation, current_positions) {
        if (this.generation != generation) {
            return;
        }

        var next_positions = [];

        for (var idx in current_positions) {
            var pos = current_positions[idx];
            var thing = this.level_map[pos.x][pos.y];
            if (thing == null) continue;
            if (thing.type != 'ice') continue;
            this.replaceIceWithLava(pos.x, pos.y, thing.obj);

            this.fillNeighbors(pos.x, pos.y, next_positions);
        }

        if (next_positions.length > 0) {
            setTimeout(function() {
                LavaAndIceManager.onFloodFillIceToLava(generation, next_positions);
            }, consts.ice_lava_flood_fill_timeout);
        }
    },

    onFloodFillLavaToIce: function(generation, current_positions) {
        if (this.generation != generation) {
            return;
        }

        var next_positions = [];

        for (var idx in current_positions) {
            var pos = current_positions[idx];
            var thing = this.level_map[pos.x][pos.y];
            if (thing == null) continue;
            if (thing.type != 'lava') continue;
            this.replaceLavaWithIce(pos.x, pos.y, thing.obj);

            this.fillNeighbors(pos.x, pos.y, next_positions);
        }

        if (next_positions.length > 0) {
            setTimeout(function() {
                LavaAndIceManager.onFloodFillLavaToIce(generation, next_positions);
            }, consts.ice_lava_flood_fill_timeout);
        }
    },

    iceShrineTouched: function() {
        if (!this.lava_gens) return;

        // Go through all the lava gens and turn them into ice gens
        var initial_positions = [];
        for (var idx in this.lava_gens) {
            var lava_gen_info = this.lava_gens[idx];
            this.replaceLavaGenWithIceGen(lava_gen_info.x, lava_gen_info.y, lava_gen_info.obj);
            this.fillNeighbors(lava_gen_info.x, lava_gen_info.y, initial_positions);
        }

        // No more lava gens!
        this.lava_gens = [];

        // Start flood-filling
        if (initial_positions.length > 0) {
            setTimeout(function() {
                LavaAndIceManager.onFloodFillLavaToIce(LavaAndIceManager.generation, initial_positions);
            }, consts.ice_lava_flood_fill_timeout);
        }
    },

    lavaShrineTouched: function() {
        if (!this.ice_gens) return;

        // Go through all the ice gens and turn them into lava gens
        var initial_positions = [];
        for (var idx in this.ice_gens) {
            var ice_gen_info = this.ice_gens[idx];
            this.replaceIceGenWithLavaGen(ice_gen_info.x, ice_gen_info.y, ice_gen_info.obj);
            this.fillNeighbors(ice_gen_info.x, ice_gen_info.y, initial_positions);
        }

        // No more ice gens!
        this.ice_gens = [];

        // Start flood-filling
        if (initial_positions.length > 0) {
            setTimeout(function() {
                LavaAndIceManager.onFloodFillIceToLava(LavaAndIceManager.generation, initial_positions);
            }, consts.ice_lava_flood_fill_timeout);
        }
    }
};

function initComponents()
{
    Crafty.c('FullScreenImage', {
        init: function() {
            // Scale
            Crafty.viewport.scale(game_state.zoom_out_level);

            // Center
            this.shift((game_state.crafty_width / game_state.zoom_out_level - this.w) / 2,
                       (game_state.crafty_height / game_state.zoom_out_level - this.h) / 2,
                       0, 0);
        }
    });

    Crafty.c('KeyboardTrapper', {
        init: function() {
            this.addComponent('Keyboard');

            this.bind('KeyDown', this.onKeyDown);
            this.bind('KeyUp', this.onKeyUp);
        },

        // Just an always-present component for trapping keyboard keys
        onKeyDown: function(e) {
            if (game_state.scene_type == 'level' && e.key == Crafty.keys.Z) {
                zoomer.handleZoomPress(true, Crafty.keydown[Crafty.keys.SHIFT]);
            }
            else if (game_state.scene_type == 'intro' && e.key == Crafty.keys.ENTER) {
                Crafty.enterScene('level'); // TODO cutscene
            }
            else if (game_state.scene_type == 'level' && Crafty.keydown[Crafty.keys.SHIFT]) {
                if (e.key == Crafty.keys.N) {
                    //Crafty('ProphetText').refreshText(texts.skip_level);
                    //setTimeout(function() {
                        switchToNextLevel();
                    //}, consts.wait_for_skip);
                }
                else if (e.key == Crafty.keys.W) {
                    //Crafty('ProphetText').refreshText(texts.skip_world);
                    //setTimeout(function() {
                        switchToNextWorld();
                    //}, consts.wait_for_skip);
                }
                else if (e.key == Crafty.keys.P) {
                    switchToPrevLevel();
                }
                else if (e.key == Crafty.keys.R) {
                    Crafty('Prophet').die('dying_in_lava', false, true);
                    Crafty('ProphetText').refreshText(texts.restart_level);
                }
                else if (e.key == Crafty.keys.M) {
                    Crafty.audio.toggleMute();
                }
            }
            else if ((e.key == Crafty.keys.DOWN_ARROW || e.key == Crafty.keys.S) && Crafty('Prophet').vy == 0 && Crafty('Prophet')) {
                var prophet = Crafty('Prophet');
                prophet.vx = 0;
                prophet.disableControl();
            }
        },

        onKeyUp: function(e) {
            if (game_state.scene_type == 'level' && e.key == Crafty.keys.Z) {
                zoomer.handleZoomPress(false, false);
            }else if ((e.key == Crafty.keys.DOWN_ARROW || e.key == Crafty.keys.S) && !Crafty('Prophet').dying) {
                if (Crafty('Prophet').NewDirection == 1){
                  Crafty('Prophet').animate('stand_right', -1);
                }else {
                    Crafty('Prophet').animate('stand_left', -1);
                }
                Crafty('Prophet').enableControl();
            }
        }
    });

    Crafty.c('FloatingOverProphet', {
        init: function() {
            this.bind('UpdateFrame', this.positionOverProphet);
        },

        positionOverProphet: function() {
            var prophet = Crafty('Prophet');
            this.attr({
                x: prophet.x + (prophet.w - this.w) / 2,
                y: prophet.y - this.h - consts.tile_height / 2
            });
        }
    });

    Crafty.c('AmigaText', {
        init: function() {
            this.addComponent('2D, DOM, Text');
            this.textColor('white');
            this.textFont({family: 'Amiga4ever'});

            var text_shadow = '';
            for (var x = -2; x <= 2; x++) {
                for (var y = -2; y <= 2; y++) {
                    text_shadow += '' + x + 'px ' + y + 'px 0 black, ';
                }
            }
            text_shadow = text_shadow.slice(0, -2);
            this.css('text-shadow', text_shadow);
        }
    });

    Crafty.c('ProphetText', {
        init: function() {
            this._size = '10px';
            this._guess_size = 15;

            this.addComponent('AmigaText, FloatingOverProphet');
            this.textAlign('center');
            this.z = zorders.prophet_text;
        },

        refreshText: function(text) {
            // Guess the width and height... Too much width is fine since we center it.
            this.attr({w: this._guess_size * text.length, h: this._guess_size});
            this.text(text);
            this.positionOverProphet();

            var prophet_text = this;
            setTimeout(function() {
                if (prophet_text.text() == text) {
                    prophet_text.text('');
                }
            }, consts.prophet_text_timeout);
        }
    });

    Crafty.c('LevelTitleText', {
        init: function() {
            this.addComponent('AmigaText, Keyboard');
            this.textAlign('left');

            this.bind('KeyDown', this.onKeyDown);

            this.key_down = false;
            this.timeout = false;
            this.z = zorders.stage_titles;
        },

        setText: function(text, size, guess_size) {
            this.textFont({size: size});

            // Entire screen as width since it's left-aligned
            this.attr({w: consts.pixel_width, h: guess_size});
            this.text(text);

            var level_title_text = this;
            setTimeout(function() {
                level_title_text.timeout = true;
                level_title_text.checkDestroy();
            }, consts.title_text_timeout);
        },

        onKeyDown: function() {
            this.key_down = true;
            this.checkDestroy();
        },

        checkDestroy: function() {
            if (this.key_down && this.timeout) {
                //this.destroy();
            }
        }
    });

    Crafty.c('Note', {
        init: function() {
            this._size = '8px';
            this._guess_size = 15;

            this.addComponent('AmigaText');
            this.textAlign('left');
            this.textFont({size: this._size});
            this.z = zorders.stage_titles;
        },

        setHelpText: function(text) {
            // Half screen as width since it's left-aligned
            this.attr({w: consts.pixel_width / 2, h: this._guess_size});
            this.text(text);
        }
    });

    Crafty.c('Floor', {
        init: function() {
            this.addComponent('2D, DOM, tile_floor');
            this.z = zorders.walls;
        }
    });

    Crafty.c('Wall', {
        init: function() {
            this.addComponent('2D, DOM, move_blocking_for_m, move_blocking_for_p, move_blocking_for_w');
            this.z = zorders.walls;
        }
    });

    Crafty.c('InvisiblePlatform', {
        init: function() {
            this.addComponent('2D, DOM, gravity_blocking_for_m, gravity_blocking_for_p, gravity_blocking_for_w');
        }
    });

    Crafty.c('MInvisiblePlatform', {
        init: function() {
            this.addComponent('2D, DOM, gravity_blocking_for_w');
        }
    });

    Crafty.c('WInvisiblePlatform', {
        init: function() {
            this.addComponent('2D, DOM, gravity_blocking_for_m, gravity_blocking_for_p');
        }
    });

    Crafty.c('InvisiblePlatformDoor', {
        init: function() {
            this.addComponent('2D, DOM, gravity_blocking_for_w, gravity_blocking_for_m, gravity_blocking_for_p');
            this.linkedDoor = null;
        }
    });

    Crafty.c('OuterWall', {
        init: function() {
            this.addComponent('2D, DOM, move_blocking_for_m, move_blocking_for_p, move_blocking_for_w');
        }
    });

    Crafty.c('OuterCeiling', {
        init: function() {
            this.addComponent('2D, DOM, move_blocking_for_m, move_blocking_for_p, move_blocking_for_w');
        }
    });

    Crafty.c('Lava', {
        init: function() {
            this.addComponent('2D, DOM, tile_lava, SpriteAnimation');
            addReel(this, 'shallow', 14, 0, 5);
            addReel(this, 'deep', 14, 6, 11);
            this.z = zorders.walls;
        },

        setLavaType: function(lava_type) {
            this.animate(lava_type, -1);
            this.lava_type = lava_type;
            return this;
        },
    });

    Crafty.c('Trap', {
        init: function() {
            this.addComponent('2D, DOM, tile_trap, SpriteAnimation');
            addReel(this, 'silent', 14, 13, 13);
            addReel(this, 'deadly', 14, 13, 18);
            addReel(this, 'reverse_deadly', 14, 18, 13);
            this.offsetBoundary(-2, -16, -2, 0);

            this.animate('silent', -1);
            this.bind('AnimationEnd', this.onAnimationCompleted);
            this.is_killing = false;
            this.z = zorders.enemies;
        },

        activate: function() {
            if (!this.is_killing) {
                this.is_killing = true;
                this.animate('deadly', 1);
            }
        },

        onAnimationCompleted: function(data) {
            if (data.id == 'deadly') {
                var trap = this;
                setTimeout(function() {
                    trap.animate('reverse_deadly', 1);
                }, 500);
            }
            else if (data.id == 'reverse_deadly') {
                this.animate('silent', -1);
                this.is_killing = false;
            }
        }
    });

    Crafty.c('Enemy', {
        init: function() {
            this.addComponent('2D, DOM, enemy_stand_right, SpriteAnimation, DirectionalAnimation');
            addReel(this, 'stand_right', 4, 12, 18);
            addReel(this, 'stand_left', 5, 12, 18);
            addReel(this, 'attack_right', 4, 19, 27);
            addReel(this, 'attack_left', 5, 19, 27);
            addReel(this, 'dying_right', 4, 28, 34);
            addReel(this, 'dying_left', 5, 28, 34);
            this.z = zorders.enemies;

            this.bind('AnimationEnd', this.onAnimationFinalized);

            this.attacking = false;
            this.dying = false;
        },

        onAnimationFinalized: function(data) {
            if (data.id == 'dying_right' || data.id == 'dying_left') {
                this.destroy();
            }
            else {
                this.dir_animate('stand', -1);
            }
        },

        attack: function() {
            if (this.attacking) return;
            this.attacking = true;
            this.dir_animate('attack', 1);
        },

        die: function() {
            if (this.dying) return;
            this.dying = true;
            this.dir_animate('dying', 1);
        }
    });

    Crafty.c('Gate', {
        init: function() {
            // TODO: Actually implement this
            this.addComponent('Wall, tile_dgate');
            // addReel(this, 'down_closed', 6, 35, 35);
            // addReel(this, 'down_open', 6, 35, 39);
            // addReel(this, 'down_opened', 6, 39, 39);
            // addReel(this, 'down_close', 6, 39, 35);
            // addReel(this, 'up_closed', 7, 35, 35);
            // addReel(this, 'up_open', 7, 35, 39);
            // addReel(this, 'up_opened', 7, 39, 39);
            // addReel(this, 'up_close', 7, 39, 35);
            // addReel(this, 'left_closed', 10, 35, 35);
            // addReel(this, 'left_open', 10, 35, 39);
            // addReel(this, 'left_opened', 10, 39, 39);
            // addReel(this, 'left_close', 10, 39, 35);
            // addReel(this, 'right_closed', 11, 35, 35);
            // addReel(this, 'right_open', 11, 35, 39);
            // addReel(this, 'right_opened', 11, 39, 39);
            // addReel(this, 'right_close', 1, 39, 35);

            this.z = zorders.enemies;
        },

        setGateType: function(gate_type) {
            // this.animate(gate_type + '_closed', -1);
        },
    });

    Crafty.c('MBlock', {
        init: function() {
            this.addComponent('2D, DOM, tile_mblock, move_blocking_for_w');
            this.z = zorders.walls;
        }
    });

    Crafty.c('WBlock', {
        init: function() {
            this.addComponent('2D, DOM, tile_wblock, move_blocking_for_m, move_blocking_for_p');
            this.z = zorders.walls;
        }
    });

    Crafty.c('Ice', {
        init: function() {
            this.addComponent('2D, DOM, tile_ice, SpriteAnimation, move_blocking_for_m, move_blocking_for_w');
            addReel(this, 'shallow', 14, 21, 21);
            addReel(this, 'deep', 14, 22, 22);
            this.ice_type = null;
            this.associated_platform = null;
            this.z = zorders.walls;
        },

        setIceType: function(ice_type) {
            this.animate(ice_type, -1);
            this.ice_type = ice_type;

            if (ice_type == 'shallow') {
                this.associated_platform = addInvisiblePlatform(this.x / consts.tile_width, this.y / consts.tile_height);
            }

            return this;
        },

        destroyPlatformIfExists: function() {
            if (this.associated_platform != null) {
                this.associated_platform.destroy();
            }
        }
    });

    Crafty.c('LavaGen', {
        init: function() {
            this.addComponent('Lava');
            this.setLavaType('deep');
        }
    });

    Crafty.c('IceGen', {
        init: function() {
            this.addComponent('Ice');
            this.setIceType('deep');
        }
    });

    Crafty.c('IceShrine', {
        init: function() {
            this.addComponent('2D, DOM, tile_iceshrine');
            this.z = zorders.generic_items;
        }
    });

    Crafty.c('LavaShrine', {
        init: function() {
            this.addComponent('2D, DOM, tile_lavashrine');
            this.z = zorders.generic_items;
        }
    });

    Crafty.c('Item', {
        init: function() {
            this.addComponent('2D, DOM');
            this.z = zorders.generic_items;
        }
    });

    Crafty.c('CollectedItem', {
        init: function() {
            this.addComponent('2D, DOM');

            this.prevCollectible = null;
            this.nextCollectible = null;
            this.itemType = null;
            this.z = zorders.inventory_items;
        },

        removeThis: function() {
            if (this.nextCollectible != null) {
                this.nextCollectible.prevCollectible = this.prevCollectible;
            }

            this.prevCollectible = this.nextCollectible;
            this.destroy();
        },

        // direction is -1 or +1, NOT ZERO
        // highOrLow is 1 if should be below the prophet's Y, -1 if should be above
        doMove: function(destX, prevY, direction, highOrLow) {
            this.y = prevY + highOrLow * (consts.tile_height / 2);
            this.x = destX;

            if (this.nextCollectible) {
                this.nextCollectible.doMove(
                    this.x - (direction * (consts.tile_width / 2)),
                    this.y,
                    direction,
                    -1 * highOrLow);
            }
        }
    });

    Crafty.c('Key1', {
        init: function() {
            // TODO: Actually implement this
            this.addComponent('Item, tile_key1');
            this.itemType = 'Key1';
        }
    });

    Crafty.c('CollectedKey1', {
        init: function() {
            this.addComponent('CollectedItem, tile_key1');
        }
    });

    Crafty.c('Door', {
        init: function() {
            this.addComponent('2D, DOM, move_blocking_for_m, move_blocking_for_w, ' +
                'gravity_blocking_for_m, gravity_blocking_for_w, gravity_blocking_for_p, Collision');
            this.invisiblePlatform = null;
        }
    });

    Crafty.c('Door1', {
        init: function() {
            // TODO: Actually implement this
            this.addComponent('Door, tile_door1');
            this.requiredKey = "Key1";
        }
    });

    Crafty.c('Key2', {
        init: function() {
            // TODO: Actually implement this
            this.addComponent('Item, tile_key2');
            this.itemType = 'Key2';
        }
    });

    Crafty.c('CollectedKey2', {
        init: function() {
            this.addComponent('CollectedItem, tile_key2');
        }
    });

    Crafty.c('Door2', {
        init: function() {
            // TODO: Actually implement this
            this.addComponent('Door, tile_door2');
            this.requiredKey = "Key2";
        }
    });

    Crafty.c('Key3', {
        init: function() {
            // TODO: Actually implement this
            this.addComponent('Item, tile_key3');
            this.itemType = 'Key3';
        }
    });

    Crafty.c('CollectedKey3', {
        init: function() {
            this.addComponent('CollectedItem, tile_key3');
        }
    });

    Crafty.c('Door3', {
        init: function() {
            // TODO: Actually implement this
            this.addComponent('Wall, tile_door3');
            this.requiredKey = "Key3";
        }
    });

    Crafty.c('Switch', {
        init: function() {
            // TODO: Actually implement this
            this.addComponent('2D, DOM, tile_switch');
            this.z = zorders.enemies;
        }
    });

    Crafty.c('Amulet', {
        init: function() {
            // TODO: Actually implement this
            this.addComponent('Item, tile_amulet');
            this.itemType = 'Amulet';
        }
    })

    Crafty.c('CollectedAmulet', {
        init: function() {
            this.addComponent('CollectedItem, tile_amulet');
        }
    });

    Crafty.c('DirectionalAnimation', {
        init: function() {
            this.direction = 'right';
            this.new_direction_workaround = false;
            this.disable_movement_animations = false;

            this.bind('NewDirection', this.onNewDirection);
        },

        dir_animate: function(reelId, loopCount) {
            dir_reel_id = reelId + '_' + this.direction;
            this.animate(dir_reel_id, loopCount);
            return dir_reel_id;
        },

        setDirectionFromX: function(x) {
            if (x == 1) {
                this.direction = 'right';
            }
            else if (x == -1) {
                this.direction = 'left';
            }
            // else if (x == 0) keep the previous direction
        },

        onNewDirection: function(direction) {
            if (!this.new_direction_workaround) {
                this.setNewDirection(direction);
            }
        },

        setNewDirection: function(direction) {
            if (this.disable_movement_animations) {
                return;
            }

            this.setDirectionFromX(direction.x);

            if (direction.y == 0) {
                // On the ground
                if (direction.x == 0) {
                    this.dir_animate('stand', -1);
                }
                else {
                    this.dir_animate('walk', -1);
                }
            }
            else {
                // In the air
                if (direction.y == -1) {
                    this.dir_animate('jump', -1);
                }
                else if (direction.y == 1) {
                    this.dir_animate('fall', -1);
                }
            }
        }
    });

    // Character is a component that includes the semantics
    // shared by all characters: Prophets, believers and non-believers.
    // 1. It has animations for standing/walking/jumping/falling/dying.
    // 2. It has gravity.
    // 3. It has a direction (left/right) for animations.
    // 4. It dies when it touches lava or when it touches a trap.
    // NOTE: Due to technical reasons Character does not implement "blocked by wall".
    // Properties: direction
    // Functions: dir_animate (like animate, but adds the direction)
    // Events: Dying (fired when starting to die, after the counter is updated)
    //         Died (fired when the death animation is over)
    // Animations should be defined by derived components:
    // stand, walk, jump, fall, dying_in_lava, dying_in_trap
    // All should be defined with "_left" and "_right"
    Crafty.c('Character', {
        init: function() {
            this.addComponent('2D, DOM, SpriteAnimation, Gravity, Jumper, Collision, DirectionalAnimation');

            this.offsetBoundary(-5, -5, -5, 0);
            this.dying = false;
            this.death_anim = null;

            this.onHit('Lava', this.onTouchLava);
            this.onHit('Trap', this.onTouchTrap);
            this.onHit('IceShrine', function() { LavaAndIceManager.iceShrineTouched(); });
            this.onHit('LavaShrine', function() { LavaAndIceManager.lavaShrineTouched(); });
            this.bind('AnimationEnd', this.onAnimationEnd);

            this.onHit('Item', this.onHitItem);

            this.nextCharacter = null;
            this.prevCharacter = null;

            // Male, female or prophet
            this.type = null;

            this.gender = null; // "m" or "w"
        },

        onHitItem: function(hitDatas) {
            itemType = hitDatas[0].obj.itemType;
            Crafty('Prophet').addCollectible(itemType);
            hitDatas[0].obj.destroy();
        },

        setGender: function(gender) {
            // gender = "m" or "w" or "p" for prophet
            this.gender = gender;
            this.gravity('gravity_blocking_for_' + gender);
        },

        insertBelieverAfterThis: function(believer) {
            believer.prevCharacter = this;
            if (this.nextCharacter) {
                this.nextCharacter.prevCharacter = believer;
                believer.nextCharacter = this.nextCharacter;
            }
            this.nextCharacter = believer;
        },

        removeThisFromCharacterQueue: function() {
            if (this.nextCharacter) {
                this.prevCharacter.nextCharacter = this.nextCharacter;
                this.nextCharacter.prevCharacter = this.prevCharacter;
            } else {
                this.prevCharacter.nextCharacter = null;
            }
        },

        die: function(death_anim, allow_falling, skip_counter) {
            if (this.dying) {
                return;
            }
            this.disableControl();
            this.dying = true;
            this.disable_movement_animations = true;
            this.vx = 0;
            prev_vy = this.vy;
            if (this.has('TrueBeliever')) {
                this.removeThisFromCharacterQueue();
            }
            this.removeComponent('Multiway'); // If we could walk, don't walk anymore
            if (allow_falling) {
                // work around bug(?) in Crafty - vy is reset even though we're falling
                this.vy = prev_vy;
            }
            else {
                this.removeComponent('Jumper');   // Don't jump/fall anymore
                this.removeComponent('Gravity');  // Don't fall anymore
                this.resetMotion();
            }

            if (!skip_counter) {
                Crafty('Counter').increment();
            }

            this.death_anim = this.dir_animate(death_anim, 1);
            this.trigger('Dying');
        },

        onTouchLava: function(hitData, isFirstTouch) {
            if (this.typeStr && isFirstTouch) {
                Crafty.audio.play(this.typeStr + '-lava');
            }
            this.die('dying_in_lava', false, false);
        },

        onTouchTrap: function(hitData) {
            if (!this.dying) {
                for (var trap_idx in hitData) {
                    var trap = hitData[trap_idx].obj;
                    trap.activate();
                }
                this.die('dying_in_trap', true, true);
            }
        },

        onAnimationEnd: function(data) {
            if (data.id == this.death_anim) {
                this.visible = false;
                var character = this;
                setTimeout(function() {
                    character.trigger('Died');
                }, consts.wait_for_death);
            }
        }
    });

    // NewDirectionWorkaround is needed for true believers, which move horizontally by
    // "shifting" and vertically by gravity. Since horizontal movement is not controlled
    // by the Motion component, the NewDirection event "direction.x" is always 0.
    // Here, we allow external users to call setNewDirection with the correct direction.x.
    Crafty.c('NewDirectionWorkaround', {
        init: function() {
            this.last_direction = {x: 0, y: 0};
            this.new_direction_workaround = true;
            this.bind('NewDirection', this.onNewDirectionWorkaround);
        },

        onNewDirectionWorkaround: function(direction) {
            // direction.x is unreliable, only look at direction.y
            if (this.last_direction.y != direction.y) {
                this.last_direction.y = direction.y;
                this.setNewDirection(this.last_direction);
            }
        },

        setNewDirectionX: function(x) {
            // x should be -1, 0 or 1
            if (this.last_direction.x != x) {
                this.last_direction.x = x;
                this.setNewDirection(this.last_direction);
            }
        }
    });

    // HasConvertingPowers is a base component for characters that can convert nonbelievers.
    // (Prophets and TrueBelievers share this)
    // Character should define animations: converting_right, converting_left
    // Events: ConversionStarted, ConversionEnded
    Crafty.c('HasConvertingPowers', {
        init: function() {
            this.onHit('Unbeliever', this.collisionUnbeliever);
            this.bind('AnimationEnd', this.onAnimationConcluded);
            this.bind('NewDirection', this.convertingPowersNewDirection);

            this.can_convert = true;  // only if I'm standing on the ground
            this.converting = false;
            this.converting_anim = null;
        },

        convertingPowersNewDirection: function(direction) {
            this.can_convert = (direction.y == 0);
        },

        startConvertingAnimation: function() {
            if (this.converting || !this.can_convert) {
                return false;
            }

            this.converting = true;
            this.disable_movement_animations = true;
            this.converting_anim = this.dir_animate('converting', 1);
            this.trigger('ConversionStarted');
            return true;
        },

        collisionUnbeliever: function(hitData) {
            if (!this.startConvertingAnimation()) {
                return;
            }

            var collidedUnbeliever = hitData[0].obj;
            var self = this;
            collidedUnbeliever.trulyBelieve(function(trueBeliever) {
                self.insertBelieverAfterThis(trueBeliever);
            });
        },

        onAnimationConcluded: function(data) {
            if (data.id == this.converting_anim) {
                this.converting = false;
                this.disable_movement_animations = false;
                this.dir_animate('stand', -1);
                this.trigger('ConversionEnded');
            }
        }
    });

    Crafty.c('Prophet', {
        init: function() {
            this.addComponent('Character, HasConvertingPowers, prophet_stand_right, Multiway');
            this.setGender('p');
            addReel(this, 'stand_right', 0, 0, 9);
            addReel(this, 'walk_right', 0, 10, 16);
            addReel(this, 'jump_right', 0, 17, 17);
            addReel(this, 'fall_right', 0, 18, 18);
            addReel(this, 'converting_right', 0, 19, 28);
            addReel(this, 'dying_in_trap_right', 0, 29, 37);
            addReel(this, 'dying_in_lava_right', 2, 0, 32);
            addReel(this, 'start_casting_right', 4, 0, 3);
            addReel(this, 'casting_right', 4, 4, 11);
            addReel(this, 'stand_left', 1, 0, 9);
            addReel(this, 'walk_left', 1, 10, 16);
            addReel(this, 'jump_left', 1, 17, 17);
            addReel(this, 'fall_left', 1, 18, 18);
            addReel(this, 'converting_left', 1, 19, 28);
            addReel(this, 'dying_in_trap_left', 1, 29, 37);
            addReel(this, 'dying_in_lava_left', 3, 0, 32);
            addReel(this, 'start_casting_right', 5, 0, 3);
            addReel(this, 'casting_right', 5, 4, 11);
            this.dir_animate('stand', -1);
            this.setupMovement();

            this.z = zorders.prophet;

            this.onHit('move_blocking_for_' + this.gender, this.onHitMoveBlocking);
            this.bind('NewDirection', this.prophetNewDirection);
            this.bind('ConversionStarted', this.onConversionStarted);
            this.bind('ConversionEnded', this.onConversionEnded);
            this.bind('Dying', this.onProphetDying);
            this.bind('Died', this.onProphetDied);
            this.bind('CheckLanding', this.onCheckLanding);
            this.onHit('Enemy', this.onHitEnemy);

            this.bind('Move', this.onMove);

            this.onHit('Door', this.onHitDoor);

            this.num_dying_believers = 0;
            this.winning = false;

            this.typeStr = 'Prophet';

            this.nextCollectible = null;
        },

        setupMovement: function() {
            this.multiway({x: consts.prophet_walk_speed},
                {RIGHT_ARROW: 0,
                 LEFT_ARROW: 180,
                 D: 0,
                 A: 180});
            this.jumper(consts.prophet_jump_speed,
                [Crafty.keys.UP_ARROW, Crafty.keys.W]);
        },

        _handleDoor: function(door) {
            if (this.findItem(door.requiredKey)) {
                door.destroy();
                if (door.invisiblePlatform != null) {
                    door.invisiblePlatform.destroy();
                }
                return true;
            } else { // Block movement - copied from onHitMoveBlocking
                // Black magic.
                this.x -= this.dx;
                this.x = Math.round(this.x);
                if (this.vy < 0) { // Still touching block, and jumping
                    this.y -= this.dy;
                    this.y = Math.floor(this.y) - 1;
                    this.vy = 0;
                } else if (this.vy == 0) {
                    this.y = Math.floor(this.y) - 1;
                }
            }
            return false;
        },

        onCheckLanding: function(ground) {
            if (ground.has('InvisiblePlatformDoor')) {
                if (this._handleDoor(ground.door)) {
                    ground.destroy();
                }
            }
        },

        findItem: function(itemType) {
            x = this.nextCollectible;
            while (x != null) {
                if (x.itemType == itemType) {
                    return true;
                }
                x = x.nextCollectible;
            }
            return false;
        },

        onHitDoor: function(hitDatas) {
            this._handleDoor(hitDatas[0].obj);
        },

        onMove: function() {
            if (this.nextCollectible != null) {
                direction = -1;
                if (this.vx >= 0) {
                    direction = 1;
                }
                this.nextCollectible.doMove(
                    this.x - direction * (consts.tile_width),
                    this.y,
                    direction,
                    -1);
            }
        },

        addCollectible: function(itemType) {
            var x = this;
            var preceding_x = x.x;
            while (x.nextCollectible != null) {
                x = x.nextCollectible;
                preceding_x = x.x;
            }

            var new_x = preceding_x + consts.tile_width + consts.tile_width / 2;
            if (Math.sign(this.vx) >= 0) {
                new_x = preceding_x - consts.tile_width - consts.tile_width / 2;
            }
            var collectible = Crafty.e('Collected' + itemType)
                .attr({
                    x: new_x,
                    y: this.y,
                    w: consts.tile_width,
                    h: consts.tile_height,
                    itemType: itemType
                });

            x.nextCollectible = collectible;
            collectible.prevCollectible = x;
        },

        onHitMoveBlocking: function(hitData) {
            // Black magic.
            this.x -= this.dx;
            this.x = Math.round(this.x);
            if (this.hit('move_blocking_for_' + this.gender) && this.vy < 0) { // Still touching block, and jumping
                this.y -= this.dy;
                this.y = Math.floor(this.y) - 1;
                this.vy = 0;
            }else if (this.vy == 0) {
                this.y = Math.floor(this.y) - 1;
            }
        },

        prophetNewDirection: function(direction) {
            // if we stopped on the x scale, let the believers know that we stopped
            // (part of new direction workaround)
            if (direction.x == 0) {
                for (var idx in this.believers) {
                    var believer = this.believers[idx];
                    believer.setNewDirectionX(0);
                }
            }
        },

        onConversionStarted: function() {
            // Stop being able to walk and jump
            this.removeComponent('Multiway');
            this.removeComponent('Jumper');
        },

        onConversionEnded: function() {
            // Resume being able to walk and jump
            this.addComponent('Multiway');
            this.addComponent('Jumper');
            this.setupMovement();
        },

        onProphetDying: function() {
            Crafty('ProphetText').refreshText(this.winning ? texts.oops : texts.lose);
        },

        onProphetDied: function() {
            restartLevel();
        },

        onHitEnemy: function(hitDatas) {
            var enemy = hitDatas[0].obj;
            if (this.x < enemy.x) {
                enemy.direction = 'left';
            }
            else {
                enemy.direction = 'right';
            }

            enemy.attack();
            this.die('dying_in_trap', true, true);
        }
    });

    Crafty.c('Unbeliever', {
        init: function() {
            this.addComponent('Character, unbeliever_stand_right');
            this.offsetBoundary(-3, 0, -3, 0);
            this.z = zorders.believers;

            this.jumper(consts.believer_jump_speed, []);

            this.being_converted = false;
            this.being_converted_anim = null;
            this.being_converted_cb = null;

            this.bind('AnimationEnd', this.onAnimationFinished);
        },

        trulyBelieve: function(callback) {
            if (this.being_converted) {
                return;
            }

            if (this.typeStr) {
                Crafty.audio.play(this.typeStr + '-converted');
            }
            this.being_converted = true;
            this.being_converted_cb = callback;
            this.being_converted_anim = this.dir_animate('being_converted');
        },

        onAnimationFinished: function(data) {
            if (data.id == this.being_converted_anim) {
                var trueBeliever = Crafty.e('TrueBeliever' + this.believer_type)
                    .attr({x: this.x,
                           y: this.y,
                           w: consts.tile_width,
                           h: consts.tile_height
                          });
                trueBeliever.direction = this.direction;
                trueBeliever.dir_animate('stand', -1);
                this.destroy();
                this.being_converted_cb(trueBeliever);
            }
        }
    });

    // Male unbeliever
    Crafty.c('Unbeliever1', {
        init: function() {
            this.addComponent('Unbeliever');
            this.setGender('m');
            // Unbelievers can't fall, but Gravity triggers a fall direction for new
            // entities before it figures out that they're on the ground.
            // So we have to make fall animations which are just copies of stand animations.
            addReel(this, 'stand_right', 6, 0, 6);
            addReel(this, 'fall_right', 6, 0, 6); // copy stand animation
            addReel(this, 'being_converted_right', 6, 7, 15);
            addReel(this, 'stand_left', 7, 0, 6);
            addReel(this, 'fall_left', 7, 0, 6); // copy stand animation
            addReel(this, 'being_converted_left', 7, 7, 15);

            this.believer_type = 1;

            this.typeStr = 'Male';
        }
    });

    // Female unbelievers
    Crafty.c('Unbeliever2', {
        init: function() {
            this.addComponent('Unbeliever');
            this.setGender('w');
            // Unbelievers can't fall, but Gravity triggers a fall direction for new
            // entities before it figures out that they're on the ground.
            // So we have to make fall animations which are just copies of stand animations.
            addReel(this, 'stand_right', 10, 0, 6);
            addReel(this, 'fall_right', 10, 0, 6); // copy stand animation
            addReel(this, 'being_converted_right', 10, 7, 15);
            addReel(this, 'stand_left', 11, 0, 6);
            addReel(this, 'fall_left', 11, 0, 6); // copy stand animation
            addReel(this, 'being_converted_left', 11, 7, 15);

            this.believer_type = 2;

            this.typeStr = 'Female';
        }
    });

    Crafty.c('TrueBeliever', {
        init: function() {
            this.addComponent('Character, HasConvertingPowers, NewDirectionWorkaround, true_believer_stand_right');
            this.z = zorders.believers;

            this.jumper(consts.believer_jump_speed, []);
            this.bind('Dying', this.onTrueBelieverDying);
            this.bind('Died', this.onTrueBelieverDied);

            this.onHit('Enemy', this.onHitEnemy);

            this.bind('EnterFrame', this.beforeEnterFrame);

            this.nextCharacter = null;
            this.prevCharacter = null;
        },

        onHitEnemy: function(hitDatas) {
            var enemy = hitDatas[0].obj;
            if (this.x < enemy.x) {
                enemy.direction = 'left';
            }
            else {
                enemy.direction = 'right';
            }

            enemy.die();
            this.startConvertingAnimation();
        },

        beforeEnterFrame: function(data) {
            // Handle falls
            if (this.vy != 0) {
                // Don't move on x axis while falling
                return;
            }

            if (this.converting || this.dying) {
                // Don't move while converting or dying
                return;
            }

            var prevCharX = this.prevCharacter.x;
            var actual_speed = consts.believer_walk_speed * data.dt * 0.0001;
            var prev_x = this.x;

            actual_gap = consts.follow_x_gap_px + consts.tile_width;
            if (Crafty.s('Keyboard').isKeyDown('DOWN_ARROW')  && Crafty('Prophet').vy == 0) {
                actual_gap = actual_speed;
                if (actual_gap > 0){
                    Crafty('Prophet').animate('casting_right', -1);
                }
            }
            if (this.x < prevCharX - actual_gap) {
                this.shift(actual_speed, 0, 0, 0);
                // TODO(yoni): fix animations
                this.setNewDirectionX(1);
            } else if (this.x > prevCharX + actual_gap) {
                this.shift(-1 * actual_speed, 0, 0, 0);
                this.setNewDirectionX(-1);
            } else {
                this.setNewDirectionX(0);
            }

            if (hitDatas = this.hit('move_blocking_for_' + this.gender)) {
                this.x = prev_x;
                this.setNewDirectionX(0);
            }
        },

        checkIfStillWallBlocked: function(prophetX) {
            // Basically, check if the prophet is nearby to "reactivate" believer
            if (Math.abs(prophetX - this.x) <= (consts.tile_width / 2)) {
                this.blocked_by_wall = false;
                return false;
            }

            return true;
        },

        onTrueBelieverDying: function() {
            var prophet = Crafty('Prophet');
            prophet.num_dying_believers++;
            var win_lose = checkWinLoseConditions(true);

            if (win_lose == 'win') {
                Crafty('ProphetText').refreshText(texts.win);
                prophet.winning = true;

            }
            else if (win_lose == 'lose') {
                Crafty('ProphetText').refreshText(texts.lose);
            }
        },

        onTrueBelieverDied: function() {
            Crafty('Prophet').num_dying_believers--;
            this.destroy();
            var win_lose = checkWinLoseConditions(false);

            if (win_lose == 'win') {
                switchToNextLevel();
            }
            else if (win_lose == 'lose') {
                restartLevel();
            }
        }
    });

    Crafty.c('TrueBeliever1', {
        init: function() {
            this.addComponent('TrueBeliever');
            this.setGender('m');
            addReel(this, 'stand_right', 6, 16, 22);
            addReel(this, 'walk_right', 6, 23, 27);
            addReel(this, 'converting_right', 6, 28, 36);
            addReel(this, 'fall_right', 6, 37, 37);
            addReel(this, 'dying_in_lava_right', 8, 0, 20);
            addReel(this, 'dying_in_trap_right', 8, 21, 27);
            addReel(this, 'dying_in_zap_right', 8, 28, 35);
            addReel(this, 'stand_left', 7, 16, 22);
            addReel(this, 'walk_left', 7, 23, 27);
            addReel(this, 'converting_left', 7, 28, 36);
            addReel(this, 'fall_left', 7, 37, 37);
            addReel(this, 'dying_in_lava_left', 9, 0, 20);
            addReel(this, 'dying_in_trap_left', 9, 21, 27);
            addReel(this, 'dying_in_zap_left', 9, 28, 35);

            this.typeStr = 'Male';
        }
    });

    Crafty.c('TrueBeliever2', {
        init: function() {
            this.addComponent('TrueBeliever');
            this.setGender('w');
            addReel(this, 'stand_right', 10, 16, 22);
            addReel(this, 'walk_right', 10, 23, 27);
            addReel(this, 'converting_right', 10, 28, 36);
            addReel(this, 'fall_right', 10, 37, 37);
            addReel(this, 'dying_in_lava_right', 12, 0, 20);
            addReel(this, 'dying_in_trap_right', 12, 21, 27);
            addReel(this, 'dying_in_zap_right', 12, 28, 35);
            addReel(this, 'stand_left', 11, 16, 22);
            addReel(this, 'walk_left', 11, 23, 27);
            addReel(this, 'converting_left', 11, 28, 36);
            addReel(this, 'fall_left', 11, 37, 37);
            addReel(this, 'dying_in_lava_left', 13, 0, 20);
            addReel(this, 'dying_in_trap_left', 13, 21, 27);
            addReel(this, 'dying_in_zap_left', 13, 28, 35);

            this.typeStr = 'Female';
        }
    });

    Crafty.c('Counter', {
        init: function() {
            this.orig_size = '10px';
            this.enlarged_size = '16px';

            this.addComponent('AmigaText');
            this.textAlign('center');
            this.textFont({size: this.orig_size});

            this.total = 0;
            this.count = 0;
            this.z = zorders.stage_titles;
        },

        setTotal: function(total) {
            this.total = total;
            this.refreshText();
        },

        increment: function() {
            this.count++;

            setTimeout(function() {
                var counter = Crafty('Counter');
                counter.refreshText();
                counter.blowUp();
            }, 150);

        },

        refreshText: function() {
            this.text('' + this.count + ' / ' + this.total);
        },

        blowUp: function() {
            this.css({
                'font-size': this.enlarged_size,
                transition: 'font-size 0.3s'
            });
            var obj = this;
            setTimeout(function() {
                Crafty('Counter').css({
                    'font-size': obj.orig_size,
                    transition: 'font-size 0.3s'
                });
            }, 300);
        }
    });
}

function switchToNextLevel()
{
    if (game_state.cur_level + 1 == worlds[game_state.cur_world].stages.length) {
        if (game_state.cur_world + 1 == worlds.length) {
            return;
        }

        game_state.cur_level = 0;
        game_state.cur_world++;
    } else {
        game_state.cur_level++;
    }
    Crafty.enterScene('level');
}

function switchToNextWorld()
{
    if (game_state.cur_world + 1 == worlds.length) {
        return;
    }
    game_state.cur_level = 0;
    game_state.cur_world++;
    Crafty.enterScene('level');
}

function switchToPrevLevel()
{
    if (game_state.cur_level == 0) {
        if (game_state.cur_world == 0) {
            return;
        }

        game_state.cur_world--;
        game_state.cur_level = worlds[game_state.cur_world].stages.length - 1;
    } else {
        game_state.cur_level--;
    }
    Crafty.enterScene('level');
}

function restartLevel()
{
    Crafty.enterScene('level');
}

function checkWinLoseConditions(allow_dying_believers)
{
    var prophet = Crafty('Prophet');
    var trueBelievers = Crafty('TrueBeliever');
    var counter = Crafty('Counter');
    var num_believers = trueBelievers.length;

    if (prophet.dying) {
        // Prophet died, possibly after a win condition.
        // Fail after he finishes dying (the prophet will restart).
        return null;
    }

    // Dismiss dying believers
    if (allow_dying_believers) {
        num_believers -= prophet.num_dying_believers;
    }

    // Win condition: Count reached total, and no remaining believers
    if (counter.count == counter.total && num_believers == 0) {
        return 'win';
    }

    // Lose condition, besides the prophet dying (treated by the prophet itself):
    // Counter is too high.
    if (counter.count > counter.total) {
        return 'lose';
    }

    // Neither win nor lose
    return null;
}

function createNonLevelEntities()
{
    Crafty.e('KeyboardTrapper');
}

function initGame()
{
    game_state.crafty_width = Math.round(window.innerWidth * consts.full_screen_ratio);
    game_state.crafty_height = Math.round(window.innerHeight * consts.full_screen_ratio);
    game_state.zoom_out_level = Math.min(game_state.crafty_width / consts.pixel_width,
                                         game_state.crafty_height / consts.pixel_height);

    Crafty.init(game_state.crafty_width, game_state.crafty_height,
                document.getElementById('game'));
    Crafty.pixelart(true);
    Crafty.viewport.bounds = {
        min: {x:0, y:0},
        max: {x: consts.level_width * consts.tile_width,
              y: consts.level_height * consts.tile_height}
            };

    initScenes(); // Needed for loading scene
    Crafty.enterScene('loading');
}

initGame();
