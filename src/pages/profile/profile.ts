import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserProvider } from '../../providers/user';
import { VendorProvider } from '../../providers/vendor/vendor';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  public vendors: Observable<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userProvider: UserProvider,
    public vendorProvider: VendorProvider,
  ) {
    this.vendors = this.vendorProvider.get();
  }

  onSignOut() {
    this.userProvider.signOut();
  }

}
