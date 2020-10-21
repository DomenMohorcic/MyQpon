import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import { BrowserModule } from '@angular/platform-browser';
import { Deeplinks } from '@ionic-native/deeplinks';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { NgModule, ErrorHandler } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links';

import { MyApp } from './app.component';
import { GamePage } from '../pages/game/game';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { UserProvider } from '../providers/user';
import { LoadingProvider } from '../providers/loading/loading';
import { CouponProvider } from '../providers/coupon/coupon';
import { ToastProvider } from '../providers/toast/toast';
import { CouponsPage } from '../pages/coupons/coupons';
import { ProfilePage } from '../pages/profile/profile';
import { FilterPipe } from '../pipes/filter/filter';
import { CouponPage } from '../pages/coupon/coupon';
import { VendorProvider } from '../providers/vendor/vendor';

export const firebaseConfig = {
  apiKey: 'AIzaSyC3lBnfZN11MikqzQXyNnBcwxge5G85cxk',
  authDomain: 'myqpon-fff9c.firebaseapp.com',
  databaseURL: 'https://myqpon-fff9c.firebaseio.com',
  storageBucket: 'myqpon-fff9c.appspot.com',
  messagingSenderId: '574454849308',
};

@NgModule({
  declarations: [
    MyApp,
    FilterPipe,
    HomePage,
    TabsPage,
    GamePage,
    LoginPage,
    CouponsPage,
    ProfilePage,
    CouponPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    TabsPage,
    GamePage,
    LoginPage,
    CouponsPage,
    ProfilePage,
    CouponPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Facebook,
    GooglePlus,
    UserProvider,
    LoadingProvider,
    CouponProvider,
    ToastProvider,
    Deeplinks,
    FirebaseDynamicLinks,
    VendorProvider,
  ]
})
export class AppModule {}
