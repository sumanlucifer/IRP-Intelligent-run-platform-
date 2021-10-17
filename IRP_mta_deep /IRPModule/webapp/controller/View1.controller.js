sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"ey/irp/IRPModule/formatter/formatter",
	"sap/m/MessageToast",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment"
], function (BaseController, JSONModel, formatter, MessageToast, XMLView, Filter, FilterOperator, Fragment) {
	"use strict";
	var that;
	var sysSelected = [];
	var selMat;
	var selPlant;
	return BaseController.extend("ey.irp.IRPModule.controller.View1", {
		formatter: formatter,
		onInit: function () {
			that = this;
			that.getView().addEventDelegate({
				onBeforeShow: function (evt) {

				},

				onAfterHide: function (evt) {

				}
			});

			var items = [{
					key: "All",
					text: "All"
				}, {
					key: "Pending",
					text: "Pending"
				},

				{
					key: "Success",
					text: "Success"
				}, {
					key: "Failed",
					text: "Failed"
				}

			];

			that.MonthEndTableModel = new JSONModel({});

			that.getView().setModel(that.MonthEndTableModel, "MonthEndTableModel");
			that.MonthEndTableModel.setProperty("/workProcesstype", items);
			var date = new Date();
			var curMonth = date.getMonth() + 1;

			that.getView().getModel("MonthEndTableModel").setProperty("/curMonth", curMonth);

		
			var sMonth = date.toLocaleString("default", {
				month: "long"
			});;

			var year = date.getFullYear();

			var dateValue = `${sMonth} ${year}`
			that.getView().getModel("MonthEndTableModel").setProperty("/dateValue", dateValue);

			/////////////////odata calling start

			var oModel = this.getOwnerComponent().getModel("MonthEndActivity");

			oModel.read("/Month_End_StatusSet", {
				method: "GET",
				success: function (data) {
					var tableData = data.results;
					var oModelMEActivity = new JSONModel(tableData);
					that.getView().getModel("MonthEndTableModel").setProperty("/Table", oModelMEActivity);
					//	alert(JSON.stringify(data));
				},
				error: function () {

				}
			});

			// $.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getSystemList")
			/* checking dummy list apis */
			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getDummySystemList")

			.done(function (data) {

					var sysList = data.data;
					that.systemConfigData(sysList);

				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});

			var loadMemoryInterval = null;
			var loadCpuInterval = null;

			that.landingPageModel = new JSONModel();
			that.getView().setModel(that.landingPageModel, "landingPageModel");

			that.landingPageWP = new JSONModel();
			that.getView().setModel(that.landingPageWP, "landingPageWP");
			that.addingNavEvents();

		},
		addingNavEvents: function () {
			var that = this;
			/*added by deepanjali for work process navigation */
			this.getView().byId("idIndicator").attachBrowserEvent("click",

				function (a) {
					that.onWokProcessPress();
					that.getView().getModel("sysListModel").setProperty("/visible", false);

				});
			this.getView().byId("batchjob").attachBrowserEvent("click",

				function (b) {
					that.onbactchjobLogsPress();
					that.getView().getModel("sysListModel").setProperty("/visible", false);

				});

			this.getView().byId("systemAnalysis").attachBrowserEvent("click",

				function (c) {
					that.onSystemAnalysisPress();
					that.getView().getModel("sysListModel").setProperty("/visible", false);

				});
			this.getView().byId("cpuUtilization").attachBrowserEvent("click",

				function (c) {
					that.oncpuUtilizationPress();
					that.getView().getModel("sysListModel").setProperty("/visible", false);

				});

			this.getView().byId("memoryUtilization").attachBrowserEvent("click",

				function (c) {
					that.onmemoryUtilizationnPress();
					that.getView().getModel("sysListModel").setProperty("/visible", false);

				});
			this.getView().byId("abapid").attachBrowserEvent("click",

				function (c) {
					that.onabapdumpsPress();
					that.getView().getModel("sysListModel").setProperty("/visible", false);
				});

			this.getView().byId("logandtraces").attachBrowserEvent("click",

				function (c) {
					that.onLogTracePress();
					that.getView().getModel("sysListModel").setProperty("/visible", false);

				});

			this.getView().byId("sysChange").attachBrowserEvent("click",

				function (c) {
					that.onSysChangePress();
					that.getView().getModel("sysListModel").setProperty("/visible", false);

				});
			this.getView().byId("activeusersession").attachBrowserEvent("click",

				function (c) {
					that.onactiveusersession();
					that.getView().getModel("sysListModel").setProperty("/visible", false);

				});

		},
		onLandingMatched: function () {

		},

		systemConfigData: function (sysList) {
			var oModelInvtry = new JSONModel(sysList);
			that.getView().getModel("sysListModel").setProperty("/SystemList", sysList);
			var dbSysArr = [];
			var AppSysArr = [];

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

			systems = sysSelected.toString();
			if (systems === null || systems === undefined || systems === "") {

				sysSelected = [];
				dbSys = {};
				AppSys = {};
				var dbSysArr = [];
				var AppSysArr = [];

				sysSelected = sysList.sysIdList;
				var allSystems = sysSelected.map(function (item) {
					return item.SYSID;
				});
				systems = allSystems.toString();

				that.loadMemoryU(systems);
				that.loadcpugraph(systems);
				that.loadWorkProcessLanding(systems);
				that.loadabapdumpsL(systems);
				that.loadBatchJobsL(systems);
				that.loadSAAppData(systems);
			}
		},

		loadMemoryU: function (oEvent) {
			// var d = that;
			var sysSelection = oEvent;
			var oJsonRegModel = new sap.ui.model.json.JSONModel();

			that.getView().setModel(oJsonRegModel, "landingPageModel");
			that.loadMemoryInterval = setInterval(() => {

				// $.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getMemoryUtilizationBySystem?" + "systems=" + sysSelection +
				// 		"&process=CURRENT_MEMORY")
				$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getDummyMemoryUtilization?" + "systems=" + sysSelection +
					"&process=CURRENT_MEMORY")

				.done(function (data) {

						var odata = data.body;

						oJsonRegModel.setData(odata);
						that.getView().setModel(oJsonRegModel, "landingPageModel");
						// that.getView().getModel("landingPageModel").refresh("true");

					})
					.fail(function (jqXHR, textStatus) {
						// that.errorMessage();
					})
					.always(function () {

					});

			}, 10000);

		},
		loadabapdumpsL: function (oEvent) {

			sap.ui.core.BusyIndicator.show();
			var sysSelection = oEvent;

			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getABAPDumpBySystem?" + "systems=" + sysSelection +
					"&process=ABAP_DUMPS")
				.done(function (data) {

					var odata = data.body;
					var oJsonAbapModel = new sap.ui.model.json.JSONModel();
					oJsonAbapModel.setData(odata);
					that.getView().setModel(oJsonAbapModel, "abapDumpModelL");

					that.getView().getModel("abapDumpModelL").refresh("true");

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

		loadSAAppData: function (oEvent) {
			var sysSelection = oEvent;
			sap.ui.core.BusyIndicator.show();
			$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getSAPSystemStatusBySystem?" + "systems=" + sysSelection +
				"&process=APP_SERVER")

			.done(function (data) {

					var odata = data.body;
					var oJsonsysModel = new sap.ui.model.json.JSONModel();
					oJsonsysModel.setData(odata);
					that.getView().setModel(oJsonsysModel, "landingPageSA");

					sap.ui.core.BusyIndicator.hide();
				})
				.fail(function (textStatus) {
					that.errorMessage();
					// MessageToast.show("Request failed");
					sap.ui.core.BusyIndicator.hide();

				})
				.always(function () {
					sap.ui.core.BusyIndicator.hide();
				});

		},

		onApply: function (oEvent) {

			sysSelected = [];
			dbSys = {};
			AppSys = {};
			var dbSysArr = [];
			var AppSysArr = [];

			var selectedKeys = this.getView().byId("multiCombomonitoring").getSelectedItems();
			that.getView().getModel("sysListModel").setProperty("/selectedKeys", selectedKeys);
			// if (selectedKeys) {

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

			that.getView().getModel("sysListModel").setProperty("/DBSystems", dbSys);
			that.getView().getModel("sysListModel").setProperty("/APPSystems", AppSys);

			clearInterval(that.loadMemoryInterval);
			clearInterval(that.loadCpuInterval);
			var systemDataModel = this.getView().getModel("sysListModel").getProperty("/SystemList");
			var systemData = systemDataModel.sysIdList;
			var allSystems = systemData.map(function (item) {
				return item.SYSID;
			});
			if (selectedKeys.length !== 0) {
				systems = sysSelected.toString();
			} else {
				systems = allSystems.toString();
			}

			that.loadMemoryU(systems);
			that.loadcpugraph(systems);
			that.loadWorkProcessLanding(systems);
			that.loadabapdumpsL(systems);
			that.loadBatchJobsL(systems);
			that.loadSAAppData(systems);

		},
		onMenuButtonPress: function () {

			var toolPage = this.byId("toolPage");

			toolPage.setSideExpanded(!toolPage.getSideExpanded());

		},

		onSideNavButtonPress: function () {

			var oToolPage = this.byId("toolPage");
			var bSideExpanded = oToolPage.getSideExpanded();

			this._setToggleButtonTooltip(bSideExpanded);

			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());

		},

		_setToggleButtonTooltip: function (bLarge) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				oToggleButton.setTooltip('Large Size Navigation');
			} else {
				oToggleButton.setTooltip('Small Size Navigation');
			}
		},

		onItemSelect: function (oEvent) {

			var item = oEvent.getParameter('item');
			this.byId("pageContainer").to(this.getView().createId(item.getKey()));

			if (this.getView().createId(item.getKey()) === "__xmlview0--root3") {
				this.getView().byId("idP2pFilter").setProperty("visible", true);
				this.getView().byId("multiCombomonitoring").setProperty("visible", false);

				this.getView().byId("idApply").setProperty("visible", false);
			} else if (this.getView().createId(item.getKey()) === "__xmlview0--root1") {
				this.getView().byId("multiCombomonitoring").setProperty("visible", true);
				this.getView().byId("idP2pFilter").setProperty("visible", false);

				this.getView().byId("idApply").setProperty("visible", true);

			} else {
				this.getView().byId("idP2pFilter").setProperty("visible", false);
				this.getView().byId("multiCombomonitoring").setProperty("visible", false);
				this.getView().byId("idApply").setProperty("visible", false);

			}
			this.loadData();

			that.loadInventory();
			that.loadPurReq();
			that.loadPO();
			that.loadGR();
			that.loadIV();
			that.loadAPR();
		},
		onWokProcessPress: function (oEvent) {
			this._createViewInstance("wokprocess");

		},
		onbactchjobLogsPress: function () {
			this._createViewInstance("batchjoblogs", "1");

		},

		onSystemAnalysisPress: function (oevent) {
			this._createViewInstance("systemAnalysis");

		},

		oncpuUtilizationPress: function () {
			this._createViewInstance("cpuUtilization");

		},

		onmemoryUtilizationnPress: function () {
			this._createViewInstance("MemoryUtilzation");

		},

		onabapdumpsPress: function () {
			this._createViewInstance("abapDumps");

		},
		onLogTracePress: function () {
			this._createViewInstance("log_Traces");

		},

		onSysChangePress: function () {
			this._createViewInstance("systemChange");

		},

		onactiveusersession: function () {
			this._createViewInstance("activeUserSession");
		},
		onmonthEnd: function () {
			this._createViewInstance("monthEndActivity");
		},

		loadWorkProcessLanding: function (oEvent) {
			var sysSelection = oEvent;
			setInterval(function () {

				$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getWorkProcessorUtilizationBySystem?" + "systems=" +
					sysSelection + "&process=WORK_PROCESS")

				.done(function (data) {

						var odata = data.body;
						var oJsonWpModel = new sap.ui.model.json.JSONModel();
						oJsonWpModel.setData(odata);
						that.getView().setModel(oJsonWpModel, "landingPageWP");

						// that.getView().getModel("landingPageWP").refresh(true);
					})
					.fail(function (jqXHR, textStatus) {
						// that.errorMessage();

					})
					.always(function () {

					});
			}, 3000);

		},

		loadcpugraph: function (oEvent) {

			var sysSelection = oEvent;
			var oJsonRegModel = new sap.ui.model.json.JSONModel();

			that.getView().setModel(oJsonRegModel, "landingPageCPUModel");

			that.loadCpuInterval = setInterval(() => {

				// $.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getCPUUtilizationBySystem?" + "systems=" + sysSelection +
				// 	"&process=CURRENT_CPU_UTIL"
				// )

				$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getDummyCPUUtilization?" + "systems=" + sysSelection +
					"&process=CURRENT_CPU_UTIL"
				)

				.done(function (data) {

						/*var odata = data.body.d.results;*/
						var odata = data.body;

						///odataaaray.push(data.body.d.results[0]);
						var oJsonRegModel = new sap.ui.model.json.JSONModel();
						oJsonRegModel.setData(odata);
						that.getView().setModel(oJsonRegModel, "landingPageCPUModel");

						var oVizFrame = that.getView().byId("idVizFramCPU");
						oVizFrame.setVizProperties({
							plotArea: {
								colorPalette: ["#1EB7B2", "#F48323"],
								isRoundCorner: true,
								animation: {
									dataLoading: false
								},
								drawingEffect: sap.viz.ui5.types.VerticalBar_drawingEffect.normal,
								// colorPalette: d3.scale.category20().range(),

								dataLabel: {
									showTotal: true,
									style: {
										color: "#BCBCBC"
									}

								},
								dataPointSize: {
									max: 17,
									min: 17
								},
								dataPoint: {
									stroke: {
										visible: "false"
									}
								},

								gridline: {
									color: "#BCBCBC"
								},
								gridline: {
									size: 0.1
								},

								referenceLine: {
									line: {
										valueAxis: [{
											value: 50,
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

							categoryAxis: {
								labelRenderer: function (e) {
									e.styles.color = "#BCBCBC";

								},
								title: {
									style: {
										color: "#BCBCBC",
										fontSize: "11.2px"
									}
								},
								hoverShadow: {
									color: "#161C1F"
								},
								mouseDownShadow: {
									color: "#161C1F"
								},

								axisLine: {
									size: 0.1
								}

							},
							valueAxis: {

								label: {
									style: {
										color: "#BCBCBC"
									}
								},
								title: {
									/* hide x- axis value for cpu utilizartions*/
									visible: "false",
									style: {
										color: "#1EB7B2"
									}
								}

							},
							tooltip: {
								visible: true
							},

							legend: {
								isScrollable: true,
								visible: true,
								showFullLabel: true,
								itemMargin: 0,
								hoverSelectedShadow: {
									color: "#161C1F"
								},
								hoverShadow: {
									color: "#161C1F"
								},
								label: {
									style: {
										color: "#BCBCBC",
										fontSize: "12px"

									}
								},

								marker: {
									size: "0.1px",
									shape: "rectangle"
								}

							},
							legendGroup: {
								layout: {
									position: "bottom",

								}
							},

						});
						/*	var oDataset = new sap.viz.ui5.data.FlattenedDataset({
						dimensions: [{
							name: "Systems",
							value: "{Sysid}"
						}],

						measures: [{
							name: "Used",
							value: "{totalUsed}"
						}, {
							name: "Idle",
							value: "{IdleTotal}"
						}],

						data: "{path: 'landingPageCPUModel>/'}"

					});
					oVizFrame.setDataset(oDataset);

					var oFeedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
							"uid": "valueAxis",
							"type": "Measure",
							"values": ["Used"]
						}),
						oFeedValueAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
							"uid": "valueAxis",
							"type": "Measure",
							"values": ["Idle"]
						}),
						

						oFeedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
							"uid": "categoryAxis",
							"type": "Dimension",
							"values": ["Systems"]
						});

					oVizFrame.addFeed(oFeedValueAxis);
					oVizFrame.addFeed(oFeedValueAxis1);
				
					oVizFrame.addFeed(oFeedCategoryAxis);
*/
					})
					.fail(function (jqXHR, textStatus) {
						// that.errorMessage();
					})
					.always(function () {

					});

			}, 10000);

			/*	$.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getCurrentHanaDBcpuUtilization")

				.done(function (odata) {
						odataaaray.push(odata.data);

						var oJsonRegModel1 = new sap.ui.model.json.JSONModel();
						oJsonRegModel.setData(odataaaray);
						that.getView().setModel(oJsonRegModel1, "landingPageCPUModelhana");

					})
					.fail(function (jqXHR, textStatus) {
						// that.errorMessage();
					})
					.always(function () {

					});*/

		},
		loadBatchJobsL: function (oEvent) {
			var sysSelection = oEvent;
			var date = new Date().toLocaleDateString("pl-PL").split(".").reverse().join("-");
			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getBatchJobLogsBySystem?" + "systems=" +
				sysSelection + "&process=BATCH_JOB" + "&startDate=" + date + "T00:00:00")

			.done(function (data) {

					var odata = data.body;
					var oJsonBJModel = new sap.ui.model.json.JSONModel();
					oJsonBJModel.setData(odata);

					that.getView().setModel(oJsonBJModel, "landingbatchModel");

				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});
		},

		////////////////////////////////////////ServiceNow/////////////////////////////////

		loadData: function () {
			var oComponent = this.getOwnerComponent();

			var url = "https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getServiceNowTableData";
			var that = this;

			$.ajax({
				url: url,
				type: "GET",
				crossDomain: true,
				dataType: "application/json",
				async: true,

				error: function (d) {

					var serNowData = JSON.parse(d.responseText);

					var oModelSerNow = new JSONModel(serNowData);
					that.getOwnerComponent().getModel("incList").setData(serNowData);
					var zdata = oModelSerNow.getData().data;
					var count_close = 0;
					var count_active = 0;
					var count_hold = 0;
					var count_inprog = 0;
					var count_new = 0;
					var count_resolved = 0;
					var currentweek = 0;
					var count_openToday = 0;
					var preweek = 0;
					var preweek2 = 0;
					var preweek3 = 0;
					var preweek4 = 0;
					var count_unassiged = 0;
					var totalRecord = 0;
					var closedCurrent = 0,
						closedPre = 0,
						closedPre2 = 0,
						closedPre3 = 0,
						closedre4 = 0;

					/// getting weeks

					var today = new Date();
					var day = today.getDay();
					var currentMon = new Date();
					var prevMon = new Date();
					var prevMon2 = new Date();
					var prevMon3 = new Date();
					var prevMon4 = new Date();

					// object to store count for heat map
					var heatMapObj = {
						"header": ["Closed", "New", "On Hold", "In Progress", "Resolved"],
						"Critical": [0, 0, 0, 0, 0],
						"High": [0, 0, 0, 0, 0],
						"Moderate": [0, 0, 0, 0, 0],
						"Low": [0, 0, 0, 0, 0],
						"Planning": [0, 0, 0, 0, 0]
					};

					currentMon.setDate(today.getDate() - day + 1);
					currentMon.setHours(0, [0], [0], [0]);
					prevMon.setDate(currentMon.getDate() - 7);
					prevMon.setHours(0, [0], [0], [0]);
					prevMon2.setDate(currentMon.getDate() - 14);
					prevMon2.setHours(0, [0], [0], [0]);
					prevMon3.setDate(currentMon.getDate() - 21);
					prevMon3.setHours(0, [0], [0], [0]);
					prevMon4.setDate(currentMon.getDate() - 28);
					prevMon4.setHours(0, [0], [0], [0]);

					for (var i = 0; i < zdata.length; i++) {

						var rowData = oModelSerNow.getData().data[i];

						that.myHeatMap(rowData, heatMapObj);

						if (oModelSerNow.getData().data[i].state === "Closed") {
							count_close++;
						} else if (oModelSerNow.getData().data[i].state === "active") {
							count_active++;
						} else if (oModelSerNow.getData().data[i].state === "On Hold") {
							count_hold++;
						} else if (oModelSerNow.getData().data[i].state === "In Progress") {
							count_inprog++;
						} else if (oModelSerNow.getData().data[i].state === "New") {
							count_new++;
						} else if (oModelSerNow.getData().data[i].state === "Resolved") {
							count_resolved++;
						}

						if (oModelSerNow.getData().data[i].assigned_to.display_value === '' ||
							oModelSerNow.getData().data[i].assigned_to.display_value === null ||
							oModelSerNow.getData().data[i].assigned_to.display_value === undefined
						) {
							count_unassiged++;

						}

						////LineChart 

						var createDate = new Date(oModelSerNow.getData().data[i].sys_created_on);
						var openDate = createDate;
						var currDate = today;
						openDate.setHours(0, [0], [0], [0]);
						currDate.setHours(0, [0], [0], [0]);
						var closedDate = new Date(oModelSerNow.getData().data[i].closed_at);

						if (openDate >= currDate) {
							count_openToday++;
						}

						if (createDate < currentMon && createDate >= prevMon) {
							currentweek++;

						} else if (createDate < prevMon && createDate >= prevMon2) {
							preweek++;
						} else if (createDate < prevMon2 && createDate >= prevMon3) {
							preweek2++;
						} else if (createDate < prevMon3 && createDate >= prevMon4) {
							preweek3++;
						}

						//for closed incidents
						if (closedDate < currentMon && createDate >= prevMon) {
							closedCurrent++;

						} else if (closedDate < prevMon && createDate >= prevMon2) {
							closedPre++;
						} else if (closedDate < prevMon2 && createDate >= prevMon3) {
							closedPre2++;
						} else if (closedDate < prevMon3 && createDate >= prevMon4) {
							closedPre3++;
						}

						totalRecord++;
					}

					console.log(heatMapObj)

					var lineData = [];
					var inLine = {
						"Week": prevMon3.toLocaleDateString(),
						"number": preweek3,
						"closed": closedPre3
					};
					lineData.push(inLine);
					inLine = {
						"Week": prevMon2.toLocaleDateString(),
						"number": preweek2,
						"closed": closedPre2
					};
					lineData.push(inLine);
					inLine = {
						"Week": prevMon.toLocaleDateString(),
						"number": preweek,
						"closed": closedPre
					};
					lineData.push(inLine);
					inLine = {
						"Week": currentMon.toLocaleDateString(),
						"number": currentweek,
						"closed": closedCurrent

					};
					lineData.push(inLine);

					var lineChartData = {
						"data": lineData
					};

					var olineChart = that.getView().byId("idLineChart");
					var olineChart1 = that.getView().byId("idLineChart1");

					var oModelLineChart = new JSONModel(lineChartData);

					olineChart.setModel(oModelLineChart, "LineChartModel");
					olineChart1.setModel(oModelLineChart, "LineChartModel");

					var oPieData = [];
					var input = {
						"state": "Closed",
						"number": count_close
					};
					oPieData.push(input);

					input = {
						"state": "active",
						"number": count_active
					};
					oPieData.push(input);
					input = {
						"state": "On Hold",
						"number": count_hold
					};
					oPieData.push(input);
					input = {
						"state": "In Progress",
						"number": count_inprog
					};
					oPieData.push(input);
					input = {
						"state": "New",
						"number": count_new
					};
					oPieData.push(input);
					input = {
						"state": "Resolved",
						"number": count_resolved
					};
					oPieData.push(input);

					// console.log(oPieData);
					var openInc = count_active + count_hold + count_inprog + count_new;
					that.getView().byId("idOpen").setValue(openInc);
					that.getView().byId("idOpenToday").setValue(count_openToday);
					that.getView().byId("idUnAssinged").setValue(count_unassiged);
					var stringData = {
						"data": oPieData
					};

					var oModelSerNow = new JSONModel(stringData);

					that.getView().byId("idpiechart").setModel(oModelSerNow, "IceCreamModel");

					// JSON data from heat map

					var heatMapJson = that.heatMapJson(heatMapObj);
					var heatMapid = that.getView().byId("idHeatMap");
					var OModelHeatMap = new JSONModel(heatMapJson);
					heatMapid.setModel(OModelHeatMap, "heatMapModel");

				}

			});

		},

		/*eypa inventory call */

		loadInventory: function () {
			var oVizFrame = this.getView().byId("idpiechartEYPA");
			var oModel = new sap.ui.model.json.JSONModel();
			var data = {
				'Sales': [{
					"DrugName": "Cranberry Cream",
					"Revenue": "7.37"
				}, {
					"DrugName": "Wart Remover Liquid",
					"Revenue": "9.54"
				}, {
					"DrugName": "Hydrochlorothiazide",
					"Revenue": "6.57"
				}, {
					"DrugName": "Terazosin Hydrochloride",
					"Revenue": "5.41"
				}, {
					"DrugName": "Topiramate",
					"Revenue": "8.69"
				}]
			};

			oModel.setData(data);

			//      3. Create Viz dataset to feed to the data to the graph
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'Drug Name',
					value: "{DrugName}"
				}],

				measures: [{
					name: 'Revenue',
					value: '{Revenue}'
				}],

				data: {
					path: "/Sales"
				}
			});
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(oModel);

			//      4.Set Viz properties
			oVizFrame.setVizProperties({
				title: {
					text: "Revenue"
				},
				plotArea: {
					colorPalette: d3.scale.category20().range(),
					drawingEffect: "glossy"
				}
			});

			var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "size",
					'type': "Measure",
					'values': ["Revenue"]
				}),
				feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "color",
					'type': "Dimension",
					'values': ["Drug Name"]
				});
			oVizFrame.addFeed(feedSize);
			oVizFrame.addFeed(feedColor);
		},

		onAfterRendering: function () {

			/*chatbot integration code*/
			var that = this;

			var oView = that.getView();

			var firstItem = that.getView().byId("idNav").getItems()[0];
			that.getView().byId("idNav").setSelectedItem(firstItem, true);
			//////////////////memory utilization graph//////////
			var vizchart = this.getView().byId("idVizFrameMU");
			vizchart.setVizProperties({
				plotArea: {

					dataLabel: {
						showTotal: true,
						style: {
							color: "#BCBCBC"
						}

					},
					dataPointSize: {

						max: 15,
						min: 15
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

					dataPointStyle: {
						"rules": [{
							"dataContext": {
								"Systems": "S4A"
							},
							"properties": {
								"color": "#1EB7B2"
							},

							"displayName": "S4A"
						}],
						"others": {
							"properties": {
								"color": "#A2D1F5"
									// "color": "#008000"
							},
							"displayName": "S4D"
						}
					},

					referenceLine: {
						line: {
							valueAxis: [{
								value: 50,
								size: 0.3,
								visible: false,
								label: {
									text: "Average Memory",
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

					// 					lineRenderer: function(oMarker) {
					// oMarker.graphic.color = "#5cbae6";
					// },
					// markerRenderer: function (oMarker) {
					// 	oMarker.graphic.fill = "#FFE600";
					// 	if (oMarker.ctx.System_ID == "S4D") {
					// 		oMarker.graphic.fill = "#008000";
					// 	} else {
					// 		oMarker.graphic.fill = "#B22D6E"
					// 	}
					// }

				},

				categoryAxis: {
					// visible: "false",
					labelRenderer: function (e) {
						e.styles.color = "#BCBCBC";

					},

					title: {
						/* hide the systems for memory utilization*/
						visible: "false",
						style: {
							color: "#1EB7B2",

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
							color: "#BCBCBC",
							fontSize: "11.2px"
						}
					}

				},

				legend: {
					isScrollable: true,
					visible: true,
					showFullLabel: true,
					itemMargin: 0.8,
					hoverSelectedShadow: {
						color: "#161C1F"
					},

					hoverShadow: {
						color: "#161C1F"
					},

					label: {
						style: {
							color: "#BCBCBC",
							fontSize: "11px"
						}
					},

					marker: {
						size: "0px",
						shape: "rectangle"
					},

				},

				legendGroup: {
					layout: {
						position: "bottom",

					}
				},

			});
			var oPieChart = this.getView().byId("idpiechart");
			oPieChart.setVizProperties({
				plotArea: {
					/*colorPalette: d3.scale.category20().range(),*/
					dataLabel: {
						showTotal: true,
						style: {
							color: "#ffffff"
						}

					},
					dataPointSize: {
						max: 20,
						min: 20
					},
					/*	background:{
						color: "#F8A438"	
						}*/

				},

				categoryAxis: {
					labelRenderer: function (e) {
						e.styles.color = "#ffffff";

					},
					title: {
						style: {
							color: "#ffffff"
						}
					}

				},
				valueAxis: {

					label: {
						style: {
							color: "#ffffff"
						}
					},
					title: {
						style: {
							color: "#ffffff"
						}
					}

				},
				tooltip: {
					visible: true
				},
				title: {
					style: {
						color: "#ffffff"
					}
				},
				legend: {
					hoverSelectedShadow: {
						color: "#161C1F"
					},
					hoverShadow: {
						color: "#161C1F"
					},
					title: {
						text: "Material",
						visible: true,
						style: {
							color: "#BCBCBC"
						}
					},
					/*layout:{
						position: "right"
					},*/
					label: {
						style: {
							color: "#BCBCBC",
							fontSize: "8px"
						}
						/*	position: "side"*/
					}

				},
				legendGroup: {
					layout: {
						position: "right"
					}
					/*	title: {
							text: "Material",
							visible: true
						}*/
				}

			});
			////////////////////////properties of heat chart

			var oHeatMap = this.getView().byId("idHeatMap");
			oHeatMap.setVizProperties({
				plotArea: {
					/*colorPalette: d3.scale.category20().range(),*/
					dataLabel: {
						showTotal: true,
						style: {
							color: "#ffffff"
						}

					},
					dataPointSize: {
						max: 20,
						min: 20
					},
					/*	background:{
						color: "#F8A438"	
						}*/

				},

				categoryAxis: {
					labelRenderer: function (e) {
						e.styles.color = "#ffffff";

					},
					title: {
						style: {
							color: "#ffffff"
						}
					}

				},
				categoryAxis2: {
					labelRenderer: function (e) {
						e.styles.color = "#ffffff";

					},
					title: {
						style: {
							color: "#ffffff"
						}
					}

				},
				valueAxis: {

					label: {
						style: {
							color: "#ffffff"
						}
					},
					title: {
						style: {
							color: "#ffffff"
						}
					}

				},
				tooltip: {
					visible: true
				},
				title: {
					style: {
						color: "#ffffff"
					}
				}

			});

			///////properties of line chart

			var oPieChart = this.getView().byId("idLineChart");
			oPieChart.setVizProperties({
				plotArea: {
					/*colorPalette: d3.scale.category20().range(),*/
					dataLabel: {
						showTotal: true,
						style: {
							color: "#ffffff"
						}

					},
					dataPointSize: {
						max: 20,
						min: 20
					},
					/*	background:{
						color: "#F8A438"	
						}*/

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
					}

				},

				categoryAxis: {
					labelRenderer: function (e) {
						e.styles.color = "#ffffff";

					},
					title: {
						style: {
							color: "#ffffff"
						}
					},
					axisLine: {
						size: 0.1,

					}

				},
				valueAxis: {

					label: {
						style: {
							color: "#ffffff"
						}
					},
					title: {
						style: {
							color: "#ffffff"
						}
					}

				},
				tooltip: {
					visible: true
				},
				title: {
					style: {
						color: "#ffffff"
					}
				},

				legendGroup: {
					layout: {
						position: "bottom",

					}
				},

			});

			/////////properties of bar chart

			var oPieChart = this.getView().byId("idLineChart1");
			oPieChart.setVizProperties({
				plotArea: {
					/*colorPalette: d3.scale.category20().range(),*/
					dataLabel: {
						showTotal: true,
						style: {
							color: "#ffffff"
						}

					},
					dataPointSize: {
						max: 17,
						min: 17
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
					/*	background:{
						color: "#F8A438"	
						}*/
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

				categoryAxis: {
					labelRenderer: function (e) {
						e.styles.color = "#ffffff";

					},
					title: {
						style: {
							color: "#ffffff"
						}
					},
					axisLine: {
						size: 0.1,

					}

				},
				valueAxis: {

					label: {
						style: {
							color: "#ffffff"
						}
					},
					title: {
						style: {
							color: "#ffffff"
						}
					}

				},
				tooltip: {
					visible: true
				},
				title: {
					style: {
						color: "#ffffff"
					}
				}

			});

		},

		onPress: function () {
			this.getRouter().navTo("systemAna");
		},

		onPress2: function () {
			this.getRouter().navTo("abapDump");
		},
		onPress3: function () {
			this.getRouter().navTo("systemDumps");
		},
		onPress4: function () {
			this.getRouter().navTo("hanaDB");
		},

		myOnClickHandler: function () {

			this._createViewInstance("incidentList", "1");

		},

		_setIceCreamModel: function () {

			var aData = {
				Items: [{
					Flavor: "Blue Moon",
					Sales: 700
				}, {
					Flavor: "Matcha Green Tea",
					Sales: 1100
				}, {
					Flavor: "ButterScotch",
					Sales: 1400
				}, {
					Flavor: "Black Current",
					Sales: 560
				}]
			};
			var oIceCreamModel = new JSONModel();
			oIceCreamModel.setData(aData);
			this.getView().setModel(oIceCreamModel, "IceCreamModel");
		},

		myHeatMap: function (data, mapObj) {

			if (data.priority === "1 - Critical") {
				this.countIncident(data.state, mapObj.Critical);
			} else if (data.priority === "2 - High") {
				this.countIncident(data.state, mapObj.High);
			} else if (data.priority === "3 - Moderate") {
				this.countIncident(data.state, mapObj.Moderate);
			} else if (data.priority === "4 - Low") {
				this.countIncident(data.state, mapObj.Low);
			} else if (data.priority === "5 - Planning") {
				this.countIncident(data.state, mapObj.Planning);
			} //if end

		},

		countIncident: function (state, priority) {
			switch (state) {
			case "Closed":
				priority[0]++;
				break;
			case "New":
				priority[1]++;
				break;
			case "On Hold":
				priority[2]++;
				break;
			case "In Progress":
				priority[3]++;
				break;
			case "Resolved":
				priority[4]++;
				break;
			}

		},

		heatMapJson: function (data) {

			var input = {};
			var heatData = [];

			for (var i = 0; i < 5; i++) {
				input = {
					"priority": "1 - Critical",
					"number": data.Critical[i],
					"state": data.header[i]
				};
				heatData.push(input);
			}

			for (var i = 0; i < 5; i++) {
				input = {
					"priority": "2 - High",
					"number": data.High[i],
					"state": data.header[i]
				};
				heatData.push(input);
			}

			for (var i = 0; i < 5; i++) {
				input = {
					"priority": "3 - Moderate",
					"number": data.Moderate[i],
					"state": data.header[i]
				};
				heatData.push(input);
			}

			for (var i = 0; i < 5; i++) {
				input = {
					"priority": "4 - Low",
					"number": data.Low[i],
					"state": data.header[i]
				};
				heatData.push(input);
			}

			for (var i = 0; i < 5; i++) {
				input = {
					"priority": "5 - Planning",
					"number": data.Planning[i],
					"state": data.header[i]
				};
				heatData.push(input);
			}

			var stringData = {
				"data": heatData
			};

			// return (JSON.stringify(stringData));	

			return (stringData);

		},

		//////////////EYPA Start
		onInvClick: function () {

			this._createViewInstance("inventory", "1");

		},
		globalP2P: function (oEvent) {

			var oView = that.getView();
			var oDialog = oView.byId("idP2PGlobal");
			if (!oDialog) {
				// 		// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "ey.irp.IRPModule.view.P2PGlobalfilter", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();

			//////////////////////// input help for material starts
			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getHelpForMaterial")

			.done(function (data) {

					var materialData = data.body.d.results;

					var oModelMaterial = new JSONModel(materialData);
					that.getOwnerComponent().getModel("inventoryModel").setProperty("/Materials", materialData);

				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});
			////////////////////////input help for Material end

			/*	var sQuery = oEvent.getSource().getValue();
		
			var p2pComboselection = this.getView().byId("idP2Pcombo").getSelectedItem().getText();

			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/applyGlobalFilter?" + "filterType=" + p2pComboselection +
				"&filterParam=" + sQuery)

			.done(function (data) {

					var filteredData = data.body.d.results;
				
					var oModelFilterP2P = new JSONModel(filteredData);
					that.getOwnerComponent().getModel("P2PglobalModel").refresh(true);
					that.getOwnerComponent().getModel("P2PglobalModel").setData(filteredData);

				})
				.fail(function (jqXHR, textStatus) {
				
				})
				.always(function () {

				});

			var oView = that.getView();
			var oDialog = oView.byId("P2PFilterDialog");
		
			if (!oDialog) {
			
				oDialog = sap.ui.xmlfragment(oView.getId(), "ey.irp.IRPModule.view.P2PFilterDialog", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
*/
		},

		onCloseFilterDialog: function (oEvent) {
			console.log("Sandeep")
			that.getView().byId("idP2PGlobal").close();

		},

		onMaterialChange: function (oEvent) {

			//alert("selection changed");
			selMat = oEvent.getSource().getSelectedItem().getText();
			//	jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/applyGlobalFilter?" + "filterType=" + p2pComboselection +  "&filterParam=" + sQuery)
			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getHelpForPlant?" + "material=" + selMat + "&plant=0001")

			.done(function (data) {

					var materialData = data.body.d.results;

					var oModelMaterial = new JSONModel(materialData);
					that.getOwnerComponent().getModel("inventoryModel").setProperty("/Plant", materialData);

				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});

		},
		onPlantChange: function (oEvent) {

			selPlant = oEvent.getSource().getSelectedItem().getText();
			//	jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/applyGlobalFilter?" + "filterType=" + p2pComboselection +  "&filterParam=" + sQuery)
			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getHelpForPR?" + "material=" + selMat + "&plant=" + selPlant)

			.done(function (data) {

					var materialData = data.body.d.results;

					var oModelMaterial = new JSONModel(materialData);
					that.getOwnerComponent().getModel("inventoryModel").setProperty("/PR", materialData);

				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});

			//////////////////// PO API
			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getHelpForPO?" + "material=" + selMat + "&plant=" + selPlant)

			.done(function (data) {

					var materialData = data.body.d.results;

					var oModelMaterial = new JSONModel(materialData);
					that.getOwnerComponent().getModel("inventoryModel").setProperty("/PO", materialData);

				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});

			///////////////////////////GR API
			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getHelpForGR?" + "material=" + selMat + "&plant=" + selPlant)

			.done(function (data) {

					var materialData = data.body.d.results;

					var oModelMaterial = new JSONModel(materialData);
					that.getOwnerComponent().getModel("inventoryModel").setProperty("/GR", materialData);

				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});

			/////////////////////////////Invoice verification

			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getHelpForInvoice?" + "material=" + selMat + "&plant=" +
				selPlant)

			.done(function (data) {

					var materialData = data.body.d.results;

					var oModelMaterial = new JSONModel(materialData);
					that.getOwnerComponent().getModel("inventoryModel").setProperty("/Invoice", materialData);

				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});

			//////////////////////////////////APR ApI
			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getHelpForAutoPayment?" + "material=" + selMat + "&plant=" +
				selPlant)

			.done(function (data) {

					var materialData = data.body.d.results;

					var oModelMaterial = new JSONModel(materialData);
					that.getOwnerComponent().getModel("inventoryModel").setProperty("/AutoPayment", materialData);

				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});

		},

		handleApplyButton: function () {

			this.onCloseFilterDialog();
			this._createViewInstance("P2PFilterResult");

		},

		////////////////////////end

		loadInventory: function () {

			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getInventory")

			.done(function (data) {

					var inventoryData = data.body.d.results;

					var oModelInvtry = new JSONModel(inventoryData);
					that.getOwnerComponent().getModel("inventoryModel").setData(inventoryData);
					var zdata = oModelInvtry.getData();
					var count_abovereorder = 0;
					var count_nearReorder = 0;
					var count_belowreorder = 0;
					for (var i = 0; i < zdata.length; i++) {

						//	var rowData = oModelInvtry.getData().data[i];

						if (zdata[i].STATUS === "1") {
							count_belowreorder++;
						} else if (zdata[i].STATUS === "2") {
							count_nearReorder++;
						} else if (zdata[i].STATUS === "3") {
							count_abovereorder++;
						}
					}
					var invPieData = [];
					var input = {
						"STATUS": "Below Reorder Level",
						"number": count_belowreorder
					};
					invPieData.push(input);
					input = {
						"STATUS": "Near Reorder Level",
						"number": count_nearReorder
					};
					invPieData.push(input);
					input = {
						"STATUS": "Above Reorder Level",
						"number": count_abovereorder
					};
					invPieData.push(input);
					var stringData = {
						"data": invPieData
					};

					/*var items = [

						{
							key: "1",
							text: "All Inventory"
						},

						{
							key: "2",
							text: "Material Num"
						}, {
							key: "3",
							text: "Plant"
						}

					];*/

					/////////////////////// Global Filter Combobox for P2P

					var P2PFilter = [

						{
							key: "1",
							text: "Material Number"
						}, {
							key: "2",
							text: "Purchase Requisition "
						}, {
							key: "3",
							text: "Purchase Order "
						}, {
							key: "4",
							text: "Goods Receipt "
						}, {
							key: "5",
							text: " Invoice Verification "
						}, {
							key: "6",
							text: " Automatic Run Payment "
						}

					];

					///////////////////////////////Global Filter Combobox for P2P end

					var items = [

						{
							key: "1",
							text: "All Inventory"
						},

						{
							key: "2",
							text: "Material Num"
						}, {
							key: "3",
							text: "Plant"
						}

					];

					var status = [

						{
							key: "1",
							text: "Below Reorder Level"

						},

						{
							key: "2",
							text: "Near Reorder Level"
						}, {
							key: "3",
							text: "Above Reorder Level",
						}

					];

					var oModelInvtry = new JSONModel(stringData);
					//	that.getView().setModel(oModelSerNow);
					that.getView().byId("invPieChart").setModel(oModelInvtry, "invModel");
					that.getView().getModel("inventoryModel").setProperty("/Inventorytype", items);
					that.getView().getModel("inventoryModel").setProperty("/Inventorystatus", status);
					that.getView().getModel("inventoryModel").setProperty("/InventoryP2PFilter", P2PFilter);
				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});

			///////////////////////////EYPA Chart Properties

			var oPieChart = this.getView().byId("invPieChart");

			oPieChart.setVizProperties({
				plotArea: {
					colorPalette: ['#FF6A5D', '#FFB46A', '#8CE8AD'],
					radius: 1,
					isRoundCorner: true,
					animation: {
						dataLoading: false
					},
					drawingEffect: sap.viz.ui5.types.VerticalBar_drawingEffect.glossy,
					// colorPalette: d3.scale.category20().range(),

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
							visible: "true"
						}
					},

					// gridline: {
					// 	type: "dash"
					// },
					gridline: {
						color: "#BCBCBC"
					},
					gridline: {
						size: 0
					},

				},

				categoryAxis: {
					labelRenderer: function (e) {
						e.styles.color = "#BCBCBC";

					},
					title: {
						style: {
							color: "#1EB7B2",
							alignment: "Right"
						}
					},
					hoverShadow: {
						color: "#161C1F"
					},
					mouseDownShadow: {
						color: "#161C1F"
					},

				},
				valueAxis: {

					label: {
						style: {
							color: "#BCBCBC"
						}
					},
					title: {
						style: {
							color: "#1EB7B2"
						}
					}

				},
				tooltip: {
					visible: true
				},
				title: {
					style: {
						color: "#ffffff",

					}
				},

				legend: {

					hoverSelectedShadow: {
						color: "#161C1F"
					},
					hoverShadow: {
						color: "#161C1F"
					},
					title: {
						text: "Material",
						visible: true,
						style: {
							color: "#BCBCBC"
						}
					},
					/*layout:{
						position: "right"
					},*/
					label: {
						style: {
							color: "#BCBCBC",
							fontSize: "8px"
						}
						/*	position: "side"*/
					}

				},
				legendGroup: {
					layout: {
						// position: "right"
						/*changes done by deepanjali*/
						position: "bottom",

					}
					/*	title: {
							text: "Material",
							visible: true
						}*/
				}

			});
			/*	oPieChart.setVizProperties({
					plotArea: {
						colorPalette: ['#8CE8AD','#FFB46A','#FF6A5D'],
						
						dataLabel: {
							showTotal: true,
							style: {
								color: "#ffffff"
							}

						},
						dataPointSize: {
							max: 20,
							min: 20
						},
							tooltip: {
								visible: true
							},
								legend: {
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
								}
							}
						

					},

					categoryAxis: {
						labelRenderer: function (e) {
							e.styles.color = "#ffffff";

						},
						title: {
							style: {
								color: "#ffffff"
							}
						}

					},
					valueAxis: {

						label: {
							style: {
								color: "#ffffff"
							}
						},
						title: {
							style: {
								color: "#ffffff"
							}
						}

					},
					tooltip: {
						visible: true
					},
					title: {
						style: {
							color: "#ffffff"
						}
					}

				});*/

		},
		///////////////////////////////////PR
		loadPurReq: function () {
			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getPurchaseRequisition")

			.done(function (data) {

					/*var inventoryData = data.body.d.results;*/
					var purReqData = data.body.d.results;

					var oModelPurReq = new JSONModel(purReqData);
					that.getOwnerComponent().getModel("PurReqModel").setData(purReqData);
					var zdata = oModelPurReq.getData();
					var count_PO = 0;
					var count_RFO = 0;
					var count_Contract = 0;
					var count_SA = 0;
					var count_SES = 0;
					for (var i = 0; i < zdata.length; i++) {

						//	var rowData = oModelInvtry.getData().data[i];

						if (zdata[i].STATUS === "B") {
							count_PO++;
						} else if (zdata[i].STATUS === "A") {
							count_RFO++;
						} else if (zdata[i].STATUS === "K") {
							count_Contract++;
						} else if (zdata[i].STATUS === "L") {
							count_SA++;
						} else if (zdata[i].STATUS === "S") {
							count_SES++;
						}
					}
					var invPieData = [];
					var input = {
						"STATUS": "PO Created",
						"number": count_PO
					};
					invPieData.push(input);
					input = {
						"STATUS": "RFO Created",
						"number": count_RFO
					};
					invPieData.push(input);
					input = {
						"STATUS": "Contract Created",
						"number": count_Contract
					};
					invPieData.push(input);
					input = {
						"STATUS": "SA Created",
						"number": count_SA
					};
					invPieData.push(input);
					input = {
						"STATUS": "SES Created",
						"number": count_SES
					};
					invPieData.push(input);

					var items = [

						{
							key: "1",
							text: "All Requisition"
						},

						{
							key: "2",
							text: "Material Number"
						}, {
							key: "3",
							text: "PR Number"
						}, {
							key: "4",
							text: "Plant"
						}

					];
					var status = [

						{
							key: "B",
							text: "PO Created"
						},

						{
							key: "A",
							text: "RFO Created"
						},

						{
							key: "K",
							text: "Contract Created"
						},

						{
							key: "L",
							text: "SA Created"
						},

						{
							key: "S",
							text: "SES Created"
						}

					];

					var stringData = {
						"data": invPieData
					};
					var oModelpurReq = new JSONModel(stringData);
					//	that.getView().setModel(oModelSerNow);
					that.getView().byId("idBarChartPR").setModel(oModelpurReq, "purReqModel");
					that.getView().getModel("PurReqModel").setProperty("/PRtype", items);
					that.getView().getModel("PurReqModel").setProperty("/PRStatus", status);

				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});

			var oPieChart = this.getView().byId("idBarChartPR");
			oPieChart.setVizProperties({
				plotArea: {
					colorPalette: ['#03D9D4', '#CCFF66', '#FF0000', '#FFC300'],
					dataLabel: {
						showTotal: true,
						style: {
							color: "#ffffff"
						}

					},
					dataPointSize: {
						max: 17,
						min: 17
					},
					gridline: {
						color: "#BCBCBC"
					},
					gridline: {
						size: 0.1
					},

					dataPoint: {
						stroke: {
							visible: "false"
						}
					},

				},

				referenceLine: {
					line: {
						valueAxis: [{
							value: 50,
							size: 0.3,
							visible: false,
							label: {
								text: "Average Revenue",
								visible: false,
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

				categoryAxis: {
					labelRenderer: function (e) {
						e.styles.color = "#BCBCBC";
						e.styles.fontSize = "8px";

					},
					title: {
						style: {
							color: "#BCBCBC",
							fontSize: "9px"
						}
					},
					axisLine: {
						size: 0.1,

					}

				},
				valueAxis: {

					label: {
						style: {
							color: "#BCBCBC",
							fontSize: "11.2px"

						}
					},
					title: {
						style: {
							color: "#BCBCBC",
							fontSize: "11.2px"
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
					marker: {
						size: "0px"
					},
					visible: "true"
				},

				tooltip: {
					visible: true
				},
				title: {
					style: {
						color: "#ffffff"
					}
				}

			});
		},
		////////////////////////////////////PO
		loadPO: function () {

			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getPurchaseOrder")

			.done(function (data) {

					var POData = data.body.d.results;

					var oModelPO = new JSONModel(POData);
					that.getOwnerComponent().getModel("purOrderModel").setData(POData);
					var zdata = oModelPO.getData();
					var count_open = 0;
					var count_closed = 0;

					for (var i = 0; i < zdata.length; i++) {

						//	var rowData = oModelInvtry.getData().data[i];

						if (zdata[i].POSTATUS === "Open") {
							count_open++;
						} else if (zdata[i].POSTATUS === "Closed") {
							count_closed++;
						}
					}
					var invPieData = [];
					var input = {
						"STATUS": "Open",
						"number": count_open
					};
					invPieData.push(input);
					input = {
						"STATUS": "Closed",
						"number": count_closed
					};
					invPieData.push(input);

					var stringData = {
						"data": invPieData
					};

					var items = [

						{
							key: "1",
							text: "All Process"
						},

						{
							key: "2",
							text: "Company Code"
						}, {
							key: "3",
							text: "PO Number"
						}, {
							key: "4",
							text: "Material Number"
						}, {
							key: "5",
							text: "Vendor"
						}

					];
					var status = [

						{
							key: "1",
							text: " Open"

						},

						{
							key: "2",
							text: "Closed"
						}

					];

					var oModelPO = new JSONModel(stringData);
					//	that.getView().setModel(oModelSerNow);
					that.getView().byId("POPieChart").setModel(oModelPO, "POModel");
					that.getView().getModel("purOrderModel").setProperty("/POtype", items);
					that.getView().getModel("purOrderModel").setProperty("/POStatus", status);

				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});

			///////////////////////////EYPA Chart Properties
			var oPieChart = this.getView().byId("POPieChart");
			oPieChart.setVizProperties({
				plotArea: {
					colorPalette: ['#C981B2', '#FF6A5D'],
					/*colorPalette: ['#8CE8AD','#FFB46A','#FF6A5D'],*/
					dataLabel: {
						showTotal: true,
						style: {
							color: "#ffffff"
						}

					},
					dataPointSize: {
						max: 20,
						min: 20
					},
					tooltip: {
						visible: true
					},
					legend: {
						hoverSelectedShadow: {
							color: "#161C1F"
						},
						hoverShadow: {
							color: "#161C1F"
						},
						title: {
							text: "Material",
							visible: true,
							style: {
								color: "#BCBCBC"
							}
						},
						/*layout:{
							position: "right"
						},*/
						label: {
							style: {
								color: "#BCBCBC",
								fontSize: "8px"
							}
							/*	position: "side"*/
						}

					},
					legendGroup: {
						layout: {
							position: "right"
						}
						/*	title: {
								text: "Material",
								visible: true
							}*/
					}

				},

				categoryAxis: {
					labelRenderer: function (e) {
						e.styles.color = "#ffffff";

					},
					title: {
						style: {
							color: "#ffffff"
						}
					}

				},
				valueAxis: {

					label: {
						style: {
							color: "#ffffff"
						}
					},
					title: {
						style: {
							color: "#ffffff"
						}
					}

				},
				tooltip: {
					visible: true
				},
				title: {
					style: {
						color: "#ffffff"
					}
				},
				legend: {
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
					}
				},
				legendGroup: {
					layout: {
						position: "bottom"
					}
				},

			});

		},

		myOnClickPR: function (oEvent) {
			var VizUid = oEvent.getSource().getVizUid();
			var key = VizUid.slice(12);

			this._createViewInstance("inventory", key);

		},
		////////////////////////////////////GR
		loadGR: function () {
			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getGoodsReceipt")

			.done(function (data) {

					var GRData = data.body.d.results;

					var oModelGR = new JSONModel(GRData);
					that.getOwnerComponent().getModel("GoodRecieptModel").setData(GRData);
					var zdata = oModelGR.getData();
					var count_GR = 0;
					var count_ComDel = 0;
					var count_InComDel = 0;

					for (var i = 0; i < zdata.length; i++) {

						//	var rowData = oModelInvtry.getData().data[i];

						if (zdata[i].STATUS === "Delivery Complete") {
							count_ComDel++;
						} else if (zdata[i].STATUS === "Delivery Incomplete") {
							count_InComDel++;
						}
						count_GR++;
					}
					var GRChartData = [];
					var input = {
						"DeliveryComplete": count_ComDel,
						"DeliveryIncomplete": count_InComDel,
						"Total": count_GR
					};
					/*	var input = {
							"STATUS": "Delivery Complete",
							"number": count_ComDel
						};
						GRChartData.push(input);
						input = {
							"STATUS": "Delivery Incomplete",
							"number": count_InComDel
						};
						GRChartData.push(input);*/
					GRChartData.push(input);

					var items = [

						{
							key: "1",
							text: "All Good Receipts"
						}, {
							key: "2",
							text: "PO Number"
						}, {
							key: "3",
							text: "Material Number"
						}, {
							key: "4",
							text: "Plant"
						}

					];

					var stringData = {
						"data": GRChartData
					};
					var oModelGR = new JSONModel(stringData);
					//	that.getView().setModel(oModelSerNow);
					that.getView().byId("idBarChartGR").setModel(oModelGR, "GRModel");
					//	that.getView().byId("idBarChartAPR").setModel(oModelGR, "GRModel");
					that.getView().getModel("GoodRecieptModel").setProperty("/GRtype", items);

				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});

			var oVizFrame = this.getView().byId("idBarChartGR");

			oVizFrame.setVizProperties({
				plotArea: {
					colorPalette: ["#1EB7B2", "#F48323"],
					isRoundCorner: true,
					animation: {
						dataLoading: false
					},
					drawingEffect: sap.viz.ui5.types.VerticalBar_drawingEffect.glossy,
					// colorPalette: d3.scale.category20().range(),

					dataLabel: {
						showTotal: true,
						style: {
							color: "#BCBCBC"
						}

					},
					dataPointSize: {
						max: 17,
						min: 17
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

				categoryAxis: {
					labelRenderer: function (e) {
						e.styles.color = "#BCBCBC";

					},
					title: {

						style: {
							color: "#BCBCBC",
							fontSize: "10px"
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
							color: "#BCBCBC",
							fontSize: "10px"
						}
					}

				},
				tooltip: {
					visible: true
				},

				legend: {
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
					}
				},
				/*legendGroup: {
                               layout: {
                                      position: "right"
                                              }
                                         },*/

			});

		},
		loadIV: function () {
			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getInvoiceVerification")

			.done(function (data) {

					var IVData = data.body.d.results;

					var oModelIV = new JSONModel(IVData);
					that.getOwnerComponent().getModel("InvoiceModel").setData(IVData);
					var zdata = oModelIV.getData();

					var count_payProssed = 0;
					var count_payNotProssed = 0;

					for (var i = 0; i < zdata.length; i++) {

						//	var rowData = oModelInvtry.getData().data[i];

						if (zdata[i].INVOICEAMT === '' ||
							zdata[i].INVOICEAMT === null ||
							zdata[i].INVOICEAMT === undefined ||
							zdata[i].INVOICEAMT === "0"
						) {
							count_payNotProssed++;

						} else if (zdata[i].INVOICEAMT > 0) {
							count_payProssed++;
						}

					}
					var IVChartData = [];
					/*	var input = {
						    "PaymentProcessed"  : count_payProssed,
							"PaymentNotProcessed" : count_payNotProssed,
						
						};*/
					var input = {
						"STATUS": "Payment Processed",
						"number": count_payProssed
					};
					IVChartData.push(input);
					input = {
						"STATUS": "Payment Not Processed",
						"number": count_payNotProssed
					};

					IVChartData.push(input);

					var items = [

						{
							key: "1",
							text: "All Invoices"
						}, {
							key: "2",
							text: "PO Number"
						}, {
							key: "3",
							text: "Vendor"
						}

					];

					var stringData = {
						"data": IVChartData
					};
					var oModelIV = new JSONModel(stringData);
					//	that.getView().setModel(oModelSerNow);
					that.getView().byId("IVDonutChart").setModel(oModelIV, "IVModel");
					that.getView().getModel("InvoiceModel").setProperty("/IVtype", items);

				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});

			var oVizFrame = this.getView().byId("IVDonutChart");

			oVizFrame.setVizProperties({
				plotArea: {
					colorPalette: ["#1EB7B2", "#F48323"],
					isRoundCorner: true,
					animation: {
						dataLoading: false
					},
					drawingEffect: sap.viz.ui5.types.VerticalBar_drawingEffect.glossy,
					// colorPalette: d3.scale.category20().range(),

					dataLabel: {
						showTotal: true,
						style: {
							color: "#BCBCBC"
						}

					},
					dataPointSize: {
						max: 17,
						min: 17
					},
					dataPoint: {
						stroke: {
							visible: "false"
						}
					},

					gridline: {
						type: "dash"
					},
					gridline: {
						color: "#BCBCBC"
					},
					gridline: {
						size: 0
					},

				},

				categoryAxis: {
					labelRenderer: function (e) {
						e.styles.color = "#BCBCBC";

					},
					title: {
						style: {
							color: "#1EB7B2"
						}
					},
					hoverShadow: {
						color: "#161C1F"
					},
					mouseDownShadow: {
						color: "#161C1F"
					},

				},
				valueAxis: {

					label: {
						style: {
							color: "#BCBCBC"
						}
					},
					title: {

						style: {
							color: "#1EB7B2"
						}
					}

				},
				tooltip: {
					visible: true
				},

				legend: {
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

					isScrollable: true,
					visible: true,
					showFullLabel: true

				},
				legendGroup: {
					layout: {
						position: "bottom"
					}
				},

			});

		},

		loadAPR: function () {
			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getAutomaticPaymentRun")

			.done(function (data) {

					var APRData = data.body.d.results;

					var oModelIV = new JSONModel(APRData);
					that.getOwnerComponent().getModel("PaymentRunModel").setData(APRData);
					var zdata = oModelIV.getData();

					var count_payExecuted = 0;
					var count_payNotExecuted = 0;
					var count_APR = 0;

					for (var i = 0; i < zdata.length; i++) {

						//	var rowData = oModelInvtry.getData().data[i];

						if (zdata[i].AMOUNT_PAID === '' ||
							zdata[i].AMOUNT_PAID === null ||
							zdata[i].AMOUNT_PAID === undefined ||
							zdata[i].AMOUNT_PAID === "0"
						) {
							count_payNotExecuted++;

						} else if (parseInt(zdata[i].AMOUNT_PAID) > 0) {
							count_payExecuted++;
						}
						count_APR++;
					}
					var APRChartData = [];
					var input = {
						"PaymentProcessed": count_payExecuted,
						"PaymentNotProcessed": count_payNotExecuted,
						"Total": count_APR++

					};
					/*var input = {
						"STATUS": "Payment Executed",
						"number": count_payExecuted
					};
					APRChartData.push(input);
					input = {
						"STATUS": "Payment Not Executed",
						"number": count_payNotExecuted
					};
					*/
					APRChartData.push(input);

					var items = [

						{
							key: "1",
							text: "All Payments Run"
						}, {
							key: "2",
							text: "Company Code"
						}, {
							key: "3",
							text: "Vendor Number"
						}

					];

					var stringData = {
						"data": APRChartData
					};
					var oModelAPR = new JSONModel(stringData);
					//	that.getView().setModel(oModelSerNow);
					that.getView().byId("idBarChartAPR").setModel(oModelAPR, "APRModel");
					that.getView().getModel("PaymentRunModel").setProperty("/APRtype", items);

				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});

			var oVizFrame = this.getView().byId("idBarChartAPR");

			oVizFrame.setVizProperties({
				plotArea: {
					colorPalette: ["#1EB7B2", "#F48323"],
					isRoundCorner: true,
					animation: {
						dataLoading: false
					},
					drawingEffect: sap.viz.ui5.types.VerticalBar_drawingEffect.glossy,
					// colorPalette: d3.scale.category20().range(),

					dataLabel: {
						showTotal: true,
						style: {
							color: "#BCBCBC"
						}

					},
					dataPointSize: {
						max: 17,
						min: 17
					},
					gridline: {
						size: 0.1,
						color: "#BCBCBC",
						type: "dash"
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

				categoryAxis: {
					labelRenderer: function (e) {
						e.styles.color = "#BCBCBC";
						e.styles.fontSize = "6px";

					},
					title: {
						style: {
							color: "#BCBCBC",
							fontSize: "10px"
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
							color: "#BCBCBC",
							fontSize: "10px"
						}
					}

				},
				tooltip: {
					visible: true
				},

				legend: {
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
					}
				}

			});

		},

		onNotificationPressed: function () {

			jQuery.ajax("https://irpnodejsapp.cfapps.eu10.hana.ondemand.com/api/getInventoryNotification")

			.done(function (data) {

					var NotftnData = data.body;

					var oModelNF = new JSONModel(NotftnData);
					that.getOwnerComponent().getModel("NotificationModel").setData(NotftnData);
					var zdata = oModelNF.getData();

					var count_NF = 0;

					for (var i = 0; i < zdata.length; i++) {

						//	var rowData = oModelInvtry.getData().data[i];

						count_NF++;
					}

					that.getView().getModel("NotificationModel").setProperty("/NotificationCount", count_NF);

				})
				.fail(function (jqXHR, textStatus) {
					// that.errorMessage();
				})
				.always(function () {

				});

			var oView = that.getView();
			var oDialog = oView.byId("P2PDialog");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "ey.irp.IRPModule.view.NotificationDialog", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();

		},
		onCloseDialog: function () {
			this.getView().byId("P2PDialog").close();

		},

		handleLinkPress1: function (e) {
			var sStatus = e.getSource().getBindingContext("MonthEndTableModel").getObject().Status;

			if (!this.oSearchResultDialog) {
				this.openStatusDialog().then(function () {

					this.getModel("MonthEndTableModel").setProperty("/tokenNum", sStatus);

				}.bind(this));
			} else if (!this.oSearchResultDialog.isOpen()) {
				this.openStatusDialog();
				this.getModel("MonthEndTableModel").setProperty("/tokenNum", sStatus);

			} else {
				this.getModel("MonthEndTableModel").setProperty("/tokenNum", sStatus);
			}

		},
		handleLinkPress :function (oEvent) {
			var tCode = oEvent.getSource().getBindingContext("MonthEndTableModel").getObject().Tcode;
			var object = oEvent.getSource().getBindingContext("MonthEndTableModel").getObject().Object;
			var sStatus = oEvent.getSource().getBindingContext("MonthEndTableModel").getObject().Status;
			switch (tCode) {

			case "F-32":

				if (object === "CUSTOMER CLEARING-STANDARD") {
					that.getView().getModel("MonthEndUpdate").setProperty("/f32StdVisible", true);
					that.getView().getModel("MonthEndUpdate").setProperty("/f32PrtVisible", false);
					that.getView().getModel("MonthEndUpdate").setProperty("/f32ResVisible", false);
					that.getView().getModel("MonthEndUpdate").setProperty("/tcodeEntitySet", "Cust_Clearing_StdSet");
					that.getView().getModel("MonthEndUpdate").setProperty("/f32StdDataModel", {});
					that.getView().getModel("MonthEndUpdate").setProperty("/f32StdDataModel/NavCusClrStdToResult", [{}]);
				} else if (object === "CUSTOMER CLEARING-PARTIAL") {

					that.getView().getModel("MonthEndUpdate").setProperty("/f32StdVisible", false);
					that.getView().getModel("MonthEndUpdate").setProperty("/f32PrtVisible", true);
					that.getView().getModel("MonthEndUpdate").setProperty("/f32ResVisible", false);
					that.getView().getModel("MonthEndUpdate").setProperty("/tcodeEntitySet", "Cust_Clearing_PartSet");
					that.getView().getModel("MonthEndUpdate").setProperty("/f32PrtDataModel", {});
					that.getView().getModel("MonthEndUpdate").setProperty("/f32PrtDataModel/NavCusClrPartToResult", [{}]);
				} else if (object === "CUSTOMER CLEARING-RESIDUAL") {

					that.getView().getModel("MonthEndUpdate").setProperty("/f32StdVisible", false);
					that.getView().getModel("MonthEndUpdate").setProperty("/f32PrtVisible", false);
					that.getView().getModel("MonthEndUpdate").setProperty("/f32ResVisible", true);
					that.getView().getModel("MonthEndUpdate").setProperty("/tcodeEntitySet", "Cust_Clearing_ResSet");
					that.getView().getModel("MonthEndUpdate").setProperty("/f32ResDataModel", {});
					that.getView().getModel("MonthEndUpdate").setProperty("/f32ResDataModel/NavCusClrResToResult", [{}]);
				}

				that.getView().getModel("MonthEndUpdate").setProperty("/f44PrtVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44ResVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44StdVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/mr11Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/afabVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/mmpvVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/fbs1Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f81Visible", false);

				break;
			case "F-44":

				if (object === "VENDOR CLEARING-PARTIAL") {
					that.getView().getModel("MonthEndUpdate").setProperty("/f44PrtVisible", true);
					that.getView().getModel("MonthEndUpdate").setProperty("/f44StdVisible", false);
					that.getView().getModel("MonthEndUpdate").setProperty("/f44ResVisible", false);
					that.getView().getModel("MonthEndUpdate").setProperty("/tcodeEntitySet", "Vend_Clearing_PartSet");
					that.getView().getModel("MonthEndUpdate").setProperty("/f44PrtDataModel", {});
					that.getView().getModel("MonthEndUpdate").setProperty("/f44PrtDataModel/NavVendClrPartToResult", [{}]);
				} else if (object === "VENDOR CLEARING-RESIDUAL") {

					that.getView().getModel("MonthEndUpdate").setProperty("/f44PrtVisible", false);
					that.getView().getModel("MonthEndUpdate").setProperty("/f44StdVisible", false);
					that.getView().getModel("MonthEndUpdate").setProperty("/f44ResVisible", true);

					that.getView().getModel("MonthEndUpdate").setProperty("/tcodeEntitySet", "Vend_Clearing_ResSet");
					that.getView().getModel("MonthEndUpdate").setProperty("/f44ResDataModel", {});
					that.getView().getModel("MonthEndUpdate").setProperty("/f44ResDataModel/NavVendClrResToResult", [{}]);
				} else if (object === "VENDOR CLEARING-STANDARD") {
					that.getView().getModel("MonthEndUpdate").setProperty("/f44PrtVisible", false);
					that.getView().getModel("MonthEndUpdate").setProperty("/f44StdVisible", true);
					that.getView().getModel("MonthEndUpdate").setProperty("/f44ResVisible", false);

					that.getView().getModel("MonthEndUpdate").setProperty("/tcodeEntitySet", "Vend_Clearing_StdSet");
					that.getView().getModel("MonthEndUpdate").setProperty("/f44StdDataModel", {});
					that.getView().getModel("MonthEndUpdate").setProperty("/f44StdDataModel/NavVendClrStdToResult", [{}]);
				}

				that.getView().getModel("MonthEndUpdate").setProperty("/f32StdVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f32PrtVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f32ResVisible", false);

				that.getView().getModel("MonthEndUpdate").setProperty("/ob52Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/mr11Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/afabVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/mmpvVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/fbs1Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f81Visible", false);
				break;
			case "OB52":
				if (object === "FI PERIOD-OPEN") {
					that.getView().getModel("MonthEndUpdate").setProperty("/tcodeEntitySet", "Period_OpenSet");
					that.getView().getModel("MonthEndUpdate").setProperty("/ob52FiOpnDataModel", {});
					that.getView().getModel("MonthEndUpdate").setProperty("/ob52FiOpnDataModel/NavPeriodOpenToResult", [{}]);
				} else if (object === "FI PERIOD-CLOSE") {
					that.getView().getModel("MonthEndUpdate").setProperty("/tcodeEntitySet", "Period_CloseSet");
					that.getView().getModel("MonthEndUpdate").setProperty("/ob52FiClsDataModel", {});
					that.getView().getModel("MonthEndUpdate").setProperty("/ob52FiClsDataModel/NavPeriodCloseToResult", [{}]);
				}
				that.getView().getModel("MonthEndUpdate").setProperty("/f32StdVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f32PrtVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f32ResVisible", false);;
				that.getView().getModel("MonthEndUpdate").setProperty("/f44PrtVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44ResVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44StdVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52Visible", true);
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52OpenVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52ClsVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/mr11Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/afabVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/mmpvVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/fbs1Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f81Visible", false);

				break;

			case "MR11":
				if (object === "GR/IR CLEARING") {
					that.getView().getModel("MonthEndUpdate").setProperty("/tcodeEntitySet", "GR_IR_CLEARING_HSet");
					that.getView().getModel("MonthEndUpdate").setProperty("/mr11DataModel", {});
					that.getView().getModel("MonthEndUpdate").setProperty("/mr11DataModel/GRIR", [{}]);
					that.getView().getModel("MonthEndUpdate").setProperty("/mr11DataModel/GRIR/Result", [{}]);
					that.getView().getModel("MonthEndUpdate").setProperty("/mr11DataModel/PostingDate", "")

				}

				that.getView().getModel("MonthEndUpdate").setProperty("/f32StdVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f32PrtVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f32ResVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44PrtVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44ResVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44StdVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/mr11Visible", true);
				that.getView().getModel("MonthEndUpdate").setProperty("/afabVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/mmpvVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/fbs1Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f81Visible", false);
				break;
			case "AFAB":
				if (object === "DEPRECIATION POSTING") {
					that.getView().getModel("MonthEndUpdate").setProperty("/tcodeEntitySet", "Depreciation_PostingSet");
					that.getView().getModel("MonthEndUpdate").setProperty("/afabDataModel", {});
					that.getView().getModel("MonthEndUpdate").setProperty("/afabDataModel/NavDepPostingtoResult", [{}]);

				}

				that.getView().getModel("MonthEndUpdate").setProperty("/f32StdVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f32PrtVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f32ResVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44PrtVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44ResVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44StdVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/mr11Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/afabVisible", true);
				that.getView().getModel("MonthEndUpdate").setProperty("/mmpvVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/fbs1Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f81Visible", false);
				break;

			case "MMPV":
				if (object === "CLOSE MM PERIOD") {
					that.getView().getModel("MonthEndUpdate").setProperty("/tcodeEntitySet", "MM_PeriodSet");
					that.getView().getModel("MonthEndUpdate").setProperty("/mmpvDataModel", {});
					that.getView().getModel("MonthEndUpdate").setProperty("/mmpvDataModel/Result", [{}]);
				}

				that.getView().getModel("MonthEndUpdate").setProperty("/f32StdVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f32PrtVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f32ResVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44PrtVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44ResVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44StdVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/mr11Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/afabVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/mmpvVisible", true);
				that.getView().getModel("MonthEndUpdate").setProperty("/fbs1Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f81Visible", false);

				break;

			case "FBS1":
				if (object === "ACCURAL AND DEFERRAL POSTINGS") {
					that.getView().getModel("MonthEndUpdate").setProperty("/tcodeEntitySet", "Accrual_Deferral_PostSet");
					that.getView().getModel("MonthEndUpdate").setProperty("/fbs1DataModel", {});
					that.getView().getModel("MonthEndUpdate").setProperty("/fbs1DataModel/NavAccDeferToLine", [

						{
							"ItemNo_Acc": "",
							"GL_Account": "",
							"Amt_doccur": "",
							"CostCenter": "",
							"NavAccDeferLineToResult": [{}]
						}, {
							"ItemNo_Acc": "",
							"GL_Account": "",
							"Amt_doccur": "",
							"NavAccDeferLineToResult": [{}]
						}

					]);
				}
				that.getView().getModel("MonthEndUpdate").setProperty("/f32StdVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f32PrtVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f32ResVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44PrtVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44ResVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44StdVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/mr11Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/afabVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/mmpvVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/fbs1Visible", true);
				that.getView().getModel("MonthEndUpdate").setProperty("/f81Visible", false);
				break;

			case "F.81":
				if (object === "REVERSAL") {
					that.getView().getModel("MonthEndUpdate").setProperty("/tcodeEntitySet", "Accural_Deferral_ReverseSet");
					that.getView().getModel("MonthEndUpdate").setProperty("/f81DataModel", {});
					that.getView().getModel("MonthEndUpdate").setProperty("/f81DataModel/NavAccDeferRevPostReversal", [{}]);
				}
				that.getView().getModel("MonthEndUpdate").setProperty("/f32StdVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f32PrtVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f32ResVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44PrtVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44ResVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f44StdVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/mr11Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/afabVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/mmpvVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/fbs1Visible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/f81Visible", true);
				break;

			default:

			}

			/*month end activity fragment open task*/

			var blpreviwfrag = "ey.irp.IRPModule.fragment.success";
			if (!sap.ui.getCore().oblPreviewDialog) {
				sap.ui.getCore().oblPreviewDialog = sap.ui.xmlfragment(
					blpreviwfrag,
					this);
			}

			this.getView().addDependent(sap.ui.getCore().oblPreviewDialog);

			// var oModel = this.getView().getModel("MonthEndActivity");

			// oModel.read("/Month_End_ResultSet?", {
			// 	method: "GET",
			// 	success: function (data) {

			// 	},
			// 	error: function () {

			// 	}
			// });

			// sap.ui.getCore().oblPreviewDialog.open();
			that.getModel("MonthEndTableModel").setProperty("/tokenNum", tCode);
			/* end month end activity fragment open task*/
			this._createViewInstance("monthEndUpadte");
		},

		openStatusDialog: function () {

			return new Promise(function (resolve, reject) {
				if (!this.oStatusDialog) {
					Fragment.load({

						controller: this,
						id: this.getView().getId(),
						name: "ey.irp.IRPModule.fragment.success"
					}).then(function (oDialog) {
						this.oStatusDialog = oDialog;
						this.getView().addDependent(oDialog);
						oDialog.open();
						resolve();
					}.bind(this));
				} else {
					this.oStatusDialog.open();
					resolve();
				}
			}.bind(this));

		},
		onpressapproveClose: function () {
			// this.oStatusDialog.close();
		},
		searchTcode: function (oEvent) {
			var value = oEvent.getParameters().newValue;
			if (value === undefined) {
				value = oEvent.getParameters().query;
			}
			var oTable = this.getView().byId("idTableM");
			var filters = new Filter([
				new Filter("Object", FilterOperator.Contains, value),
				new Filter("Tcode", FilterOperator.Contains, value)
			], false);

			var andFilter = new sap.ui.model.Filter([filters], true);
			var aFilters = [];
			aFilters.push(andFilter);
			oTable.getBinding("items").filter(aFilters);

		},
		onPrevDate: function () {
			var curMonth = that.getView().getModel("MonthEndTableModel").getProperty("/curMonth");
			curMonth--;
			var date = new Date();

			date.setMonth(curMonth) - 1;
			var sMonth = date.toLocaleString("default", {
				month: "long"
			});;

			var year = date.getFullYear();

			var dateValue = `${sMonth} ${year}`

			that.getView().getModel("MonthEndTableModel").setProperty("/dateValue", dateValue);
			that.getView().getModel("MonthEndTableModel").setProperty("/curMonth", curMonth);
		},
		onNextDate: function () {

			var curMonth = that.getView().getModel("MonthEndTableModel").getProperty("/curMonth");
			curMonth++;
			var date = new Date();

			date.setMonth(curMonth) - 1;
			var sMonth = date.toLocaleString("default", {
				month: "long"
			});;

			var year = date.getFullYear();

			var dateValue = `${sMonth} ${year}`

			that.getView().getModel("MonthEndTableModel").setProperty("/dateValue", dateValue);
			that.getView().getModel("MonthEndTableModel").setProperty("/curMonth", curMonth);
		},
		onchange: function (oEvent) {
			var value = oEvent.getParameters().newValue;
			if (value === undefined || value === "All") {

				value = "";
			}
			var oTable = this.getView().byId("idTableM");
			var filters = new Filter([
				new Filter("Status", FilterOperator.Contains, value),

			], false);

			var andFilter = new sap.ui.model.Filter([filters], true);
			var aFilters = [];
			aFilters.push(andFilter);
			oTable.getBinding("items").filter(aFilters);
		},
		/////////////EYPA Ends//////////

		_createViewInstance: function (sView, data) {
			var navCon = this.byId("pageContainer");
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

		onBeforeRendering: function () {

		}

	});
});