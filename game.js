var assets = function() {
    var sprite_map = {
        prophet_stand_right: [0, 0],
        unbeliever_stand_right: [0, 6],
        true_believer_stand_right: [16, 6],
        tile_lava: [0, 14],
        tile_floor: [12, 14]
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
        "images": ["assets/bg-beach.png"]
    };
}();

var consts = {
    tile_width: 32,
    tile_height: 32,
    level_width: 30,
    level_height: 20,
    anim_fps: 12,
    full_screen_ratio: 0.95,
    zoom_in_level: 2,
    prophet_walk_speed: 120,
    prophet_jump_speed: 320,
    believer_jump_speed: 3000,
    follow_x_gap_px: 16,
    wait_for_death: 1000
};

var game_state = {
    cur_world: 0,
    cur_level: 0
};

function addReel(entity, anim_name, row, first_col, last_col)
{
    var frames = [];
    for (var col = first_col; col <= last_col; col++) {
        frames.push([col, row]);
    }

    entity.reel(anim_name, 1000 * (last_col - first_col + 1) / consts.anim_fps, frames);
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
            return addWall(tiles_x, tiles_y, null).attr({w: 1});
        }

        function addLava(tiles_x, tiles_y, lava_type)
        {
            return addEntity('Lava', tiles_x, tiles_y).setLavaType(lava_type);
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
                .attr({x: tiles_x * consts.tile_width,
                    y: tiles_y * consts.tile_height});
        }

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
            }
            else if (objects[i].type == 'Floor') {
                addFloor(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'Prophet') {
                var prophet = addProphet(objects[i].x, objects[i].y);
                Crafty.viewport.follow(prophet, 0, 0);
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
            else if (objects[i].type == 'Counter') {
                addCounter(objects[i].x, objects[i].y)
                    .setTotal(stage.required);
            }
        }
    });

    Crafty.defineScene('intro', function(){
        Crafty.e('2D, DOM, Image, Keyboard')
            .attr({x: 0, y: 0})
            .image('assets/Island-text.png');
        Crafty.e('KeyboardTrapper');
    });
}

function initComponents()
{
    Crafty.c('KeyboardTrapper', {
        init: function() {
            this.addComponent('Keyboard');

            this.bind('KeyDown', this.onKeyDown);
            this.bind('KeyUp', this.onKeyUp);
        },

        // Just an always-present component for trapping keyboard keys
        onKeyDown: function(e) {
            if (e.key == Crafty.keys.Z) {
                var zoom_out_level = Math.min(window.innerWidth / 960, window.innerHeight / 640);
                zoom_out_level *= consts.full_screen_ratio;
                Crafty.viewport.scale(zoom_out_level);
            }

            else if (Crafty.keydown[Crafty.keys.SHIFT]) {
                if (e.key == Crafty.keys.S) {
                    switchToNextLevel();
                }
                else if (e.key == Crafty.keys.P) {
                    switchToPrevLevel();
                }
            }
        },

        onKeyUp: function(e) {
            if (e.key == Crafty.keys.Z) {
                Crafty.viewport.scale(consts.scale * consts.zoom_level);
            }else if(e.key == Crafty.keys.ENTER){
                Crafty.enterScene('level');
            }else if (Crafty.keydown[Crafty.keys.SHIFT]) {
                if (e.key == Crafty.keys.R) {
                    Crafty.enterScene('level');
                }
            }
        }
    });

    Crafty.c('Floor', {
        init: function() {
            this.addComponent('2D, DOM, tile_floor, gravity_blocking, Collision');
            // No boundary, to work around "walk-onto bug"
            this.offsetBoundary(0, 0, 0, -consts.tile_height);
        }
    });

    Crafty.c('Wall', {
        init: function() {
            this.addComponent('2D, DOM, gravity_blocking, move_blocking');
        }
    });

    Crafty.c('Lava', {
        init: function() {
            this.addComponent('2D, DOM, Lava, tile_lava, SpriteAnimation');
            addReel(this, 'shallow', 14, 0, 5);
            addReel(this, 'deep', 14, 6, 11);
        },

        setLavaType: function(lava_type) {
            this.animate(lava_type, -1);
        },
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
    // Events: Death (fired when the death animation is over)
    // Animations should be defined by derived components:
    // stand, walk, jump, fall, dying_in_lava, dying_in_trap
    // All should be defined with "_left" and "_right"
    Crafty.c('Character', {
        init: function() {
            this.addComponent('2D, DOM, SpriteAnimation, Gravity, Jumper, Collision');

            this.gravity('gravity_blocking');
            this.offsetBoundary(-4, -4, -4, 0);
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

        die: function(death_anim) {
            if (this.dying) {
                return;
            }

            this.dying = true;
            this.disable_movement_animations = true;
            this.removeComponent('Multiway'); // If we could walk, don't walk anymore
            this.removeComponent('Jumper');   // Don't jump/fall anymore
            this.removeComponent('Gravity');  // Don't fall anymore
            this.resetMotion();

            Crafty('Counter').increment();

            this.death_anim = this.dir_animate(death_anim, 1);

        },

        onTouchLava: function() {
            this.die('dying_in_lava');
        },

        onTouchTrap: function() {
            this.die('dying_in_trap');
        },

        onAnimationEnd: function(data) {
            if (data.id == this.death_anim) {
                this.visible = false;
                var character = this;
                var prophet = Crafty('Prophet');
                setTimeout(function() {
                    character.trigger('Death');
                }, consts.wait_for_death);
                if(character.getId() == Crafty('Prophet').getId()) {
                    Crafty.enterScene('level');
                }
                character.destroy();
                var trueBelievers = Crafty('TrueBeliever');
                if(Crafty('Counter').count == Crafty('Counter').total && trueBelievers.length == 0 && prophet.length == 1){
                    switchToNextLevel();
                }else{
                    Crafty.enterScene('level');
                }
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

            this.bind('Move', this.onMove);
            this.bind('NewDirection', this.prophetNewDirection);
            this.bind('ConversionStarted', this.onConversionStarted);
            this.bind('ConversionEnded', this.onConversionEnded);

            this.believers = [];
            this.believers_blocked_walls = [];
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

        onMove: function(evt) {
            if (this.fixing_position) return;
            var hitDatas;

            if (hitDatas = this.hit('move_blocking')) {
                var hitData = hitDatas[0];
                this.fixing_position = true;
                this.x = evt._x;
                if (this.vy < 0 && evt._y >= hitData.obj.y + hitData.obj.h &&
                    ((evt._x >= hitData.obj.x && evt._x < hitData.obj.x + hitData.obj.w)
                    || (evt._x + consts.tile_width - 1 >= hitData.obj.x
                        && evt._x + consts.tile_width - 1 < hitData.obj.x + hitData.obj.w)))
                {
                    this.vy = 0;
                    this.y = evt._y;
                }
                this.fixing_position = false;
            }

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
            this.attr({w: consts.tile_width});
            this.textAlign('center');
            this.textColor('black');
            this.textFont({family: 'Alanden'});
            this.total = 0;
            this.count = 0;
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

function createNonLevelEntities()
{
    Crafty.e('KeyboardTrapper');
}

function initGame()
{
    Crafty.init(window.innerWidth * consts.full_screen_ratio,
                window.innerHeight * consts.full_screen_ratio,
                document.getElementById('game'));
    Crafty.pixelart(true);
    Crafty.viewport.bounds = {
        min: {x:0, y:0},
        max: {x: consts.level_width * consts.tile_width,
              y: consts.level_height * consts.tile_height}
            };

    Crafty.load(assets, function() {
        initComponents();
        initScenes();
        createNonLevelEntities();
        Crafty.enterScene('intro');
    });
}

initGame();
