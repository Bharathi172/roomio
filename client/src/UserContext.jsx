import { createContext, useState,useEffect } from "react";
import axios from "axios";
export const UserContext = createContext();

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    useEffect( () => {
        if (!user) {
           const {data} =  axios.get('/profile').then(({ data }) => {
                setUser(data); // Update state with user data
            }).catch(err => {
                console.error('Error fetching profile:', err);
            });
        }
    }, [user]);
    

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}
