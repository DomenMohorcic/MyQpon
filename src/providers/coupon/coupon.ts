import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import { AngularFireDatabase } from 'angularfire2/database';
import { ToastProvider } from '../toast/toast';

@Injectable()
export class CouponProvider {

  constructor(
    public db: AngularFireDatabase,
    public toastProvider: ToastProvider,
  ) {
  }

  getMyCoupons(userId, query: object = { orderByChild: 'used', orderByValue: true, }) {
    return this.db.list(`/users/${userId}/coupons`, { query });
  }

  markUsed(userId, coupon) {
    this.db.object(`/users/${userId}/coupons/${coupon.$key}/used`).$ref.ref
    .transaction(used => {
      if (used !== null) {
        used = true;
      }
      return used;
    })
    .catch(() => {});

    this.db.object(`/coupons/${coupon.couponId}/used`).$ref.ref
    .transaction(used => {
      if (used !== null) {
        used = used + 1;
      }
      return used;
    })
    .catch(() => {});

    // this.db.object(`/users/${userId}/coupons/${coupon.$key}`)
    // .update({ used: true });

    // const couponSub = this.db.object(`/coupons/${coupon.couponId}`)
    // .subscribe(coupon => {
    //   couponSub.unsubscribe();

    //   this.db.object(`/coupons/${coupon.$key}`)
    //   .update({ used: coupon.used + 1 });
    // });
  }

  offer(xp) {
    return Observable.create(obs => {
      const couponsSub = this.db.list('/coupons')
      .filter(coupons => coupons.filter(c => c.saved < c.available))
      .subscribe(coupons => {
        couponsSub.unsubscribe();

        const rand = Math.floor(Math.random() * coupons.length);
        obs.next(coupons[rand]);

        // Track view
        this.db.object(`/coupons/${coupons[rand].$key}/views`).$ref.ref
        .transaction(views => {
          if (views !== null) {
            views = views + 1;
          }
          return views;
        })
        .catch(() => {});
      }, () => {});
    });
  }

  store(userId, coupon, overwrite = false) {
    return Observable.create(obs => {
      console.log('store', coupon);

      new Promise((resolve, reject) => {
        if (overwrite) {
          const couponsSub = this.getMyCoupons(userId, { orderByChild: 'used', orderByValue: false })
          .subscribe(coupons => {
            const r = Math.floor(Math.random() * coupons.length);
            const rCoupon = coupons[r];

            // Put back to pool
            this.db.object(`/coupons/${rCoupon.couponId}/saved`).$ref.ref
            .transaction(saved => {
              if (saved !== null) {
                saved = saved - 1;
              }
              return saved;
            })
            .catch(() => {});

            // .subscribe(coupon => {

            //   // Update saved
            //   this.db.object(`/coupons/${coupon.$key}`)
            //   .update({ saved: coupon.saved - 1});
            //   cSub.unsubscribe();
            // });

            // Remove from his backpack
            this.db.object(`/users/${userId}/coupons/${rCoupon.$key}`).remove()
            .then(() => resolve())
            .catch(() => {});
            // TODO: Return to pool for others
            couponsSub.unsubscribe();
          }, () => {});
        } else {
          return resolve();
        }
      })
      .then(() => {
        coupon.couponId = coupon.$key;
        coupon.used = false;

        this.db.list(`/users/${userId}/coupons`).push(coupon)
        .then(done => {
          // Increment saved val
          this.db.object(`/coupons/${coupon.$key}`)
          .update({ saved: coupon.saved + 1}).catch(() => {});

          this.toastProvider.show(`Kupon uspešno shranjen v nahrbtnik.`);
          obs.next();
        })
        .catch(obs.error);
      });
    });
  }
}
