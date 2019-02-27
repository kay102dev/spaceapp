import {Component, OnChanges, Renderer2, ElementRef, Input, Output, EventEmitter, AfterViewInit} from '@angular/core';
import {cytoscape} from 'cytoscape';
import {cydagre} from 'cytoscape-dagre';
import {Observable} from 'rxjs/index';
import {ResultsInterface} from './results.interface';


declare let cytoscape: any;
declare let jquery: any;
declare var $: any;


@Component({
    selector: 'ng2-cytoscape',
    template: '<div id="cy"></div>',

})


export class NgCytoScape implements OnChanges, AfterViewInit {


    @Input() public elements: any;
    @Input() public style: any;
    @Input() public layout: any;
    @Input() public zoom: any;

    @Input() public planetRoutesJson: any;
    @Input() public planetRoutesArr: any;
    @Input() public planetNamesArr: any;
    @Input() public resultsData: Observable<ResultsInterface[]>;
    results;
    @Input() public resultsWithTrafficData: Observable<ResultsInterface[]>;
    resultsWithTraffic;

    bfs;

    public constructor() {
        this.layout = this.layout || {
            name: 'breadthfirst',
            padding: 10,
            animate: true, // whether to transition the node positions
            animationDuration: 1500, // duration of animation in ms if enabled
            fit: true,
            avoidOverlap: true,
            // spacingFactor: 1.75,
            animationEasing: 'ease-out-cubic',
        };

        this.style = this.style || cytoscape.stylesheet()
            .selector('node')
            .style({
                'content': 'data(id)',
                'color': '#ffffff',
                'border-width': '5px',
                'border-color': '#eefffd',
                'background-image': './assets/img/earth-flat.png',
                'width': '45px',
                'height': '45px',
                'background-fit': 'cover cover',
                'font-size': '18px',
                'text-background-color': '#333333',
                'text-background-shape': 'rectangle'

            })
            .selector('edge')
            .style({
                'line-color': '#4b5050',
                'curve-style': 'haystack',
                'haystack-radius': '0',
                'width': '5px',
                'text-background-color': '#333333',
                'text-background-shape': 'rectangle',
            })
            .selector('.highlighted')
            .style({
                'background-color': '#61bffc',
                'line-color': '#ffffff',
                'target-arrow-color': '#61bffc',
                'mid-target-arrow-shape': 'triangle',
                'mid-target-arrow-color': '#3fa46a',
                'transition-property': 'background-color, line-color',
                'transition-duration': '1s',
                'z-compound-depth': 'top',
                'z-index-compare': 'auto',
                'width': '10px',
                'text-background-color': '#333333',
                'text-background-shape': 'rectangle',

            })
            .selector('.highlightedNode')
            .style({
                'z-compound-depth': 'top',
                'background-color': '#fc54f7',
                'width': '80px',
                'height': '80px',
                'border-color': '#3fa46a',
                'transition-property': 'z-compound-depth, background-color, width, height, border-color',
                'transition-duration': '0.5s',
                'transition-timing-function': 'ease-in-out-cubic',
                'font-size': '24px',
                'text-background-color': '#333333',
                'text-background-shape': 'rectangle',
                'font-weight': '900',
            })

            .selector('.highlighted-traffic')
            .style({
                'line-color': '#ff0055',
                'z-compound-depth': 'top',
                'transition-property': 'background-color, line-color, target-arrow-color',
                'transition-duration': '0.5s',
                'border-color': '#ff0055',
            });
    }

    public ngOnChanges(): any {
        this.resultsData.subscribe(data => {
            this.results = data;
        });
        this.resultsWithTrafficData.subscribe(data => {
            this.resultsWithTraffic = data;
        });
    }

    public ngAfterViewInit() {

        $(window).resize(function () {

        });
    }

    cyRender() {
        return cytoscape({
            container: document.querySelector('#cy'),
            autolock: false,
            // autoungrabify: true,
            boxSelectionEnabled: false,
            autounselectify: true,
            layout: this.layout,
            style: this.style,
            pan: {x: 100, y: 80},
            zoomingEnabled: false,
            styleEnabled: true,
            elements: {},
            zoom: 0.6
        });
    }

    cyModelNodesAndPaths(startNode) {
        const deepCopiedPlanetRoute = JSON.parse(JSON.stringify(this.planetRoutesJson));
        const deepCopiedPlanetRoutesArr = JSON.parse(JSON.stringify(this.planetRoutesArr));
        const deepCopiedPlanetNamesArr = JSON.parse(JSON.stringify(this.planetNamesArr));
        const array = [];
        const parentKeysArray = [];
        const keys = Object.keys(deepCopiedPlanetRoute);
        deepCopiedPlanetRoutesArr.forEach((obj, i) => {
            parentKeysArray.push(keys[i]);
            if (deepCopiedPlanetNamesArr[i]) {
                array.push({
                    group: 'nodes',
                    data: {
                        id: deepCopiedPlanetNamesArr[i]['Planet Node'],
                        name: this.planetNamesArr[i]
                    }
                });

                const parentElObject = deepCopiedPlanetRoute[deepCopiedPlanetNamesArr[i]['Planet Node']];
                for (const key in parentElObject) {
                    if (parentElObject.hasOwnProperty(key)) {
                        array.push({
                            group: 'edges',
                            data: {
                                id: deepCopiedPlanetNamesArr[i]['Planet Node'] + key,
                                source: deepCopiedPlanetNamesArr[i]['Planet Node'],
                                target: key
                            }
                        });
                    }
                }
            }

        });
        this.cyRefreshDataAndAnimateGraph(array, startNode);
    }

    cyRefreshDataAndAnimateGraph(array, startNode) {
        // To see the difference, calculate A to D
        const render = this.cyRender();

        this.cyAnimatePathsWithoutTraffic(render);
        // add new nodes and paths to graph
        render.elements().remove();
        render.add(array);
        render.edges()[21].remove();
        const layout = render.layout(this.layout);
        layout.run();
        // Call animation func for both traffic and non-traffic
        render.elements().bfs('#' + startNode, function () {
        }, true);
        this.cyPanBy(render, 70, 70);
        this.cyAnimatePathsWithoutTraffic(render);
        this.cyAnimatePathsWithTraffic(render);
        this.cyAnimateNodes(render);

    }

    cyPanBy(render, x, y) {
        const width = $(window).width();
        if (width < 1200 && width > 800 ) {
            render.panBy({
                x: 0,
                y: 70
            });
        }
        if (width < 800) {
            // render.resize();
            render.userPanningEnabled(true);
            const cy = render.$('#cy');
            render.pan({x: '0', y: '0'});
            // render.panningEnabled(false);
            render.center(cy);
            render.reset();

            render.viewport({
                zoom: 0.3,
                pan: {x: x, y: y}
            });
            render.fit();
            render.style()
                .selector('node').style({'width': '20px', 'height': '20px'})
                .selector('edge').style({'width': '1px'})
                .selector('.highlighted').style({'width': '2px'})
                .selector('.highlighted-traffic').style({'width': '2px'})
                .selector('.highlightedNode').style({'width': '40px', 'height': '40px'}).update();

        }
    }

    cyAnimatePathsWithoutTraffic(render) {
        const deepCopyArrForEdges = JSON.parse(JSON.stringify(this.results.path));
        this.cySortPathsForAnimation(deepCopyArrForEdges).forEach(function (id, index) {
            setTimeout(function () {
                const idEl = 'edge[id = "' + id + '"]';
                render.elements(idEl).addClass('highlighted');
                console.log('edge check', idEl);
            }, 1000 * (index + 1));
        });
    }

    cyAnimateNodes(render) {
        const deepCopyArrForNodes = JSON.parse(JSON.stringify(this.results.path));
        deepCopyArrForNodes.forEach(function (id, index) {
            setTimeout(function () {
                const idNode = 'node[id = "' + id + '"]';
                render.elements(idNode).addClass('highlightedNode');
            }, 1000 * (index));
        });
    }

    cyAnimatePathsWithTraffic(render) {
        if (this.resultsWithTraffic.path) {
            this.cySortPathsForAnimation(this.resultsWithTraffic.path).forEach(function (id, index) {
                setTimeout(function () {
                    const idElTraffic = 'edge[id = "' + id + '"]';
                    render.elements(idElTraffic).addClass('highlighted-traffic');
                }, 1000 * (index + 1));
            });
        }
    }

    cySortPathsForAnimation(results) {
        const sort = [];
        let sub = '';
        if (results) {
            results.forEach(function (el) {
                const m = sub + el + '';
                sort.push(m);
                sub = el;
            });
            sort.splice(0, 1);
            return sort;
        }
    }


}
