sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"ey/irp/IRPModule/formatter/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/base/Log",
	"sap/ui/core/Fragment"

], function (BaseController, JSONModel, formatter, Filter, FilterOperator, MessageToast, Log, Fragment) {
	"use strict";
	var that;

	return BaseController.extend("ey.irp.IRPModule.controller.log_Traces", {
		formatter: formatter,

		onInit: function () {

			that = this;
			that.userSelection = "";
			that.searchValue = "";
			that.userName = "";
			that.client = "";
			var Btn = this.getView().byId("previous");
			Btn.setEnabled(false);
			that.pagesize = 50;
			that.top = 50;
			that.skip = 0;
			var items = [

				{
					key: "All",
					text: "All"
				},

				{
					key: "User Name",
					text: "User Name"
				}, {
					key: "Client",
					text: "Client"
				}

			];

			that.logTraceModel = new JSONModel({
				fromminDate: new Date(2019, 8, 15),
				frommaxDate: new Date(),
				TominDate: new Date(2019, 8, 15),
				TomaxDate: new Date()

			});

			that.getView().setModel(that.logTraceModel, "logTraceModel");
			that.logTraceModel.setProperty("/workProcesstype", items);

			this.getView().addEventDelegate({
				onBeforeShow: function (evt) {
					that.totalPages = 1;
					that.currentPage = 1;

					that.getView().byId("idComboType").setSelectedKey("All");
					that.getView().byId("idSearch").setEnabled(false);

					var appSysList = that.getView().byId("listIDApp").getItems()[0];
					if (appSysList !== undefined) {

						var firstItemapp = that.getView().byId("listIDApp").getItems()[0];
						that.getView().byId("listIDApp").setSelectedItem(firstItemapp, true);

						this.sytemzz = that.getView().byId("listIDApp").getItems()[0].getTitle();
						that.getView().getModel("sysListModel").setProperty("/Selectedsystem", this.sytemzz);

						that.loadlogTrace(this.sytemzz);

					} else {
						that.systemConfigData();
						that.getView().getModel("sysListModel").setProperty("/Selectedsystem", systems);
						that.loadlogTrace(systems);

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
		onNext: function () {
			that.skip = that.skip + that.top;
			that.top = that.pagesize;

			that.loadlogTrace(systems);
			var Btn = this.getView().byId("previous");
			Btn.setEnabled(true);
			that.currentPage = that.currentPage + 1;
			if (that.currentPage == that.totalPages) {
				this.getView().byId("next").setEnabled(false);

			}

		},

		onPrevious: function () {
			that.skip = that.skip - that.top;
			that.top = that.pagesize;

			that.loadlogTrace(systems);
			var Btn = this.getView().byId("next");
			Btn.setEnabled(true);
			that.currentPage = that.currentPage - 1;
			if (that.currentPage == 1) {
				this.getView().byId("previous").setEnabled(false);

			}
		},
		onPressLogTrace: function (oevent) {
			var navCon = oevent.getSource().getParent().getParent();
			navCon.back();
			that.getView().getModel("sysListModel").setProperty("/visible", true);
		},
		onlog_TracesMatched: function () {},

		loadlogTrace: function (systm) {

			sap.ui.core.BusyIndicator.show();
			var date = new Date().toLocaleDateString("pl-PL").split(".").reverse().join("-");

			if (!that.sdate) {
				that.sdate = date + "T00:00:00";
				that.edate = date + "T23:59:59";
			}

			if (that.userSelection == "User Name") {
				that.userName = that.searchValue;
			} else if (that.userSelection == "Client") {
				that.client = that.searchValue;
			} else {
				that.userName = "";
				that.client = "";
			}

			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getLogsAndTracesBySystem?" + "systems=" +
				systm + "&process=LOGS_TRACES" + "&startDate=" + that.sdate + "&endDate=" + that.edate +
				"&top=" + that.top + "&skip=" + that.skip + "&client=" + that.client + "&userName=" + that.userName

			)

			.done(function (data) {
					if (data.body.length !== 0) {
						that.disRecInfo = "";
						if (that.currentPage == 1) {
							that.disRecInfo = that.currentPage + "-" + data["body"][0]["d"]["results"].length + " of " + data["body"][0]["d"]["__count"] +
								" records.";
						} else if (data["body"].length > 0) {
							that.disRecInfo = (that.skip) + 1 + "-" + (data["body"][0]["d"]["results"].length + that.skip) + " of " +
								data["body"][0]["d"]["__count"] + " records.";

						}
						if (data["body"].length > 0) {
							that.totalPages = (((data["body"][0]["d"]["__count"]) % that.pagesize) == 0) ? ((data["body"][0]["d"]["__count"]) / that.pagesize) :
								Math.floor(((data["body"][0]["d"]["__count"]) / that.pagesize)) + 1;
						}

						that.getView().byId("next").setEnabled(true);

						if (that.currentPage == that.totalPages) {
							that.getView().byId("next").setEnabled(false);

						}

						that.getView().getModel("logTraceModel").setProperty("/logTraceTableData", data["body"][0] && data["body"][0]["d"]["results"]);
						that.getView().getModel("logTraceModel").setProperty("/disRecInfo", that.disRecInfo);
						that.getView().getModel("logTraceModel").setProperty("/currentPage", that.currentPage);
						that.getView().getModel("logTraceModel").setProperty("/totalPages", that.totalPages);

						sap.ui.core.BusyIndicator.hide();
					}
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

		searchuser: function (oevent) {

			var system = that.getView().getModel("sysListModel").getProperty("/Selectedsystem");
			that.searchValue = oevent.getParameters().query;

			that.loadlogTrace(system);
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
				that.loadlogTrace(systems);
			} else {
				that.getView().byId("idSearch").setEnabled(true);
			}
		},

		onListItemPress: function (oEvent) {
			var date = new Date().toLocaleDateString("pl-PL").split(".").reverse().join("-");
			that.sdate = date + "T00:00:00";
			that.edate = date + "T23:59:59";

			that.getView().byId("idComboType").setSelectedKey("All");
			that.getView().byId("idSearch").setValue(null);
			that.userSelection = "";

			that.selectedSys = oEvent.getParameters().listItem.getTitle();
			that.getView().getModel("sysListModel").setProperty("/Selectedsystem", that.selectedSys);
			that.loadlogTrace(that.selectedSys);

		},

		getSplitAppObj: function () {
			var result = this.byId("SplitAppDemo");
			if (!result) {
				Log.info("SplitApp object can't be found");
			}
			return result;
		},

		onPressFilterHana: function (oEvent) {
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
			var selectedSystm = that.getView().getModel("sysListModel").getProperty("/Selectedsystem");
			that.loadlogTrace(selectedSystm);
			sap.ui.getCore().byId("SD").setValue(null);
			sap.ui.getCore().byId("ED").setValue(null);
			this._oPopover.close();

		},
		handleCloseButton: function () {
			this._oPopover.close();
		}
	});

});