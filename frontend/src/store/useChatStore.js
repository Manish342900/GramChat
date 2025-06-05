import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { Socket } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true })
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data })
        } catch (error) {
            console.log(error.response.data.message);
        } finally {
            set({ isUsersLoading: false })
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true })
        try {

            const res = await axiosInstance.get(`/messages/${userId}`);
            console.log(res.data)

            set({ messages: res.data })
        } catch (error) {
            console.log(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    sendMessage: async (messageDAta) => {
        // console.log(messageDAta)
        const { selectedUser, messages } = get();

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageDAta);

            set({ messages: [...messages, res.data.newMessage] });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        const authUser = useAuthStore.getState().authUser;
        if (!selectedUser || !authUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage"); // Prevent duplicate listeners

        socket.on("newMessage", (newMessage) => {
            // Ignore if the message is from the current user (already added locally)
            if (newMessage.senderId === authUser._id) return;

            set({ messages: [...get().messages, newMessage] });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket
        socket.off("newMessage")

    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),

}))