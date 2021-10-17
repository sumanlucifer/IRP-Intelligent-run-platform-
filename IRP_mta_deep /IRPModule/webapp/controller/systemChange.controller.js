sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"ey/irp/IRPModule/formatter/formatter",
	"sap/base/Log",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, formatter, Log, MessageToast) {
	"use strict";
	var that;
	return BaseController.extend("ey.irp.IRPModule.controller.systemChange", {
		formatter: formatter,
		onInit: function () {
			that = this;

			this.getView().byId("idVbox4").setProperty("visible", false);

			this.getView().addEventDelegate({
				onBeforeShow: function (evt) {

					var appSysList = that.getView().byId("listIDApp").getItems()[0];
					if (appSysList !== undefined) {

						var firstItemapp = that.getView().byId("listIDApp").getItems()[0];
						that.getView().byId("listIDApp").setSelectedItem(firstItemapp, true);

						this.sytemzz = that.getView().byId("listIDApp").getItems()[0].getTitle();

						that.loadCompModel(this.sytemzz);
						that.loadNameSModel(this.sytemzz);
						that.getView().getModel("sysListModel").setProperty("/Selectedsystem", this.sytemzz);

					} else {
						that.systemConfigData();
						that.getView().getModel("sysListModel").setProperty("/Selectedsystem", systems);
						that.loadCompModel(systems);
						that.loadNameSModel(systems);

					}
					// page1 is about to be shown; act accordingly - if required you can read event information from the evt object

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

		onItemSelect: function (oEvent) {

			var item = oEvent.getParameter('item');
			this.byId("pageContainer").to(this.getView().createId(item.getKey()));
		},

		onPressSysChangePorcess: function (oevent) {
			var navCon = oevent.getSource().getParent().getParent();
			navCon.back();
			that.getView().getModel("sysListModel").setProperty("/visible", true);

		},

		onBeforeRendering: function () {

		},

		onAfterRendering: function () {

		},

		onExit: function () {

		},

		loadCompModel: function (systm) {

			sap.ui.core.BusyIndicator.show();

			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getSystemChangeDLVUnitsSetBySystem?" + "systems=" + systm +
				"&process=DLV_UNITS")

			.done(function (data) {

					var odata = data.body;
					var memorydata = new JSONModel();
					that.getView().setModel(memorydata, "sysCompModel");
					that.getView().getModel("sysCompModel").setProperty("/", odata);

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
		loadNameSModel: function (systm) {

			sap.ui.core.BusyIndicator.show();
			// jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getSystemChangeNamespacesSetBySystem")
			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getSystemChangeNamespacesSetBySystem?" + "systems=" + systm +
					"&process=SYS_CHG_NAMESPACES")
				.done(function (data) {
					var odata = data.body;
					var memorydata = new JSONModel();
					that.getView().setModel(memorydata, "sysNameModel");
					that.getView().getModel("sysNameModel").setProperty("/", odata);

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

		onPress3: function () {
			this.getView().byId("idVbox3").setProperty("visible", true);
			this.getView().byId("idVbox4").setProperty("visible", false);

		},
		onPress4: function () {
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", true);

		},

		onListItemPress: function (oEvent) {
			that.selectedSys = oEvent.getParameters().listItem.getTitle();
			that.getView().getModel("sysListModel").setProperty("/Selectedsystem", that.selectedSys);
			that.loadCompModel(that.selectedSys);
			that.loadNameSModel(that.selectedSys);
		},

		getSplitAppObj: function () {
			var result = this.byId("SplitAppDemo");
			if (!result) {
				Log.info("SplitApp object can't be found");
			}
			return result;
		},

	});

});