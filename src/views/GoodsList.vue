<template>
    <div>
      <nav-header></nav-header>
      <nav-bread></nav-bread>
      <div class="accessory-result-page accessory-page">
        <div class="container">
          <div class="filter-nav">
            <span class="sortby">Sort by:</span>
            <a href="javascript:void(0)" class="default cur">Default</a>
            <a href="javascript:void(0)" class="price" :class="{'sort-up':sortFlag}" @click="sortGoods()">Price <svg class="icon icon-arrow-short"><use xlink:href="#icon-arrow-short"></use></svg></a>
            <a href="javascript:void(0)" class="filterby stopPop" @click.stop="showFilterPop">Filter by</a>
          </div>
          <div class="accessory-result">
            <!-- filter -->
            <div class="filter stopPop" id="filter" :class="{'filterby-show':filterBy}">
              <dl class="filter-price">
                <dt>Price:</dt>
                <dd><a href="javascript:void(0)" @click="setPriceFilter('all')" :class="{cur:priceChecked=='all'}">All</a></dd>
                <dd v-for="(price,index) in priceFilter">
                  <a href="javascript:void(0)" @click="setPriceFilter(index)" :class="{cur:priceChecked == index}">{{ price.startPrice }} - {{ price.endPrice }}</a>
                </dd>
              </dl>
            </div>

            <!-- search result accessories list -->
            <div class="accessory-list-wrap">
              <div class="accessory-list col-4">
                <ul>
                  <li v-for="item in goodsList">
                    <div class="pic">
                      <a href="#"><img v-lazy="'/static/'+item.productImage" alt=""></a>
                    </div>
                    <div class="main">
                      <div class="name">{{ item.productName }}</div>
                      <div class="price">{{ item.salePrice | currency('$')}}</div>
                      <div class="btn-area">
                        <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="view-more-normal"
                   v-infinite-scroll="loadMore"
                   infinite-scroll-disabled="busy"
                   infinite-scroll-distance="20">
                <img src="./../assets/loading-spinning-bubbles.svg" v-show="loading">
              </div>
            </div>
          </div>
        </div>
      </div>
      <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
        <p slot="message">
          <svg class="icon-status-ok">
            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-status-ok"></use>
          </svg>
          <span>加入购物车成功!</span>
        </p>
        <div slot="btnGroup">
          <a class="btn btn--m" href="javascript:;" @click="mdShowCart = false">继续购物</a>
          <router-link class="btn btn--m btn--red" href="javascript:;" to="/cart">查看购物车</router-link>
        </div>
      </modal>
      <div class="md-overlay" v-show="overLayFlag" @click="closePop"></div>
      <nav-footer></nav-footer>
    </div>
</template>
<script>
    import '@/assets/css/base.css';
    import '@/assets/css/product.css';
    import NavHeader from '@/components/NavHeader.vue'
    import NavFooter from '@/components/NavFooter.vue'
    import NavBread from '@/components/NavBread.vue'
    import Modal from './../components/Modal'
    import axios from 'axios'
    export default{
        data(){
            return {
              goodsList:[],
              sortFlag: true,
              page: 1,
              pageSize: 8,
              busy: true,
              loading: false,
              mdShow: false,
              mdShowCart: false,
              priceFilter:[
                {
                  startPrice: 0,
                  endPrice: 500
                },
                {
                  startPrice: 500,
                  endPrice: 1000
                },
                {
                  startPrice: 1000,
                  endPrice: 2000
                }
              ],
              priceChecked:'all',
              filterBy:false,
              overLayFlag:false
            }
        },
        components:{
          NavHeader,
          NavFooter,
          NavBread,
          Modal
        },
        mounted: function() {
          this.getGoodsList();
        },
        methods:{
          getGoodsList(flag) {
            let param = {
              page: this.page,
              pageSize: this.pageSize,
              sort: this.sortFlag?1:-1,
              priceLevel: this.priceChecked,
              priceGt:this.priceChecked!=="all"?this.priceFilter[parseInt(this.priceChecked)]['startPrice']:0,
              priceLte:this.priceChecked!=="all"?this.priceFilter[parseInt(this.priceChecked)]['endPrice']:0
            }
            this.loading = true;
            axios.get('/goods/list',{
              params: param
            }).then((response)=>{
              let res = response.data;
              this.loading = false;
              if(res.status == "0") {
                if(flag){
                  this.goodsList = this.goodsList.concat(res.result.list);
                  if(res.result.count == 0) {
                    this.busy = true;
                  }else {
                    this.busy = false;
                  }
                }else {
                  this.goodsList = res.result.list;
                  this.busy = false;
                }
              }else {
                this.goodsList = [];
              }
            })
          },
          sortGoods(){
            this.sortFlag = !this.sortFlag;
            this.page = 1;
            this.getGoodsList();
          },
          setPriceFilter(index){
            this.priceChecked = index;
            this.page = 1;
            this.getGoodsList();
          },
          loadMore(){
            this.busy = true;
            setTimeout(() => {
              this.page++;
              this.getGoodsList(true);
            }, 500);
          },
          addCart(productId){
            axios.post("/goods/addCart",{
              productId: productId
            }).then((result)=>{
              let res = result.data;
              if(res.status == 0) {
                this.mdShowCart = true;
                //this.cartCount++;                   //这里需要传递属性到NavHeader
                this.$store.commit('updateCartCount', res.result);
              }else {
                alert(res.msg);
                location.reload();
              }
            })
          },
          closeModal(){
            this.mdShow = false;
            this.mdShowCart = false;
          },
          showFilterPop(){
            this.filterBy = true;
            this.overLayFlag = true;
          },
          closePop(){
            this.filterBy = false;
            this.overLayFlag = false;
            this.mdShowCart = false;
          }
        }
    }
</script>
