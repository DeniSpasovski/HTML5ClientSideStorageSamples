var sampleTextArray = ["line1", "line2", "line3"];
var sampleText = "Sample Data";
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;//requestFileSystem is not standard yet

$(document).ready(function () {
    module("init");
	var dbName = "testdbname";
	var storeName = "testStore";
	var testIndexNames = ["name", "rank"];
    test("Check File System API", function () {
        if (requestFileSystem == null) {
            ok(false, "File System API not available");        
        } else {
            ok(true, "File System API available");
        }
    });
	
	function errorHandler(e) {
		ok(false, 'Error: ' + e.name);
		start();
	}
	
	module("create file");
	asyncTest("Create File in Temporary Storage", 2, function () {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024, function(fs) {
			ok(fs, "File System Initialized");
			fs.root.getFile('log.txt', {create: true}, function(fileEntry) {
				ok(fileEntry, "File Created");
				start();
			}, errorHandler);
		}, errorHandler);
    });
	
	asyncTest("Create File in Persistent Storage", 3, function () {
		navigator.webkitPersistentStorage.requestQuota(5*1024*1024, function(grantedBytes) { //quota request
			ok(grantedBytes, "Quota Granted");
			window.requestFileSystem(window.PERSISTENT, grantedBytes, function(fs) {
				ok(fs, "File System Initialized");
				var getFile = fs.root.getFile('log.txt', {create: true}, function(fileEntry) {
					ok(fileEntry, "File Created");
					start();
				}, errorHandler);
			}, errorHandler);
		}, errorHandler);
    });
	
	module("file writer");
	asyncTest("Write to file", 2, function () {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024, function(fs) {
			fs.root.getFile('log.txt', {create: false}, function(fileEntry) {
				ok(fileEntry, "File Exist");
				fileEntry.createWriter(function (writer) {
					writer.write(new Blob([sampleText], { type: "text/plain" }));
					writer.onwriteend = function(){
						ok(true, "Writing completed");
						start();
					};
				}, errorHandler);
			}, errorHandler);
		}, errorHandler);
    });
	
	asyncTest("Write multiple lines", 2, function () {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024, function(fs) {
			fs.root.getFile('log2.txt', {create: true}, function(fileEntry) {
				ok(fileEntry, "File Exist");
				fileEntry.createWriter(function (writer) {
					var _tempBlob = new Blob([""], { type: "text/plain" });
					for(var i=0; i<sampleTextArray.length; i++){
						_tempBlob = new Blob([_tempBlob , sampleTextArray[i]], { type: "text/plain" });
					}
					writer.write(_tempBlob);
					writer.onwriteend = function(){
						ok(true, "Writing completed");
						start();
					};
				}, errorHandler);
			}, errorHandler);
		}, errorHandler);
    });
	
	module("file reader");
	asyncTest("Read data from file", 1, function () {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024, function(fs) {
			fs.root.getFile('log.txt', {create: false}, function(fileEntry) {
				fileEntry.file(function(file) {
					var reader = new FileReader();
					reader.onloadend = function(e) {
						equal(this.result, sampleText, "File content read:" + this.result);
						start();
					};
					reader.readAsText(file);
				}, errorHandler);
			}, errorHandler);
		}, errorHandler);
    });
	
	asyncTest("Read data from file 2", 1, function () {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024, function(fs) {
			fs.root.getFile('log2.txt', {create: false}, function(fileEntry) {
				fileEntry.file(function(file) {
					var reader = new FileReader();
					reader.onloadend = function(e) {
						equal(this.result, sampleTextArray.join(""), "File content read:" + this.result);
						start();
					};
					reader.readAsText(file);
				}, errorHandler);
			}, errorHandler);
		}, errorHandler);
    });
	
	module("directory");
	asyncTest("Read files in root directory", 3, function () {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024, function(fs) {
			var dirReader = fs.root.createReader();
			dirReader.readEntries (function(entries) {
				equal(entries.length, 2, "2 files found");
				ok(entries[0].fullPath, "file: " + entries[0].fullPath + " found");
				ok(entries[1].fullPath, "file: " + entries[1].fullPath + " found");
				start();
			}, errorHandler);
		}, errorHandler);
    });
	
	asyncTest("Create new directory", 1, function () {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024, function(fs) {
			fs.root.getDirectory("newDir", {create: true}, function(directoryEntry) {
				ok(directoryEntry, "Directory Created");
				start();
			}, errorHandler);
		}, errorHandler);
    });
	
	asyncTest("Add file to in directory", 2, function () {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024, function(fs) {
			fs.root.getDirectory("newDirWithFiles", {create: true}, function(directoryEntry) {
				ok(directoryEntry, "Directory Created");
				directoryEntry.getFile('log.txt', {create: true}, function(fileEntry) {
					ok(directoryEntry, "File Created");
					start();
				}, errorHandler);
			}, errorHandler);
		}, errorHandler);
    });
	
	asyncTest("Get file from sub directory", 1, function () {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024, function(fs) {
			fs.root.getFile('newDirWithFiles/log.txt', {create: false}, function(fileEntry) {
				ok(fileEntry, "File Created");
				start();
			}, errorHandler);
		}, errorHandler);
    });
	
	module("export");
	asyncTest("Get file from sub directory", 1, function () {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024, function(fs) {
			fs.root.getFile('log2.txt', {create: false}, function(fileEntry) {
				var _fileUrl = fileEntry.toURL();
				ok(_fileUrl, "File URL:" + _fileUrl);
				start();
			}, errorHandler);
		}, errorHandler);
    });
	
	module("delete");
	asyncTest("Delete File", 2, function () {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024, function(fs) {
			fs.root.getFile('log.txt', {create: false}, function(fileEntry) {
				ok(fileEntry, "File Exist");
				fileEntry.remove(function(){
					ok(true, "File Deleted");
					start();
				},errorHandler);
			}, errorHandler);
		}, errorHandler);
    });
	
	asyncTest("Delete Directory", 2, function () {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024, function(fs) {
			fs.root.getDirectory("newDir", {create: false}, function(directoryEntry) {
				ok(directoryEntry, "Directory Exist");
				directoryEntry.remove(function(){ 
					ok(true, "Directory Deleted");
					start();
				},errorHandler);
			}, errorHandler);
		}, errorHandler);
    });
	
	module("errors");
	asyncTest("File not found error", 1, function () {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024, function(fs) {
			fs.root.getFile('unknownfile.name', {create: false}, function(fileEntry) {
				ok(false, "File Exist");
			}, function(event){
				equal(event.name, "NotFoundError", "File not found");
				start();
			});
		}, errorHandler);
    });
	
	asyncTest("Open file reader with create true - overwrites existing files", 1, function () {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024, function(fs) {
			fs.root.getFile('log.txt', {create: true}, function(fileEntry) {
				fileEntry.file(function(file) {
					var reader = new FileReader();
					reader.onloadend = function(e) {
						ok(!this.result, "File content is empty");
						start();
					};
					reader.readAsText(file);
				}, errorHandler);
			}, errorHandler);
		}, errorHandler);
    });
	
	asyncTest("Delete Directory with files", 3, function () {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024, function(fs) {
			fs.root.getDirectory("newDirWithFiles", {create: false}, function(directoryEntry) {
				ok(directoryEntry, "Directory Exist");
				directoryEntry.remove(function(){ 
					ok(false, "Directory with files can't be removed");
					start();
				}, function(event){
					equal(event.name, "InvalidModificationError", "You can't delete non empty directories with remove function.");
					directoryEntry.removeRecursively(function(){ 
						ok(true, "Directory Deleted");
						start();
					},errorHandler);
				});
			}, errorHandler);
		}, errorHandler);
    });
});