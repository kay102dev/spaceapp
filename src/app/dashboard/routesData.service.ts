import {Injectable} from "@angular/core";
import {DashboardUrlService} from "./dashboard-url.service";
import {AppUtil} from "../utility/appUtil";

@Injectable()
export class RoutesDataService {

    constructor(private dashboardUrlService: DashboardUrlService, private appUtil: AppUtil) {

    }

    async convertRoutesArrToJson(planetRoutesJson, planetRoutesArr) {
        if (this.appUtil.isObjEmpty(planetRoutesJson)) {
            await this.dashboardUrlService.addUndirectedEdges(planetRoutesArr);
            await this.dashboardUrlService.turnArrayToJson(planetRoutesArr, planetRoutesJson);
            await this.dashboardUrlService.formatJson(planetRoutesArr, planetRoutesJson);
            await this.dashboardUrlService.deleteUnusedJsonProperties(planetRoutesJson);
        }
    }
}
