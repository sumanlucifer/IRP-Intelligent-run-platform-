sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
	"use strict";

	return {

		statusText: function (sStatus) {

			switch (sStatus) {
			case "F":
				return "Completed";
			case "P":
				return "Scheduled";
			case "R":
				return "Active";
			case "S":
				return "Released";
			case "A":
				return "Cancelled";

			default:
				return sStatus;
			}
		},






		/*added by deepanjali for month end activity task*/
		colorFormatter: function (value) {
			// switch (sStatus) {
			// case "success":
			// 	return "Success";

			// case "Failed":
			// 	return "Error";
			// case "04":
			// 	return "Error";
			// case "05":
			// 	return "Information";
			// case "06":
			// 	return "Information";

			// default:
			// 	return 'None';
			// }
			if (value === "Failed") {

				this.getView().addStyleClass("suman");
				this.getView().removeStyleClass("deep");
			} else if (value === "Success") {
				this.getView().addStyleClass("deep");
				this.getView().removeStyleClass("suman");
			}
			return value;
		},

		availableState: function (sStateValue) {
			var sStateValue = sStateValue.toLowerCase();

			switch (sStateValue) {
			case "Failed":
				return 3;
			case "Success":
				return 8;
			case "Pending":
				return 5;
			default:
				return sStateValue;
			}
		},

		statusTextSA: function (sStatus) {

			switch (sStatus) {
			case "01":
				return "Active";
			case "02":
				return "Passive";
			case "03":
				return "Shoutdown";
			case "04":
				return "Stop";
			case "05":
				return "Starting";

			default:
				return sStatus;
			}
		},

		statusTextSAHana: function (sStatus) {

			switch (sStatus) {
			case "YES":
				return "Active";
				// case "02":
				// 	return "Passive";
				// case "03":
				// 	return "Shoutdown";
				// case "04":
				// 	return "Stop";
				// case "05":
				// 	return "Starting";

			default:
				return sStatus;
			}
		},

		statusColorSA: function (sStatus) {

			switch (sStatus) {
			case "Active":
				return "Success";

			default:
				return 'None';
			}
		},

		statusColorSAHana: function (sStatus) {

			switch (sStatus) {
			case "YES":
				return "Success";
				// case "02":
				// 	return "Information";
				// case "03":
				// 	return "Success";
				// case "04":
				// 	return "Error";
				// case "05":
				// 	return "Information";

			default:
				return 'None';
			}
		},

		statusColor: function (sStatus) {

			switch (sStatus) {
			case "Completed":
				return "Success";
			case "Cancelled":
				return "Error";
			case "Scheduled":
				return "Success";
			case "Active":
				return "Error";
			case "Released":
				return "Information";

			default:
				return 'None';
			}
		},

		statusTextAS: function (sStatus) {

			switch (sStatus) {
			case "01":
				return "Active";
			case "02":
				return "Passive";
			case "03":
				return "Shut Down";
			case "04":
				return "Stop";
			case "05":
				return "Starting";
			case "06":
				return "Initial";

			default:
				return sStatus;
			}
		},

		statusTextASH: function (sStatus) {

			switch (sStatus) {
			case "Active":
				return "Success";
				// case "02":
				// 	return "Passive";
				// case "03":
				// 	return "Shut Down";
				// case "04":
				// 	return "Stop";
				// case "05":
				// 	return "Starting";
				// case "06":
				// 	return "Initial";

			default:
				return sStatus;
			}
		},

		statuscolorH: function (sStatus) {

			switch (sStatus) {
			case "Yes":
				return 8;
				// case "P":
				// 	return "Scheduled";
				// case "R":
				// 	return "Active";
				// case "S":
				// 	return "Released";
				// case "A":
				// 	return "Cancelled";

			default:
				return sStatus;
			}
		},

		statusColorInfoLabel: function (sStatus) {

			switch (sStatus) {
			case "01":
				return "Success";
			case "02":
				return "Success";
			case "03":
				return "Error";
			case "04":
				return "Error";
			case "05":
				return "Information";
			case "06":
				return "Information";

			default:
				return 'None';
			}
		},

		statusTextER: function (sStatus) {

			switch (sStatus) {
			case "E":
				return "Exclusive";
			case "S":
				return "Shared";
			case "X":
				return "eXclusive non-cumulative";
			case "O":
				return "Optimistic";

			default:
				return sStatus;
			}
		},

		dateValue: function (sValue) {

			if (sValue) {

				var oDateFormat = DateFormat.getDateTimeInstance({
					// pattern: "dd-MMM-YYYY"
					style: "medium",
					UTC: true
				});

				return oDateFormat.format(new Date(+sValue.split("(")[1].split(")")[0]));
			}

			return sValue;

		},

		removetime: function (value) {

			if (value !== null) {
				var formtValue = value;
				var formattedDate = new Date(parseInt(formtValue.substr(6)));

				var date = formattedDate.toLocaleDateString("pl-PL").split(".").reverse().join("-");
				return date;
			}

		},

		timeFormatter: function (sValue) {
			var time = '';
			if (sValue === null || sValue === undefined) {} else {
				for (var i = 0; i < sValue.length; i++) {
					if (i >= 2 && i <= 3) {
						time = time.concat(sValue.charAt(i))
					} else if (i === 4) {
						time = time.concat(":")
					} else if (i >= 5 && i <= 6) {
						time = time.concat(sValue.charAt(i))
					} else if (i === 7) {
						time = time.concat(":")
					} else if (i >= 8 && i <= 9) {
						time = time.concat(sValue.charAt(i))
					}
				}
				console.log(sValue)
				console.log(time)
				return (time);
			}
		},

		abapdate: function convert(str) {

			return str && str.split("T")[0];
			// var date = new Date(str),
			// 	mnth = ("0" + (date.getMonth() + 1)).slice(-2),
			// 	day = ("0" + date.getDate()).slice(-2);
			// var result = [date.getFullYear(), mnth, day].join("-");
			// return result;
		},

		newDate: function (ovalue) {
			var event = new Date(ovalue);

			let date = JSON.stringify(event)
			date = date.slice(1, 11);
			return date;
		},
		mdate: function (ovalue) {
			var odate = ovalue;
			var newdate = odate.split(" ")[0];
			return newdate;
		},

		graphText: function (sStatus) {
			switch (sStatus) {
			case "Sysid":
				return "Systems";
			default:
				return 'None';
			}
		},
		InvstatusText: function (sStatus) {

			switch (sStatus) {
			case "1":
				return "Below Reorder Level";
			case "2":
				return "Near Reorder Level";
			case "3":
				return "Above Reorder Level";

			}
		},

		PRItemCatText: function (sStatus) {

			switch (sStatus) {
			case "0":
				return "Standard";
			case "1":
				return "Limit";
			case "2":
				return "Consignment";
			case "3":
				return "Subcontracting";
			case "4":
				return "Material Unknown";
			case "5":
				return "Third Party";
			case "6":
				return "Text";
			case "7":
				return "Stock Transfer";
			case "8":
				return "Material Group";
			case "9":
				return "Service";

			}
		}

	};
});