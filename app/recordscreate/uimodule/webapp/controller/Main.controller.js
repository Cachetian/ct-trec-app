sap.ui.define(
  [
    "../core/BaseController",
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

    return Controller.extend("ct.trec.recordscreate.controller.Main", {
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
              checkInItemsEditable: false
            },
            state: {
              remoteEventHandlerRegistered: false
            },
            settings: {
              // eslint-disable-next-line camelcase
              use_remote_data: false
            }
          }),
          "view"
        );
        this.getRouter()
          .getRoute("routeMain")
          .attachMatched(this.handleQueryRouteMatched, this);
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
            text: "记录 ({view>/itemsCount})"
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
      },

      onTypedCheckIn: function (oEvent) {
        const data = {
          ID: this.getModel("tci").getProperty("/items").length,
          value: oEvent.getSource().getBindingContext("ckt").getObject().text,
          timestamp: new Date()
        };
        if (
          this.getModel("view").getProperty("/settings/use_remote_data") &&
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
                value: "{tci>comment}",
                placeholder: "备注"
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
