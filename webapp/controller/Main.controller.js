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
        const oODataModel = new ODataModel(
          "/sap/opu/odata/sap/ZDCMM_GW_002_SRV/"
        );

        this.getView().setModel(oODataModel, "poListModel");

        // 2. 사용자 입력용 unnamed JSONModel 한 번만 세팅
        const oDefaultModel = this.getView().getModel();
        if (!oDefaultModel) {
          const oInputModel = new JSONModel({
            VendId: "",
            VendNm: "",
            PoId: "",
            PoDate: "",
          });
          oInputModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
          this.getView().setModel(oInputModel); // 이름 없이 설정
        }

        // 3. 데이터 조회 및 병합
        oODataModel.read("/ZDCT_MM090Set", {
          success: (poData) => {
            const aPoList = poData.results;

            oODataModel.read("/ZDCT_MM020Set", {
              success: (vendorData) => {
                const aVendorList = vendorData.results;

                // 병합: 각 PO에 해당하는 공급업체 이름 삽입
                aPoList.forEach((po) => {
                  const oVendor = aVendorList.find(
                    (v) => v.VendId === po.VendId
                  );
                  po.VendNm = oVendor ? oVendor.VendNm : "";
                });

                // JSONModel로 다시 세팅
                const oMergedModel = new JSONModel({
                  ZDCT_MM090Set: aPoList,
                });
                this.getView().setModel(oMergedModel, "poListModel");
                this.getView().setModel(oMergedModel, "originalModel");

                console.log(
                  "▶ 병합된 모델로 재설정된 데이터:",
                  oMergedModel.getData()
                );
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
            PurOrgId: oData.PurOrgId,
            PurGrpId: oData.PurGrpId,
            PoTy: oData.PoTy,
            CompCode: oData.CompCode,
            VendId: oData.VendId,
            VendNm: oData.VendNm, 
            PoDate: oData.PoDate,
            Currency: oData.Currency,
            GrStatus: oData.GrStatus,
          },
          true
        );
      },
      onSearch: function () {
        const sVendId = this.byId("VendId").getValue()?.trim();
        const sVendNm = this.byId("VendNm").getValue()?.trim();
        const sPoId = this.byId("PoId").getValue()?.trim();
        const sPoDateS = this.byId("PoDateS").getDateValue(); // Date 객체
        const sPoDateE = this.byId("PoDateE").getDateValue();
      
        const oOriginalModel = this.getView().getModel("originalModel");
      
        if (!oOriginalModel) {
          console.error("❌ originalModel이 세팅되지 않았습니다.");
          MessageToast.show("초기 데이터를 불러오지 못했습니다.");
          return;
        }
      
        const aAllData = oOriginalModel.getProperty("/ZDCT_MM090Set") || [];
      
        const aFiltered = aAllData.filter((item) => {
          const bVendIdOk = !sVendId || item.VendId.includes(sVendId);
          const bVendNmOk = !sVendNm || item.VendNm.includes(sVendNm);
          const bPoIdOk = !sPoId || item.PoId.includes(sPoId);
      
          const itemDate = new Date(item.PoDate);
          const bPoDateOk =
            (!sPoDateS || itemDate >= sPoDateS) &&
            (!sPoDateE || itemDate <= sPoDateE);
      
          return bVendIdOk && bVendNmOk && bPoIdOk && bPoDateOk;
        });
      
        // 결과를 poListModel에 덮어쓰기
        const oFilteredModel = new sap.ui.model.json.JSONModel({
          ZDCT_MM090Set: aFiltered,
        });
      
        this.getView().setModel(oFilteredModel, "poListModel");
      }
 
      ,
    });
  }
);
