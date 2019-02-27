//fire base cloud functions
const functions = require('firebase-functions');

// excel to json package
const convertExcel = require('excel-as-json').processFile;
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

// google project ID
const projectId = "distancetravel-ce783";
const bucketName = `${projectId}.appspot.com`;

const gcs = require('@google-cloud/storage')({
  projectId
})

const bucket = gcs.bucket(bucketName);


exports.excltojson = functions.database.ref('excel_import/graph_excel_link').onWrite((snapshot) => {
  const filePath = 'goodfile';
  const tempLocalFile = path.join(os.tmpdir(), filePath);
  const tempLocalDir = path.dirname(tempLocalFile);
  var file = fs.createWriteStream(tempLocalFile);
  console.log('Fetch File URL: ', snapshot.after._data.fileUrl);
  var request = https.get(snapshot.after._data.fileUrl, function (response) {
    response.pipe(file);
    file.on('finish', function () {
      file.close();  // close() is async, call cb after close completes.

      // Convert Planet Names (1) to a JSON file and upload to Database Storage
      convertExcel(file.path, '/tmp/planet_names.json', {sheet: '1'}, (err, data) => {
        if (err) {
          console.log(err);
        }
        else {
          bucket.upload('/tmp/planet_names.json', {metadata: {contentType: 'application/json'}}).then(() => {
            console.log('Uploaded planet_names.json file');
          })

        }
      })

      // Convert Routes Sheet (2) to a JSON file and upload to Database Storage
      convertExcel(file.path, '/tmp/routes.json', {sheet: '2'}, (err, data) => {
        if (err) {
          console.log(err);
        }
        else {
          bucket.upload('/tmp/routes.json', {metadata: {contentType: 'application/json'}}).then(() => {
            console.log('Uploaded routes.json file');
          })

        }
      })

      // Convert Traffic Sheet (3) to a JSON file and upload to Database Storage
      convertExcel(file.path, '/tmp/traffic.json', {sheet: '3'}, (err, data) => {
        if (err) {
          console.log(err);
        }
        else {
          bucket.upload('/tmp/traffic.json', {metadata: {contentType: 'application/json'}}).then(() => {
            console.log('Uploaded traffic.json file');
          })

        }
      })
    });
  }).on('error', function (err) { // Handle errors
    fs.unlink(tempLocalFile); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });

})

