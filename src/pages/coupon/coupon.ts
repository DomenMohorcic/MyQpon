import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { UserProvider } from '../../providers/user';
import { CouponProvider } from '../../providers/coupon/coupon';

@IonicPage()
@Component({
  selector: 'page-coupon',
  templateUrl: 'coupon.html',
})
export class CouponPage {

  coupon: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public couponProvider: CouponProvider,
    public userProvider: UserProvider,
  ) {
    this.coupon = this.navParams.get('coupon');
  }

  onUse() {
    this.alertCtrl.create({
      title: this.coupon.vendorName,
      message: 'Pokaži telefon zaposlenemu:',
      inputs: [
        {
          name: 'pin',
          placeholder: 'PIN',
        },
      ],
      buttons: [{
        text: 'Cancel',
        handler: () => {},
      }, {
        text: 'OK',
        handler: (data) => {
          if ('' + this.coupon.pin === data.pin) {
            // OK
            this.alertCtrl.create({
              title: 'Uspeh!',
              message: 'PIN je pravilen.',
              buttons: [{
                text: 'OK',
                handler: () => {
                  // Mark used
                  this.couponProvider.markUsed(this.userProvider.userId, this.coupon);
                  this.onClose();
                },
              }],
            }).present();
          } else {
            // Error
            this.alertCtrl.create({
              title: 'Napaka!',
              message: 'PIN je napačen.',
              buttons: [{
                text: 'OK',
                handler: () => {},
              }],
            }).present();
          }
        },
      }]
    }).present();
  }

  onClose() {
    this.navCtrl.pop();
  }
}
