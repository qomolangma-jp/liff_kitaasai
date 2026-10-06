(function (global) {
  var SHARED_GAS_URL = "https://script.google.com/macros/s/AKfycbzBGrqCSgNJGRuSuYeWwS4_DGzQJ46YJ0yVXRjEUKbejZyr9q5tmyGPhTSwjw6fHNU/exec";

  var PAGE_CONFIGS = {
    profile: {
      liffId: "2008962357-ePaQmDO9",
      gasUrl: SHARED_GAS_URL
    },
    bookroom: {
      liffId: "2008962357-gLXhtSi2",
      gasUrl: SHARED_GAS_URL
    },
    notice: {
      liffId: "2008962357-JxnIosW0",
      gasUrl: SHARED_GAS_URL,
      registerFormUrl: "https://liff.line.me/2008962357-ePaQmDO9"
    },
    attendance: {
      liffId: "2008962357-BPpzfTB9",
      gasUrl: SHARED_GAS_URL
    },
  };

  function getPageConfig(pageKey) {
    var key = String(pageKey || "").trim();
    return PAGE_CONFIGS[key] || {};
  }

  function getRequiredPageConfig(pageKey) {
    var key = String(pageKey || "").trim();
    var config = PAGE_CONFIGS[key] || {};
    if (!config.liffId || !config.gasUrl) {
      throw new Error("AppConfig is missing required config for page: " + key);
    }
    return config;
  }

  global.AppConfig = {
    SHARED_GAS_URL: SHARED_GAS_URL,
    PAGE_CONFIGS: PAGE_CONFIGS,
    getPageConfig: getPageConfig,
    getRequiredPageConfig: getRequiredPageConfig
  };
})(typeof window !== "undefined" ? window : globalThis);
