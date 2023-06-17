sap.ui.define(["sap/ui/test/Opa5"], function (Opa5) {
    "use strict";

    return Opa5.extend("ct.trec.cttrecapp.test.integration.arrangements.Startup", {
        iStartMyApp: function () {
            this.iStartMyUIComponent({
                componentConfig: {
                    name: "ct.trec.cttrecapp",
                    async: true,
                    manifest: true,
                },
            });
        },
    });
});
