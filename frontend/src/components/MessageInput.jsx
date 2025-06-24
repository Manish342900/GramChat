import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import useGrammarCorrection from "../hooks/useGrammaerCorrection";
import { useThemeStore } from "../store/useThemeStore";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [suggestionApplied, setSuggestionApplied] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();
  const { corrected, loading, checkGrammar, clearCorrection } = useGrammarCorrection();
  const { theme } = useThemeStore();
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    setSendingMessage(true);
    e.preventDefault();
    e.stopPropagation();
    const finalText = (suggestionApplied ? corrected : text).trim();

    if (!finalText && !imagePreview) return;

    try {
      await sendMessage({
        text: finalText,
        image: imagePreview,
      });


      setText("");
      setImagePreview(null);
      setSuggestionApplied(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="p-4 w-full relative">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {(corrected || loading) && !suggestionApplied && (
        <div
          className={`absolute bottom-full mb-2 left-0 z-20 bg-base-200 px-3 py-1 rounded-md shadow text-sm flex items-center gap-2
            ${theme === "light" ? "text-black" : "text-zinc-400"}
          `}
          style={{ minWidth: "220px" }}
        >
          {loading ? (
            <span>Loading...</span>
          ) : (
            <>
              {
                !suggestionApplied && <span className="flex-1">
                  Suggested: <strong>{corrected}</strong>
                </span>
              }

              <button
                type="button"
                className="underline text-blue-400"
                onClick={() => {
                  const match = corrected.match(/"([^"]+)"/);
                  const extracted = match ? match[1] : corrected;
                  setText(extracted);
                  setSuggestionApplied(true);

                }}
              >
                Apply
              </button>
            </>
          )}
          <button
            type="button"
            aria-label="Close suggestion"
            onClick={() => setSuggestionApplied(true)}
            className="ml-2 text-zinc-500 hover:text-zinc-700"
          >
            &#10005;
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <button
            type="button"
            onClick={() => checkGrammar(text)}
            disabled={!text.trim() || loading}
          >
            ✨
          </button>
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSuggestionApplied(false);
              clearCorrection();
            }}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${imagePreview ? "text-emerald-500" : "text-zinc-400"
              }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"

          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          {sendingMessage ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <Send size={22} />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
