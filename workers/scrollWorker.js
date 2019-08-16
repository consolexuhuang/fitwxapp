//第一个店铺的top小于这个值时，固定标题显示；
const topInit = (120 + 160 + 112) / 2;
let showStoreName, currentStoreInfo = {};
//接受数据
worker.onMessage(function (res) {
  let nodeRefArr = res.res[0];  
  let top = nodeRefArr[0].top || 0;
  //判断第一个店铺距离顶部的距离（用于是否显示固定标题）
  if (top < topInit-60) {
    console.log('topInt:' + top)
    showStoreName = true
  };
  //判断第一个店铺距离顶部的距离（用于是否显示固定标题）
  if (top > topInit) {
    console.log('topInt2222:' + top)
    showStoreName = false
  };
  //当前显示的店铺
  nodeRefArr.map((item) => {
    //设置高度
    item.height = 56 + 125 * item.dataset.storeNum;
    //店铺名称显示的对应店铺区域
    if (((topInit - item.height) < item.top) && (item.top < topInit)) {
      currentStoreInfo = {
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
