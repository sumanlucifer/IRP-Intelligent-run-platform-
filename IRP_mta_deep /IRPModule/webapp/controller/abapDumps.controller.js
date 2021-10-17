sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"ey/irp/IRPModule/formatter/formatter",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/mvc/XMLView",
	"sap/base/Log"

], function (BaseController, JSONModel, formatter, MessageToast, DateFormat, XMLView, Log) {
	"use strict";
	var that;
	return BaseController.extend("ey.irp.IRPModule.controller.abapDumps", {
		formatter: formatter,

		onInit: function () {
			that = this;

			this.getView().byId("idVbox2").setProperty("visible", false);

			that.abapDumpsModel = new JSONModel();
			that.getView().setModel(that.abapDumpsModel, "abapDumpsModel");

			this.getView().addEventDelegate({
				onBeforeShow: function (evt) {

					var appSysList = that.getView().byId("listIDApp").getItems()[0];
					if (appSysList !== undefined) {

						var firstItemapp = that.getView().byId("listIDApp").getItems()[0];
						that.getView().byId("listIDApp").setSelectedItem(firstItemapp, true);

						this.sytemzz = that.getView().byId("listIDApp").getItems()[0].getTitle();

						that.loadabapdumps(this.sytemzz);
						that.getView().getModel("sysListModel").setProperty("/Selectedsystem", this.sytemzz);

					} else {
						that.systemConfigData();
						that.getView().getModel("sysListModel").setProperty("/Selectedsystem", systems);
						that.loadabapdumps(systems);

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
		onabapDumpsMatched: function () {

		},
		onPressabapdumps: function (oevent) {
			var navCon = oevent.getSource().getParent().getParent();

			navCon.back();
			that.getView().getModel("sysListModel").setProperty("/visible", true);

		},
		loadabapdumps: function (systm) {
			sap.ui.core.BusyIndicator.show();
			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getABAPDumpBySystem?" + "systems=" + systm +
					"&process=ABAP_DUMPS")
				.done(function (data) {

					var odata = data.body;

					var memorydata = new sap.ui.model.json.JSONModel();
					memorydata.setData(odata);

					that.getView().setModel(memorydata, "abapDumpModel");
					that.getView().getModel("abapDumpModel").setProperty("/", odata);

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

			this.getView().byId("idButton2").removeStyleClass("buttonhoverg");

			this.getView().byId("idButton1").addStyleClass("buttonhoverg");

			this.getView().byId("idButton2").addStyleClass("buttonhoverT");
			this.getView().byId("idButton1").removeStyleClass("buttonhoverT");

		},
		onPress2: function () {
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", true);

			this.getView().byId("idButton2").removeStyleClass("buttonhoverT");
			this.getView().byId("idButton2").addStyleClass("buttonhoverg");

			this.getView().byId("idButton1").removeStyleClass("buttonhoverg");
			this.getView().byId("idButton1").addStyleClass("buttonhoverT");

		},

		onBeforeRendering: function () {

		},

		onAfterRendering: function () {

			var vizchart = this.getView().byId("idLineChartAbap");
			vizchart.setVizProperties({
				plotArea: {
					// colorPalette: d3.scale.category20().range(),
					colorPalette: ["#FF0000"],
					dataLabel: {
						showTotal: true,
						style: {
							color: "#BCBCBC"
						}

					},

					gridline: {
						size: 0.1,
						color: "#BCBCBC"
					},

					dataPoint: {
						stroke: {
							visible: "false"
						}
					},
					referenceLine: {
						line: {
							valueAxis: [{
								value: 50,
								size: 0.3,
								visible: false,
								label: {
									text: "Average Revenue",
									visible: true,
									background: "#161C1F"
								}
							}]
						},

						defaultStyle: {
							color: "#BCBCBC",
							size: 0.1,
							label: {
								color: "#BCBCBC"
							}
						}
					},
				},

				title: {
					layout: {
						maxHeight: "0px"
					},
					style: {
						color: "#FFFFFF",
						fontSize: "12px"
					},
				},

				categoryAxis: {
					labelRenderer: function (e) {
						e.styles.color = "#BCBCBC";

					},
					title: {
						style: {
							color: "#FFE600"
						}
					},

					hoverShadow: {
						color: "#161C1F"
					},
					mouseDownShadow: {
						color: "#161C1F"
					},
					axisLine: {
						size: 0.1,

					}

				},

				valueAxis: {

					label: {
						style: {
							color: "#BCBCBC"
						}
					},
					title: {
						style: {
							color: "#FFFFFF"
						}
					}

				},
				tooltip: {
					visible: false
				},
				legend: {
					isScrollable: true,
					visible: true,
					showFullLabel: true,
					hoverSelectedShadow: {
						color: "#161C1F"
					},

					hoverShadow: {
						color: "#161C1F"
					},

					label: {
						style: {
							color: "#BCBCBC"
						}
					},
					marker: {
						size: "0px"
					}
					// visible: "true"
				},
				legendGroup: {
					layout: {
						position: "bottom"

					}
				},
			});

			// that.loadabapdumps();
		},

		onExit: function () {

		},

		onListItemPressApp: function (oEvent) {

			that.selectedSys = oEvent.getParameters().listItem.getTitle();
			that.getView().getModel("sysListModel").setProperty("/Selectedsystem", that.selectedSys);
			that.loadabapdumps(that.selectedSys);

		},

		getSplitAppObjApp: function () {
			var result = this.byId("SplitAppDemoApp");
			if (!result) {
				Log.info("SplitApp object can't be found");
			}
			return result;
		}

	});
});