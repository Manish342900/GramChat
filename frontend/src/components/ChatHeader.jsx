import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { CiUser } from "react-icons/ci";


const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="md:hidden p-4  rounded-full">
            <button
              className="text-sm text-balck-600"
              onClick={() => setSelectedUser(null)}
            >
              ←
            </button>
          </div>
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              {
                selectedUser?.profilePic ? (
                  <img
                    src={selectedUser.profilePic || "/avatar.png"}
                    alt={selectedUser.fullName}
                    className="rounded-full" />
                ) : (
                  <CiUser className="size-6 text-base-content/70" aria-label="User Avatar" title="User Avatar" />
                )
              }

            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;