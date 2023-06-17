sap.ui.define(
    ["./BaseController"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("ct.trec.cttrecapp.controller.MainView", {
            onInit: function () {},

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
            }
        });
    }
);
