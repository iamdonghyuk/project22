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

        // 구매오더 아이템 목록 조회
        oDataModel.read("/ZDCT_MM091Set", {
          filters: [new Filter("PoId", FilterOperator.EQ, sPoId)],
          success: (oData) => {
            const aPoItems = oData.results;

            // Step 1: 자재, 구매조직, 구매그룹 병렬 조회
            const fnAfterAllRead = () => {
              aPoItems.forEach((item) => {
                const oFoundMat = aMatList.find(
                  (mat) => mat.MatId === item.MatId
                );
                const oFoundOrg = aOrgList.find(
                  (org) => org.PurOrgId === item.PurOrgId
                );
                const oFoundGrp = aGrpList.find(
                  (grp) => grp.PurGrpId === item.PurGrpId
                );

                item.MatNm = oFoundMat ? oFoundMat.MatNm : "";
                item.PurOrgNm = oFoundOrg ? oFoundOrg.PurOrgNm : "";
                item.PurGrpNm = oFoundGrp ? oFoundGrp.PurGrpNm : "";

                console.log("  PoId      :", item.PoId);
                console.log("  MatId     :", item.MatId, "→", item.MatNm);
                console.log("  PurOrgId  :", item.PurOrgId, "→", item.PurOrgNm);
                console.log("  PurGrpId  :", item.PurGrpId, "→", item.PurGrpNm);
              });

              const oListModel = new JSONModel({ ZDCT_MM091Set: aPoItems });
              oView.setModel(oListModel, "poItemModel");

              const oSingleModel = new JSONModel(aPoItems[0]);
              oView.setModel(oSingleModel, "poItemList");
            };

            // Step 2: 각각 읽어오기
            let aMatList = [],
              aOrgList = [],
              aGrpList = [];

            oDataModel.read("/ZDCT_MM010Set", {
              success: (oMatData) => {
                aMatList = oMatData.results;
                // console.table(aMatList);

                oDataModel.read("/ZDCT_MM030Set", {
                  success: (oOrgData) => {
                    aOrgList = oOrgData.results;
                    // console.table(aOrgList);

                    oDataModel.read("/ZDCT_MM040Set", {
                      success: (oGrpData) => {
                        aGrpList = oGrpData.results;
                        // console.table(aGrpList);
                        fnAfterAllRead(); // 모든 데이터 로딩 후 병합 처리
                      },
                      error: () => MessageToast.show("구매그룹 정보 조회 실패"),
                    });
                  },
                  error: () => MessageToast.show("구매조직 정보 조회 실패"),
                });
              },
              error: () => MessageToast.show("자재 정보 조회 실패"),
            });
          },
          error: () => MessageToast.show("구매오더 아이템 조회 실패"),
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
