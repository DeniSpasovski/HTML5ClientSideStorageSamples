var objectList = [{ id: 0, subid: "sub0", string: "string0", name: "abv", rank: "rank1", array: ["value0", "value10"], object: { property: "property1" }, date: Date.now() },
{ id: 1, subid: "sub1", string: "string1", name: "qwe", rank: "rank1", array: ["value1", "value11"], object: { property: "property1" }, date: Date.now() },
{ id: 2, subid: "sub2", string: "string2", name: "dsa", rank: "rank1", array: ["value2", "value12"], object: { property: "property1" }, date: Date.now() },
{ id: 3, subid: "sub3", string: "string3", name: "qwe", rank: "rank2", array: ["value3", "value13"], object: { property: "property2" }, date: Date.now() },
{ id: 4, subid: "sub4", string: "string4", name: "dsa", rank: "rank2", array: ["value4", "value14"], object: { property: "property2" }, date: Date.now() }, 
{ id: 5, subid: "sub5", string: "string5", name: "abv", rank: "rank2", array: ["value5", "value15"], object: { property: "property2" }, date: Date.now() }];


$(document).ready(function () {
    module("init");
	var dbName = "testdbname";
	var storeName = "testStore";
	var testIndexNames = ["name", "rank"];
    test("Check DB Engine", function () {
        if (indexedDB == null) {
            ok(false, "IndexedDB API not available");        
        } else {
            ok(true, "IndexedDB API available");
        }
    });
	
	asyncTest("Delete Database", 1, function () {
		var deleteRequest = indexedDB.deleteDatabase(dbName);
		deleteRequest.onsuccess = function (e) {
			ok(true, "Database object deleted.");
			start();
		}
    });
	
	asyncTest("Opening Database", 2, function () {
		var request = indexedDB.open(dbName);
		request.onsuccess = function (e) {
			var database = request.result;
			equal(database.name, dbName, "Database name equal");
            if (database) {
                ok(true, "Database object initialized.");
            } else {
                ok(false, "Database object is not initialized!");
            }
            database.close();
            start();
        }
		request.onerror = function (e) {
			ok(false, e.target.error.message);
			start();
        }
    });
	
	asyncTest("Init Tables", 2, function () {
		var request = indexedDB.open(dbName, 10);
		request.onupgradeneeded = function (e) {
			var database = e.target.result;
			var objectStore = database.createObjectStore(storeName, {
				keyPath: 'id'
			});
			ok(true, "Object Store Created");
        };
		request.onsuccess = function (e) {
			var database = e.target.result;
                
			ok(database.objectStoreNames.contains(storeName), "Object Store exist");
				
            database.close();
            start();
        }
		request.onerror = function (e) {
			ok(true, e.target.error.message);
			start();
        }
    });
	
	asyncTest("Opening Database with wrong version", 1, function () {
		var request = indexedDB.open(dbName, 2);
		request.onupgradeneeded = function (e) {
			ok(true, "Database init event fired");
        };
		request.onsuccess = function (e) {
			var database = request.result;
			ok(false, "success event fired in firefox");
            database.close();
            start();
        }
		request.onerror = function (e) {
			ok(true, e.target.error.message);
			start();
        }
    });
	module("index");
	asyncTest("Create index", 3, function () {
		var request = indexedDB.open(dbName, 11);
		request.onupgradeneeded = function (e) {
			var database = e.target.result;
			var objectStore = this.transaction.objectStore(storeName);
			for (var i = 0; i < testIndexNames.length; i++) {
				try {
					var indexName = "idx_" + testIndexNames[i];
					testIndexNames[i] = testIndexNames[i].replace(/\s+/g, "_");
					objectStore.createIndex(indexName, testIndexNames[i], {
						unique: false,
						multiEntry: true
					});
					ok(true,'Creating index [' + testIndexNames[i] + '] on objectStore [' + storeName + '] OK');
				} catch (ex) {
					ok(false,'Creating index [' + indexName + '] on objectStore [' + storeName + '] failed', ex);
				}
			}
        };
		request.onsuccess = function (e) {
			var database = e.target.result;
                
			var transaction = database.transaction([storeName], "readonly");
			var objectStore = transaction.objectStore(storeName);
			equal(objectStore.indexNames.length, testIndexNames.length, "All indexex created")

            database.close();
            start();
        }
		request.onerror = function (e) {
			ok(true, e.target.error.message);
			start();
        }
    });
	
	module("insert");
	asyncTest("Add Multiple Indexed Objects", 1, function () {
        var request = indexedDB.open(dbName);
		request.onsuccess = function (e) {
			var database = e.target.result;
			var transaction = database.transaction([storeName], "readwrite");
			transaction.oncomplete = function (e) {
				ok(true, "All items inserted");
				database.close();
				start();
			};
			var objectStore = transaction.objectStore(storeName);
			var values = objectList;
			for (var x = 0; x < values.length; x++) {
				if (typeof values[x].id == 'string') {
					values[x].id = parseInt(values[x].id);
				}
				objectStore.add(values[x]);
			}
        };
    });
	
	module("count");
	asyncTest("Count Objects", 1, function () {
        var request = indexedDB.open(dbName);
		request.onsuccess = function (e) {
			var database = e.target.result;
			var transaction = database.transaction([storeName], "readonly");
			var objectStore = transaction.objectStore(storeName);
			var countRequest = objectStore.count();
			countRequest.onsuccess = function (event) {
				equal(event.target.result, objectList.length, event.target.result + " items counted");
				
			};
			transaction.oncomplete = function (event) {
				database.close();
				start();
			}
        };
    });
	module("search");
	asyncTest("Search Objects manually", 2, function () {
        var indexName = "idx_rank";
		var request = indexedDB.open(dbName);
		request.onsuccess = function(e) {
			var database = e.target.result;
			var transaction = database.transaction(storeName, 'readonly');
			var objectStore = transaction.objectStore(storeName);
			var cursorRequest = objectStore.openCursor();
			var agregate = [];
			cursorRequest.onsuccess = function (event)
			{
				if (event.target.result)
				{	
					if(event.target.result.value["rank"] == "rank1")
						agregate.push(event.target.result.value);
					event.target.result['continue']();
				}
			};
			
			transaction.oncomplete = function (event) {
				database.close();
				equal(agregate.length, 3, "Three items with same rank found")
				ok(true, "Search completed");
				agregate = null;
				start();
			};
		}
    });
	
	asyncTest("Search Objects with key index", 2, function () {
        var indexName = "idx_rank";
		var request = indexedDB.open(dbName);
		request.onsuccess = function(e) {
			var database = e.target.result;
			var transaction = database.transaction(storeName, 'readonly');
			var objectStore = transaction.objectStore(storeName);
			var index = objectStore.index(indexName);
			var keyRange = IDBKeyRange.only("rank1");
			var cursorRequest = index.openCursor(keyRange);
			var agregate = [];
			cursorRequest.onsuccess = function (event)
			{
				if (event.target.result)
				{	
					agregate.push(event.target.result.value);
					event.target.result['continue']();
				}
			};
			
			transaction.oncomplete = function (event) {
				database.close();
				equal(agregate.length, 3, "Three items with same rank found")
				ok(true, "Search completed");
				agregate = null;
				start();
			};
		}
    });
	
	asyncTest("Search Objects with key range index", 2, function () {
        var indexName = "idx_name";
		var request = indexedDB.open(dbName);
		request.onsuccess = function(e) {
			var database = e.target.result;
			var transaction = database.transaction(storeName, 'readonly');
			var objectStore = transaction.objectStore(storeName);
			var index = objectStore.index(indexName);
			var keyRange = IDBKeyRange.bound("a", "e", false, true);
			var cursorRequest = index.openCursor(keyRange);
			var agregate = [];
			cursorRequest.onsuccess = function (event)
			{
				if (event.target.result)
				{	
					agregate.push(event.target.result.value);
					event.target.result['continue']();
				}
			};
			
			transaction.oncomplete = function (event) {
				database.close();
				equal(agregate.length, 4, "Four items with name starting from a to d found")
				ok(true, "Search completed");
				agregate = null;
				start();
			};
		}
    });
	
	asyncTest("Search Objects with key index - 0 results", 2, function () {
        var indexName = "idx_rank";
		var request = indexedDB.open(dbName);
		request.onsuccess = function(e) {
			var database = e.target.result;
			var transaction = database.transaction(storeName, 'readonly');
			var objectStore = transaction.objectStore(storeName);
			var index = objectStore.index(indexName);
			var keyRange = IDBKeyRange.only("rank3");
			var cursorRequest = index.openCursor(keyRange);
			var agregate = [];
			cursorRequest.onsuccess = function (event)
			{
				if (event.target.result)
				{	
					agregate.push(event.target.result.value);
					event.target.result['continue']();
				}
			};
			
			transaction.oncomplete = function (event) {
				database.close();
				equal(agregate.length, 0, "no items with with rank3 found");
				ok(true, "Search completed");
				agregate = null;
				start();
			};
		}
    });
	
	module("update");
	asyncTest("Update all rank 2 to rank 3", 1, function () {
        var indexName = "idx_rank";
		var request = indexedDB.open(dbName);
		request.onsuccess = function(e) {
			var database = e.target.result;
			var transaction = database.transaction(storeName, 'readwrite');
			var objectStore = transaction.objectStore(storeName);
			var index = objectStore.index(indexName);
			var keyRange = IDBKeyRange.only("rank2");
			var cursorRequest = index.openCursor(keyRange);
			var agregate = [];
			cursorRequest.onsuccess = function (event)
			{
				if (event.target.result)
				{	
					event.target.result.value["rank"] = "rank3";
					event.target.result.update(event.target.result.value)
					event.target.result['continue']();
				}
			};
			
			transaction.oncomplete = function (event) {
				database.close();
				ok(true, "update completed");
				agregate = null;
				start();
			};
		}
    });
	
	asyncTest("Search Objects with key index - after update 3 results", 2, function () {
        var indexName = "idx_rank";
		var request = indexedDB.open(dbName);
		request.onsuccess = function(e) {
			var database = e.target.result;
			var transaction = database.transaction(storeName, 'readonly');
			var objectStore = transaction.objectStore(storeName);
			var index = objectStore.index(indexName);
			var keyRange = IDBKeyRange.only("rank3");
			var cursorRequest = index.openCursor(keyRange);
			var agregate = [];
			cursorRequest.onsuccess = function (event)
			{
				if (event.target.result)
				{	
					agregate.push(event.target.result.value);
					event.target.result['continue']();
				}
			};
			
			transaction.oncomplete = function (event) {
				database.close();
				equal(agregate.length, 3, "Three items with rank3 found")
				ok(true, "Search completed");
				agregate = null;
				start();
			};
		}
    });
	
	module("delete");
	asyncTest("Delete Object by id", 1, function () {
        var indexName = "idx_rank";
		var request = indexedDB.open(dbName);
		request.onsuccess = function(e) {
			var database = e.target.result;
			var transaction = database.transaction(storeName, 'readwrite');
			var objectStore = transaction.objectStore(storeName);
			var request = objectStore.delete(5);
			request.onsuccess = function (event)
			{
				database.close();
				ok(true, "delete completed");
				start();
			};
			
		}
    });
	
	asyncTest("Search Objects with key index - after delete 2 results", 2, function () {
        var indexName = "idx_rank";
		var request = indexedDB.open(dbName);
		request.onsuccess = function(e) {
			var database = e.target.result;
			var transaction = database.transaction(storeName, 'readonly');
			var objectStore = transaction.objectStore(storeName);
			var index = objectStore.index(indexName);
			var keyRange = IDBKeyRange.only("rank3");
			var cursorRequest = index.openCursor(keyRange);
			var agregate = [];
			cursorRequest.onsuccess = function (event)
			{
				if (event.target.result)
				{	
					agregate.push(event.target.result.value);
					event.target.result['continue']();
				}
			};
			
			transaction.oncomplete = function (event) {
				database.close();
				equal(agregate.length, 2, "one item with rank3 found")
				ok(true, "Search completed");
				agregate = null;
				start();
			};
		}
    });
	
	asyncTest("Delete object with cursor", 1, function () {
        var indexName = "idx_rank";
		var request = indexedDB.open(dbName);
		request.onsuccess = function(e) {
			var database = e.target.result;
			var transaction = database.transaction(storeName, 'readwrite');
			var objectStore = transaction.objectStore(storeName);
			var index = objectStore.index(indexName);
			var keyRange = IDBKeyRange.only("rank3");
			var cursorRequest = index.openCursor(keyRange);
			var agregate = [];
			cursorRequest.onsuccess = function (event)
			{
				if (event.target.result)
				{	
					if(event.target.result.value["name"] == "qwe")
						event.target.result.delete();
					event.target.result['continue']();
				}
			};
			
			transaction.oncomplete = function (event) {
				database.close();
				ok(true, "item deleted");
				agregate = null;
				start();
			};
		}
    });
	
	asyncTest("Search Objects with key index - after delete 1 result", 2, function () {
        var indexName = "idx_rank";
		var request = indexedDB.open(dbName);
		request.onsuccess = function(e) {
			var database = e.target.result;
			var transaction = database.transaction(storeName, 'readonly');
			var objectStore = transaction.objectStore(storeName);
			var index = objectStore.index(indexName);
			var keyRange = IDBKeyRange.only("rank3");
			var cursorRequest = index.openCursor(keyRange);
			var agregate = [];
			cursorRequest.onsuccess = function (event)
			{
				if (event.target.result)
				{	
					agregate.push(event.target.result.value);
					event.target.result['continue']();
				}
			};
			
			transaction.oncomplete = function (event) {
				database.close();
				equal(agregate.length, 1, "one item with rank3 found")
				ok(true, "Search completed");
				agregate = null;
				start();
			};
		}
    });
	
	asyncTest("Error - write action in read only", 1, function () {
        var indexName = "idx_rank";
		var request = indexedDB.open(dbName);
		request.onsuccess = function(e) {
			var database = e.target.result;
			var transaction = database.transaction(storeName, 'readonly');
			var objectStore = transaction.objectStore(storeName);
			try {
				var request = objectStore.delete(5);
				request.onsuccess = function (e)
				{
					database.close();
					
				};
			}
			catch (err){
				database.close();
				ok(true, err);
				start();
			}
		}
    });
});