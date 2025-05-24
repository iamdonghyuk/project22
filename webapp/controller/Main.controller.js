sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel",
  ],
  (Controller, JSONModel, MessageToast, Filter, FilterOperator, ODataModel) => {
    "use strict";

    return Controller.extend("sync.dc.mm.project22.controller.Main", {
      onInit() {
        var oModel = new ODataModel("/sap/opu/odata/sap/ZDCMM_GW_002_SRV/");
        this.getView().setModel(oModel, "poListModel");

        const oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("detail")
          .attachPatternMatched(this._onDetailMatched, this);
        oRouter
          .getRoute("detailDetail")
          .attachPatternMatched(this._onDetailDetailMatched, this);
        oRouter
          .getRoute("list")
          .attachPatternMatched(this._onListMatched, this);
      },
      onListItemPress() {
        var oTable = this.getView().byId("poHeaderTable");
        var oSelectedItem = oTable.getSelectedItem();

        if (!oSelectedItem) {
          MessageToast.show("선택된 항목이 없습니다.");
          return;
        }

        // manifest에 {}로 설정 시 필수값으로 됨
        // navTo()통해 페이지 이동하게 됨(마니페스트에 라우트에 네임에 정의된 것을 첫 번쨰 매개변수로)
        // 선택한 데이터 가져오기
        var oContext = oSelectedItem.getBindingContext("poListModel");
        var oData = oContext.getObject();
        this.getOwnerComponent().getRouter().navTo(
          "detail",
          {
            PoId: oData.PoId,
            PoTy: oData.PoTy,
            CompCode: oData.CompCode,
            VendId: oData.VendId,
            PurOrgId: oData.PurOrgId,
            PurGrpId: oData.PurGrpId,
            PoDate: oData.PoDate,
            Currency: oData.Currency,
            GrStatus: oData.GrStatus
          },
          true
        );

        console.log(this.getOwnerComponent().getRouter());
      },
    });
  }
);
