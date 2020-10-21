import { Component } from '@angular/core';
import { ViewController, Platform } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import { Game } from '../../game/game';
import { Observable } from 'rxjs/Observable';
import { UserProvider } from '../../providers/user';
import { CouponProvider } from '../../providers/coupon/coupon';

@Component({
  selector: 'page-game',
  templateUrl: 'game.html',
})
export class GamePage {

  private gameInstance: Game;
  private height: number;
  private width: number;

  constructor(
    public viewCtrl: ViewController,
    public userProvider: UserProvider,
    public couponProvider: CouponProvider,
    public alertCtrl: AlertController,
    platform: Platform,
  ) {
    platform.ready()
    .then(readySource => {
      this.width = platform.width();
      this.height = platform.height();
    });
  }

  ionViewDidEnter() {
    this.start();
  }

  ionViewWillUnload() {
    this.destroy();
  }

  private onQuit(done) {
    this.viewCtrl.dismiss({ done });
  }

  private start() {
    let quitObs;

    const sub = new Observable(observer => quitObs = observer)
    .subscribe(done => {
      sub.unsubscribe;
      this.onQuit(done);
    });

    this.gameInstance = new Game(
      this.width,
      this.height,
      quitObs,
      this.userProvider,
      this.couponProvider,
      this.alertCtrl,
    );
  }

  private destroy() {
    if (this.gameInstance.destroy) this.gameInstance.destroy();
  }
}
