var isFirefox = false;
var skipDelete = true; //use this when you want to delete the database

$(document).ready(function () {
	isFirefox = typeof InstallTrigger !== 'undefined';  
    module("big data");
	var dbName = "bigdata";
	var storeName = "testStore";
	var testIndexNames = ["name", "rank", "text22", "text23", "text21", "text1", "text2", "text3", "text4"];
    
	asyncTest("Delete Database", 1, function () {
		if(skipDelete){
			ok(true,'delete database skipped');
			start(); 
			return;
		}
		
		var deleteRequest = indexedDB.deleteDatabase(dbName);
		deleteRequest.onsuccess = function (e) {
			ok(true,'Database deleted');
			start();
		}
    });
	
	asyncTest("Init db", 1, function () {
		var request = indexedDB.open(dbName);
		var upgradeNeeded = false;
		request.onupgradeneeded = function (e) {
			var database = e.target.result;
			var objectStore = database.createObjectStore(storeName, {
				keyPath: 'num'
			});
			for (var i = 0; i < testIndexNames.length; i++) {
				try {
					var indexName = "idx_" + testIndexNames[i];
					testIndexNames[i] = testIndexNames[i].replace(/\s+/g, "_");
					objectStore.createIndex(indexName, testIndexNames[i], {
						unique: false,
						multiEntry: true
					});
				} catch (ex) {
					ok(false,'Creating index [' + indexName + '] on objectStore [' + storeName + '] failed', ex);
				}
			}
			upgradeNeeded = true;
			ok(database.objectStoreNames.contains(storeName), "Object Store created");
			PopulteDB();
        };
		request.onsuccess = function (e) {
			var database = e.target.result;
            database.close();
			
			if(!upgradeNeeded){
				ok(database.objectStoreNames.contains(storeName), "Object Store exist");
				start();
			}
        }
		request.onerror = function (e) {
			ok(false, e.target.error.message);
			start();
        }
    });
	
	//loading the data async through web workers
	var workerCount = 4;
	var workerPopulated = 0;
	function PopulteDB(){
		if(isFirefox){
			recordsPerWorker = recordsPerWorker * workerCount;
			PopulateDBFromWorker(0, 0, firefoxDataLoaded);
		} else {
			for(var j=0;j<workerCount; j++)
			{
				CreateNewWorker(j);
			}
		}
	}
	
	var workerList = [];
	function CreateNewWorker(workerNb){
		var oMyTask = new Worker("bigdataworker.js");
		oMyTask.onmessage = notifyWorkerPopulated;
		oMyTask.postMessage({'workerNb':workerNb});	
		workerList.push(oMyTask);
	}
	
	function clearWorkers(){
		while(workerList.length > 0)
			workerList.shift().terminate();
	}
	
	function notifyWorkerPopulated(event){
		console.log(event.data.message);
		if(event.data.log) return;
		workerPopulated++;
		if(workerCount == workerPopulated){
			clearWorkers();
			start();
		}
	}
	
	function firefoxDataLoaded(){
		start();
	};
	//end loading the data async through web workers
	
	asyncTest("Search Objects manually", 1, function () {
        var indexName = "idx_rank";
		var transaction = indexedDB.open(dbName);
		transaction.onsuccess = function(e) {
			var database = e.target.result;
			var transaction = database.transaction(storeName, 'readonly');
			var objectStore = transaction.objectStore(storeName);
			var cursorRequest = objectStore.openCursor();
			var itemcount = 0;
			cursorRequest.onsuccess = function (event)
			{
				if (event.target.result)
				{	
					if(event.target.result.value["rank"] == "rank1")
						itemcount++;
					event.target.result['continue']();
				}
			};
			
			transaction.oncomplete = function (event) {
				database.close();
				ok(true, "Search completed "+ itemcount +" items with rank 3 found");
				start();
			};
		}
    });
	
	asyncTest("Search Objects with key index", 1, function () {
        var indexName = "idx_rank";
		var transaction = indexedDB.open(dbName);
		transaction.onsuccess = function(e) {
			var database = e.target.result;
			var transaction = database.transaction(storeName, 'readonly');
			var objectStore = transaction.objectStore(storeName);
			var index = objectStore.index(indexName);
			var keyRange = IDBKeyRange.only("rank1");
			var cursorRequest = index.openCursor(keyRange);
			var itemcount = 0;
			cursorRequest.onsuccess = function (event)
			{
				if (event.target.result)
				{	
					itemcount++;
					event.target.result['continue']();
				}
			};
			
			transaction.oncomplete = function (event) {
				database.close();
				ok(true, "Search completed "+ itemcount +" items with rank 3 found");
				start();
			};
		}
    });
	
	asyncTest("Search Objects with key range index", 1, function () {
        var indexName = "idx_name";
		var transaction = indexedDB.open(dbName);
		transaction.onsuccess = function(e) {
			var database = e.target.result;
			var transaction = database.transaction(storeName, 'readonly');
			var objectStore = transaction.objectStore(storeName);
			var index = objectStore.index(indexName);
			var keyRange = IDBKeyRange.bound("A", "B", false, true);
			var cursorRequest = index.openCursor(keyRange);
			var itemcount = 0;
			cursorRequest.onsuccess = function (event)
			{
				if (event.target.result)
				{	
					itemcount++;
					event.target.result['continue']();
				}
			};
			
			transaction.oncomplete = function (event) {
				database.close();
				ok(true, "Search completed "+ itemcount +" items with name starting with a found");
				agregate = null;
				start();
			};
		}
    });
	
	
});