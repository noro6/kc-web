(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-14a9fcb0"],{2192:function(t,e,n){"use strict";n.r(e);var r=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"mb-5"},[n("div",{staticClass:"general-container"},[n("v-card",[n("div",{staticClass:"pa-3"},[n("div",{staticClass:"mt-2 search-inputs"},[n("div",{staticClass:"world-select-all"},[n("v-select",{attrs:{dense:"","hide-details":"",items:t.areaItems,label:"海域","menu-props":{maxHeight:"600px"}},on:{change:function(e){return t.changedWorld()}},model:{value:t.selectedArea,callback:function(e){t.selectedArea=e},expression:"selectedArea"}})],1),n("div",{directives:[{name:"show",rawName:"v-show",value:t.isEvent,expression:"isEvent"}]},[n("v-select",{attrs:{dense:"","hide-details":"",items:t.levelItems,label:"難易度"},on:{change:function(e){return t.changedWorld()}},model:{value:t.level,callback:function(e){t.level=e},expression:"level"}})],1),n("div",{staticClass:"ml-3"},[n("v-btn",{attrs:{color:"success",disabled:t.isLoading||t.isSameSearchCondition},on:{click:function(e){return t.searchPreset()}}},[t._v("検索")])],1),t.savedata&&t.savedata.length?n("div",{staticClass:"ml-auto align-self-end caption"},[t._v(t._s(t.savedata.length)+"件")]):t._e()])]),n("div",{staticClass:"pa-3"},t._l(t.savedata,(function(e,r){return n("v-card",{key:"data_"+r,staticClass:"preset-item"},[n("div",{staticClass:"d-flex"},[n("div",{staticClass:"align-self-end"},[t._v(t._s(e.name))]),n("v-spacer"),n("v-btn",{attrs:{icon:""},on:{click:function(n){return t.expandPreset(e)}}},[n("v-icon",[t._v("mdi-download")])],1)],1),n("v-divider"),n("div",{staticClass:"d-flex flex-wrap my-1"},t._l(e.ships,(function(t,e){return n("div",{key:"ship"+r+"_"+e},[n("v-img",{attrs:{src:"./img/ship/"+t.data.id+".png",height:"30",width:"120"}})],1)})),0),e.memo?n("div",{staticClass:"preset-memo"},[t._v(t._s(e.memo))]):t._e(),n("div",{staticClass:"d-flex flex-wrap justify-end"},[n("div",{staticClass:"d-flex mx-2"},[n("div",[n("v-icon",{attrs:{small:""}},[t._v("mdi-account")])],1),n("div",{staticClass:"caption align-self-center"},[t._v(t._s(e.name))])]),n("div",{staticClass:"d-flex mx-2"},[n("div",[n("v-icon",{attrs:{small:""}},[t._v("mdi-clock-time-four-outline")])],1),n("div",{staticClass:"caption align-self-center"},[t._v(t._s(e.createdAt))])])])],1)})),1),t.enabledMoreLoad&&!t.isLoading?n("div",{staticClass:"pa-2"},[n("v-btn",{attrs:{color:"info",block:""},on:{click:function(e){return t.searchPreset()}}},[t._v("さらに読み込む")])],1):t._e(),t.isLoading?n("div",{staticClass:"py-5"},[n("div",{staticClass:"d-flex justify-center"},[n("v-progress-circular",{attrs:{size:"70",color:"secondary",indeterminate:""}})],1)]):t._e()])],1),n("div",{staticClass:"info-area"},[n("v-divider",{staticClass:"mb-2"}),n("div",{staticClass:"caption"},[t._v(" 著作権法第32条に基づき画像を引用し、著作権は権利者様へ帰属します。権利者様側からの画像等の削除の依頼や警告には速やかに対処いたします。 ")]),n("div",{staticClass:"caption"},[t._v("また、本サイトの情報、計算結果によって受けた利益・損害その他あらゆる事象については一切の責任を負いません。")])],1)])},s=[],i=n("1da1"),a=(n("96cf"),n("4de4"),n("d3b7"),n("99af"),n("159b"),n("b0c0"),n("2b0e")),o=n("522d"),u=n("589b"),c=n("22e5"),l=n("e691"),h=n("1fd5");
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class d{constructor(t){this.uid=t}isAuthenticated(){return null!=this.uid}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}d.UNAUTHENTICATED=new d(null),d.GOOGLE_CREDENTIALS=new d("google-credentials-uid"),d.FIRST_PARTY=new d("first-party-uid"),d.MOCK_USER=new d("mock-user");
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let f="9.6.9";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const p=new l["b"]("@firebase/firestore");function m(t,...e){if(p.logLevel<=l["a"].DEBUG){const n=e.map(v);p.debug(`Firestore (${f}): ${t}`,...n)}}function g(t,...e){if(p.logLevel<=l["a"].ERROR){const n=e.map(v);p.error(`Firestore (${f}): ${t}`,...n)}}function y(t,...e){if(p.logLevel<=l["a"].WARN){const n=e.map(v);p.warn(`Firestore (${f}): ${t}`,...n)}}function v(t){if("string"==typeof t)return t;try{return e=t,JSON.stringify(e)}catch(e){return t}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var e}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function w(t="Unexpected state"){const e=`FIRESTORE (${f}) INTERNAL ASSERTION FAILED: `+t;throw g(e),new Error(e)}function _(t,e){t||w()}function b(t,e){return t}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const S="ok",A="cancelled",I="unknown",V="invalid-argument",T="deadline-exceeded",E="not-found",D="permission-denied",N="unauthenticated",C="resource-exhausted",P="failed-precondition",O="aborted",k="out-of-range",x="unimplemented",L="internal",F="unavailable";class $ extends h["c"]{constructor(t,e){super(t,e),this.code=t,this.message=e,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class q{constructor(t,e){this.user=e,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization","Bearer "+t)}}class R{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,e){t.enqueueRetryable(()=>e(d.UNAUTHENTICATED))}shutdown(){}}class U{constructor(t){this.auth=null,t.onInit(t=>{this.auth=t})}getToken(){return this.auth?this.auth.getToken().then(t=>t?(_("string"==typeof t.accessToken),new q(t.accessToken,new d(this.auth.getUid()))):null):Promise.resolve(null)}invalidateToken(){}start(t,e){}shutdown(){}}class j{constructor(t,e,n){this.type="FirstParty",this.user=d.FIRST_PARTY,this.headers=new Map,this.headers.set("X-Goog-AuthUser",e);const r=t.auth.getAuthHeaderValueForFirstParty([]);r&&this.headers.set("Authorization",r),n&&this.headers.set("X-Goog-Iam-Authorization-Token",n)}}class B{constructor(t,e,n){this.t=t,this.i=e,this.o=n}getToken(){return Promise.resolve(new j(this.t,this.i,this.o))}start(t,e){t.enqueueRetryable(()=>e(d.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class M{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class G{constructor(t){this.u=t,this.appCheck=null,t.onInit(t=>{this.appCheck=t})}getToken(){return this.appCheck?this.appCheck.getToken().then(t=>t?(_("string"==typeof t.token),new M(t.token)):null):Promise.resolve(null)}invalidateToken(){}start(t,e){}shutdown(){}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class z{constructor(t,e,n,r,s,i,a,o){this.databaseId=t,this.appId=e,this.persistenceKey=n,this.host=r,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=a,this.useFetchStreams=o}}class K{constructor(t,e){this.projectId=t,this.database=e||"(default)"}static empty(){return new K("","")}get isDefaultDatabase(){return"(default)"===this.database}isEqual(t){return t instanceof K&&t.projectId===this.projectId&&t.database===this.database}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class H{constructor(t,e,n){void 0===e?e=0:e>t.length&&w(),void 0===n?n=t.length-e:n>t.length-e&&w(),this.segments=t,this.offset=e,this.len=n}get length(){return this.len}isEqual(t){return 0===H.comparator(this,t)}child(t){const e=this.segments.slice(this.offset,this.limit());return t instanceof H?t.forEach(t=>{e.push(t)}):e.push(t),this.construct(e)}limit(){return this.offset+this.length}popFirst(t){return t=void 0===t?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return 0===this.length}isPrefixOf(t){if(t.length<this.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}forEach(t){for(let e=this.offset,n=this.limit();e<n;e++)t(this.segments[e])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,e){const n=Math.min(t.length,e.length);for(let r=0;r<n;r++){const n=t.get(r),s=e.get(r);if(n<s)return-1;if(n>s)return 1}return t.length<e.length?-1:t.length>e.length?1:0}}class Q extends H{construct(t,e,n){return new Q(t,e,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}static fromString(...t){const e=[];for(const n of t){if(n.indexOf("//")>=0)throw new $(V,`Invalid segment (${n}). Paths must not contain // in them.`);e.push(...n.split("/").filter(t=>t.length>0))}return new Q(e)}static emptyPath(){return new Q([])}}const Y=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class W extends H{construct(t,e,n){return new W(t,e,n)}static isValidIdentifier(t){return Y.test(t)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),W.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return 1===this.length&&"__name__"===this.get(0)}static keyField(){return new W(["__name__"])}static fromServerFormat(t){const e=[];let n="",r=0;const s=()=>{if(0===n.length)throw new $(V,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);e.push(n),n=""};let i=!1;for(;r<t.length;){const e=t[r];if("\\"===e){if(r+1===t.length)throw new $(V,"Path has trailing escape character: "+t);const e=t[r+1];if("\\"!==e&&"."!==e&&"`"!==e)throw new $(V,"Path has invalid escape sequence: "+t);n+=e,r+=2}else"`"===e?(i=!i,r++):"."!==e||i?(n+=e,r++):(s(),r++)}if(s(),i)throw new $(V,"Unterminated ` in path: "+t);return new W(e)}static emptyPath(){return new W([])}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class X{constructor(t){this.path=t}static fromPath(t){return new X(Q.fromString(t))}static fromName(t){return new X(Q.fromString(t).popFirst(5))}static empty(){return new X(Q.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return null!==t&&0===Q.comparator(this.path,t.path)}toString(){return this.path.toString()}static comparator(t,e){return Q.comparator(t.path,e.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new X(new Q(t.slice()))}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function J(t,e,n){if(!n)throw new $(V,`Function ${t}() cannot be called with an empty ${e}.`)}function Z(t){if(X.isDocumentKey(t))throw new $(V,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function tt(t){if(void 0===t)return"undefined";if(null===t)return"null";if("string"==typeof t)return t.length>20&&(t=t.substring(0,20)+"..."),JSON.stringify(t);if("number"==typeof t||"boolean"==typeof t)return""+t;if("object"==typeof t){if(t instanceof Array)return"an array";{const e=function(t){return t.constructor?t.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return"function"==typeof t?"a function":w()}function et(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new $(V,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=tt(t);throw new $(V,`Expected type '${e.name}', but it was: ${n}`)}}return t}function nt(t,e){if(e<=0)throw new $(V,`Function ${t}() requires a positive number, but it was: ${e}.`)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rt(t){return null==t}function st(t){return 0===t&&1/t==-1/0}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const it={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery"};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var at,ot;function ut(t){if(void 0===t)return g("RPC_ERROR","HTTP error has no status"),I;switch(t){case 200:return S;case 400:return P;case 401:return N;case 403:return D;case 404:return E;case 409:return O;case 416:return k;case 429:return C;case 499:return A;case 500:return I;case 501:return x;case 503:return F;case 504:return T;default:return t>=200&&t<300?S:t>=400&&t<500?P:t>=500&&t<600?L:I}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(ot=at||(at={}))[ot.OK=0]="OK",ot[ot.CANCELLED=1]="CANCELLED",ot[ot.UNKNOWN=2]="UNKNOWN",ot[ot.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ot[ot.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ot[ot.NOT_FOUND=5]="NOT_FOUND",ot[ot.ALREADY_EXISTS=6]="ALREADY_EXISTS",ot[ot.PERMISSION_DENIED=7]="PERMISSION_DENIED",ot[ot.UNAUTHENTICATED=16]="UNAUTHENTICATED",ot[ot.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ot[ot.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ot[ot.ABORTED=10]="ABORTED",ot[ot.OUT_OF_RANGE=11]="OUT_OF_RANGE",ot[ot.UNIMPLEMENTED=12]="UNIMPLEMENTED",ot[ot.INTERNAL=13]="INTERNAL",ot[ot.UNAVAILABLE=14]="UNAVAILABLE",ot[ot.DATA_LOSS=15]="DATA_LOSS";class ct extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const e=t.ssl?"https":"http";this.h=e+"://"+t.host,this.l="projects/"+this.databaseId.projectId+"/databases/"+this.databaseId.database+"/documents"}m(t,e,n,r,s){const i=this.p(t,e);m("RestConnection","Sending: ",i,n);const a={};return this.g(a,r,s),this.v(t,i,a,n).then(t=>(m("RestConnection","Received: ",t),t),e=>{throw y("RestConnection",t+" failed with error: ",e,"url: ",i,"request:",n),e})}T(t,e,n,r,s){return this.m(t,e,n,r,s)}g(t,e,n){t["X-Goog-Api-Client"]="gl-js/ fire/"+f,t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),e&&e.headers.forEach((e,n)=>t[n]=e),n&&n.headers.forEach((e,n)=>t[n]=e)}p(t,e){const n=it[t];return`${this.h}/v1/${e}:${n}`}}{constructor(t,e){super(t),this.I=e}A(t,e){throw new Error("Not supported by FetchConnection")}async v(t,e,n,r){const s=JSON.stringify(r);let i;try{i=await this.I(e,{method:"POST",headers:n,body:s})}catch(t){throw new $(ut(t.status),"Request failed with error: "+t.statusText)}if(!i.ok)throw new $(ut(i.status),"Request failed with error: "+i.statusText);return i.json()}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lt(t,e){return t<e?-1:t>e?1:0}function ht(t,e,n){return t.length===e.length&&t.every((t,r)=>n(t,e[r]))}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dt{constructor(t,e){if(this.seconds=t,this.nanoseconds=e,e<0)throw new $(V,"Timestamp nanoseconds out of range: "+e);if(e>=1e9)throw new $(V,"Timestamp nanoseconds out of range: "+e);if(t<-62135596800)throw new $(V,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new $(V,"Timestamp seconds out of range: "+t)}static now(){return dt.fromMillis(Date.now())}static fromDate(t){return dt.fromMillis(t.getTime())}static fromMillis(t){const e=Math.floor(t/1e3),n=Math.floor(1e6*(t-1e3*e));return new dt(e,n)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(t){return this.seconds===t.seconds?lt(this.nanoseconds,t.nanoseconds):lt(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const t=this.seconds- -62135596800;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ft{constructor(t){this.timestamp=t}static fromTimestamp(t){return new ft(t)}static min(){return new ft(new dt(0,0))}compareTo(t){return this.timestamp._compareTo(t.timestamp)}isEqual(t){return this.timestamp.isEqual(t.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pt(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function mt(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class gt{constructor(t){this.binaryString=t}static fromBase64String(t){const e=atob(t);return new gt(e)}static fromUint8Array(t){const e=function(t){let e="";for(let n=0;n<t.length;++n)e+=String.fromCharCode(t[n]);return e}(t);return new gt(e)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return t=this.binaryString,btoa(t);var t}toUint8Array(){return function(t){const e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.charCodeAt(n);return e}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return lt(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}gt.EMPTY_BYTE_STRING=new gt("");const yt=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function vt(t){if(_(!!t),"string"==typeof t){let e=0;const n=yt.exec(t);if(_(!!n),n[1]){let t=n[1];t=(t+"000000000").substr(0,9),e=Number(t)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:wt(t.seconds),nanos:wt(t.nanos)}}function wt(t){return"number"==typeof t?t:"string"==typeof t?Number(t):0}function _t(t){return"string"==typeof t?gt.fromBase64String(t):gt.fromUint8Array(t)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bt(t){var e,n;return"server_timestamp"===(null===(n=((null===(e=null==t?void 0:t.mapValue)||void 0===e?void 0:e.fields)||{}).__type__)||void 0===n?void 0:n.stringValue)}function St(t){const e=t.mapValue.fields.__previous_value__;return bt(e)?St(e):e}function At(t){const e=vt(t.mapValue.fields.__local_write_time__.timestampValue);return new dt(e.seconds,e.nanos)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function It(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?bt(t)?4:function(t){return"__max__"===(((t.mapValue||{}).fields||{}).__type__||{}).stringValue}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(t)?9:10:w()}function Vt(t,e){if(t===e)return!0;const n=It(t);if(n!==It(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return At(t).isEqual(At(e));case 3:return function(t,e){if("string"==typeof t.timestampValue&&"string"==typeof e.timestampValue&&t.timestampValue.length===e.timestampValue.length)return t.timestampValue===e.timestampValue;const n=vt(t.timestampValue),r=vt(e.timestampValue);return n.seconds===r.seconds&&n.nanos===r.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(t,e){return _t(t.bytesValue).isEqual(_t(e.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(t,e){return wt(t.geoPointValue.latitude)===wt(e.geoPointValue.latitude)&&wt(t.geoPointValue.longitude)===wt(e.geoPointValue.longitude)}(t,e);case 2:return function(t,e){if("integerValue"in t&&"integerValue"in e)return wt(t.integerValue)===wt(e.integerValue);if("doubleValue"in t&&"doubleValue"in e){const n=wt(t.doubleValue),r=wt(e.doubleValue);return n===r?st(n)===st(r):isNaN(n)&&isNaN(r)}return!1}(t,e);case 9:return ht(t.arrayValue.values||[],e.arrayValue.values||[],Vt);case 10:return function(t,e){const n=t.mapValue.fields||{},r=e.mapValue.fields||{};if(pt(n)!==pt(r))return!1;for(const s in n)if(n.hasOwnProperty(s)&&(void 0===r[s]||!Vt(n[s],r[s])))return!1;return!0}(t,e);default:return w()}}function Tt(t,e){return void 0!==(t.values||[]).find(t=>Vt(t,e))}function Et(t,e){if(t===e)return 0;const n=It(t),r=It(e);if(n!==r)return lt(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return lt(t.booleanValue,e.booleanValue);case 2:return function(t,e){const n=wt(t.integerValue||t.doubleValue),r=wt(e.integerValue||e.doubleValue);return n<r?-1:n>r?1:n===r?0:isNaN(n)?isNaN(r)?0:-1:1}(t,e);case 3:return Dt(t.timestampValue,e.timestampValue);case 4:return Dt(At(t),At(e));case 5:return lt(t.stringValue,e.stringValue);case 6:return function(t,e){const n=_t(t),r=_t(e);return n.compareTo(r)}(t.bytesValue,e.bytesValue);case 7:return function(t,e){const n=t.split("/"),r=e.split("/");for(let s=0;s<n.length&&s<r.length;s++){const t=lt(n[s],r[s]);if(0!==t)return t}return lt(n.length,r.length)}(t.referenceValue,e.referenceValue);case 8:return function(t,e){const n=lt(wt(t.latitude),wt(e.latitude));return 0!==n?n:lt(wt(t.longitude),wt(e.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return function(t,e){const n=t.values||[],r=e.values||[];for(let s=0;s<n.length&&s<r.length;++s){const t=Et(n[s],r[s]);if(t)return t}return lt(n.length,r.length)}(t.arrayValue,e.arrayValue);case 10:return function(t,e){const n=t.fields||{},r=Object.keys(n),s=e.fields||{},i=Object.keys(s);r.sort(),i.sort();for(let a=0;a<r.length&&a<i.length;++a){const t=lt(r[a],i[a]);if(0!==t)return t;const e=Et(n[r[a]],s[i[a]]);if(0!==e)return e}return lt(r.length,i.length)}(t.mapValue,e.mapValue);default:throw w()}}function Dt(t,e){if("string"==typeof t&&"string"==typeof e&&t.length===e.length)return lt(t,e);const n=vt(t),r=vt(e),s=lt(n.seconds,r.seconds);return 0!==s?s:lt(n.nanos,r.nanos)}function Nt(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function Ct(t){return!!t&&"arrayValue"in t}function Pt(t){return!!t&&"nullValue"in t}function Ot(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function kt(t){return!!t&&"mapValue"in t}function xt(t){if(t.geoPointValue)return{geoPointValue:Object.assign({},t.geoPointValue)};if(t.timestampValue&&"object"==typeof t.timestampValue)return{timestampValue:Object.assign({},t.timestampValue)};if(t.mapValue){const e={mapValue:{fields:{}}};return mt(t.mapValue.fields,(t,n)=>e.mapValue.fields[t]=xt(n)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=xt(t.arrayValue.values[n]);return e}return Object.assign({},t)}class Lt{constructor(t){this.value=t}static empty(){return new Lt({mapValue:{}})}field(t){if(t.isEmpty())return this.value;{let e=this.value;for(let n=0;n<t.length-1;++n)if(e=(e.mapValue.fields||{})[t.get(n)],!kt(e))return null;return e=(e.mapValue.fields||{})[t.lastSegment()],e||null}}set(t,e){this.getFieldsMap(t.popLast())[t.lastSegment()]=xt(e)}setAll(t){let e=W.emptyPath(),n={},r=[];t.forEach((t,s)=>{if(!e.isImmediateParentOf(s)){const t=this.getFieldsMap(e);this.applyChanges(t,n,r),n={},r=[],e=s.popLast()}t?n[s.lastSegment()]=xt(t):r.push(s.lastSegment())});const s=this.getFieldsMap(e);this.applyChanges(s,n,r)}delete(t){const e=this.field(t.popLast());kt(e)&&e.mapValue.fields&&delete e.mapValue.fields[t.lastSegment()]}isEqual(t){return Vt(this.value,t.value)}getFieldsMap(t){let e=this.value;e.mapValue.fields||(e.mapValue={fields:{}});for(let n=0;n<t.length;++n){let r=e.mapValue.fields[t.get(n)];kt(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},e.mapValue.fields[t.get(n)]=r),e=r}return e.mapValue.fields}applyChanges(t,e,n){mt(e,(e,n)=>t[e]=n);for(const r of n)delete t[r]}clone(){return new Lt(xt(this.value))}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ft{constructor(t,e,n,r,s,i){this.key=t,this.documentType=e,this.version=n,this.readTime=r,this.data=s,this.documentState=i}static newInvalidDocument(t){return new Ft(t,0,ft.min(),ft.min(),Lt.empty(),0)}static newFoundDocument(t,e,n){return new Ft(t,1,e,ft.min(),n,0)}static newNoDocument(t,e){return new Ft(t,2,e,ft.min(),Lt.empty(),0)}static newUnknownDocument(t,e){return new Ft(t,3,e,ft.min(),Lt.empty(),2)}convertToFoundDocument(t,e){return this.version=t,this.documentType=1,this.data=e,this.documentState=0,this}convertToNoDocument(t){return this.version=t,this.documentType=2,this.data=Lt.empty(),this.documentState=0,this}convertToUnknownDocument(t){return this.version=t,this.documentType=3,this.data=Lt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this}setReadTime(t){return this.readTime=t,this}get hasLocalMutations(){return 1===this.documentState}get hasCommittedMutations(){return 2===this.documentState}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return 0!==this.documentType}isFoundDocument(){return 1===this.documentType}isNoDocument(){return 2===this.documentType}isUnknownDocument(){return 3===this.documentType}isEqual(t){return t instanceof Ft&&this.key.isEqual(t.key)&&this.version.isEqual(t.version)&&this.documentType===t.documentType&&this.documentState===t.documentState&&this.data.isEqual(t.data)}mutableCopy(){return new Ft(this.key,this.documentType,this.version,this.readTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $t{constructor(t,e=null,n=[],r=[],s=null,i=null,a=null){this.path=t,this.collectionGroup=e,this.orderBy=n,this.filters=r,this.limit=s,this.startAt=i,this.endAt=a,this.P=null}}function qt(t,e=null,n=[],r=[],s=null,i=null,a=null){return new $t(t,e,n,r,s,i,a)}class Rt extends class{}{constructor(t,e,n){super(),this.field=t,this.op=e,this.value=n}static create(t,e,n){return t.isKeyField()?"in"===e||"not-in"===e?this.V(t,e,n):new Ut(t,e,n):"array-contains"===e?new Gt(t,n):"in"===e?new zt(t,n):"not-in"===e?new Kt(t,n):"array-contains-any"===e?new Ht(t,n):new Rt(t,e,n)}static V(t,e,n){return"in"===e?new jt(t,n):new Bt(t,n)}matches(t){const e=t.data.field(this.field);return"!="===this.op?null!==e&&this.D(Et(e,this.value)):null!==e&&It(this.value)===It(e)&&this.D(Et(e,this.value))}D(t){switch(this.op){case"<":return t<0;case"<=":return t<=0;case"==":return 0===t;case"!=":return 0!==t;case">":return t>0;case">=":return t>=0;default:return w()}}N(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}}class Ut extends Rt{constructor(t,e,n){super(t,e,n),this.key=X.fromName(n.referenceValue)}matches(t){const e=X.comparator(t.key,this.key);return this.D(e)}}class jt extends Rt{constructor(t,e){super(t,"in",e),this.keys=Mt("in",e)}matches(t){return this.keys.some(e=>e.isEqual(t.key))}}class Bt extends Rt{constructor(t,e){super(t,"not-in",e),this.keys=Mt("not-in",e)}matches(t){return!this.keys.some(e=>e.isEqual(t.key))}}function Mt(t,e){var n;return((null===(n=e.arrayValue)||void 0===n?void 0:n.values)||[]).map(t=>X.fromName(t.referenceValue))}class Gt extends Rt{constructor(t,e){super(t,"array-contains",e)}matches(t){const e=t.data.field(this.field);return Ct(e)&&Tt(e.arrayValue,this.value)}}class zt extends Rt{constructor(t,e){super(t,"in",e)}matches(t){const e=t.data.field(this.field);return null!==e&&Tt(this.value.arrayValue,e)}}class Kt extends Rt{constructor(t,e){super(t,"not-in",e)}matches(t){if(Tt(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const e=t.data.field(this.field);return null!==e&&!Tt(this.value.arrayValue,e)}}class Ht extends Rt{constructor(t,e){super(t,"array-contains-any",e)}matches(t){const e=t.data.field(this.field);return!(!Ct(e)||!e.arrayValue.values)&&e.arrayValue.values.some(t=>Tt(this.value.arrayValue,t))}}class Qt{constructor(t,e){this.position=t,this.inclusive=e}}class Yt{constructor(t,e="asc"){this.field=t,this.dir=e}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Wt{constructor(t,e=null,n=[],r=[],s=null,i="F",a=null,o=null){this.path=t,this.collectionGroup=e,this.explicitOrderBy=n,this.filters=r,this.limit=s,this.limitType=i,this.startAt=a,this.endAt=o,this.$=null,this.S=null,this.startAt,this.endAt}}function Xt(t){return!rt(t.limit)&&"L"===t.limitType}function Jt(t){return t.explicitOrderBy.length>0?t.explicitOrderBy[0].field:null}function Zt(t){for(const e of t.filters)if(e.N())return e.field;return null}function te(t){return null!==t.collectionGroup}function ee(t){const e=b(t);if(null===e.$){e.$=[];const t=Zt(e),n=Jt(e);if(null!==t&&null===n)t.isKeyField()||e.$.push(new Yt(t)),e.$.push(new Yt(W.keyField(),"asc"));else{let t=!1;for(const n of e.explicitOrderBy)e.$.push(n),n.field.isKeyField()&&(t=!0);if(!t){const t=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";e.$.push(new Yt(W.keyField(),t))}}}return e.$}function ne(t){const e=b(t);if(!e.S)if("F"===e.limitType)e.S=qt(e.path,e.collectionGroup,ee(e),e.filters,e.limit,e.startAt,e.endAt);else{const t=[];for(const s of ee(e)){const e="desc"===s.dir?"asc":"desc";t.push(new Yt(s.field,e))}const n=e.endAt?new Qt(e.endAt.position,!e.endAt.inclusive):null,r=e.startAt?new Qt(e.startAt.position,!e.startAt.inclusive):null;e.S=qt(e.path,e.collectionGroup,t,e.filters,e.limit,n,r)}return e.S}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function re(t,e){return function(t){return"number"==typeof t&&Number.isInteger(t)&&!st(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}(e)?function(t){return{integerValue:""+t}}(e):function(t,e){if(t.F){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:st(e)?"-0":e}}(t,e)}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const se=(()=>{const t={asc:"ASCENDING",desc:"DESCENDING"};return t})(),ie=(()=>{const t={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"};return t})();class ae{constructor(t,e){this.databaseId=t,this.F=e}}function oe(t,e){return t.F?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function ue(t,e){return t.F?e.toBase64():e.toUint8Array()}function ce(t){return _(!!t),ft.fromTimestamp(function(t){const e=vt(t);return new dt(e.seconds,e.nanos)}(t))}function le(t,e){return function(t){return new Q(["projects",t.projectId,"databases",t.database])}(t).child("documents").child(e).canonicalString()}function he(t,e){const n=function(t){const e=Q.fromString(t);return _(ye(e)),e}(e);if(n.get(1)!==t.databaseId.projectId)throw new $(V,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new $(V,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new X((_((r=n).length>4&&"documents"===r.get(4)),r.popFirst(5)));var r}function de(t,e){return le(t.databaseId,e)}function fe(t,e){const n={structuredQuery:{}},r=e.path;null!==e.collectionGroup?(n.parent=de(t,r),n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(n.parent=de(t,r.popLast()),n.structuredQuery.from=[{collectionId:r.lastSegment()}]);const s=function(t){if(0===t.length)return;const e=t.map(t=>function(t){if("=="===t.op){if(Ot(t.value))return{unaryFilter:{field:ge(t.field),op:"IS_NAN"}};if(Pt(t.value))return{unaryFilter:{field:ge(t.field),op:"IS_NULL"}}}else if("!="===t.op){if(Ot(t.value))return{unaryFilter:{field:ge(t.field),op:"IS_NOT_NAN"}};if(Pt(t.value))return{unaryFilter:{field:ge(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:ge(t.field),op:me(t.op),value:t.value}}}(t));return 1===e.length?e[0]:{compositeFilter:{op:"AND",filters:e}}}(e.filters);s&&(n.structuredQuery.where=s);const i=function(t){if(0!==t.length)return t.map(t=>function(t){return{field:ge(t.field),direction:pe(t.dir)}}(t))}(e.orderBy);i&&(n.structuredQuery.orderBy=i);const a=function(t,e){return t.F||rt(e)?e:{value:e}}(t,e.limit);var o;return null!==a&&(n.structuredQuery.limit=a),e.startAt&&(n.structuredQuery.startAt={before:(o=e.startAt).inclusive,values:o.position}),e.endAt&&(n.structuredQuery.endAt=function(t){return{before:!t.inclusive,values:t.position}}(e.endAt)),n}function pe(t){return se[t]}function me(t){return ie[t]}function ge(t){return{fieldPath:t.canonicalString()}}function ye(t){return t.length>=4&&"projects"===t.get(0)&&"databases"===t.get(2)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ve(t){return new ae(t,!0)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class we extends class{}{constructor(t,e,n,r){super(),this.authCredentials=t,this.appCheckCredentials=e,this.K=n,this.q=r,this.J=!1}X(){if(this.J)throw new $(P,"The client has already been terminated.")}m(t,e,n){return this.X(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([r,s])=>this.K.m(t,e,n,r,s)).catch(t=>{throw"FirebaseError"===t.name?(t.code===N&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),t):new $(I,t.toString())})}T(t,e,n){return this.X(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([r,s])=>this.K.T(t,e,n,r,s)).catch(t=>{throw"FirebaseError"===t.name?(t.code===N&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),t):new $(I,t.toString())})}terminate(){this.J=!0}}async function _e(t,e){const n=b(t),r=fe(n.q,ne(e));return(await n.T("RunQuery",r.parent,{structuredQuery:r.structuredQuery})).filter(t=>!!t.document).map(t=>function(t,e,n){const r=he(t,e.name),s=ce(e.updateTime),i=new Lt({mapValue:{fields:e.fields}}),a=Ft.newFoundDocument(r,s,i);return n&&a.setHasCommittedMutations(),n?a.setHasCommittedMutations():a}(n.q,t.document,void 0))}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const be=new Map;function Se(t){if(t._terminated)throw new $(P,"The client has already been terminated.");if(!be.has(t)){m("ComponentProvider","Initializing Datastore");const i=function(t){return new ct(t,fetch.bind(null))}((e=t._databaseId,n=t.app.options.appId||"",r=t._persistenceKey,s=t._freezeSettings(),new z(e,n,r,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,s.useFetchStreams))),a=ve(t._databaseId),o=function(t,e,n,r){return new we(t,e,n,r)}(t._authCredentials,t._appCheckCredentials,i,a);be.set(t,o)}var e,n,r,s;
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */return be.get(t)}class Ae{constructor(t){var e;if(void 0===t.host){if(void 0!==t.ssl)throw new $(V,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=t.host,this.ssl=null===(e=t.ssl)||void 0===e||e;if(this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,void 0===t.cacheSizeBytes)this.cacheSizeBytes=41943040;else{if(-1!==t.cacheSizeBytes&&t.cacheSizeBytes<1048576)throw new $(V,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.useFetchStreams=!!t.useFetchStreams,function(t,e,n,r){if(!0===e&&!0===r)throw new $(V,`${t} and ${n} cannot be used together.`)}("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling)}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ie{constructor(t,e,n){this._authCredentials=e,this._appCheckCredentials=n,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Ae({}),this._settingsFrozen=!1,t instanceof K?this._databaseId=t:(this._app=t,this._databaseId=function(t){if(!Object.prototype.hasOwnProperty.apply(t.options,["projectId"]))throw new $(V,'"projectId" not provided in firebase.initializeApp.');return new K(t.options.projectId)}(t))}get app(){if(!this._app)throw new $(P,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return void 0!==this._terminateTask}_setSettings(t){if(this._settingsFrozen)throw new $(P,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Ae(t),void 0!==t.credentials&&(this._authCredentials=function(t){if(!t)return new R;switch(t.type){case"gapi":const e=t.client;return _(!("object"!=typeof e||null===e||!e.auth||!e.auth.getAuthHeaderValueForFirstParty)),new B(e,t.sessionIndex||"0",t.iamToken||null);case"provider":return t.client;default:throw new $(V,"makeAuthCredentialsProvider failed due to invalid credential type")}}(t.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask||(this._terminateTask=this._terminate()),this._terminateTask}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const e=be.get(t);e&&(m("ComponentProvider","Removing Datastore"),be.delete(t),e.terminate())}(this),Promise.resolve()}}function Ve(t=Object(u["e"])()){return Object(u["b"])(t,"firestore/lite").getImmediate()}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Te{constructor(t,e,n){this.converter=e,this._key=n,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new De(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new Te(this.firestore,t,this._key)}}class Ee{constructor(t,e,n){this.converter=e,this._query=n,this.type="query",this.firestore=t}withConverter(t){return new Ee(this.firestore,t,this._query)}}class De extends Ee{constructor(t,e,n){super(t,e,new Wt(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new Te(this.firestore,null,new X(t))}withConverter(t){return new De(this.firestore,t,this._path)}}function Ne(t,e,...n){if(t=Object(h["g"])(t),J("collection","path",e),t instanceof Ie){const r=Q.fromString(e,...n);return Z(r),new De(t,null,r)}{if(!(t instanceof Te||t instanceof De))throw new $(V,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(Q.fromString(e,...n));return Z(r),new De(t.firestore,null,r)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ce{constructor(...t){for(let e=0;e<t.length;++e)if(0===t[e].length)throw new $(V,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new W(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Pe{constructor(t){this._byteString=t}static fromBase64String(t){try{return new Pe(gt.fromBase64String(t))}catch(t){throw new $(V,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(t){return new Pe(gt.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oe{constructor(t){this._methodName=t}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ke{constructor(t,e){if(!isFinite(t)||t<-90||t>90)throw new $(V,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(e)||e<-180||e>180)throw new $(V,"Longitude must be a number between -180 and 180, but was: "+e);this._lat=t,this._long=e}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(t){return lt(this._lat,t._lat)||lt(this._long,t._long)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xe=/^__.*__$/;function Le(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw w()}}class Fe{constructor(t,e,n,r,s,i){this.settings=t,this.databaseId=e,this.q=n,this.ignoreUndefinedProperties=r,void 0===s&&this.Z(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get tt(){return this.settings.tt}et(t){return new Fe(Object.assign(Object.assign({},this.settings),t),this.databaseId,this.q,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}nt(t){var e;const n=null===(e=this.path)||void 0===e?void 0:e.child(t),r=this.et({path:n,rt:!1});return r.st(t),r}it(t){var e;const n=null===(e=this.path)||void 0===e?void 0:e.child(t),r=this.et({path:n,rt:!1});return r.Z(),r}ot(t){return this.et({path:void 0,rt:!0})}ut(t){return Ke(t,this.settings.methodName,this.settings.ct||!1,this.path,this.settings.at)}contains(t){return void 0!==this.fieldMask.find(e=>t.isPrefixOf(e))||void 0!==this.fieldTransforms.find(e=>t.isPrefixOf(e.field))}Z(){if(this.path)for(let t=0;t<this.path.length;t++)this.st(this.path.get(t))}st(t){if(0===t.length)throw this.ut("Document fields must not be empty");if(Le(this.tt)&&xe.test(t))throw this.ut('Document fields cannot begin and end with "__"')}}class $e{constructor(t,e,n){this.databaseId=t,this.ignoreUndefinedProperties=e,this.q=n||ve(t)}ht(t,e,n,r=!1){return new Fe({tt:t,methodName:e,at:n,path:W.emptyPath(),rt:!1,ct:r},this.databaseId,this.q,this.ignoreUndefinedProperties)}}function qe(t){const e=t._freezeSettings(),n=ve(t._databaseId);return new $e(t._databaseId,!!e.ignoreUndefinedProperties,n)}function Re(t,e,n,r=!1){return Ue(n,t.ht(r?4:3,e))}function Ue(t,e){if(Be(t=Object(h["g"])(t)))return Me("Unsupported field value:",e,t),je(t,e);if(t instanceof Oe)return function(t,e){if(!Le(e.tt))throw e.ut(t._methodName+"() can only be used with update() and set()");if(!e.path)throw e.ut(t._methodName+"() is not currently supported inside arrays");const n=t._toFieldTransform(e);n&&e.fieldTransforms.push(n)}(t,e),null;if(void 0===t&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.rt&&4!==e.tt)throw e.ut("Nested arrays are not supported");return function(t,e){const n=[];let r=0;for(const s of t){let t=Ue(s,e.ot(r));null==t&&(t={nullValue:"NULL_VALUE"}),n.push(t),r++}return{arrayValue:{values:n}}}(t,e)}return function(t,e){if(null===(t=Object(h["g"])(t)))return{nullValue:"NULL_VALUE"};if("number"==typeof t)return re(e.q,t);if("boolean"==typeof t)return{booleanValue:t};if("string"==typeof t)return{stringValue:t};if(t instanceof Date){const n=dt.fromDate(t);return{timestampValue:oe(e.q,n)}}if(t instanceof dt){const n=new dt(t.seconds,1e3*Math.floor(t.nanoseconds/1e3));return{timestampValue:oe(e.q,n)}}if(t instanceof ke)return{geoPointValue:{latitude:t.latitude,longitude:t.longitude}};if(t instanceof Pe)return{bytesValue:ue(e.q,t._byteString)};if(t instanceof Te){const n=e.databaseId,r=t.firestore._databaseId;if(!r.isEqual(n))throw e.ut(`Document reference is for database ${r.projectId}/${r.database} but should be for database ${n.projectId}/${n.database}`);return{referenceValue:le(t.firestore._databaseId||e.databaseId,t._key.path)}}throw e.ut("Unsupported field value: "+tt(t))}(t,e)}function je(t,e){const n={};return function(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):mt(t,(t,r)=>{const s=Ue(r,e.nt(t));null!=s&&(n[t]=s)}),{mapValue:{fields:n}}}function Be(t){return!("object"!=typeof t||null===t||t instanceof Array||t instanceof Date||t instanceof dt||t instanceof ke||t instanceof Pe||t instanceof Te||t instanceof Oe)}function Me(t,e,n){if(!Be(n)||!function(t){return"object"==typeof t&&null!==t&&(Object.getPrototypeOf(t)===Object.prototype||null===Object.getPrototypeOf(t))}(n)){const r=tt(n);throw"an object"===r?e.ut(t+" a custom object"):e.ut(t+" "+r)}}const Ge=new RegExp("[~\\*/\\[\\]]");function ze(t,e,n){if(e.search(Ge)>=0)throw Ke(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new Ce(...e.split("."))._internalPath}catch(r){throw Ke(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function Ke(t,e,n,r,s){const i=r&&!r.isEmpty(),a=void 0!==s;let o=`Function ${e}() called with invalid data`;n&&(o+=" (via `toFirestore()`)"),o+=". ";let u="";return(i||a)&&(u+=" (found",i&&(u+=" in field "+r),a&&(u+=" in document "+s),u+=")"),new $(V,o+t+u)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class He{constructor(t,e,n,r,s){this._firestore=t,this._userDataWriter=e,this._key=n,this._document=r,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new Te(this._firestore,this._converter,this._key)}exists(){return null!==this._document}data(){if(this._document){if(this._converter){const t=new Qe(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}get(t){if(this._document){const e=this._document.data.field(We("DocumentSnapshot.get",t));if(null!==e)return this._userDataWriter.convertValue(e)}}}class Qe extends He{data(){return super.data()}}class Ye{constructor(t,e){this._docs=e,this.query=t}get docs(){return[...this._docs]}get size(){return this.docs.length}get empty(){return 0===this.docs.length}forEach(t,e){this._docs.forEach(t,e)}}function We(t,e){return"string"==typeof e?ze(t,e):e instanceof Ce?e._internalPath:e._delegate._internalPath}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xe{}function Je(t,...e){for(const n of e)t=n._apply(t);return t}class Ze extends Xe{constructor(t,e,n){super(),this.dt=t,this.wt=e,this.yt=n,this.type="where"}_apply(t){const e=qe(t.firestore),n=function(t,e,n,r,s,i,a){let o;if(s.isKeyField()){if("array-contains"===i||"array-contains-any"===i)throw new $(V,`Invalid Query. You can't perform '${i}' queries on documentId().`);if("in"===i||"not-in"===i){ln(a,i);const e=[];for(const n of a)e.push(cn(r,t,n));o={arrayValue:{values:e}}}else o=cn(r,t,a)}else"in"!==i&&"not-in"!==i&&"array-contains-any"!==i||ln(a,i),o=Re(n,e,a,"in"===i||"not-in"===i);const u=Rt.create(s,i,o);return function(t,e){if(e.N()){const n=Zt(t);if(null!==n&&!n.isEqual(e.field))throw new $(V,`Invalid query. All where filters with an inequality (<, <=, !=, not-in, >, or >=) must be on the same field. But you have inequality filters on '${n.toString()}' and '${e.field.toString()}'`);const r=Jt(t);null!==r&&hn(t,e.field,r)}const n=function(t,e){for(const n of t.filters)if(e.indexOf(n.op)>=0)return n.op;return null}(t,function(t){switch(t){case"!=":return["!=","not-in"];case"array-contains":return["array-contains","array-contains-any","not-in"];case"in":return["array-contains-any","in","not-in"];case"array-contains-any":return["array-contains","array-contains-any","in","not-in"];case"not-in":return["array-contains","array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(null!==n)throw n===e.op?new $(V,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new $(V,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}(t,u),u}(t._query,"where",e,t.firestore._databaseId,this.dt,this.wt,this.yt);return new Ee(t.firestore,t.converter,function(t,e){const n=t.filters.concat([e]);return new Wt(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}(t._query,n))}}function tn(t,e,n){const r=e,s=We("where",t);return new Ze(s,r,n)}class en extends Xe{constructor(t,e){super(),this.dt=t,this._t=e,this.type="orderBy"}_apply(t){const e=function(t,e,n){if(null!==t.startAt)throw new $(V,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(null!==t.endAt)throw new $(V,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");const r=new Yt(e,n);return function(t,e){if(null===Jt(t)){const n=Zt(t);null!==n&&hn(t,n,e.field)}}(t,r),r}(t._query,this.dt,this._t);return new Ee(t.firestore,t.converter,function(t,e){const n=t.explicitOrderBy.concat([e]);return new Wt(t.path,t.collectionGroup,n,t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt)}(t._query,e))}}function nn(t,e="asc"){const n=e,r=We("orderBy",t);return new en(r,n)}class rn extends Xe{constructor(t,e,n){super(),this.type=t,this.gt=e,this.vt=n}_apply(t){return new Ee(t.firestore,t.converter,function(t,e,n){return new Wt(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}(t._query,this.gt,this.vt))}}function sn(t){return nt("limit",t),new rn("limit",t,"F")}class an extends Xe{constructor(t,e,n){super(),this.type=t,this.bt=e,this.Et=n}_apply(t){const e=un(t,this.type,this.bt,this.Et);return new Ee(t.firestore,t.converter,function(t,e){return new Wt(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),t.limit,t.limitType,e,t.endAt)}(t._query,e))}}function on(...t){return new an("startAfter",t,!1)}function un(t,e,n,r){if(n[0]=Object(h["g"])(n[0]),n[0]instanceof He)return function(t,e,n,r,s){if(!r)throw new $(E,`Can't use a DocumentSnapshot that doesn't exist for ${n}().`);const i=[];for(const a of ee(t))if(a.field.isKeyField())i.push(Nt(e,r.key));else{const t=r.data.field(a.field);if(bt(t))throw new $(V,'Invalid query. You are trying to start or end a query using a document for which the field "'+a.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(null===t){const t=a.field.canonicalString();throw new $(V,`Invalid query. You are trying to start or end a query using a document for which the field '${t}' (used as the orderBy) does not exist.`)}i.push(t)}return new Qt(i,s)}(t._query,t.firestore._databaseId,e,n[0]._document,r);{const s=qe(t.firestore);return function(t,e,n,r,s,i){const a=t.explicitOrderBy;if(s.length>a.length)throw new $(V,`Too many arguments provided to ${r}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const o=[];for(let u=0;u<s.length;u++){const i=s[u];if(a[u].field.isKeyField()){if("string"!=typeof i)throw new $(V,`Invalid query. Expected a string for document ID in ${r}(), but got a ${typeof i}`);if(!te(t)&&-1!==i.indexOf("/"))throw new $(V,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${r}() must be a plain document ID, but '${i}' contains a slash.`);const n=t.path.child(Q.fromString(i));if(!X.isDocumentKey(n))throw new $(V,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${r}() must result in a valid document path, but '${n}' is not because it contains an odd number of segments.`);const s=new X(n);o.push(Nt(e,s))}else{const t=Re(n,r,i);o.push(t)}}return new Qt(o,i)}(t._query,t.firestore._databaseId,s,e,n,r)}}function cn(t,e,n){if("string"==typeof(n=Object(h["g"])(n))){if(""===n)throw new $(V,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!te(e)&&-1!==n.indexOf("/"))throw new $(V,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child(Q.fromString(n));if(!X.isDocumentKey(r))throw new $(V,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Nt(t,new X(r))}if(n instanceof Te)return Nt(t,n._key);throw new $(V,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${tt(n)}.`)}function ln(t,e){if(!Array.isArray(t)||0===t.length)throw new $(V,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`);if(t.length>10)throw new $(V,`Invalid Query. '${e.toString()}' filters support a maximum of 10 elements in the value array.`)}function hn(t,e,n){if(!n.isEqual(e))throw new $(V,`Invalid query. You have a where filter with an inequality (<, <=, !=, not-in, >, or >=) on field '${e.toString()}' and so you must also use '${e.toString()}' as your first argument to orderBy(), but your first orderBy() is on field '${n.toString()}' instead.`)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dn extends class{convertValue(t,e="none"){switch(It(t)){case 0:return null;case 1:return t.booleanValue;case 2:return wt(t.integerValue||t.doubleValue);case 3:return this.convertTimestamp(t.timestampValue);case 4:return this.convertServerTimestamp(t,e);case 5:return t.stringValue;case 6:return this.convertBytes(_t(t.bytesValue));case 7:return this.convertReference(t.referenceValue);case 8:return this.convertGeoPoint(t.geoPointValue);case 9:return this.convertArray(t.arrayValue,e);case 10:return this.convertObject(t.mapValue,e);default:throw w()}}convertObject(t,e){const n={};return mt(t.fields,(t,r)=>{n[t]=this.convertValue(r,e)}),n}convertGeoPoint(t){return new ke(wt(t.latitude),wt(t.longitude))}convertArray(t,e){return(t.values||[]).map(t=>this.convertValue(t,e))}convertServerTimestamp(t,e){switch(e){case"previous":const n=St(t);return null==n?null:this.convertValue(n,e);case"estimate":return this.convertTimestamp(At(t));default:return null}}convertTimestamp(t){const e=vt(t);return new dt(e.seconds,e.nanos)}convertDocumentKey(t,e){const n=Q.fromString(t);_(ye(n));const r=new K(n.get(1),n.get(3)),s=new X(n.popFirst(5));return r.isEqual(e)||g(`Document ${s} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`),s}}{constructor(t){super(),this.firestore=t}convertBytes(t){return new Pe(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new Te(this.firestore,null,e)}}function fn(t){!function(t){if(Xt(t)&&0===t.explicitOrderBy.length)throw new $(x,"limitToLast() queries require specifying at least one orderBy() clause")}((t=et(t,Ee))._query);const e=Se(t.firestore),n=new dn(t.firestore);return _e(e,t._query).then(e=>{const r=e.map(e=>new Qe(t.firestore,n,e.key,e,t.converter));return Xt(t._query)&&r.reverse(),new Ye(t,r)})}!function(t){f=t}(u["a"]+"_lite"),Object(u["c"])(new c["a"]("firestore/lite",(t,{options:e})=>{const n=t.getProvider("app").getImmediate(),r=new Ie(n,new U(t.getProvider("auth-internal")),new G(t.getProvider("app-check-internal")));return e&&r._setSettings(e),r},"PUBLIC")),Object(u["g"])("firestore-lite","3.4.6",""),Object(u["g"])("firestore-lite","3.4.6","esm2017");var pn=n("5802"),mn=n("07bc"),gn=20,yn=a["default"].extend({name:"SaveDataList",components:{},data:function(){return{areaItems:[],selectedArea:531,level:o["e"].HARD,levelItems:o["h"].DIFFICULTY_LEVELS,savedata:[],isLoading:!1,lastMap:0,lastLevel:0,lastDocument:void 0}},mounted:function(){for(var t=[],e=o["h"].WORLDS,n=function(n){var r=e[n],s=o["h"].MAPS.filter((function(t){return Math.floor(t.value/10)===r.value}));if(!s.length)return"continue";n>0&&t.push({divider:!0}),t.push({header:r.text});for(var i=0;i<s.length;i+=1){var a=s[i],u=r.value>40?"E":"".concat(r.value);t.push({value:a.value,text:"".concat(u,"-").concat(a.value%10,"：").concat(a.text),group:r.text})}},r=0;r<e.length;r+=1)n(r);this.areaItems=t;var s=this.$store.state.searchedList;s&&s.length&&(this.savedata=s)},computed:{isEvent:function(){return Math.floor(this.selectedArea/10)>40},isSameSearchCondition:function(){return this.lastMap===this.selectedArea&&this.lastLevel===this.level},enabledMoreLoad:function(){return!!this.lastDocument&&this.isSameSearchCondition}},methods:{changedWorld:function(){this.isLoading=!1},searchPreset:function(){var t=this;return Object(i["a"])(regeneratorRuntime.mark((function e(){var n,r,s,i,a,o;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return t.isLoading=!0,t.enabledMoreLoad||(t.savedata=[]),e.prev=2,n=Ve(t.$store.state.firebase),r=4-t.level,s=t.isEvent?t.lastDocument?Je(Ne(n,"presets"),tn("map","==",t.selectedArea),tn("level","==",r),nn("createdAt","desc"),on(t.lastDocument),sn(gn)):Je(Ne(n,"presets"),tn("map","==",t.selectedArea),tn("level","==",r),nn("createdAt","desc"),sn(gn)):t.lastDocument?Je(Ne(n,"presets"),tn("map","==",t.selectedArea),tn("level","==",0),nn("createdAt","desc"),on(t.lastDocument),sn(gn)):Je(Ne(n,"presets"),tn("map","==",t.selectedArea),tn("level","==",0),nn("createdAt","desc"),sn(gn)),t.lastMap=t.selectedArea,t.lastLevel=t.level,e.next=10,fn(s);case 10:i=e.sent,a=[],o=new pn["a"](t.$store.state.items,t.$store.state.ships,t.$store.state.defaultEnemies),i.forEach((function(t){var e=t.data(),n=o.restoreOldSaveData(t.data().data);n&&(e.ships=n.fleetInfo.fleets[0].ships,e.manager=n,e.createdAt=pn["a"].formatDate(t.data().createdAt.toDate(),"yyyy/MM/dd HH:mm:ss"),a.push(e))})),t.lastDocument&&t.savedata?t.savedata=t.savedata.concat(a):t.savedata=a,i&&i.docs.length>=gn?t.lastDocument=i.docs[i.docs.length-1]:t.lastDocument=void 0,t.$store.dispatch("setSearchedList",t.savedata),e.next=22;break;case 19:e.prev=19,e.t0=e["catch"](2),t.savedata=[];case 22:t.isLoading=!1;case 23:case"end":return e.stop()}}),e,null,[[2,19]])})))()},expandPreset:function(t){var e=this.$store.state.saveData;e.disabledMain();var n=new mn["a"];n.name=t.name,n.remarks=t.memo,n.tempData=[t.manager],n.tempIndex=0,n.isActive=!0,n.isMain=!0,e.childItems.push(n),this.$store.dispatch("updateSaveData",e),this.$store.dispatch("setMainSaveData",n),this.$router.push("aircalc")}}}),vn=yn,wn=(n("2556"),n("2877")),_n=n("6544"),bn=n.n(_n),Sn=n("8336"),An=n("b0af"),In=n("ce7e"),Vn=n("132d"),Tn=n("adda"),En=n("490a"),Dn=n("b974"),Nn=n("2fa4"),Cn=Object(wn["a"])(vn,r,s,!1,null,"4aec3b7f",null);e["default"]=Cn.exports;bn()(Cn,{VBtn:Sn["a"],VCard:An["a"],VDivider:In["a"],VIcon:Vn["a"],VImg:Tn["a"],VProgressCircular:En["a"],VSelect:Dn["a"],VSpacer:Nn["a"]})},2556:function(t,e,n){"use strict";n("85c9")},"85c9":function(t,e,n){}}]);
//# sourceMappingURL=chunk-14a9fcb0.ba451db0.js.map