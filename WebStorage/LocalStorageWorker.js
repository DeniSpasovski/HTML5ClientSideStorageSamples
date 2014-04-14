self.onmessage = function (oEvent) {
	if (oEvent.data.testMessage != null){
		self.postMessage(typeof localStorage);
	}
}
