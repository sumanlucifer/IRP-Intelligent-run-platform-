 var incNumber;
 var dbSys = {};
 var AppSys = {};
 var systems;
 var sysData;
 sap.ui.define([
 	"sap/ui/core/UIComponent",
 	"sap/ui/Device",
 	"ey/irp/IRPModule/model/models"
 ], function (UIComponent, Device, models) {
 	"use strict";

 	return UIComponent.extend("ey.irp.IRPModule.Component", {

 		metadata: {
 			manifest: "json"
 		},

 		init: function () {

 			UIComponent.prototype.init.apply(this, arguments);

 			this.getRouter().initialize();

 			this.setModel(models.createDeviceModel(), "device");

 			this.getChatBot();

 		},
 		getChatBot: function () {
 			//create the script tag as given in the global settings
 			if (!document.getElementById("cai-webchat")) {
 				var s = document.createElement("script");
 				s.setAttribute("id", "cai-webchat");
 				s.setAttribute("src", "https://cdn.cai.tools.sap/webchat/webchat.js");
 				document.body.appendChild(s);
 				s.setAttribute("channelId", "63f3144b-6af7-413d-99ed-15be96173daa");
 				s.setAttribute("token", "ad1484f926c2fbba83ec8f77b0127ad6");
 			}

 		}
 	});
 });