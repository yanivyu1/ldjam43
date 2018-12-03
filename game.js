var assets = function() {
    var sprite_map = {
        prophet_stand_right: [0, 0],
        unbeliever_stand_right: [0, 6],
        true_believer_stand_right: [16, 6],
        tile_lava: [0, 14],
        tile_floor: [12, 14],
        tile_trap: [13, 14]
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
        "images": ["assets/bg-beach.png", 'assets/Island-text.png']
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
    prophet_jump_speed: 320,
    believer_jump_speed: 3000,
    follow_x_gap_px: 16,
    wait_for_death: 2000,
    wait_for_skip: 500,
    prophet_text_timeout: 5000,
    title_text_timeout: 5000
};

var game_state = {
    cur_world: 0,
    cur_level: 0,
    scene_type: null,
    zoom_out_level: null
};

var texts = {
    win: 'win text, please ignore',
    lose: 'lose text, please ignore',
    oops: 'oops text, please ignore',
    restart_level: 'Try, try again...',
    skip_level: 'Coward.'
};

var zorders = {
    // higher = closer to the user's eyeballs
    default: 0,   // Crafty default
    floating_text: 1
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

function initScenes()
{
    Crafty.defineScene('level', function() {
        function addEntity(entity_type, tiles_x, tiles_y, tile_type)
        {
            return Crafty.e(entity_type, tile_type)
                .attr({x: tiles_x * consts.tile_width,
                    y: tiles_y * consts.tile_height,
                    w: consts.tile_width,
                    h: consts.tile_height});
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

        function addInvisiblePlatform(tiles_x, tiles_y)
        {
            return addEntity('InvisiblePlatform', tiles_x, tiles_y).attr({h: 1});
        }

        function addLava(tiles_x, tiles_y, lava_type)
        {
            return addEntity('Lava', tiles_x, tiles_y).setLavaType(lava_type);
        }

        function addTrap(tiles_x, tiles_y)
        {
            return addEntity('Trap', tiles_x, tiles_y);
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
        Crafty.viewport.scale(consts.zoom_in_level);

        Crafty.e('2D, DOM, Image')
            .attr({x: 0, y: 0})
            .image('assets/bg-beach.png');

        for (var i = 0; i < consts.level_height - 1; i++) {
            addOuterWall(0, i);
            addOuterWall(consts.level_width, i);
        }
        var stage = worlds[game_state.cur_world].stages[game_state.cur_level];
        var objects = stage.objects;
        for(var i=0;i<objects.length;i++){
            if(objects[i].type == 'Wall') {
                addWall(objects[i].x, objects[i].y, 'tile_' + objects[i].type +''+objects[i].spriteindex);
                addInvisiblePlatform(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'Floor') {
                addFloor(objects[i].x, objects[i].y);
                addInvisiblePlatform(objects[i].x, objects[i].y);
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
            else if (objects[i].type == 'Counter') {
                addCounter(objects[i].x, objects[i].y)
                    .setTotal(stage.required);
            }
        }
    });

    Crafty.defineScene('intro', function() {
        game_state.scene_type = 'intro';

        Crafty.e('2D, DOM, Image')
              .image('assets/Island-text.png')
              .addComponent('FullScreenImage');
    });

    Crafty.defineScene('loading', function() {
        // Cannot use assets or components, they're not yet loaded. Fonts are ok.
        Crafty.e('2D, DOM, Text')
            .text('Loading...')
            .textColor('white')
            .textFont({family: 'Tribal', size:'50px', weight: 'bold'})
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
                Crafty.viewport.scale(game_state.zoom_out_level);
            }
            else if (game_state.scene_type == 'intro' && e.key == Crafty.keys.ENTER) {
                Crafty.enterScene('level'); // TODO cutscene
            }
            else if (game_state.scene_type == 'level' && Crafty.keydown[Crafty.keys.SHIFT]) {
                if (e.key == Crafty.keys.S) {
                    Crafty('ProphetText').refreshText(texts.skip_level);
                    setTimeout(function() {
                        switchToNextLevel();
                    }, consts.wait_for_skip);
                }
                else if (e.key == Crafty.keys.P) {
                    switchToPrevLevel();
                }
                else if (e.key == Crafty.keys.R) {
                    Crafty('Prophet').die('dying_in_lava', false, true);
                    Crafty('ProphetText').refreshText(texts.restart_level);
                }
            }
        },

        onKeyUp: function(e) {
            if (game_state.scene_type == 'level' && e.key == Crafty.keys.Z) {
                Crafty.viewport.scale(consts.zoom_in_level);
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
    
    Crafty.c('ProphetText', {
        init: function() {
            this._size = '10px';
            this._guess_size = 15;

            this.addComponent('2D, DOM, Text, FloatingOverProphet');
            this.textAlign('center');
            this.textColor('black');
            this.textFont({family: 'Tribal', size: this._size, weight: 'bold'});
            this.z = zorders.text;
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
            this.addComponent('2D, DOM, Text, Keyboard');
            this.textAlign('left');
            this.textColor('black');

            this.bind('KeyDown', this.onKeyDown);

            this.key_down = false;
            this.timeout = false;
            this.z = zorders.text;
        },

        setText: function(text, size, guess_size) {
            this.textFont({family: 'Tribal', size: size, weight: 'bold'});

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
                this.destroy();
            }
        }
    });

    Crafty.c('Floor', {
        init: function() {
            this.addComponent('2D, DOM, tile_floor');
        }
    });

    Crafty.c('Wall', {
        init: function() {
            this.addComponent('2D, DOM, move_blocking');
        }
    });

    Crafty.c('InvisiblePlatform', {
        init: function() {
            this.addComponent('2D, DOM, gravity_blocking');
        }
    });

    Crafty.c('OuterWall', {
        init: function() {
            this.addComponent('2D, DOM, move_blocking');
        }
    });

    Crafty.c('Lava', {
        init: function() {
            this.addComponent('2D, DOM, tile_lava, SpriteAnimation');
            addReel(this, 'shallow', 14, 0, 5);
            addReel(this, 'deep', 14, 6, 11);
        },

        setLavaType: function(lava_type) {
            this.animate(lava_type, -1);
        },
    });

    Crafty.c('Trap', {
        init: function() {
            this.addComponent('2D, DOM, tile_trap, SpriteAnimation');
            addReel(this, 'silent', 14, 13, 13);
            addReel(this, 'deadly', 14, 13, 18);
            addReel(this, 'reverse_deadly', 14, 18, 13);

            this.animate('silent', -1);
            this.bind('AnimationEnd', this.onAnimationCompleted);
            this.is_killing = false;
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
            this.addComponent('2D, DOM, SpriteAnimation, Gravity, Jumper, Collision');

            this.gravity('gravity_blocking');
            this.offsetBoundary(-5, -5, -5, 0);
            this.direction = 'right';
            this.dying = false;
            this.disable_movement_animations = false;
            this.death_anim = null;

            this.new_direction_workaround = false;
            this.bind('NewDirection', this.onNewDirection);
            this.onHit('Lava', this.onTouchLava);
            this.onHit('Trap', this.onTouchTrap);
            this.bind('AnimationEnd', this.onAnimationEnd);
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
        },

        die: function(death_anim, allow_falling, skip_counter) {
            if (this.dying) {
                return;
            }

            this.dying = true;
            this.disable_movement_animations = true;
            prev_vy = this.vy;
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

        onTouchLava: function() {
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

        collisionUnbeliever: function(hitData) {
            if (this.converting || !this.can_convert) {
                return;
            }

            this.converting = true;
            this.disable_movement_animations = true;
            this.converting_anim = this.dir_animate('converting', 1);
            this.trigger('ConversionStarted');

            var collidedUnbeliever = hitData[0].obj;
            var prophet = Crafty('Prophet');
            collidedUnbeliever.trulyBelieve(function(trueBeliever) {
                prophet.believers.push(trueBeliever);
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

            this.onHit('move_blocking', this.onHitMoveBlocking);
            this.bind('Move', this.onMove);
            this.bind('NewDirection', this.prophetNewDirection);
            this.bind('ConversionStarted', this.onConversionStarted);
            this.bind('ConversionEnded', this.onConversionEnded);
            this.bind('Dying', this.onProphetDying);
            this.bind('Died', this.onProphetDied);

            this.believers = [];
            this.believers_blocked_walls = [];
            this.num_dying_believers = 0;
            this.winning = false;
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

        onHitMoveBlocking: function() {
            // Black magic.
            this.x -= this.dx;
            if (this.hit('move_blocking') && this.vy < 0) { // Still touching block, and jumping
                this.y -= this.dy;
                this.vy = 0;
            }
        },

        onMove: function() {
            var idx = 0;
            var believers_for_end_of_queue = [];
            for (believer in this.believers) {
                if (this.believers[idx].onProphetMoved(this.x, idx)) {
                    // Successfully moved believer
                    idx += 1;
                } else { // The believer was blocked by a wall, and should be pushed to the end of the queue later.
                    believers_for_end_of_queue.push(this.believers.splice(idx, 1)[0]);
                }
            }
            this.believers = this.believers.concat(believers_for_end_of_queue);
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
        }
    });

    Crafty.c('Unbeliever', {
        init: function() {
            this.addComponent('Character, unbeliever_stand_right');

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

            this.being_converted = true;
            this.being_converted_cb = callback;
            this.being_converted_anim = this.dir_animate('being_converted');
        },

        onAnimationFinished: function(data) {
            if (data.id == this.being_converted_anim) {
                var trueBeliever = Crafty.e('TrueBeliever' + this.believer_idx)
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

    Crafty.c('Unbeliever1', {
        init: function() {
            this.addComponent('Unbeliever');
            // Unbelievers can't fall, but Gravity triggers a fall direction for new
            // entities before it figures out that they're on the ground.
            // So we have to make fall animations which are just copies of stand animations.
            addReel(this, 'stand_right', 6, 0, 6);
            addReel(this, 'fall_right', 6, 0, 6); // copy stand animation
            addReel(this, 'being_converted_right', 6, 7, 15);
            addReel(this, 'stand_left', 7, 0, 6);
            addReel(this, 'fall_left', 7, 0, 6); // copy stand animation
            addReel(this, 'being_converted_left', 7, 7, 15);

            this.believer_idx = 1;
        }
    });

    Crafty.c('Unbeliever2', {
        init: function() {
            this.addComponent('Unbeliever');
            // Unbelievers can't fall, but Gravity triggers a fall direction for new
            // entities before it figures out that they're on the ground.
            // So we have to make fall animations which are just copies of stand animations.
            addReel(this, 'stand_right', 10, 0, 6);
            addReel(this, 'fall_right', 10, 0, 6); // copy stand animation
            addReel(this, 'being_converted_right', 10, 7, 15);
            addReel(this, 'stand_left', 11, 0, 6);
            addReel(this, 'fall_left', 11, 0, 6); // copy stand animation
            addReel(this, 'being_converted_left', 11, 7, 15);

            this.believer_idx = 2;
        }
    });

    Crafty.c('TrueBeliever', {
        init: function() {
            this.addComponent('Character, HasConvertingPowers, NewDirectionWorkaround, true_believer_stand_right');

            this.jumper(consts.believer_jump_speed, []);
            this.bind('Dying', this.onTrueBelieverDying);
            this.bind('Died', this.onTrueBelieverDied);

            this.blocked_by_wall = false;
        },

        onProphetMoved: function(prophetX, idx) {
            if (this.converting || this.dying) {
                // Don't move while converting or dying
                return false;
            }

            if (this.blocked_by_wall) {
                if (this.checkIfStillWallBlocked(prophetX)) {
                    // Don't move
                    return false;
                }
            }

            var actual_gap_x_px = (consts.follow_x_gap_px + consts.tile_width) * (idx + 1);
            var prev_x = this.x;
            var delta_x = 0;
            if (this.x >= prophetX - actual_gap_x_px && this.x <= prophetX + actual_gap_x_px) {
                // Do not move, will overlap prophet
            } else {
                if (this.x > prophetX) {
                    delta_x = prophetX + actual_gap_x_px - this.x;
                } else {
                    delta_x = prophetX - actual_gap_x_px - this.x;
                }
            }

            this.shift(delta_x, 0, 0, 0);
            if (delta_x > 0) {
                this.setNewDirectionX(1);
            } else if (delta_x < 0) {
                this.setNewDirectionX(-1);
            } else {
                this.setNewDirectionX(0);
            }

            if (hitDatas = this.hit('move_blocking')) {
                this.x = prev_x;
                this.blocked_by_wall = true;
                this.setNewDirectionX(0);
                return false;
            }

            return true;
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
        }
    });

    Crafty.c('TrueBeliever2', {
        init: function() {
            this.addComponent('TrueBeliever');
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
        }
    });

    Crafty.c('Counter', {
        init: function() {
            this.addComponent('2D, DOM, Text');
            this.textAlign('center');
            this.textColor('black');
            this.textFont({family: 'Alanden'});
            this.total = 0;
            this.count = 0;
            this.z = zorders.text;
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
                'font-size': '16px',
                transition: 'font-size 0.3s'
            });
            setTimeout(function() {
                Crafty('Counter').css({
                    'font-size': '10px',
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
