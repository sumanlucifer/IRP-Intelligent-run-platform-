sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"ey/irp/IRPModule/formatter/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/base/Log",
	"sap/ui/core/mvc/XMLView",

], function (BaseController, JSONModel, formatter, Filter, FilterOperator, MessageToast, Log, XMLView) {
	"use strict";
	var that;

	return BaseController.extend("ey.irp.IRPModule.controller.wokprocess", {
		formatter: formatter,

		onInit: function () {
			that = this;

			this.getView().addEventDelegate({
				onBeforeShow: function (evt) {
					var selectedSys = evt.data;

					var appSysList = that.getView().byId("listIDApp").getItems()[0];
					if (appSysList !== undefined) {

						var firstItemapp = that.getView().byId("listIDApp").getItems()[0];
						that.getView().byId("listIDApp").setSelectedItem(firstItemapp, true);

						this.sytemzz = that.getView().byId("listIDApp").getItems()[0].getTitle();

						that.loadWorkProcess(this.sytemzz);
						that.getView().getModel("sysListModel").setProperty("/Selectedsystem", this.sytemzz);

					} else {
						that.systemConfigData();
						that.getView().getModel("sysListModel").setProperty("/Selectedsystem", systems);
						that.loadWorkProcess(systems);

					}

				},
				onAfterHide: function (evt) {

				}
			});

		},

		systemConfigData: function () {
			var sysList = that.getView().getModel("sysListModel").getProperty("/SystemList");
			var sysSelected = [];
			dbSys = {};
			AppSys = {};
			var dbSysArr = [];
			var AppSysArr = [];
			var selectedKeys = that.getView().getModel("sysListModel").getProperty("/selectedKeys");

			for (var i = 0; i < selectedKeys.length; i++) {
				var sys = selectedKeys[i].getText();

				if (selectedKeys[i].getKey() === "DB") {
					var hanaDB = {
						"sysId": sys
					};

					dbSysArr.push(hanaDB);

					/*added by deeps*/

				} else if (selectedKeys[i].getKey() === "Application") {
					var application = {
						"sysId": sys
					};
					AppSysArr.push(application);

				}
				sysSelected.push(selectedKeys[i].getText());
			}

			dbSys = {
				"data": dbSysArr
			};
			AppSys = {
				"data": AppSysArr
			};

			if (dbSysArr.length !== 0) {
				that.getView().getModel("sysListModel").setProperty("/DBSystems", dbSys);
				that.getView().getModel("sysListModel").setProperty("/APPSystems", []);
			} else if (AppSysArr.length !== 0) {
				that.getView().getModel("sysListModel").setProperty("/DBSystems", []);
				that.getView().getModel("sysListModel").setProperty("/APPSystems", AppSys);
			} else if (selectedKeys.length === 0) {

				for (var i = 0; i < sysList.sysIdList.length; i++) {
					var sys = sysList.sysIdList[i].SYSID;

					if (sysList.sysIdList[i].SYSTYPE === "DB") {
						var hanaDB = {
							"sysId": sys
						};

						dbSysArr.push(hanaDB);

					} else if (sysList.sysIdList[i].SYSTYPE === "Application") {
						var application = {
							"sysId": sys
						};
						AppSysArr.push(application);
					}

				}
				dbSys = {
					"data": dbSysArr
				};
				AppSys = {
					"data": AppSysArr
				};

				that.getView().getModel("sysListModel").setProperty("/DBSystems", dbSys);
				that.getView().getModel("sysListModel").setProperty("/APPSystems", AppSys);

			}

		},

		onPressWorkPorcess: function (oevent) {
			var navCon = oevent.getSource().getParent().getParent();
			navCon.back();
			that.getView().getModel("sysListModel").setProperty("/visible", true);

		},

		loadWorkProcess: function (systm) {

			sap.ui.core.BusyIndicator.show();
			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getWorkProcessorUtilizationBySystem?" + "systems=" +
				systm + "&process=WORK_PROCESS")

			.done(function (data) {
					var odata = data.body;

					var oJsonWpModel = new sap.ui.model.json.JSONModel();
					oJsonWpModel.setData(odata);
					that.getView().setModel(oJsonWpModel, "workprocessModel");
					that.getView().getModel("workprocessModel").setProperty("/", odata);

				})
				.fail(function (jqXHR, textStatus) {
					sap.ui.core.BusyIndicator.hide();
					that.errorMessage();
				})
				.always(function () {
					sap.ui.core.BusyIndicator.hide();
				});
		},

		onAfterRendering: function () {

		},

		onExit: function () {

		},

		onListItemPressApp: function (oEvent) {
			that.selectedSys = oEvent.getParameters().listItem.getTitle();
			that.getView().getModel("sysListModel").setProperty("/Selectedsystem", that.selectedSys);
			that.loadWorkProcess(that.selectedSys);

		},

		getSplitAppObjApp: function () {
			var result = this.byId("SplitAppDemoApp");
			if (!result) {
				Log.info("SplitApp object can't be found");
			}
			return result;
		},
		_createViewInstance: function (sView, data) {

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

		getSelectedKey: function (evt) {
			if (evt) {
				this.selectedIconBar = evt.getParameters("key");
				console.log("getSelectedKey:::::", this.selectedIconBar);
			}

		}
	});

});