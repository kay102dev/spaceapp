import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-loginpage',
  templateUrl: './loginpage.component.html',
  styleUrls: ['./loginpage.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class LoginpageComponent {

  usercreds = {
    email: 'a@b.com',
    password: '111111'
  };
  errorMessage: string;
  showError: boolean;

  constructor(private afauth: AngularFireAuth, private auth: AuthService) {

  }

  login() {
    this.auth.login(this.usercreds);
    this.auth.errorMessage.subscribe(errmsg => {
      if (errmsg !== undefined) {
          this.errorMessage = errmsg;
          this.showError = true;
          console.log('msg', errmsg);
      }

    });

  }

}
