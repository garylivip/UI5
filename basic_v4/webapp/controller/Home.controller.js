sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType"
], (Controller, JSONModel, MessageToast, MessageBox, Filter, Sorter, FilterOperator, FilterType) => {
    "use strict";

    return Controller.extend("ns.basicv4.controller.Home", {
        onInit() {
            let oJSONData = {busy: false, order: 0 };
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

        onSort() {
            let oView = this.getView();
            let aStates = [undefined, "asc", "desc"];
            let aSteteTextIds = ["sortNone", "sortAscending", "sortDescending"];
            let sMessage;
            let iOrder = oView.getModel("homeView").getProperty("/order");

            iOrder = (iOrder + 1) % aStates.length;
            let sOrder = aStates[iOrder];
            oView.getModel("homeView").setProperty("/order", iOrder);

            let oBinding = oView.byId("peopleList").getBinding("items");
            oBinding.sort(sOrder && new Sorter("LastName", sOrder === "desc"));

            sMessage = this._getText("sortMessage", [this._getText(aSteteTextIds[iOrder])]);
            MessageToast.show(sMessage);
        },

        onSearch() {
            let oView = this.getView();
            let sValue = oView.byId("searchField").getValue();
            let oFilter = new Filter("LastName", FilterOperator.Contains, sValue);
            let oBinding = oView.byId("peopleList").getBinding("items");
            oBinding.filter(oFilter, FilterType.Application);
        },

        _getText(sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        }
    });
});