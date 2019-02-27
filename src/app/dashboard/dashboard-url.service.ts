import {Injectable} from "@angular/core";
import {AngularFirestore} from "angularfire2/firestore";
import {Level} from "../utility/logger-level";
import {Logger} from "../utility/logger";
import {HttpClient} from "@angular/common/http";
import * as firebase from 'firebase';
import {BehaviorSubject} from "rxjs/Rx";
import {XlsFirestoreNamesService} from "../services/xls-firestore-names.service";
import {XlsFirestoreRoutesService} from "../services/xls-firestore-routes.service";
import {XlsFirestoreTrafficService} from "../services/xls-firestore-traffic.service";
import {AppUtil} from "../utility/appUtil";

@Injectable()
export class DashboardUrlService {

    adjacencyList = [];

    ref = firebase.storage().ref('graph_excel_file');
    private appStateMessage = new BehaviorSubject(' ');
    currentAppStateMessage = this.appStateMessage.asObservable();
    FireBaseSequenceMessageSequence: any;

    constructor(private afs: AngularFirestore,
                private httpClient: HttpClient,
                private xlsFirestoreNamesService: XlsFirestoreNamesService,
                private xlsFirestoreRoutesService: XlsFirestoreRoutesService,
                private xlsFirestoreTrafficService: XlsFirestoreTrafficService) {

        this.FireBaseSequenceMessageSequence = {
            store: 'Storing Excel file to FireBase Storage',
            step2: 'Converting Planet Names JSON to a fireStore Collection',
            step3: 'Converting Routes JSON to a fireStore Collection',
            step4: 'Converting Traffic JSON to a fireStore Collection',
            done: 'Excel file has been stored successfully, and each JSON file converted to its FireStore Collection.'
        };
    }
    public uploadFile(file) {
        return new Promise((resolve) => {
            // set excel url to firebase storage
            this.appStateMessage.next(this.FireBaseSequenceMessageSequence.store);
            this.setExcelFileUrlToFB(file);
            /****
             * Given more time, i would write an async method checking if cloud function has finished executing
             * all excel sheets to JSON files are complete and thereafter async call the asyncStoreEachSheet instead of setTimeOut
             *
             **/
            // TODO: remove async method and write promised based async method instead
            setTimeout(() => {
                this.asyncStoreEachSheet();
                resolve();
            }, 5000);

        });
    }
    // READ
    getFireStoreCollection(documentPath, arr) {
        const collection = this.afs.collection(documentPath);
        collection.ref.get().then(snapshot => {
            console.log('getFireStoreCollection ', snapshot);
            snapshot.forEach((doc) => {
                arr.push(doc.data());
            });
        }).catch(err => {
            console.log('Error getting documents', err);
        });
    }


    async addUndirectedEdges(Arr) {
        let DeepCopyArr = JSON.parse(JSON.stringify(Arr));
        Arr.forEach(async (data, i) => {
            let a = data['Planet Origin'];
            DeepCopyArr[i]['Planet Origin'] = data['Planet Destination'];
            DeepCopyArr[i]['Planet Destination'] = a;
        });
        Array.prototype.push.apply(Arr, DeepCopyArr);
    }

    async turnArrayToJson(Arr, JsonObj) {
        return await Arr.forEach(data => {
            JsonObj[data['Planet Origin']] = data;
        });
    }

    async formatJson(Arr, JsonObj) {
        Arr.forEach(async (data) => {
            if (JsonObj[data['Planet Origin']][data['Planet Destination']] === undefined) {
                JsonObj[data['Planet Origin']][data['Planet Destination']] = {};
                if (data['Traffic Delay (Light Years)']) {
                    JsonObj[data['Planet Origin']][data['Planet Destination']] = data['Traffic Delay (Light Years)'];
                }
                if (data['Distance(Light Years)']) {
                    JsonObj[data['Planet Origin']][data['Planet Destination']] = data['Distance(Light Years)'];
                }
            }
        });
        console.log('JsonObj ', JsonObj);
        return JsonObj;
    }

    async deleteUnusedJsonProperties(JsonObj) {
        // further format and clean up our JSON object
        const jsonObjectCopy = JsonObj;
        for (const property in JsonObj) {
            // condition to check if it is Routes JSON
            if (jsonObjectCopy[property + '']['Distance(Light Years)']) {
                delete jsonObjectCopy[property + '']['Planet Destination'];
                delete jsonObjectCopy[property + '']['Distance(Light Years)'];
                delete jsonObjectCopy[property + '']['Planet Origin'];
                delete jsonObjectCopy[property + '']['Route Id'];
            }
            // condition to check if it is Traffic JSON
            if (jsonObjectCopy[property + '']['Traffic Delay (Light Years)']) {
                delete jsonObjectCopy[property + '']['Planet Destination'];
                delete jsonObjectCopy[property + '']['Traffic Delay (Light Years)'];
                delete jsonObjectCopy[property + '']['Planet Origin'];

            }
        }
        Logger.log(Level.LOG, 'How our JSON looks after deleting unused properties: ', jsonObjectCopy);
    }

    // Set the fireBase excel file reference url in the fireBase database
    private setExcelFileUrlToFB(file) {
        // store excel file to firebase
        this.ref.put(file).then(function (snapshot) {
            // get the excel file firebase url and then ...
            snapshot.ref.getDownloadURL().then(function (downloadURL) {
                console.log('File available at', downloadURL);
                // Set the url in the firebase database
                firebase.database().ref('excel_import').child('graph_excel_link').set({
                    fileUrl: downloadURL
                }).then(() => {
                });
            });
        });
    }

    private async asyncStoreEachSheet() {
        // After all sheets have been converted to JSON, fireStore each of them into FireStore
        await this.storeRoutesSheet();
        await this.storeTrafficSheet();
        await this.storePlanetNamesSheet();
        this.appStateMessage.next(this.FireBaseSequenceMessageSequence.done);
        AppUtil.addClass('.ellipsis-animate', 'done');

    }


    // fetch fireBase url for the json sheet in fireBase storage and then store a fireStore as a collection
    async storePlanetNamesSheet() {
         this.appStateMessage.next(this.FireBaseSequenceMessageSequence.step2);
         await this.xlsFirestoreNamesService.createFireStoreCollection('planet_names.json');
    }

    // fetch fireBase url for the json sheet in fireBase storage and then store a fireStore as a collection
    async storeRoutesSheet() {
        this.appStateMessage.next(this.FireBaseSequenceMessageSequence.step3);
        await this.xlsFirestoreRoutesService.createFireStoreCollection('routes.json');
    }


    // fetch fireBase url for the json sheet in fireBase storage and then store a fireStore as a collection
    async storeTrafficSheet() {
        this.appStateMessage.next(this.FireBaseSequenceMessageSequence.step4);
        await this.xlsFirestoreTrafficService.createFireStoreCollection('traffic.json');
    }


}


