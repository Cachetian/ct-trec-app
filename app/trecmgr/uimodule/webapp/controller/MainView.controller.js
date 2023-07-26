sap.ui.define(
    ["./BaseController", "sap/ui/model/json/JSONModel", "sap/ui/util/Storage", "../core/eventQueue"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Storage, eventQueue) {
        "use strict";

        return Controller.extend("ct.trec.cttrecapp.controller.MainView", {
            onInit: function () {
                this.setModel(new JSONModel({
                    "message": "",
                    "settings": {
                        "use_remote_odata": false
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
                        eventQueue.register("complete", () => {
                            sap.m.MessageToast.show("success");
                        })
                        eventQueue.register("create-CheckInTypes", (data) => {
                            return new Promise((resolve, reject) => {
                                this.getModel().create("/CheckInTypes", data, {
                                    success: () => {
                                        resolve();
                                    },
                                    error: (err) => {
                                        sap.m.MessageToast.show(`failed with msg: ${err.message}`);
                                        reject();
                                    }
                                });
                            })
                        });
                        eventQueue.register("create-TypedCheckIns", (data) => {
                            return new Promise((resolve, reject) => {
                                this.getModel().create("/TypedCheckIns", data, {
                                    success: () => {
                                        resolve();
                                    },
                                    error: (err) => {
                                        sap.m.MessageToast.show(`failed with msg: ${err.message}`);
                                        reject();
                                    }
                                });
                            })
                        });
                    })
                } else {
                    this._oStorage = new Storage(Storage.Type.local, "trec_all_data");
                    const data = this._preProcessImport(JSON.parse(this._oStorage.get("stored_data")));
                    if (data) {
                        this.getOwnerComponent().getModel("ckt").setData(data.CheckInTypes);
                        this.getOwnerComponent().getModel("tci").setData(data.TypedCheckIns);
                    }
                }
            },

            onNewCheckInType: function () {
                const data = {
                    "ID": this.getModel("ckt").getProperty("/types").length,
                    "text": this.getModel("ckt").getProperty("/new/text")
                };
                if (this.getModel("view").getProperty("/settings/use_remote_odata")) {
                    eventQueue.emit({ event: "create-CheckInTypes", data: data });
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
                    eventQueue.emit({ event: "create-TypedCheckIns", data: data });
                }
                this.getModel("tci").getProperty("/items").push(data);
                this.getModel("tci").refresh();
            },

            onPushAllData: function () {
                if (this.getModel("view").getProperty("/settings/use_remote_odata")) {
                    const data = {
                        name: "pushAllData", value: JSON.stringify({
                            "CheckInTypes": this.getModel("ckt").getData().types,
                            "TypedCheckIns": this.getModel("tci").getData().items
                        })
                    }
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
                            const { CheckInTypes, TypedCheckIns } = JSON.parse(d.results[0].value);
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
                    "CheckInTypes": this.getModel("ckt").getData(),
                    "TypedCheckIns": this.getModel("tci").getData()
                });
                this._oStorage.put("stored_data", data);
            },

            onClearAllData: function () {
                this._oStorage.remove("stored_data");
                sap.m.MessageToast.show("cleared");
            },

            onExportAllData: function () {
                const data = {
                    "CheckInTypes": this.getModel("ckt").getData(),
                    "TypedCheckIns": this.getModel("tci").getData()
                };
                this.getModel("view").setProperty("/message", JSON.stringify(data, null, 2));
            },

            onImportAllData: function () {
                const data = this._preProcessImport(JSON.parse(this.getModel("view").getProperty("/message")));
                this.getModel("ckt").setData(data.CheckInTypes);
                this.getModel("tci").setData(data.TypedCheckIns);
            },

            onCheckInItemPress: function (oEvent) {
                const oBindingContext = oEvent.getSource().getBindingContext("tci");
                if (!this._dialog) {
                    this._dialog = new sap.m.Dialog({
                        title: 'Comment {tci>ID}',
                        content: [
                            new sap.m.Input({
                                value: "{tci>comment}"
                            })
                        ],
                        endButton: new sap.m.Button({
                            text: "X",
                            press: () => {
                                this._dialog.unbindElement();
                                this._dialog.close();
                            }
                        })
                    })
                    this._dialog.addStyleClass("sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--subHeader");
                }
                const dialog = this._dialog;
                dialog.setModel(this.getModel("tci"), "tci");
                dialog.bindElement({ path: oBindingContext.getPath(), model: "tci" });
                dialog.open();
            },

            onCopyMessage: function () {
                this.byId("msgTextArea").getDomRef().firstChild.firstChild.select();
                navigator.clipboard.writeText(this.getModel().getProperty("/message")).then(
                    () => {
                        sap.m.MessageToast.show(
                            "copied"
                        );
                    },
                    () => {
                        sap.m.MessageToast.show(
                            "copy failed"
                        );
                    }
                );
            },

            _preProcessImport: function (data) {
                if (data?.TypedCheckIns?.items) {
                    data.TypedCheckIns.items.forEach(it => {
                        it.timestamp = new Date(it.timestamp)
                    });
                }

                return data;
            },

            formatEmptyText: function (sText) {
                return sText ? sText : "-";
            }
        });
    }
);
