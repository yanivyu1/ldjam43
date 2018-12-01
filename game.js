var assets = {
    "sprites": {
        "assets/character.png": {
            tile: 32,
            tileh: 32,
            map: {
                character_start: [0, 0]
            }
        },"assets/npc.png": {
            tile: 32,
            tileh: 32,
            map: {
                npc_start: [0, 0]
            }
        }
    }
};

var consts = {
    tile_width: 32,
    tile_height: 32,
    level_width: 30,
    level_height: 20
};

var level = {
    render: function() {
        Crafty.e('2D, DOM, Image')
            .attr({x: 0, y: 0, w: 960, h: 640})
            .image('assets/bg-beach.png');

        Crafty.viewport.zoom(1/window.devicePixelRatio, 0, 0, 0);
        
        Crafty.e('2D, DOM, character_start, SpriteAnimation, Twoway, Gravity, Collision')
            .attr({x: consts.tile_width, y: consts.tile_height})
            .reel("walking", 1000/12*5, [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]])
            .animate("walking", -1)
            .twoway(200)
            .gravity("gravity_blocking")
            .bind('Move', this.characterMoved);

        this.addFloor(0, 19, 30);
        this.addFloor(0, 16, 5);

        this.addWall(8, 16, 5);
        this.addNPC(8,15);
        for (var i = 0; i < consts.level_height - 1; i++) {
            this.addWall(0, i, 1);
            this.addWall(consts.level_width - 1, i, 1);
        }
    },

    addEntity: function(entity_type, tiles_x, tiles_y, tiles_width, tiles_height)
    {
        Crafty.e(entity_type)
            .attr({x: tiles_x * consts.tile_width,
                   y: tiles_y * consts.tile_height,
                   w: tiles_width * consts.tile_width,
                   h: tiles_height * consts.tile_height});
    },

    addFloor: function(tiles_x, tiles_y, tiles_width)
    {
        this.addEntity('Floor', tiles_x, tiles_y, tiles_width, 1);
    },

    addWall: function(tiles_x, tiles_y, tiles_width)
    {
        this.addEntity('Wall', tiles_x, tiles_y, tiles_width, 1);
    },

    addNPC: function(tiles_x, tiles_y)
    {
        this.addEntity('NPC', tiles_x, tiles_y, 1, 1);
    },

    characterMoved: function(evt)
    {
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
    }
};

function initComponents()
{
    Crafty.c('Floor', {
        init: function() {
            this.addComponent('2D, DOM, Image, gravity_blocking');
            this.image('assets/floor.png', 'repeat');
        }
    });

    Crafty.c('Wall', {
        init: function() {
            this.addComponent('2D, DOM, Image, gravity_blocking, move_blocking');
            this.image('assets/wall.png', 'repeat');
        }
    });

    Crafty.c('NPC', {
        init: function() {
            this.addComponent('2D, DOM, npc_start, SpriteAnimation, Twoway, Gravity, Collision');
            this.reel("walking", 1000/12*5, [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]])
            this.twoway(200)
            this.gravity("gravity_blocking")
        }
    })
}

function initGame()
{
    Crafty.init(960/window.devicePixelRatio, 640/window.devicePixelRatio, document.getElementById('game'));
    //Crafty.viewport.zoom(1/window.devicePixelRatio, 0, 0, 0);

    Crafty.load(assets, function() {
        initComponents();
        level.render();
    });
}

initGame();
