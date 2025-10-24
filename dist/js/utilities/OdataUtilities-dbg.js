sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (Object, MessageBox, JSONModel) {
	"use strict";
	return Object.extend("com.cuprum.zccbgs.js.utilities.OdataUtilities", {
		constructor: function () {
			
		},

        setAccountSetModel: function (oContext, oFilters){
            var oController = oContext;
			var oFilter = oFilters;

            var oModelAccountSet = oController.getView().getModel("oMCCBCatalog");
            console.log(oController.getView());
            return new Promise(function (resolve, reject) {

				oModelAccountSet.read("/AccountSet", {
					filters: oFilter,
					success: jQuery.proxy(function (mResponse) {
                        resolve(mResponse);
					}, oController),
					error: jQuery.proxy(function (mResponse) {
						reject(mResponse);
					}, oController)
				});
			});
        }

    });

});