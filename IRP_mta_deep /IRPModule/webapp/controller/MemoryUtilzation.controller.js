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
	return BaseController.extend("ey.irp.IRPModule.controller.MemoryUtilzation", {
		formatter: formatter,

		onInit: function () {
			that = this;

			that.filterParam = "DAY";
			that.filterParamT = "DAY";
			that.filterParamH = "DAY";
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			/*top consumer*/
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idButton6").setProperty("visible", false);
			this.getView().byId("idButton7").setProperty("visible", false);

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

			that.memoryUtilization = new JSONModel();
			that.getView().setModel(that.memoryUtilization, "memoryUtilization");
			that.memoryUtilization.setProperty("/workProcesstype", items);
			that.oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			this.getView().addEventDelegate({
				onBeforeShow: function (evt) {

					var clear = "";

					clear = (this._oPopover) ? this._oPopover = "" : "";
					clear = (this._oPopoverH) ? this._oPopoverH = "" : "";
					clear = (this._oPopoverT) ? this._oPopoverT = "" : "";
					/* listID for hana list id*/
					var firstItem = that.getView().byId("listID").getItems()[0];
					that.getView().byId("listID").setSelectedItem(firstItem, true);

					var hanaSystemList = that.getView().byId("listID").getItems()[0];
					if (hanaSystemList !== undefined) {

						this.sytemz = that.getView().byId("listID").getItems()[0].getTitle();

						that.loadTopConsumer(this.sytemz);
						that.loadChartData(this.sytemz);
						that.loadHeapMemory(this.sytemz);
						that.getView().getModel("sysListModel").setProperty("/Selectedsystem", this.sytemz);

						/* application id listIDApp*/

					} else {
						that.systemConfigData();
						that.getView().getModel("sysListModel").setProperty("/Selectedsystem", systems);
						that.loadTopConsumer(systems);
						that.loadChartData(systems);
						that.loadHeapMemory(systems);
					}
					var appSysList = that.getView().byId("listIDApp").getItems()[0];
					if (appSysList !== undefined) {

						var firstItemapp = that.getView().byId("listIDApp").getItems()[0];
						that.getView().byId("listIDApp").setSelectedItem(firstItemapp, true);

						this.sytemzz = that.getView().byId("listIDApp").getItems()[0].getTitle();

						that.loadHeapMemoryA(this.sytemzz);
						that.loadlastmemory(this.sytemzz);

					} else {
						that.systemConfigData();
						that.loadHeapMemoryA(systems);
						that.loadlastmemory(systems);
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
		onPressMemoryUtilization: function (oevent) {
			var navCon = oevent.getSource().getParent().getParent();
			navCon.back();
			that.getView().getModel("sysListModel").setProperty("/visible", true);

		},

		loadlastmemory: function (systm) {
			sap.ui.core.BusyIndicator.show();

			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getAppMemoryUtilizationHistoryBySystem?" + "systems=" + systm +
					"&process=HISTORY_MEMORY")
				//	$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getAppMemoryUtilizationHistoryBySystem?systems=S4A&process=HISTORY_MEMORY")

			.done(function (data) {

					var odata = data.body;

					that.getView().getModel("MemoryUtilzation").setData(odata);
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

		onAfterRendering: function () {
			var vizchart = this.getView().byId("idLineChart2");
			vizchart.setVizProperties({
				plotArea: {
					// colorPalette: d3.scale.category20().range(),
					colorPalette: ["#27ACAA"],
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
					}

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

			var vizchart1 = this.getView().byId("idLineChart");
			vizchart1.setVizProperties({
				plotArea: {
					trendLine: {

						defaultStyle: {
							size: 1,
							type: "dot"
						}
					},

					colorPalette: ["#73C03C"],
					dataLabel: {
						showTotal: true,
						style: {
							color: "#BCBCBC"
						}
					},
					dataPointSize: {
						max: 20,
						min: 20
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
						oMarker.graphic.fill = "#FFE600";
						if (oMarker.ctx.Memory_Used == "249") {
							oMarker.graphic.fill = "#FF9831";
						} else {
							oMarker.graphic.fill = "#C981B2";
						}
					},
					// 	dataPointStyle: {
					// 	"rules": [{
					// 		"dataContext": {
					// 			"Systems": "S4A"
					// 		},
					// 		"properties": {
					// 			"color": "#1EB7B2"
					// 		},

					// 		"displayName": "S4A"
					// 	}],
					// 	"others": {
					// 		"properties": {
					// 			"color": "#A2D1F5"
					// 				// "color": "#008000"
					// 		},
					// 		"displayName": "S4D"
					// 	}
					// },
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
						visible: "true",
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
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idButton2").removeStyleClass("buttonhoverT");
			this.getView().byId("idButton2").addStyleClass("buttonhoverg");
			this.getView().byId("idButton1").removeStyleClass("buttonhoverg");
			this.getView().byId("idButton1").addStyleClass("buttonhoverT");
		},
		/*graphical view*/
		onPress3: function () {
			this.getView().byId("idVbox3").setProperty("visible", true);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idButton4").removeStyleClass("buttonhoverg");
			this.getView().byId("idButton3").addStyleClass("buttonhoverg");
			this.getView().byId("idButton4").addStyleClass("buttonhoverT");
			this.getView().byId("idButton3").removeStyleClass("buttonhoverT");
		},
		/*table  view*/
		onPress4: function () {
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", true);
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idButton4").removeStyleClass("buttonhoverT");
			this.getView().byId("idButton4").addStyleClass("buttonhoverg");
			this.getView().byId("idButton3").removeStyleClass("buttonhoverg");
			this.getView().byId("idButton3").addStyleClass("buttonhoverT");

		},
		onPressFilterHana: function (oEvent) {
			var oButton = oEvent.getSource();
			// create popover
			if (!this._oPopover) {
				Fragment.load({
					name: "ey.irp.IRPModule.fragment.rPopover",
					controller: this
				}).then(function (pPopover) {
					this._oPopover = pPopover;
					this.getView().addDependent(this._oPopover);
					// var gData = this.getOwnerComponent().oMyStorage.get("data");
					// var oJsonModel = new sap.ui.model.json.JSONModel();
					// oJsonModel.setData({
					// 	"employeeProfileInfo": gData
					// });
					// this._oPopover.setModel(oJsonModel, "personalInfoModel");
					this._oPopover.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
			}

		},

		onPressFilterHanaH: function (oEvent) {
			var oButton = oEvent.getSource();
			// create popover
			if (!this._oPopoverH) {
				Fragment.load({
					name: "ey.irp.IRPModule.fragment.rPopoverH",
					controller: this
				}).then(function (pPopover) {
					this._oPopoverH = pPopover;
					this.getView().addDependent(this._oPopoverH);

					this._oPopoverH.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopoverH.openBy(oButton);
			}

		},

		onPressFilterHanaT: function (oEvent) {
			var oButton = oEvent.getSource();
			// create popover
			if (!this._oPopoverT) {
				Fragment.load({
					name: "ey.irp.IRPModule.fragment.rPopoverT",
					controller: this
				}).then(function (pPopover) {
					this._oPopoverT = pPopover;
					this.getView().addDependent(this._oPopoverT);

					this._oPopoverT.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopoverT.openBy(oButton);
			}
		},

		onItemSelect: function (oEvent) {
			var item = oEvent.getParameter('item');
			this.byId("pageContainer").to(this.getView().createId(item.getKey()));
		},

		onListItemPress: function (oEvent) {

			that.selectedSys = oEvent.getParameters().listItem.getTitle();
			that.getView().getModel("sysListModel").setProperty("/Selectedsystem", that.selectedSys);
			that.loadTopConsumer(that.selectedSys);
			that.loadChartData(that.selectedSys);
			that.loadHeapMemory(that.selectedSys);

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
			that.loadHeapMemoryA(that.selectedSys);
			that.loadlastmemory(that.selectedSys);
		},

		getSplitAppObjApp: function () {
			var result = this.byId("SplitAppDemoApp");
			if (!result) {
				Log.info("SplitApp object can't be found");
			}
			return result;
		},

		loadChartData: function (systm) {
			sap.ui.core.BusyIndicator.show();

			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getDBMemoryUtilizationHistoryBySystem?" + "systems=" + systm +
					"&process=HISTORY_MEMORY" + "&filterParam=" + that.filterParam)
				/*$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getHanaDBCPUAndMemoryUtilizationHistory?filterParam=" + that.filterParam)*/
				.done(function (data) {
					var odata = data.body;
					var memorydata = new JSONModel();
					that.getView().setModel(memorydata, "hanaDBUtilzation");
					// memorydata.setSizeLimit(odata.length);
					that.getView().getModel("hanaDBUtilzation").setProperty("/analyticalview", odata);
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

		loadTopConsumer: function (systm) {
			sap.ui.core.BusyIndicator.show();

			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getDBMemoryUtilizationTopConsumersBySystem?" + "systems=" + systm +
					"&process=TOP_CONSUMERS" + "&filterParam=" + that.filterParamT)
				//	$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getTopConsumer?filterParam=DAY")
				.done(function (data) {
					var odata = data.body;
					var memorydata = new JSONModel();
					that.getView().setModel(memorydata, "hanaDBTopC");
					that.getView().getModel("hanaDBTopC").setProperty("/analyticalviewTop", odata);
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
		loadHeapMemory: function (systm) {
			sap.ui.core.BusyIndicator.show();
			//$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getHanaDBHeapMemory?filterParam=DAY")

			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getDBMemoryUtilizationHeapMemoryBySystem?" + "systems=" + systm +
					"&process=HEAP_MEMORY" + "&filterParam=" + that.filterParamH)
				.done(function (data) {
					var odata = data.body;
					var memorydata = new JSONModel();

					that.getView().setModel(memorydata, "hanaDBHeapMemory");
					that.getView().getModel("hanaDBHeapMemory").setProperty("/analyticalviewHeap", odata);
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

		loadHeapMemoryA: function (system) {
			sap.ui.core.BusyIndicator.show();

			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getAppMemoryUtilizationHeapMemoryBySystem?" + "systems=" + system +
					"&process=HEAP_MEMORY")
				//	$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getABAPHeapMemory")

			.done(function (data) {
					var odata = data.body;
					var memorydata = new JSONModel();

					that.getView().setModel(memorydata, "hanaDBHeapMemoryA");
					that.getView().getModel("hanaDBHeapMemoryA").setProperty("/analyticalviewHeapA", odata);
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

		selectMConsumption: function () {
			this.getView().byId("idVbox3").setProperty("visible", true);
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idButton4").setProperty("enabled", true);
			this.getView().byId("idButton4").removeStyleClass("buttonhoverg");
			this.getView().byId("idButton4").addStyleClass("buttonhoverT");
			this.getView().byId("idButton3").setProperty("visible", true);
			this.getView().byId("idButton3").removeStyleClass("buttonhoverT");
			this.getView().byId("idButton3").addStyleClass("buttonhoverg");
			/*filters visiblity*/
			this.getView().byId("idButton7").setProperty("visible", false);
			this.getView().byId("idButton6").setProperty("visible", false);
			this.getView().byId("idButton5").setProperty("visible", true);

		},
		selectTConsumers: function () {
			this.getView().byId("idVbox5").setProperty("visible", true);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idButton3").setProperty("visible", false);
			this.getView().byId("idButton4").removeStyleClass("buttonhoverT");
			this.getView().byId("idButton4").addStyleClass("buttonhoverg");
			this.getView().byId("idButton4").setProperty("enabled", false);
			/*filters visiblity*/
			this.getView().byId("idButton5").setProperty("visible", false);
			this.getView().byId("idButton7").setProperty("visible", false);
			this.getView().byId("idButton6").setProperty("visible", true);
		},
		selectHMemory: function () {
			this.getView().byId("idVbox6").setProperty("visible", true);
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idButton3").setProperty("visible", false);
			this.getView().byId("idButton4").removeStyleClass("buttonhoverT");
			this.getView().byId("idButton4").addStyleClass("buttonhoverg");
			this.getView().byId("idButton4").setProperty("enabled", false);
			/*filters visiblity*/
			this.getView().byId("idButton5").setProperty("visible", false);
			this.getView().byId("idButton7").setProperty("visible", true);
			this.getView().byId("idButton6").setProperty("visible", false);

		},
		selectMConsumptionA: function () {
			this.getView().byId("idVbox1").setProperty("visible", true);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", false);
			/*graph view*/
			this.getView().byId("idButton1").setProperty("visible", true);
			this.getView().byId("idButton1").removeStyleClass("buttonhoverT");
			this.getView().byId("idButton1").addStyleClass("buttonhoverg");
			/*table view*/
			this.getView().byId("idButton2").removeStyleClass("buttonhoverg");
			this.getView().byId("idButton2").addStyleClass("buttonhoverT");
			this.getView().byId("idButton2").setProperty("enabled", true);

		},
		selectHMA: function () {
			this.getView().byId("idVbox1").setProperty("visible", false);
			this.getView().byId("idVbox2").setProperty("visible", false);
			this.getView().byId("idVbox3").setProperty("visible", false);
			this.getView().byId("idVbox4").setProperty("visible", false);
			this.getView().byId("idVbox5").setProperty("visible", false);
			this.getView().byId("idVbox6").setProperty("visible", false);
			this.getView().byId("idVbox7").setProperty("visible", true);
			this.getView().byId("idButton1").setProperty("visible", false);
			this.getView().byId("idButton2").removeStyleClass("buttonhoverT");
			this.getView().byId("idButton2").addStyleClass("buttonhoverg");
			this.getView().byId("idButton2").setProperty("enabled", false);

		},

		getselectedKey: function (evt) {
			var oevent = evt.getParameter("item").getText();
			if (oevent == "Hana DB") {
				this.getView().byId("idMC").setSelected(true);
				that.selectMConsumption();
			} else if (oevent == "Application") {
				this.getView().byId("idMCA").setSelected(true);
				that.selectMConsumptionA();
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
			// that.filterParam
		},
		onchangeH: function (oEvent) {
			var value = oEvent.getParameters().newValue;
			var splitVal = value.split(" ");
			var secs = null;
			if (splitVal[1] == "Minutes") {
				secs = parseInt(splitVal[0]) * 60;
				that.filterParamH = "TS" + secs;

			} else if (splitVal[1] == "Hour") {
				// secs = parseInt(splitVal[0]) * 60;
				that.filterParamH = "HOUR";

			} else if (value == "Day") {
				// secs = parseInt(splitVal[0]) * 60;
				that.filterParamH = "DAY";
			}

		},
		onchangeT: function (oEvent) {
			var value = oEvent.getParameters().newValue;
			var splitVal = value.split(" ");
			var secs = null;
			if (splitVal[1] == "Minutes") {
				secs = parseInt(splitVal[0]) * 60;
				that.filterParamT = "TS" + secs;

			} else if (splitVal[1] == "Hour") {
				// secs = parseInt(splitVal[0]) * 60;
				that.filterParamT = "HOUR";

			} else if (value == "Day") {
				// secs = parseInt(splitVal[0]) * 60;
				that.filterParamT = "DAY";
			}

		},

		handleApplyButton: function () {
			var selectedSystm = that.getView().getModel("sysListModel").getProperty("/Selectedsystem");
			that.loadChartData(selectedSystm);
			sap.ui.getCore().byId("idComboType").setSelectedKey("Day");
			this._oPopover.close();
			that.filterParam = "DAY";

		},
		handleCloseButton: function () {
			this._oPopover.close();
		},
		handleApplyButtonH: function () {
			var selectedSystm = that.getView().getModel("sysListModel").getProperty("/Selectedsystem");
			that.loadHeapMemory(selectedSystm);
			sap.ui.getCore().byId("idcomH").setSelectedKey("Day");

			this._oPopoverH.close();
			that.filterParamH = "DAY";
		},
		handleCloseButtonH: function () {
			this._oPopoverH.close();
		},

		handleApplyButtonT: function () {
			var selectedSystm = that.getView().getModel("sysListModel").getProperty("/Selectedsystem");
			that.loadTopConsumer(selectedSystm);
			sap.ui.getCore().byId("idcomT").setSelectedKey("Day");

			this._oPopoverT.close();
			that.filterParamT = "DAY";
		},
		handleCloseButtonT: function () {

			this._oPopoverT.close();
		}
	});

});