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

    return Controller.extend(
      "ct.trec.recordscreate.controller.RecordReadOnly",
      {
        onInit: function () {
          this.setModel(
            new JSONModel({
              itemsCount: 0,
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
          this.initModelDataOnce();
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

        _updateItemsCount: function (iTotalItems) {
          // only update the counter if the length is final
          if (this.byId("itemsList").getBinding("items").isLengthFinal()) {
            this.getModel("view").setProperty("/itemsCount", iTotalItems);
          }
        },

        formatEmptyText: function (sText) {
          return sText ? sText : "No comment";
        }
      }
    );
  }
);
