var API = 'http://h5.shuiguoji.caoyujie.com/index';
window.$ = {
    log: function(msg) {
        if (typeof msg == 'object') console.log(JSON.stringify(msg))
        else console.log(msg)
    },
    post: function(ctl, data, callback, load, tag) {
        var connectionType = api.connectionType;
        tag = tag || null;
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
        api.ajax({
            url: url,
            tag: tag,
            method: 'post',
            data: data
        }, (res, err) => {
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
                    h: 280
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
                                      this.load(true,'下载' + ret.percent + '%');
                                      if(ret.percent==100) this.load(false);
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
                                api.installApp({
                                    appUri: result.source
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
    API: API
}
