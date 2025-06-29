import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { CiUser } from "react-icons/ci";
import { Send } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    setSelectedUser,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [selectedUser?._id]);

  useEffect(() => {
    if (messageEndRef.current && messages?.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="md:hidden p-2 border-b">
          <button
            className="text-sm text-blue-600"
            onClick={() => setSelectedUser(null)}
          >
            ← Back
          </button>
        </div>
        <ChatHeader />
        <div className="flex-1 overflow-y-auto">
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="md:hidden p-2 border-b">
        <button
          className="text-sm text-blue-600"
          onClick={() => setSelectedUser(null)}
        >
          ← Back
        </button>
      </div>

      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message) => {
          const repliedMessage = message.replyTo
            ? messages.find(m => m._id === message.replyTo)
            : null;

          return (
            <MessageBubble
              key={message._id}
              message={message}
              repliedMessage={repliedMessage}
              isOwn={message.senderId === authUser._id}
              onReply={() => setReplyingTo(message)}
            />
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <MessageInput
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
};

function MessageBubble({ message, isOwn, onReply, repliedMessage }) {
  const [showActions, setShowActions] = useState(false);
  const touchStartX = useRef(null);
  const { authUser } = useAuthStore();
  const { selectedUser } = useChatStore();

  const messageRef = useRef(null);

  const handleReplyClick = () => {
    if (repliedMessage) {
      const repliedElement = document.getElementById(`message-${repliedMessage._id}`);
      if (repliedElement) {
        repliedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optional: highlight the message briefly
        repliedElement.classList.add('bg-blue-100', 'bg-opacity-50');
        setTimeout(() => {
          repliedElement.classList.remove('bg-blue-100', 'bg-opacity-50');
        }, 1000);
      }
    }
  };

  // Mobile: handle swipe right to reply
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current !== null) {
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      if (diff > 60) {
        onReply();
      }
      touchStartX.current = null;
    }
  };


  return (
    <div
      id={`message-${message._id}`}
      ref={messageRef}
      className={`chat ${isOwn ? "chat-end" : "chat-start"} group relative`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleReplyClick}

    >



      <div className="chat-image avatar">
        {(message.senderId === authUser._id ? authUser.profilePic : selectedUser.profilePic) ? (
          <div className="size-10 rounded-full border overflow-hidden">
            <img
              src={
                message.senderId === authUser._id
                  ? authUser.profilePic
                  : selectedUser.profilePic
              }
              alt="profile pic"
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <CiUser className="text-3xl text-gray-500" />
        )}
      </div>

      <div className="chat-header mb-1 flex items-center gap-2">
        <span className="font-semibold">
          {message.senderId === authUser._id ? "You" : selectedUser.username}
        </span>
        <time className="text-xs opacity-50 ml-1">
          {formatMessageTime(message.createdAt)}
        </time>


      </div>

      <div className="flex w-fit">
        {
          isOwn && (
            <>
              <button
                className="hidden md:group-hover:flex items-center w-fit h-fit ml-2 p-1 rounded-full hover:bg-base-300 transition"
                style={{ transform: 'rotate(-90deg)' }}
                onClick={(e) => {
                  e.stopPropagation()
                  onReply()
                }}
                title="Reply"
              >
                <Send size={18} />
              </button>
              <div className="chat-bubble flex flex-col">
                {repliedMessage && (
                  <div className=" flex flex-row w-max bg-base-200 border-l-4 border-blue-400 px-3 py-2 mb-1 rounded text-xs text-zinc-600 ">

                    <div className="w-full">
                      {repliedMessage.text || (repliedMessage.image ? '[Image]' : 'Message')}
                    </div>
                    {repliedMessage.image && (
                      <img
                        src={repliedMessage.image}
                        alt="Replied Attachment"
                        className="max-w-[100px] rounded mt-1"
                      />
                    )}
                  </div>
                )}
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}

              </div>
            </>
          )
        }
        {
          !isOwn && (
            <>
              <div className="chat-bubble flex flex-col">
                {repliedMessage && (
                  <div className=" flex flex-row w-max bg-base-200 border-l-4 border-blue-400 px-3 py-2 mb-1 rounded text-xs text-zinc-600 ">

                    <div className="w-full">
                      {repliedMessage.text || (repliedMessage.image ? '[Image]' : 'Message')}
                    </div>
                    {repliedMessage.image && (
                      <img
                        src={repliedMessage.image}
                        alt="Replied Attachment"
                        className="max-w-[100px] rounded mt-1"
                      />
                    )}
                  </div>
                )}
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}

              </div>
              <button
                className="hidden md:group-hover:flex items-center w-fit h-fit ml-2 p-1 rounded-full hover:bg-base-300 transition"
                style={{ transform: 'rotate(-90deg)' }}
                onClick={(e) => {
                  e.stopPropagation()
                  onReply()
                }}
                title="Reply"
              >
                <Send size={18} />
              </button>
            </>
          )
        }
      </div>
    </div>
  );
}

export default ChatContainer;