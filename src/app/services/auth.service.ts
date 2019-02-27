import {Injectable} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs/index';

@Injectable()
export class AuthService {

    authState;
    private errorSubject = new BehaviorSubject(' ');
    errorMessage = this.errorSubject.asObservable();

    constructor(private afauth: AngularFireAuth, private router: Router) {
    }

    login(usercreds) {
        this.afauth.auth.signInWithEmailAndPassword(usercreds.email, usercreds.password).then((user) => {
            this.authState = user;
            this.router.navigate(['dashboard']);
        }).catch(err => {
            this.errorSubject.next(err.message);
        });

    }

    authUser(): boolean {
        return this.authState !== null && this.authState !== undefined ? true : false;
    }

}
