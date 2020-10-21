import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { CouponsPage } from '../coupons/coupons';
import { ProfilePage } from '../profile/profile';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = CouponsPage;
  tab3Root = ProfilePage;

  constructor() {

  }
}
