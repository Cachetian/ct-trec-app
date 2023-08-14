sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/util/Storage",
    "sap/base/util/UriParameters",
    "../core/eventQueue"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, Storage, UriParameters, eventQueue) {
    "use strict";

    return Controller.extend("ct.trec.recordscreate.controller.MainView", {
      onInit: function () {
        this.setModel(
          new JSONModel({
            message: "",
            messageCount: 0,
            ui: {
              cmdPanelExpanded: true,
              checkInTypesEditable: false,
              checkInItemsEditable: false
            },
            state: {
              remoteEventHandlerRegistered: false
            },
            settings: {
              // eslint-disable-next-line camelcase
              use_remote_odata: false
            }
          }),
          "view"
        );
        this.initModelData();
      },

      onHomePress: function () {
        this.navTo("routeMainView");
      },

      onNewCheckInType: function () {
        const text = this.getModel("ckt").getProperty("/new/text");
        if (!text) {
          return;
        }
        const data = {
          ID: this.getModel("ckt").getProperty("/types").length,
          text: text
        };
        if (
          this.getModel("view").getProperty("/settings/use_remote_odata") &&
          this.getModel("view").getProperty(
            "/state/remoteEventHandlerRegistered"
          )
        ) {
          eventQueue.emit({ event: "create-CheckInTypes", data: data });
        }
        this.getModel("ckt").getProperty("/types").push(data);
        this.getModel("ckt").setProperty("/new/text", "");
        this.getModel("ckt").refresh();
      },

      onEditCheckInTypes: function () {
        this.getModel("view").setProperty(
          "/ui/checkInTypesEditable",
          !this.getModel("view").getProperty("/ui/checkInTypesEditable")
        );
      },

      onDeleteCheckInType: function (oEvent) {
        const array = this.getModel("ckt").getProperty("/types");
        const item = oEvent
          .getParameter("listItem")
          .getBindingContext("ckt")
          .getObject();
        const index = array.indexOf(item);
        array.splice(index, 1);
        this.getModel("ckt").setProperty("/types", array);
      },

      onUpdateCheckInType: function (oEvent) {
        const oBindingContext = oEvent.getSource().getBindingContext("ckt");
        if (!this._chkDialog) {
          this._chkDialog = new sap.m.Dialog({
            title: "Text {ckt>ID}",
            content: [
              new sap.m.Input({
                value: "{ckt>text}"
              })
            ],
            endButton: new sap.m.Button({
              icon: "sap-icon://decline",
              press: () => this._chkDialog.close()
            }),
            afterClose: () => this._chkDialog.unbindElement()
          });
          this._chkDialog.addStyleClass(
            "sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--subHeader"
          );
        }
        const dialog = this._chkDialog;
        dialog.setModel(this.getModel("ckt"), "ckt");
        dialog.bindElement({ path: oBindingContext.getPath(), model: "ckt" });
        dialog.open();
      },

      onTypedCheckIn: function (oEvent) {
        const data = {
          ID: this.getModel("tci").getProperty("/items").length,
          value: oEvent.getSource().getBindingContext("ckt").getObject().text,
          timestamp: new Date()
        };
        if (
          this.getModel("view").getProperty("/settings/use_remote_odata") &&
          this.getModel("view").getProperty(
            "/state/remoteEventHandlerRegistered"
          )
        ) {
          eventQueue.emit({ event: "create-TypedCheckIns", data: data });
        }
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
                value: "{tci>comment}"
              })
            ],
            endButton: new sap.m.Button({
              icon: "sap-icon://decline",
              press: () => this._dialog.close()
            }),
            afterClose: () => this._dialog.unbindElement()
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

      onEditCheckInItems: function () {
        this.getModel("view").setProperty(
          "/ui/checkInItemsEditable",
          !this.getModel("view").getProperty("/ui/checkInItemsEditable")
        );
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

      onPushAllData: function () {
        if (this.getModel("view").getProperty("/settings/use_remote_odata")) {
          const data = {
            name: "pushAllData",
            value: JSON.stringify({
              CheckInTypes: this.getModel("ckt").getData().types,
              TypedCheckIns: this.getModel("tci").getData().items
            })
          };
          this.getModel().create("/AllDatas", data, {
            success: () => {
              sap.m.MessageToast.show("success");
            },
            error: (err) => {
              sap.m.MessageToast.show(`failed with msg: ${err.message}`);
            }
          });
        }
      },

      onPullAllData: function () {
        if (this.getModel("view").getProperty("/settings/use_remote_odata")) {
          this.getModel().read("/AllDatas", {
            success: (d) => {
              const { CheckInTypes, TypedCheckIns } = JSON.parse(
                d.results[0].value
              );
              const data = this._preProcessImport({
                CheckInTypes: { types: CheckInTypes },
                TypedCheckIns: { items: TypedCheckIns }
              });
              this.getModel("ckt").setData(data.CheckInTypes);
              this.getModel("tci").setData(data.TypedCheckIns);
            },
            error: (err) => {
              sap.m.MessageToast.show(`failed with msg: ${err.message}`);
            }
          });
        }
      },

      onStoreAllData: function () {
        const data = JSON.stringify({
          CheckInTypes: this.getModel("ckt").getData(),
          TypedCheckIns: this.getModel("tci").getData()
        });
        this.getStore().put("stored_data", data);
        sap.m.MessageToast.show("saved");
      },

      onClearAllData: function () {
        this.getStore().remove("stored_data");
        sap.m.MessageToast.show("cleared");
      },

      onReadAllData: function () {
        const data = this._preProcessImport(
          JSON.parse(this.getStore().get("stored_data"))
        );
        if (data) {
          this.getOwnerComponent().getModel("ckt").setData(data.CheckInTypes);
          this.getOwnerComponent().getModel("tci").setData(data.TypedCheckIns);
        }
      },

      onExportAllData: function () {
        const data = {
          CheckInTypes: this.getModel("ckt").getData(),
          TypedCheckIns: this.getModel("tci").getData()
        };
        this.getModel("view").setProperty(
          "/message",
          JSON.stringify(data, null, 2)
        );
      },

      onImportAllData: function () {
        const data = this._preProcessImport(
          JSON.parse(this.getModel("view").getProperty("/message"))
        );
        this.getModel("ckt").setData(data.CheckInTypes);
        this.getModel("tci").setData(data.TypedCheckIns);
      },

      onTypesUpdateFinished: function (oEvent) {
        // update the master list object counter after new data is loaded
        this._updateTypesCount(oEvent.getParameter("total"));
      },

      onItemsUpdateFinished: function (oEvent) {
        // update the master list object counter after new data is loaded
        this._updateItemsCount(oEvent.getParameter("total"));
      },

      onOpenMessage: function () {
        if (!this._msgDialog) {
          this._msgDialog = new sap.m.Dialog({
            stretch: true,
            customHeader: new sap.m.Toolbar({
              content: [
                new sap.m.Title({ text: "Message {view>messageCount}" }),
                new sap.m.ToolbarSpacer(),
                new sap.m.Button({
                  icon: "sap-icon://save",
                  press: () => this.onStoreAllData()
                }),
                new sap.m.Button({
                  text: "Export",
                  press: () => this.onExportAllData()
                }),
                new sap.m.Button({
                  text: "Import",
                  press: () => this.onImportAllData()
                })
              ]
            }),
            content: [
              new sap.m.TextArea({
                width: "100%",
                height: "100%",
                rows: 16,
                value: "{view>message}"
              })
            ],
            endButton: new sap.m.Button({
              icon: "sap-icon://decline",
              press: () => this._msgDialog.close()
            }),
            afterClose: () => this._msgDialog.unbindElement()
          });
          this._msgDialog.addStyleClass(
            "sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--subHeader"
          );
        }
        const dialog = this._msgDialog;
        dialog.setModel(this.getModel("view"), "view");
        dialog.bindElement({ path: "/", model: "view" });
        dialog.open();
      },

      onCopyMessage: function () {
        this.byId("msgTextArea").getDomRef().firstChild.firstChild.select();
        navigator.clipboard
          .writeText(this.getModel().getProperty("/message"))
          .then(
            () => {
              sap.m.MessageToast.show("copied");
            },
            () => {
              sap.m.MessageToast.show("copy failed");
            }
          );
      },

      getItemsByDateGroup: function (oContext) {
        return oContext.getProperty("timestamp").toLocaleDateString();
      },

      getItemsGroupByDateHeader: function (oGroup) {
        return new sap.m.GroupHeaderListItem({
          title: oGroup.key,
          upperCase: false
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
      }
    });
  }
);
