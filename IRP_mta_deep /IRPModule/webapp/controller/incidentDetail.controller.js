sap.ui.define([

	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/XMLView"
], function (BaseController, JSONModel, XMLView) {
	"use strict";
	var that;
	var sPath;
	return BaseController.extend("ey.irp.IRPModule.controller.incidentDetail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ey.irp.IRPModule.view.incidentDetail
		 */
		onInit: function () {
			that = this;
			this.getView().byId("idTextBox").setProperty("visible", true);
			this.getView().byId("idSubmit").setProperty("visible", false);
			this.getView().addEventDelegate({
				onBeforeShow: function (evt) {
					that.onBreforeLoad(evt);
					// page1 is about to be shown; act accordingly - if required you can read event information from the evt object
					console.log(evt);
				},
				onAfterHide: function (evt) {
					console.log(evt);
				}
			});
			//	this.incDetail();

			///////////////////////////////////////////////////
			//	var oRouter = this.getRouter();
			// oRouter.getRoute("incdetail").attachMatched(this.onRouteMatched, this);

		},

		onPressIncidentDetails: function (oevent) {

			var navCon = oevent.getSource().getParent().getParent();
			navCon.back();
		},

		onBreforeLoad: function (oEvent) {
			// page1 is about to be shown; act accordingly - if required you can read event information from the evt object
			console.log(oEvent);
			this.getView().byId("idTextBox").setProperty("visible", true);
			this.getView().byId("idUpdate").setProperty("visible", true);
			this.getView().byId("idUpdateBox").setProperty("visible", false);
			this.getView().byId("idSubmit").setProperty("visible", false);
			var incData = that.getView().getModel("incList").getData().data;
			var incModel = new JSONModel(incData);
			this.getView().setModel(incModel, "incModel");
			/*this.getView().byId("idsf").setModel(incModel, "incModel");
			this.getView().byId("idsf1").setModel(incModel, "incModel");
			this.getView().byId("idTextForm").setModel(incModel, "incModel");
			this.getView().byId("idTextForm1").setModel(incModel, "incModel");*/

			var oArg = oEvent.data;
			var oForm = this.getView().byId("idsf");
			var oForm1 = this.getView().byId("idsf1");
			var oFormText = this.getView().byId("idTextForm");
			var oFormText1 = this.getView().byId("idTextForm1");
			/*	oView.bindElement({
					 path: "/data/" + oArg.incident + */
			sPath = "/" + oArg;
			//	var sPath = "/data/" + oArg.incident;
			oFormText.bindElement("incModel>" + sPath);
			oForm.bindElement("incModel>" + sPath);
			oForm1.bindElement("incModel>" + sPath);

			oFormText1.bindElement("incModel>" + sPath);
			// oForm.bindElement(sPath);
			// path: oArg.incident
			//	oForm.bindElement({ path: sPath, model: "incModel" });

			// path: "/("+oArg.incident+")"
			var systemId = this.getView().byId("idsysIdtext").getText();
				$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getAttachment?" + "sysId=" + systemId)
				.done(function (data) {

					var attachedData = data.data;
                 //  var fileName = attachedData.file_name;
					var oModelInvtry = new JSONModel(attachedData);
					that.getView().getModel("incList").setProperty("/Attachments", attachedData);
				

				})
				.fail(function (jqXHR, textStatus) {
					
				})
				.always(function () {

				});

		},
		onPdf:function(oEvent){
			
				var oView = this.getView();
			var oDialog = oView.byId("pdf");
		// ///create dialog lazily
			if (!oDialog) {
		// 		// create dialog via fragment factory
		 oDialog = sap.ui.xmlfragment(oView.getId(), "ey.irp.IRPModule.view.pdf", this);
	 		oView.addDependent(oDialog);
		 	}
		 	oDialog.open();
	
		
	
			
		},
		
			onCloseFilterDialog: function(oEvent) {
			console.log("Sandeep")
			that.getView().byId("pdf").close();
		
		},

		
		onIncidentsList: function () {
			this.getView().byId("idSubmit").setProperty("visible", false);
			var url = "https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getServicenowTableData";
			var that = this;

			$.ajax({
				url: url,
				type: "GET",
				crossDomain: true,
				dataType: "application/json",
				async: false,

				error: function (d) {
					alert("success ", d);

					var serNowData = JSON.parse(d.responseText);

					//var serArr = oModelSerNow.data;
					var oModelSerNow = new JSONModel(serNowData);
					var oView = that.getView();
					//var oModelwriter = new JSONModel(aData);
					oView.setModel(oModelSerNow, "incList");

				}

			});

		},

		onRouteMatched: function (oEvent) {
			this.getView().byId("idTextBox").setProperty("visible", true);
			this.getView().byId("idUpdate").setProperty("visible", true);
			this.getView().byId("idUpdateBox").setProperty("visible", true);
			this.getView().byId("idSubmit").setProperty("visible", false);
			var incData = this.getView().getModel("incList").getData().data;
			var incModel = new JSONModel(incData);
			this.getView().setModel(incModel, "incModel");
			this.getView().byId("idsf").setModel(incModel, "incModel");
			this.getView().byId("idsf1").setModel(incModel, "incModel");
			this.getView().byId("idTextForm").setModel(incModel, "incModel");
			this.getView().byId("idTextForm1").setModel(incModel, "incModel");

			var oArg = oEvent.getParameter("arguments");
			var oForm = this.getView().byId("idsf");
			var oForm1 = this.getView().byId("idsf1");
			var oFormText = this.getView().byId("idTextForm");
			var oFormText1 = this.getView().byId("idTextForm1");

			var sPath = "/" + oArg.incident;

			oFormText.bindElement("incModel>" + sPath);
			oForm.bindElement("incModel>" + sPath);
			oForm1.bindElement("incModel>" + sPath);

			oFormText1.bindElement("incModel>" + sPath);

		},
		/*	onBeforeRendering:function(){
				this.incDetail();
			},*/
		/*	incDetail:function(){
				
					this.getView().byId("idTextBox").setProperty("visible", true);
				this.getView().byId("idUpdate").setProperty("visible",true);
						this.getView().byId("idUpdateBox").setProperty("visible",true);
						this.getView().byId("idSubmit").setProperty("visible",false);
				var incData = this.getView().getModel("incList").getData().data;
			//	var incData = this.getOwnerComponent().getModel("incList").getData().data;
			var incData = this.getView().getModel("incList");
				var incModel = new JSONModel(incData);
				this.getView().setModel(incModel, "incModel");
				this.getView().byId("idsf").setModel(incModel, "incModel");
				this.getView().byId("idsf1").setModel(incModel, "incModel");
				this.getView().byId("idTextForm").setModel(incModel, "incModel");
				this.getView().byId("idTextForm1").setModel(incModel, "incModel");
				
			//	var oArg = oEvent.getParameter("arguments");
				var oForm = this.getView().byId("idsf");
				var oForm1 = this.getView().byId("idsf1");
					var oFormText = this.getView().byId("idTextForm");
						var oFormText1 = this.getView().byId("idTextForm1");
			
					 var sPath = "/" + incNumber;
			
					oFormText.bindElement("incModel>" + sPath);
				oForm.bindElement("incModel>" + sPath);
				oForm1.bindElement("incModel>" + sPath);
			
				oFormText1.bindElement("incModel>" + sPath);
				
				
				
				
				
			},*/

		onUpdate: function () {

			this.getView().byId("idTextBox").setProperty("visible", false);
			this.getView().byId("idUpdateBox").setProperty("visible", true);
			this.getView().byId("idSubmit").setProperty("visible", true);
			this.getView().byId("idUpdate").setProperty("visible", false);

		},

		onUpdateSubmit: function () {

			var sys_Id = this.getView().byId("idsysIdtext").getText();
			var nUser = this.getView().byId("idUser").getValue();
			var nCategory = this.getView().byId("idcategory").getValue();
			var nSubCateory = this.getView().byId("idSubcategory").getValue();
			var nBusService = this.getView().byId("idbusinessService").getValue();
			var nService = this.getView().byId("idService").getValue();
		/*	var nContact = this.getView().byId("idcontact").getValue();*/
			var nState = this.getView().byId("idstate").getValue();
			var nImpact = this.getView().byId("idImpact").getValue();
			var nPriority = this.getView().byId("idpriority").getValue();
			var nAssigGrp = this.getView().byId("idassignmentGrp").getValue();
			var nAssigTo = this.getView().byId("idassignedTo").getValue();
			var nShortDes = this.getView().byId("idshortDes").getValue();
				var payload = {

				"sys_id" : sys_Id,
/*				"number": nNumber,*/
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
				url: "https://irpnodejsapp-sp.cfapps.eu10.hana.ondemand.com/api/updateServiceNowTableData",

				type: "PUT",
				data: payload, 
			/*	sys_Id: sys_Id,*/
				dataType: "application/json",
				success: function (d) {
					alert("Incident is created");
				}
			});
		
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
		 * @memberOf ey.irp.IRPModule.view.incidentDetail
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ey.irp.IRPModule.view.incidentDetail
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ey.irp.IRPModule.view.incidentDetail
		 */
		//	onExit: function() {
		//
		//	}

	});

});