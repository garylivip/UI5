sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller,JSONModel,MessageToast,MessageBox) => {
    "use strict";

    return Controller.extend("ns.basicv4.controller.Home", {
        onInit() {
            let oJSONData = {busy: false};
            let oModel = new JSONModel(oJSONData);
            this.getView().setModel(oModel, "homeView");
        },

        onRefresh() {
            var oBinding = this.byId("peopleList").getBinding("items");
            if (oBinding.hasPendingChanges()) {
                MessageBox.error(this._getText("refreshNotPossibleMessage"));
                return;
            }
            oBinding.refresh();
            MessageToast.show(this._getText("refreshSuccessMessage"))
        },

        _getText(sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        }
    });
});