//第一个店铺的top小于这个值时，固定标题显示；
//const topInit = 230;
let showStoreName, currentStoreInfo = {};
//接受数据
worker.onMessage(function ({ res, marginTopBar, stickyTopHeight, storeNameBoxHeight, courseItemHeight}) {
  let topInit = marginTopBar + stickyTopHeight;
  let nodeRefArr = res[0];  
  let top = nodeRefArr[0].top || 0;
  //判断第一个店铺距离顶部的距离（用于是否显示固定标题）
  if (top < topInit) {
    showStoreName = true
  };
  //判断第一个店铺距离顶部的距离（用于是否显示固定标题）
  if (top > topInit + 60) {
    showStoreName = false
  };
  //当前显示的店铺
  nodeRefArr.map((item) => {
    console.log('item')
    console.log(item)
    //设置高度
    item.height = storeNameBoxHeight + courseItemHeight * item.dataset.storeNum;
    //店铺名称显示的对应店铺区域
    if ( (item.top < topInit)) {
      currentStoreInfo = {
        storeId: item.dataset.storeId,
        storeName: item.dataset.storeName,
          storeDist: item.dataset.storeDist,
        }
    }
  }) 
  //发送出去
  worker.postMessage({
    showStoreName,
    currentStoreInfo
  })


})
