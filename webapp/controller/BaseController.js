sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.cuprum.zccbgs.controller.BaseController", {


        onInit: function(){
            console.log("BaseControler loaded");
        }

    });
});