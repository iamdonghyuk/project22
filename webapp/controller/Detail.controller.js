sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
  "use strict";

  return Controller.extend("sync.dc.mm.project22.controller.Detail", {

    onInit: function () {
      // 라우터 객체 가져오기
      const oRouter = UIComponent.getRouterFor(this);
      // this.oRouter = this.getOwnerComponent().getRouter();
      // "detail" 라우트와 연결
      oRouter.getRoute("detail").attachPatternMatched(this._onDetailMatched, this);
    },

    onGoBack: function(){
      this.oRouter.navTo("RouteMain",{},true);
    },
    handleClose: function () {
			// var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.getOwnerComponent().getRouter().navTo("RouteMain", {}, true);
		},
    /**
     * 라우터 경로가 "detail"일 때 실행되는 메서드
     */
    _onDetailMatched: function (oEvent) {
      const oArgs = oEvent.getParameter("arguments");
      const sProductId = oArgs.product;
      const sLayout = oArgs.layout;

      // 예: 상세 데이터 바인딩
      const oView = this.getView();
      const oModel = this.getOwnerComponent().getModel("poItemList");

      // 바인딩 경로: /ProductCollection(productId)
      const sPath = `/ZDCT_MM091Set`;

      oView.bindElement({
        path: sPath,
        model: oModel
      });
    },

    /**
     * 뒤로 가기 또는 마스터로 돌아가기
     */
    onNavBack: function () {
      const oRouter = UIComponent.getRouterFor(this);
      const oFCL = this.getView().getParent().getParent(); // FlexibleColumnLayout 접근

      const sNextLayout = oFCL.getNextUIState(0).layout;

      oRouter.navTo("list", { layout: sNextLayout });
    }
  });
});
