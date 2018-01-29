!function(t,e){t.Application=e.extend({model:{},view:{},service:{},template:{}},Backbone.Events)}(window,_),function(t,e,i){t.SoundPlayer=function(){this.play=function(t){};var t=[];this.addSounds=function(e){t.push(e)};var s=this;e.setup({url:i.rootPath+"swf/",onready:function(){if(s.play=function(t){e.play(t)},s.addSounds=function(t){for(var s in t)e.createSound({id:s,url:i.rootPath+t[s],autoLoad:!0,autoPlay:!1,volume:100})},s.addSounds({message:i.ui.messageSound}),t.length>0)for(var o=0;o<t.length;o++)s.addSounds(t[o])}})}}(window.Application,soundManager,chatConfig),function(t,e){t.GuestSettingsModel=Backbone.Model.extend({defaults:{sound:!0,scroll:!0,emots:!0,show:!0},initialize:function(){this.fetch(),this.on("change",this.save,this)},save:function(){e.cookie("customer-chat-settings",JSON.stringify(this.attributes))},fetch:function(){e.cookie("customer-chat-settings")&&this.set(JSON.parse(e.cookie("customer-chat-settings")))}})}(window.Application,jQuery),function(t,e){t.MessageModel=Backbone.Model.extend({defaults:{author:"",body:"",toAuthor:"all",toAuthorMail:""},initialize:function(t,e){if(this.options=e||{},t){if("string"==typeof t.datetime?this.set("time",new Date(t.datetime.replace(/-/g,"/"))):"object"==typeof t.datetime&&this.set("time",t.datetime),"string"==typeof t.from_user_info&&"all"!==t.from_user_info)try{t.from_user_info=JSON.parse(t.from_user_info)}catch(i){}if("object"==typeof t.from_user_info){var s=t.from_user_info;this.fromUser=s,0===this.get("author").length&&this.set("author",s.name),this.has("authorMail")||this.set("authorMail",s.mail)}if("string"==typeof t.to_user_info&&"all"!==t.to_user_info)try{t.to_user_info=JSON.parse(t.to_user_info)}catch(i){}if("object"==typeof t.to_user_info){var o=t.to_user_info;this.toUser=o,this.set("toAuthor",o.name),this.set("toAuthorMail",o.mail)}}},getAge:function(){var t=Math.floor((new Date).getTime()/1e3),i=Math.floor(this.get("time").getTime()/1e3-(this.options.localMessage?0:e.serverTimeDifference));return Math.ceil(t-i)},getReadableName:function(){var t=this.get("author");return-1!==t.lastIndexOf("-")?t.slice(0,t.lastIndexOf("-")):t},getToUserReadableName:function(){var t=this.get("toAuthor");return-1!==t.lastIndexOf("-")?t.slice(0,t.lastIndexOf("-")):t},getTalkName:function(){var t=this.get("toAuthor");return this.getReadableName()+(t?"/"+(-1!==t.lastIndexOf("-")?t.slice(0,t.lastIndexOf("-")):t):"")}})}(window.Application,window.chatConfig),function(t,e,i,s){var o=t.GuestChatModel=Backbone.Model.extend({defaults:{name:"anonymous",mail:""},operatorsCache:{},lastMessages:[],lastTypingUpdate:0,initialize:function(){this.once("operators:online",this.manageConnection,this),this.on("messages:new",this.storeMessages,this),this.on("messages:new",this.confirmMessagesRead,this)},autoLogin:function(){var t=this;e.post(i.isLoggedInPath,{info:JSON.stringify(i.info)},function(s){s.success?(t.set({name:s.name,mail:s.mail,image:s.image}),t.trigger("login:success"),e.get(i.lastMessagesPath,function(e){e.success&&e.messages.length>0&&t.trigger("messages:last",e.messages)})):t.trigger("login:login")})},login:function(t){var s=this;t.info=JSON.stringify(i.info),e.post(i.loginPath,t,function(e){e.success?(s.set({name:t.name,mail:t.mail,image:t.image}),s.trigger("login:success")):s.trigger("login:error")})},logout:function(){this.connectionTimer&&clearInterval(this.connectionTimer);var s=this;this.sendMessage(new t.MessageModel({body:"[ user has closed the chat ]"}),function(){e.post(i.logoutPath,function(t){t&&t.success?s.trigger("logout:success"):s.trigger("logout:error")})}),this.lastMessages=[],this.trigger("logout:init"),this.once("operators:online",this.manageConnection,this)},checkOperators:function(){var t=this;e.get(i.isOperatorOnlinePath,function(e){e.success?t.trigger("operators:online"):t.trigger("operators:offline")})},keepAlive:function(){e.get(i.keepAlivePath)},updateTypingStatus:function(){var t=this.lastOperator&&this.lastOperator.id;if(t){var s=(new Date).getTime();this.lastTypingUpdate+o.POLLING_INTERVAL<s&&(this.lastTypingUpdate=s,e.post(i.updateTypingStatusPath,{secondUserId:t,status:!0}))}},getTypingStatus:function(){var t=this.lastOperator&&this.lastOperator.id;if(t){var s=this;e.post(i.getTypingStatusPath,{ids:[t]},function(e){e.success&&e.results[t]&&s.trigger("operator:typing")})}},getMessages:function(){var t=this;e.get(i.newMessagesPath,function(e){e.length>0&&t.loadOperatorsData(e,function(){e.authorType="operator",t.trigger("messages:new",e)})})},confirmMessagesRead:function(t){var t={firstId:t[0].id,lastId:t[t.length-1].id};e.post(i.markMessagesReadPath,t)},storeMessages:function(t){s.each(t,function(t){!t.datetime&&t.time&&(t.datetime=t.time.getTime())}),this.lastMessages=this.lastMessages.concat(t)},storeOperator:function(t){this.lastOperator=this.operatorsCache[t.id]=t},loadOperatorsData:function(t,s){for(var o=this,n=0,a=0;a<t.length;a++){var h=t[a];this.operatorsCache[h.from_id]||(n++,e.post(i.getOperatorPath,{id:h.from_id}).success(function(t){t.success&&o.storeOperator(t.user)}).always(function(){n--,0>=n&&s()}))}0>=n&&s()},getOperatorName:function(t){return this.operatorsCache[t]&&this.operatorsCache[t].name},sendMessage:function(t,s){var o={body:t.get("body")},n=this;e.post(i.sendMessagePath,o,function(t){t.success?n.trigger("messages:sent"):n.trigger("messages:sendError"),s&&s(t)}),this.storeMessages([t.attributes])},manageConnection:function(){var t=this;this.connectionTimer=setInterval(function(){t.getMessages(),t.keepAlive(),t.getTypingStatus(),t.checkOperators()},o.POLLING_INTERVAL)}},{POLLING_INTERVAL:5e3})}(window.Application,jQuery,window.chatConfig,_),function(t,e,i){t.LoginFormView=Backbone.View.extend({mailExp:new RegExp("^[-+\\.0-9=a-z_]+@([-0-9a-z]+\\.)+([0-9a-z]){2,}$","i"),nameValid:!1,mailValid:!1,initialize:function(){this.$name=this.$("#customer-chat-login-name"),this.$mail=this.$("#customer-chat-login-mail"),this.$name.on("input change keydown blur",e.proxy(this.validateName,this)),this.$mail.on("input change keydown blur",e.proxy(this.validateMail,this)),this.reset()},reset:function(){this.$name.val(""),this.$mail.val(""),this.$name.removeClass("customer-chat-input-error"),this.$mail.removeClass("customer-chat-input-error"),"true"!==i.ui.askForMail&&this.$mail.hide().val("anonymous@anonymous.anonymous")},validateName:function(){0==this.$name.val().length?(this.$name.addClass("customer-chat-input-error"),this.nameValid=!1):(this.$name.removeClass("customer-chat-input-error"),this.nameValid=!0)},validateMail:function(){0!=this.$mail.val().length&&this.mailExp.test(this.$mail.val())?(this.$mail.removeClass("customer-chat-input-error"),this.mailValid=!0):(this.$mail.addClass("customer-chat-input-error"),this.mailValid=!1)},isValid:function(){return this.validateName(),this.validateMail(),this.nameValid&&this.mailValid}})}(window.Application,jQuery,window.chatConfig),function(t,e){t.ContactFormView=Backbone.View.extend({mailExp:new RegExp("^[-+\\.0-9=a-z_]+@([-0-9a-z]+\\.)+([0-9a-z]){2,}$","i"),nameValid:!1,mailValid:!1,messageValid:!1,initialize:function(){this.$name=this.$("#customer-chat-contact-name"),this.$mail=this.$("#customer-chat-contact-mail"),this.$message=this.$("#customer-chat-contact-message"),this.$name.on("input change keydown blur",e.proxy(this.validateName,this)),this.$mail.on("input change keydown blur",e.proxy(this.validateMail,this)),this.$message.on("input change keydown blur",e.proxy(this.validateMessage,this))},reset:function(){this.$name.val(""),this.$mail.val(""),this.$message.val(""),this.$name.removeClass("customer-chat-input-error"),this.$mail.removeClass("customer-chat-input-error"),this.$message.removeClass("customer-chat-input-error")},validateName:function(){0==this.$name.val().length?(this.$name.addClass("customer-chat-input-error"),this.nameValid=!1):(this.$name.removeClass("customer-chat-input-error"),this.nameValid=!0)},validateMail:function(){0!=this.$mail.val().length&&this.mailExp.test(this.$mail.val())?(this.$mail.removeClass("customer-chat-input-error"),this.mailValid=!0):(this.$mail.addClass("customer-chat-input-error"),this.mailValid=!1)},validateMessage:function(){this.$message.val().length<6?(this.$message.addClass("customer-chat-input-error"),this.messageValid=!1):(this.$message.removeClass("customer-chat-input-error"),this.messageValid=!0)},isValid:function(){return this.validateName(),this.validateMail(),this.validateMessage(),this.nameValid&&this.mailValid&&this.messageValid}})}(window.Application,jQuery),function(t,e,i){var s=/(\w+:\/\/)?([\da-z\.\-@]+)\.([a-z\.]{2,})([?&=%#;\/\w\.-]*)*\/?/g,o=t.MessageView=Backbone.View.extend({initialize:function(){this.settings=t.model.settings,this.listenTo(this.model,"change",this.render),this.render(),this.$el.hide(),this.$el.fadeIn("fast")},render:function(){this.$el.html(i(t.template.message)),this.$time=this.$(".customer-chat-content-message-time");var e=this.model.get("body").split("<").join("&lt;").split(">").join("&gt;");e=this.prepareMessage(e),this.$(".customer-chat-content-message-author").html(this.model.getReadableName()||this.model.get("author")),this.$(".customer-chat-content-message-body").html(e),this.updateTime(!0),"operator"==this.model.get("authorType")&&(this.$(".customer-chat-content-message").removeClass("customer-chat-content-message").addClass("customer-chat-content-message-operator"),this.$(".customer-chat-content-message-avatar").removeClass("customer-chat-content-message-avatar").addClass("customer-chat-content-message-avatar-operator")),this.model.fromUser&&this.model.fromUser.image&&this.$(".avatar").css("background-image",'url("'+this.model.fromUser.image+'")'),t.UserInfoPopoverView&&new t.UserInfoPopoverView({model:this.model,button:this.$(".customer-chat-content-message-author")[0]})},prepareMessage:function(t){if(t=t.replace(s,function(t,e){return-1!==t.indexOf("@")?t:-1!==t.indexOf("..")?t:o.createLinkElement(t,(e?"":"http://")+t)}),this.settings.get("emots"))for(var e in o.EMOTICONS)t=t.split(e).join(o.createEmotElement(o.EMOTICONS[e]));return t},updateTime:function(t){var i=this.model.getAge(),s=Math.floor(i/60),o=Math.floor(s/60),n=Math.floor(o/24),a=Math.floor(n/7),h=this.model.get("time"),r=(h.getDate()<10?"0":"")+h.getDate()+"."+(h.getMonth()+1<10?"0":"")+(h.getMonth()+1)+"."+h.getFullYear(),c=(h.getHours()<10?"0":"")+h.getHours()+":"+(h.getMinutes()<10?"0":"")+h.getMinutes()+":"+(h.getSeconds()<10?"0":"")+h.getSeconds(),l=r+" "+c;if(this.options.fullDate)return void this.$time.html(l);var g=a>0?l:n>0?n+" "+e.ui.timeDaysAgo:o>0?o+" "+e.ui.timeHoursAgo:s>0?s+" "+e.ui.timeMinutesAgo:Math.max(i-i%5,1)+" "+e.ui.timeSecondsAgo;if(this.$time.html(g),t){var m=n>0?-1:o>0?60*(60-s%60)*60:s>5?60*(5-s%5):s>0?60:10-i%10;if(-1==m)return;var u=this;this.timerId=setTimeout(function(){u.updateTime(!0)},1e3*m)}},clean:function(){return this.timerId&&clearTimeout(this.timerId),this}},{EMOTICONS:{"&gt;:|":e.rootPath+"img/emots/emot-9.png","&gt;:D":e.rootPath+"img/emots/emot-10.png",o_O:e.rootPath+"img/emots/emot-11.png",":-D":e.rootPath+"img/emots/emot-18.png",";-D":e.rootPath+"img/emots/emot-19.png","*-D":e.rootPath+"img/emots/emot-20.png",":)":e.rootPath+"img/emots/emot-1.png",";)":e.rootPath+"img/emots/emot-2.png",":(":e.rootPath+"img/emots/emot-3.png",":D":e.rootPath+"img/emots/emot-4.png",":P":e.rootPath+"img/emots/emot-5.png","=)":e.rootPath+"img/emots/emot-6.png",":|":e.rootPath+"img/emots/emot-7.png","=|":e.rootPath+"img/emots/emot-8.png","=O":e.rootPath+"img/emots/emot-12.png","&lt;3":e.rootPath+"img/emots/emot-13.png",":S":e.rootPath+"img/emots/emot-14.png",":*":e.rootPath+"img/emots/emot-15.png",":$":e.rootPath+"img/emots/emot-16.png","=B":e.rootPath+"img/emots/emot-17.png"},createEmotElement:function(t){return'<img src="'+t+'" />'},createLinkElement:function(t,e){return t.length>40,'<a href="'+e+'" target="_blank">'+t+"</a>"}})}(window.Application,window.chatConfig,jQuery),function(t,e){t.ChatBoxView=Backbone.View.extend({initialize:function(){this.settings=t.model.settings,this.$wrapper=this.$(".customer-chat-content-messages-wrapper"),this.$el.mCustomScrollbar(),this.messageViews=[]},addMessage:function(e,i,s){var o=new t.MessageView({model:e,fullDate:this.options.fullDate});this.messageViews.push(o),this.$wrapper.append(o.el);var n=this;setTimeout(function(){n.updateScroller(),s?i&&n.$el.mCustomScrollbar("scrollTo","bottom"):(n.settings.get("scroll")||i)&&n.$el.mCustomScrollbar("scrollTo","bottom")},200)},clear:function(){for(var t=0;t<this.messageViews.length;t++)this.messageViews[t].remove().clean();this.$wrapper.html(""),this.messageViews=[]},updateScroller:function(){this.$el.mCustomScrollbar("update")}})}(window.Application,jQuery),function(t,e,i){var s=t.WidgetView=Backbone.View.extend({events:{"click #customer-chat-login-start":"login","keydown #customer-chat-content-login-form input":"loginOnEnter","click #customer-chat-button-toggle":"toggle","click #customer-chat-button-toggle i":"toggle","click .customer-chat-header":"toggle","click .customer-chat-header-title":"toggle","click .customer-chat-header-indicator":"toggle","click #customer-chat-button-close":"close","click #customer-chat-button-settings":"toggleSettings","click .customer-chat-content-message-emots-button":"toggleEmoticons","click .customer-chat-toggle-sound":"toggleSetting","click .customer-chat-toggle-scroll":"toggleSetting","click .customer-chat-toggle-emots":"toggleSetting","click .customer-chat-toggle-show":"toggleSetting","click #customer-chat-toggle-fs":"toggleFullscreen","click #customer-chat-action-end-chat":"endChat","click #customer-chat-action-end-chat-confirm":"endChatConfirm","click #customer-chat-action-end-chat-cancel":"endChatCancel","click .customer-chat-emoticon":"addEmoticon","keydown #customer-chat-message-input":"messageTyping","click   #chat-send-button":"sendMessage","focus #customer-chat-message-input":"inputFocus","blur #customer-chat-message-input":"inputBlur","click #customer-chat-contact-send":"sendContactMessage","click #customer-chat-info-back":"showPrevState"},initialized:!1,visible:!1,state:"",prevState:"",titleBlinking:!1,typingInfoBlinking:!1,emotsVisible:!1,initialize:function(){this.settings=t.model.settings,this.loginForm=new t.LoginFormView({el:this.$("#customer-chat-content-login-form")}),this.chatBox=new t.ChatBoxView({el:this.$(".customer-chat-content-messages")}),this.contactForm=new t.ContactFormView({el:this.$("#customer-chat-content-contact-form")}),this.selectAvatar=new t.SelectAvatarInlineView({el:this.$("#customer-chat-select-avatar"),model:i.defaultAvatars}),this.$window=e(window),this.$html=e("html"),this.$header=this.$(".customer-chat-header"),this.$title=this.$(".customer-chat-header-title"),this.$mobileTitle=e("#mobile-widget i"),this.$toggleBtn=this.$("#customer-chat-button-toggle"),this.$settingsBtn=this.$("#customer-chat-button-settings"),this.$settings=this.$(".customer-chat-header-menu"),this.$typingInfo=this.$(".typing-indicator"),this.$emoticons=this.$(".customer-chat-emots-menu"),this.$input=this.$("#customer-chat-message-input"),this.$contactName=this.$("#customer-chat-contact-name"),this.$contactMail=this.$("#customer-chat-contact-mail"),this.$contactMessage=this.$("#customer-chat-contact-message"),this.$loginName=this.$("#customer-chat-login-name"),this.$loginMail=this.$("#customer-chat-login-mail"),this.$info=this.$("#customer-chat-info-text"),this.$toggleSound=this.$(".customer-chat-toggle-sound"),this.$toggleScroll=this.$(".customer-chat-toggle-scroll"),this.$toggleEmots=this.$(".customer-chat-toggle-emots"),this.$toggleShow=this.$(".customer-chat-toggle-show"),this.$endChat=this.$("#customer-chat-action-end-chat"),this.$endChatConfirmation=this.$("#customer-chat-action-end-chat-confirmation"),this.$endChatConfirm=this.$("#customer-chat-action-end-chat-confirm"),this.showLoading(),this.model.once("operators:online",this.autoLogin,this),this.model.once("operators:offline",this.showContact,this),this.model.once("operators:online",function(){this.postMessage("show"),this.initialized=!0},this),this.model.once("operators:offline",function(){this.initialized||"true"!==i.ui.hideWhenOffline?this.postMessage("show"):this.postMessage("hide")},this),this.$('a[href="#"]').click(function(t){t.preventDefault()}),this.model.on("login:success",this.showChat,this),this.model.on("login:login",this.showLogin,this),this.model.on("login:error",this.showLoginError,this),this.model.on("logout:init",this.onLogout,this),this.model.on("logout:success",this.onLogoutSuccess,this),this.model.on("logout:error",this.onLogoutError,this),this.model.once("messages:last",this.handleLastMessages,this),this.model.on("messages:new",this.handleMessages,this),this.model.on("operator:typing",this.handleOperatorTyping,this),this.settings.on("change",this.renderSettings,this),this.renderSettings(),this.initFramesCommunication(),this.model.checkOperators(),this.storeProperties(),i.mobile&&this.show(),"true"===i.ui.autoShowWidget&&(this.autoShowTimer=setTimeout(e.proxy(this.show,this),1e3*i.ui.autoShowWidgetAfter))},setState:function(e){if(this.state!=e)switch(this.state=e,this.$settings.hide(),this.$emoticons.hide(),this.$el.removeClass("login-form chat-box contact-form loading-screen info-screen"),e){case"loading":this.$el.addClass("loading-screen"),this.$title.html(i.ui.loadingLabel);break;case"chat":this.$el.addClass("chat-box"),this.$title.html(i.ui.chatHeader);for(var s=0;s<this.model.lastMessages.length;s++){var o=this.model.lastMessages[s],n=new t.MessageModel({authorType:o.authorType,author:"guest"===o.authorType?o.author:this.model.getOperatorName(o.from_id),body:o.body,time:new Date(o.datetime)});this.chatBox.addMessage(n,!0)}this.prevState=e;break;case"login":this.$el.addClass("login-form"),this.$title.html(i.ui.chatHeader),this.fullscreenOff(),this.prevState=e;break;case"contact":this.$el.addClass("contact-form"),this.$title.html(i.ui.contactHeader),this.fullscreenOff(),this.prevState=e;break;case"info":this.$el.addClass("info-screen")}},show:function(){this.visible=!0,this.autoShowTimer&&(clearTimeout(this.autoShowTimer),delete this.autoShowTimer),this.$el.addClass("customer-chat-visible"),this.stopTitleBlink(),this.prevFullscreen&&this.fullscreenOn(),this.postMessage("animate|bottom=0")},hide:function(){this.visible=!1,this.storeProperties(e.proxy(function(){this.postMessage("animate|bottom="+(this.headerHeight-this.frameHeight))},this)),this.prevFullscreen=this.fullscreen,this.fullscreenOff(),this.$el.removeClass("customer-chat-visible"),this.$settings.hide(),this.$emoticons.hide()},toggle:function(t){i.mobile||t&&t.target!==t.currentTarget||(this.visible?this.hide():this.show())},toggleFullscreen:function(){this.fullscreen?this.fullscreenOff():this.fullscreenOn()},fullscreenOn:function(){this.storeProperties(),this.$html.addClass("fs"),this.postMessage("animate|width=100%,height=100%,right=0"),this.fullscreen=!0},fullscreenOff:function(){this.$html.removeClass("fs"),this.postMessage("animate|width="+this.frameWidth+"px,height="+this.frameHeight+"px,right="+this.frameOffset,"px"),this.fullscreen=!1},close:function(){history.length>1?history.back():(window.open("","_self"),window.close())},autoLogin:function(){this.showLoading(),this.model.autoLogin()},login:function(){this.manualLogin=!0;var t={name:this.$loginName.val(),mail:this.$loginMail.val(),image:this.selectAvatar.selected};this.loginForm.isValid()&&(this.showLoading(),this.model.login(t))},loginOnEnter:function(t){13===t.which&&this.login()},toggleSettings:function(){this.visible&&(this.$settings.is(":visible")?(this.$settings.fadeOut("fast"),this.$endChatConfirmation.hide(),this.$endChat.show()):this.$settings.fadeIn("fast"))},toggleEmoticons:function(){this.emotsVisible?this.hideEmoticons():this.showEmoticons()},showEmoticons:function(){this.$settings.fadeOut("fast"),this.emotsVisible=!0,this.$emoticons.fadeIn("fast");var t=this;setTimeout(function(){e("html, body").bind("click.hideemots",e.proxy(t.hideEmoticons,t))},10)},hideEmoticons:function(){this.emotsVisible=!1,e("html, body").unbind(".hideemots"),this.$emoticons.fadeOut("fast")},toggleSetting:function(t){var i=e(t.currentTarget),s=i.attr("id").split("customer-chat-setting-toggle-")[1];this.settings.set(s,!this.settings.get(s))},endChat:function(){this.$endChat.hide(),this.$endChatConfirmation.show()},endChatCancel:function(){this.$endChatConfirmation.hide(),this.$endChat.show()},endChatConfirm:function(){this.$endChatConfirmation.hide(),this.$endChat.show(),this.$settings.hide(),this.chatBox.clear(),this.loginForm.reset(),this.model.logout()},renderSettings:function(){this.settings.get("sound")?this.$toggleSound.removeClass("customer-chat-disabled"):this.$toggleSound.addClass("customer-chat-disabled"),this.settings.get("scroll")?this.$toggleScroll.removeClass("customer-chat-disabled"):this.$toggleScroll.addClass("customer-chat-disabled"),this.settings.get("emots")?this.$toggleEmots.removeClass("customer-chat-disabled"):this.$toggleEmots.addClass("customer-chat-disabled"),this.settings.get("show")?this.$toggleShow.removeClass("customer-chat-disabled"):this.$toggleShow.addClass("customer-chat-disabled")},addEmoticon:function(t){var s=e(t.currentTarget);this.$input.val(this.$input.val()+" "+s.data("emot")+" "),i.mobile||this.$input.focus(),this.$emoticons.fadeOut("fast")},handleMessages:function(i){for(var s=0;s<i.length;s++){var o=i[s];o.authorType="operator",o.author=this.model.getOperatorName(o.from_id);var n=new t.MessageModel(o);n.fromUser=o.from_user_info,this.chatBox.addMessage(n)}this.settings.get("sound")&&t.service.soundPlayer.play("message"),this.visible||(this.settings.get("show")?this.toggle():this.startTitleBlink()),this.$mobileTitle.is(":visible")&&(this.stopTitleBlink(),this.startTitleBlink()),setTimeout(e.proxy(this.stopTypingInfoBlink,this),1)},handleLastMessages:function(e){for(var i=0;i<e.length;i++){var s=new t.MessageModel(e[i]);this.chatBox.addMessage(s,!0)}},messageTyping:function(t){this.handleTyping(),13!==t.keyCode||t.shiftKey||this.sendMessage()},sendMessage:function(){var t=e.trim(this.$input.val());0!=t.length&&(this._sendMessage(t),this.$input.val(""))},_sendMessage:function(e){if(0!=e.length){var i=new t.MessageModel({author:this.model.get("name"),authorType:"guest",body:e,time:new Date,from_user_info:{image:this.model.get("image")}},{localMessage:!0});this.model.sendMessage(i),this.chatBox.addMessage(i,!0)}},inputFocus:function(){this.$el.addClass("input-focused"),this.chatBox.updateScroller()},inputBlur:function(){var t=this;setTimeout(function(){t.$el.removeClass("input-focused"),t.chatBox.updateScroller()},100)},handleTyping:function(){this.model.updateTypingStatus()},handleOperatorTyping:function(){this.startTypingInfoBlink(),this.stopTypingBlinkTimer&&clearTimeout(this.stopTypingBlinkTimer),this.stopTypingBlinkTimer=setTimeout(e.proxy(this.stopTypingInfoBlink,this),s.TYPING_STATUS_TIME)},sendContactMessage:function(){var t={name:this.$contactName.val(),mail:this.$contactMail.val(),question:this.$contactMessage.val()};if(this.contactForm.isValid()){var s=this;e.post(i.contactPath,t,function(t){t.success?(s.contactForm.reset(),s.showInfo(i.ui.contactSuccessMessage,i.ui.contactSuccessHeader)):s.showInfo(i.ui.contactErrorMessage,i.ui.contactErrorHeader)}),this.showLoading()}},startTitleBlink:function(){this.titleBlinking=!0,this.blinkTitle()},blinkTitle:function(){if(this.titleBlinking){var t=this;this.$mobileTitle.fadeOut("slow"),this.$title.fadeOut("slow",function(){t.$mobileTitle.fadeIn("slow"),t.$title.fadeIn("slow",function(){t.blinkTitle()})})}},stopTitleBlink:function(){this.titleBlinking=!1},startTypingInfoBlink:function(){this.typingInfoBlinking||(this.typingInfoBlinking=!0,this.blinkTypingInfo())},blinkTypingInfo:function(){if(this.typingInfoBlinking){var t=this;this.$typingInfo.fadeIn("slow",function(){t.$typingInfo.fadeOut("slow",function(){t.blinkTypingInfo()})})}},stopTypingInfoBlink:function(){this.typingInfoBlinking=!1},showLogin:function(){this.setState("login"),this.model.once("login:success",this.showWelcomeMessage,this)},showLoginError:function(){this.showInfo(i.ui.loginError)},onLogout:function(){this.showLoading()},onLogoutSuccess:function(){this.showLogin(),this.model.checkOperators()},onLogoutError:function(){this.showLogin(),this.model.checkOperators()},showWelcomeMessage:function(){var e=new t.MessageModel({authorType:"operator",author:i.ui.initMessageAuthor,body:i.ui.initMessageBody,time:new Date});this.chatBox.addMessage(e)},showChat:function(){this.setState("chat"),this.manualLogin&&i.mobile&&window.location.reload()},showContact:function(){this.setState("contact")},showLoading:function(){this.setState("loading")},showInfo:function(t,e){this.$info.html(t),this.$title.html(e),this.setState("info")},showPrevState:function(){this.setState(this.prevState)},storeProperties:function(t){if(!i.mobile&&!this.fullscreen){this.headerHeight=this.$header.height();var e=this;this.postMessage("get.properties",function(i){var s=i.split(",");e.frameWidth=parseInt(s[0]),e.frameHeight=parseInt(s[1]),e.frameOffset=parseInt(s[2]),t&&t()})}},postMessage:function(t,e){if(!i.mobile&&(window.parent.postMessage(t,"*"),e)){var s=this.$window,o=Math.floor((new Date).getTime()*Math.random());this.$window.bind("message."+o,function(i){var n=i.originalEvent.data.split(":");n[0]===t&&e(n[1]),s.unbind("message."+o)})}},initFramesCommunication:function(){var t=this;this.$window.bind("message",function(e){if(e.originalEvent.data){var i=e.originalEvent.data.split(":");"state.mobile"===i[0]?t.$html.addClass("mobile-widget"):"state.desktop"===i[0]&&t.$html.removeClass("mobile-widget")}})}},{TYPING_STATUS_TIME:2e3,ANIMATION_TIME:400})}(window.Application,jQuery,window.chatConfig),function(t,e,i){t.SelectAvatarInlineView=Backbone.View.extend({events:{"mousedown .prev-avatar":"prev","mousedown .next-avatar":"next"},selectedIndex:0,initialize:function(){this.render(),this.updateAvatar()},render:function(){return this.$el.html(t.template.selectAvatarContent),this.$selected=this.$(".selected-avatar"),this},prev:function(){this.selectedIndex--,this.selectedIndex<0&&(this.selectedIndex=this.model.length-1),this.updateAvatar()},next:function(){this.selectedIndex++,this.selectedIndex>=this.model.length&&(this.selectedIndex=0),this.updateAvatar()},updateAvatar:function(){this.selected=this.model[this.selectedIndex],this.$selected.css("background-image",'url("'+this.selected+'")')}})}(window.Application,chatConfig,jQuery),function(t,e,i){t.WidgetFacade=function(){i.extend(this,e.Events);var s=t.view.widget,o=t.model.chat;i.extend(this,{show:function(){s.show()},hide:function(){s.hide()},fullscreenOn:function(){s.fullscreenOn()},fullscreenOff:function(){s.fullscreenOff()},endChat:function(){s.endChatConfirm()},sendMessage:function(t){s._sendMessage(t)}}),o.once("operators:online",function(){this.trigger("operators:online")},this).once("operators:offline",function(){this.trigger("operators:offline")},this).on("messages:new",function(){this.trigger("messages:new")},this).on("login:success",function(){this.trigger("login:success")},this).on("logout:success",function(){this.trigger("logout:success")},this).on("operator:typing",function(){this.trigger("operator:typing")},this)}}(window.Application,Backbone,_),function(t,e){t.PostMessageApiAdapter=function(t){var i=e(window);i.bind("message",function(e){if(e.originalEvent.data){var i=e.originalEvent.data.split(":"),s=i[0],o=s.split("."),n=o[0];if("api"===n){var a=o[1];"function"==typeof t[a]&&t[a]()}}}),t.on("all",function(t){var e;switch(t){case"operators:online":e="operatorsonline";break;case"operators:offline":e="operatorsoffline";break;case"messages:new":e="message";break;case"login:success":e="loginsuccess";break;case"logout:success":e="logoutsuccess";break;case"operator:typing":e="operatortyping"}window.parent.postMessage("api."+e,"*")})}}(window.Application,jQuery),jQuery(function(t){var e=window.chatConfig;t.get(e.templatesPath,function(e){var i=t(e),s=window.Application;s.service.soundPlayer=new s.SoundPlayer,s.template.message=i.find("#message").html(),s.model.settings=new s.GuestSettingsModel,s.model.chat=new s.GuestChatModel,s.view.widget=new s.WidgetView({el:"#customer-chat-widget",model:s.model.chat}),window.phpLiveChat=new s.WidgetFacade,new s.PostMessageApiAdapter(window.phpLiveChat)})});