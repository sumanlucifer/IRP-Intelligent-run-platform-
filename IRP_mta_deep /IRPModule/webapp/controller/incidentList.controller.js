sap.ui.define([

	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/mvc/XMLView"
], function (BaseController, JSONModel, Filter, FilterOperator, XMLView) {
	"use strict";
	var that;
	return BaseController.extend("ey.irp.IRPModule.controller.incidentList", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ey.irp.IRPModule.view.incidentList
		 */
		onInit: function () {
			this.onIncidentsList();
			that = this;
			
		},

		onPressIncident: function (oevent) {
			var navCon = oevent.getSource().getParent().getParent();
			navCon.back();
		},

		onIncidentsList: function () {

			var incModel = this.getView().getModel("incList");
			var oTable = this.getView().byId("idIncTable");
			oTable.setModel(incModel, "incList");
			
		},
		
		onStatus:function(oEvent){
			
			 var sQuery =	oEvent.getSource().getSelectedItem().getText();
			 	if (sQuery && sQuery.length > 0) {
				var filter = new Filter("state", FilterOperator.Contains, sQuery);

			//	var filter1 = new Filter("opened_by/display_value", FilterOperator.Contains, sQuery);
				var aFilters = new sap.ui.model.Filter([filter], false);
				//	aFilters.push(filter,filter1);
				//aFilters.push(filter1);
			}
			var oBinding = this.getView().byId("idIncTable").getBinding("items");
			oBinding.filter(aFilters, "Application");
		},
	
		onSearch: function (oEvent) {

			//	var aFilters = [];
			
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("number", FilterOperator.Contains, sQuery);

				var filter1 = new Filter("opened_by/display_value", FilterOperator.Contains, sQuery);
				var aFilters = new sap.ui.model.Filter([filter, filter1], false);
				//	aFilters.push(filter,filter1);
				//aFilters.push(filter1);
			}
			var oBinding = this.getView().byId("idIncTable").getBinding("items");
			oBinding.filter(aFilters, "Application");

		},
		onCreateNew: function () {

			// this.byId("pageContainer").to(this.getView().createId("xml_incidentList"));
			//this.byId("pageContainer").to(this.getView().createId("xml_createIncident"));
		//	this.getView().getParent().to(this.getView().createId("xml_createIncident"));
				this._createViewInstance("createIncident");
			//this.getRouter().navTo("createIncident");

		},

		onRowSelect: function (oEvent) {

			/////////////////////////// using by router
			var oItem = oEvent.getSource().getBindingContext("incList");
			//var incidentNumber = oItem.getProperty("number");
			var incidentNumber = oItem.getPath();
			var sPath = incidentNumber.slice(6);

			// // this.getRouter().navTo("incdetail",{incident: incidentNumber});
			/*	 this.getRouter().navTo("incdetail", {
				 	incident: sPath
				 });*/
			//////////////////////////////////////////////////////////
			this._createViewInstance("incidentDetail", sPath);

			// this.getView().getParent().to(this.getView().createId("xml_incidentDetail").split("--xml_incidentList").join(""));
		},

		_createViewInstance: function (sView, data) {
			//	var navCon = this.byId("pageContainer");
			var navCon = this.getView().getParent();
			// instantiate view using create-factory
			XMLView.create({
				viewName: `ey.irp.IRPModule.view.${sView}`
			}).then(function (oView) {
				// navCon.removeAllPages();
				navCon.removePage(oView);
				// View loaded ...
				that._oView = oView;
				navCon.addPage(oView);
				navCon.to(oView, "show", data);
			});

		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ey.irp.IRPModule.view.incidentList
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ey.irp.IRPModule.view.incidentList
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ey.irp.IRPModule.view.incidentList
		 */
		//	onExit: function() {
		//
		//	}

	});

});