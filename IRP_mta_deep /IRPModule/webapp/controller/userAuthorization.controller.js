sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/XMLView",
	"ey/irp/IRPModule/formatter/formatter",
], function (BaseController, JSONModel, XMLView, formatter) {
	"use strict";
	var that;
	var sPath;

	return BaseController.extend("ey.irp.IRPModule.controller.userAuthorization", {
		formatter: formatter,
	
		onInit: function () {
			that = this;
			this.getView().addEventDelegate({
				onBeforeShow: function (evt) {

					// page1 is about to be shown; act accordingly - if required you can read event information from the evt object
					console.log(evt.data);
					that.user = evt.data;
					that.loadUserRole(systems);
				},
				onAfterHide: function (evt) {
					console.log(evt);
				}
			});
			console.log("kuchhh bhi");
		},
		onPressUAuth: function (oevent) {

			var navCon = oevent.getSource().getParent().getParent();
			navCon.back();
			that.getView().getModel("sysListModel").setProperty("/visible", true);
		},
		loadUserRole: function (oevent) {
			var sysSelection = oevent;
			sap.ui.core.BusyIndicator.show();

			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getUserRolesBySystem?" + "systems=" + sysSelection +
				"&process=USER_ROLE" + "&user=" + that.user)

			.done(function (data) {

					var oUName = that.user;
					var odata = data.body;

					var oJsonWpModel = new sap.ui.model.json.JSONModel();
					oJsonWpModel.setData(odata);
					that.getView().setModel(oJsonWpModel, "userAuthModel");
					that.getView().getModel("userAuthModel").setProperty("/", odata);
					that.getView().getModel("userAuthModel").setProperty("/userTitle", oUName);


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

		onBeforeRendering: function () {

		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ey.irp.IRPModule.view.userAuthorization
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ey.irp.IRPModule.view.userAuthorization
		 */
		//	onExit: function() {
		//
		//	}

	});

});