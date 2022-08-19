import create from "zustand";

type SessionStatus = 'uncertain' | 'loggedIn' | 'logOut'


export const useAuthenticationStore = create<{
    loginStatus: SessionStatus;
    setLoginStatus: (arg: SessionStatus) => void;

}>((set) => ({
    loginStatus: 'uncertain',
    setLoginStatus: (newSessionStatus: SessionStatus) => set({
        loginStatus: newSessionStatus
    }),
}));