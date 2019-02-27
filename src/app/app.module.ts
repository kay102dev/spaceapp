import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

//Angularfire2
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {AngularFireModule} from 'angularfire2';

import {AppComponent} from './app.component';
import {LoginpageComponent} from './loginpage/loginpage.component';
import {DashboardComponent} from './dashboard/dashboard.component';

//Services
import {AuthService} from './services/auth.service';
import {AuthguardService} from './services/authguard.service';

//environments
import {environment} from '../environments/environment';

//routes
import {appRoutes} from './routes';
import {HttpClientModule} from '@angular/common/http';
import {XlsFirestoreRoutesService} from './services/xls-firestore-routes.service';
import {XlsFirestoreTrafficService} from './services/xls-firestore-traffic.service';
import {XlsFirestoreNamesService} from './services/xls-firestore-names.service';
import {AppFirestoreService} from './services/app-firestore.service';
import {CommonModule, DecimalPipe} from '@angular/common';
import {BillionPipe} from './pipes/format-trillion.pipe';
import {DashboardUrlService} from "./dashboard/dashboard-url.service";
import {RoutesDataService} from "./dashboard/routesData.service";
import {TrafficDataService} from "./dashboard/trafficData.service";
import {AppUtil} from "./utility/appUtil";
import {NgCytoScape} from "./dashboard/ng-cytoscape.directive";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@NgModule({
    declarations: [
        AppComponent,
        LoginpageComponent,
        DashboardComponent,
        BillionPipe,
        NgCytoScape

    ],
    imports: [
        CommonModule,
        BrowserModule,
        AngularFireModule.initializeApp(environment.config),
        AngularFirestoreModule.enablePersistence(),
        FormsModule,
        HttpClientModule,
        RouterModule.forRoot(appRoutes),
        BrowserAnimationsModule
    ],
    exports: [BillionPipe],
    providers: [
        DecimalPipe,
        AuthguardService,
        AuthService,
        AngularFireAuth,
        XlsFirestoreRoutesService,
        XlsFirestoreTrafficService,
        XlsFirestoreNamesService,
        AppFirestoreService,
        DashboardUrlService,
        RoutesDataService,
        TrafficDataService,
        AppUtil,
        NgCytoScape
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
