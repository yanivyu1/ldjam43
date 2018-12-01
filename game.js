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

        Crafty.c('Floor', {
            init: function() {
                this.addComponent('2D, DOM, blocking, Image, Solid');
                this.image('assets/floor.png', 'repeat');
            }
        });
        
        Crafty.e('2D, DOM, Character, character_start, SpriteAnimation, Twoway, Gravity, Collision')
            .attr({x: consts.tile_width, y: consts.tile_height})
            .reel("walking", 1000/12*5, [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]])
            .animate("walking", -1)
            .twoway(200)
            .gravity("blocking")
            .checkHits('Solid')
            .bind('HitOn', this.characterHit);
        
        this.addFloor(0, 19, 30);
        this.addFloor(0, 16, 5);

        for (var i = 0; i < consts.level_height; i++) {
            this.addFloor(0, i, 1);
            this.addFloor(consts.level_width - 1, i, 1);
        }
    },

    addFloor: function(tile_x, tile_y, tile_width)
    {
        Crafty.e('Floor')
            .attr({x: tile_x * 32, y: tile_y * 32, w: tile_width * 32, h: 32});
    },

    characterHit: function(hitData)
    {
        Crafty.log('Collision with Solid');
        Crafty.log(hitData);
    }
};

function initGame()
{
    Crafty.init(960/window.devicePixelRatio, 640/window.devicePixelRatio, document.getElementById('game'));
    //Crafty.viewport.zoom(1/window.devicePixelRatio, 0, 0, 0);

    Crafty.load(assets, function() {
        level.render();
    });
}

initGame();
