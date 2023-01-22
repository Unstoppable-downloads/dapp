var request = require('request');
const fsPromises = require("fs").promises;
const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs');
const console = require("console");
const THE_GRAPH_URL = "https://thegraph.bellecour.iex.ec/subgraphs/name/bellecour/poco-v5";

const DEVELOPER_APP_SECRET = process.env.IEXEC_APP_DEVELOPER_SECRET; // JSON string with all the secret we want to share with the dApp

async function getDatasetOwner(datasetAddress) {

  let payload = {
    "query": `{datasets(where: {id: \"${datasetAddress}\"}) {\n    owner {\n      id\n    }\n  }\n}`
  }

  console.log(`getDatasetOwner - payload: ${JSON.stringify(payload)}`);

  async function asyncRequest() {
    return new Promise((resolve, reject) => {
      request.post(THE_GRAPH_URL, { json: payload }, (error, response, body) => resolve({ error, response, body }));
    });
  }

  let response = await asyncRequest();
  try {
    console.log(`getDatasetOwner - response.body.: ${JSON.stringify(response.body)}`);

    return response.body.data.datasets[0].owner.id;
  } catch (err) {
    console.error(err);
    return null
  }

}


(async () => {
  try {

    const iexecOut = process.env.IEXEC_OUT;
    const iexecIn = process.env.IEXEC_IN;
    const iexecDatasetFilename = process.env.IEXEC_DATASET_FILENAME;
    const datasetAddress = process.env.IEXEC_DATASET_ADDRESS;
    const requesterAddress = process.env.IEXEC_REQUESTER_SECRET_1; // We use the requester secret 1 for the request address 
    console.log(`iexecOut:${iexecOut} ;  iexecIn:${iexecIn} ; iexecDatasetFilename:${iexecDatasetFilename} ; datasetAddress:${datasetAddress} ; requesterAddress:${requesterAddress}`);
    console.log(`File : ${iexecIn}/${iexecDatasetFilename}`) //OK
    const confidentialDataset = await fsPromises.readFile(`${iexecIn}/${iexecDatasetFilename}`);

    console.log("Dataset buffer :", confidentialDataset) //OK
    const datasetString = confidentialDataset.toString('utf-8')
    console.log("Dataset string :", datasetString)

    const datasetStruct = JSON.parse(datasetString);
    console.log("Dataset json :", datasetStruct)
    const key = datasetStruct.key;
    const url = datasetStruct.url;
    const message = datasetStruct.message;
    console.log("Key:", key)
    console.log("URL:", url)
    console.log("Message:", message)

    // we could add more information to the result if neeeded   
    const result = JSON.stringify(datasetStruct);

    //Append some results in /iexec_out/
    await fsPromises.writeFile(`${iexecOut}/result.json`, result);

    const computedJsonObj = {
      "deterministic-output-path": `${iexecOut}/`,
    };


    await fsPromises.writeFile(
      `${iexecOut}/computed.json`,
      JSON.stringify(computedJsonObj)
    );

  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();