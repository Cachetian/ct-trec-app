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
                    "message": ""
                }), "view");
            },

            onNewCheckInType: function () {
                this.getModel("ckt").getProperty("/types").push({
                    "text": this.getModel("ckt").getProperty("/new/text")
                });
                this.getModel("ckt").refresh();
            },

            onTypedCheckIn: function (oEvent) {
                this.getModel("tci").getProperty("/items").push({
                    "value": oEvent.getSource().getBindingContext("ckt").getObject().text,
                    "timestamp": new Date()
                });
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
