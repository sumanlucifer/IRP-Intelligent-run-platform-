sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"ey/irp/IRPModule/formatter/formatter",
	"sap/ui/core/format/DateFormat",
	"sap/base/Log",
	"sap/m/MessageToast"

], function (BaseController, JSONModel, formatter, DateFormat, Log, MessageToast) {
	"use strict";
	var that;
	return BaseController.extend("ey.irp.IRPModule.controller.systemLicense", {
		formatter: formatter,
		onInit: function () {
			that = this;
			that.loadsysLicense();
			that.loadsyMLicense();
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

		onPressSysLicensePorcess: function (oevent) {
			var navCon = oevent.getSource().getParent().getParent();
			navCon.back();

		},

		// loadsysLicense: function () {
		// 	sap.ui.core.BusyIndicator.show();

		// 	jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getSLicense")

		// 	.done(function (data) {
		// 			var odata = data.body.d.results;
		// 			that.sysLicenseModel = new JSONModel();
		// 			that.getView().setModel(that.sysLicenseModel, "sysLicenseModel");
		// 			that.getView().getModel("sysLicenseModel").setProperty("/sysLicenseTableData", odata);

		// 			sap.ui.core.BusyIndicator.hide();
		// 		})
		// 		.fail(function (jqXHR, textStatus) {
		// 			sap.ui.core.BusyIndicator.hide();
		// 			that.errorMessage();
		// 		})
		// 		.always(function () {
		// 			sap.ui.core.BusyIndicator.hide();

		// 		});
		// },
		// loadsyMLicense: function () {
		// 	sap.ui.core.BusyIndicator.show();

		// 	jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getMLicense")

		// 	.done(function (oData) {
		// 			oData.data.map((el) => {
		// 				el.START_DATE = el.START_DATE.split("T")[0];
		// 				el.EXPIRATION_DATE = el.EXPIRATION_DATE.split("T")[0];
		// 			});
		// 			var odata = oData.data;
		// 			that.sysMModel = new JSONModel();
		// 			that.getView().setModel(that.sysMModel, "sysMModel");

		// 			that.getView().getModel("sysMModel").setProperty("/sysMdata", odata);

		// 			sap.ui.core.BusyIndicator.hide();
		// 		})
		// 		.fail(function (jqXHR, textStatus) {
		// 			sap.ui.core.BusyIndicator.hide();
		// 			that.errorMessage();
		// 		})
		// 		.always(function () {
		// 			sap.ui.core.BusyIndicator.hide();

		// 		});
		// },

		onBeforeRendering: function () {

		},

		onAfterRendering: function () {

		},

		onExit: function () {

		},
		onListItemPress: function (oEvent) {
			var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();

			this.getSplitAppObj().toDetail(this.createId(sToPageId));
		},

		getSplitAppObj: function () {
			var result = this.byId("SplitAppDemo");
			if (!result) {
				Log.info("SplitApp object can't be found");
			}
			return result;
		},

		onListItemPressApp: function (oEvent) {
			var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();

			this.getSplitAppObjApp().toDetail(this.createId(sToPageId));
		},

		getSplitAppObjApp: function () {
			var result = this.byId("SplitAppDemoApp");
			if (!result) {
				Log.info("SplitApp object can't be found");
			}
			return result;
		},

	});

});