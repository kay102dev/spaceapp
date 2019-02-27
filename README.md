# Space App

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.0.6.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Alternatively view the running app hosted on the link below

Navigate to [http://www.greymeta-it.co.za/spaceapp.](http://www.greymeta-it.co.za/spaceapp.)

## Problem statement


#### To find the shortest path from a single vertex to every other vertex in the graph
The applications mandate is to find the shortest path(minimum cost) from source to a node. In this context, from origin planet to destination planet. The application applies the Dijkstra's algorithm to accomplish this and thereafter projects the results onto a graph visualisation library called [Cytoscape](http://js.cytoscape.org/#introduction).

## Choosing a virtualisation graph library
There are plenty of graph libraries available, advantages of the Cytoscape library is that it includes graph theory algorithms and most importantly, the Breadth First Search. Which is an algorithm for traversing, or searching tree, or graph data structures. It also offers mobile support which is very crucial for Frontend. 


## How does the "active route" traversing Layout work

We simply use the [breadthfirst layout](http://js.cytoscape.org/#layouts/breadthfirst) option Cytoscape layout provides. And since we already wrote our search algorithm applying Dijkstra's algorithm, it is not necessary to use Cytoscape's BFS algorithm. 

Instead, we simply display a BFS graph with all the nodes and paths onto the DOM, and thereafter manipulate the DOM by selecting and animating only our specific paths and nodes on the DOM via the Cytoscape collection object.


## Usage of BFS Cytoscape layout in the Cytoscape Library

```javascript
let options = {
  name: 'breadthfirst'
}
cy.layout( options );
```



## Database type used and REST API's used 

We use Firebase to generate our RESTful service. This technology platform allows us to make web applications with no server-side programming so that development turns out to be quicker and easier and it supports Web.

#### The logic is as following:

##### NOTE: You need to login as admin in order to gain access to the upload file UI control and be able to upload excel file data

1. Read the excel sheet from local machine to [firebase storage](https://firebase.google.com/docs/storage/) which is our "CDN" 


2. Within the excel file sheets sitting in our "CDN", convert each sheet to JSON files via [Firebase cloud functions](https://firebase.google.com/docs/functions/)
3. From client-side, call Restful service to fetch and store the newly created excel JSON files (Planet Names, Routes, and Traffic) into [Firebase Firestore](https://firebase.google.com/docs/firestore/) Documents (NOSQL Realtime cloud Database)

4. Call RESTful service's to fetch data from Firestore, consume each data object into app

5. Print shortest path via Cytoscape graph




## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artefacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
