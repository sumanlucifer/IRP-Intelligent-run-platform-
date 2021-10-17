sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"ey/irp/IRPModule/formatter/formatter",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/mvc/XMLView",
	"sap/base/Log",
], function (BaseController, JSONModel, formatter, MessageToast, DateFormat, XMLView, Log) {
	"use strict";
	var that;
	return BaseController.extend("ey.irp.IRPModule.controller.activeUserSession", {
		formatter: formatter,

		onInit: function () {

			that = this;

			// this.getView().byId("idVbox4").setProperty("visible", false);
			// this.getView().byId("idVbox1").setProperty("visible", true);

			this.getView().addEventDelegate({
				onBeforeShow: function (evt) {

					// that.getView().byId("idVbox3").setProperty("visible", true);
					var firstItem = that.getView().byId("listIDH").getItems()[0];
					that.getView().byId("listIDH").setSelectedItem(firstItem, true);
					var hanaSystemList = that.getView().byId("listIDH").getItems()[0];
					if (hanaSystemList !== undefined) {

						this.sytemz = that.getView().byId("listIDH").getItems()[0].getTitle();
						that.loaduserListHanaDB(this.sytemz);
						that.getView().getModel("sysListModel").setProperty("/Selectedsystem", this.sytemz);

					} else {
						that.systemConfigData();
						that.getView().getModel("sysListModel").setProperty("/Selectedsystem", systems);
						that.loaduserListHanaDB(systems);

					}

					var appSysList = that.getView().byId("listIDApp").getItems()[0];
					if (appSysList !== undefined) {

						var firstItemapp = that.getView().byId("listIDApp").getItems()[0];
						that.getView().byId("listIDApp").setSelectedItem(firstItemapp, true);

						this.sytemzz = that.getView().byId("listIDApp").getItems()[0].getTitle();

						that.loaduserSession(this.sytemzz);
						that.loaduserList(this.sytemzz);

					} else {
						that.systemConfigData();
						that.loaduserList(systems);
						that.loaduserSession(systems);

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
		onPressactiveUS: function (oevent) {
			var navCon = oevent.getSource().getParent().getParent();
			navCon.back();
			that.getView().getModel("sysListModel").setProperty("/visible", true);

		},

		loaduserSession: function (systm) {

			sap.ui.core.BusyIndicator.show();

			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getUserSessionsBySystem?" + "systems=" + systm +
				"&process=USER_SESSIONS")

			.done(function (data) {

					var odata = data.body;

					var memorydata = new JSONModel();
					that.getView().setModel(memorydata, "userSessionModel");
					that.getView().getModel("userSessionModel").setProperty("/", odata);

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
		loaduserList: function (systm) {

			sap.ui.core.BusyIndicator.show();

			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getUserListBySystem?" + "systems=" + systm +
				"&process=USERS")

			.done(function (data) {

					var serNowData = data.body;
					var oModelSerNow = new JSONModel(serNowData);
					that.getView().setModel(oModelSerNow, "activeUSuserDetail");
					that.getView().getModel("activeUSuserDetail").setProperty("/", serNowData);

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

		loaduserListHanaDB: function (systm) {

			sap.ui.core.BusyIndicator.show();
			//getDBUserListBySystem
			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getDBUserListBySystem?" + "systems=" + systm +
				"&process=USERS")

			.done(function (data) {
					var odata = data.body;
					var oModelSerNow = new JSONModel(odata);
					that.getView().setModel(oModelSerNow, "activeHanaUSuserDetail");
					that.getView().getModel("activeHanaUSuserDetail").setProperty("/", odata);

					// var serNowData = data.body;
					// var oModelSerNow = new JSONModel(serNowData);
					// that.getView().setModel(oModelSerNow, "activeUSuserDetail");
					// that.getView().getModel("activeUSuserDetail").setProperty("/", serNowData);

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

		handleLinkPressHana: function (oEvent) {
			var oItem = oEvent.getSource().getBindingContext("activeHanaUSuserDetail");
			var ouserNameP = oItem.getProperty().USER_NAME;

			//////////////////////////////////////////////////////////
			this._createViewInstance("user_Privilege", ouserNameP);

		},

		handleLinkPress: function (oEvent) {
			var oItem = oEvent.getSource().getBindingContext("activeUSuserDetail");
			var ouserName = oItem.getProperty().USER;

			//////////////////////////////////////////////////////////
			this._createViewInstance("userAuthorization", ouserName);

		},

		onPress3: function () {
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox3").setProperty("visible", true);
			this.getView().byId("idVbox4").setProperty("visible", false);

		},
		onPress4: function () {
			this.getView().byId("idVbox1").setProperty("visible", true);
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", true);

		},

		onBeforeRendering: function () {

		},

		onAfterRendering: function () {

		},

		onExit: function () {

		},

		onItemSelect: function (oEvent) {

			var item = oEvent.getParameter('item');
			this.byId("pageContainer").to(this.getView().createId(item.getKey()));
		},

		onListItemPress: function (oEvent) {
			that.selectedSys = oEvent.getParameters().listItem.getTitle();
			that.getView().getModel("sysListModel").setProperty("/Selectedsystem", that.selectedSys);
			that.loaduserListHanaDB(that.selectedSys);
		},

		getSplitAppObj: function () {
			var result = this.byId("SplitAppDemo");
			if (!result) {
				Log.info("SplitApp object can't be found");
			}
			return result;
		},

		onListItemPressA: function (oEvent) {
			that.selectedSys = oEvent.getParameters().listItem.getTitle();
			that.loaduserSession(that.selectedSys);
			that.loaduserList(that.selectedSys);
		},

		getSplitAppObjA: function () {
			var result = this.byId("SplitAppDemoA");
			if (!result) {
				Log.info("SplitApp object can't be found");
			}
			return result;
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

		},

		getselectedKey: function (evt) {
			var oevent = evt.getParameter("item").getText();
			if (oevent == "Hana DB") {
				this.getView().byId("idVbox1").setProperty("visible", true);

			} else if (oevent == "Application") {
				this.getView().byId("idVbox3").setProperty("visible", true);

			}
		},

	});

});