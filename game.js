var assets = function() {
    var sprite_map = {
        prophet_stand_right: [0, 0],
        unbeliever_stand_right: [0, 8],
        true_believer_stand_right: [16, 8],
        tile_lava: [0, 16],
        tile_target: [16, 37],
        tile_floor: [12, 16],
        tile_trap: [13, 16],
        enemy_stand_right: [0, 6],
        tile_dgate: [35, 10],
        tile_mblock: [19, 16],
        tile_wblock: [20, 16],
        tile_ice: [21, 16],
        tile_iceshrine: [24, 16],
        tile_lavashrine: [25, 16],
        tile_key1: [26, 16],
        tile_door1: [27, 16],
        tile_key2: [28, 16],
        tile_door2: [29, 16],
        tile_key3: [30, 16],
        tile_door3: [31, 16],
        tile_switch: [32, 16],
        tile_amulet: [33, 16],
        tile_lightning1: [34, 16],
        tile_lightning2: [35, 16],
        tile_lightning3: [36, 16],
    };

    for (var row = 0; row < 5; row++) {
        for (var col = 0; col < 40; col++) {
            var wall_num = row * 40 + col;
            var wall_pos = [col, row + 17];
            sprite_map['tile_Wall' + wall_num] = wall_pos;
        }
    }

    return {
        "sprites": {
            "assets/SpriteMap.png": {
                tile: 32,
                tileh: 32,
                map: sprite_map
            },
            "assets/gfx/cutscenes/intro/intro_animation.png": {
                tile: 960,
                tileh: 640,
                map:  {
                    intro_animation: [0,0]
                }
            }
        },
        "images": [
            'assets/gfx/bg-intro.png',
            'assets/gfx/bg-world1.png',
            'assets/gfx/bg-world2.png',
            'assets/gfx/bg-world3.png',
            'assets/gfx/bg-world4.png',
            'assets/gfx/bg-world5.png',
            'assets/gfx/cutscenes/intro/Background.png',
            'assets/gfx/cutscenes/intro2/bg-beach_intro.png',
            'assets/gfx/cutscenes/intro2/animation.gif',
            'assets/gfx/cutscenes/transitions/w1-intro.gif',
            'assets/gfx/cutscenes/transitions/w2-intro.gif',
            'assets/gfx/cutscenes/transitions/w3-intro.gif',
            'assets/gfx/cutscenes/transitions/w4-intro.gif',
            'assets/gfx/cutscenes/transitions/w5-intro.gif',
            'assets/gfx/endscreen.png',
            'assets/gfx/credits.gif',
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
            "lightning": ["assets/sound_fx/lightning.mp3"],
            // SFX - level
            "Win-signal": ["assets/sound_fx/win_signal.mp3"],
            "lava-freeze": ["assets/sound_fx/lava_freeze.mp3"],
            "lava-unfreeze": ["assets/sound_fx/lava_unfreeze.mp3"],
            "door": ["assets/sound_fx/door.mp3"],
            "item-picked-up": ["assets/sound_fx/item_picked_up.mp3"],
            // Cutscenes
            'intro-cutscene-sound': ['assets/voices/opening.mp3'],
            'w1-intro': ['assets/voices/world1.mp3'],
            'w2-intro': ['assets/voices/world2.mp3'],
            'w3-intro': ['assets/voices/world3.mp3'],
            'w4-intro': ['assets/voices/world4.mp3'],
            'w5-intro': ['assets/voices/world5.mp3'],
            'ending'  : ['assets/voices/end.mp3'],
            'epic_win': ['assets/music/epic_win.mp3']
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
    inventory_gap_y: 10,
    lightning_target_gap: 3,
    // How long lightning stays on the screen
    lightning_duration_ms: 500,
    // How long the X button must be held for divine fury to be unleashed
    lightning_delay_ms: 1750,
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
	restart_last_level: 'This is not the way...',
    skip_level: 'Coward.',
    skip_world: 'Wuss.',
    not_enough_remaining: 'Not enough people remaining!',
    too_many_followers: 'Too many followers!'
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

function addLeftRightReels(entity, anim_name_base, row_base, first_col, last_col)
{
    addReel(entity, anim_name_base + '_right', row_base,     first_col, last_col);
    addReel(entity, anim_name_base + '_left',  row_base + 1, first_col, last_col);
}

function addEntity(entity_type, tiles_x, tiles_y, tile_type)
{
    var obj = Crafty.e(entity_type, tile_type)
        .attr({x: tiles_x * consts.tile_width,
            y: tiles_y * consts.tile_height,
            w: consts.tile_width,
            h: consts.tile_height});
    return obj
}

function addInvisiblePlatform(tiles_x, tiles_y)
{
    return addEntity('InvisiblePlatform', tiles_x, tiles_y).attr({h: 0});
}

function addLava(tiles_x, tiles_y, lava_type)
{
    var lava_obj = addEntity('Lava', tiles_x, tiles_y).setLavaType(lava_type);
    LavaAndIceManager.registerLava(tiles_x, tiles_y, lava_obj);
    LightningManager.add_object(tiles_x, tiles_y, 'Lava', lava_obj);
    return lava_obj;
}

function addIce(tiles_x, tiles_y, ice_type)
{
    var ice_obj = addEntity('Ice', tiles_x, tiles_y).setIceType(ice_type);
    LavaAndIceManager.registerIce(tiles_x, tiles_y, ice_obj);
    LightningManager.add_object(tiles_x, tiles_y, 'Ice', ice_obj);
    return ice_obj;
}

function addLavaGen(tiles_x, tiles_y)
{
    var lava_gen = addEntity('LavaGen', tiles_x, tiles_y);
    LavaAndIceManager.registerLavaGen(tiles_x, tiles_y, lava_gen);
    LightningManager.add_object(tiles_x, tiles_y, 'LavaGen', lava_gen);
    return lava_gen;
}

function addIceGen(tiles_x, tiles_y)
{
    var ice_gen = addEntity('IceGen', tiles_x, tiles_y);
    LavaAndIceManager.registerIceGen(tiles_x, tiles_y, ice_gen);
    LightningManager.add_object(tiles_x, tiles_y, 'IceGen', ice_gen);
    return ice_gen;
}

function defineCutscene(scene_name, next_scene, msecs, properties) {
    Crafty.defineScene(scene_name, function() {
        game_state.scene_type = 'cutscene';

        var end_cutscene = function() {
            game_state.cutscene_timer.cancelDelay(game_state.end_cutscene);
            if(properties['audio'])
                Crafty.audio.stop(properties['audio']);
            Crafty.enterScene(next_scene);
        }
        game_state.end_cutscene = end_cutscene;

        if(properties['background'])
            Crafty.e('2D, DOM, Image').image(properties['background']).addComponent('FullScreenImage');

        if(properties['gif'])
            Crafty.e('2D, DOM, Image').image(properties['gif']).addComponent('FullScreenImage');

        if(properties['audio'])
            Crafty.audio.play(properties['audio']);

        game_state.cutscene_timer = Crafty.e("Delay").delay(game_state.end_cutscene, msecs, 0);

    });
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
            var obj = addEntity('Wall', tiles_x, tiles_y, floorType);
            LightningManager.add_object(tiles_x, tiles_y, 'Wall', obj);
            return obj;
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
            LightningManager.add_object(tiles_x, tiles_y, 'Enemy', enemy);
            return enemy;
        }

        function addGate(tiles_x, tiles_y, gate_type)
        {
            var obj = addEntity('Gate', tiles_x, tiles_y).setGateType(gate_type);
            LightningManager.add_object(tiles_x, tiles_y, 'Gate', obj);
            return obj;
        }

        function addMBlock(tiles_x, tiles_y)
        {
            var obj = addEntity('MBlock', tiles_x, tiles_y);
            LightningManager.add_object(tiles_x, tiles_y, 'MBlock', obj);
            return obj;
        }

        function addWBlock(tiles_x, tiles_y)
        {
            var obj = addEntity('WBlock', tiles_x, tiles_y);
            LightningManager.add_object(tiles_x, tiles_y, 'WBlock', obj);
            return obj;
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
            LightningManager.add_object(tiles_x, tiles_y, door_type, door);
            return door;
        }

        function addDeepDoor(tiles_x, tiles_y, door_type)
        {
            var obj = addEntity(door_type, tiles_x, tiles_y);
            LightningManager.add_object(tiles_x, tiles_y, door_type, obj);
            return obj;
        }

        function addKey2(tiles_x, tiles_y)
        {
            var obj = addEntity('Key2', tiles_x, tiles_y);
            LightningManager.add_object(tiles_x, tiles_y, 'Key2', obj);
            return obj;
        }

        function addKey3(tiles_x, tiles_y)
        {
            var obj = addEntity('Key3', tiles_x, tiles_y);
            LightningManager.add_object(tiles_x, tiles_y, 'Key3', obj);
            return obj;
        }

        function addSwitch(tiles_x, tiles_y)
        {
            var obj = addEntity('Switch', tiles_x, tiles_y);
            LightningManager.add_object(tiles_x, tiles_y, 'Switch', obj);
            return obj;
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
            LightningManager.add_object(tiles_x, tiles_y, 'Unbeliever' + type_idx, u);
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
        LightningManager.reset();

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
        Crafty.audio.play('bg-intro', -1, 0.75);
    });

    Crafty.defineScene('intro_cutscene1', function() {
        game_state.scene_type = 'cutscene';
        game_state.end_cutscene = function () {
            Crafty.enterScene('intro_cutscene2');
        }

        Crafty.e('2D, DOM, Image')
            .image('assets/gfx/cutscenes/intro/Background.png')
            .addComponent('FullScreenImage');


        Crafty.c('IntroAnimation', {
            init: function() {
                this.addComponent('2D, DOM, SpriteAnimation, intro_animation, FullScreenImage');
                this.reel('IntroAnimation', 2000, 0, 0, 17);
                this.animate('IntroAnimation', 1);
                this.bind('AnimationEnd', this.onAnimationCompleted);
            },

            onAnimationCompleted: function(data) {
                game_state.end_cutscene();
            }
        });
        Crafty.e('IntroAnimation');

    });

    defineCutscene('intro_cutscene2', 'w0-intro', 61200, {
        'background': 'assets/gfx/cutscenes/intro2/bg-beach_intro.png',
        'gif': 'assets/gfx/cutscenes/intro2/animation.gif',
        'audio': 'intro-cutscene-sound',
    });

    var intro_sounds_secs = [10.422833, 11.546083, 14.497958, 11.232625, 14.053875]

    for(var i=0; i<worlds.length; i++) {
        defineCutscene('w' + i + '-intro', 'level', (intro_sounds_secs[i]-1)*1000, {
            'gif': 'assets/gfx/cutscenes/transitions/w'+(i+1)+'-intro.gif',
            'audio': 'w' + (i+1) + '-intro'
        })
    }

    defineCutscene('ending', 'ending2', 4500, {
        'background': 'assets/gfx/endscreen.png',
        'audio': 'ending',
    });

    defineCutscene('ending2', 'ending2', 1000000, {
        'gif': 'assets/gfx/credits.gif',
        'audio': 'epic_win',
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

var LightningManager = {
    level_map: null, // [tileX][tileY] -> {type: 'wall' etc; 'lightning_blocking': true/false, 'zappable': true/false}
    lightning_blocking_types: ['MBlock', 'WBlock', 'Lava', 'DeepLava', 'LavaGen', 'Ice', 'DeepIce', 'IceGen',
        'Wall', 'Door'],
    zappable_types: ['Character', 'Enemy'],

    reset: function() {
        this.level_map = new Array(consts.level_width);
        for (var i = 0; i < consts.level_width; i++) {
            this.level_map[i] = new Array(consts.level_height);
        }
    },

    _is_lightning_blocking: function(obj) {
        for (x in this.lightning_blocking_types) {
            if (obj.has(this.lightning_blocking_types[x])) {
                return true;
            }
        }
        return false;
    },

    _is_zappable: function(obj) {
        for (x in this.zappable_types) {
            if (obj.has(this.zappable_types[x])) {
                // Hack to get around Crafty.destroy() not deleting objects from memory.
                // A destroyed object still exists but loses its mapping in Crafty, so we search for the target obj by
                // id to see if it is really zappable. [0] is a quicker method to get the ID.
                if (Crafty(obj[0]).length) {
                    return true;
                } else {
                    // No point in checking other types if this object has already been destroyed.
                    return false;
                }
            }
        }
        return false;
    },

    add_object: function(x, y, type, obj) {
        this.level_map[x][y] = {
            type: type,
            lightning_blocking: this._is_lightning_blocking(obj),
            zappable: this._is_zappable(obj),
            obj: obj
        };
    },

    _find_lightning_target: function(prophetX, prophetDirection) {
        var tile_num = Math.floor(prophetX / consts.tile_width);
        var direction_multiplier = prophetDirection == 'right' ? 1 : -1;
        var tileX = (tile_num + direction_multiplier * consts.lightning_target_gap)

        var tileY;
        for (tileY= 0; tileY < 30; tileY++) {
            cur_tile = this.level_map[tileX][tileY];
            if (!cur_tile) { continue; }

            if (this.level_map[tileX][tileY].lightning_blocking) {
                return {tileX: tileX, tileY: tileY - 1, obj: this.level_map[tileX][tileY].obj};
            }
        }
    },

    show_target: function(prophetX, prophetDirection) {
        this.target_coords = this._find_lightning_target(prophetX, prophetDirection);
        this.target_obj = addEntity('LightningTarget', this.target_coords.tileX, this.target_coords.tileY);
    },

    unshow_target: function() {
        if (this.target_obj) {
            this.target_obj.destroy();
            this.target_obj = undefined;
        }
    },

    zap: function() {
        if (!this.target_coords) {return;}
        // Get all entities along the lightning's path.
        lightning_rect = {
            _x: this.target_coords.tileX * consts.tile_width,
            _y: 0,
            _h: (this.target_coords.tileY + 1) * consts.tile_width,
            _w: consts.tile_width};
        entities = Crafty.map.search(lightning_rect)

        for (idx in entities) {
            if (this._is_zappable(entities[idx])) {
                entities[idx].die('dying_in_zap', true, false);
                if (entities[idx].gender == 'w') {
                    Crafty.audio.play('Female-lava');
                } else {
                    Crafty.audio.play('Male-lava');
                }
            }
        }

        // Draw the lightning.
        var lightningType = 0;
        var lightningList = [];
        Crafty.audio.play('lightning', 1, 0.7);
        for (var tileY=0; tileY<=this.target_coords.tileY; tileY++) {
            lightningList[tileY] = addEntity('Lightning' + (lightningType+1), this.target_coords.tileX, tileY);
            lightningType = (lightningType + 1) % 3;
        }

        // Remove the lightning sprites after the duration.
        setTimeout(function() {
            for (x in lightningList) {
                lightningList[x].destroy();
            }
        }, consts.lightning_duration_ms);
    },
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

    iceShrineTouched: function(touchingEntity) {
        if (!touchingEntity.has('Prophet')) {
            if (hitDatas = Crafty('Prophet').hit('Shrine')) {
                // Don't do anything if this is not a prophet, and the prophet hit a shrine.
                return;
            }
        }

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
            Crafty.audio.play("lava-freeze");
            setTimeout(function() {
                LavaAndIceManager.onFloodFillLavaToIce(LavaAndIceManager.generation, initial_positions);
            }, consts.ice_lava_flood_fill_timeout);
        }
    },

    lavaShrineTouched: function(touchingEntity) {
        if (!touchingEntity.has('Prophet')) {
            if (hitDatas = Crafty('Prophet').hit('Shrine')) {
                // Don't do anything if this is not a prophet, and the prophet hit a shrine.
                return;
            }
        }

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
            Crafty.audio.play("lava-unfreeze");
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
                Crafty.enterScene('intro_cutscene1');
            }
            else if (game_state.scene_type == 'cutscene' && (e.key == Crafty.keys.ENTER || e.key == Crafty.keys.SPACE)) {
                game_state.end_cutscene();
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
                    Crafty.audio.play('Prophet-lava');
                    Crafty('Prophet').die('dying_in_lava', false, true);
					if (worlds[game_state.cur_world].stages[game_state.cur_level].name == '5-10') {
						Crafty('ProphetText').refreshText(texts.restart_last_level);
					} else {
						Crafty('ProphetText').refreshText(texts.restart_level);
					}
                }
                else if (e.key == Crafty.keys.M) {
                    Crafty.audio.toggleMute();
                }
            }
            // Prophet spells (in level, should be standing on the floor)
            else if (game_state.scene_type == 'level' && Crafty('Prophet').vy == 0) {
                if (e.key == Crafty.keys.DOWN_ARROW || e.key == Crafty.keys.S) {
                    Crafty('Prophet').start_casting();
                } else if (e.key == Crafty.keys.X) {
                    Crafty('Prophet').startChargeLightning();
                }
            }
        },

        onKeyUp: function(e) {
            var prophet = Crafty('Prophet');
            if (game_state.scene_type == 'level' && e.key == Crafty.keys.Z) {
                zoomer.handleZoomPress(false, false);
            } else if ((e.key == Crafty.keys.DOWN_ARROW || e.key == Crafty.keys.S) && prophet && !prophet.dying) {
                prophet.stop_casting();
            } else if (e.key == Crafty.keys.X && prophet) {
                prophet.stopChargeLightning();
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
            addReel(this, 'shallow', 16, 0, 5);
            addReel(this, 'deep', 16, 6, 11);
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
            addReel(this, 'silent', 16, 13, 13);
            addReel(this, 'deadly', 16, 13, 18);
            addReel(this, 'reverse_deadly', 16, 18, 13);
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
            this.addComponent('2D, DOM, enemy_stand_right, SpriteAnimation, DirectionalAnimation,' +
                ' MortalCountsForWin');
            addLeftRightReels(this, 'stand', 6, 0, 6);
            addLeftRightReels(this, 'attack', 6, 7, 15);
            addLeftRightReels(this, 'dying', 6, 16, 22);
            addLeftRightReels(this, 'dying_in_zap', 10, 28, 34);
            this.z = zorders.enemies;

            this.bind('AnimationEnd', this.onAnimationFinalized);

            this.attacking = false;
            this.gender = 'm';
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
    });

    Crafty.c('Gate', {
        init: function() {
            // TODO: Actually implement this
            this.addComponent('Wall, tile_dgate');
            // addReel(this, 'down_closed', 8, 35, 35);
            // addReel(this, 'down_open', 8, 35, 39);
            // addReel(this, 'down_opened', 8, 39, 39);
            // addReel(this, 'down_close', 8, 39, 35);
            // addReel(this, 'up_closed', 9, 35, 35);
            // addReel(this, 'up_open', 9, 35, 39);
            // addReel(this, 'up_opened', 9, 39, 39);
            // addReel(this, 'up_close', 9, 39, 35);
            // addReel(this, 'left_closed', 12, 35, 35);
            // addReel(this, 'left_open', 12, 35, 39);
            // addReel(this, 'left_opened', 12, 39, 39);
            // addReel(this, 'left_close', 12, 39, 35);
            // addReel(this, 'right_closed', 13, 35, 35);
            // addReel(this, 'right_open', 13, 35, 39);
            // addReel(this, 'right_opened', 13, 39, 39);
            // addReel(this, 'right_close', 13, 39, 35);

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
            this.addComponent('2D, DOM, tile_ice, SpriteAnimation, move_blocking_for_m, move_blocking_for_w, move_blocking_for_p');
            addReel(this, 'shallow', 16, 21, 21);
            addReel(this, 'deep', 16, 22, 22);
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

    Crafty.c('Shrine', {
        init: function() {
            this.addComponent('2D, DOM');
        }
    });

    Crafty.c('IceShrine', {
        init: function() {
            this.addComponent('Shrine, tile_iceshrine');
            this.z = zorders.generic_items;
        }
    });

    Crafty.c('LavaShrine', {
        init: function() {
            this.addComponent('Shrine, tile_lavashrine');
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

    Crafty.c('Amulet', {
        init: function() {
            this.addComponent('Item, tile_amulet');
            this.itemType = 'Amulet';
        }
    });

    Crafty.c('CollectedAmulet', {
        init: function() {
            this.addComponent('CollectedItem, tile_amulet');
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
    });

    Crafty.c('Lightning', {
        init: function() {
            this.addComponent('2D, DOM');
            this.z = zorders.target_and_lightning;
        }
    });

    Crafty.c('Lightning1', {
        init:function() {
            this.addComponent('Lightning, tile_lightning1');
        }
    });

    Crafty.c('Lightning2', {
        init:function() {
            this.addComponent('Lightning, tile_lightning2');
        }
    });

    Crafty.c('Lightning3', {
        init:function() {
            this.addComponent('Lightning, tile_lightning3');
        }
    });

    Crafty.c('LightningTarget', {
        init: function() {
            this.addComponent('2D, DOM, SpriteAnimation, tile_target');
            addReel(this, 'flash_target', 16, 37, 39);
            this.animate('flash_target', -1);
            this.z = zorders.target_and_lightning
        }
    });

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

    Crafty.c('Mortal', {
        init: function () {
            this.dying = false;

            this.bind('AnimationEnd', this.onAnimationEndForDeath);
        },

        die: function (death_anim, allow_falling, skip_counter) {
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

        onAnimationEndForDeath: function(data) {
            if (data.id.startsWith('dying')) {
                this.visible = false;
                var character = this;
                setTimeout(function() {
                    character.trigger('Died');
                }, consts.wait_for_death);
            }
        }
    });

    // Mortal that can trigger win conditions when killed (Unbeliever, TrueBeliever, Enemy)
    Crafty.c('MortalCountsForWin', {
        init: function() {
            this.addComponent('Mortal');
            this.bind('Dying', this.onDying);
            this.bind('Died', this.onDied);
        },

        onDying: function() {
            var prophet = Crafty('Prophet');
            prophet.num_dying_believers++;
            var win_lose = checkWinLoseConditions(true);

            if (win_lose == 'win') {
                Crafty('ProphetText').refreshText(texts.win);
                prophet.winning = true;
                // TODO: Change this to cover all death sounds
                Crafty.audio.stop(this.typeStr + '-lava');
                Crafty.audio.play('Win-signal', 1, 1);

            }
            else if (win_lose == 'lose') {
                Crafty('ProphetText').refreshText(texts.lose);
            }
            else {
                checkStuckConditions();
            }
        },

        onDied: function() {
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
            this.addComponent('2D, DOM, SpriteAnimation, Gravity, Jumper, Collision, DirectionalAnimation, Mortal');

            this.offsetBoundary(-5, -5, -5, 0);
            this.death_anim = null;

            this.onHit('Lava', this.onTouchLava);
            this.onHit('Trap', this.onTouchTrap);

            var self = this;

            this.onHit('IceShrine', function() { LavaAndIceManager.iceShrineTouched(self); });
            this.onHit('LavaShrine', function() { LavaAndIceManager.lavaShrineTouched(self); });


            this.onHit('Item', this.onHitItem);

            this.nextCharacter = null;
            this.prevCharacter = null;

            // Male, female or prophet
            this.type = null;

            this.gender = null; // "m" or "w"
        },

        onHitItem: function(hitDatas) {
            itemType = hitDatas[0].obj.itemType;
            // Add an item to the prophet if it is not an amulet, or the prophet already has an amulet
            if (itemType != 'Amulet' || !(Crafty('Prophet').findItem('CollectedAmulet'))) {
                Crafty('Prophet').addCollectible(itemType);
            }
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

        onTouchLava: function(hitData, isFirstTouch) {
            if (this.typeStr && isFirstTouch) {
                Crafty.audio.play(this.typeStr + '-lava', 1);
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
            var collidedUnbeliever = hitData[0].obj;
            // Ignore collisions with dying (=invisible) unbelievers
            if (collidedUnbeliever.dying) { return; }

            if (!this.startConvertingAnimation()) {
                return;
            }

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
            addLeftRightReels(this, 'stand', 0, 0, 9);
            addLeftRightReels(this, 'walk', 0, 10, 16);
            addLeftRightReels(this, 'jump', 0, 17, 17);
            addLeftRightReels(this, 'fall', 0, 18, 18);
            addLeftRightReels(this, 'converting', 0, 19, 28);
            addLeftRightReels(this, 'dying_in_trap', 0, 29, 37);
            addLeftRightReels(this, 'dying_in_lava', 2, 0, 32);
            addLeftRightReels(this, 'start_casting', 4, 0, 2);
            addLeftRightReels(this, 'casting', 4, 3, 10);
            addLeftRightReels(this, 'start_waiting', 4, 11, 16);
            addLeftRightReels(this, 'waiting', 4, 17, 33);
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
            this.bind('AnimationEnd', this.onAnimationDone);

            this.bind('Move', this.onMove);

            this.onHit('Door', this.onHitDoor);

            this.num_dying_believers = 0;
            this.winning = false;

            this.typeStr = 'Prophet';

            this.nextCollectible = null;
            this.is_casting = false;
            this.is_lightninging = false;
        },

        onAnimationDone: function(data) {
            if (data.id == 'start_casting_' + this.direction) {
                this.dir_animate('casting', -1);
            }
        },

        start_casting: function() {
            if (this.is_casting || this.is_lightninging) return;
            this.is_casting = true;
            this.vx = 0;
            this.disableControl();
            this.disable_movement_animations = true;
            this.dir_animate('start_casting', 1);
        },

        stop_casting: function() {
            if (!this.is_casting) return;
            this.enableControl();
            this.disable_movement_animations = false;
            this.dir_animate('stand', -1);
            this.is_casting = false;
        },

        startChargeLightning: function() {
            // TODO: Only do this if the prophet has an amulet
            if (this.is_lightninging) return;
            this.is_lightninging = true;
            // If we are already casting, cancel the casting but leave control disabled and don't restart animation
            if (this.is_casting) {
                this.is_casting = false;
            } else {
                this.vx = 0;
                this.disableControl();
                this.disable_movement_animations = true;
                this.dir_animate('start_casting', 1);
            }

            LightningManager.show_target(this.x, this.direction);

            var self = this;
            this.lightning_timeout = setTimeout(function() {
                if (!self.is_lightninging) {return;}
                self.stopChargeLightning();
                LightningManager.zap();
            }, consts.lightning_delay_ms);
        },

        stopChargeLightning: function() {
            this.enableControl();
            this.disable_movement_animations = false;
            this.dir_animate('stand', -1);
            this.is_lightninging = false;
            if (this.lightning_timeout) {
                clearTimeout(this.lightning_timeout);
            }

            LightningManager.unshow_target();
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
                Crafty.audio.play('door');
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
                } else if (this.vy == 0 && this.vx == 0) {
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

        hasAmulet: function() {
            x = this.nextCollectible;
            while (x != null) {
                if (x.itemType == 'Amulet') {
                    return true;
                }
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

            Crafty.audio.play("item-picked-up");

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
            }else if (this.vy > consts.prophet_jump_speed) {
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
			if (worlds[game_state.cur_world].stages[game_state.cur_level].name == '5-10') {
				return;
			} else {
				Crafty('ProphetText').refreshText(this.winning ? texts.oops : texts.lose);
			}
        },

        onProphetDied: function() {
			if (worlds[game_state.cur_world].stages[game_state.cur_level].name == '5-10') {
				var counter = Crafty('Counter');
				if (counter.count == counter.total) {
					switchToNextWorld();
					return;
				} else {
					switchToNextLevel();
					return;
				}
			}
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
            this.addComponent('Character, MortalCountsForWin, unbeliever_stand_right');
            this.offsetBoundary(-3, 0, -3, 0);
            this.z = zorders.believers;

            this.jumper(consts.believer_jump_speed, []);

            this.being_converted = false;
            this.being_converted_anim = null;
            this.being_converted_cb = null;

            this.bind('AnimationEnd', this.onAnimationFinished);

            this.bind('Dying', this.onUnBelieverDying);
        },

        trulyBelieve: function(callback) {
            if (this.being_converted) {
                return;
            }

            if (this.typeStr) {
                Crafty.audio.play(this.typeStr + '-converted', 1);
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
        },
    });

    // Male unbeliever
    Crafty.c('Unbeliever1', {
        init: function() {
            this.addComponent('Unbeliever');
            this.setGender('m');
            // Unbelievers can't fall, but Gravity triggers a fall direction for new
            // entities before it figures out that they're on the ground.
            // So we have to make fall animations which are just copies of stand animations.
            addLeftRightReels(this, 'stand', 8, 0, 6);
            addLeftRightReels(this, 'fall', 8, 0, 6); // copy stand animation
            addLeftRightReels(this, 'being_converted', 8, 7, 15);
            addLeftRightReels(this, 'dying_in_zap', 10, 28, 34);

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
            addLeftRightReels(this, 'stand', 12, 0, 6);
            addLeftRightReels(this, 'fall', 12, 0, 6); // copy stand animation
            addLeftRightReels(this, 'being_converted', 12, 7, 15);
            addLeftRightReels(this, 'dying_in_zap', 14, 28, 34);

            this.believer_type = 2;

            this.typeStr = 'Female';
        }
    });

    Crafty.c('TrueBeliever', {
        init: function() {
            this.addComponent('Character, HasConvertingPowers, NewDirectionWorkaround, true_believer_stand_right, ' +
                'MortalCountsForWin');
            this.z = zorders.believers;

            this.jumper(consts.believer_jump_speed, []);

            this.onHit('Enemy', this.onHitEnemy);

            this.bind('EnterFrame', this.beforeEnterFrame);

            this.nextCharacter = null;
            this.prevCharacter = null;

            checkStuckConditions();
        },

        onHitEnemy: function(hitDatas) {
            var enemy = hitDatas[0].obj;
            if (this.x < enemy.x) {
                enemy.direction = 'left';
            }
            else {
                enemy.direction = 'right';
            }

            enemy.die('dying', false, true);
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
                    Crafty('Prophet').start_casting();
                }
            }
            if (this.x < prevCharX - actual_gap) {
                this.shift(actual_speed, 0, 0, 0);
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
    });

    Crafty.c('TrueBeliever1', {
        init: function() {
            this.addComponent('TrueBeliever');
            this.setGender('m');
            addLeftRightReels(this, 'stand', 8, 16, 22);
            addLeftRightReels(this, 'walk', 8, 23, 27);
            addLeftRightReels(this, 'converting', 8, 28, 36);
            addLeftRightReels(this, 'fall', 8, 37, 37);
            addLeftRightReels(this, 'dying_in_lava', 10, 0, 20);
            addLeftRightReels(this, 'dying_in_trap', 10, 21, 27);
            addLeftRightReels(this, 'dying_in_zap', 10, 28, 34);

            this.typeStr = 'Male';
        }
    });

    Crafty.c('TrueBeliever2', {
        init: function() {
            this.addComponent('TrueBeliever');
            this.setGender('w');
            addLeftRightReels(this, 'stand', 12, 16, 22);
            addLeftRightReels(this, 'walk', 12, 23, 27);
            addLeftRightReels(this, 'converting', 12, 28, 36);
            addLeftRightReels(this, 'fall', 12, 37, 37);
            addLeftRightReels(this, 'dying_in_lava', 14, 0, 20);
            addLeftRightReels(this, 'dying_in_trap', 14, 21, 27);
            addLeftRightReels(this, 'dying_in_zap', 14, 28, 34);

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

function switchToNextWorld()
{
    prev_music_id = 'bg-world' + game_state.playing_music_for_world;
    if (game_state.playing_music_for_world != null && Crafty.audio.isPlaying(prev_music_id)) {
        Crafty.audio.stop(prev_music_id);
        game_state.playing_music_for_world = null
    }

    if (game_state.cur_world + 1 == worlds.length) {
        Crafty.enterScene('ending');
        return;
    }

    game_state.cur_level = 0;
    game_state.cur_world++;
    Crafty.enterScene('w'+game_state.cur_world+'-intro');
}

function switchToNextLevel()
{
    if (game_state.cur_level + 1 == worlds[game_state.cur_world].stages.length) {
        switchToNextWorld();
    } else {
        game_state.cur_level++;
        Crafty.enterScene('level');
    }
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

function checkStuckConditions()
{
    var prophet = Crafty('Prophet');
    var trueBelievers = Crafty('TrueBeliever');
    var unbelievers = Crafty('Unbeliever');
    var counter = Crafty('Counter');
    var living_believers = trueBelievers.length - prophet.num_dying_believers;
    var num_unbelievers = unbelievers.length;

    // Remaining number of living followers + unbelievers is less than remaining in the counter
    if (living_believers + num_unbelievers < counter.total - counter.count) {
        Crafty('ProphetText').refreshText(texts.not_enough_remaining);
    }

    // Too many followers
    else if (living_believers > counter.total - counter.count) {
        Crafty('ProphetText').refreshText(texts.too_many_followers);
    }
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
