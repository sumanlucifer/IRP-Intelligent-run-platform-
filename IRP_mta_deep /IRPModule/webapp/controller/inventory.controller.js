sap.ui.define([

	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/mvc/XMLView",
	"ey/irp/IRPModule/formatter/formatter"
], function (BaseController, JSONModel, Filter, FilterOperator, XMLView,formatter) {
	"use strict";
	var that;
    var invselection;
    var purReqselection;
    var poselection;
    var GRselection;
    var IVselection;
    var APRselection;
   	var P2PFilters;
   	var  filtered;
	return BaseController.extend("ey.irp.IRPModule.controller.inventory", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ey.irp.IRPModule.view.inventory
		 */
		 formatter: formatter,
		onInit: function () {
			// this.getView().setModel("inventoryModel");
			var oTable = this.getView().byId("idIvnTable");
			//	oTable.setModel(incModel, "inventoryModel");
			that = this;
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
			this.onInventoryList();

		},
		onBreforeLoad: function (oEvent) {
			// page1 is about to be shown; act accordingly - if required you can read event information from the evt object
			console.log(oEvent);
			var oPanelMenu1 = this.getView().byId("idIconTabBar");
			oPanelMenu1.setSelectedKey(oEvent.data);
			this.getView().byId("idEYPA").setProperty("title", oEvent.data);
			//oPanelMenu1.setSelectedKey("Heavy");

		},

		onInventoryList: function () {
			var incModel = that.getView().getModel("inventoryModel");
			var oTable = this.getView().byId("idIvnTable");
			oTable.setModel(incModel, "inventoryModel");

		},
		onPressbackP2P:function(oevent){
			
				var navCon = oevent.getSource().getParent().getParent();
			navCon.back();
		},
		
		onInvCombo:function(oEvent){
			
			//alert("combobox is triggered");
		/*	oListBinding.aFilters = null;
            oTableEmpl.getModel().refresh(true);*/
            var oBinding = this.getView().byId("idIvnTable").getBinding("items");
            P2PFilters = null;
            oBinding.filter(P2PFilters, "Application");
           
           	var oTableInv = this.getView().byId("idIvnTable");
           	oTableInv.getModel("inventoryModel").refresh(true);
			 invselection = oEvent.getParameters().value;
		},
		
		
		onSearch: function (oEvent) {

			//	var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			/*if (sQuery && sQuery.length > 0) {
				var filter = new Filter("MATNR", FilterOperator.Contains, sQuery);

				var filter1 = new Filter("PLANT", FilterOperator.EQ, sQuery);
				var aFilters = new sap.ui.model.Filter([filter, filter1], false);
				
			}*/
			if (sQuery) {
			if(invselection==="Plant"){
			
				/*if (sQuery.length > 0 && sQuery.length <= 4) {*/
					var filter1 = new Filter("PLANT", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter1], false);
					var oBinding = this.getView().byId("idIvnTable").getBinding("items");
					oBinding.filter(P2PFilters, "Application");
				} else if(invselection==="Material Num"){
					var filter = new Filter("MATNR", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter], false);
					var oBinding = this.getView().byId("idIvnTable").getBinding("items");
				  	oBinding.filter(P2PFilters, "Application");
				}else if (invselection=== "All Inventory" || sQuery === null || sQuery === "")
				
				{
					 P2PFilters = new sap.ui.model.Filter([], false);
					var oBinding = this.getView().byId("idIvnTable").getBinding("items");
					oBinding.filter(P2PFilters, "Application");
				}
			}
		/*	var oBinding = this.getView().byId("idIvnTable").getBinding("items");
			oBinding.filter(aFilters, "Application");*/

		},
		onInvType:function(oEvent){
			
		   /* var	 sQuery = oEvent.getParameters().value;*/
		    var sQuery= oEvent.getSource().getSelectedItem().getKey();
		    var filter = new Filter("STATUS", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter], false);
					var oBinding = this.getView().byId("idIvnTable").getBinding("items");
				  	oBinding.filter(P2PFilters, "Application");
		},
		
		onPurReqCombo:function(oEvent){
			
			//alert("combobox is triggered");
		/*	oListBinding.aFilters = null;
            oTableEmpl.getModel().refresh(true);*/
            var oBinding = this.getView().byId("idPurReqTable").getBinding("items");
            P2PFilters = null;
            oBinding.filter(P2PFilters, "Application");
           
           	var oTableInv = this.getView().byId("idPurReqTable");
           	oTableInv.getModel("PurReqModel").refresh(true);
			 purReqselection = oEvent.getParameters().value;
		},
		
		
		onSearchPurReq:function(oEvent){
				var sQuery = oEvent.getSource().getValue();
				
					if (sQuery) {
			if(purReqselection==="Plant"){
			
				/*if (sQuery.length > 0 && sQuery.length <= 4) {*/
					var filter1 = new Filter("PLANT", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter1], false);
					var oBinding = this.getView().byId("idPurReqTable").getBinding("items");
					oBinding.filter(P2PFilters, "Application");
				} else if(purReqselection==="PR Number"){
					var filter = new Filter("PR", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter], false);
					var oBinding = this.getView().byId("idPurReqTable").getBinding("items");
				  	oBinding.filter(P2PFilters, "Application");
				}else if(purReqselection==="Material Number"){
					var filter = new Filter("MATNR", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter], false);
					var oBinding = this.getView().byId("idPurReqTable").getBinding("items");
				  	oBinding.filter(P2PFilters, "Application");
				}else if (purReqselection=== "All Requisition" || sQuery === null || sQuery === "")
				
				{
					 P2PFilters = new sap.ui.model.Filter([], false);
					var oBinding = this.getView().byId("idPurReqTable").getBinding("items");
					oBinding.filter(P2PFilters, "Application");
				}
			}
				
			
			
			
			
		},
		onPRStatus:function(oEvent){
			
		   /* var	 sQuery = oEvent.getParameters().value;*/
		    var sQuery= oEvent.getSource().getSelectedItem().getKey();
		    var filter = new Filter("STATUS", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter], false);
					var oBinding = this.getView().byId("idPurReqTable").getBinding("items");
				  	oBinding.filter(P2PFilters, "Application");
		},
		
		onPOCombo:function(oEvent){
			
			//alert("combobox is triggered");
		/*	oListBinding.aFilters = null;
            oTableEmpl.getModel().refresh(true);*/
            var oBinding = this.getView().byId("idPurOrdrTable").getBinding("items");
            P2PFilters = null;
            oBinding.filter(P2PFilters, "Application");
           
           	var oTableInv = this.getView().byId("idPurOrdrTable");
           	oTableInv.getModel("purOrderModel").refresh(true);
			 poselection = oEvent.getParameters().value;
		},
		onSearchPO:function(oEvent){
				var sQuery = oEvent.getSource().getValue();
			
			if (sQuery) {
			if(poselection==="Plant"){
			
				/*if (sQuery.length > 0 && sQuery.length <= 4) {*/
					var filter1 = new Filter("PLANT", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter1], false);
					var oBinding = this.getView().byId("idPurOrdrTable").getBinding("items");
					oBinding.filter(P2PFilters, "Application");
				} else if(poselection==="PO Number"){
					var filter = new Filter("PONUMBER", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter], false);
					var oBinding = this.getView().byId("idPurOrdrTable").getBinding("items");
				  	oBinding.filter(P2PFilters, "Application");
				}else if(poselection==="Company Code"){
					var filter = new Filter("COMPANYCODE", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter], false);
					var oBinding = this.getView().byId("idPurOrdrTable").getBinding("items");
				  	oBinding.filter(P2PFilters, "Application");
				}else if(poselection==="Material Number"){
					var filter = new Filter("MATERIAL", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter], false);
					var oBinding = this.getView().byId("idPurOrdrTable").getBinding("items");
				  	oBinding.filter(P2PFilters, "Application");
				}else if(poselection==="Vendor"){
					var filter = new Filter("VENDOR", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter], false);
					var oBinding = this.getView().byId("idPurOrdrTable").getBinding("items");
				  	oBinding.filter(P2PFilters, "Application");
				}else if (poselection=== "All Process" || sQuery === null || sQuery === "")
				
				{
					 P2PFilters = new sap.ui.model.Filter([], false);
					var oBinding = this.getView().byId("idPurOrdrTable").getBinding("items");
					oBinding.filter(P2PFilters, "Application");
				}
			}
			
		},
		
		
			onGRCombo:function(oEvent){
			
			//alert("combobox is triggered");
		/*	oListBinding.aFilters = null;
            oTableEmpl.getModel().refresh(true);*/
            var oBinding = this.getView().byId("idGRTable").getBinding("items");
            P2PFilters = null;
            oBinding.filter(P2PFilters, "Application");
           
           	var oTableInv = this.getView().byId("idGRTable");
           	oTableInv.getModel("GoodRecieptModel").refresh(true);
			 GRselection = oEvent.getParameters().value;
		},
			onSearchGR:function(oEvent){
				var sQuery = oEvent.getSource().getValue();
			
			if (sQuery) {
			if(GRselection==="Plant"){
			
				/*if (sQuery.length > 0 && sQuery.length <= 4) {*/
					var filter1 = new Filter("PLANT", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter1], false);
					var oBinding = this.getView().byId("idGRTable").getBinding("items");
					oBinding.filter(P2PFilters, "Application");
				} else if(GRselection==="PO Number"){
					var filter = new Filter("PO", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter], false);
					var oBinding = this.getView().byId("idGRTable").getBinding("items");
				  	oBinding.filter(P2PFilters, "Application");
				}else if(GRselection==="Material Number"){
					var filter = new Filter("MATNR", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter], false);
					var oBinding = this.getView().byId("idGRTable").getBinding("items");
				  	oBinding.filter(P2PFilters, "Application");
				}else if (GRselection=== "All Good Receipts" || sQuery === null || sQuery === ""){
					 P2PFilters = new sap.ui.model.Filter([], false);
					var oBinding = this.getView().byId("idGRTable").getBinding("items");
					oBinding.filter(P2PFilters, "Application");
				}
			}
			
		},
			onIVCombo:function(oEvent){
			
			//alert("combobox is triggered");
		/*	oListBinding.aFilters = null;
            oTableEmpl.getModel().refresh(true);*/
            var oBinding = this.getView().byId("idIVTable").getBinding("items");
            P2PFilters = null;
            oBinding.filter(P2PFilters, "Application");
           
           	var oTableInv = this.getView().byId("idIVTable");
           	oTableInv.getModel("InvoiceModel").refresh(true);
			 IVselection = oEvent.getParameters().value;
		},
		onSearchIV:function(oEvent){
				var sQuery = oEvent.getSource().getValue();
			
				if (sQuery) {
			if(IVselection==="Plant"){
			
				/*if (sQuery.length > 0 && sQuery.length <= 4) {*/
					var filter1 = new Filter("PLANT", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter1], false);
					var oBinding = this.getView().byId("idIVTable").getBinding("items");
					oBinding.filter(P2PFilters, "Application");
				} else if(IVselection==="PO Number"){
					var filter = new Filter("PURORDER", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter], false);
					var oBinding = this.getView().byId("idIVTable").getBinding("items");
				  	oBinding.filter(P2PFilters, "Application");
				}else if(IVselection==="Vendor"){
					var filter = new Filter("VENDOR", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter], false);
					var oBinding = this.getView().byId("idIVTable").getBinding("items");
				  	oBinding.filter(P2PFilters, "Application");
				}else if (IVselection=== "All Invoices" || sQuery === null || sQuery === ""){
					 P2PFilters = new sap.ui.model.Filter([], false);
					var oBinding = this.getView().byId("idIVTable").getBinding("items");
					oBinding.filter(P2PFilters, "Application");
				}
			}
			
		},
			onAPRCombo:function(oEvent){
			
			//alert("combobox is triggered");
		/*	oListBinding.aFilters = null;
            oTableEmpl.getModel().refresh(true);*/
            var oBinding = this.getView().byId("idAPRTable").getBinding("items");
            P2PFilters = null;
            oBinding.filter(P2PFilters, "Application");
           
           	var oTableInv = this.getView().byId("idAPRTable");
           	oTableInv.getModel("PaymentRunModel").refresh(true);
			 APRselection = oEvent.getParameters().value;
		},
		onSearchAPR:function(oEvent){
				var sQuery = oEvent.getSource().getValue();
			
			if (sQuery) {
			if(APRselection==="Company Code"){
			
				/*if (sQuery.length > 0 && sQuery.length <= 4) {*/
					var filter1 = new Filter("COCODE", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter1], false);
					var oBinding = this.getView().byId("idAPRTable").getBinding("items");
					oBinding.filter(P2PFilters, "Application");
				} else if(APRselection==="Vendor Number"){
					var filter = new Filter("VENDOR", FilterOperator.Contains, sQuery);
					 P2PFilters = new sap.ui.model.Filter([filter], false);
					var oBinding = this.getView().byId("idAPRTable").getBinding("items");
				  	oBinding.filter(P2PFilters, "Application");
				}else if (APRselection=== "All Payments Run" || sQuery === null || sQuery === ""){
					 P2PFilters = new sap.ui.model.Filter([], false);
					var oBinding = this.getView().byId("idAPRTable").getBinding("items");
					oBinding.filter(P2PFilters, "Application");
				}
			}
			
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
		 * @memberOf ey.irp.IRPModule.view.inventory
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ey.irp.IRPModule.view.inventory
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ey.irp.IRPModule.view.inventory
		 */
		//	onExit: function() {
		//
		//	}

	});

});