sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/XMLView",
	"ey/irp/IRPModule/formatter/formatter",
], function (BaseController, JSONModel, XMLView, formatter) {
	"use strict";
	var that;
	return BaseController.extend("ey.irp.IRPModule.controller.user_Privilege", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ey.irp.IRPModule.view.user_Privilege
		 */
		onInit: function () {
			that = this;

			this.getView().addEventDelegate({
				onBeforeShow: function (evt) {

					// page1 is about to be shown; act accordingly - if required you can read event information from the evt object
					console.log(evt);
					that.user = evt.data;
					that.loadUserRoleHana(systems);
					that.loadUserRoleHanaP(systems);
				},
				onAfterHide: function (evt) {
					console.log(evt);
				}
			});
			console.log("kuchhh bhi");
			this.getView().byId("idVbox2").setProperty("visible", false);
		},

		onPressUAuthP: function (oevent) {

			var navCon = oevent.getSource().getParent().getParent();
			navCon.back();
			that.getView().getModel("sysListModel").setProperty("/visible", true);
		},

		loadUserRoleHana: function (oevent) {
			var sysSelection = oevent;
			sap.ui.core.BusyIndicator.show();

			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getDBUserRolesBySystem?" + "systems=" + sysSelection +
				"&process=USER_ROLE" + "&user=" + that.user)

			.done(function (data) {

					var oUName = that.user;
					var odata = data.body;

					var oJsonRoleHana = new sap.ui.model.json.JSONModel();
					oJsonRoleHana.setData(odata);
					that.getView().setModel(oJsonRoleHana, "userAuthHModel");
					that.getView().getModel("userAuthHModel").setProperty("/", odata);
					that.getView().getModel("userAuthHModel").setProperty("/userTitle", oUName);

					sap.ui.core.BusyIndicator.hide();
					that.successMessage();
				})
				.fail(function (textStatus) {
					sap.ui.core.BusyIndicator.hide();
					that.errorMessage();

				})
				.always(function () {
					sap.ui.core.BusyIndicator.hide();

				});
		},

		loadUserRoleHanaP: function (oevent) {
			var sysSelection = oevent;
			sap.ui.core.BusyIndicator.show();

			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getDBUserPrevilegesBySystem?" + "systems=" + sysSelection +
				"&process=USER_PRIVILEGES" + "&user=" + that.user)

			.done(function (data) {

					var oUName = that.user;
					var odata = data.body;

					var oJsonRoleHana = new sap.ui.model.json.JSONModel();
					oJsonRoleHana.setData(odata);
					that.getView().setModel(oJsonRoleHana, "userAuthHPModel");
					that.getView().getModel("userAuthHPModel").setProperty("/", odata);
					that.getView().getModel("userAuthHPModel").setProperty("/userTitle", oUName);

					sap.ui.core.BusyIndicator.hide();
					that.successMessage();
				})
				.fail(function (textStatus) {
					sap.ui.core.BusyIndicator.hide();
					that.errorMessage();

				})
				.always(function () {
					sap.ui.core.BusyIndicator.hide();

				});
		},

		onPress1: function () {
			this.getView().byId("idVbox1").setProperty("visible", true);
			this.getView().byId("idVbox2").setProperty("visible", false);
		},
		onPress2: function () {
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", true);
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
				console.log("deeps", data);
			});

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ey.irp.IRPModule.view.user_Privilege
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ey.irp.IRPModule.view.user_Privilege
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ey.irp.IRPModule.view.user_Privilege
		 */
		//	onExit: function() {
		//
		//	}

	});

});