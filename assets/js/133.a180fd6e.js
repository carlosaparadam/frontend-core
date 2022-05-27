(window.webpackJsonp=window.webpackJsonp||[]).push([[133],{335:function(t,e,s){"use strict";s.r(e);var a=s(0),n=Object(a.a)({},(function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"content"},[t._m(0),t._v(" "),s("p",[t._v("This feature is to respond to people's needs. In fact, I do not use this feature in company projects or personal projects. In the past, those traditional back-end frameworks often included this feature. Since most of the previous back-end projects were in the form of multiple pages, the navigation feature of the tags view still has some basic meaning. Most of them are based on the iframe.")]),t._v(" "),s("p",[t._v("However, with the development of the times, the background projects are almost all spa (single page web application single page development), and it is obviously not appropriate to use the previous way to implement the navigation of the tags.")]),t._v(" "),s("p",[t._v("So the current plan is:")]),t._v(" "),t._m(1),t._v(" "),t._m(2),t._v(" "),t._m(3),t._m(4),t._v(" "),t._m(5),t._v(" "),s("p",[t._v("The current tag-view maintains two arrays.")]),t._v(" "),s("ul",[s("li",[t._v("visitedViews : The page the user has visited is a collection of tag arrays displayed in the tags bar navigation.")]),t._v(" "),s("li",[t._v("cachedViews : The actual keep-alive route. You can set whether or not you want to cache the route by configuring the route with "),s("code",[t._v("meta.noCache")]),t._v(".\n"),s("router-link",{attrs:{to:"./router-and-nav.html"}},[t._v("Configuration Document")])],1)]),t._v(" "),t._m(6),t._v(" "),s("p",[t._v("Because keep-alive and router-view are strongly coupled, and it is not difficult to find the keep-alive include default is to match the component's name, it is necessary to look at the document and source code when writing the routing component corresponding to the routing router and route.")]),t._v(" "),s("p",[t._v("Make sure the name of both is exactly the same. (Keep in mind that the naming of the name is as unique as possible. Remember not to duplicate the naming of some components, or to refer to the last memory overflow issue recursively.)")]),t._v(" "),t._m(7),t._v(" "),t._m(8),t._m(9),s("p",[t._v("Make sure that the two names are the same. Remember not to write duplicates or mistakes. By default, if you do not write name, it will not be cached.")]),t._v(" "),s("p",[t._v("For details, see\n"),s("a",{attrs:{href:"https://github.com/vuejs/vue/issues/6938#issuecomment-345728620",target:"_blank",rel:"noopener noreferrer"}},[t._v("issue"),s("OutboundLink")],1),t._v(".")]),t._v(" "),t._m(10),t._v(" "),t._m(11),t._v(" "),s("ul",[s("li",[s("p",[t._v("Instead of using keep-alive's include, keep-alive caches all components directly. This way, it supports the aforementioned business situation.\nTo "),s("a",{attrs:{href:"https://github.com/adempiere/adempiere-vue/blob/master/src/layout/components/AppMain.vue",target:"_blank",rel:"noopener noreferrer"}},[t._v("@/layout/components/AppMain.vue"),s("OutboundLink")],1),t._v(" remove the "),s("code",[t._v("include")]),t._v(" related code. Of course, using keep-alive directly also has disadvantages. He can't dynamically delete the cache. You can only help it to set a maximum cache instance limit.\n"),s("a",{attrs:{href:"https://github.com/vuejs/vue/issues/6509",target:"_blank",rel:"noopener noreferrer"}},[t._v("issue"),s("OutboundLink")],1)])]),t._v(" "),t._m(12)]),t._v(" "),s("h2",{attrs:{id:"affix"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#affix"}},[t._v("#")]),t._v(" Affix "),s("Badge",{attrs:{text:"v3.10.0+"}})],1),t._v(" "),t._m(13),t._v(" "),t._m(14),t._v(" "),t._m(15),t._m(16),t._v(" "),t._m(17),t._v(" "),t._m(18),t._v(" "),t._m(19),t._m(20)])}),[function(){var t=this.$createElement,e=this._self._c||t;return e("h1",{attrs:{id:"tags-view"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#tags-view"}},[this._v("#")]),this._v(" Tags View")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[this._v("Use a combination of "),e("code",[this._v("keep-alive")]),this._v(" and "),e("code",[this._v("router-view")]),this._v(" .")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[this._v("Code: "),e("code",[this._v("@/layout/components/AppMain.vue")])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"language-html extra-class"},[s("pre",{pre:!0,attrs:{class:"language-html"}},[s("code",[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("keep-alive")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v(":include")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation attr-equals"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("cachedViews"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("router-view")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("router-view")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("keep-alive")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n")])])])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[this._v("The actual action of the tags view navigation is equivalent to another nav display mode. In fact, it is a router-link, and click to jump to the corresponding page. Then we are listening to changes in the route "),e("code",[this._v("$route")]),this._v(" to determine if the current page needs to be reloaded or cached.")])},function(){var t=this.$createElement,e=this._self._c||t;return e("h2",{attrs:{id:"visitedviews-cachedviews"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#visitedviews-cachedviews"}},[this._v("#")]),this._v(" visitedViews && cachedViews")])},function(){var t=this.$createElement,e=this._self._c||t;return e("h2",{attrs:{id:"precautions"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#precautions"}},[this._v("#")]),this._v(" Precautions")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[e("strong",[this._v("DEMO:")])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"language-js extra-class"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//Define routes")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("path")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'create-form'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("component")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'@/views/form/create'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'createForm'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("meta")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("title")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'createForm'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("icon")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'table'")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"language-js extra-class"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//The corresponding view of the route. such as: form/create")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("default")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'createForm'")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this.$createElement,e=this._self._c||t;return e("h2",{attrs:{id:"cache-is-not-suitable-for-the-scene"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#cache-is-not-suitable-for-the-scene"}},[this._v("#")]),this._v(" Cache is not suitable for the scene")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[this._v("Currently cached solutions are not suitable for certain services, such as the article details page such as "),e("code",[this._v("/article/1")]),this._v("、"),e("code",[this._v("/article/2")]),this._v(", their routes are different but the corresponding components are the same, so their component name is the same, As mentioned earlier, the "),e("code",[this._v("keep-alive")]),this._v(" include can only be cached based on the component name, so this is a problem. There are currently two solutions:")])},function(){var t=this.$createElement,e=this._self._c||t;return e("li",[e("p",[this._v("Use a browser cache scheme such as localStorage, own to control the cache.")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[this._v("If the Affix attribute is added to the route, the current "),e("code",[this._v("tag")]),this._v(" will be fixed in "),e("code",[this._v("tags-view")]),this._v(" (cannot be deleted).")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[e("img",{attrs:{src:"https://user-images.githubusercontent.com/8121621/52840303-cd5c9280-3133-11e9-928f-e2825eaab51b.png",alt:""}})])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"language-js extra-class"},[s("div",{staticClass:"highlight-lines"},[s("br"),s("br"),s("br"),s("br"),s("br"),s("br"),s("br"),s("br"),s("br"),s("br"),s("br"),s("br"),s("br"),s("div",{staticClass:"highlighted"},[t._v(" ")]),s("br"),s("br"),s("br"),s("br"),s("br")]),s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("path")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("''")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("component")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" Layout"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("redirect")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'dashboard'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("children")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("path")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'dashboard'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("component")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'@/views/dashboard/index'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'Dashboard'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("meta")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n          "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("title")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'dashboard'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n          "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("icon")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'dashboard'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n          "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("noCache")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("true")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n          "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("affix")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("true")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])},function(){var t=this.$createElement,e=this._self._c||t;return e("h2",{attrs:{id:"remove"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#remove"}},[this._v("#")]),this._v(" Remove")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[this._v("In fact, keep-alive "),e("a",{attrs:{href:"(https://github.com/vuejs/vue/blob/dev/src/core/components/keep-alive.js)"}},[this._v("source code")]),this._v(" is not complicated, but the logic is still quite around. Before the vue author himself fixed a bug, he was not careful, he made two versions to fix it, so if there is no user who needs the navigation bar, it is recommended Remove this feature.")])},function(){var t=this.$createElement,e=this._self._c||t;return e("p",[this._v("First find\n"),e("code",[this._v("@/layout/components/AppMain.vue")]),this._v(" and remove "),e("code",[this._v("keep-alive")])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"language-html extra-class"},[s("pre",{pre:!0,attrs:{class:"language-html"}},[s("code",[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("template")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("section")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation attr-equals"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("app-main"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token special-attr"}},[s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("style")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation attr-equals"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),s("span",{pre:!0,attrs:{class:"token value css language-css"}},[s("span",{pre:!0,attrs:{class:"token property"}},[t._v("min-height")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 100%")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("transition")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation attr-equals"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("fade-transform"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("mode")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation attr-equals"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("out-in"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("router-view")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("router-view")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v('\x3c!-- or <router-view :key="key"/> --\x3e')]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("transition")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("section")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("template")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n")])])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("p",[t._v("Remove the entire file "),s("code",[t._v("@/layout/components/TagsView.vue")]),t._v(". Then, remove the reference to "),s("code",[t._v("TagsView")]),t._v(" in "),s("code",[t._v("@/layout/components/index")]),t._v(" and in "),s("code",[t._v("@/layout/Layout.vue")]),t._v(". Finally, remove the file "),s("code",[t._v("@/store/modules/tagsView")]),t._v(".")])}],!1,null,null,null);e.default=n.exports}}]);