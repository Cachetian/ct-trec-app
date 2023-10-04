sap.ui.define(
  [
    "../core/BaseController",
    "sap/base/util/Deferred",
    "sap/ui/model/json/JSONModel",
    "sap/ui/util/Storage",
    "sap/m/MessageBox",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, Deferred, JSONModel, Storage, MessageBox) {
    "use strict";

    return Controller.extend("ct.trec.recordscreate.controller.OfflineCreate", {
      onInit: function () {
        this.setModel(
          new JSONModel({
            message: "",
            messageCount: 0,
            typesCount: 0,
            itemsCount: 0,
            ui: {
              cmdPanelExpanded: false,
              checkInTypesEditable: false,
              checkInItemsEditable: false,
            },
            state: {},
            settings: {},
          }),
          "view"
        );
        this.getRouter()
          .getRoute("offlineCreate")
          .attachMatched(this.handleQueryRouteMatched, this);
      },

      handleQueryRouteMatched: function (oEvent) {
        this.initModelDataOnce();
      },

      /**
       * Init model data once. (overwrited for offline only)
       */
      initModelDataOnce: function () {
        if (this.getOwnerComponent()._bTrecInited) {
          return;
        }
        // init
        this.getOwnerComponent()._oStorage = new Storage(
          Storage.Type.local,
          "trec_all_data"
        );

        // use local data
        const data = this._preProcessImport(
          JSON.parse(this.getStore().get("stored_data"))
        );
        if (data) {
          this.getOwnerComponent().getModel("ckt").setData(data.CheckInTypes);
          this.getOwnerComponent().getModel("tci").setData(data.TypedCheckIns);
        }
        // this.byId("itemsList").getHeaderToolbar().fireModelContextChange();
        // this.onTypesModelCtxChange();
        this.getOwnerComponent()._bTrecInited = true;
      },

      onRecordPress: function () {
        this.navToW("routeRecordReadOnly");
      },

      onSettingPress: function () {
        this.navToW("routeSetting");
      },

      onTypesModelCtxChange: function (oEvent) {
        if (!this._title) {
          this._title = new sap.m.Label({
            text: "记录 ({view>/itemsCount})",
          });
        }
        const toolbar = oEvent.getSource();
        // lasy
        const handleReqComp = () => {
          this.getOwnerComponent()
            .getModel()
            .detachRequestCompleted(handleReqComp);
          if (toolbar.indexOfContent(this._title) < 0) {
            toolbar.insertContent(this._title, 0);
          }
        };
        this.getOwnerComponent()
          .getModel()
          .attachRequestCompleted(handleReqComp, this);
        let deferred = new Deferred();
        deferred.promise.then(handleReqComp);
        setTimeout(() => {
          deferred.resolve();
        }, 200);
      },

      onTypedCheckIn: function (oEvent) {
        const data = {
          ID: this.getModel("tci").getProperty("/items").length,
          value: oEvent.getSource().getBindingContext("ckt").getObject().text,
          timestamp: new Date(),
        };
        this.getModel("tci").getProperty("/items").push(data);
        this.getModel("tci").refresh();
      },

      onCheckInItemPress: function (oEvent) {
        const oBindingContext = oEvent.getSource().getBindingContext("tci");
        if (!this._dialog) {
          this._dialog = new sap.m.Dialog({
            title: "Comment {tci>ID}",
            content: [
              new sap.m.Input({
                value: "{tci>comment}",
                placeholder: "备注",
              }),
            ],
            endButton: new sap.m.Button({
              icon: "sap-icon://decline",
              press: () => this._dialog.close(),
            }),
            afterClose: () => this._dialog.unbindElement(),
          });
          this._dialog.addStyleClass(
            "sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--subHeader"
          );
        }
        const dialog = this._dialog;
        dialog.setModel(this.getModel("tci"), "tci");
        dialog.bindElement({ path: oBindingContext.getPath(), model: "tci" });
        dialog.open();
      },

      onDeleteCheckInItem: function (oEvent) {
        const array = this.getModel("tci").getProperty("/items");
        const item = oEvent
          .getParameter("listItem")
          .getBindingContext("tci")
          .getObject();
        const index = array.indexOf(item);
        array.splice(index, 1);
        this.getModel("tci").setProperty("/items", array);
      },

      onPushAllDataToUserDataStore: function () {
        const data = {
          data: btoa(
            JSON.stringify({
              CheckInTypes: this.getModel("ckt").getData().types,
              TypedCheckIns: this.getModel("tci").getData().items,
            })
          ),
        };
        this.getModel().create("/UserDatas", data, {
          success: () => {
            sap.m.MessageToast.show("success");
          },
          error: (err) => {
            sap.m.MessageToast.show(`failed with msg: ${err.message}`);
          },
        });
      },

      onPullAllDataFromUserDataStore: function () {
        this.getModel().read("/UserDatas('0')", {
          success: (d) => {
            const { CheckInTypes, TypedCheckIns } = JSON.parse(atob(d.data));
            const data = this._preProcessImport({
              CheckInTypes: { types: CheckInTypes },
              TypedCheckIns: { items: TypedCheckIns },
            });
            let recordsCount = data.TypedCheckIns.items.length;
            MessageBox.confirm("Found " + recordsCount + ", Sure?", {
              actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
              emphasizedAction: MessageBox.Action.OK,
              onClose: function (sAction) {
                if (sAction === MessageBox.Action.OK) {
                  this.getModel("ckt").setData(data.CheckInTypes);
                  this.getModel("tci").setData(data.TypedCheckIns);
                }
              }.bind(this),
            });
          },
          error: (err) => {
            if (err.statusCode === "404") {
              sap.m.MessageToast.show(`Not found`);
              return;
            }
            sap.m.MessageToast.show(`failed with msg: ${err.message}`);
          },
        });
      },

      onRemoveUserDataStore: function () {
        this.getModel().remove("/UserDatas('0')", {
          success: () => {
            sap.m.MessageToast.show("success");
          },
          error: (err) => {
            sap.m.MessageToast.show(`failed with msg: ${err.message}`);
          },
        });
      },

      onTypesUpdateFinished: function (oEvent) {
        // update the master list object counter after new data is loaded
        this._updateTypesCount(oEvent.getParameter("total"));
      },

      onItemsUpdateFinished: function (oEvent) {
        // update the master list object counter after new data is loaded
        this._updateItemsCount(oEvent.getParameter("total"));
      },

      getItemsByDateGroup: function (oContext) {
        return oContext.getProperty("timestamp").toLocaleDateString();
      },

      getItemsGroupByDateHeader: function (oGroup) {
        return new sap.m.GroupHeaderListItem({
          title: oGroup.key,
          upperCase: false,
        });
      },

      _updateTypesCount: function (iTotalItems) {
        // only update the counter if the length is final
        if (this.byId("typesList").getBinding("items").isLengthFinal()) {
          this.getModel("view").setProperty("/typesCount", iTotalItems);
        }
      },

      _updateItemsCount: function (iTotalItems) {
        // only update the counter if the length is final
        if (this.byId("itemsList").getBinding("items").isLengthFinal()) {
          this.getModel("view").setProperty("/itemsCount", iTotalItems);
        }
      },

      formatEmptyText: function (sText) {
        return sText ? sText : "No comment";
      },
    });
  }
);
