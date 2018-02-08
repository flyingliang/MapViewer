/**
 * Created by Jiang on 2015/11/12.
 */
define([
    "dojo/dom",
    "dojo/on",
    "dojo/parser",
    "dojo/dom-construct",
    "dojo/request/xhr",
    "dojo/topic",
    "dojo/json",
    "dojo/_base/lang",
    "dojo/_base/event",
    "dojo/_base/array",
    "dojo/cookie",
    "dojo/mouse",
    "dojo/sniff"
], function (dom,
             on,
             parser,
             domConstruct,
             xhr,
             topic,
             JSON,
             lang,
             Event,
             Array,
             cookie,
             mouse,
             sniff) {

    /**
     * 值是否存在于数组
     * @param value     要查找的值
     * @param array     数组
     * @param bool      true:返回数组下标；false:返回是否存在 true or false
     * @returns {*}
     */
    function isInArray(value, array, bool) {
        if (typeof value == "string") {
            for (var i in array) {
                if (value === array[i]) {
                    if (bool)
                        return i;
                    return true;
                }
            }
        }
        if (bool)
            return -1;
        return false;
    }

    /**
     * 属性值 等于 value的某个对象 是存在于 对象数组
     * @param value     要查找的值
     * @param objsArray 对象数组
     * @param id        属性名称
     * @param bool      true:返回数组下标；false:返回是否存在 true or false
     * @returns {*}
     */
    function isInArrayObj(value, objsArray, id, bool) {
        if (typeof value == "string") {
            for (var i in objsArray) {
                if (value === objsArray[i][id]) {
                    if (bool)
                        return i;
                    return true;
                }
            }
        }
        if (bool)
            return -1;
        return false;
    }

    /**
     * 获得对象的类型
     * @param o             对象目标
     * @returns {string}    对象类型，小写
     */
    function getType(o) {
        var _t;
        return ((_t = typeof(o)) == "object" ? o == null && "null" || Object.prototype.toString.call(o).slice(8, -1) : _t).toLowerCase();
    }

    /**
     * De-duplicate Array items
     * @param array
     * @returns {Array.<T>|string|*}
     */
    function arrayUnique(array) {
        var a = array.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j])
                    a.splice(j--, 1);
            }
        }
        return a;
    }

    /**
     * Remove an item from Array by value.
     *  e.g.
     *      var ary = ['three', 'seven', 'eleven'];
     *      removeA(ary, 'seven');
     *      returned value: (Array) ['three','eleven']
     * @param arr
     * @returns {*}
     */
    function removeValue(arr) {
        var what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax = arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    }

    return {
        isInArray: isInArray,
        isInArrayObj: isInArrayObj,
        getType: getType,
        arrayUnique: arrayUnique
    }
});