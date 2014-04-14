var sampleObject = { "stringProperty" : "value", "numericProperty": 1, "boolProperty": true};

$(document).ready(function () {
    module("init");
    test("Check local storage", function () {
        if (localStorage == null) {
            ok(false, "LocalStorage API not available");        
        } else {
            ok(true, "LocalStorage API available");
        }
    });
	
	module("store string");
	test("Store data", function () {
        localStorage["test"] = "Sample Data";
		ok(true, "Data stored in local storage");
    });
	
	test("Retrieved data", function () {
		ok(localStorage["test"], "Data exist in local storage");
    });
	
	module("store object");
	test("Store Object", function () {
        localStorage["testObject"] = JSON.stringify(sampleObject);
		ok(localStorage["testObject"] , "Object stored in local storage");
    });
	
	test("Retrieve Object", 5, function () {
        ok(localStorage["testObject"] , "Data exist in local storage");
		var _testObject = JSON.parse(localStorage["testObject"]); //we have to de-serialize the object
		equal(typeof _testObject, "object", "Object de-serialized");
		equal(_testObject.stringProperty, sampleObject.stringProperty, "string property exist");
		equal(_testObject.numericProperty, sampleObject.numericProperty, "numeric property exist");
		equal(_testObject.boolProperty, sampleObject.boolProperty, "bool property exist");
    });
	
	module("common error");
	test("Store Object without serializing", function () {
        localStorage["testObjectError"] = sampleObject;
		ok(localStorage["testObjectError"] , "Object stored in local storage");
		try{
			JSON.parse(localStorage["testObjectError"]);
			ok(false, "Data stored as object?");
		}catch(ex){
			ok(true, "Error in de-serialization");
		}
    });
	
	module("web worker access");
	asyncTest("Check if local storage is accessible from web workers", 1, function () {
		var oMyTask = new Worker("LocalStorageWorker.js");
		oMyTask.onmessage = function(event){
			equal(event.data, "undefined", "Local Storage is not available from worker");
			oMyTask.terminate();
			start();
		};
		oMyTask.postMessage({'testMessage': 'testWorker'});
	});
});