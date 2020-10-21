import { Component } from '@angular/core';
import { NavController, ModalController, AlertController } from 'ionic-angular';
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links';

import { GamePage } from '../game/game';
import { UserProvider } from '../../providers/user';
import { LoadingProvider } from '../../providers/loading/loading';
import { CouponPage } from '../coupon/coupon';
import { CouponProvider } from '../../providers/coupon/coupon';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public couponLimit: number;
  public numUnused: number;
  public unusedCoupons;
  public user;

  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingProvider: LoadingProvider,
    public couponProvider: CouponProvider,
    public userProvider: UserProvider,
    private firebaseDynamicLinks: FirebaseDynamicLinks,
  ) {
    this.userProvider.user$
    .subscribe(user => {
      if (user) {
        this.user = user;
        this.loadingProvider.loading = false;

        this.userProvider.getCouponLimit(this.userProvider.userId)
        .map(limit => limit.$value)
        .subscribe(limit => {
          this.couponLimit = limit;
        }, () => this.couponLimit = null);

        this.unusedCoupons = this.couponProvider.getMyCoupons(this.userProvider.userId,
          { orderByChild: 'used', equalTo: false })
          .map(coupons => {
            this.numUnused = coupons.length;
            return coupons;
          });
      }
    });
  }

  ionViewDidEnter() {
    // this.onStartGame();
  }

  onOpenCoupon(coupon) {
    let modal = this.modalCtrl.create(CouponPage, { coupon });
    modal.present();
  }

  onShare() {
    this.firebaseDynamicLinks.sendInvitation({
      title: 'MyQpon :D',
      message: 'Hej, preizkusi app MyQpon, dobiš lahko kupone za popuste.',
      deepLink: `https://getmyqpon.com/app/r/${this.userProvider.userId}`,
      callToActionText: 'Naloži si MyQpon',
    })
    .then(() => {
      this.alertCtrl.create({
        title: 'Uspeh!',
        message: 'Povezava uspešno deljena, za vsakega novega uporabnika dobiš en dodaten prostor v nahrbtniku!',
        buttons: [{
          text: 'OK',
          handler: () => {},
        }],
      }).present();
    })
    .catch(() => {});
  }

  onStartGame() {
    let modal = this.modalCtrl.create(GamePage);
    modal.present();
    modal.onDidDismiss(data => {
      // if (data && data.done) {
      //   this.navCtrl.parent.select(1);
      // }
    });
  }

  onUnlockSpace() {
    // Share on fb
  }
}
