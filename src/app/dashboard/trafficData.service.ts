import {Level} from "../utility/logger-level";
import {Logger} from "../utility/logger";
import {Injectable} from "@angular/core";
import {AppUtil} from "../utility/appUtil";
import {DashboardUrlService} from "./dashboard-url.service";


@Injectable()
export class TrafficDataService {

    constructor(private dashboardUrlService: DashboardUrlService, private appUtil: AppUtil) {

    }

    public async convertTrafficArrToJson(trafficJson, trafficArr) {
        // format Traffic Json
        if (this.appUtil.isObjEmpty(trafficJson)) {
            await this.dashboardUrlService.addUndirectedEdges(trafficArr);
            // convert array to JSON object
            await this.dashboardUrlService.turnArrayToJson(trafficArr, trafficJson);
            // format the newly created JSON object for our app
            await this.dashboardUrlService.formatJson(trafficArr, trafficJson);
            // // Further delete unused properties on the object
            await this.dashboardUrlService.deleteUnusedJsonProperties(trafficJson);
        }
    }

    async getSumOfTrafficAndPlanetObj(trafficJson, planetRoutesJson) {

        // Create a new Object off the 2 arrays and sum each of the Planet Node values
        if (await !this.appUtil.isObjEmpty(trafficJson) && await !this.appUtil.isObjEmpty(planetRoutesJson)) {
            let _this = this;
            //Deep copy both Json Files and convert them into arrays
            let planetRoutesJsonCopy = JSON.parse(JSON.stringify(planetRoutesJson));
            const planetArr = Object.entries(planetRoutesJsonCopy);

            let trafficJsonCopy = JSON.parse(JSON.stringify(trafficJson));
            const trafficArr = Object.entries(trafficJsonCopy);

            const newTrafficObj = {};
            planetArr.forEach(function (objASingleObj, i) { // iterate each object within the Object Array
                newTrafficObj[objASingleObj[0]] = objASingleObj[1]; // Assign the new object all key value pairs i.e a : {a: 12, b: 12}
                for (const key in objASingleObj[1]) { // loop within each iterated object and find the keys i.e planetNode
                    if ( trafficArr[i] !== undefined ) {
                        console.log('quick check object',  objASingleObj[1]);
                        console.log('quick check key',  objASingleObj[1]);
                        console.log('quick check if exists',  trafficArr[i][1].hasOwnProperty(key));
                        console.log('quick check traffic Arr', trafficArr[i][0]);
                        console.log('quick check traffic Arr1', trafficArr[i][1]);
                        if (trafficArr[i][1].hasOwnProperty(key)) { // iterate each key value pair and check whether key from the this.planetRoutesJson exists in the traffic Json
                            if (typeof trafficArr[i][1][key] !== 'object') {
                                const int = parseFloat(planetArr[i][1][key] + trafficArr[i][1][key]).toFixed(2);
                                newTrafficObj[objASingleObj[0]][key] = +int;
                            }
                        } else {
                            newTrafficObj[objASingleObj[0]][key] = planetArr[i][1][key];
                            //return newTrafficObj;
                        }
                    }
                }
            });

            await Logger.log(Level.LOG, 'JSON : planetRoutesJson: ', planetRoutesJson);
            await Logger.log(Level.LOG, 'JSON : trafficJson: ', trafficJson);
            console.log('newTrafficObj ', newTrafficObj);

            return newTrafficObj;

        }
    }

}