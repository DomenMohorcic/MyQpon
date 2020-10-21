import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { LoadingController } from 'ionic-angular';

@Injectable()
export class LoadingProvider {

  public isLoading: Boolean;
  private loader: any;

  constructor(
    public loadingCtrl: LoadingController,
  ) {
    this.isLoading = false;
  }

  set loading(val: Boolean) {
    this.isLoading = val;

    if (val) {
      this.loader = this.loadingCtrl.create({
        content: 'Please wait ...',
      });

      this.loader.present();

    } else if (!!this.loader) {
      this.loader.dismiss();
      this.loader = null;
    }
  }
}
