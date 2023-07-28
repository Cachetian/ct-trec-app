sap.ui.define(["sap/ui/test/Opa5"], function (Opa5) {
    "use strict";

    return Opa5.extend("ct.trec.trecmgr.test.integration.arrangements.Startup", {
        iStartMyApp: function () {
            this.iStartMyUIComponent({
                componentConfig: {
                    name: "ct.trec.trecmgr",
                    async: true,
                    manifest: true,
                },
            });
        },
    });
});
