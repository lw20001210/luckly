<template>
  <view class="container">
    <Header :obj="headObj">
      <template #left>
        <text class="iconfont">&#xeb46</text>
      </template>
      <template #center>
        <text>发表说说</text>
      </template>
      <template #right>
        <text @click="distribute">发表</text>
      </template>
    </Header>
    <view class="main">
      <textarea @blur="bindTextAreaBlur" class="area" placeholder="这一刻的想法..." />
      <view class="photo">
        <uni-file-picker limit="9" fileMediatype="image" mode="grid" @select="select" @delete="deleteImage">
          <view class="box">
            <text class="iconfont">&#xe634</text>
            <text>视频/图片</text>
          </view>
        </uni-file-picker>
      </view>
      <view class="position" @click="getLocation">
        <text class="iconfont">&#xe637</text>
        <view class="right">
          <text>{{positionRes}}</text>
          <text class="iconfont">&#xe68c</text>
        </view>
      </view>
      <view class="eyePower" @click="selectPower">
        <text class="iconfont">&#xe857</text>
        <view class="right">
          <text>{{powerRes}}</text>
          <text class="iconfont">&#xe68c</text>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup>
  import Header from "@/component/header.vue";
  import {
    getLocal
  } from "@/utils/local.js";
  import {
    ref,
    computed
  } from 'vue';
  import {
    mySpaceStore
  } from "@/pinia/userInfo/mySpace.js";
  import {
    userStore
  } from "@/pinia/userInfo/userInfo.js"
  import {
    showMsg
  } from "@/utils/Toast.js"
  import {
    onUnload,onShow
  } from "@dcloudio/uni-app"
  import {
    mainUrl
  } from "@/utils/config.js"
  const mySpace = mySpaceStore();
  const userRef = userStore()
  import {
    storeToRefs
  } from 'pinia';
  const {
    id,
    content,
    status,
    position
  } = storeToRefs(mySpace)
  // 传递给header组件的数据
  let headObj = ref({
    path: '/pages/selfStar/selfStar'
  });
  // 九宫格图片的删除功能
  function deleteImage(e) {
    content.value.imgArr = content.value.imgArr.filter(item => {
      return item != e.tempFilePath
    })
  }
  // textare的内容
  function bindTextAreaBlur(e) {
    console.log(e.detail.value)
    content.value.title = e.detail.value;
  }

  const powerRes = computed(() => {
    if (status.value == '0') {
      return '私密'
    } else if (status.value == '1') {
      return '所有人可见'
    } else {
      return '权限设置'
    }
  })
  // 权限选择
  function selectPower() {
    uni.showActionSheet({
      itemList: ['私密', '所有人可见'],
      success: function(res) {
        // console.log('选中了第' + res.tapIndex  + '个按钮');
        if (res.tapIndex == '0') {
          status.value = res.tapIndex
        } else if (res.tapIndex == '1') {
          status.value = res.tapIndex
        }else{
          status.value=2
        }
      },
      fail: function(res) {
        console.log(res.errMsg);
      }
    });
  }
  // 选择所在位置
  function getLocation() {
    uni.chooseLocation({
      success: function(res) {
        // console.log(res);
        position.value = res.name
      },
      fail: function(res) {
        console.log(res);
      }
    });
  }
  const positionRes = computed(() => {
    if (position.value == '') {
      return '所在位置'
    } else {
      return position.value
    }
  })
  // 九宫格选中的图片
  function select(e) {
    if(e.tempFilePaths){
      content.value.imgArr=e.tempFilePaths
    }
    else{
      content.value.imgArr=[]
    }
  }
  // 发布内容
  function distribute() {
    //console.log(userRef.id);
    let obj = {
      uid: userRef.id,
      content: content.value.title,
      status: status.value,
      position: position.value
    }
    // console.log(obj);
    if (content.value.title == '') return showMsg('未填写发布内容')
    // 这里我在onShow处理了一下，因为值为空字符串也是0
    if ((status.value != 0) && (status.value != 1)) return showMsg('未选择权限')
    const fileList = content.value.imgArr.map((item, index) => {
      return {
        name: index,
        uri: item
      }
    })
    uni.uploadFile({
      url: `${mainUrl}/user/sedSpace`,
      files: fileList,
      formData: obj,
      timeout: 8000,
      header: {
        authorization: getLocal('token') ? getLocal('token') : ""
      },
      success: (res) => {
        let result = JSON.parse(res.data);
        if (result.code == 200) {
          showMsg(result.msg, 1000, 'loading')
        }
        uni.redirectTo({
        	url: '/pages/selfStar/selfStar'
        });
      },
      fail: (err) => {
        return showMsg('发布失败', 1000, 'loading')
      }
    })
  }
  onShow(() => {
    status.value = '2'
  })
  onUnload(() => {
    position.value = '';
    status.value = '2'
  })
</script>

<style scoped lang="scss">
  :deep(.file-picker__box-content) {
    background-color: rgba(196, 196, 196, .4);
  }

  :deep(.file-picker__progress) {
    display: none !important;
  }


  .container {
    padding: 15rpx 20rpx 0;

    .iconfont {
      font-size: 40rpx;
    }

    .main {
      margin: 50rpx 8rpx 0;

      .textarea {
        padding: 20rpx 0;
        width: 100%;
        margin-left: 10rpx;
        min-height: 117px;
      }

      .photo {
        width: 100%;
        height: 100%;
        border-radius: 6rpx;
        color: #787070;
        padding-bottom: 30rpx;
        border-bottom: 1px solid rgba(196, 196, 196, .4);

        :deep(.uni-file-picker__container[data-v-bdfc07e0]) {
          justify-content: flex-start !important;
        }

        .box {
          display: flex;
          flex-direction: column;
          align-items: center;

          .iconfont {
            font-size: 55rpx;
          }
        }
      }

      .position,
      .eyePower {
        flex: 1;
        display: flex;
        align-items: center;

        .right {
          border-bottom: 1px solid rgba(196, 196, 196, .4);
          padding: 40rpx 0;
          margin-left: 20rpx;
          display: flex;
          width: 100%;
          justify-content: space-between;
        }
      }
    }
  }
</style>