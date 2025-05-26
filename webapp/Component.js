sap.ui.define(
  ["sap/ui/core/UIComponent", "sync/dc/mm/project22/model/models"],
  (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("sync.dc.mm.project22.Component", {
      metadata: {
        manifest: "json",
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
      },

      init() {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);
        
        var oModel = new sap.ui.model.odata.v2.ODataModel(
          "/sap/opu/odata/sap/ZDCMM_GW_002_SRV/"
        );
        this.setModel(oModel, "poListModel"); // 전역으로 바인딩
        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        // enable routing
        this.getRouter().initialize();
      },
    });
  }
);
