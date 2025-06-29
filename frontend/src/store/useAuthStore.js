import { create } from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:5001" : "https://gramchat-2.onrender.com"

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigninUp: false,
    isLogginIng: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data })
            get().connectSocket()

        } catch (error) {
            console.log("errir in check auth", error.message)
            set({ authUser: null })

        } finally {
            set({ isCheckingAuth: false })
        }
    },

    signup: async (data,navigate) => {
        set({ isSigninUp: true })
        try {
            const res = await axiosInstance.post("/auth/signup", data)
            set({ authUser: res.data })
            toast.success("Account created Successfully")
            get().connectSocket()
            navigate('login')
        } catch (error) {
            toast.error(error.message)
        } finally {
            set({ isSigninUp: false })
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully");
            get().connectSocket();


        } catch (error) {
            toast.error(error?.response?.data?.message || 'Try again Later');
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            const res = await axiosInstance.post("/auth/logout")
            set({ authUser: null })
            get().disconnectSocket()

            toast.success("Logged out successfully")
        } catch (error) {
            toast.error(error.message)
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true })
        try {
            const res = axiosInstance.put('/auth/update-profile', data)
            set({ authUser: res.data })
            toast.success("PRofile updated succesfully")
        } catch (error) {
            console.log(error.message)
            toast.error(error.message.data.message)

        } finally {

            set({ isUpdatingProfile: false })
        }
    },

    connectSocket: () => {
        const { authUser } = get()
        if (!authUser || get().socket?.connected) return
        const socket = io(BASE_URL, {
            withCredentials: true,
            transports: ["websocket"],
            autoConnect: true,
            query: { userId: authUser._id }
        });

        socket.connect()
        set({ socket });
        socket.on("getOnlineUsers", (usersIds) => {
            set({ onlineUsers: usersIds })
        })
    },
    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    }


}))