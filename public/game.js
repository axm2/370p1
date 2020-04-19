window.post = function(url, data) {
  return fetch(url, {method: "POST", 
	             body: JSON.stringify(data),
                     headers: { 'Content-Type': 'application/json'
			      }
                    });
}

var t = post("/score", {username: "osmium", score: 555});
console.log(t);

var Breakout = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Breakout ()
    {
        Phaser.Scene.call(this, { key: 'breakout' });

        this.bricks;
        this.paddle;
        this.ball;
        this.score;
        this.scoreText;
        this.lives;
        this.livesText;
        //this.highScoreTextBox;
        this.level;
    },

    preload: function ()
    {
        this.load.atlas('assets', 'assets/games/breakout/breakout.png', 'assets/games/breakout/breakout.json');
    },

    create: function ()
    {
        this.score = 0
        this.lives = 3
        this.level = 1
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
        this.livesText = this.add.text(16, 48, 'Lives: 3', { fontSize: '32px', fill: '#fff' });
        //this.highScoreTextBox = this.add.text(16, 32, 'Lives: 3', { fontSize: '32px', fill: '#fff' });
        //  Enable world bounds, but disable the floor
        this.physics.world.setBoundsCollision(true, true, true, false);

        //  Create the bricks in a 10x6 grid
        this.bricks = this.physics.add.staticGroup({
            key: 'assets', frame: [ 'blue1', 'red1', 'green1', 'yellow1', 'silver1', 'purple1'],
            frameQuantity: 10,
            gridAlign: { width: 10, height: 6, cellWidth: 64, cellHeight: 32, x: 112, y: 100 }
        });

        this.ball = this.physics.add.image(400, 500, 'assets', 'ball1').setCollideWorldBounds(true).setBounce(1);
        this.ball.setData('onPaddle', true);

        this.paddle = this.physics.add.image(400, 550, 'assets', 'paddle1').setImmovable();

        //  Our colliders
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

        //  Input events
        this.input.on('pointermove', function (pointer) {

            //  Keep the paddle within the game
            this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 748);

            if (this.ball.getData('onPaddle'))
            {
                this.ball.x = this.paddle.x;
            }

        }, this);

        this.input.on('pointerup', function (pointer) {

            if (this.ball.getData('onPaddle'))
            {
                this.ball.setVelocity(-75, -300);
                this.ball.setData('onPaddle', false);
            }

        }, this);
    },

    hitBrick: function (ball, brick)
    {
        this.score+=1;
        this.scoreText.setText('Score: ' + this.score);

        brick.disableBody(true, true);

        if (this.bricks.countActive() === 0)
        {
            this.resetLevel();
        }
    },

    resetBall: function ()
    {
        this.ball.setVelocity(0);
        this.ball.setPosition(this.paddle.x, 500);
        this.ball.setData('onPaddle', true);
        this.lives -= 1;
        this.livesText.setText('Lives: ' + this.lives);
        if (this.lives === 0)
        {
            this.resetLevel();
        }
    },

    resetLevel: function ()
    {
        this.resetBall();
        this.lives = 3;
        this.bricks.children.each(function (brick) {

            brick.enableBody(false, 0, 0, true, true);

        });
    },

    hitPaddle: function (ball, paddle)
    {
        var diff = 0;

        if (ball.x < paddle.x)
        {
            //  Ball is on the left-hand side of the paddle
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10 * diff);
        }
        else if (ball.x > paddle.x)
        {
            //  Ball is on the right-hand side of the paddle
            diff = ball.x -paddle.x;
            ball.setVelocityX(10 * diff);
        }
        else
        {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            ball.setVelocityX(2 + Math.random() * 8);
        }
    },

    update: function ()
    {
        if (this.ball.y > 600)
        {
            this.resetBall();
        }
    }

});

var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    parent: 'game-window',
    scene: [ Breakout ],
    physics: {
        default: 'arcade'
    }
};

var game = new Phaser.Game(config);

