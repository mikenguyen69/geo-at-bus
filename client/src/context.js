import {createContext} from 'react'

const context = createContext({
    currentUser: null,
    isAuth: false,
    draft: null, 
    pins: [],
    vehicles: [],
    trips: [],
    currentPin: null
})

export default context;