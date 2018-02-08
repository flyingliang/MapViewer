/**
 * Created by Esri on 2015/3/23.
 */
require(["dojo/dom", "dojo/_base/unload", "esri/dijit/Bookmarks",
        "dojo/cookie", "dojo/_base/array", "dojo/json",

        "esri/dijit/BookmarkItem",

        "viewer/AppEvent",

        "dojo/domReady!"],
    function (dom, unload, Bookmarks, cookie, Array, JSON, BookmarkItem, AppEvent) {
        //
        var BOOK_MARK_KEY = "bookMarkKey";
        var map = null;
        var bookMark = null;
        var appEvent = null;
        (function () {
            //
            map = window.parent.mainMap;
            appEvent = window.parent.appEvent;
            if (appEvent) {
                //
                //appEvent.dispatchAppEvent(appEvent.REMOVE_CACHE_LAYER, {isClear: true});
            }
            //map.graphics.clear();
            //
            //AppEvent.dispatchAppEvent(AppEvent.REMOVE_CACHE_LAYER,{isClear:true});
            bookMark = new Bookmarks({
                //
                map: map,
                bookmarks: [],
                editable: true
            }, dom.byId("bookmarks"));
            //
            //map.graphics.clear();
            //
            createBookMarkItems(bookMark);
            //

        })();

        /**从cookie中读取书签信息，并创建书签项*/
        function createBookMarkItems(bookMark) {
            //
            var info = cookie(BOOK_MARK_KEY);
            //
            if (info) {
                //
                var books = JSON.parse(info);
                Array.forEach(books, function (book) {
                    //
                    var item = new BookmarkItem(book);
                    bookMark.addBookmark(item);
                });
            }
        }

        /**将书签信息保存到cookie中*/
        window.saveBookMarks = function (data) {
            //
            //alert("page is unload...");
            //console.log("page is unload...");
            var marks = bookMark.bookmarks;
            if (marks) {
                //
                var info = JSON.stringify(marks);
                cookie(BOOK_MARK_KEY, info, {expires: 5});
            }
        };
        //
        unload.addOnUnload(window, window.saveBookMarks);
    });
