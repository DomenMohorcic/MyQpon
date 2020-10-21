import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';

import { Platform } from 'ionic-angular';
import { LoadingProvider } from '../../providers/loading/loading';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    public loadingProvider: LoadingProvider,
    private fb: Facebook,
    private google: GooglePlus,
    private platform: Platform,
  ) {
  }

  onSignInWithSocial(type: string) {
    if (this.platform.is('cordova')) {
      this[`login${type}`]()
      .then(res => {
        let resCred;
        if (type === 'Facebook') {
          resCred = res.authResponse.accessToken;
        } else {
          resCred = res.idToken;
        }

        const credential = firebase.auth[`${type}AuthProvider`]
          .credential(resCred);
        return firebase.auth().signInWithCredential(credential);
      })
      .then(this.loggedIn)
      .catch(err => console.log(err));
    } else {
      // this.loadingProvider.loading = true;

      this.afAuth.auth
      .signInWithPopup(new firebase.auth[`${type}AuthProvider`]())
      .then(this.loggedIn)
      .catch((err) => {
        console.log(err);
        this.loadingProvider.loading = false;
        // this.alertCtrl.create({
        //   title: 'Pozor',
        //   message: 'Prijava neuspešna.'
        // })
      });
    }
  }

  private loggedIn(res) {
    console.log(res);
  }

  private loginFacebook() {
    return this.fb.login(['email', 'public_profile']);
  }

  private loginGoogle() {
    return this.google.login({
      offline: true,
      webClientId: '574454849308-gja5a5vsnlcnfqqcchk65d1ggv2ltdrg.apps.googleusercontent.com',
    });
  }
}
