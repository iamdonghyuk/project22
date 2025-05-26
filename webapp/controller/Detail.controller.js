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
        const oRouter = UIComponent.getRouterFor(this);
        // this.oRouter = this.getOwnerComponent().getRouter();
        // "detail" 라우트와 연결
        oRouter
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
        // const oArgs = oEvent.getParameter("arguments");
        // const sProductId = oArgs.product;
        // const sLayout = oArgs.layout;
        var sPoId = oEvent.getParameter("arguments").PoId;
        var oDataModel = this.getOwnerComponent().getModel("poListModel");
        if (!oDataModel) {
          console.error("poListModel이 View에 바인딩되지 않았습니다.");
          return;
        }
        const oView = this.getView();
        console.log("뷰 이름:", oView.getId());

        // 아이템 데이터를 OData로 읽어서 JSONModel(poItemList)에 세팅
        //   oDataModel.read("/ZDCT_MM091Set", {
        //     filters: [new Filter("PoId", FilterOperator.EQ, sPoId)],
        //     success: function (oData) {
        //       var oJsonModel = new JSONModel();
        //       oJsonModel.setData({ ZDCT_MM091Set: oData.results });
        //       oView.setModel(oJsonModel, "poItemModel");
        //     },
        //     error: function () {
        //       MessageToast.show("구매오더 아이템 조회 실패");
        //     },
        //   }
        // );
        oDataModel.read("/ZDCT_MM091Set", {
          filters: [new Filter("PoId", FilterOperator.EQ, sPoId)],
          success: function (oData) {
            const aPoItems = oData.results;

            // 1. 자재 정보도 조회
            oDataModel.read("/ZDCT_MM010Set", {
              success: function (oMatData) {
                const aMatList = oMatData.results;

                // 2. 자재명을 PoItem에 붙이기
                aPoItems.forEach((item) => {
                  const oFoundMat = aMatList.find(
                    (mat) => mat.MatId === item.MatId
                  );
                  item.MatNm = oFoundMat ? oFoundMat.MatNm : "";
                });

                // 3. JSONModel로 세팅
                const oJsonModel = new JSONModel();
                oJsonModel.setData({ ZDCT_MM091Set: aPoItems });
                oView.setModel(oJsonModel, "poItemModel");
              },
              error: function () {
                MessageToast.show("자재 정보 조회 실패");
              },
            });
          },
          error: function () {
            MessageToast.show("구매오더 아이템 조회 실패");
          },
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
      },
    });
  }
);
