import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { Component } from '@angular/core';
import { Deeplinks } from '@ionic-native/deeplinks';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links';

import { LoadingProvider } from '../providers/loading/loading';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { UserProvider } from '../providers/user';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage:any;

  constructor(
    public platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public loadingProvider: LoadingProvider,
    public userProvider: UserProvider,
    private afAuth: AngularFireAuth,
    private deeplinks: Deeplinks,
    private firebaseDynamicLinks: FirebaseDynamicLinks,
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });

    this.afAuth.authState.subscribe((authUser: firebase.User) => {
      if (!authUser) {
        this.rootPage = LoginPage;
      } else {
        this.loadingProvider.loading = true;
        this.rootPage = TabsPage;
      }
    });
  }

  ngAfterViewInit() {

    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {

        this.firebaseDynamicLinks.onDynamicLink()
        .then((res: any) => console.log('onDynamicLink', res)) //Handle the logic here after opening the app with the Dynamic link
        .catch(() => {});

        const dlSub = this.deeplinks.route({
          '/app/r/:uid': () => null,
        })
        .subscribe(match => {
          dlSub.unsubscribe();
          console.log('deeplink match', match.$args.uid);
          this.userProvider.referralId = match.$args.uid;
        }, nomatch => {});
      }
    });
  }

  // handleReferral() {

  // }
}
