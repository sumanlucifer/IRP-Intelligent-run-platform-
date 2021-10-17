sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"ey/irp/IRPModule/formatter/formatter",
	"sap/m/MessageToast",
	"sap/base/Log",
], function (BaseController, JSONModel, formatter, MessageToast, Log) {
	"use strict";
	var that;
	return BaseController.extend("ey.irp.IRPModule.controller.enqueueRequests", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ey.irp.IRPModule.view.enqueueRequests
		 */
		onInit: function () {
			that = this;

			this.getView().addEventDelegate({
				onBeforeShow: function (evt) {
					// page1 is about to be shown; act accordingly - if required you can read event information from the evt object
					console.log(evt);
				},
				onAfterHide: function (evt) {
					console.log(evt);
				}
			});
		},

		onPressEnqueneRPorcess: function (oevent) {
			var navCon = oevent.getSource().getParent().getParent();

			navCon.back();

		},

		loadsysEnquene: function () {

			sap.ui.core.BusyIndicator.show();

			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getEnqueueRequest")

			.done(function (data) {
					var odata = data.body.d.results;
					that.sysEnqueneModel = new JSONModel();
					that.getView().setModel(that.sysEnqueneModel, "sysEnqueneModel");
					that.getView().getModel("sysEnqueneModel").setProperty("/sysEnqueneTableData", odata);

					sap.ui.core.BusyIndicator.hide();
				})
				.fail(function (jqXHR, textStatus) {
					sap.ui.core.BusyIndicator.hide();
					that.errorMessage();
				})
				.always(function () {
					sap.ui.core.BusyIndicator.hide();

				});

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ey.irp.IRPModule.view.enqueueRequests
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ey.irp.IRPModule.view.enqueueRequests
		 */
		onAfterRendering: function () {
			that.loadsysEnquene();
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ey.irp.IRPModule.view.enqueueRequests
		 */
		//	onExit: function() {
		//
		//	}

	});

});