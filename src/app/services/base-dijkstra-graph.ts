
import {Logger} from '../utility/logger';
import {Level} from '../utility/logger-level';

export abstract class BaseDijkstraGraph {

    public constructor() {
    }

    /*
  Find the lowest distance path within a single set of paths for that current Node
   */
    // function to find the minimum shortest path within a set of Node Paths
    private lowestCostNode(costs, processed) {

        return Object.keys(costs).reduce((lowest, node) => {
            if (lowest === null || costs[node] < costs[lowest]) {
                if (!processed.includes(node)) {
                    lowest = node;
                }
            }
            return lowest;
        }, null);
    }

    // Dijkstra's function that returns the minimum cost and path from source to node
    dijkstra(graph: any[], startNodeName: string, endNodeName: string) {

        // track the lowest cost to reach each node
        let costs = {};
        costs[endNodeName] = 'Infinity';
        costs = Object.assign(costs, graph[startNodeName]);

        // track paths
        const parents = {endNodeName: null};
        for (const child in graph[startNodeName]) {
            parents[child] = startNodeName;
        }

        // track nodes that have already been processed
        const processed = [];

        let node = this.lowestCostNode(costs, processed);

        while (node) {
            const cost = costs[node];
            const children = graph[node];
            for (const n in children) {
                if (n === startNodeName) {
                    Logger.log(Level.LOG, 'WE DON\'nT GO BACK TO START');
                } else {
                    Logger.log(Level.LOG, 'StartNodeName: ' + startNodeName);
                    Logger.log(Level.LOG, 'Evaluating cost to node ' + n + ' (looking from node ' + node + ')');
                    Logger.log(Level.LOG, 'Last Cost: ' + costs[n]);
                    const newCost = cost + children[n];
                    Logger.log(Level.LOG, 'New Cost: ' + newCost);
                    if (!costs[n] || costs[n] > newCost) {
                        costs[n] = newCost;
                        parents[n] = node;
                        Logger.log(Level.LOG, 'Updated cost und parents');
                    } else {
                        Logger.log(Level.LOG, 'A shorter path already exists');
                    }
                }
            }
            processed.push(node);
            node = this.lowestCostNode(costs, processed);
        }

        const optimalPath = [endNodeName];
        let parent = parents[endNodeName];
        while (parent) {
            optimalPath.push(parent);
            parent = parents[parent];
        }
        optimalPath.reverse();

        const results = {
            distance: costs[endNodeName],
            path: optimalPath
        };

        return results;
    }


    abstract addEdge(graphName, src, end, weight);
    abstract addVertex(vertexList, name, node);
    abstract printGraph();

}
