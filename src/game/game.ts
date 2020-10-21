import 'pixi';
import 'p2';
import * as Phaser from 'phaser-ce';
import { AlertController } from 'ionic-angular';

import { UserProvider } from '../providers/user';
import { CouponProvider } from '../providers/coupon/coupon';

export class Game extends Phaser.Game {

  private back: any;
  private bird: any;
  private char: any;
  private clock: number;
  private ground: any;
  private jumpSound: any;
  private labelFont: Object;
  private labelLvl: any;
  private labelScore: any;
  private labelTime: any;
  private leaf: any;
  private myScale: number;
  private power: any;
  private prevScore: number;
  private quit: any;
  private restart: any;
  private running: boolean;
  private score: number;
  private spaceKey: any;
  private speed: number;
  private stageBg: string;
  private timer: any;
  private tutorial: any;
  private user: any;

  constructor(
    width: number,
    height: number,
    quit,
    public userProvider: UserProvider,
    public couponProvider: CouponProvider,
    public alertCtrl: AlertController,
  ) {
    super( width, height, Phaser.CANVAS, 'game', null );

    const userSub = this.userProvider.user$
    .subscribe(user => {
      if (userSub) userSub.unsubscribe();
      console.log('game#user', user);
      this.user = user;
    });

    // Test
    // this.checkGetsCoupon(150, 0);

    this.quit = quit;

    this.labelFont = {
      // font: '35px Arial black',
      font: '50px 3Dventure',
      fill: '#ffffff',
    };
    this.stageBg = '#A0EFEF';

    this.myScale = 1;

    // add some game states
    this.state.add('boot', {
      preload: () => {
        console.log('preload');

        // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // this.scale.setMinMax(this.width / 2, this.height / 2, this.width, this.height);

        Phaser.Canvas.setImageRenderingCrisp(this.canvas);
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.stage.smoothed = false;

        this.stage.backgroundColor = this.stageBg;

        this.load.spritesheet('char', 'assets/images/hopper.png', 12, 12, 2);
        this.load.spritesheet('bird', 'assets/images/bird.png', 12, 12, 5);
        this.load.spritesheet('leaf', 'assets/images/leaf.png', 12, 12, 3);

        this.load.image('ground', 'assets/images/ground.png');

        this.load.image('power', 'assets/images/power.png');
        this.load.image('reset', 'assets/images/reset.png');
        this.load.image('back', 'assets/images/back.png');
        this.load.spritesheet('instructions', 'assets/images/instructions.png', 12, 24, 2);

        this.load.audio('jump', 'assets/sounds/jump.wav');

        this.labelTime = this.add.text(12, 10, '', this.labelFont);
        this.labelScore = this.add.text(12, 50, '', this.labelFont);

        this.labelLvl = this.add
          .text(0, 0, '', this.labelFont);
        this.labelLvl.setTextBounds(this.world.width / 2, 10, this.world.width / 2 - 12, 70);
        this.labelLvl.boundsAlignH = 'right';
      },

      create: () => {
        console.log('create');

        this.paused = false;
        this.timer = this.time.create(false);
        this.timer.loop(100, this.updateTime, this);
        this.speed = 0;
        this.clock = 300;
        this.running = false;

        this.char = this.add.sprite(100, this.world.height-77, 'char');
        this.char.scale.setTo(5, 5);
        this.char.collideWorldBounds = true;
        this.physics.arcade.enable(this.char);
        this.char.body.setSize(12, 6, 0, 6);

        this.char.body.gravity.y = this.world.height*1.5;
        this.char.animations.add('idle', [0]);
        this.char.animations.add('jump', [1]);
        this.char.onGround = false;
        this.char.energy = 1;
        this.char.power = 0;
        this.char.damage = true;
        this.char.alive = true;

        this.char.disableDamage = (char, sec) => {
          if (!char.damage) return;

          char.damage = false;
          char.tween = this.add.tween(char).to( { alpha: 0.1 }, 250, Phaser.Easing.Linear.None, true, 0, 1000, true);

          this.time.events.add(Phaser.Timer.SECOND * sec, () => {
            char.damage=true;
            char.tween.stop();
            char.alpha=1;
          });
        }

        this.power = this.add.sprite(0, this.world.height-60*5-12*4*3,'power');
        this.power.scale.setTo(5,5);
        this.power.cropEnabled = true;
        this.power.crop({x:0,y:0,width:12,height:0});

        // New anchor position
        this.char.anchor.setTo(0.5, 0.5);
        this.bird = this.add.sprite(this.world.width, 1, 'bird');
        this.bird.scale.setTo(7, 7);
        this.bird.animations.add('fly', [0, 1, 2, 3, 4, 3, 2, 1, 0])
        this.bird.animations.play('fly', 15, true, false);
        this.bird.checkWorldBounds = true;
        this.physics.arcade.enable(this.bird);

        this.bird.events.onOutOfBounds.add(() => {
          this.bird.active = true;
          this.bird.body.velocity.x = 0;
          this.bird.position.x = this.world.width;
          this.bird.position.y = this.getRandomInt(1, this.world.height/2);
        });

        this.bird.body.setSize(11, 5, 0, 5);
        this.bird.active = true;

        this.leaf = this.add.sprite(this.world.width, this.world.height-12*5*1.8, 'leaf');
        this.leaf.animations.add('idle', [0, 1, 2, 1]);
        this.leaf.animations.play('idle', 5, true, false);
        this.leaf.scale.setTo(5,5);
        this.leaf.tint = 0x00ff00;
        this.leaf.checkWorldBounds = true;
        this.physics.arcade.enable(this.leaf);

        this.leaf.events.onOutOfBounds.add(() => {
          this.leaf.active = false;
          this.leaf.body.velocity.x = 0;
          this.leaf.position.x = this.world.width
        });

        this.leaf.body.setSize(8, 8, 2, 2);
        this.leaf.time = 150;
        this.leaf.active = false;
        this.leaf.distance = 30;

        this.spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR ]);

        this.ground = this.add.tileSprite(0, this.world.height, this.world.width, 12*4, 'ground');
        this.ground.scale.setTo(4,4);
        this.physics.arcade.enable(this.ground);
        this.ground.body.allowGravity = false;
        this.ground.body.immovable = true;
        this.ground.body.collideWorldBounds = true;

        this.score = 0;
        this.prevScore = 0;

        // Add the jump sound
        this.jumpSound = this.add.audio('jump');
        this.jumpSound.volume = 0.2;

        this.power.bringToTop();
        this.labelScore.bringToTop();
        this.labelTime.bringToTop();
        this.tutorial = this.add.sprite(this.world.width/2-12*4, this.world.height/2-24*4 ,'instructions');
        this.tutorial.animations.add('idle', [0, 1]);
        this.tutorial.animations.play('idle', 2, true, false);
        this.tutorial.scale.setTo(7,7);

        this.spaceKey.onUp.add(this.jump, this);
        this.input.onUp.add(this.jump, this);
        this.physics.startSystem(Phaser.Physics.ARCADE);

        this.timer.pause();
      },

      update: () => {
        // console.log('update');

        this.physics.arcade.collide(this.char, this.ground, this.touchingGround);

        if (this.char.onGround){
          this.speed = 0;
        }

        this.ground.autoScroll(-100*this.speed, 0);

        if (this.bird.active && this.running){
          this.bird.body.velocity.x = -50 -(100*this.speed*4);
        }

        if (this.leaf.active){
          this.leaf.body.velocity.x = -(100*this.speed*4);
        }

        this.physics.arcade.overlap(this.char, this.bird, () => {
          this.damage(100)
          this.char.disableDamage(this.char, 2);
        }, null, this);

        this.physics.arcade.overlap(this.char, this.leaf, () => {
          if (!this.char.alive) return;
          this.leaf.active = false;
          this.leaf.body.velocity.x = 0;
          this.leaf.position.x = this.world.width
          this.clock += this.leaf.time;
        }, null, this);

        if ((this.input.activePointer.isDown || this.spaceKey.isDown) && this.char.onGround && this.char.alive){
          this.charge();
        }

        if (this.score - this.prevScore > this.leaf.distance){
          this.prevScore = this.score;
          this.leaf.distance = this.getRandomInt(30, 60);

          if (Math.random() * 100 <= 95){
            this.leaf.active = true;
            this.leaf.tint = 0x00ff00;
            this.leaf.time = 150;
          } else {
            this.leaf.active = true;
            this.leaf.tint = 0xffff00;
            this.leaf.time = 350;
          }
        }

        if (this.speed > 0){
          this.score += this.speed / 12;
        }

        // Slowly rotate the char downward, up to a certain point.
        if (this.char.angle < 20 && !this.char.body.touching.down)
          this.char.angle += 1-(this.world.height-78-this.char.y)/(this.world.height-78);

        this.labelScore.text = Math.round(this.score) + 'M';

        if (this.clock.toString().length > 1) {
          this.labelTime.text = this.clock.toString().slice(0, this.clock.toString().length-1)+'.'+this.clock.toString().charAt(this.clock.toString().length-1);
        } else {
          this.labelTime.text = '.' + this.clock;
        }

        // Lvl
        const addXp = Math.round(Math.pow(this.score, 1.28) / 10);
        this.labelLvl.text = 'Lvl: ' + this.userProvider.getLevel(this.user.xp + addXp);
      }
    });

    // start with boot state
    this.state.start('boot');
  }

  private charge() {
    this.power.crop({x:0,y:60-((1-this.char.energy) / 1)*60,width:12,height:60});
    this.power.position.y = this.world.height-60*5-12*4*3 + this.power.cropRect.y*5;

    if (this.char.energy > 0){
      this.char.energy -= 0.05;
    }

    if (this.char.energy < 0){
      this.char.energy = 0;
    }
  }

  private damage(ammount) {
    if (this.char.damage){
      if (this.clock - ammount < 0){
        this.clock = 0;
        return;
      }

      this.clock -= ammount;
    }
  }

  private die() {
    if (!this.char.alive) return;

    this.char.alive = false;
    this.speed = 0;
    this.power.destroy();
    this.restart = this.add.sprite(this.width/2+2*5*this.myScale, this.height/2+(14*5*this.myScale)/2, 'reset');
    this.back = this.add.sprite(this.width/2-(15*5*this.myScale)-2*5*this.myScale, this.height/2+(14*5*this.myScale)/2, 'back');
    this.back.scale.setTo(5*this.myScale,5*this.myScale);
    this.restart.scale.setTo(5*this.myScale,5*this.myScale);

    this.labelScore.boundsAlignH = 'center';
    this.labelScore.boundsAlignV = 'middle';
    this.labelScore.setTextBounds(0, 100, this.width-12, this.height/2-24*5*this.myScale);
    this.labelScore.fontSize = '100px';

    this.labelTime.text = '';

    this.restart.inputEnabled = true;
    this.back.inputEnabled = true;

    this.restart.events.onInputDown.add(obj => {
      obj.tint = 0xeeeeee;
    });

    this.restart.events.onInputUp.add(obj => {
      obj.tint = 0xffffff;
      this.time.events.add(Phaser.Timer.SECOND * 0.3, () => {
        this.state.restart();
      });
    });

    this.back.events.onInputDown.add(obj => {
      this.time.events.add(Phaser.Timer.SECOND * 0.3, () => {
        this.quit.next();
      });
      obj.tint = 0xeeeeee;
    });

    this.back.events.onInputUp.add(obj => {
      obj.tint = 0xffffff;
    });

    // Add pause menu button
    // Level up animation?

    const addXp = Math.round(Math.pow(this.score, 1.28) / 10);
    this.labelLvl.text = 'Lvl: ' + this.userProvider.getLevel(this.user.xp + addXp);
    this.checkGetsCoupon(addXp, this.user.xp);
    this.userProvider.saveXP(addXp);
  }

  private checkGetsCoupon(addXp: number, xp: number) {
    if (addXp >= 150 || (xp + addXp) % 150 < addXp) {
      console.log('gets coupon');

      // Offer coupon
      this.couponProvider.offer(addXp + xp)
      .subscribe(coupon => {
        if (coupon) {
          let message: string;
          const discount = typeof coupon.discount !== 'undefined' && !!coupon.discount;

          if (!discount) {
            message = `Odklenil si nov kupon, plačaj ${coupon.priceNew}€ namesto ${coupon.price}€ za ${coupon.product} v ${coupon.vendorName}, ga želiš spraviti v svoj nahrbtnik?`;
          } else {
            message = `Odklenil si nov kupon za ${coupon.discount}% popusta na ${coupon.product} v ${coupon.vendorName}, ga želiš spraviti v svoj nahrbtnik?`;
          }

          const confirm = this.alertCtrl.create({
            title: 'Bravo!',
            message,
            buttons: [{
              text: 'Preskoči',
              handler: () => {},
            }, {
              text: 'Shrani',
              handler: () => {
                this.userProvider.acceptCoupon(coupon)
                .subscribe((stored) => {
                  if (stored) {
                    this.quit.next(stored)
                  }
                });
              }
            }],
          });

          confirm.present();
        }
      });
    }
  }

  private getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private jump(input) {
    if (!this.char.alive || !this.char.onGround || (input.position && !input.withinGame)) return;

    if (!this.running){
      this.running = true;
      this.timer.start();
      this.tutorial.destroy();
    }

    this.char.power = 1.1 - this.char.energy;
    this.char.energy = 1;
    this.char.body.velocity.y = -this.world.height*1.5 * this.char.power;
    this.speed = this.char.power;
    this.add.tween(this.char).to({angle: -20}, 100).start();
    this.char.animations.play('jump', 1, true, false);
    this.jumpSound.play();
    this.char.onGround = false;
  }

  private touchingGround(char, ground) {
    if (char.onGround == false) {
      char.animations.play('idle', 1, true, false);
      char.angle = 0;
      char.onGround = true;
    }
  }

  private updateTime() {
    if (this.char.damage && this.clock > 0){
      this.clock--;
    } else if (this.clock <= 0){
      this.die();
    }
  }
}