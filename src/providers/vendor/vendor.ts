import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class VendorProvider {

  constructor(
    public db: AngularFireDatabase,
  ) {
  }

  get() {
    return this.db.list(`/vendors/`);
  }

}
