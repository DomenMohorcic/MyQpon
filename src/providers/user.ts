import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from 'angularfire2/database';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { LoadingProvider } from './loading/loading';
import { AlertController } from 'ionic-angular';
import { ToastProvider } from './toast/toast';
import { CouponProvider } from './coupon/coupon';

@Injectable()
export class UserProvider {

  user$ = new BehaviorSubject(null);
  userId: string;
  referralId: string;

  private user: any;

  constructor(
    public db: AngularFireDatabase,
    public loadingProvider: LoadingProvider,
    public alertCtrl: AlertController,
    public couponProvider: CouponProvider,
    public toastProvider: ToastProvider,
    private afAuth: AngularFireAuth,
  ) {
    afAuth.authState.subscribe((authUser: firebase.User) => {
      let userSub;

      if (!authUser) {
        if (userSub && userSub.unsubscribe) userSub.unsubscribe();

        this.user = null;
        this.userId = null;
        this.user$.next(this.user);
      } else {
        console.log('authUser', authUser);

        this.userId = authUser.uid;

        userSub = this.db.object(`/users/${authUser.uid}`)
        .subscribe(user => {
          console.log('user#user', user);

          this.user = user;

          if (!user.$exists()) {
            console.log('new user');

            const user = {
              displayName: authUser.displayName,
              level: 0,
              xp: 0,
              photoURL: authUser.photoURL,
            };

            this.db.object(`/users/${authUser.uid}`).update(user)
            .then(() => {
              this.loadingProvider.loading = false;
              this.user$.next(this.user);
            });

            this.db.object(`/couponLimits/${authUser.uid}`)
            .set(1);

            if (this.referralId) {
              console.log('give refferal credit');

              this.db.object(`/couponLimits/${this.referralId}`).$ref.ref
              .transaction(limit => {
                if (limit !== null && limit < 5) {
                  // TODO: Notify user about this
                  limit = limit + 1;
                  this.referralId = null;
                }
                return limit;
              });
            }

          } else {
            const mycouponsSub = this.couponProvider.getMyCoupons(authUser.uid)
            .map(coupons => this.user.coupons = coupons)
            .subscribe(() => {
              this.loadingProvider.loading = false;
              this.user$.next(this.user);
              mycouponsSub.unsubscribe();
            }, () => {});
          }
        }, console.log);
      }
    });
  }

  acceptCoupon(coupon) {
    return Observable.create(obs => {
      console.log('acceptCoupon');

      const myCouponsSub = this.couponProvider
      .getMyCoupons(this.userId, { orderByChild: 'used', equalTo: false })
      .map(coupons => coupons.length)
      .subscribe(numUnused => {
        console.log('user#acceptCoupon unused', numUnused);
        myCouponsSub.unsubscribe();

        const limitSub = this.getCouponLimit(this.userId)
        .map(limit => limit.$value)
        .subscribe(limit => {
          limitSub.unsubscribe();

          const hasRoom = limit - numUnused;
          console.log('hasRoom', hasRoom);

          if (hasRoom <= 0) {
            console.log('backpack full');

            const noRoomConfirm = this.alertCtrl.create({
              title: 'Pozor!',
              message: 'Tvoj nahrbtnik je že zapolnjen s kuponi, želiš zamenjati en obstoječ kupon z novim?',
              buttons: [{
                text: 'Prekliči',
                handler: () => obs.next(),
              }, {
                text: 'Zamenjaj',
                handler: () => {
                  this.couponProvider.store(this.userId, coupon, true)
                  .subscribe(() => obs.next(true));
                }
              }],
            });

            noRoomConfirm.present();
          } else {
            console.log('has room to store');
            this.couponProvider.store(this.userId, coupon)
            .subscribe(() => obs.next(true));
          }
        });
      }, () => {});
    });
  }

  getCouponLimit(userId) {
    return this.db.object(`/couponLimits/${userId}`);
  }

  getLevel(xp = this.user.xp) {
    const lvl = Math.floor((Math.sqrt(1 + 4 * xp / 50) - 1) / 2);
    // console.log(lvl);
    return lvl;
  }

  getRequiredXPforNextLvl(xp: number) {
    const lvl = this.getLevel(xp) + 1;
    const reqXp = lvl * (lvl + 1) * 50;
    return reqXp - xp;
  }

  saveXP(xp: Number) {
    const newXP = this.user.xp + xp;

    const user = {
      level: this.getLevel(newXP),
      xp: newXP,
    };

    if (this.user.level < user.level) {
      this.toastProvider.show(`Bravo! Dosegel si level ${user.level}`);
    }

    this.db.object(`/users/${this.userId}`).update(user);
  }

  signOut() {
    this.afAuth.auth.signOut();
  }
}
