(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-13ff3982"],{"183f":function(e,t,a){"use strict";a("bab7")},2192:function(e,t,a){"use strict";a.r(t);var s=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"mb-5"},[a("div",{staticClass:"general-container"},[a("v-card",[a("div",{staticClass:"pa-3"},[a("div",{staticClass:"mt-2 search-inputs"},[a("div",{staticClass:"world-select-all"},[a("v-select",{attrs:{dense:"","hide-details":"",items:e.areaItems,label:e.$t("Enemies.海域"),"menu-props":{maxHeight:"600px"}},on:{change:function(t){return e.changedWorld()}},model:{value:e.selectedArea,callback:function(t){e.selectedArea=t},expression:"selectedArea"}})],1),a("div",{directives:[{name:"show",rawName:"v-show",value:e.isEvent,expression:"isEvent"}]},[a("v-select",{attrs:{dense:"","hide-details":"",items:e.levelItems,label:e.$t("Difficulty.難易度")},on:{change:function(t){return e.changedWorld()}},model:{value:e.level,callback:function(t){e.level=t},expression:"level"}})],1),a("div",{staticClass:"ml-3"},[a("v-btn",{attrs:{color:"success",disabled:e.isLoading||e.isSameSearchCondition},on:{click:function(t){return e.searchPreset()}}},[e._v(e._s(e.$t("Common.検索")))])],1),e.saveData&&e.saveData.length?a("div",{staticClass:"ml-auto align-self-end caption"},[e._v(e._s(e.saveData.length)+e._s(e.$t("Common.件")))]):e._e()])]),a("div",{staticClass:"pa-3"},e._l(e.saveData,(function(t,s){return a("v-card",{key:"data_"+s,staticClass:"preset-item"},[a("div",{staticClass:"d-flex"},[a("div",{staticClass:"align-self-end"},[e._v(e._s(t.name))]),a("v-spacer"),a("v-btn",{attrs:{icon:""},on:{click:function(a){return e.expandPreset(t)}}},[a("v-icon",[e._v("mdi-download")])],1)],1),a("v-divider"),a("div",{staticClass:"d-flex flex-wrap my-1"},e._l(t.ships,(function(t,i){return a("div",{key:"ship"+s+"_"+i},[t.data.id?a("v-img",{attrs:{src:"./img/ship/"+t.data.id+".png",height:"30",width:"120"}}):e._e()],1)})),0),t.memo?a("div",{staticClass:"preset-memo"},[e._v(e._s(t.memo))]):e._e(),a("div",{staticClass:"d-flex flex-wrap justify-end"},[a("div",{staticClass:"d-flex mx-2"},[a("div",[a("v-icon",{attrs:{small:""}},[e._v("mdi-account")])],1),a("div",{staticClass:"caption align-self-center"},[e._v(e._s(t.user))])]),a("div",{staticClass:"d-flex mx-2"},[a("div",[a("v-icon",{attrs:{small:""}},[e._v("mdi-clock-time-four-outline")])],1),a("div",{staticClass:"caption align-self-center"},[e._v(e._s(t.createdAt))])])])],1)})),1),e.enabledMoreLoad&&!e.isLoading?a("div",{staticClass:"pa-2"},[a("v-btn",{attrs:{color:"primary",block:""},on:{click:function(t){return e.searchPreset()}}},[e._v(e._s(e.$t("Common.さらに読み込む")))])],1):e._e(),e.isLoading?a("div",{staticClass:"py-5"},[a("div",{staticClass:"d-flex justify-center"},[a("v-progress-circular",{attrs:{size:"70",color:"secondary",indeterminate:""}})],1)]):e._e()])],1),a("div",{staticClass:"info-area"},[a("v-divider",{staticClass:"mb-2"}),a("div",{staticClass:"caption"},[e._v(" "+e._s(e.$t("Home.著作権法第32条に基づき画像を引用し、著作権は権利者様へ帰属します。権利者様側からの画像等の削除の依頼や警告には速やかに対処いたします。"))+" ")]),a("div",{staticClass:"caption"},[e._v(" "+e._s(e.$t("Home.また、本サイトの情報、計算結果によって受けた利益・損害その他あらゆる事象については一切の責任を負いません。"))+" ")])],1)])},i=[],n=a("1da1"),c=(a("96cf"),a("4de4"),a("d3b7"),a("b0c0"),a("99af"),a("159b"),a("2b0e")),r=a("522d"),l=a("a680"),o=a("5802"),d=a("07bc"),v=a("eb11"),u=a.n(v),m=20,f=c["default"].extend({name:"SaveDataList",components:{},data:function(){return{areaItems:[],selectedArea:11,level:r["e"].HARD,saveData:[],isLoading:!1,lastMap:0,lastLevel:0,lastDocument:void 0}},mounted:function(){this.initWorlds();var e=this.$store.state.searchedList;e&&e.length&&(this.saveData=e)},computed:{needTrans:function(){return"ja"!==this.$i18n.locale},levelItems:function(){if(this.needTrans){for(var e=[],t=0;t<r["j"].DIFFICULTY_LEVELS.length;t+=1){var a=r["j"].DIFFICULTY_LEVELS[t],s=a.text,i=a.value;e.push({text:"".concat(this.$t("Difficulty.".concat(s))),value:i})}return e}return r["j"].DIFFICULTY_LEVELS},getCompletedAll:function(){return this.$store.getters.getCompletedAll},isEvent:function(){return Math.floor(this.selectedArea/10)>40},isSameSearchCondition:function(){return this.lastMap===this.selectedArea&&this.lastLevel===this.level},enabledMoreLoad:function(){return!!this.lastDocument&&this.isSameSearchCondition}},watch:{getCompletedAll:function(e){e&&this.initWorlds()}},methods:{initWorlds:function(){var e=[],t=this.$store.state.worlds,a=this.$store.state.maps;if(t&&a)for(var s=function(s){var i=t[s],n=a.filter((function(e){return Math.floor(e.area/10)===i.world}));if(!n.length)return"continue";s>0&&e.push({divider:!0}),e.push({header:i.name});for(var c=0;c<n.length;c+=1){var r=n[c],l=i.world>40?"E":"".concat(i.world);e.push({value:r.area,text:"".concat(l,"-").concat(r.area%10,"：").concat(r.name),group:i.name})}},i=0;i<t.length;i+=1)s(i);this.areaItems=e},changedWorld:function(){this.isLoading=!1},searchPreset:function(){var e=this;return Object(n["a"])(regeneratorRuntime.mark((function t(){var a,s,i,n,c,r,v,f,h;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return e.isLoading=!0,e.enabledMoreLoad||(e.saveData=[]),t.prev=2,a=Object(l["d"])(),s=4-e.level,i=e.isEvent?e.lastDocument?Object(l["g"])(Object(l["b"])(a,"presets"),Object(l["j"])("map","==",e.selectedArea),Object(l["j"])("level","==",s),Object(l["f"])("createdAt","desc"),Object(l["i"])(e.lastDocument),Object(l["e"])(m)):Object(l["g"])(Object(l["b"])(a,"presets"),Object(l["j"])("map","==",e.selectedArea),Object(l["j"])("level","==",s),Object(l["f"])("createdAt","desc"),Object(l["e"])(m)):e.lastDocument?Object(l["g"])(Object(l["b"])(a,"presets"),Object(l["j"])("map","==",e.selectedArea),Object(l["j"])("level","==",0),Object(l["f"])("createdAt","desc"),Object(l["i"])(e.lastDocument),Object(l["e"])(m)):Object(l["g"])(Object(l["b"])(a,"presets"),Object(l["j"])("map","==",e.selectedArea),Object(l["j"])("level","==",0),Object(l["f"])("createdAt","desc"),Object(l["e"])(m)),e.lastMap=e.selectedArea,e.lastLevel=e.level,t.next=10,Object(l["c"])(i);case 10:n=t.sent,c=[],r=e.$store.state.items,v=e.$store.state.ships,f=e.$store.state.defaultEnemies,h=new o["a"](r,v,f),n.forEach((function(e){var t=e.data();if(2===t.ver){var a=u.a.decompressFromBase64(e.data().data)||"",s=d["a"].loadSaveDataManagerString(a,r,v,f);s&&(t.ships=s.fleetInfo.fleets[0].ships,t.manager=s,t.createdAt=o["a"].formatDate(e.data().createdAt.toDate(),"yyyy/MM/dd HH:mm:ss"),c.push(t))}else{var i=h.restoreOldSaveData(e.data().data);i&&(t.ships=i.fleetInfo.fleets[0].ships,t.manager=i,t.createdAt=o["a"].formatDate(e.data().createdAt.toDate(),"yyyy/MM/dd HH:mm:ss"),c.push(t))}})),e.lastDocument&&e.saveData?e.saveData=e.saveData.concat(c):e.saveData=c,n&&n.docs.length>=m?e.lastDocument=n.docs[n.docs.length-1]:e.lastDocument=void 0,e.$store.dispatch("setSearchedList",e.saveData),t.next=27;break;case 22:t.prev=22,t.t0=t["catch"](2),console.error(t.t0),e.saveData=[],e.$emit("inform","編成データ読み込み中にエラーが発生しました。",!0);case 27:e.isLoading=!1;case 28:case"end":return t.stop()}}),t,null,[[2,22]])})))()},expandPreset:function(e){var t=this.$store.state.saveData;t.disabledMain();var a=new d["a"];a.name=e.name,a.remarks=e.memo,a.tempData=[e.manager],a.tempIndex=0,a.isActive=!0,a.isMain=!0,t.childItems.push(a),this.$store.dispatch("updateSaveData",t),this.$store.dispatch("setMainSaveData",a),this.$router.push("aircalc")}}}),h=f,p=(a("183f"),a("2877")),b=a("6544"),g=a.n(b),j=a("8336"),D=a("b0af"),C=a("ce7e"),_=a("132d"),O=a("adda"),x=a("490a"),A=a("b974"),L=a("2fa4"),w=Object(p["a"])(h,s,i,!1,null,"b441d602",null);t["default"]=w.exports;g()(w,{VBtn:j["a"],VCard:D["a"],VDivider:C["a"],VIcon:_["a"],VImg:O["a"],VProgressCircular:x["a"],VSelect:A["a"],VSpacer:L["a"]})},bab7:function(e,t,a){}}]);
//# sourceMappingURL=chunk-13ff3982.9acb2b0d.js.map