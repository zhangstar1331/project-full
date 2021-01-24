import {http} from '../plugins/axios'

const state = () => ({
    token:'',
    id:'',
    email:'',
    nickname:''
})
const mutations = {
    SET_TOKEN(state, token){
        state.token = token
    },
    SET_USER(state, user){
        state.id = user._id
        state.nickname = user.nickname
        state.email = user.email
    },
    LOGOUT(state){
        state.id = ''
        state.nickname = ''
        state.email = ''
        state.token = ''
    }
}
const actions = {
    login: async ({state, commit}, data) => {
        let ret = await http.post('/user/login', data)
        commit('SET_TOKEN', ret.data.token)
        return ret
    },
    detail: async ({state, commit}, data) => {
        let ret = await http.get('/user/detail')
        if(ret.code === 0){
            commit('SET_USER', ret.data)
            return ret
        }
    }
}
export default {
    namespace: true,
    state,
    mutations,
    actions
}