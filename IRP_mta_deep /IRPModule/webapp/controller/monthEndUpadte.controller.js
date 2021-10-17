sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"ey/irp/IRPModule/formatter/formatter",
	"sap/ui/core/Fragment"
], function (BaseController, JSONModel, formatter, Fragment) {
	"use strict";
	var that;
	return BaseController.extend("ey.irp.IRPModule.controller.monthEndUpadte", {
		formatter: formatter,

		onInit: function () {

			this.getView().addEventDelegate({
				onBeforeShow: function (evt) {

					that.getView().byId("radioTest").setSelectedIndex(null);

				}.bind(this),
				onAfterHide: function (evt) {

				}
			});
			that = this;

		},

		onValueHelpRequest: function (e) {
			var sValue = e.getSource().getName();

			var valueHelpName = sValue.split("-")[0];
			var F4EntitySet = sValue.split("-")[1];
			var F4HelpProperty = sValue.split("-")[2];
			this.ValueHelpProperty = F4HelpProperty;

			if (!this.oSearchResultDialog) {
				this.openSearchResultDialog(valueHelpName).then(function () {

					this.valueHelpServiceCal(F4EntitySet);

				}.bind(this));
			} else if (!this.oSearchResultDialog.isOpen()) {
				this.openSearchResultDialog(valueHelpName);
				this.valueHelpServiceCal(F4EntitySet);

			} else {
				this.valueHelpServiceCal(F4EntitySet);
			}

		},

		openSearchResultDialog: function (dialogView) {

			return new Promise(function (resolve, reject) {
				if (!this.oSearchResultDialog) {
					Fragment.load({

						controller: this,
						id: this.getView().getId(),
						name: `ey.irp.IRPModule.fragment.valuehelpFragments.${dialogView}`
					}).then(function (oDialog) {
						this.oSearchResultDialog = oDialog;
						this.getView().addDependent(oDialog);
						oDialog.open();
						resolve();
					}.bind(this));
				} else {
					this.oSearchResultDialog.open();
					resolve();
				}
			}.bind(this));

		},
		onPresswithoutMaterial: function () {

			if (this.oSearchResultDialog) {
				this.oSearchResultDialog.close();
				this.oSearchResultDialog.destroy();
				this.oSearchResultDialog = null;

			} else {
				this.oSearchResultDialog.close();
				this.oSearchResultDialog.destroy();
				this.oSearchResultDialog = null;
				this.oSearchResultDialog = undefined;
			}

		},

		valueHelpServiceCal: function (F4EntitySet) {
			var s = that.getView().getModel("MonthEndvaluehelp");

			s.read(`/${ F4EntitySet }?$format=json`, {
				method: "GET",
				success: function (data) {
					that.valueHelpResponse(data, F4EntitySet);
				},
				error: function () {

				}
			});

		},
		valueHelpResponse: function (data, F4EntitySet) {
			var data = data.results;
			that.getView().getModel("MonthEndUpdate").setSizeLimit(data.length);
			that.getView().getModel("MonthEndUpdate").setProperty(`/${ F4EntitySet }`, data);
		},

		onSelectList: function (eve) {
			var selected = eve.getParameter("listItem").mAggregations.cells[0].mProperties.text;
			var tcodeEntitySet = this.getView().getModel("MonthEndUpdate").getProperty("/tcodeEntitySet");

			switch (tcodeEntitySet) {
			case "Cust_Clearing_StdSet":

				that.getView().getModel("MonthEndUpdate").setProperty(`/f32StdDataModel/${ this.ValueHelpProperty }`, selected);

				break;
			case "Cust_Clearing_PartSet":
				that.getView().getModel("MonthEndUpdate").setProperty(`/f32PrtDataModel/${ this.ValueHelpProperty }`, selected);

				break;
			case "Cust_Clearing_ResSet":
				that.getView().getModel("MonthEndUpdate").setProperty(`/f32ResDataModel/${ this.ValueHelpProperty }`, selected);
				break;
			case "Vend_Clearing_PartSet":
				that.getView().getModel("MonthEndUpdate").setProperty(`/f44PrtDataModel/${ this.ValueHelpProperty }`, selected);

				break;
			case "Vend_Clearing_ResSet":

				that.getView().getModel("MonthEndUpdate").setProperty(`/f44ResDataModel/${ this.ValueHelpProperty }`, selected);
				break;
			case "Vend_Clearing_StdSet":

				that.getView().getModel("MonthEndUpdate").setProperty(`/f44StdDataModel/${ this.ValueHelpProperty }`, selected);
				break;
			case "Period_OpenSet":
				that.getView().getModel("MonthEndUpdate").setProperty(`/ob52FiOpnDataModel/${ this.ValueHelpProperty }`, selected);
				break;

			case "Period_CloseSet":

				that.getView().getModel("MonthEndUpdate").setProperty(`/ob52FiClsDataModel/${ this.ValueHelpProperty }`, selected);
				break;

			case "GR_IR_CLEARING_HSet":
				that.getView().getModel("MonthEndUpdate").setProperty(`/mr11DataModel/${ this.ValueHelpProperty }`, selected);

				break;

			case "Depreciation_PostingSet":
				that.getView().getModel("MonthEndUpdate").setProperty(`/afabDataModel/${ this.ValueHelpProperty }`, selected);
				break;

			case "MM_PeriodSet":

				that.getView().getModel("MonthEndUpdate").setProperty(`/mmpvDataModel/${ this.ValueHelpProperty }`, selected);
				break;

			case "Accrual_Deferral_PostSet":
				that.getView().getModel("MonthEndUpdate").setProperty(`/fbs1DataModel/${ this.ValueHelpProperty }`, selected);
				break;

			case "Accural_Deferral_ReverseSet":
				that.getView().getModel("MonthEndUpdate").setProperty(`/f81DataModel/${ this.ValueHelpProperty }`, selected);
				break;

			default:
			}
			this.onPresswithoutMaterial();

		},
		OnpressUpdate: function () {
			var tcodeEntitySet = this.getView().getModel("MonthEndUpdate").getProperty("/tcodeEntitySet");
			var tCodePayload = "";
			var oModel = this.getView().getModel("MonthEndActivity");

			switch (tcodeEntitySet) {
			case "Cust_Clearing_StdSet":
				tCodePayload = that.getView().getModel("MonthEndUpdate").getProperty("/f32StdDataModel");

				break;
			case "Cust_Clearing_PartSet":
				tCodePayload = that.getView().getModel("MonthEndUpdate").getProperty("/f32PrtDataModel");

				break;
			case "Cust_Clearing_ResSet":
				tCodePayload = that.getView().getModel("MonthEndUpdate").getProperty("/f32ResDataModel");

				break;
			case "Vend_Clearing_PartSet":
				tCodePayload = that.getView().getModel("MonthEndUpdate").getProperty("/f44PrtDataModel");

				break;
			case "Vend_Clearing_ResSet":
				tCodePayload = that.getView().getModel("MonthEndUpdate").getProperty("/f44ResDataModel");

				break;
			case "Vend_Clearing_StdSet":
				tCodePayload = that.getView().getModel("MonthEndUpdate").getProperty("/f44StdDataModel");

				break;
			case "Period_OpenSet":
				tCodePayload = that.getView().getModel("MonthEndUpdate").getProperty("/ob52FiOpnDataModel");

				break;

			case "Period_CloseSet":
				tCodePayload = that.getView().getModel("MonthEndUpdate").getProperty("/ob52FiClsDataModel");

				break;

			case "GR_IR_CLEARING_HSet":
				tCodePayload = that.getView().getModel("MonthEndUpdate").getProperty("/mr11DataModel");

				break;

			case "Depreciation_PostingSet":
				tCodePayload = that.getView().getModel("MonthEndUpdate").getProperty("/afabDataModel");

				break;

			case "MM_PeriodSet":
				tCodePayload = that.getView().getModel("MonthEndUpdate").getProperty("/mmpvDataModel");

				break;

			case "Accrual_Deferral_PostSet":
				tCodePayload = that.getView().getModel("MonthEndUpdate").getProperty("/fbs1DataModel");

				break;

			case "Accural_Deferral_ReverseSet":
				tCodePayload = that.getView().getModel("MonthEndUpdate").getProperty("/f81DataModel");

				break;

			default:
			}

			oModel.create(`/${ tcodeEntitySet }`, tCodePayload, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json"

				},
				success: function (data) {

				},
				error: function () {

				}
			});
		},

		onBackMonthend: function (oevent) {
			var navCon = oevent.getSource().getParent().getParent();
			navCon.back();
		},

		onBeforeRendering: function () {

		},

		onAfterRendering: function () {

		},

		onExit: function () {

		},
		onSelectPosting: function (eve) {

			var select = eve.getSource().getSelectedIndex();
			if (select === 0) {
				that.getView().getModel("MonthEndUpdate").setProperty("/tcodeEntitySet", "Period_OpenSet");
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52FiOpnDataModel", {});
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52FiOpnDataModel/NavPeriodOpenToResult", [{}])
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52OpenVisible", true);
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52ClsVisible", false);
			} else if (select === 1) {
				that.getView().getModel("MonthEndUpdate").setProperty("/tcodeEntitySet", "Period_CloseSet");
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52FiClsDataModel", {});
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52FiClsDataModel/NavPeriodCloseToResult", [{}]);
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52OpenVisible", false);
				that.getView().getModel("MonthEndUpdate").setProperty("/ob52ClsVisible", true);
			}

		}

	});

});