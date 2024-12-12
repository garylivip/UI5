sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
  ],
  (
    Controller,
    JSONModel,
    MessageToast,
    MessageBox,
    Filter,
    Sorter,
    FilterOperator,
    FilterType
  ) => {
    "use strict";

    return Controller.extend("ns.basicv4.controller.Home", {
      onInit() {
        let oMessageManager = sap.ui.getCore().getMessageManager();
        let oMessageModel = oMessageManager.getMessageModel();
        let oMessageModelBinding = oMessageModel.bindList(
          "/",
          undefined,
          [],
          new Filter("technical", FilterOperator.EQ, true)
        );
        let oViewModel = new JSONModel({
          busy: false,
          hasUIChanges: false,
          usernameEmpty: false,
          order: 0,
        });
        this.getView().setModel(oViewModel, "homeView");
        this.getView().setModel(oMessageModel, "message");

        oMessageModelBinding.attachChange(this.onMessageBindingChange, this);
        this._bTechnicalErrors = false;
      },

      onRefresh() {
        var oBinding = this.byId("peopleList").getBinding("items");
        if (oBinding.hasPendingChanges()) {
          MessageBox.error(this._getText("refreshNotPossibleMessage"));
          return;
        }
        oBinding.refresh();
        MessageToast.show(this._getText("refreshSuccessMessage"));
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

        sMessage = this._getText("sortMessage", [
          this._getText(aSteteTextIds[iOrder]),
        ]);
        MessageToast.show(sMessage);
      },

      onSearch() {
        let oView = this.getView();
        let sValue = oView.byId("searchField").getValue();
        let oFilter = new Filter("LastName", FilterOperator.Contains, sValue);
        let oBinding = oView.byId("peopleList").getBinding("items");
        oBinding.filter(oFilter, FilterType.Application);
      },

      onMessageBindingChange(oEvent) {
        let aContexts = oEvent.getSource().getContexts();
        let aMessages;
        let bMessageOpen = false;

        if (bMessageOpen || aContexts.length === 0) {
          return;
        }

        aMessages = aContexts.map((oContext) => {
          return oContext.getObject();
        });
        sap.ui.getCore().getMessageManager().removeMessages(aMessages);

        this._setUIChanges(true);
        this._bTechnicalErrors = false;
        MessageBox.error(aMessages[0].message, {
          id: "serviceErrorMessageBox",
          details: aMessages[0].description,
          actions: [MessageBox.Action.CLOSE],
          onClose: () => {
            bMessageOpen = false;
          },
        });
      },

      onCreate() {
        let oList = this.byId("peopleList");
        let oBinding = oList.getBinding("items");
        let oContext = oBinding.create({
          UserName: "",
          FirstName: "",
          LastName: "",
          Age: "18",
        });

        this._setUIChanges();
        this.getView().getModel("homeView").setProperty("/usernameEmpty", true);

        oList.getItems().some((oItem) => {
          if (oItem.getBindingContext() === oContext) {
            oItem.focus();
            oItem.setSelected(true);
            return true;
          }
        });
      },

      onSave() {
        console.log("save xxxxxxxxxxxxxxxxxxxxxx");

        var fnSuccess = function () {
          this._setBusy(false);
          MessageToast.show(this._getText("changesSentMessage"));
          this._setUIChanges(false);
        }.bind(this);

        var fnError = function () {
          this._setBusy(false);
          this._setUIChanges(false);
          MessageBox.error(oError.message);
        }.bind(this);

        this._setBusy(true); // Lock UI until submitBatch is resolved.
        this.getView()
          .getModel()
          .submitBatch("peopleGroup")
          .then(fnSuccess, fnError);
        this._bTechnicalErrors = false;
      },

      onResetChanges() {
        console.log("reset xxxxxxxxxxxxxxxxxxxxxx");

        this.byId("peopleList").getBinding("items").resetChanges();
        this._bTechnicalErrors = false;
        this._setUIChanges();
      },

      onInputChange(oEvent) {
        if (oEvent.getParameter("escPressed")) {
          this._setUIChanges();
        } else {
          if (
            oEvent
              .getSource()
              .getParent()
              .getBindingContext()
              .hasPendingChanges()
          ) {
            this.getView()
              .getModel("homeView")
              .setProperty("/usernameEmpty", false);
          }
        }
      },

      onDelete() {
        let oContext;
        let oSelected = this.byId("peopleList").getSelectedItem();
        let sUserName;

        if (oSelected) {
          oContext = oSelected.getBindingContext();
          sUserName = oContext.getProperty("UserName");

          oContext.delete("$auto").then(
            () => {
              MessageToast.show(
                this._getText("deletionSuccessMessage", [sUserName])
              );
            },
            (oError) => {
              this._setBusy();
              if (oError.canceled) {
                MessageToast.show(
                  this._getText("deletionRestoredMessage", [sUserName])
                );
                return;
              }
              MessageBox.error(oError.message);
            }
          );
          this._setUIChanges(true);
        }
      },

      onResetDataSource() {
        console.log("reset data sources xxxxxxxxxxxxxxxxxxxxxx");
        
        let oModel = this.getView().getModel();
        let oOperation = oModel.bindContext("/ResetDataSource(...)");
        oOperation.invoke().then(
          () => {
            oModel.refresh();
            MessageToast.show(this._getText("sourceResetSuccessMessage"));
          },
          (oError) => {
            MessageBox.error(oError.message);
          }
        );
      },

      onSelectionChange(oEvent) {
       this._setDetailArea(oEvent.getParameter("listItem").getBindingContext());
      },

      _setUIChanges(bHasUIChanges) {
        if (this._bTechnicalErrors) {
          bHasUIChanges = true;
        } else if (bHasUIChanges === undefined) {
          bHasUIChanges = this.getView().getModel().hasPendingChanges();
        }

        let oModel = this.getView().getModel("homeView");
        oModel.setProperty("/hasUIChanges", bHasUIChanges);
      },

      _getText(sKey, aArgs) {
        return this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle()
          .getText(sKey, aArgs);
      },

      _setBusy(bIsBusy) {
        let oModel = this.getView().getModel("homeView");
        oModel.setProperty("/busy", bIsBusy);
      },

      _setDetailArea(oUserContext) {
        let oDetailArea = this.byId("detailArea");
        let oLayout = this.byId("defaultLayout");
        let oSearchField = this.byId("searchField");
        console.log("oUserContext", oUserContext);
        
        oDetailArea.setBindingContext(oUserContext || null);
        oDetailArea.setVisible(!!oUserContext);
        oLayout.setSize(oUserContext ? "60%" : "100%");
        oLayout.setResizable(!!oUserContext);

        oSearchField.setWidth(oUserContext ? "40%" : "20%");

      }
    });
  }
);
