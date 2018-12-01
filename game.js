var assets = {
    "sprites": {
        "assets/character.png": {
            tile: 32,
            tileh: 32,
            map: {
                character_start: [0, 0]
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
            .image('assets/background.png');

        Crafty.viewport.zoom(1/window.devicePixelRatio, 0, 0, 0);
        
        Crafty.e('2D, DOM, Character, character_start, SpriteAnimation, Twoway, Gravity, Collision')
            .attr({x: consts.tile_width, y: consts.tile_height})
            .reel("walking", 1000/12*5, [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]])
            .animate("walking", -1)
            .twoway(200)
            .gravity("gravity_blocking")
            .bind('Move', this.characterMoved);
        
        this.addFloor(0, 19, 30);
        this.addFloor(0, 16, 5);

        this.addWall(8, 16, 5);

        for (var i = 0; i < consts.level_height - 1; i++) {
            this.addWall(0, i, 1);
            this.addWall(consts.level_width - 1, i, 1);
        }
    },

    addFloor: function(tile_x, tile_y, tile_width)
    {
        Crafty.e('Floor')
            .attr({x: tile_x * 32, y: tile_y * 32, w: tile_width * 32, h: 32});
    },

    addWall: function(tile_x, tile_y, tile_width)
    {
        Crafty.e('Wall')
            .attr({x: tile_x * 32, y: tile_y * 32, w: tile_width * 32, h: 32});
    },

    characterMoved: function(evt)
    {
        if (this.fixing_position) return;
        var hitDatas;

        if (hitDatas = this.hit('move_blocking')) {
            var hitData = hitDatas[0];
            this.fixing_position = true;
            this.x = evt._x;
            if (this.vy < 0 && evt._y >= hitData.obj.y + hitData.obj.h) {
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
