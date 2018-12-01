var assets = {
    "sprites": {
        "assets/SpriteMap.png": {
            tile: 32,
            tileh: 32,
            map: {
                prophet_stand_right: [0, 0],
                tile_floor: [0, 4],
                tile_wall: [1, 4]
            }
        }
    },
    "images": ["assets/bg-beach.png"]
};

var consts = {
    tile_width: 32,
    tile_height: 32,
    level_width: 30,
    level_height: 20,
    anim_fps: 12,
    scale: 1 / window.devicePixelRatio,
    zoom_level: 3,
    prophet_walk_speed: 200,
    prophet_jump_speed: 300
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
    render: function() {
        Crafty.e('2D, DOM, Image')
            .attr({x: 0, y: 0, w: 960, h: 640})
            .image('assets/bg-beach.png');

        var prophet = this.addProphet(1, 1);
        Crafty.viewport.follow(prophet, 0, 0);
        
        for (var i = 0; i < 30; i++) {
            this.addFloor(i, 19);
        }
        for (var i = 0; i < 5; i++) {
            this.addFloor(i, 16);
        }
        for (var i = 8; i < 13; i++) {
            this.addWall(i, 16);
        }
        
        this.addNPC(8,15);
        for (var i = 0; i < consts.level_height - 1; i++) {
            this.addWall(0, i, 1);
            this.addWall(consts.level_width - 1, i, 1);
        }
    },

    addEntity: function(entity_type, tiles_x, tiles_y, tiles_width, tiles_height)
    {
        return Crafty.e(entity_type)
            .attr({x: tiles_x * consts.tile_width,
                   y: tiles_y * consts.tile_height,
                   w: tiles_width * consts.tile_width,
                   h: tiles_height * consts.tile_height});
    },

    addFloor: function(tiles_x, tiles_y)
    {
        this.addEntity('Floor', tiles_x, tiles_y, 1, 1);
    },

    addWall: function(tiles_x, tiles_y)
    {
        this.addEntity('Wall', tiles_x, tiles_y, 1, 1);
    },

    addProphet: function(tiles_x, tiles_y)
    {
        return this.addEntity('Prophet', tiles_x, tiles_y, 1, 1);
    },

    addNPC: function(tiles_x, tiles_y)
    {
        this.addEntity('NPC', tiles_x, tiles_y, 1, 1);
    }
};

function initComponents()
{
    Crafty.c('Floor', {
        init: function() {
            this.addComponent('2D, DOM, tile_floor, gravity_blocking');
        }
    });

    Crafty.c('Wall', {
        init: function() {
            this.addComponent('2D, DOM, tile_wall, gravity_blocking, move_blocking');
        }
    });

    Crafty.c('Prophet', {
        init: function() {
            this.addComponent('2D, DOM, prophet_stand_right, SpriteAnimation, Multiway, Jumper, Gravity, Collision, Keyboard');
            addReel(this, 'stand_right', 1, 0, 0);
            addReel(this, 'walk_right', 7, 1, 0);
            addReel(this, 'stand_left', 1, 0, 1);
            addReel(this, 'walk_left', 7, 1, 1);
            this.multiway({x: consts.prophet_walk_speed},
                {RIGHT_ARROW: 0,
                 LEFT_ARROW: 180,
                 D: 0,
                 A: 180});
            this.jumper(consts.prophet_jump_speed, [Crafty.keys.UP_ARROW, Crafty.keys.W]);
            this.gravity('gravity_blocking');
            
            this.current_direction = 'right';
            this.animate('stand_right', -1);

            this.bind('NewDirection', this.onNewDirection);
            this.bind('Move', this.onMove);
            this.bind('KeyDown', this.onKeyDown);
            this.bind('KeyUp', this.onKeyUp);
        },

        onNewDirection: function(direction) {
            if (direction.x == 1) {
                this.current_direction = 'right';
                this.animate('walk_right', -1);
            }
            else if (direction.x == -1) {
                this.current_direction = 'left';
                this.animate('walk_left', -1);
            }
            else { // direction.x == 0
                if (this.current_direction == 'right') {
                    this.animate('stand_right', -1);
                }
                else {
                    this.animate('stand_left', -1);
                }
            }
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
        },

        onKeyDown: function(e) {
            if (e.key == Crafty.keys.Z) {
                Crafty.viewport.scale(consts.scale);
            }
        },

        onKeyUp: function(e) {
            if (e.key == Crafty.keys.Z) {
                Crafty.viewport.scale(consts.scale * consts.zoom_level);
            }
        }
    });

    Crafty.c('NPC', {
        init: function() {
            this.addComponent('2D, DOM, npc_stand_right, SpriteAnimation, Gravity, Collision');
            //this.reel("walking", 1000/12*5, [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]])
            //addReel(this, 'walking_right', )
            this.gravity("gravity_blocking")
        }
    })
}

function initGame()
{
    Crafty.init(960 * consts.scale, 640 * consts.scale, document.getElementById('game'));
    Crafty.viewport.scale(consts.scale * consts.zoom_level);
    Crafty.pixelart(true);
    Crafty.load(assets, function() {
        initComponents();
        level.render();
    });
}

initGame();
