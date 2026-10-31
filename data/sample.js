/*
 * Fictional sample assessment for "Northwind Logistics" — a mid-sized company with a small
 * in-house SOC. Used by the "Load sample" button, by ?sample=1 and to generate
 * examples/northwind-sample.json. Nothing here describes a real organisation.
 */
(function (root, factory) {
  "use strict";
  var data = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = data;
  } else {
    root.SOC_MATURITY_SAMPLE = data;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  return {
    organisation: "Northwind Logistics",
    assessor: "SOC manager",
    assessment_date: "2026-10-15",
    answers: {
      "GOV-01": 1, "GOV-02": 1, "GOV-03": 2, "GOV-04": 1, "GOV-05": 2, "GOV-06": 1, "GOV-07": 2, "GOV-08": 2,
      "PPL-01": 2, "PPL-02": 1, "PPL-03": 1, "PPL-04": 1, "PPL-05": 2, "PPL-06": 0, "PPL-07": 1, "PPL-08": 0,
      "PRC-01": 2, "PRC-02": 2, "PRC-03": 3, "PRC-04": 1, "PRC-05": 2, "PRC-06": 0, "PRC-07": 1, "PRC-08": 1, "PRC-09": 1,
      "DET-01": 1, "DET-02": 1, "DET-03": 0, "DET-04": 1, "DET-05": 2, "DET-06": 1, "DET-07": 1, "DET-08": 1, "DET-09": 0,
      "IR-01": 2, "IR-02": 3, "IR-03": 1, "IR-04": 2, "IR-05": 2, "IR-06": 1, "IR-07": 1, "IR-08": 2,
      "TEC-01": 2, "TEC-02": 2, "TEC-03": 2, "TEC-04": 3, "TEC-05": 3, "TEC-06": 1, "TEC-07": 1, "TEC-08": 2
    },
    notes: {
      "GOV-01": "Draft charter written in Q2, waiting for CIO sign-off.",
      "PPL-06": "Two analysts left in the last 12 months; queue work is not rotated.",
      "PRC-03": "All alerts become cases in the ticketing tool; mandatory fields enforced since March.",
      "DET-03": "Rules live only in the SIEM console; export to a repository planned.",
      "IR-02": "SOC can isolate hosts in the EDR and revoke sessions without approval for P1/P2.",
      "TEC-06": "Cloud audit logs enabled but not forwarded to the SIEM."
    }
  };
});
