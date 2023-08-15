sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "ct/trec/recordscreate/model/formatter",
    "sap/ui/util/Storage",
    "sap/base/util/UriParameters",
    "../core/eventQueue"
  ],
  function (
    Controller,
    History,
    UIComponent,
    formatter,
    Storage,
    UriParameters,
    eventQueue
  ) {
    "use strict";

    return Controller.extend(
      "ct.trec.recordscreate.controller.BaseController",
      {
        formatter: formatter,

        /**
         * Convenience method for getting the view model by name in every controller of the application.
         * @public
         * @param {string} sName the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
          return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model in every controller of the application.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.core.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
          return this.getView().setModel(oModel, sName);
        },

        /**
         * Convenience method for getting the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Method for navigation to specific view
         * @public
         * @param {string} psTarget Parameter containing the string for the target navigation
         * @param {Object.<string, string>} pmParameters? Parameters for navigation
         * @param {boolean} pbReplace? Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
         */
        navTo: function (psTarget, pmParameters, pbReplace) {
          this.getRouter().navTo(psTarget, pmParameters, pbReplace);
        },

        navToW: function (psTarget, pbReplace) {
          const oQueryArgs = this.getOwnerComponent()._oRouterLastQueryArgs
          if (oQueryArgs)
            this.getRouter().navTo(psTarget, {
              "?query": oQueryArgs
            }, pbReplace);
          else
            this.getRouter().navTo(psTarget, {}, pbReplace);
        },

        getRouter: function () {
          return UIComponent.getRouterFor(this);
        },

        onNavBack: function () {
          const sPreviousHash = History.getInstance().getPreviousHash();

          if (sPreviousHash !== undefined) {
            window.history.back();
          } else {
            this.getRouter().navTo("routeMain", {}, true /* no history*/);
          }
        },

        getStore: function () {
          return this.getOwnerComponent()._oStorage;
        },

        handleQueryRouteMatched: function (oEvent) {
          const routeChanged = (oEvent.getParameter("name") !== this.getOwnerComponent()._sRouterLastRoute);
          const oArguments = oEvent.getParameter("arguments");
          oArguments["?query"] = oArguments["?query"] || {
            "use-remote-data": ""
          };

          let useRemoteDataChanged = false, useRemoteData = oArguments["?query"]["use-remote-data"];
          if (!useRemoteData) useRemoteData = "";
          if (
            useRemoteData &&
            (routeChanged || useRemoteData !== this.getOwnerComponent()._oRouterLastQueryArgs["use-remote-data"])
          ) {
            useRemoteDataChanged = true;
            this.getModel("view").setProperty("/settings/use_remote_data", useRemoteData === "true");
            this.onUseRemoteDataChanged();
            this.getOwnerComponent()._oRouterLastQueryArgs["use-remote-data"] = useRemoteData;
          }

          if (useRemoteDataChanged) {
            this.onRouteQueryChanged();
          }

          if (routeChanged)
            this.getOwnerComponent()._sRouterLastRoute = oEvent.getParameter("name");
        },

        onRouteQueryChanged: function () {
        },

        onUseRemoteDataChanged: function () {
          this.initModelDataOnce();
        },

        /**
         * Init model data once.
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
          if (this.getModel("view").getProperty("/settings/use_remote_data")) {
            // use remote data
            const oDataModel = this.getOwnerComponent().getModel();
            oDataModel.metadataLoaded(true).then(() => {
              oDataModel.read("/CheckInTypes", {
                success: (d) => {
                  this.getModel("ckt").setProperty("/types", d.results);
                }
              });
              oDataModel.read("/TypedCheckIns", {
                success: (d) => {
                  this.getModel("tci").setProperty("/items", d.results);
                }
              });
              eventQueue.register("complete", () => {
                sap.m.MessageToast.show("success");
              });
              eventQueue.register("create-CheckInTypes", (data) => {
                return new Promise((resolve, reject) => {
                  this.getModel().create("/CheckInTypes", data, {
                    success: () => {
                      resolve();
                    },
                    error: (err) => {
                      sap.m.MessageToast.show(
                        `failed with msg: ${err.message}`
                      );
                      reject();
                    }
                  });
                });
              });
              eventQueue.register("create-TypedCheckIns", (data) => {
                return new Promise((resolve, reject) => {
                  this.getModel().create("/TypedCheckIns", data, {
                    success: () => {
                      resolve();
                    },
                    error: (err) => {
                      sap.m.MessageToast.show(
                        `failed with msg: ${err.message}`
                      );
                      reject();
                    }
                  });
                });
              });
              this.getModel("view").setProperty(
                "/state/remoteEventHandlerRegistered",
                true
              );
            });
          } else {
            // use local data
            const data = this._preProcessImport(
              JSON.parse(this.getStore().get("stored_data"))
            );
            if (data) {
              this.getOwnerComponent()
                .getModel("ckt")
                .setData(data.CheckInTypes);
              this.getOwnerComponent()
                .getModel("tci")
                .setData(data.TypedCheckIns);
            }
          }
          this.getOwnerComponent()._bTrecInited = true;
        },

        _preProcessImport: function (data) {
          if (!data) {
            return;
          }
          if (data.TypedCheckIns.items) {
            data.TypedCheckIns.items.forEach((it) => {
              it.timestamp = new Date(it.timestamp);
            });
          }

          return data;
        }
      }
    );
  }
);
