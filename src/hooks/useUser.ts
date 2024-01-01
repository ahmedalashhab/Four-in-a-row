import { getAuth, onAuthStateChanged, UserCredential } from "firebase/auth";
import { useState } from "react";

//get the data of the user currently logged in or status

export const useUser = (): {
    user: UserCredential["user"] | null
    loading: boolean
} => {
    const [user, setUser] = useState<UserCredential["user"] | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        setLoading(false)
        setUser(user)
    })
    return { user, loading}
}