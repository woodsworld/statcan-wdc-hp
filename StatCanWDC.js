let vectorData = [];
let vectorMetadata = [];
let comboVectorData = {};

var myConnector = tableau.makeConnector();

myConnector.getSchema = function (schemaCallback) {
    var cols = [{
        id: "SeriesTitleEn",
        alias: "Dimensions",
        dataType: tableau.dataTypeEnum.string
    }, {
        id: "frequencyCode",
        dataType: tableau.dataTypeEnum.int
    }, {
        id: "productId",
        dataType: tableau.dataTypeEnum.int
    //}, {
        //id: "vectorData",
        //dataType: tableau.dataTypeEnum.float
    //}, {
       // id: "refPer",
       // alias: "Date",
       // dataType: tableau.dataTypeEnum.date
    //}, {
       // id: "value",
       // alias: "Value",
       // dataType: tableau.dataTypeEnum.float
    }];

    var tableSchema = {
        id: "Dimensions",
        columns: cols
    };

    schemaCallback([tableSchema]);
};

myConnector.getData = function(table, doneCallback) {    
    tableau.log(comboVectorData)
    
    tableData = [];

    for (var i = 0, len = comboVectorData.length; i < len; i++) {
        tableData.push({
            "Dimensions": comboVectorData.Dimensions,
            "frequencyCode": comboVectorData.UpdateFreq,
            "productId": comboVectorData.productId,
            //"refPer": comboVectorData[1].refPer,
            //"value": comboVectorData[1].value,
            //"vectorData": comboVectorData.vectorDataPoint
        });
    }
    
    table.appendRows(tableData);
    doneCallback();
    
};

tableau.registerConnector(myConnector);
tableau.connectionName = "StatCan WDC";

async function _getSeriesData() {
    //note to self - still need if statements to validate textbox inputs

    var vectorId = $('#textboxVector').val().trim();
    var latestN = $('#textboxLatestN').val().trim();

    vectorMetadata = await _getVectorMetadata(vectorId);
    vectorData = await _getVectorData(vectorId, latestN);

    console.log(vectorMetadata);
    console.log(vectorData);

    comboVectorData = {
        "Dimensions": vectorMetadata[0].object.SeriesTitleEn,
        "UpdateFreq": vectorMetadata[0].object.frequencyCode,
        "productId": vectorMetadata[0].object.productId,
        //"vectorDataPoint": vectorData[0].object.vectorDataPoint,

    };
    
    console.log(comboVectorData);
    //console.log(errorTest);
    tableau.submit();
}






//retrieves vector dataseries from StatCan
async function _getVectorData(vectorId, latestN) {
    let result;

    try {
        result = await $.ajax({
            url: "https://www150.statcan.gc.ca/t1/wds/rest/getDataFromVectorsAndLatestNPeriods",
            method: "POST",
            timeout: 0,
            headers: {
          "Content-Type": "application/json",
        },
            data: '[{"vectorId":'+ vectorId + ', "latestN":'+ latestN +'}]',
        });
        return result;
    }

    catch (error) {
        console.error(error);
    }
    
}

//retrieves vector metadata from StatCan
async function _getVectorMetadata(vectorId) {
    let result;

    try {
        result = await $.ajax({
            url: "https://www150.statcan.gc.ca/t1/wds/rest/getSeriesInfoFromVector",
            method: "POST",
            timeout: 0,
            headers: {
          "Content-Type": "application/json",
        },
            data: '[{"vectorId":'+ vectorId +'}]',
        });
        return result;
    }

    catch (error) {
        console.error(error);
    }
    
}

