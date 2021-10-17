function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZIRP_MONTH_END_CLOSING_API_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}