sap.ui.define(
    ["./BaseController", "sap/ui/model/json/JSONModel"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("ct.trec.cttrecapp.controller.MainView", {
            onInit: function () {
                this.setModel(new JSONModel({
                    "message": "",
                    "settings": {
                        "use_remote_odata": true
                    }
                }), "view");
                if (this.getModel("view").getProperty("/settings/use_remote_odata")) {
                    const oDataModel = this.getOwnerComponent().getModel();
                    oDataModel.metadataLoaded(true).then(() => {
                        oDataModel.read("/CheckInTypes", {
                            success: (d) => {
                                this.getModel("ckt").setProperty("/types", d.results);
                            }
                        })
                        oDataModel.read("/TypedCheckIns", {
                            success: (d) => {
                                this.getModel("tci").setProperty("/items", d.results);
                            }
                        })
                    })
                }
            },

            onNewCheckInType: function () {
                const data = {
                    "ID": this.getModel("ckt").getProperty("/types").length,
                    "text": this.getModel("ckt").getProperty("/new/text")
                };
                if (this.getModel("view").getProperty("/settings/use_remote_odata")) {
                    this.getModel().create("/CheckInTypes", data, {
                        success: () => {
                            sap.m.MessageToast.show("success")
                        },
                        error: () => {
                            sap.m.MessageToast.show("failed")
                        }
                    });
                }
                this.getModel("ckt").getProperty("/types").push(data);
                this.getModel("ckt").refresh();
            },

            onTypedCheckIn: function (oEvent) {
                const data = {
                    "ID": this.getModel("tci").getProperty("/items").length,
                    "value": oEvent.getSource().getBindingContext("ckt").getObject().text,
                    "timestamp": new Date()
                }
                if (this.getModel("view").getProperty("/settings/use_remote_odata")) {
                    this.getModel().create("/TypedCheckIns", data, {
                        success: () => {
                            sap.m.MessageToast.show("success")
                        },
                        error: () => {
                            sap.m.MessageToast.show("failed")
                        }
                    });
                }
                this.getModel("tci").getProperty("/items").push(data);
                this.getModel("tci").refresh();
            },

            onExportAllData: function () {
                const data = {
                    "CheckInTypes": this.getModel("ckt").getData(),
                    "TypedCheckIns": this.getModel("tci").getData()
                };
                this.getModel("view").setProperty("/message", JSON.stringify(data, null, 2));
            },

            onImportAllData: function () {
                const data = JSON.parse(this.getModel("view").getProperty("/message"));
                this.getModel("ckt").setData(data.CheckInTypes);
                this.getModel("tci").setData(data.TypedCheckIns);
            }
        });
    }
);
