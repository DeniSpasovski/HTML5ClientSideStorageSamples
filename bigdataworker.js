var recordsPerWorker = 25000;
var baseName = 'bigdata';
var isFirefox = false;

self.onmessage = function (oEvent) {
	if (oEvent.data.workerNb != null)
		PopulateDBFromWorker(oEvent.data.workerNb,0);  
}

var callbackFn = null;

function PopulateDBFromWorker(workerNb, start, callback){
	if(callback != null)
		callbackFn = callback;
		
	var initOpenReq = indexedDB.open(baseName);
	var startTime = new Date();
	initOpenReq.onsuccess = function() {
		var db = initOpenReq.result;
		var i = start;
		var workerStart = workerNb * recordsPerWorker;
		var transaction = db.transaction('testStore' , 'readwrite');
		var store = transaction.objectStore('testStore');
		transaction.oncomplete = function(){
			var completeTime = new Date();
			ConsoleLog("#worker " + workerNb + " items stored " + i +" in " + (completeTime-startTime)/1000 + " sec");
			db.close();
			if(i >= recordsPerWorker)
			{
				ConsoleLog("#populating worker " + workerNb + " completed.");
				notifyWorkerPopulated(workerNb);
			}
			else
				PopulateDBFromWorker(workerNb, i)
		};
			
		for (; i < start+2500; ++i) {
			sampleObject.num = workerStart + i;
			sampleObject.rank = "rank" + i%10;
			sampleObject.name = RandomNameArray[i%100];
			sampleObject.prop1 = i+randomtext[i%3];
			sampleObject.prop2 = i+randomtext[i%12]+RandomNameArray[i%87];
			sampleObject.prop3 = i+randomtext[i%11];
			sampleObject.prop4 = i+randomtext[i%13];
			sampleObject.prop5 = i+randomtext[i%13];
			sampleObject.prop6 = i+randomtext[i%15];
			sampleObject.prop7 = i+RandomNameArray[i%34];
			sampleObject.prop8 = i+RandomNameArray[i%100];
			sampleObject.prop9 = i+RandomNameArray[i%73];
			sampleObject.prop11 = RandomNameArray[i%45];
			sampleObject.prop12 = RandomNameArray[i%56];
			sampleObject.prop13 = RandomNameArray[i%100] + RandomNameArray[i%83];
			sampleObject.prop14 = i+randomtext[i%12]+RandomNameArray[i%90];
			sampleObject.prop15 = i+randomtext[i%11];
			sampleObject.prop16 = i+randomtext[i%13];
			sampleObject.prop17 = i+randomtext[i%13];
			sampleObject.prop18 = i+randomtext[i%15];
			sampleObject.prop19 = i+RandomNameArray[i%90];
			sampleObject.prop20 = i+RandomNameArray[i%100];
			store.put(sampleObject);
		}
		transaction.onerror = function(err){
			ConsoleLog(err);
		}
	}
}

function notifyWorkerPopulated(workerNb){
	if(isFirefox)
		callbackFn();
	else
		self.postMessage({"log":false,'message':"worker "+workerNb+" populated"});
}

function ConsoleLog(msg){
	if(isFirefox)
		console.log(msg);
	else
		self.postMessage({"log":true,'message':msg});
}
	
var randomtext = ["russety","unshammed","grange","spiderwort","anthropometry","rhinoscope","mercury","turner","underfinance","cestuses","squamous","consummator","unstaggered","ciscaucasia","reckless","ivories","salop","assort","pillbox","feminineness"];

var sampleObject = {data: Math.random(), 
		firm:'firmata',
        guid: "9df10490-99e2-4fae-8cb7-a84be7d5d914",
        isActive: true,
        picture: "http://placehold.it/32x32",
        project: "indexed db big data sample",
        author: "Deni Spasovski",
        loremipsum: "Et tempor reprehenderit minim est aliqua aliquip enim. Culpa fugiat officia elit reprehenderit consectetur aliqua magna do eiusmod sunt in deserunt. Ullamco ullamco quis velit dolore voluptate nulla excepteur irure velit non adipisicing nulla dolore. Sint nisi eiusmod quis sit. Aliquip aliqua dolore aute cillum labore aliqua velit do. Commodo veniam proident eu cillum eiusmod ex et mollit eiusmod laboris veniam tempor ad cillum.\r\n",
		num:0
		};	
		
var RandomNameArray = ["Caroyln","Grazier","Masako","Hopkin","Israel","Garica","Erica","Antle","Deanna","Keltner","Allison","Smoot","Antone",
"Leger","Misti","Jerez","Eleanora","Gauer","Janice","Bob","Melba","Fogel","Zetta","Lakin","Santos","Lovell","Khadijah","Yule","Arletha",
"Bradsher","Joan","Belnap","Timmy","Aguiniga","Sage","Husbands","Bradley","Reasoner","Socorro","Knipp","Kellie","Huffstutler","Arielle",
"Searle","Audrey","Shoaff","Stacee","Carmon","Jung","Trogdon","Sina","Wooden","Sharron","Payne","Lavonne","Machen","Zoraida","Fadden",
"Marianne","Mandelbaum","Kathern","Haugen","Herb","Suttles","Margaretta","Breton","Sheilah","Vanmatre","Marlene","Sievert","Cherelle",
"Kubicek","Asha","Manske","Bibi","Murry","Babara","Boyles","Danielle","Aaronson","Marta","Roth","Adriane","Caulder","Herminia","Monzon",
"Giovanni","Homes","Odelia","Bury","Shakita","Toombs","Lelah","Gongora","Hanna","Wiltse","Aja","Varnes","Chuck","Minogue"];