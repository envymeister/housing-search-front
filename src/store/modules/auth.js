import axios from 'axios'
import router from '../../plugins/router'
import config from '../../config.js'
export default {
    actions: {
        loginUser(context, requestData) {
            let url = context.getters.getURL;
            const headers = context.getters.getHeaders;

            axios.post(url + "/login", requestData, 
            {
                headers: headers,
            },
            {
                withCredentials: true 
            })
            .then(function(response) {
                setTimeout(() => {context.commit("updateLoginMessageVisible", false);
                router.push("/");
            }, 1000);
                
                context.commit("updateUser", response.data.user);
                context.commit("updateAuthStatus", true);
                context.commit("updateAccessToken", response.data.access_token);
                context.commit("updateRefreshToken", response.data.refresh_token);
                context.commit("updateRole", response.data.user.Role);
                

                context.commit("updateLoginMessageType", "success");
                context.commit("updateLoginMessageVisible", true);
                context.commit("updateLoginMessage", "Добро пожаловать " + response.data.user.PassName);   
                context.commit("updateAvatarURL", response.data.user.AvatartPath);

                localStorage.setItem("access_token", response.data.access_token);
                localStorage.setItem("refresh_token", response.data.refresh_token);
                localStorage.setItem('role', response.data.user.Role);
                localStorage.setItem('avatarUrl', response.data.user.AvatartPath);


                axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.access_token
            })
            .catch(function(error) {
                const status = error.response.status;
                console.log(status);
                context.commit("updateLoginMessageType", "error");
                context.commit("updateLoginMessageVisible", true);

                setTimeout(() => context.commit("updateLoginMessageVisible", false), 1000);
                if(status == '422') {
                    context.commit("updateLoginMessage", "Поля заполнены неправильно!");
                }else 
                if(status == '500') {
                    context.commit("updateLoginMessage", "Внутрення ошибка сервера");
                }else 
                if(status == '401') {
                    context.commit("updateLoginMessage", "Неправильный логин или пароль");  
                }

                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
            })
        },
        logoutUser(context) {
            let url = context.getters.getURL;
            let headers = context.getters.getHeaders;
            let accessToken = context.getters.getAccessToken;


            axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
            axios.post(url + "/logout", {}, {
                headers: headers,
            },
            {
                withCredentials: true 
            })
            .then(function(){
                
                delete axios.defaults.headers.common["Authorization"];
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem('role');
                localStorage.removeItem('avatarUrl');

                context.commit("updateAccessToken", "");
                context.commit("updateRefreshToken", "");
                context.commit("updateAuthStatus", false);
                context.commit("updateRole", "");
                context.commit("updateAvatarURL", "");

                router.push("/login");

            })
            .catch(function(){
                delete axios.defaults.headers.common["Authorization"];
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem('role');
                localStorage.removeItem('avatarUrl');

                context.commit("updateAccessToken", "");
                context.commit("updateRefreshToken", "");
                context.commit("updateAuthStatus", false);
                context.commit("updateRole", "");
                context.commit("updateAvatarURL", "");

                router.push("/login");
            })
        }
    },
    mutations: {
        updateUser(state, user) {
            state.user = user;
        },
        updateRole(state, role) {
            state.role = role;
        },
        updateAccessToken(state, token) {
            state.accessToken = token;
        },
        updateRefreshToken(state, token) {
            state.refreshToken = token;
        },
        updateAuthStatus(state, status) {
            state.isAuthorized = status;
        },
        updateLoginMessageVisible(state, flag) {
            state.LoginMessageVisible = flag;
        },
        updateLoginMessage(state, msg) {
            state.LoginMessage = msg;
        },
        updateLoginMessageType(state, type) {
            state.LoginMessageType = type;
        },
        updateAvatarURL(state, url) {
            state.avatarURL = url
        }
    },
    state: {
        backendURL: config.apiURL,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',  
        },
        accessToken: localStorage.getItem('access_token') || '',
        refreshToken: localStorage.getItem('refresh_token') || '',
        isAuthorized: localStorage.getItem('access_token') ? true: false,

        user: {},
        role: localStorage.getItem('role'),
        avatarURL: localStorage.getItem('avatarUrl'),

        LoginMessageVisible: false,
        LoginMessage: "",
        LoginMessageType: "error",
    },
    getters: {
        getAvatarURL(state){
            return state.avatarURL;
        },
        getAccessToken(state) {
            return state.accessToken;
        },
        getRefreshToken(state) {
            return state.refreshToken;
        },
        getUser(state) {
            return state.user;
        },
        getRole(state) {
            console.log(state.role);
            return state.role;
        },
        getLoginMessageVisible(state) {
            return state.LoginMessageVisible;
        },
        getLoginMessage(state) {
            return state.LoginMessage;
        },
        getLoginMessageType(state) {
            return state.LoginMessageType;
        },
        getHeaders(state) {
            return state.headers;
        },
        getURL(state) {
            return state.backendURL;
        },
        authStatus(state) {
            return state.isAuthorized;
        },
    },
}