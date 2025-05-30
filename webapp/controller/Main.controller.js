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
        // 1. OData 모델 세팅 (조회용)
        const oModel = new ODataModel("/sap/opu/odata/sap/ZDCMM_GW_002_SRV/");
        this.getView().setModel(oModel, "poListModel");

        // 2. 사용자 입력용 unnamed JSONModel 한 번만 세팅
        const oDefaultModel = this.getView().getModel();
        if (!oDefaultModel) {
          const oInputModel = new sap.ui.model.json.JSONModel({
            VendId: "",
            VendNm: "",
            PoId: "",
            PoDate: "",
          });
          oInputModel.setDefaultBindingMode("TwoWay");
          this.getView().setModel(oInputModel); // 이름 없이 설정 (입력값용)
        }

        // 3. 데이터 조회 및 병합
        oModel.read("/ZDCT_MM090Set", {
          success: (poData) => {
            const aPoList = poData.results;

            // 이 안에서만 병합 후 setData
            oModel.read("/ZDCT_MM020Set", {
              success: (vendorData) => {
                const aVendorList = vendorData.results;

                // 병합
                aPoList.forEach((po) => {
                  const oVendor = aVendorList.find(
                    (v) => v.VendId === po.VendId
                  );
                  po.VendNm = oVendor ? oVendor.VendNm : "";
                });

                // 병합된 데이터만 테이블에 반영
                const oPoListModel = this.getView().getModel("poListModel");
                if (oPoListModel && oPoListModel.setData) {
                  oPoListModel.setData({ ZDCT_MM090Set: aPoList });
                }

                // console.table(aPoList);
              },
              error: () => MessageToast.show("공급업체 정보 로딩 실패"),
            });
          },
          error: () => MessageToast.show("구매오더 목록 로딩 실패"),
        });

        // 4. 라우터 연결
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
        const oTable = this.getView().byId("poHeaderTable");
        const oSelectedItem = oTable.getSelectedItem();

        if (!oSelectedItem) {
          MessageToast.show("선택된 항목이 없습니다.");
          return;
        }

        const oContext = oSelectedItem.getBindingContext("poListModel");
        const oData = oContext.getObject();

        // 이미 병합된 VendNm을 그대로 사용
        this.getOwnerComponent().getRouter().navTo(
          "detail",
          {
            PoId: oData.PoId,
            PoTy: oData.PoTy,
            CompCode: oData.CompCode,
            VendId: oData.VendId,
            VendNm: oData.VendNm, // 이미 붙어 있음!
            PurOrgId: oData.PurOrgId,
            PurGrpId: oData.PurGrpId,
            PoDate: oData.PoDate,
            Currency: oData.Currency,
            GrStatus: oData.GrStatus,
          },
          true
        );
      },
      onSearch() {
        const aFilters = [];
        var sVendId = this.byId("VendId").getValue(),
          sVendNm = this.byId("VendNm").getValue(),
          sPoId = this.byId("PoId").getValue(),
          sPoDateS = this.byId("PoDateS").getValue(),
          sPoDateE = this.byId("PoDateE").getValue();

        if (sVendId)
          aFilters.push(
            new Filter("VendId", FilterOperator.Contains, sVendId)
          );
        if (sVendNm)
          aFilters.push(
            new Filter("VendNm", FilterOperator.Contains, sVendNm)
          );
        if (sPoId)
          aFilters.push(
            new Filter("PoId", FilterOperator.Contains, sPoId)
          );

        if (sPoDateS && sPoDateE) {
          aFilters.push(
            new Filter({
              filters: [
                new Filter("PoDateS", FilterOperator.GE, sPoDateS),
                new Filter("PoDateE", FilterOperator.LE, sPoDateE),
              ],
              and: true,
            })
          );
        } else if (sPoDateS) {
          aFilters.push(new Filter("PoDateS", FilterOperator.GE, sPoDateS));
        } else if (sPoDateE) {
          aFilters.push(new Filter("PoDateE", FilterOperator.LE, sPoDateE));
        }

        const oModel = this.getView().getModel("poListModel");
        oModel.read("/ZDCT_MM090Set", {
          filters: aFilters,
          success: (oData) => {
            const oResultModel = new JSONModel({
              ZDCT_MM090Set: oData.results,
            });
            this.getView().setModel(oResultModel, "poListModel"); // 이름 있는 모델만 교체
          },
          error: () => MessageToast.show("조회 중 오류 발생"),
        });
      },
    });
  }
);
