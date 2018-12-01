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

var level = {
    render: function() {
        Crafty.e('2D, DOM, Image')
            .attr({x: 0, y: 0, w: 960, h: 640})
            .image('assets/background.png');

        Crafty.viewport.zoom(1/window.devicePixelRatio, 0, 0, 0);
        
        Crafty.e('2D, DOM, character_start, SpriteAnimation, Fourway')
            .attr({x: 0, y: 0})
            .reel("walking", 1000/12*5, [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]])
            .animate("walking", -1)
            .fourway(200);
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
