import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { CouponProvider } from '../../providers/coupon/coupon';
import { UserProvider } from '../../providers/user';
import { CouponPage } from '../coupon/coupon';

@IonicPage()
@Component({
  selector: 'page-coupons',
  templateUrl: 'coupons.html',
})
export class CouponsPage {

  public coupons: Array<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public couponProvider: CouponProvider,
    public userProvider: UserProvider,
    public modalCtrl: ModalController,
  ) {
    this.coupons = [];

    this.userProvider.user$
    .subscribe(() => {
      const couponSub = this.couponProvider.getMyCoupons(this.userProvider.userId)
      .subscribe(coupons => {
        console.log('users coupons', coupons);
        this.coupons = coupons;
        couponSub.unsubscribe();
      }, () => {});
    });
  }

  onOpenCoupon(coupon) {
    let modal = this.modalCtrl.create(CouponPage, { coupon });
    modal.present();
  }
}
