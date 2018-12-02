var assets = function() {
    var sprite_map = {
        prophet_stand_right: [0, 0],
        npc_stand_right: [0, 3],
        tile_lava: [0, 9]
    };

    for (var row = 0; row < 5; row++) {
        for (var col = 0; col < 40; col++) {
            var wall_num = row * 40 + col;
            var wall_pos = [col, row + 10];
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
    scale: 1 / window.devicePixelRatio,
    full_screen_ratio: 0.95,
    zoom_level: 3,
    prophet_walk_speed: 120,
    prophet_jump_speed: 320,
    believer_jump_speed: 3000,
    follow_x_gap_px: 16,
    wait_for_death: 1000
};

function addReel(entity, anim_name, num_frames, first_frame_col, first_frame_row)
{
    var frames = [];
    for (var col = first_frame_col; col < first_frame_col + num_frames; col++) {
        frames.push([col, first_frame_row]);
    }

    entity.reel(anim_name, 1000 * num_frames / consts.anim_fps, frames);
}

var level = {
    render: function(level) {
        Crafty.e('KeyboardTrapper');

        Crafty.e('2D, DOM, Image')
            .attr({x: 0, y: 0})
            .image('assets/bg-beach.png');

        for (var i = 0; i < consts.level_height - 1; i++) {
            this.addOuterWall(0, i);
            this.addOuterWall(consts.level_width, i);
        }
        var stage = worlds[0].stages[level];
        var objects = stage.objects;
        for(var i=0;i<objects.length;i++){
            if(objects[i].type == 'Wall') {
                this.addWall(objects[i].x, objects[i].y, 'tile_' + objects[i].type +''+objects[i].spriteindex);
            }
            else if (objects[i].type == 'Prophet') {
              var prophet = this.addProphet(objects[i].x, objects[i].y);
              Crafty.viewport.follow(prophet, 0, 0);
            }
            else if(objects[i].type == 'NPC') {
                //this.addNPC(objects[i].x, objects[i].y);
            }
            else if (objects[i].type == 'Lava') {
                this.addLava(objects[i].x, objects[i].y, 'shallow');
            }
            else if (objects[i].type == 'Deeplava') {
                this.addLava(objects[i].x, objects[i].y, 'deep');
            }
            else if (objects[i].type == 'Counter') {
                this.addCounter(objects[i].x, objects[i].y)
                    .setTotal(stage.required);
            }
        }

        this.addUnbeliever(2, 13).text('1');
        this.addUnbeliever(5, 13).text('2');
        this.addUnbeliever(14, 18).text('3');
        this.addUnbeliever(8, 13).text('4');
    },

    addEntity: function(entity_type, tiles_x, tiles_y, tile_type)
    {
        return Crafty.e(entity_type, tile_type)
            .attr({x: tiles_x * consts.tile_width,
                   y: tiles_y * consts.tile_height,
                   w: consts.tile_width,
                   h: consts.tile_height});
    },

    addFloor: function(tiles_x, tiles_y, floorType)
    {
        return this.addEntity('Floor', tiles_x, tiles_y, floorType);
    },

    addWall: function(tiles_x, tiles_y, floorType)
    {
        return this.addEntity('Wall', tiles_x, tiles_y, floorType);
    },

    addOuterWall: function(tiles_x, tiles_y)
    {
        return this.addWall(tiles_x, tiles_y, null)
            .attr({w: 1});
    },

    addLava: function(tiles_x, tiles_y, lava_type)
    {
        return this.addEntity('Lava', tiles_x, tiles_y).setLavaType(lava_type);
    },

    addProphet: function(tiles_x, tiles_y)
    {
        return this.addEntity('Prophet', tiles_x, tiles_y);
    },

    addUnbeliever: function(tiles_x, tiles_y)
    {
        return this.addEntity('UnBeliever', tiles_x, tiles_y);
    },

    addCounter: function(tiles_x, tiles_y)
    {
        return Crafty.e('Counter')
            .attr({x: tiles_x * consts.tile_width,
                   y: tiles_y * consts.tile_height});
    }
};

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
                Crafty.viewport.scale(zoom_out_level);
            }
        },

        onKeyUp: function(e) {
            if (e.key == Crafty.keys.Z) {
                Crafty.viewport.scale(consts.scale * consts.zoom_level);
            }
        }
    });

    Crafty.c('Floor', {
        init: function() {
            this.addComponent('2D, DOM, gravity_blocking');
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
            addReel(this, 'shallow', 10, 0, 9);
            addReel(this, 'deep', 10, 10, 9);
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
            this.addComponent('2D, DOM, SpriteAnimation, Gravity, Collision');

            this.gravity('gravity_blocking');
            
            this.direction = 'right';
            this.dying = false;
            this.death_anim = null;

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
            if (this.dying) {
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
            this.removeComponent('Multiway'); // If we could walk, don't walk anymore
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
                var character = this;
                setTimeout(function() {
                    character.trigger('Death');
                    character.destroy();
                }, consts.wait_for_death);
            }
        }
    });

    Crafty.c('Prophet', {
        init: function() {
            this.addComponent('Character, prophet_stand_right, Multiway, Jumper');
            addReel(this, 'stand_right', 10, 0, 0);
            addReel(this, 'walk_right', 7, 11, 0);
            addReel(this, 'jump_right', 1, 17, 0);
            addReel(this, 'fall_right', 1, 18, 0);
            addReel(this, 'dying_in_lava_right', 33, 0, 2);
            addReel(this, 'dying_in_trap_right', 33, 0, 2);
            addReel(this, 'stand_left', 10, 0, 1);
            addReel(this, 'walk_left', 7, 11, 1);
            addReel(this, 'jump_left', 1, 17, 1);
            addReel(this, 'fall_left', 1, 18, 1);
            addReel(this, 'dying_in_lava_left', 33, 0, 2);
            addReel(this, 'dying_in_trap_left', 33, 0, 2);
            this.dir_animate('stand', -1);
            this.multiway({x: consts.prophet_walk_speed},
                {RIGHT_ARROW: 0,
                 LEFT_ARROW: 180,
                 D: 0,
                 A: 180});
            this.jumper(consts.prophet_jump_speed, [Crafty.keys.UP_ARROW, Crafty.keys.W]);

            this.bind('Move', this.onMove);

            this.onHit('UnBeliever', this.collisionUnBeliever);

            this.believers = [];
            this.believers_blocked_walls = [];
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

        collisionUnBeliever: function(hitData) {
            var collidedUnbeliever = hitData[0].obj;
            this.believers.push(collidedUnbeliever.trulyBelieve(this.believers.length));
        }
    });

    Crafty.c('UnBeliever', {
        init: function() {
            this.addComponent('2D, DOM, Text, SolidHitBox, Gravity, Jumper, Collision');
            this.gravity('gravity_blocking');
            this.jumper(consts.believer_jump_speed, []);
            this.textColor('green');
        },

        // current_total_believers = BEFORE adding this one
        trulyBelieve: function(current_total_believers) {
            var trueBeliever = Crafty.e('TrueBeliever')
                .attr({x: this.x,
                       y: this.y,
                       w: consts.tile_width,
                       h: consts.tile_height,
                       idx: current_total_believers
                }).text(this._text);
            this.destroy();
            return trueBeliever;
        }
    });

    Crafty.c('TrueBeliever', {
        init: function() {
            this.addComponent('2D, DOM, SolidHitBox, Text, Gravity, Jumper, Collision');
            this.gravity('gravity_blocking');
            this.jumper(consts.believer_jump_speed, []);
            this.textColor('red');
            this.onHit('UnBeliever', this.collisionUnBeliever);

            this.blocked_by_wall = false;
        },

        collisionUnBeliever: function(hitData) {
            var collidedUnbeliever = hitData[0].obj;
            var prophet = Crafty('Prophet');
            prophet.believers.push(collidedUnbeliever.trulyBelieve(prophet.believers.length));
        },

        onProphetMoved: function(prophetX, idx) {
            if (this.blocked_by_wall) {
                if (this.checkIfStillWallBlocked(prophetX, idx)) {
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

            if (hitDatas = this.hit('move_blocking')) {
                this.x = prev_x;
                this.blocked_by_wall = true;
                return false;
            }

            return true;
        },

        checkIfStillWallBlocked: function(prophetX, idx) {
            // Basically, check if the prophet is nearby to "reactivate" believer
            if (Math.abs(prophetX - this.x) <= (consts.tile_width / 2)) {
                this.blocked_by_wall = false;
                return false;
            }

            return true;
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

function initGame()
{
    Crafty.init(window.innerWidth * consts.full_screen_ratio,
                window.innerHeight * consts.full_screen_ratio,
                document.getElementById('game'));
    Crafty.viewport.scale(consts.scale * consts.zoom_level);
    Crafty.pixelart(true);
    Crafty.load(assets, function() {
        initComponents();
        level.render(0);
    });
}

initGame();
