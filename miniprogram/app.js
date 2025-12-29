App({
  onLaunch: function() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        traceUser: true,
        env: 'cloud1-3g1l2z3l3e2d47b6' 
      });
    }
    this.globalData = {
      userInfo: null,
      openid: null,
      theme: 'light'
    };
    this.initTheme();
  },
  initTheme: function() {
    const systemSetting = wx.getSystemSetting();
    this.globalData.theme = systemSetting.theme || 'light';
    if (wx.onThemeChange) {
      wx.onThemeChange((res) => {
        this.globalData.theme = res.theme;
        const pages = getCurrentPages();
        if (pages.length > 0) {
          const currentPage = pages[pages.length - 1];
          if (currentPage.onThemeChange) {
            currentPage.onThemeChange(res.theme);
          }
        }
      });
    }
  },
  globalData: {
    userInfo: null,
    openid: null,
    theme: 'light'
  }
});
