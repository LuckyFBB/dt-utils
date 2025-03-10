/* eslint-disable no-unused-expressions */
/* eslint-disable no-cond-assign */
import _ from 'lodash';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare let APP: any;
interface BrowserInter {
    chrome?: string;
    ie?: string;
    edge?: string;
    firefox?: string;
    safari?: string;
    opera?: string;
}
interface DownloadParams {
    url: string;
    fileName?: string;
    payload?: object;
    finallyCallback?: () => void;
    successCallback?: (res: Response) => void;
    errorCallback: (res: Response) => void;
}

const utils = {
    /**
     * @description 浏览器类型和版本检测
     * @returns {Boolean} `true`表示通过兼容性检测,`false`表示不通过兼容性检测
     */
    browserCheck() {
        const Sys: BrowserInter = {};
        if (utils.isMobileDevice()) {
            return true;
        } // 忽略移动设备
        const ua = navigator.userAgent.toLowerCase();
        let s;
        // prettier-ignore
        (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1]
            : (s = ua.match(/msie ([\d\.]+)/)) ? Sys.ie = s[1]
                : (s = ua.match(/edge?\/([\d\.]+)/)) ? Sys.edge = s[1]
                    : (s = ua.match(/firefox\/([\d\.]+)/)) ? Sys.firefox = s[1]
                        : (s = ua.match(/(?:opera|opr).([\d\.]+)/)) ? Sys.opera = s[1]
                            : (s = ua.match(/chrome\/([\d\.]+)/)) ? Sys.chrome = s[1]
                                : (s = ua.match(/version\/([\d\.]+).*safari/)) ? Sys.safari = s[1] : 0;
        if (
            (Sys.chrome && parseInt(Sys.chrome.split('.')[0], 10) >= 66) ||
            Sys.firefox ||
            Sys.edge
        ) {
            return true;
        }
        return false;
    },
    checkExist(prop: any) {
        return prop !== undefined && prop !== null && prop !== '';
    },
    /**
     * 转换 Byte 转换为小于1024值最大单位
     * @param value 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' 转换原始值
     */
    convertBytes(value: number) {
        let valueTemp = value;
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        let i = 0;
        while (valueTemp >= 1024) {
            valueTemp = Number((valueTemp / 1024).toFixed(2));
            i++;
        }
        return `${valueTemp} ${units[i]}`;
    },
    isMacOs() {
        return navigator.userAgent.indexOf('Macintosh') > -1;
    },

    isWindows() {
        return navigator.userAgent.indexOf('Windows') > -1;
    },
    isMobileDevice() {
        return (
            typeof window.orientation !== 'undefined' ||
            navigator.userAgent.indexOf('IEMobile') !== -1
        );
    },
    /**
     * 根据参数名获取URL数据
     * @param  {[type]} name [description]
     * @param  {[type]} url  [description]
     */
    getParameterByName(name: string, url?: string) {
        let urlTemp = url;
        if (!urlTemp) {
            urlTemp = window.location.href;
        }
        const nameTemp = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + nameTemp + '(=([^&#]*)|&|#|$)');

        const results = regex.exec(urlTemp);
        if (!results) {
            return null;
        }
        if (!results[2]) {
            return '';
        }

        const paramValue = decodeURIComponent(results[2].replace(/\+/g, ' '));
        if (paramValue === 'null') {
            return null;
        }
        if (paramValue === 'undefined') {
            return undefined;
        }
        return paramValue;
    },
    /**
     *
     * @param pathname 地址
     * @param queryParams url参数
     * @returns 两者生成的完整url地址
     */
    generateFullUrlPath(pathname: string, queryParams = {}) {
        const params = new URLSearchParams(queryParams);
        const queryString = params.toString();
        return pathname + (queryString ? `?${queryString}` : '');
    },
    /**
     *
     * @param search location.search
     * @returns query 参数
     */
    getQueryParameters(search: string) {
        const searchParams = new URLSearchParams(search);
        const paramValue = Object.fromEntries(searchParams.entries());
        for (const key in paramValue) {
            if (paramValue[key] === 'null') {
                (paramValue[key] as any) = null;
            }
            if (paramValue[key] === 'undefined') {
                (paramValue[key] as any) = undefined;
            }
        }

        return paramValue;
    },
    /**
     * 获取图片的Base64格式
     * @param  {[type]}   img      [description]
     * @param  {Function} callback [description]
     */
    getBase64(img: any, callback: (img: any) => void) {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    },

    /**
     * 百分比转换
     * @param  {[type]} num       [description]
     * @param  {[type]} precision [description]
     */
    percent(num: number, precision?: number) {
        let numTemp = num;
        if (!numTemp || numTemp === Infinity) {
            return 0 + '%';
        }
        if (numTemp > 1) {
            numTemp = 1;
        }
        let precisionTemp = precision || 2;
        precisionTemp = Math.pow(10, precisionTemp);
        return Math.round(numTemp * precisionTemp * 100) / precisionTemp + '%';
    },
    /**
     *
     *
     * @param {Record<string, any>} [object={}]
     * @returns
     */
    getCssText(object: Record<string, any> = {}) {
        let str = '';
        for (const attr in object) {
            if (object.hasOwnProperty(attr)) {
                str += attr + ':' + object[attr] + ';';
            }
        }
        return str;
    },

    /**
     * @description: 去除字符串前后空格
     * @param: str 带有空格的字符串
     * @returns: 返回去除前后空格的字符串
     */
    trim(str: string) {
        if (typeof str !== 'string') return str;
        return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    },

    /**
     * @description: 去除字符串的所有空格
     * @param: str 带有空格的字符串
     * @returns: 返回去除所有空格的字符串
     */
    trimAll(str: string) {
        if (typeof str !== 'string') return str;
        return str.replace(/\s/g, '');
    },

    // 转换为千分位
    getThousandth(num: string | number) {
        let numTemp = num;
        if (numTemp === null || numTemp === undefined || numTemp === '') return '0';
        numTemp = `${num}`;
        const [integer, decimal] = numTemp.split('.');
        return `${integer.replace(/(\d)(?=(\d{3})+$)/g, '$1,')}${decimal ? `.${decimal}` : ''}`;
    },

    // 文字溢出转换
    textOverflowExchange(text: string, length: number) {
        if (text && text.length > length) {
            return text.substring(0, length) + '...';
        }
        return text;
    },
    /**
     * json格式化
     * @param {格式化内容} text
     * @param {格式化占位符} space
     */
    jsonFormat(text: string, space?: number) {
        if (!text) {
            return text;
        }
        try {
            const json = JSON.parse(text);
            const output = JSON.stringify(json, null, space || 2);

            return output;
        } catch (e) {
            return null;
        }
    },
    /**
     * 多函数排序，匹配到0为止
     */
    sortByCompareFunctions(arr: any[], ...compareFunctions: any[]) {
        arr.sort((a, b) => {
            let result = 0;
            for (const func of compareFunctions) {
                result = func(a, b);
                if (result !== 0) {
                    return result;
                }
            }
            return result;
        });
    },
    /**
     * 转换排序字段
     */
    exchangeOrder(order: string) {
        switch (order) {
            case 'ascend':
                return 'asc';
            case 'descend':
                return 'desc';
            default:
                return undefined;
        }
    },
    /**
     * 生成一个key
     */
    generateAKey() {
        return '' + new Date().getTime() + ~~(Math.random() * 1000000);
    },

    /**
     * 判断是否是JSON string
     * @param  {String}  str 所要验证的字符串
     * @return {Boolean}   是否是JSON字符串
     */
    isJSONStr(str: string) {
        const strTemp = utils.trim(str);
        return (
            (strTemp.charAt(0) === '{' && strTemp.charAt(strTemp.length - 1) === '}') ||
            (strTemp.charAt(0) === '[' && strTemp.charAt(strTemp.length - 1) === ']')
        );
    },
    /**
     *
     *  校验手机
     * @param {*} tel
     * @returns
     */
    isPhoneNumber(tel: string) {
        const reg = /^0?1[3|4|5|6|7|8][0-9]\d{8}$/;
        return reg.test(tel);
    },
    /**
     *  判断是否是函数
     *
     * @param {*} arg
     * @returns
     */
    isFunction(arg: any) {
        if (arg) {
            // eslint-disable-next-line no-constant-condition
            if (typeof /./ !== 'function') {
                return typeof arg === 'function';
            } else {
                return Object.prototype.toString.call(arg) === '[object Function]';
            }
        }
        return false;
    },
    /**
     * 随机生成一串6位同时包含数字、大小写字母的字符串
     * @param len number
     */
    getRandomStr(len: number): string {
        const numChar = '0123456789';
        const lowerCaseChar = 'abcdefghijklmnopqrstuvwxyz';
        const upperCaseChar = 'ABCDEFGHIJKLMNOPQRSTUVXYZ';
        function getChar(baseChar: string) {
            const randomIndex = Math.random() * (baseChar.length - 1);
            return baseChar.charAt(randomIndex);
        }
        let currentChar = 'num';
        let str = '';
        for (let i = 0; i < len; i++) {
            if (currentChar === 'num') {
                str += getChar(numChar);
                currentChar = 'lower';
            } else if (currentChar === 'lower') {
                str += getChar(lowerCaseChar);
                currentChar = 'upper';
            } else if (currentChar === 'upper') {
                str += getChar(upperCaseChar);
                currentChar = 'num';
            }
        }
        return str;
    },
    /**
     * simply judge whether the array is equal
     * @param arr1
     * @param arr2
     * @returns arr1 === arr2
     */
    isEqualArr(arr1: string[], arr2: string[]): boolean {
        const toString = JSON.stringify;
        return toString(arr1.sort()) === toString(arr2.sort());
    },
    /**
     *
     *
     * @param {*} a
     * @param {*} b
     * @returns boolean
     */
    isEqual(a: any, b: any): boolean {
        for (const key in a) {
            if (
                {}.hasOwnProperty.call(a, key) &&
                (!{}.hasOwnProperty.call(b, key) || a[key] !== b[key])
            ) {
                return false;
            }
        }
        for (const key in b) {
            if ({}.hasOwnProperty.call(b, key) && !{}.hasOwnProperty.call(a, key)) {
                return false;
            }
        }
        return true;
    },
    /**
     *
     *
     * @param {*} targetComponent
     */
    shouldRender(targetComponent: any) {
        targetComponent.prototype.shouldComponentUpdate = function (props: any, state: any) {
            return !utils.isEqual(this.state, state) || !utils.isEqual(this.props, props);
        };
    },
    /**
     *
     * 计算字符串长度(英文占1个字符，中文汉字占2个字符)
     * @param {*} str
     * @returns number
     */
    getStrlen(str: string) {
        let len = 0;
        for (let i = 0; i < str.length; i++) {
            const c = str.charCodeAt(i);
            // 单字节加1
            if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
                len++;
            } else {
                len += 2;
            }
        }
        return len;
    },
    transformArray<T>(arr: T[], num: number): T[][] {
        const length = arr.length;
        const res: T[][] = [];
        let i = 0;
        while (i * num < length) {
            res.push(arr.slice(i * num, (i + 1) * num));
            i++;
        }
        return res;
    },
    isEmpty(data?: any) {
        if (data === '') return true;
        if (data === null) return true;
        if (data === undefined) return true;
        if (Array.prototype.isPrototypeOf(data) && data.length === 0) return true;
        if (Object.prototype.isPrototypeOf(data) && Object.keys(data).length === 0) return true;
        return false;
    },
    isObj(obj?: any) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    },
    removeEmpty(obj?: any) {
        if (!obj || !utils.isObj(obj)) return;
        Object.entries(obj).forEach(([key, val]) => {
            if (val && utils.isObj(val)) utils.removeEmpty(val);
            else if (utils.isEmpty(val)) delete obj[key];
        });
        return obj;
    },
    mergeDeep(object1: Record<string, any>, object2: Record<string, any>) {
        if (object1 == null || object2 == null) {
            return object1 || object2;
        } else if (!_.isPlainObject(object1) || !_.isPlainObject(object2)) {
            return object2;
        } else if (object1 === object2) {
            return object2;
        } else {
            if ('_isMergeAtom' in object2) {
                const isMergeAtom = object2._isMergeAtom;
                delete object2._isMergeAtom;

                if (isMergeAtom) {
                    return object2;
                }
            }
            const obj = {
                ...object1,
            };
            _.forEach(object2, (value, key) => {
                if (key in object1) {
                    obj[key] = utils.mergeDeep(object1[key], value);
                } else {
                    obj[key] = value;
                }
            });

            return obj;
        }
    },
    /**
     * 下载文件
     * @param {string}   url              请求地址
     * @param {string}   fileName         输出名字，如果不传就是后端写入文件名
     * @param {object}   payload          请求数据
     * @param {function} successCallback  导出正确的回调函数，处理一些message展示
     * @param {function} errorCallback    导出失败的回调函数
     * @param {function} finallyCallback  成功/失败都会执行回调函数，例如控制一些visible显示隐藏
     * */
    downLoadData(params: DownloadParams) {
        const { url, payload, finallyCallback, successCallback, errorCallback } = params;
        fetch(url, { method: 'POST', body: JSON.stringify(payload) })
            .then((response) => {
                if (response.status !== 200) return errorCallback(response);
                const contentType = response.headers.get('Content-type') || '';
                if (contentType.includes('application/json')) return errorCallback(response);
                let { fileName } = params;
                if (!fileName) {
                    const disposition = response.headers.get('Content-disposition') || '';
                    fileName = disposition.split('filename=')[1];
                }
                response.blob().then((blob) => {
                    const href = URL.createObjectURL(blob);
                    const dom = document.createElement('a');
                    dom.setAttribute('href', href);
                    dom.setAttribute('download', decodeURIComponent(fileName || ''));
                    dom.click();
                    URL.revokeObjectURL(href);
                    successCallback && successCallback(response);
                });
            })
            .finally(() => {
                finallyCallback && finallyCallback();
            });
    },
    isUtf8(s: string) {
        const lastnames = ['ä', 'å', 'æ', 'ç', 'è', 'é'];
        lastnames.forEach((element) => {
            if (s && s.indexOf(element) > -1) {
                return false;
            }
        });
        return true;
    },
    utf16to8(str: string) {
        if (typeof str !== 'string') return str;
        if (!this.isUtf8(str)) return str;
        let out: string, i: number, c: number;
        out = '';
        const len = str.length || 0;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if (c >= 0x0001 && c <= 0x007f) {
                out += str.charAt(i);
            } else if (c > 0x07ff) {
                out += String.fromCharCode(0xe0 | ((c >> 12) & 0x0f));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3f));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
            } else {
                out += String.fromCharCode(0xc0 | ((c >> 6) & 0x1f));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
            }
        }
        return out;
    },
    base64Encode(value: string) {
        let result = value;
        if (!result) {
            return result;
        }
        try {
            result = btoa(this.utf16to8(value));
        } catch (err) {
            console.log(err);
        }
        return result;
    },
};
export default utils;
