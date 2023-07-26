sap.ui.define(["sap/ui/core/mvc/Controller"], function (BaseController) {
    "use strict";

    return BaseController.extend("ct.trec.cttrecapp.controller.App", {
        onInit() {
            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        },
    });
});
