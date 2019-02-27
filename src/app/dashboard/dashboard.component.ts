import {
    ChangeDetectorRef,
    Component, ElementRef, Input,
    OnInit,
    Renderer2,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {AppFirestoreService} from '../services/app-firestore.service';
import {Logger} from '../utility/logger';
import {Level} from '../utility/logger-level';
import {NgForm} from '@angular/forms';
import {DashboardUrlService} from './dashboard-url.service';
import {AppUtil} from '../utility/appUtil';
import {TrafficDataService} from './trafficData.service';
import {RoutesDataService} from './routesData.service';
import {XlsFirestoreNamesService} from '../services/xls-firestore-names.service';
import {BaseDijkstraGraph} from '../services/base-dijkstra-graph';
import {cytoscape} from 'cytoscape';
import {cydagre} from 'cytoscape-dagre';
import {AuthService} from '../services/auth.service';
import {spaceShipAppAnimation} from './animation';
import {NgCytoScape} from './ng-cytoscape.directive';
import {BehaviorSubject} from 'rxjs/index';
import {ResultsInterface} from './results.interface';


declare let cytoscape: any;
declare let jquery: any;


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [spaceShipAppAnimation],

})

export class DashboardComponent extends BaseDijkstraGraph implements OnInit {
    startNodeValue;
    starting;
    endNodeValue;
    destination;

    incorrectFileType = false;
    exp = 'loaded';
    @ViewChild(NgCytoScape) ngDirecCy: NgCytoScape;

    private resultsSubject = new BehaviorSubject<ResultsInterface[]>([]);
    resultsData = this.resultsSubject.asObservable();
    results;

    private resultsWithTrafficSubject = new BehaviorSubject<ResultsInterface[]>([]);
    resultsWithTrafficData = this.resultsWithTrafficSubject.asObservable();
    resultsWithTraffic;

    @Input() public elements: any;
    @Input() public style: any;
    @Input() public zoom: any;

    public readonly title = 'Dijkstra-Application';
    // Algorithm variables

    @ViewChild('dijkstraForm') dijkstraForm: NgForm;

    // Data Service variables
    appStateText = ' ';
    showMessage: boolean = false;
    showDistanceText: boolean = false;


    lightYearConstantDistance: number = 9460730472580800; // 9,461 quadrillion meters
    passengerTravelSpeed: number = 7500000000000; // 7.5 trillion m/s

    planetRoutesArr: any [] = [];
    planetRoutesJson: any = {};

    trafficArr: any [] = [];
    trafficJson: any = {};
    // combined planetRoutesJson and trafficJson
    planetRoutesJsonWithTraffic: any = {};


    planetNamesArr: any [] = [];
    // Planet Names from results and variables for UI print
    planetNamesFromPlanetNodes;
    // Shortest Path results without Traffic
    distance;
    CalculateHowMuchTime: number;


    // Planet Names from results With Traffic and variables for UI print
    showDistanceTextWithTraffic: boolean = false;
    planetNamesFromPlanetNodesWithTraffic;
    // Shortest Path results with Traffic
    distanceWithTraffic;
    CalculateHowMuchTimeWithTraffic: number;
    ngInjectableDef;

    // cytoscape var
    layout;
    bfs;

    // All vars below print to UI
    originPlanetName;
    destinationPlanetName;
    originPlanetNameWithTraffic;
    destinationPlanetNameWithTraffic;

    showtrafficCheckBox = false;

    constructor(
        private appFirestoreService: AppFirestoreService,
        private dashboardUrlService: DashboardUrlService,
        private ref: ChangeDetectorRef,
        private appUtil: AppUtil,
        private trafficDataService: TrafficDataService,
        private routesDataService: RoutesDataService,
        private xlsFirestoreNamesService: XlsFirestoreNamesService,
        private renderer: Renderer2, private el: ElementRef,
        private authService: AuthService
    ) {
        super();
        this.ngInjectableDef = undefined;

    }


    async ngOnInit() {
        await this.appUtil.initFileBrowser('#chooseFile');
        await this.fetchAllCollections();
        this.ref.markForCheck();
    }

    async fetchAllCollections() {
        this.dashboardUrlService.getFireStoreCollection('planet_names', this.planetNamesArr);
        this.dashboardUrlService.getFireStoreCollection('traffic', this.trafficArr);
        this.dashboardUrlService.getFireStoreCollection('routes', this.planetRoutesArr);
    }

    calcTravelTimeInHours(distance) {
        const timeInSec = (distance * this.lightYearConstantDistance) / this.passengerTravelSpeed;
        const min = timeInSec / 60; // convert to minutes
        return min / 60; // convert to hours
    }

    // Get the Excel File from computer directory and thereafter upload it to Firebase
    selectExcelFile(event): void {
        const fileList: FileList = event.target.files;
        const filename = fileList[0].name;
        const fileExtension = filename.substr(-5);
        if (fileExtension === '.xlsx') {
            this.incorrectFileType = false;
            if (fileList.length > 0) {
                const file = fileList[0];
                this.showMessage = true;
                this.dashboardUrlService.currentAppStateMessage.subscribe(newMessage => {
                    this.appStateText = newMessage;
                });
                this.dashboardUrlService.uploadFile(file).then(() => {
                });
            }
        } else {
             this.incorrectFileType = true;
        }

    }

    adminRole() {
        return this.authService.authState.user.email === 'admin@discovery.com';
    }

    async dijkstraResults(RoutesJson: any, TrafficJson: any) {
        this.resultsWithTraffic = {};
        const startNode = this.dijkstraForm.value.startNode;
        const finishNode = this.dijkstraForm.value.finishNode;

        if (startNode) {
            if (!this.appUtil.isObjEmpty(RoutesJson)) {
                // 1.  Using our graph traversal algorithm, return path and distance i.e VertexList and Cost(Weight);

                this.results = await this.dijkstra(RoutesJson, startNode, finishNode);
                this.resultsSubject.next(this.results);

                this.distance = this.results.distance;

                // 1.1 Calculate the distance travelled
                this.CalculateHowMuchTime = this.calcTravelTimeInHours(this.distance);

                // 2. Find the Names of Nodes, for Print
                this.planetNamesFromPlanetNodes = [];
                this.planetNamesFromPlanetNodes = this.xlsFirestoreNamesService.getPlanetNamesFromPlanetNodes(this.results.path, this.planetNamesArr);
                // 2.2
                this.originPlanetName = this.planetNamesFromPlanetNodes[0];
                this.destinationPlanetName = this.planetNamesFromPlanetNodes.slice(-1)[0];
                // 4. Log to console
                console.log('NodesWithoutTraffic ', this.results.path);
                console.log('distanceWithoutTraffic ', this.distance);
            }
            // Below we Calculating Shortest Path With Traffic
            if (!this.appUtil.isObjEmpty(TrafficJson)) {

                // 1.  Using our graph traversal algorithm, return path and distance i.e VertexList and Cost(Weight);
                this.resultsWithTraffic = this.dijkstra(TrafficJson, startNode, finishNode);

                this.resultsWithTrafficSubject.next(this.resultsWithTraffic);

                this.distanceWithTraffic = this.resultsWithTraffic.distance;


                // 1.1 Calculate the distance travelled
                this.CalculateHowMuchTimeWithTraffic = this.calcTravelTimeInHours(this.distanceWithTraffic);


                // 2. Find the Names of Nodes, for Print
                this.planetNamesFromPlanetNodesWithTraffic = [];
                this.planetNamesFromPlanetNodesWithTraffic = this.xlsFirestoreNamesService.getPlanetNamesFromPlanetNodes(this.resultsWithTraffic.path, this.planetNamesArr);
                // 2.2
                this.originPlanetNameWithTraffic = this.planetNamesFromPlanetNodesWithTraffic[0];
                this.destinationPlanetNameWithTraffic = this.planetNamesFromPlanetNodesWithTraffic.slice(-1)[0];

                console.log('planetNamesFromPlanetNodesWithTraffic', this.planetNamesFromPlanetNodesWithTraffic);

                // 4. Log to console
                console.log('NodesWithTraffic ', this.resultsWithTraffic.path);
                console.log('distanceWithTraffic ', this.distanceWithTraffic);
            }
            // 3. refresh DOM for updated data
            this.ref.markForCheck();

            this.ngDirecCy.cyModelNodesAndPaths(startNode);
        }
    }

    async getShortestPath() {
        this.showtrafficCheckBox = true;
        // If all fireStore collections have been fetched
        if (!this.appUtil.checkIfCollectionsExist(this.planetNamesArr, this.trafficArr, this.planetRoutesArr)) {
            await this.routesDataService.convertRoutesArrToJson(this.planetRoutesJson, this.planetRoutesArr);
            await this.dijkstraResults(this.planetRoutesJson, this.planetRoutesJsonWithTraffic);
            this.showDistanceText = true;
            this.exp = 'in';
            if (!this.appUtil.isObjEmpty(this.planetRoutesJsonWithTraffic)) {
                this.showDistanceTextWithTraffic = true;
            }
        } else {
            await this.fetchAllCollections();
            // TODO: print to say fetching collections please
        }

    }

    async onAddingTraffic(event) {
        this.exp = 'out';
        // hide the results
        this.showDistanceTextWithTraffic = false;
        this.showDistanceText = false;
        if (event.target.checked === true) {
            await this.trafficDataService.convertTrafficArrToJson(this.trafficJson, this.trafficArr);
            this.planetRoutesJsonWithTraffic = await this.trafficDataService.getSumOfTrafficAndPlanetObj(this.trafficJson, this.planetRoutesJson);

        } else {
            this.resultsWithTrafficSubject.next([]);
            // reset results for traffic
            this.planetRoutesJsonWithTraffic = {};
            this.planetNamesFromPlanetNodesWithTraffic = [];
            this.distanceWithTraffic = '';
            this.CalculateHowMuchTimeWithTraffic = 0;

        }

    }


    // TODO: Validate to check if the start Node input and finish node inputs exist in the Planet Names JSON
    checkIfLocationsExist(startNode: string, finishNode: string) {
    }

    // TODO: Validator method to check this.startNode and this.finishNode is not empty else throw error and print to UI
    checkIfFieldsAreNotEmpty(startNode: string, finishNode: string) {
    }


    // TODO: Do all CRUD methods for persistent storage, i.e UPDATE, RETRIEVE, DESTROY
    private updatePlanetNames() {
    }

    private deletePlanetNames() {
    }

    private updateTraffic() {
    }

    private deleteTraffic() {
    }

    private updateRoutes() {
    }

    private deleteRoutes() {
    }

    // If there's traffic, calculate time difference
    private calcTimeDifference(distance, distanceWithTraffic) {

    }


    // TODO : Add Undirected Edge to the graph
    addEdge(graphName, src, end, weight) {
        graphName[src][end] = weight;
        // since graph is undirected, add a reversal edge also. i.e destination to source
        graphName[end][src] = weight;
        // TODO: UPDATE collection in fireStore
        return graphName;
    }

    // TODO : Add single vertex to the graph
    addVertex(vertexList, name, node) {
        vertexList[node].push({
            'Planet Name': name,
            'Planet Node': node
        });
        // TODO: UPDATE collection in fireStore
        // adding vertices
        // for (var i = 0; i < vertices.length; i++) {
        //     g.addVertex(vertices[i]);
        // }
    }

    // TODO: Hook results to a BFS graph library and display in visual format
    printGraph() {

    }


}
