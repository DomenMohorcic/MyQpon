import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { ToastController } from 'ionic-angular';

/*
  Generated class for the ToastProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ToastProvider {

  constructor(
    public toastCtrl: ToastController,
  ) {
  }

  show(message: string, position = 'top', duration = 3000) {
    this.toastCtrl.create({
      message,
      duration,
      position,
    }).present();
  }
}
