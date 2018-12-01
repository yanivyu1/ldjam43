var assets = {
    "sprites": {
        "assets/SpriteMap.png": {
            tile: 32,
            tileh: 32,
            map: {
                prophet_stand_right: [0, 0],
                prophet_walk_right: [1, 0],
                prophet_stand_left: [0, 1],
                prophet_walk_left: [1, 1],
                npc_stand_right: [0, 2],
                npc_walk_right: [1, 2],
                npc_stand_left: [0, 3],
                npc_walk_left: [1, 3],
                tile_floor: [0, 4],
                tile_wall: [1, 4]
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

        this.addProphet(1, 1);
        
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
        this.addEntity('Prophet', tiles_x, tiles_y, 1, 1)
            .bind('Move', this.characterMoved);
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
            this.addComponent('2D, DOM, prophet_stand_right, SpriteAnimation, Twoway, Gravity, Collision');
            this.twoway(200);
            this.gravity('gravity_blocking');
        }
    });

    Crafty.c('NPC', {
        init: function() {
            this.addComponent('2D, DOM, npc_stand_right, SpriteAnimation, Twoway, Gravity, Collision');
            //this.reel("walking", 1000/12*5, [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]])
            //this.twoway(200)
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
