import {Injectable} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import * as firebase from 'firebase';
import {AppUtil} from "../utility/appUtil";
import {HttpClient} from "@angular/common/http";
@Injectable()
export class XlsFirestoreNamesService {
    constructor(private afs: AngularFirestore, private httpClient: HttpClient,  private  appUtil: AppUtil) {
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
                    this.storePlanetNamesInFireStore(data).then(() => {
                        resolve();
                    });

                });
            });
        });

    }
    // save to fireStore collection
    private storePlanetNamesInFireStore(data) {
        return new Promise((resolve) => {
            data.forEach((element) => {
                console.log('Planet element', element);
                // save each of the distances to our routes collection
                this.afs.collection('planet_names').doc(Object.values(element)[0]).set(
                    element
                );
            });
            resolve();
        });
    }


    // get results path and retrieve the planet names accordingly
    getPlanetNamesFromPlanetNodes(nodesArr, planetNamesArr) {
        console.log("check1", nodesArr);
        console.log("check2", planetNamesArr);

        if (nodesArr !== undefined) {
            if (!this.appUtil.isObjEmpty(nodesArr)) {
                const Arr = [];
                console.log('check sequence ', nodesArr);
                nodesArr.forEach((node) => {
                    planetNamesArr.forEach((planetName) => {
                        if (node == planetName['Planet Node']) {
                            Arr.push(planetName['Planet Name'] + ', ' + node);
                        }
                    });
                });
                return Arr;
            }
        }
    }
}
