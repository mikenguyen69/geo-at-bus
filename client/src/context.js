import {createContext} from 'react'

const context = createContext({
    currentUser: null,
    isAuth: false,
    draft: null, 
    pins: [],
    vehicles: [],    
    intervalID: null
})

export default context;