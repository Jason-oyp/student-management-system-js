var student = {
    //初始化界面
    init: function () {
        var self = this;
        this.add = document.getElementsByClassName('add')[0];
        this.list = document.getElementsByClassName('list')[0];
        this.dl = document.getElementsByClassName('menu-list')[0];
        this.submit = document.getElementsByClassName('submit')[0];
        this.form = document.getElementsByClassName('form-mes')[0];
        this.ddList = this.dl.getElementsByClassName('list')[0];
        this.edit = document.getElementsByClassName('edit')[0];
        this.delete = document.getElementsByClassName('delete')[0];
        this.mask = document.getElementsByClassName('mask')[0];
        this.tbody = document.getElementsByTagName('tbody')[0];
        this.close = document.getElementsByClassName('close')[0];
        this.editForm = document.getElementsByClassName('edit-form')[0];
        this.editSubmit = document.getElementsByClassName('edit-submit')[0];
        this.page = document.getElementsByClassName('page')[0];
        this.cruPage = 1;
        this.bindEvent();
        store.requestData('/api/student/findAll', '', function (res) {
            this.sum = res.data.length;
            store.isCru(1);
        });

    },
    //事件绑定
    bindEvent: function () {

        var self = this;

        //切换页面
        this.dl.addEventListener('click', dlClick.bind(this), false);

        //添加数据提交
        this.submit.addEventListener('click', submitClick.bind(this), false);

        //操作按钮
        this.tbody.addEventListener('click', operateClick.bind(this), false);

        //编辑数据提交
        this.editSubmit.addEventListener('click', editSubmitClick.bind(this), false);

        //关闭编辑界面
        this.close.addEventListener('click', function (e) {
            self.mask.style.display = 'none';
        }, false);

        function operateClick(e) {
            if (e.target.tagName !== 'BUTTON') {
                return false;
            }
            var target = [].slice.call(e.target.classList, 0).indexOf('edit');
            if (target !== -1) {
                this.mask.style.display = 'block';
                var formData = tempData[e.target.getAttribute('data-index')];
                store.randerEditForm(formData);
                this.tempSno = formData.sNo;
            } else {
                var delConfirm = confirm('是否确认删除？');
                if (delConfirm) {
                    var sNo = tempData[e.target.getAttribute('data-index')].sNo;
                    store.requestData('/api/student/delBySno', { sNo: sNo }, function (res) {
                        alert('成功删除该学生信息');
                        this.sum--;
                        store.isCru(1);
                    });
                }
            }
        }

        function submitClick(e) {
            e.preventDefault();
            var stuObj = store.getFormData(this.form);
            if (stuObj) {
                store.requestData('/api/student/addStudent', stuObj, function (res) {
                    alert('成功添加该学生信息');
                    this.form.reset();
                    this.sum++;
                    this.ddList.click();
                });
            };
            return false;
        }

        function dlClick(e) {
            if (e.target.tagName == 'DD') {
                var active = document.getElementsByClassName('active');
                for (var i = 0; i < active.length; i++) {
                    active[i].classList.remove('active');
                }
                e.target.classList.add('active');
                var id = e.target.getAttribute('data-id');
                document.getElementsByClassName('content-active')[0].classList.remove('content-active');;
                document.getElementById(id).classList.add('content-active');
                if (id == 'stu-list') {
                    if (this.cruPage != 1) {
                        store.isCru(this.cruPage);
                    } else {
                        store.isCru(1);
                    }
                }
            }
        }

        function editSubmitClick(e) {
            e.preventDefault();
            var stuObj = store.getFormData(this.editForm);
            if (stuObj && this.tempSno !== stuObj.sNo) {
                alert('学号不能修改！');
                return false;
            }
            if (stuObj) {
                store.requestData('/api/student/updateStudent', stuObj, function (res) {
                    alert('成功修改该学生信息');
                    this.form.reset();
                    this.close.click();
                    store.pageData();
                });
            };
        }
    }
}

//生成管理对象
var store = createStore.call(student);

//当前页面，默认为1
var cruPage = 1;

//当前页面显示的最大值
var size = 4;

//初始化，入口
student.init();

//管理封装函数
function createStore() {
    //保存当前this指向，方便后续利用
    var self = this;

    //得到表格数据，返回一个学生的数据对象
    function getFormData(form) {
        // 400  bad request ---》 数据名写错了s
        var name = form.name.value;
        var sNo = form.sNo.value;
        var birth = form.birth.value;
        var sex = form.sex.value;
        var phone = form.phone.value;
        var email = form.email.value;
        var address = form.address.value;
        if (!name || !sNo || !birth || !phone || !email || !address) {
            alert('部分数据未填写，请填写完成后提交');
            return false;
        }
        if (parseInt(birth) > new Date().getFullYear()) {
            alert('请填写正确年份');
            return false;
        }
        return {
            name: name,
            sNo: sNo,
            birth: birth,
            sex: sex,
            phone: phone,
            email: email,
            address: address
        }
    }

    //发送请求
    function saveData(url, param) {
        var result = null;
        var xhr = null;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }
        if (typeof param == 'string') {
            xhr.open('GET', url + '?' + param, false);
        } else if (typeof param == 'object') {
            var str = "";
            for (var prop in param) {
                str += prop + '=' + param[prop] + '&';
            }
            xhr.open('GET', url + '?' + str, false);
        } else {
            xhr.open('GET', url + '?' + param.toString(), false);
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    result = JSON.parse(xhr.responseText);
                }
            }
        }
        xhr.send();
        return result;
    }

    //封装请求类型方法，回调机制
    function requestData(url, data, cb) {
        if (!data) {
            data = {};
        }
        var result = saveData('https://open.duyiedu.com' + url, Object.assign(data, {
            "appkey": '1209899252ze_1554110339699'
        }));
        if (result.status == 'success') {
            cb && cb.call(student, result);
        } else {
            alert(result.msg);
        }
    }
    
    //绘制页面
    function randerData(res) {
        var str = '';

        var data;

        if (res instanceof Array) {
            data = res;
        } else {
            data = res.data.findByPage;
        }
        // console.log(data);
        tempData = data;
        console.log(tempData);
        data.forEach(function (ele, index) {
            str += '<tr>\
            <td>'+ ele.sNo + '</td>\
            <td>'+ ele.name + '</td>\
            <td>'+ (ele.sex ? "女" : "男") + '</td>\
            <td>'+ ele.email + '</td>\
            <td>'+ (new Date().getFullYear() - ele.birth) + '</td>\
            <td>'+ ele.phone + '</td>\
            <td>'+ ele.address + '</td>\
            <td>\
                <button class="edit" data-index="'+ index + '">编辑</button>\
                <button class="delete" data-index="'+ index + '">删除</button>\
            </td>\
        </tr>'
            //console.log(str);
        });
        self.tbody.innerHTML = str;
    }

    //数据重填
    function randerEditForm(data) {
        for (var prop in data) {
            if (self.editForm[prop]) {
                self.editForm[prop].value = data[prop];
            }
        }
    }

    //按页查询，绘制页面
    function pageData(num) {
        var cruPage = num || student.cruPage;
        store.requestData('/api/student/findByPage', { page: cruPage, size: size }, function (data) {
            store.randerData(data);
        });
    }

    //按页查询，重绘页面和分页插件
    function isCru(num) {
        store.pageData(num);
        $('.page').createPage({
            pageCount: Math.ceil(self.sum / size),
            current: num,
            backFn: function (p) {
                student.cruPage = p;
                store.pageData();
            }
        })
    }

    //返回管理对象，方便后续使用
    return {
        getFormData: getFormData,

        requestData: requestData,

        randerData: randerData,

        randerEditForm: randerEditForm,

        pageData: pageData,

        isCru: isCru
    };
}