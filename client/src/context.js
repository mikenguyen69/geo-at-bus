import {createContext} from 'react'

const context = createContext({
    currentUser: null,
    isAuth: false,
    draft: null, 
    pins: [],
    vehicles: [],
    currentPin: null
})

export default context;