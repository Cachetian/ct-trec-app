sap.ui.define(
    ["sap/ui/model/json/JSONModel", "sap/ui/Device"],
    /**
     * provide app-view type models (as in the first "V" in MVVC)
     *
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     *
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     */
    function (JSONModel, Device) {
        "use strict";

        return {
            createDeviceModel: function () {
                const oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },
            createCheckScenariosModel: function () {
                const oModel = new JSONModel({ "new": { "text": "" }, "types": [{ "text": "Day" }] });
                oModel.setDefaultBindingMode("TwoWay");
                return oModel;
            },
            createCheckTypesModel: function () {
                const oModel = new JSONModel({ "new": { "text": "" }, "types": [{ "text": "Do" }] });
                oModel.setDefaultBindingMode("TwoWay");
                return oModel;
            },
            createTypedCheckInModel: function () {
                const oModel = new JSONModel({ "items": [{ "value": "Do", "timestamp": new Date() }] });
                oModel.setDefaultBindingMode("TwoWay");
                return oModel;
            }
        };
    }
);
