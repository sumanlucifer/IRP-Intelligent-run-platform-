sap.ui.define([
	
		"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
], function (BaseController, JSONModel, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("ey.irp.IRPModule.controller.createIncident", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ey.irp.IRPModule.view.createIncident
		 */
		onInit: function () {

		},
		
		onSubmit: function () {
			var nNumber = this.getView().byId("idnumber").getValue();
			var nUser = this.getView().byId("idUser").getValue();
			var nCategory = this.getView().byId("idcategory").getValue();
			var nSubCateory = this.getView().byId("idSubcategory").getValue();
			var nBusService = this.getView().byId("idbusinessService").getValue();
			var nService = this.getView().byId("idService").getValue();
			var nContact = this.getView().byId("idcontact").getValue();
			var nState = this.getView().byId("idstate").getValue();
			var nImpact = this.getView().byId("idImpact").getValue();
			var nPriority = this.getView().byId("idpriority").getValue();
			var nAssigGrp = this.getView().byId("idassignmentGrp").getValue();
			var nAssigTo = this.getView().byId("idassignedTo").getValue();
			var nShortDes = this.getView().byId("idshortDes").getValue();
			//	var nNumber = this.getView().byId("idshortDes").getValue();
			var that = this;
			/*var oEntry ={};
			
			oEntry.number= nNumber;
			oEntry.opened_by= nUser;
			oEntry.category= nCategory;
			oEntry.subcategory= nSubCateory;
			oEntry.business_service= nBusService;
			oEntry.service_offering= nService;
			oEntry.state= nState;
			oEntry.short_description= nShortDes;
			oEntry.priority= nPriority;
			oEntry.assignment_group= nAssigGrp;
			oEntry.assigned_to= nAssigTo;*/

			//	var payload = JSON.stringify(oEntry);
			var payload = {

				"number": nNumber,
				"opened_by": nUser,
				"category": nCategory,
				"subcategory": nSubCateory,
				"business_service": nBusService,
				"service_offering": nService,
				"state": nState,
				"short_description": nShortDes,
				"priority": nPriority,
				"assignment_group": nAssigGrp,
				"assigned_to": nAssigTo

			};

			$.ajax({
				url: "https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/postServiceNowTableData",

				type: "POST",
				data: payload,
				dataType: "application/json",
				success: function (d) {
					alert("Incident is created");
				}
			});

		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ey.irp.IRPModule.view.createIncident
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ey.irp.IRPModule.view.createIncident
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ey.irp.IRPModule.view.createIncident
		 */
		//	onExit: function() {
		//
		//	}

	});

});