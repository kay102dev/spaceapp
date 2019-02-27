import {Injectable} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import {DashboardUrlService} from "../dashboard/dashboard-url.service";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class XlsFirestoreTrafficService {
    constructor(private afs: AngularFirestore, private httpClient: HttpClient) {
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
                    this.storeTrafficInFireStore(data).then(() => {
                        resolve();
                    });

                });
            });
        });

    }
    private storeTrafficInFireStore(trafficJson) {
        return new Promise((resolve) => {
            trafficJson.forEach((element, i) => {
                console.log('traffic element i', i);
                console.log('traffic element', element);
                // save each of the distances to our routes collection
                this.afs.collection('traffic').doc((i + 1).toString()).set(
                    element
                );
            });
            resolve();
        });

    }

}
