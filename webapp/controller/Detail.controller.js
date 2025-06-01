sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel",
  ],
  function (
    Controller,
    UIComponent,
    JSONModel,
    MessageToast,
    Filter,
    FilterOperator,
    ODataModel
  ) {
    "use strict";

    return Controller.extend("sync.dc.mm.project22.controller.Detail", {
      onInit: function () {
        // 라우터 객체 가져오기
        this.getOwnerComponent().getRouter()
          .getRoute("detail")
          .attachPatternMatched(this._onDetailMatched, this);
      },

      onGoBack: function () {
        this.oRouter.navTo("RouteMain", {}, true);
      },
      handleClose: function () {
        // var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
        this.getOwnerComponent().getRouter().navTo("RouteMain", {}, true);
      },
      /**
       * 라우터 경로가 "detail"일 때 실행되는 메서드
       */
      _onDetailMatched: function (oEvent) {
        const oArgs = oEvent.getParameter("arguments"); // 라우터에서 넘어온 파라미터
        const sPoId = oArgs.PoId;
        const sPurOrgId = oArgs.PurOrgId;
        const sPurGrpId = oArgs.PurGrpId;
      
        const oView = this.getView();
        const oModel = this.getOwnerComponent().getModel("poListModel");
      
        if (!oModel) {
          console.error("❌ poListModel 바인딩 안됨");
          return;
        }
      
        Promise.all([
          new Promise((resolve, reject) => {
            oModel.read("/ZDCT_MM091Set", {
              filters: [new Filter("PoId", FilterOperator.EQ, sPoId)],
              success: (oData) => resolve(oData.results),
              error: reject,
            });
          }),
          new Promise((resolve, reject) => {
            oModel.read("/ZDCT_MM030Set", {
              success: (oData) => resolve(oData.results),
              error: reject,
            });
          }),
          new Promise((resolve, reject) => {
            oModel.read("/ZDCT_MM040Set", {
              success: (oData) => resolve(oData.results),
              error: reject,
            });
          }),
          new Promise((resolve, reject) => {
            oModel.read("/ZDCT_MM010Set", {
              success: (oData) => resolve(oData.results), // ← 자재 마스터
              error: reject,
            });
          }),
        ])
        .then(([aPoItems, aOrgList, aGrpList, aMatList]) => {
          const oOrg = aOrgList.find((org) => org.PurOrgId === sPurOrgId);
          const oGrp = aGrpList.find((grp) => grp.PurGrpId === sPurGrpId);
        
          aPoItems.forEach((item) => {
            const org = aOrgList.find((o) => o.PurOrgId === item.PurOrgId);
            const grp = aGrpList.find((g) => g.PurGrpId === item.PurGrpId);
            const mat = aMatList.find((m) => m.MatId === item.MatId);
            item.PurOrgNm = org ? org.PurOrgNm : "";
            item.PurGrpNm = grp ? grp.PurGrpNm : "";
            item.MatNm = mat ? mat.MatNm : ""; // 자재명 추가
          });
        
          oView.setModel(new JSONModel({ ZDCT_MM091Set: aPoItems }), "poItemModel");
      
            const oHeaderModel = new JSONModel({
              PoId: sPoId,
              PoTy: oArgs.PoTy,
              CompCode: oArgs.CompCode,
              VendId: oArgs.VendId,
              VendNm: oArgs.VendNm,
              PoDate: oArgs.PoDate,
              Currency: oArgs.Currency,
              GrStatus: oArgs.GrStatus,
              PurOrgId: sPurOrgId,
              PurGrpId: sPurGrpId,
              PurOrgNm: oOrg ? oOrg.PurOrgNm : "구매조직 이름 없음",
              PurGrpNm: oGrp ? oGrp.PurGrpNm : "구매그룹 이름 없음",
            });
      
            oView.setModel(oHeaderModel, "poItemList");
            console.log("✅ 최종 poItemList:", oHeaderModel.getData());
          })
          .catch((err) => {
            MessageToast.show("데이터 조회 실패");
            console.error("❌ 데이터 조회 실패", err);
          });
      },

      onNavBack: function () {
        const oRouter = UIComponent.getRouterFor(this);
        const oFCL = this.getView().getParent().getParent(); // FlexibleColumnLayout 접근

        const sNextLayout = oFCL.getNextUIState(0).layout;

        oRouter.navTo("list", { layout: sNextLayout });
      },
    });
  }
);
