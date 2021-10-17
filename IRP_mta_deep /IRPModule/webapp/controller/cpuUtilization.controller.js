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
	return BaseController.extend("ey.irp.IRPModule.controller.cpuUtilization", {
		formatter: formatter,

		onInit: function () {

			that = this;
			that.filterParam = "DAY";

			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);

			var items = [{
					key: "Day",
					text: "Day"
				}, {
					key: "5 Minutes",
					text: "5 Minutes"
				}, {
					key: "10 Minutes",
					text: "10 Minutes"
				}, {
					key: "15 Minutes",
					text: "15 Minutes"
				}, {
					key: "30 Minutes",
					text: "30 Minutes"
				}, {
					key: "1 Hour",
					text: "1 Hour"
				}

			];
			that.cpuUtilization = new JSONModel();
			that.getView().setModel(that.cpuUtilization, "cpuUtilization");
			that.cpuUtilization.setProperty("/workProcesstype", items);

			this.getView().addEventDelegate({
				onBeforeShow: function (evt) {

					var firstItem = that.getView().byId("listID").getItems()[0];
					that.getView().byId("listID").setSelectedItem(firstItem, true);

					var hanaSystemList = that.getView().byId("listID").getItems()[0];
					if (hanaSystemList !== undefined) {

						this.sytemz = that.getView().byId("listID").getItems()[0].getTitle();
						that.loadChartData(this.sytemz);
						that.getView().getModel("sysListModel").setProperty("/Selectedsystem", this.sytemz);

						/* application id listIDApp*/

					} else {
						that.systemConfigData();
						that.getView().getModel("sysListModel").setProperty("/Selectedsystem", systems);
						that.loadChartData(systems);

					}

					var appSysList = that.getView().byId("listIDApp").getItems()[0];
					if (appSysList !== undefined) {

						var firstItemapp = that.getView().byId("listIDApp").getItems()[0];
						that.getView().byId("listIDApp").setSelectedItem(firstItemapp, true);

						this.sytemzz = that.getView().byId("listIDApp").getItems()[0].getTitle();

						that.loadcurrentcpuU(this.sytemzz);

					} else {
						that.systemConfigData();
						that.loadcurrentcpuU(systems);

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

		oncpuUtilizationMatched: function () {

		},

		onPresscpuUtilization: function (oevent) {
			var navCon = oevent.getSource().getParent().getParent();
			navCon.back();
			that.getView().getModel("sysListModel").setProperty("/visible", true);
		},

		onPress1: function () {

			this.getView().byId("idVbox1").setProperty("visible", true);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox3").setProperty("visible", true);
			this.getView().byId("idVbox4").setProperty("visible", false);

			this.getView().byId("idButton2").removeStyleClass("buttonhoverg");

			this.getView().byId("idButton1").addStyleClass("buttonhoverg");

			this.getView().byId("idButton2").addStyleClass("buttonhoverT");
			this.getView().byId("idButton1").removeStyleClass("buttonhoverT");

		},

		onPress2: function () {

			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", true);
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);

			this.getView().byId("idButton2").removeStyleClass("buttonhoverT");
			this.getView().byId("idButton2").addStyleClass("buttonhoverg");

			this.getView().byId("idButton1").removeStyleClass("buttonhoverg");
			this.getView().byId("idButton1").addStyleClass("buttonhoverT");

		},

		loadcurrentcpuU: function (systm) {
			sap.ui.core.BusyIndicator.show();

			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getAppCPUUtilizationHistoryBySystem?" + "systems=" + systm +
					"&process=HISTORY_CPU_UTIL")
				/*$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getHanaDBCPUAndMemoryUtilizationHistory?filterParam=" + that.filterParam)*/
				.done(function (data) {

					var odata = data.body;

					var memorydata = new JSONModel();
					that.getView().setModel(memorydata, "cpuUtilizationApp");
					that.getView().getModel("cpuUtilizationApp").setProperty("/", odata);

					// that.getView().getModel("cpuUtilizationHana").setData(odata);
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

		loadChartData: function (systm) {
			sap.ui.core.BusyIndicator.show();

			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getDBMemoryUtilizationHistoryBySystem?" + "systems=" + systm +
					"&process=HISTORY_MEMORY" + "&filterParam=" + that.filterParam)
				/*$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getHanaDBCPUAndMemoryUtilizationHistory?filterParam=" + that.filterParam)*/
				.done(function (data) {
					var odata = data.body;

					that.getView().getModel("cpuUtilization").setProperty("/analyticalview", odata);
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

		onListItemPress: function (oEvent) {
			that.selectedSys = oEvent.getParameters().listItem.getTitle();
			that.getView().getModel("sysListModel").setProperty("/Selectedsystem", that.selectedSys);
			that.loadChartData(that.selectedSys);

		},

		getSplitAppObj: function () {
			var result = this.byId("SplitAppDemo");
			if (!result) {
				Log.info("SplitApp object can't be found");
			}
			return result;
		},

		onListItemPressApp: function (oEvent) {
			that.selectedSys = oEvent.getParameters().listItem.getTitle();
			that.loadcurrentcpuU(that.selectedSys);
		},

		getSplitAppObjApp: function () {
			var result = this.byId("SplitAppDemoApp");
			if (!result) {
				Log.info("SplitApp object can't be found");
			}
			return result;
		},

		onAfterRendering: function () {

			var ocpuapplicationchart = this.getView().byId("idLineChart");
			ocpuapplicationchart.setVizProperties({
				plotArea: {

					// colorPalette: d3.scale.category20().range(),
					colorPalette: ["#F05620"],
					dataLabel: {
						showTotal: true,
						style: {
							color: "#BCBCBC"
						}

					},
					dataPointSize: {
						max: 30,
						min: 30
					},
					dataPoint: {
						stroke: {
							color: "#2B3033"
						}
					},
					gridline: {
						size: 0.1,
						color: "#BCBCBC"
					},
					marker: {
						size: 7,
						shape: "diamond"
					},

					lineRenderer: function (oMarker) {
						oMarker.graphic.color = "#5cbae6";
					},
					markerRenderer: function (oMarker) {
						oMarker.graphic.fill = "#FF9831";
						// if (oMarker.ctx.Cpu(%) == "249") {
						// 	oMarker.graphic.fill = "#FF9831";
						// } else {
						// 	oMarker.graphic.fill = "#C981B2";
						// }
					},
				},
				referenceLine: {
					line: {
						valueAxis: [{
							value: 6,
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
						// if (e.ctx.Memory_Used == "249") {
						// 	e.styles.fill = "#FF9831";
						// } else {
						// 	e.styles.fill = "#C981B2";
						// }

					},
					title: {

						/* hide the systems for memory utilization*/
						visible: "false",
						style: {
							color: "#FFFFFF"
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

				},
				legendGroup: {
					layout: {
						position: "bottom"

					}
				},

				tooltip: {
					visible: false
				}

			});

			var vizchart = this.getView().byId("idcpuPerDay");
			vizchart.setVizProperties({
				plotArea: {
					// colorPalette: d3.scale.category20().range(),
					colorPalette: ["#95D4AB"],
					adjustScale: true,
					dataLabel: {
						showTotal: true,
						style: {
							color: "#BCBCBC"
						}

					},

					dataPointSize: {
						max: 13,
						min: 13
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
								value: 6,
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

					// 	markerRenderer: function (oMarker) {
					// 	oMarker.graphic.fill = "#FFE600";
					// 	if (oMarker.ctx.Memory_Used == "88.37>") {
					// 		oMarker.graphic.fill = "#FF9831";
					// 	} else {
					// 		oMarker.graphic.fill = "#C981B2";
					// 	}
					// },

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
						/* hide the systems for memory utilization*/
						visible: "false",
						style: {
							color: "#FFFFFF"
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

		},
		onExit: function () {

		},

		/*graphical view*/
		onPress3: function () {

			this.getView().byId("idVbox3").setProperty("visible", true);
			this.getView().byId("idVbox4").setProperty("visible", false);

			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", false);

			this.getView().byId("idButton4").removeStyleClass("buttonhoverg");

			this.getView().byId("idButton3").addStyleClass("buttonhoverg");

			this.getView().byId("idButton4").addStyleClass("buttonhoverT");
			this.getView().byId("idButton3").removeStyleClass("buttonhoverT");
		},
		/*table  view*/
		onPress4: function () {

			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", false);

			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", true);

			this.getView().byId("idButton4").removeStyleClass("buttonhoverT");
			this.getView().byId("idButton4").addStyleClass("buttonhoverg");

			this.getView().byId("idButton3").removeStyleClass("buttonhoverg");
			this.getView().byId("idButton3").addStyleClass("buttonhoverT");

		},

		getselectedKey: function (evt) {
			var oevent = evt.getParameter("item").getText();
			if (oevent == "Hana DB") {
				this.getView().byId("idVbox3").setProperty("visible", true);

			} else if (oevent == "Application") {
				this.getView().byId("idVbox1").setProperty("visible", true);

			}
		},

		onPressFilterHana: function (oEvent) {
			var oButton = oEvent.getSource();
			// create popover
			if (!this._oPopover) {
				Fragment.load({
					name: "ey.irp.IRPModule.fragment.cpuPopover",
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
		onchange: function (oEvent) {
			var value = oEvent.getParameters().newValue;
			var splitVal = value.split(" ");
			var secs = null;
			if (splitVal[1] == "Minutes") {
				secs = parseInt(splitVal[0]) * 60;
				that.filterParam = "TS" + secs;

			} else if (splitVal[1] == "Hour") {
				// secs = parseInt(splitVal[0]) * 60;
				that.filterParam = "HOUR";

			} else if (value == "Day") {
				// secs = parseInt(splitVal[0]) * 60;
				that.filterParam = "DAY";
			}

		},
		handleApplyButton: function () {
			var selectedSystm = that.getView().getModel("sysListModel").getProperty("/Selectedsystem");
			that.loadChartData(selectedSystm);
			sap.ui.getCore().byId("idComboTypecpu").setSelectedKey("Day");
			that.filterParam = "DAY";
			this._oPopover.close();
		},
		handleCloseButtonCpu: function () {
			this._oPopover.close();
		}

	});

});