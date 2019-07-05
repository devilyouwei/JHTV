var API = 'http://jhtv.devil.ren/index';
var PLAY = 'http://jhtv.app.devil.ren/dplayer/index.php';

document.addEventListener('DOMContentLoaded', function() {
    // 组织全部表单的提交事件
    var form = document.getElementById('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    }
});
(function(designWidth, maxWidth) {
    var doc = document,
        win = window;
    var docEl = doc.documentElement;
    var tid;
    var rootItem, rootStyle;

    function refreshRem() {
        var width = docEl.getBoundingClientRect().width;
        if (!maxWidth) {
            maxWidth = 540;
        };
        if (width > maxWidth) {
            width = maxWidth;
        }
        //与淘宝做法不同，直接采用简单的rem换算方法1rem=100px
        var rem = width * 30 / designWidth;
        //兼容UC开始
        rootStyle = "html{font-size:" + rem + 'px !important}';
        rootItem = document.getElementById('rootsize') || document.createElement("style");
        if (!document.getElementById('rootsize')) {
            document.getElementsByTagName("head")[0].appendChild(rootItem);
            rootItem.id = 'rootsize';
        }
        if (rootItem.styleSheet) {
            rootItem.styleSheet.disabled || (rootItem.styleSheet.cssText = rootStyle)
        } else {
            try {
                rootItem.innerHTML = rootStyle
            } catch (f) {
                rootItem.innerText = rootStyle
            }
        }
        //兼容UC结束
        docEl.style.fontSize = rem + "px";
    };
    refreshRem();

    win.addEventListener("resize", function() {
        clearTimeout(tid); //防止执行两次
        tid = setTimeout(refreshRem, 300);
    }, false);

    win.addEventListener("pageshow", function(e) {
        if (e.persisted) { // 浏览器后退的时候重新计算
            clearTimeout(tid);
            tid = setTimeout(refreshRem, 300);
        }
    }, false);

    if (doc.readyState === "complete") {
        doc.body.style.fontSize = "16px";
    } else {
        doc.addEventListener("DOMContentLoaded", function(e) {
            doc.body.style.fontSize = "16px";
        }, false);
    }
})(640, 640);
window.$ = {
    log: function(msg) {
        if (typeof msg == 'object') console.log(JSON.stringify(msg))
        else console.log(msg)
    },
    post: function(ctl, data, callback, load) {
        var connectionType = api.connectionType;
        if (connectionType == 'none') {
            return $.toast('未连接到网络，请先打开联网权限');
        }
        if (connectionType == '2g' || connectionType == '3g') $.toast('请注意，您当前使用的网络过慢！可能影响使用体验');
        if (!ctl) return $.log('缺少参数');
        var url = API + '/' + ctl
        $.log('请求：' + url);
        if (data) {
            var user = this.getUserInfo();
            // 无文件上传
            if (!data.files) {
                if (user) data.token = user.token, data.user_id = user.user_id;
                data = {
                    values: data,
                    files: {}
                };
            } else { // 带文件上传
                if (!data.values) data.values = {};
                if (user) data.values.token = user.token, data.values.user_id = user.user_id;
                data = data;
            }
        }
        $.log('数据：' + JSON.stringify(data));
        if (load) this.load(true, load);
        var opt = {
            url: url,
            method: 'post',
            data: data,
            tag: ctl
        };
        api.ajax(opt, (res, err) => {
            this.load(false);
            api.refreshHeaderLoadDone();
            $.log('结果：' + JSON.stringify(res));
            if (err) {
                $.log(err);
                $.toast('服务器出错了啦~ X﹏X');
                res = {
                    status: 0,
                    msg: '服务器出错了啦~ X﹏X'
                };
            }
            // 失去登陆状态强制退出
            if (res.status == -1) {
                api.sendEvent({
                    name: 'logout'
                });
                return this.logout();
            }
            if (callback && typeof callback == 'function') return callback(res);
        })
    },
    abortPost: function(tag) {
        api.cancelAjax({
            tag: tag
        });
    },
    stamp2date: function(ns) {
        return new Date(parseInt(ns) * 1000)
    },
    date2stamp: function(date) {
        return Date.parse(date) / 1000
    },
    // 传入date对象Date类型，格式String类型
    formatDate: function(date, fmt) {
        var o = {
            'M+': date.getMonth() + 1, // 月份
            'd+': date.getDate(), // 日
            'h+': date.getHours(), // 小时
            'm+': date.getMinutes(), // 分
            's+': date.getSeconds(), // 秒
            'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
            'S': date.getMilliseconds() // 毫秒
        }
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
        for (var k in o)
            if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
        return fmt
    },
    // 强制退出
    logout: function() {
        this.remove('userinfo');
        this.toLogin();
    },
    toast: function(msg) {
        api.toast({
            msg: msg,
            duration: 2500,
            location: 'bottom'
        });
    },
    load: function(flag, msg) {
        if (flag) {
            api.showProgress({
                title: '(~￣▽￣)~',
                text: msg || '加载中...',
                modal: true
            });
        } else {
            api.hideProgress();
        }
    },
    alert: function(msg, callback) {
        api.alert({
            title: '提示',
            msg: msg,
        }, function(ret, err) {
            if (callback && typeof callback == 'function') return callback();
        });
    },
    confirm: function(title, msg, callback) {
        api.confirm({
            title: title,
            msg: msg,
            buttons: ['确定', '取消']
        }, function(ret, err) {
            if (callback && typeof callback == 'function') return callback(ret.buttonIndex);
        });
    },
    getUserInfo: function() {
        return JSON.parse(this.get('userinfo'));
    },
    clearUserInfo: function() {
        return this.remove('userinfo');
    },
    toLogin: function() {
        if ($.getOS() == 'ios') $.toast('带你去登录咯﻿ε≡٩(๑>₃<)۶ ')
        api.openWin({
            name: 'login',
            url: api.wgtRootDir + '/html/login.html',
            slideBackEnabled: true,
            slideBackType: 'edge',
            useWKWebView: $.getOS() == 'ios' ? true : false,
            vScrollBarEnabled: false,
            bgColor: '#ff0072',
            hScrollBarEnabled: false,
            delay: $.getOS() == 'ios' ? 500 : 100,
            animation: {
                type: $.getOS() == 'ios' ? 'ripple' : 'movein',
                subType: 'from_right',
                duration: 300
            }
        });
    },
    // 打开新的webview
    openWebview: function(navTitle, url, x5) {
        if (!navTitle || !url) return;
        if ($.getOS() == 'ios') x5 = false; // ios不需要使用x5
        var webview = '/html/webview.html';
        var webName = 'webview';
        if (x5) webview = '/html/webview_x5.html', webName = 'webviewX5';
        api.openWin({
            name: webName,
            url: api.wgtRootDir + webview,
            slideBackEnabled: true,
            vScrollBarEnabled: false,
            hScrollBarEnabled: false,
            useWKWebView: $.getOS() == 'ios' ? true : false,
            bounces: false,
            animation: {
                type: 'movein',
                subType: 'from_right',
                duration: 200
            },
            pageParam: {
                navTitle: navTitle,
                url: url
            }
        });
    },
    // 打开播放器
    openPlayer: function(url, title) {
        if (url) {
            var videoUrl = url; //平台覆盖播放
            var height = 280;
            var top = 45;
            if (title) { // 资源库播放
                videoUrl = PLAY + '?url=' + url + '&title=' + title;
                height = api.winHeight / 3;
                top = 0;
            }
            var os = $.getOS();
            if (os == 'android') { // Android使用x5引擎
                var browser = api.require('webBrowser');
                browser.openView({
                    url: videoUrl,
                    progress: {
                        color: '#ff0072'
                    },
                    rect: {
                        x: 0,
                        y: $api.dom('header').offsetHeight - 1 + top,
                        w: api.winWidth,
                        h: height
                    }
                });
            } else {
                api.openFrame({ // ios使用原生
                    name: 'webview_player',
                    useWKWebView: true,
                    bgColor: 'rgba(0,0,0,0.8)',
                    url: videoUrl,
                    scrollEnabled: false,
                    vScrollBarEnabled: false,
                    hScrollBarEnabled: false,
                    progress: {
                        type: "page",
                        color: "#ff0072"
                    },
                    rect: {
                        x: 0,
                        y: $api.dom('header').offsetHeight - 2 + top,
                        w: api.winWidth,
                        h: height
                    }
                });
            }
        }
    },
    closePlayer: function() {
        var os = $.getOS();
        if (os == 'android') {
            var browser = api.require('webBrowser');
            browser.closeView();
        } else {
            api.closeFrame({
                name: 'webview_player'
            });

        }
    },
    // 获取系统信息
    getOS: function() {　　
        var n = navigator.userAgent;
        if (n.indexOf('Android') > -1 || n.indexOf('Linux') > -1) {
            return 'android';
        } else if (n.indexOf('iPhone') > -1) {
            return 'ios';
        } else if (n.indexOf('Windows Phone') > -1) {
            return 'windows';
        } else if (n.indexOf('Google Phone') > -1) {
            return 'unknown';
        }
    },
    // 验证手机号
    valPhone: function(phone) {
        var filter = /^1[234567890]\d{9}$/;
        return filter.test(phone);
    },
    // 启动图开关
    showSplash: function(flag) {
        if (flag) {
            api.showLaunchView();
        } else {
            api.removeLaunchView({
                animation: {
                    type: 'fade',
                    duration: 400
                }
            });
        }
    },
    set: function(key, value) {
        return api.setPrefs({
            key: key,
            value: value
        });
    },
    get: function(key) {
        return api.getPrefs({
            sync: true,
            key: key
        }) || null;
    },
    remove: function(key) {
        return api.removePrefs({
            key: key
        });
    },
    version: function() {
        return api.appVersion
    },
    // 获取设备信息
    device: function() {
        var device = {
            appId: api.appId,
            appName: api.appName,
            appVersion: api.appVersion,
            systemType: api.systemType,
            systemVersion: api.systemVersion,
            version: api.version,
            deviceId: api.deviceId,
            deviceToken: api.deviceToken,
            deviceModel: api.deviceModel,
            deviceName: api.deviceName,
            uiMode: api.uiMode,
            operator: api.operator,
            connectionType: api.connectionType,
            fullScreen: api.fullScreen,
            screenWidth: api.screenWidth,
            screenHeight: api.screenHeight,
            safeArea: api.safeArea,
            channel: api.channel
        };
        return device;
    },
    // 电池信息
    battery: function(callback) {
        api.addEventListener({
            name: 'batterystatus'
        }, function(res, err) {
            if (res && callback && typeof callback == 'function') return callback(res);
        });
    },
    // 网络状态改变
    online: function(callback) {
        api.addEventListener({
            name: 'online'
        }, function(res, err) {
            if (res && callback && typeof callback == 'function') return callback(res);
        });
    },
    // 摇一摇
    shake: function(callback) {
        api.addEventListener({
            name: 'shake'
        }, callback);
    },
    unshake: function() {
        api.removeEventListener({
            name: 'shake'
        });
    },
    update: function(flag) {
        var mam = api.require('mam');
        mam.checkUpdate((ret, err) => {
            if (ret) {
                var result = ret.result;
                if (result.update == true && result.closed == false) {
                    var str = '新版本型号：' + result.version + '\n' + result.updateTip + '\n\n发布时间:' + result.time;
                    api.confirm({
                        title: '新版本',
                        msg: str,
                        buttons: ['确定', '取消']
                    }, (ret, err) => {
                        if (ret.buttonIndex == 1) {
                            if (api.systemType == "android") {
                                api.download({
                                    url: result.source,
                                    report: true
                                }, (ret, err) => {
                                    if (ret && 0 == ret.state) { /* 下载进度 */
                                        this.load(true, '下载' + ret.percent + '%');
                                        if (ret.percent == 100) this.load(false);
                                    }
                                    if (ret && 1 == ret.state) { /* 下载完成 */
                                        var savePath = ret.savePath;
                                        api.installApp({
                                            appUri: savePath
                                        });
                                    }
                                });
                            }
                            if (api.systemType == "ios") {
                                api.openApp({
                                    iosUrl: result.source
                                });
                            }
                        }
                    });
                } else {
                    if (flag) this.toast('已经是最新版本咯~ (☆▽☆)');
                }
            } else {
                this.toast(err.msg);
            }
        });
    },
    // 更新配置
    setConfig: function(callback) {
        this.post('Confing/getConfing', {}, function(res) {
            if (res.status == 1) {
                $.set('config', JSON.stringify(res.results));
                if (callback && typeof callback == 'function') {
                    return callback(res.results);
                }
            } else $.toast('获取配置失败~(°o°；)');
        })
    },
    // 获取配置
    getConfig: function() {
        var config = $.get('config');
        if (config) return JSON.parse(config);
        else return config;
    },
    // 复制到粘贴板
    copy: function(v) {
        if (!v) return;
        var clipBoard = api.require('clipBoard');
        clipBoard.set({
            value: v
        }, function(ret, err) {
            if (ret) {
                $.toast("复制成功，赶紧去分享吧~")
            } else {
                $.toast("复制失败");
            }
        });
    },
    dialogSearch: function(title) {
        title = title.split(' ')[0]
        var dialogBox = api.require('dialogBox');
        title = this.splitText(title)
        dialogBox.input({
            keyboardType: 'search',
            texts: {
                title: 'VIP片源错误',
                placeholder: `搜视频库：${title}（视频已上报）`,
                leftBtnTitle: '算了',
                rightBtnTitle: '搜索'
            },
            styles: {
                bg: '#fff',
                corner: 10,
                w: 300,
                h: 180,
                title: {
                    h: 50,
                    alignment: 'center',
                    size: 18,
                    bold: true,
                    color: '#ff1679',
                    marginT: 15,
                },
                input: {
                    h: 40,
                    y: 30,
                    marginT: 6,
                    marginLeft: 20,
                    marginRight: 20,
                    alignment: 'left',
                    textSize: 15,
                    textColor: '#000'
                },
                dividingLine: {
                    width: 0,
                    color: '#fff'
                },
                left: {
                    bg: 'rgba(0,0,0,0)',
                    color: '#ccc',
                    size: 17
                },
                right: {
                    bg: 'rgba(0,0,0,0)',
                    color: '#ff1679',
                    size: 17
                }
            }
        }, function(ret) {
            if (ret.eventType == 'left') {
                var dialogBox = api.require('dialogBox');
            } else {
                if (ret.text) title = ret.text
                if (!title) return $.toast('请输入搜索内容~')
                $.openSearchPage(title)
            }
            var dialogBox = api.require('dialogBox');
            dialogBox.close({
                dialogName: 'input'
            });
        });
    },
    // 智能过滤
    splitText(title) {
        if (title.indexOf('第') != -1) {
            if (title.split('第')[0]) title = title.split('第')[0]
        }
        for (var i = 0; i < 9; i++) {
            if (title.indexOf(i + '') != -1) {
                if (title.split(i + '')[0]) title = title.split(i + '')[0]
            }
        }
        if (title.indexOf('-') != -1) title = title.split('-')[0]
        if (title.indexOf(':') != -1) title = title.split(':')[0]
        if (title.indexOf('：') != -1) title = title.split('：')[0]
        if (title.indexOf('&') != -1) title = title.split('&')[0]
        if (title.indexOf('#') != -1) title = title.split('#')[0]
        if (title.indexOf('/') != -1) title = title.split('/')[0]
        if (title.indexOf('_') != -1) title = title.split('_')[0]
        if (title.indexOf('+') != -1) title = title.split('+')[0]
        if (title.indexOf('=') != -1) title = title.split('=')[0]
        if (title.indexOf('!') != -1) title = title.split('!')[0]
        if (title.indexOf('?') != -1) title = title.split('?')[0]
        if (title.indexOf('！') != -1) title = title.split('！')[0]
        if (title.indexOf('？') != -1) title = title.split('？')[0]
        if (title.indexOf('(') != -1) title = title.split('(')[0]
        if (title.indexOf('（') != -1) title = title.split('（')[0]

        if (title.indexOf('【') != -1) title = title.split('【')[1]
        if (title.indexOf('】') != -1) title = title.split('】')[0]
        if (title.indexOf('[') != -1) title = title.split('[')[1]
        if (title.indexOf(']') != -1) title = title.split(']')[0]
        return title
    },
    openSearchPage(search) {
        if (search) {
            api.openWin({
                useWKWebView: $.getOS() == 'ios' ? true : false,
                name: 'recmovie',
                url: './recmovie.html',
                animation: {
                    type: 'movein',
                    subType: 'from_right',
                    duration: 300
                },
                pageParam: {
                    search: search
                },
                vScrollBarEnabled: false,
                hScrollBarEnabled: false,
                slidBackEnabled: true
            });
        }
    },
    setSearchHistory(item) {
        if (!item) return;
        var arr = this.get('search_history');
        if (!arr) {
            arr = []
        } else {
            arr = JSON.parse(arr)
        }
        for (var i = 0; i <= arr.length; i++) {
            if (arr[i] == item) arr.splice(i, 1); // 删除重复项
        }
        arr.unshift(item)
        this.set('search_history', JSON.stringify(arr))
    },
    getSearchHitory() {
        var arr = this.get('search_history');
        if (!arr) return [];
        else return JSON.parse(arr);
    },
    clearSearchHistory() {
        this.remove('search_history');
    },
    authLogin(plat, callback) {
        if (plat == 1) { //qq
            var qq = api.require('QQPlus');
            qq.installed(function(ret, err) {
                if (ret.status) { // 已安装，登录
                    qq.login(function(ret, err) {
                        if (err) return $.toast('QQ登录出错，未获得授权！')
                        var openid = ret.openId
                        qq.getUserInfo(function(ret, err) {
                            if (ret.status) {
                                var info = {
                                    name: ret.info.nickname,
                                    city: ret.info.city,
                                    img: ret.info.figureurl_qq_2,
                                    gender: ret.info.gender,
                                    openid: openid,
                                    type: 1,
                                    //info: JSON.stringify($.device())
                                }
                                alert(JSON.stringify(info))
                                $.post('Login/getThirdPartyLanding', info, function(res) {
                                    if (res.status == 1) {
                                        // 登陆成功
                                        if (callback && typeof callback == 'function') callback(res.results)
                                    } else {
                                        $.toast(res.msg)
                                    }
                                }, 'QQ登陆中...')
                            } else $.toast('QQ获取信息失败，无授权~')
                        });
                    });
                } else { // 未安装
                    $.toast('您好像还没有安装企鹅哦~请先安装')
                }
            });
        }
    },
    API: API
}
