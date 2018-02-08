/**
 * Created by Esri on 2015/4/13.
 */
//"use strict";
//
//"use strict";
//
require(["dojo/dom","dojo/on","dojo/request/xhr",

        "dojo/domReady!"],
    function(dom,on,xhr){
    //
        var loginService="../../Portal/main/*.action?";
        var userName="";
        var pwd="";
        var appEvent=null;
        //init
        (function(){
            //
            appEvent=window.parent.appEvent;
            //loadLoginInfo();

        })();

        /**用户登录*/
        function login(){
            //
            xhr(loginService,{
                data:{
                    username:userName,
                    password:pwd,
                    commandId:"PortalLoginCommand",
                    command:"logIn",
                    usertype:userType
                },
                method:"POST",
                handleAs:"json"
            }).then(function(data){

                /**
                 * data format:
                 * {
                 *   "result": "loginOk"
                 * }
                 * */
                if(data.result==="loginOk"){
                    hideLoginError();
                    loadLoginInfo();
                    //getArcgisServiceToken();
                    //
                    //console.log("login btn clicked....");
                }else{
                    //appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:data.result});
                    //$("#login-err").show();
                    //$("#error-info").html(data.result);
                    //alert(data.result);
                    //$("#login-err").show();
                    //$("#login-error").val(data.result);
                    showLoginError(data.result);
                }
            },function(error){
                //
                //appEvent.dispatchAppEvent(appEvent.SHOW_TOASTER,{info:error.toString()});
                //$("#login-err").show();
                //$("#error-info").html(data.result);
                //alert(error.toString());
                showLoginError(error.toString());
            });
        }
        function showLoginError(msg){
            $("#login-err").show();
            $("#login-err").html(msg);
        }
        function hideLoginError(){
            $("#login-err").hide();
        }
        //
        function getArcgisServiceToken(){
            //
            xhr(loginService,{
                //
                data:{
                    commandId:"PortalLoginCommand",
                    command:"getArcgisToken"
                },
                method:"POST",
                handleAs:"json"
            }).then(
                function(data){
                    //
                    appEvent.dispatchAppEvent(appEvent.SET_ARCGIS_SERVICE_TOKEN,data.token);
                    console.log(data.token);
                    //var info=JSON.stringify(data);
                    //console.log(info);
                },
                function(error){
                    //
                    console.log(error);
                }
            );
        }
        /**加载用户登录信息*/
        function loadLoginInfo(){
            //
            xhr(loginService,{
                //
                method:"POST",
                handleAs:"json",
                data:{
                    command:"getLoginUserInfo",
                    commandId:"PortalLoginCommand"
                }
            }).then(function(data){
                /**
                 * data format
                 * {
                    "username": "门户管理员",
                    "ifmanager": "1",
                    "iflogin": "login"
                 }
                 * */
                if(data.username){
                    //
                    clearLoginInfo();

                    data.id="#small-popup";
                    appEvent.dispatchAppEvent(appEvent.USER_LOGIN,data);
                    //获取Arcgis Service token
                    //getArcgisServiceToken();
                }
            },function(error){
                //
                appEvent.dispatchAppEvent(appEvent.USER_LOGIN_ERROR,error);

            });
        }

        //
        on(dom.byId("btn-login"),"click",function(event){
            //
            userName=$("#user-info").val();
            pwd=$("#password-info").val();
            //
            if(userName&&pwd){
                //
                login();

            }else{
                //
                //$("#user-info").focus();
                alert("用户名或密码为空");
            }
        });
        var remindStyle="remind";
        var remindStyleClicked="remind-clicked";
        //
        //
//
        function replaceDomStyle(domNode,oldStyle,newStyle){
            //
            $(domNode).removeClass(oldStyle);
            $(domNode).addClass(newStyle)
        }
        //
        //
        function changeDomNodeStyle(domNode){
            //
            var hasStyle=$(domNode).hasClass(remindStyle);
            if(hasStyle){
                //
                replaceDomStyle($(domNode),remindStyleClicked,remindStyle);
            }else{
                replaceDomStyle($(domNode),remindStyle,remindStyleClicked);
            }
        }
        //
        $("#remind-pass").click(function(){
            //
            changeDomNodeStyle(this);
            console.log("remind pass btn clicked..");
        });

        $("#auto-login").click(function(){
            //
            console.log("auto-login btn clicked.");
            changeDomNodeStyle(this);
        });
        //
        $("#btn-cancel").click(function(event){
            //
            clearLoginInfo();
            var modalId="#small-popup";
            appEvent.dispatchAppEvent(appEvent.HIDE_MODAL_DIALOG,{id:modalId});
        });
        //
        function clearLoginInfo(){
            //
            $("#user-info").val("");
            $("#password-info").val("");

            //
            $("#login-err").val("");
            $("#login-err").hide();
            //$("#user-info").attr("autofocus","autofocus");
            //$("#user-info").focus();
        }
        //
});
//
var userType=0;
function userTypeClickHandler($item){

    userType=$item.value;
}
