sap.ui.define(
  [
    "../core/BaseController",
    "sap/base/util/Deferred",
    "sap/ui/model/json/JSONModel",
    "sap/ui/util/Storage",
    "sap/m/MessageBox"
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
            deviceId: "",
            userId: "",
            ui: {},
            state: {},
            settings: {}
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
          if (data.ID) this.getModel("view").setProperty("/userId", data.ID);
          if (data.Scenarios)
            this.getOwnerComponent().getModel("csc").setData(data.Scenarios);
          if (data.Actions)
            this.getOwnerComponent().getModel("ckt").setData(data.Actions);
          if (data.Records)
            this.getOwnerComponent().getModel("tci").setData(data.Records);
        }
        this.getOwnerComponent()._bTrecInited = true;
      },

      onRecordPress: function () {
        this.navToW("routeRecordReadOnly");
      },

      onSettingPress: function () {
        this.navToW("routeSetting");
      },

      onTypedCheckIn: function (oEvent) {
        const data = {
          ID: this.getModel("tci").getProperty("/items").length,
          value: oEvent.getSource().getBindingContext("ckt").getObject().text,
          timestamp: new Date()
        };
        this.getModel("tci").getProperty("/items").push(data);
        this.getModel("tci").refresh();
        this._saveAllDataToStore();
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
            "sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--scenarioHeader"
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
        this._saveAllDataToStore();
      },

      onScenarios: function () {
        let scenariosSelect = new sap.m.Select({
          selectedKey: "csc>/selectedKey",
          items: {
            path: "csc>/scenarios",
            template: new sap.ui.core.Item({
              key: "{csc>text}",
              text: "{csc>text}"
            }),
            templateShareable: false
          },
          change: (oEvent) => {
            actionsListVb.bindElement({
              path: oEvent
                .getParameter("selectedItem")
                .getBindingContext("csc")
                .getPath(),
              model: "csc"
            });
          }
        });
        let actionsListVb = new sap.m.VBox({
          items: [
            new sap.m.HBox({
              alignItems: "Center",
              items: [
                new sap.m.Label({
                  text: "Text",
                  showColon: true,
                  width: "3rem"
                }),
                new sap.m.Input({ value: "{csc>text}" })
              ]
            }),
            new sap.m.List({
              mode: "Delete",
              delete: (oEvent) => {
                const ctx = actionsListVb.getBindingContext("csc");
                const array = ctx.getProperty("actions");
                const item = oEvent
                  .getParameter("listItem")
                  .getBindingContext("csc")
                  .getObject();
                const index = array.indexOf(item);
                array.splice(index, 1);
                ctx.getModel().setProperty("actions", array);
                ctx.getModel().refresh();
              },
              headerToolbar: new sap.m.OverflowToolbar({
                content: [
                  new sap.m.Title({ text: "actions" }),
                  new sap.m.ToolbarSpacer(),
                  new sap.m.Button({
                    text: "Add",
                    press: function (oEvent) {
                      let ctx = oEvent.getSource().getBindingContext("csc");
                      let actions = ctx.getProperty("actions");
                      let nextKey = "new" + actions.length;
                      actions.push({ text: nextKey });
                      ctx.getModel().refresh();
                    }
                  })
                ]
              }),
              items: {
                path: "csc>actions",
                template: new sap.m.InputListItem({
                  content: new sap.m.Input({ value: "{csc>text}" })
                }),
                templateShareable: false
              }
            })
          ]
        });
        let scenarioHeader = new sap.m.OverflowToolbar({
          content: [
            new sap.m.Title({ text: "Scenario" }),
            scenariosSelect,
            new sap.m.ToolbarSpacer(),
            new sap.m.Button({
              text: "Add",
              press: function () {
                let model = this.getModel("csc");
                let scenarios = model.getProperty("/scenarios");
                let nextKey = "new" + scenarios.length;
                scenarios.push({ text: nextKey, actions: [] });
                model.setProperty("/scenarios", scenarios);
                scenariosSelect.setSelectedKey(nextKey);
                scenariosSelect.fireChange({
                  selectedItem: scenariosSelect.getSelectedItem()
                });
              }
            }),
            new sap.m.Button({
              text: "Delete",
              press: () => {
                let ctx = actionsListVb.getBindingContext("csc");
                let model = ctx.getModel();
                let scenarios = model.getProperty("/scenarios");
                if (scenarios.length <= 1) {
                  sap.m.MessageToast.show("Nothing to delete");
                  return;
                }
                const item = ctx.getObject();
                const index = scenarios.indexOf(item);
                scenarios.splice(index, 1);
                model.setProperty("/scenarios", scenarios);
                scenariosSelect.setSelectedKey(scenarios[index - 1].text);
                scenariosSelect.fireChange({
                  selectedItem: scenariosSelect.getSelectedItem()
                });
              }
            })
          ]
        });
        let d = new sap.m.Dialog({
          showHeader: false,
          stretch: true,
          subHeader: scenarioHeader,
          content: [actionsListVb],
          afterClose: () => {
            this.getView().removeDependent(d);
            d.destroy();
            this._saveAllDataToStore();
          },
          buttons: [
            new sap.m.Button({
              text: "Confirm",
              type: sap.m.ButtonType.Emphasized,
              press: () => {
                // copy to check in types
                const actions = actionsListVb
                  .getBindingContext("csc")
                  .getProperty("actions");
                this.getModel("ckt").setProperty("/types", actions);
                this.getModel("ckt").refresh();
                d.close();
              }
            }),
            new sap.m.Button({
              text: "Cancel",
              press: () => {
                d.close();
              }
            })
          ]
        });
        d.addStyleClass(
          "sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--subHeader"
        );
        d.setModel(this.getModel("csc"), "csc");
        this.getView().addDependent(d);
        actionsListVb.bindElement({
          path: "/scenarios/0",
          model: "csc"
        });
        d.open();
      },

      onScenarioChange: function (oEvent) {
        const actions = oEvent
          .getParameter("selectedItem")
          .getBindingContext("csc")
          .getProperty("actions");
        this.getModel("ckt").setProperty("/types", actions);
        this.getModel("ckt").refresh();
      },

      onImportDataFromJson: function () {
        let ta = new sap.m.TextArea({
          width: "100%",
          rows: 34,
          growing: true
        });
        let d = new sap.m.Dialog({
          title: "Model Data",
          stretch: true,
          content: [ta],
          afterClose: () => {
            d.destroy();
          },
          buttons: [
            new sap.m.Button({
              text: "Confirm",
              type: sap.m.ButtonType.Emphasized,
              press: () => {
                const data = this._preProcessImport(JSON.parse(ta.getValue()));
                this.getModel("csc").setData(data.Scenarios);
                this.getModel("ckt").setData(data.Actions);
                this.getModel("tci").setData(data.Records);
                this._saveAllDataToStore();
                d.close();
              }
            }),
            new sap.m.Button({
              text: "Cancel",
              press: () => {
                d.close();
              }
            })
          ]
        });
        d.open();
      },

      onGetDeviceId: function () {
        let input = new sap.m.Input({
          value: this.getModel("view").getProperty("/userId")
        });
        let d = new sap.m.Dialog({
          title: "User ID",
          content: [input],
          afterClose: () => {
            this._saveAllDataToStore();
            d.destroy();
          },
          buttons: [
            new sap.m.Button({
              text: "Device ID",
              press: () => {
                this.getModel().read("/getDeviceId()", {
                  success: function (d) {
                    this.getModel("view").setProperty(
                      "/deviceId",
                      d.getDeviceId
                    );
                    sap.m.MessageToast.show("Device ID: " + d.getDeviceId);
                  }.bind(this)
                });
              }
            }),
            new sap.m.Button({
              text: "Confirm",
              type: sap.m.ButtonType.Emphasized,
              press: () => {
                this.getModel("view").setProperty("/userId", input.getValue());
                d.close();
              }
            }),
            new sap.m.Button({
              text: "Cancel",
              press: () => {
                d.close();
              }
            })
          ]
        });
        d.open();
      },

      onPushAllDataToUserDataStore: function () {
        const data = {
          data: btoa(
            encodeURIComponent(
              JSON.stringify({
                Scenarios: this.getModel("csc").getData().scenarios,
                Actions: this.getModel("ckt").getData().types,
                Records: this.getModel("tci").getData().items
              })
            )
          )
        };
        const userId = this.getModel("view").getProperty("/userId");
        if (userId) {
          data.ID = userId;
        }
        this.getModel().create("/UserDatas", data, {
          success: () => {
            sap.m.MessageToast.show("success");
          },
          error: (err) => {
            sap.m.MessageToast.show(`failed with msg: ${err.message}`);
          }
        });
      },

      onPullAllDataFromUserDataStore: function () {
        const DUMMY = "0";
        let ID = DUMMY;
        const userId = this.getModel("view").getProperty("/userId");
        if (userId) {
          ID = userId;
        }
        this.getModel().read("/UserDatas('" + ID + "')", {
          success: (d) => {
            const { Scenarios, Actions, Records } = JSON.parse(
              decodeURIComponent(atob(d.data))
            );
            const data = this._preProcessImport({
              Scenarios: { scenarios: Scenarios },
              Actions: { types: Actions },
              Records: { items: Records }
            });
            let recordsCount = data.Records.items.length;
            MessageBox.confirm("Found " + recordsCount + ", Sure?", {
              actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
              emphasizedAction: MessageBox.Action.OK,
              onClose: function (sAction) {
                if (sAction === MessageBox.Action.OK) {
                  this.getModel("csc").setData(data.Scenarios);
                  this.getModel("ckt").setData(data.Actions);
                  this.getModel("tci").setData(data.Records);
                }
              }.bind(this)
            });
          },
          error: (err) => {
            if (err.statusCode === "404") {
              sap.m.MessageToast.show(`Not found`);
              return;
            }
            sap.m.MessageToast.show(`failed with msg: ${err.message}`);
          }
        });
      },

      onRemoveUserDataStore: function () {
        this.getModel().remove("/UserDatas('0')", {
          success: () => {
            sap.m.MessageToast.show("success");
          },
          error: (err) => {
            sap.m.MessageToast.show(`failed with msg: ${err.message}`);
          }
        });
      },

      onTypesUpdateFinished: function (oEvent) {
        // update the master list object counter after new data is loaded
        this._updateTypesCount(oEvent.getParameter("total"));
      },

      onItemsUpdateFinished: function (oEvent) {
        // update the master list object counter after new data is loaded
        this._updateItemsCount(oEvent.getParameter("total"));
        this._saveAllDataToStore();
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

      _saveAllDataToStore: function () {
        const data = JSON.stringify({
          ID: this.getModel("view").getProperty("/userId"),
          Scenarios: this.getModel("csc").getData(),
          Actions: this.getModel("ckt").getData(),
          Records: this.getModel("tci").getData()
        });
        this.getStore().put("stored_data", data);
      },

      formatEmptyText: function (sText) {
        return sText ? sText : "No comment";
      }
    });
  }
);
