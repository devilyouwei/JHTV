var API = 'http://h5.shuiguoji.caoyujie.com/index';
window.$ = {
    log: function(msg) {
        if (typeof msg == 'object') console.log(JSON.stringify(msg))
        else console.log(msg)
    },
    post: function(ctl, data, callback, load) {
        var connectionType = api.connectionType;
        if (connectionType == 'none') {
            $.showSplash(false);
            return $.toast('无网络连接，请先打开手机网络！然后重新启动聚合视频');
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
                    files: null
                };
            } else {
                if (user) data.values.token = user.token, data.values.user_id = user.user_id;
                //带文件上传
                data = data;
            }
        }
        $.log('数据：' + JSON.stringify(data));
        if (load) this.load(true, load);
        api.ajax({
            url: url,
            method: 'post',
            data: data
        }, (res, err) => {
            this.load(false);
            $.log('结果：' + JSON.stringify(res));
            if (err) return $.toast('服务器出错了啦~ X﹏X'), $.log(err);
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
    stamp2date: function(ns) {
        return new Date(parseInt(ns) * 1000)
    },
    date2stamp: function(date) {
        return Date.parse(date) / 1000
    },
    // 传入date对象Date类型，格式String类型
    formatDate: function(date, fmt) {
        let o = {
            'M+': date.getMonth() + 1, // 月份
            'd+': date.getDate(), // 日
            'h+': date.getHours(), // 小时
            'm+': date.getMinutes(), // 分
            's+': date.getSeconds(), // 秒
            'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
            'S': date.getMilliseconds() // 毫秒
        }
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
        for (let k in o)
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
            duration: 2000,
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
    alert: function(msg) {
        api.alert({
            title: '提示',
            msg: msg,
        }, function(ret, err) {});
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
        api.openWin({
            name: 'login',
            url: api.wgtRootDir + '/html/login.html',
            slideBackEnabled: true,
            slideBackType: 'edge',
            animation: {
                type: 'movein',
                subType: 'from_right',
                duration: 300
            }
        });
    },
    // 打开新的webview
    openWebview: function(navTitle, url, x5) {
        if (!navTitle || !url) return;
        var webview = '/html/webview.html';
        var webName = 'webview';
        if (x5) webview = '/html/webview_x5.html', webName = 'webviewX5';
        api.openWin({
            name: webName,
            url: api.wgtRootDir + webview,
            slideBackEnabled: false,
            vScrollBarEnabled: false,
            hScrollBarEnabled: false,
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
    openPlayer: function(videoUrl) {
        if (videoUrl) {
            var browser = api.require('webBrowser');
            browser.openView({
                url: videoUrl,
                rect: {
                    x: 0,
                    y: $api.dom('header').offsetHeight,
                    w: api.winWidth,
                    h: 320
                }
            });
        }
    },
    closePlayer: function() {
        var browser = api.require('webBrowser');
        browser.closeView();
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
        var filter = /^1[34578]\d{9}$/;
        return filter.test(phone);
    },
    // 启动图开关
    showSplash: function(flag) {
        if (flag) {
            api.showLaunchView();
        } else {
            api.removeLaunchView({
                animation: {
                    type: 'suck',
                    duration: 500
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
    API: API
}
