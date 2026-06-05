export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/index/index',
    'pages/order/detail/index',
    'pages/history/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '鲜达供应商',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#00b578',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '待处理',
      },
      {
        pagePath: 'pages/history/index',
        text: '已发货',
      },
    ],
  },
});
