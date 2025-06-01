sap.ui.define([], function () {
    "use strict";
    return {
      formatPurOrgNm: function (sPurOrgId) {
        switch (sPurOrgId) {
          case "O100": return "국내 구매조직";
          case "O200": return "해외 구매조직";
          default: return sPurOrgId;
        }
      },
  
      formatPurGrpNm: function (sPurGrpId, sPurOrgId) {
        if (sPurOrgId === "O100") {
          switch (sPurGrpId) {
            case "100": return "국내 원자재 구매그룹";
            case "200": return "국내 포장재 구매그룹";
            case "300": return "국내 서비스 구매그룹";
          }
        } else if (sPurOrgId === "O200") {
          switch (sPurGrpId) {
            case "100": return "해외 원자재 구매그룹";
            case "200": return "해외 포장재 구매그룹";
            case "300": return "해외 서비스 구매그룹";
          }
        }
        return sPurGrpId; // fallback
      }
    };
  });
  