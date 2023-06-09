import {
  defineStore
} from 'pinia';
import request from "@/utils/request.js"
import {
  showMsg
} from '../../utils/Toast';
export const mySpaceStore = defineStore('mySpace', {
  state: () => ({
    id: '',
    uid: '', //账号id
    content: {
      title: '',
      imgArr: []
    },
    position: '',
    status: '',
    createTime: '',
    flag: 'a', //是否显示编辑栏
    totalList: [], //空间列表数据
    isLike: 0,
    likeList:[],//点赞列表
    commentList: []//评论列表数据
  }),
  actions: {
    getData(obj) {
      this.totalList = [...obj].reverse()
    },
    //获取用户动态信息
    async getmySpaceInfo(uid) {
      let {
        data: res
      } = await request('/user/getMySpaceInfo', 'get', {
        keyId: uid
      })
      console.log(res);
      if (res.code == 404) {
        showMsg(res.msg)
      } else if (res.code == 200) {
        this.getData(res.data)
      } else {
        showMsg('数据获取失败')
      }
      this.flag = 'a'
    },
    // 删除动态
    async removeSpace(id, uid) {
      let {
        data: res
      } = await request('/user/deleteSpace', 'delete', {
        id
      });
      if (res.code == '200') {
        showMsg(res.msg, 1500, 'loading');
        this.getmySpaceInfo(uid)
      } else {
        return showMsg('删除动态失败')
      }
    },
    // 更新点赞状态
    async updateLike(id, uid, status) {
      console.log(id, uid, status);
      let {
        data: res
      } = await request('/user/updateLike', 'post', {
        id,
        uid,
        isLike: status
      })
      console.log(res);
      this.getSpaceDetail()//重新获取点赞列表信息
    },
    // 获取用户点赞和评论状态
    async getSpaceDetail() {
      const {
        data: res
      } = await request('/user/getDetailInfo', 'get');
      console.log(res);
      if(!res) return false;
      this.likeList=res.data
    }
  }
})