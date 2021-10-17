sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"ey/irp/IRPModule/formatter/formatter",
	"sap/base/Log",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment"

], function (BaseController, JSONModel, formatter, Log, MessageToast, Fragment) {
	"use strict";
	var that;
	return BaseController.extend("ey.irp.IRPModule.controller.systemAnalysis", {
		formatter: formatter,

		onInit: function () {
			that = this;
			that.userSelection = "";
			that.searchValue = "";
			that.userName = "";
			that.client = "";

			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);

			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idVbox8").setProperty("visible", false);
			this.getView().byId("idVbox9").setProperty("visible", false);

			var items = [

				{
					key: "All",
					text: "All"
				},

				{
					key: "Client",
					text: "Client"
				}, {
					key: "User Name",
					text: "User Name"
				}

			];

			that.logTraceModel = new JSONModel({
				fromminDate: new Date(2019, 8, 15),
				frommaxDate: new Date(),
				TominDate: new Date(2019, 8, 15),
				TomaxDate: new Date()

			});
			that.getView().setModel(that.logTraceModel, "logTraceModel");

			that.systemAnalysis = new JSONModel();
			that.getView().setModel(that.systemAnalysis, "systemAnalysis");
			that.systemAnalysis.setProperty("/workProcesstype", items);

			this.getView().addEventDelegate({
				onBeforeShow: function (evt) {
					var firstItem = that.getView().byId("listID").getItems()[0];
					that.getView().byId("listID").setSelectedItem(firstItem, true);

					var hanaSystemList = that.getView().byId("listID").getItems()[0];
					if (hanaSystemList !== undefined) {

						this.sytemz = that.getView().byId("listID").getItems()[0].getTitle();
						that.getView().getModel("sysListModel").setProperty("/SelectedsystemApp", this.sytemz);
						that.loadData(this.sytemz);
						that.loadMLicense(this.sytemz);
						that.loadBackupCatalog(this.sytemz);
						that.loadBackupProgress(this.sytemz);

					} else {
						that.systemConfigData();
						that.getView().getModel("sysListModel").setProperty("/SelectedsystemApp", systems);
						that.loadData(systems);
						that.loadMLicense(systems);
						that.loadBackupCatalog(systems);
						that.loadBackupProgress(systems);
					}
					/* application id listIDApp*/
					/*application */

					var appSysList = that.getView().byId("listIDApp").getItems()[0];
					if (appSysList !== undefined) {

						var firstItemapp = that.getView().byId("listIDApp").getItems()[0];
						that.getView().byId("listIDApp").setSelectedItem(firstItemapp, true);

						this.sytemzz = that.getView().byId("listIDApp").getItems()[0].getTitle();

						that.loadAppData(this.sytemzz);
						that.loadsysLicense(this.sytemzz);
						that.loadsysEnquene(this.sytemzz);
						that.loadsysChange(this.sytemzz);
						that.loadsysUpdate(this.sytemzz);
						that.getView().getModel("sysListModel").setProperty("/SelectedsystemApp", this.sytemzz);

					} else {
						that.systemConfigData();
						that.getView().getModel("sysListModel").setProperty("/SelectedsystemApp", systems);
						that.loadAppData(systems);
						that.loadsysLicense(systems);
						that.loadsysEnquene(systems);
						that.loadsysChange(systems);
						that.loadsysUpdate(systems);
					}

					that.getView().byId("idComboTypes").setSelectedKey("All");
					that.getView().byId("idSearch").setEnabled(false);

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
		onPressSysAnalysis: function (oevent) {
			var navCon = oevent.getSource().getParent().getParent();
			navCon.back();
			that.getView().getModel("sysListModel").setProperty("/visible", true);
		},
		loadData: function (systm) {
			sap.ui.core.BusyIndicator.show();
			var url = "https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getHANADBCPUAndMemoryServicesStatusBySystem?" + "systems=" +
				systm + "&process=APP_SERVER";

			$.ajax({
				url: url,
				type: "GET",
				crossDomain: true,
				dataType: "application/json",
				async: true,

				error: function (data) {
					var serNowData = JSON.parse(data.responseText);
					var odata = serNowData.body;

					var memorydata = new JSONModel();
					that.getView().setModel(memorydata, "sysAppData");
					that.getView().getModel("sysAppData").setProperty("/", odata);

					sap.ui.core.BusyIndicator.hide();
				},

				success: function (odata) {
					sap.ui.core.BusyIndicator.hide();
					// that.errorMessage();
				}
			});

		},
		/* application system load data */
		loadAppData: function (systm) {

			sap.ui.core.BusyIndicator.show();
			var url = "https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getSAPSystemStatusBySystem?" + "systems=" +
				systm + "&process=APP_SERVER";

			$.ajax({
				url: url,
				type: "GET",
				crossDomain: true,
				dataType: "application/json",
				async: true,

				error: function (data) {
					// alert("success ", data);

					var serNowData = JSON.parse(data.responseText);
					var odata = serNowData.body;

					var memorydata = new JSONModel();
					that.getView().setModel(memorydata, "sapAppList");
					that.getView().getModel("sapAppList").setProperty("/", odata);

					sap.ui.core.BusyIndicator.hide();
				},
				success: function (odata) {
					// that.errorMessage();
					sap.ui.core.BusyIndicator.hide();

				}
			});

		},
		/* hana back progress */
		loadBackupProgress: function (systm) {

			sap.ui.core.BusyIndicator.show();

			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getBackupProgressBySystem?" + "systems=" +
					systm + "&process=BACKUP PROGRESS")
				.done(function (oData1) {

					var odata = oData1.data;

					var memorydata = new JSONModel();
					that.getView().setModel(memorydata, "backupProgressgModel");
					that.getView().getModel("backupProgressgModel").setProperty("/", odata);

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
		/*hana license data */
		loadMLicense: function (systm) {

			sap.ui.core.BusyIndicator.show();

			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getMLicenseBySystem?" + "systems=" +
				systm + "&process=LICENSE")

			.done(function (oData) {

					var odata = oData.body;

					var memorydata = new JSONModel();
					that.getView().setModel(memorydata, "sysMModel");
					that.getView().getModel("sysMModel").setProperty("/", odata);

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
		/* hana backup catalog */
		loadBackupCatalog: function (systm) {

			sap.ui.core.BusyIndicator.show();

			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getBackupCatalogBySystem?" + "systems=" +
				systm + "&process=BACKUP_CATALOG")

			.done(function (oData) {

					var odata = oData.body;

					var memorydata = new JSONModel();
					that.getView().setModel(memorydata, "backupCatalogModel");
					that.getView().getModel("backupCatalogModel").setProperty("/", odata);

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

		onItemSelect: function (oEvent) {

			var item = oEvent.getParameter('item');
			this.byId("pageContainer").to(this.getView().createId(item.getKey()));
		},

		onBeforeRendering: function () {

		},

		onAfterRendering: function () {

		},
		loadsysUpdate: function (systm) {

			sap.ui.core.BusyIndicator.show();

			var date = new Date().toLocaleDateString("pl-PL").split(".").reverse().join("-");

			if (!that.sdate) {
				that.sdate = date + "T00:00:00";
				that.edate = date + "T23:59:59";
			}

			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getUpdateRequestBySystem?" + "systems=" +
				systm + "&process=UPDATE_REQUEST" + "&startDate=" + that.sdate + "&endDate=" + that.edate)

			.done(function (data) {

					var odata = data.body;

					that.getView().getModel("logTraceModel").setProperty("/", odata);

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

		loadsysLicense: function (systm) {

			sap.ui.core.BusyIndicator.show();

			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getSLicenseBySystem?" + "systems=" +
				systm + "&process=LICENSE")

			.done(function (data) {
					var odata = data.body;

					var memorydata = new JSONModel();
					that.getView().setModel(memorydata, "sysLicenseTableData");
					that.getView().getModel("sysLicenseTableData").setProperty("/", odata);
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

		loadsysEnquene: function (systm) {

			/*load enqune request*/
			sap.ui.core.BusyIndicator.show();
			if (that.userSelection == "User Name") {
				that.userName = that.searchValue;
			} else if (that.userSelection == "Client") {
				that.client = that.searchValue;
			} else {
				that.userName = "";
				that.client = "";
			}

			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getEnqueueRequestBySystem?" + "systems=" +
				systm + "&process=ENQUEUE" + "&client=" + that.client + "&userName=" + that.userName)

			// jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getEnqueueRequest")getEnqueueRequest?client=100&userName=DDIC

			.done(function (data) {
					// var odata = data.body.d.results;
					// that.sysEnqueneModel = new JSONModel();
					// that.getView().setModel(that.sysEnqueneModel, "sysEnqueneModel");
					// that.getView().getModel("sysEnqueneModel").setProperty("/sysEnqueneTableData", odata);

					var odata = data.body;

					var memorydata = new JSONModel();
					that.getView().setModel(memorydata, "sysEnqueneModel");
					that.getView().getModel("sysEnqueneModel").setProperty("/", odata);

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
		loadsysChange: function (systm) {

			sap.ui.core.BusyIndicator.show();

			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getSystemChangeBySystem?" + "systems=" +
				systm + "&process=SYSTEM_CHANGE" + "&client=" + that.client + "&userName=" + that.userName)

			// jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getEnqueueRequest")getEnqueueRequest?client=100&userName=DDIC

			.done(function (data) {
					// var odata = data.body.d.results;
					// that.sysEnqueneModel = new JSONModel();
					// that.getView().setModel(that.sysEnqueneModel, "sysEnqueneModel");
					// that.getView().getModel("sysEnqueneModel").setProperty("/sysEnqueneTableData", odata);

					var odata = data.body;

					var memorydata = new JSONModel();
					that.getView().setModel(memorydata, "sysChangeModel");
					that.getView().getModel("sysChangeModel").setProperty("/", odata);

					sap.ui.core.BusyIndicator.hide();
				})
				.fail(function (jqXHR, textStatus) {
					sap.ui.core.BusyIndicator.hide();
					// that.errorMessage();
				})
				.always(function () {
					sap.ui.core.BusyIndicator.hide();

				});
		},

		onExit: function () {

		},

		handleNav: function (evt) {
			var navCon = this.byId("navCon");
			var target = evt.getSource().data("target");
			if (target) {
				var animation = this.byId("animationSelect").getSelectedKey();
				navCon.to(this.byId(target), animation);
			} else {
				navCon.back();
			}

		},

		onListItemPress: function (oEvent) {

			that.selectedSys = oEvent.getParameters().listItem.getTitle();
			that.loadData(that.selectedSys);
			this.loadMLicense(that.selectedSys);
			this.loadBackupCatalog(that.selectedSys);
			this.loadBackupProgress(that.selectedSys);

		},

		getSplitAppObj: function () {
			var result = this.byId("SplitAppDemo");
			if (!result) {
				Log.info("SplitApp object can't be found");
			}
			return result;
		},

		onListItemPressApp: function (oEvent) {

			var date = new Date().toLocaleDateString("pl-PL").split(".").reverse().join("-");
			that.sdate = date + "T00:00:00";
			that.edate = date + "T23:59:59";
			that.getView().byId("idComboTypes").setSelectedKey("All");
			that.getView().byId("idSearch").setValue(null);
			that.userSelection = "";
			that.selectedSys = oEvent.getParameters().listItem.getTitle();
			that.getView().getModel("sysListModel").setProperty("/SelectedsystemApp", that.selectedSys);
			this.loadAppData(that.selectedSys);
			this.loadsysLicense(that.selectedSys);
			this.loadsysEnquene(that.selectedSys);
			this.loadsysChange(that.selectedSys);
			this.loadsysUpdate(that.selectedSys);
		},

		getSplitAppObjApp: function () {
			var result = this.byId("SplitAppDemoApp");
			if (!result) {
				Log.info("SplitApp object can't be found");
			}
			return result;
		},

		getselectedKey: function (evt) {
			var oevent = evt.getParameter("item").getText();
			if (oevent == "Hana DB") {
				this.getView().byId("idSys").setSelected(true);
				that.selectSysHana();

			} else if (oevent == "Application") {
				this.getView().byId("idSysA").setSelected(true);
				that.selectSysHanaA();
			}
		},

		selectSysHana: function () {
			this.getView().byId("idVbox1").setProperty("visible", true);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox6").setProperty("visible", false);

			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idVbox8").setProperty("visible", false);
			this.getView().byId("idVbox9").setProperty("visible", false);
			/*table*/
			this.getView().byId("idButton2").setProperty("enabled", false);
			that.getView().byId("idSearch").setEnabled(false);

		},
		selectLic: function () {
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", true);
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idVbox8").setProperty("visible", false);
			this.getView().byId("idVbox9").setProperty("visible", false);

			this.getView().byId("idButton2").setProperty("enabled", false);
			that.getView().byId("idSearch").setEnabled(false);
		},
		selectBCat: function () {
			this.getView().byId("idVbox3").setProperty("visible", true);
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox8").setProperty("visible", false);
			this.getView().byId("idVbox9").setProperty("visible", false);

			this.getView().byId("idButton2").setProperty("enabled", false);
			that.getView().byId("idSearch").setEnabled(false);
		},
		selectBPro: function () {
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", true);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox8").setProperty("visible", false);
			this.getView().byId("idVbox9").setProperty("visible", false);

			this.getView().byId("idButton2").setProperty("enabled", false);
			that.getView().byId("idSearch").setEnabled(false);

		},
		/*application apis */
		selectSysHanaA: function () {
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", true);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idVbox8").setProperty("visible", false);
			this.getView().byId("idVbox9").setProperty("visible", false);

			this.getView().byId("idButton3").setProperty("enabled", false);
			/*combox visible property*/
			this.getView().byId("idVBoxC").setProperty("visible", false);
			this.getView().byId("idVBoxF").setProperty("visible", false);
			that.getView().byId("idSearch").setEnabled(false);

		},
		selectLicA: function () {
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox6").setProperty("visible", true);

			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idVbox8").setProperty("visible", false);
			this.getView().byId("idVbox9").setProperty("visible", false);

			this.getView().byId("idButton3").setProperty("enabled", false);
			/*combox visible property*/
			this.getView().byId("idVBoxC").setProperty("visible", false);
			this.getView().byId("idVBoxF").setProperty("visible", false);
			that.getView().byId("idSearch").setEnabled(false);

		},

		enqueneRequest: function () {
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", true);
			this.getView().byId("idVbox8").setProperty("visible", false);
			this.getView().byId("idVbox9").setProperty("visible", false);
			this.getView().byId("idButton3").setProperty("enabled", false);
			/*combox visible property*/
			this.getView().byId("idVBoxC").setProperty("visible", true);
			this.getView().byId("idVBoxF").setProperty("visible", false);

		},
		SysChange: function () {
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idVbox8").setProperty("visible", true);
			this.getView().byId("idVbox9").setProperty("visible", false);
			this.getView().byId("idButton3").setProperty("enabled", false);

			/*combox visible property*/
			this.getView().byId("idVBoxC").setProperty("visible", false);
			this.getView().byId("idVBoxF").setProperty("visible", false);
			that.getView().byId("idSearch").setEnabled(false);
		},
		updateStatus: function () {
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idVbox8").setProperty("visible", false);
			this.getView().byId("idVbox9").setProperty("visible", true);
			this.getView().byId("idButton3").setProperty("enabled", false);
			/*combox visible property*/
			this.getView().byId("idVBoxC").setProperty("visible", false);
			this.getView().byId("idVBoxF").setProperty("visible", true);
			that.getView().byId("idSearch").setEnabled(false);
		},
		/* hana button table view*/

		onPress2: function () {
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", true);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idVbox8").setProperty("visible", false);
			this.getView().byId("idVbox9").setProperty("visible", false);
			this.getView().byId("idButton2").setProperty("enabled", false);

		},
		/* application button table view*/
		onPress3: function () {
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox3").setProperty("visible", true);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", true);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idVbox8").setProperty("visible", false);
			this.getView().byId("idVbox9").setProperty("visible", false);
			this.getView().byId("idButton2").setProperty("enabled", false);
		},

		searchuser: function (oevent) {
			var system = that.getView().getModel("sysListModel").getProperty("/SelectedsystemApp");
			that.searchValue = oevent.getParameters().query;

			that.loadsysEnquene(system);

		},
		onchange: function (oEvent) {

			that.userName = "";
			that.client = "";
			var value = oEvent.getParameters().newValue;
			if (value) {
				that.userSelection = value;
				that.getView().byId("idSearch").setValue(null);

			}
			if (value == "All") {
				that.getView().byId("idSearch").setEnabled(false);
				that.loadsysEnquene(systems);
			} else {
				that.getView().byId("idSearch").setEnabled(true);
			}
		},

		onPressFilterApp: function (oEvent) {
			var oButton = oEvent.getSource();

			// create popover
			if (!this._oPopover) {
				Fragment.load({
					name: "ey.irp.IRPModule.fragment.Datep_opover",
					controller: this
				}).then(function (pPopover) {
					this._oPopover = pPopover;
					this.getView().addDependent(this._oPopover);
					this._oPopover.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
			}

		},

		handleChange: function (oevent) {
			var startDate = oevent.getParameters().value;
			if (startDate) {
				var sdate = new Date(startDate).toLocaleDateString("pl-PL").split(".").reverse().join("-");

				that.sdate = sdate + "T00:00:00";

			}
			that.getView().getModel("logTraceModel");
			that.logTraceModel.setProperty("/TominDate", new Date(startDate));
		},

		handleChange1: function (oevent) {

			// var startDate = this.getView().byId("DPS").getValue();
			var endDate = oevent.getParameters().value;
			if (endDate) {
				var edate = new Date(endDate).toLocaleDateString("pl-PL").split(".").reverse().join("-");
				that.edate = edate + "T23:59:59";

			}

		},

		handleApplyButton: function (oevent) {

			var selectedSystm = that.getView().getModel("sysListModel").getProperty("/SelectedsystemApp");

			that.loadsysUpdate(selectedSystm);
			sap.ui.getCore().byId("SD").setValue(null);
			sap.ui.getCore().byId("ED").setValue(null);
			this._oPopover.close();

		},
		handleCloseButton: function () {
			this._oPopover.close();
		}

	});

});