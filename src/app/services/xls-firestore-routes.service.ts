import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AngularFirestore} from 'angularfire2/firestore';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import {DashboardUrlService} from "../dashboard/dashboard-url.service";
@Injectable()
export class XlsFirestoreRoutesService {
    constructor(private afs: AngularFirestore, private httpClient: HttpClient ) {
    }

    // WRITE
    createFireStoreCollection(documentPath) {
        // FireBase storage reference for planet names
        const docPath = firebase.storage().ref(documentPath);
        return new Promise((resolve) => {
            // Get URL of the JSON file stored in FireBase Storage
            docPath.getDownloadURL().then((url) => {
                //       console.log(documentPath + ' planet_names url: ', url);
                this.httpClient.get(url).subscribe((data) => {
                    // const dataString = JSON.stringify(data);
                    // console.log(documentPath + ' data', dataString);
                    // store data fireStore
                    this.storeRoutesInFireStore(data).then(() => {
                        resolve();
                    });

                });
            });
        });

    }

    private storeRoutesInFireStore(routesJson) {
        return new Promise((resolve) => {
            routesJson.forEach((element, i) => {
                console.log('Routes element', element);
                // save each of the distances to our routes collection
                this.afs.collection('routes').doc((i + 1).toString()).set(
                    element
                ).then(() => {
                    resolve();
                });
            });
            resolve();
        });


    }
}
