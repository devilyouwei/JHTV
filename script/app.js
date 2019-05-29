var API = 'http://node.diet.devil.ren';
window.$ = {
    log: function(msg) {
        if (typeof msg == 'object') console.log(JSON.stringify(msg))
        else console.log(msg)
    },
    post: function(ctl, act, data, callback) {
        if (!ctl || !act) return;
        var url = API + '/' + ctl + '/' + act
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
        api.ajax({
            url: url,
            method: 'post',
            data: data
        }, function(res, err) {
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
    load: function(flag) {
        if (flag) {
            api.showProgress({
                title: '(~￣▽￣)~',
                text: '加载中...',
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
            url: api.wgtRootDir+'/html/login.html',
            slidBackEnabled:true,
            slidBackType:'edge',
            animation:{
              type:'movein',
              subType:'from_right',
              duration:300
            }
        });
    }
}
