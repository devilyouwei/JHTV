var API = 'http://h5.shuiguoji.caoyujie.com/index';
window.$ = {
    log: function(msg) {
        if (typeof msg == 'object') console.log(JSON.stringify(msg))
        else console.log(msg)
    },
    post: function(ctl, data, callback, load) {
        if (!ctl) return;
        var url = API + '/' + ctl
        $.log('请求：' + url);
        $.log('数据：' + JSON.stringify(data));
        if (data) {
            // 无文件上传
            if (!data.files) {
                data = {
                    values: data,
                    files: null
                };
            } else {
                //带文件上传
                data = data;
            }
        }
        if (load) this.load(true, load);
        api.ajax({
            url: url,
            method: 'post',
            data: data
        }, (res, err) => {
            if(load) this.load(false);
            $.log('结果：' + JSON.stringify(res));
            if (err) return $.toast(err);
            if (callback && typeof callback == 'function') return callback(res);
        })
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
    getUserInfo: function() {
        return JSON.parse(localStorage.getItem('userinfo'));
    },
    clearUserInfo: function() {
        return localStorage.removeItem('userinfo');
    },
    set: function(key, value) {
        if (typeof value == 'object') localStorage.setItem(key, JSON.stringify(value));
        else return console.error('not an object!');
    },
    get: function(key) {
        return JSON.parse(localStorage.getItem(key));
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
    openWebview: function(navTitle, url) {
        api.openWin({
            name: 'webview',
            url: api.wgtRootDir + '/html/webview.html',
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
    valPhone: function(phone) {
        var filter = /^1[34578]\d{9}$/;
        return filter.test(phone);
    }
}
