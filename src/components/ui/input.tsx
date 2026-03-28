import * as React from "react";
import { cn } from "@/lib/utils";
import ReactQuill from "react-quill";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Smile } from "lucide-react";
import "react-quill/dist/quill.snow.css";
import "katex/dist/katex.min.css";
import { ReactQuillEditorProps, TextareaWithEmojiProps, TipTapEditorProps } from "../type";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          `flex h-12 w-full border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 rounded transition-colors
          file:border-0 file:bg-white file:text-sm file:font-medium file:text-foreground
          placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-slate-500
          disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// ---------------- Textarea + Emoji Picker ----------------

const TextareaWithEmoji = React.forwardRef<HTMLTextAreaElement, TextareaWithEmojiProps>(
  ({ className, onEmojiSelect, ...props }, ref) => {
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + emojiData.emoji + text.substring(end);
        
        textarea.value = newText;
        textarea.selectionStart = textarea.selectionEnd = start + emojiData.emoji.length;
        textarea.focus();

        if (onEmojiSelect) {
          onEmojiSelect(emojiData.emoji);
        }

        // Trigger onChange event
        const event = new Event("input", { bubbles: true });
        textarea.dispatchEvent(event);
      }
      setIsEmojiPickerOpen(false);
    };

    return (
      <div className="relative">
        <textarea
          ref={textareaRef}
          className={cn(
            "flex min-h-[100px] w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-700",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
          className="absolute bottom-2 right-2 rounded p-1.5 transition-colors hover:bg-slate-100"
          aria-label="choose emoji"
        >
          <Smile className="size-5 text-slate-500" />
        </button>
        {isEmojiPickerOpen && (
          <div className="absolute bottom-12 right-0 z-50">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              autoFocusSearch={false}
              theme={Theme.LIGHT}
            />
          </div>
        )}
      </div>
    );
  }
);
TextareaWithEmoji.displayName = "TextareaWithEmoji";

// ---------------- React Quill Editor ----------------

const ReactQuillEditor = React.memo<ReactQuillEditorProps>(
  React.forwardRef<HTMLDivElement, ReactQuillEditorProps>(
    ({ value = "", onChange, placeholder, className, disabled = false }, ref) => {
      const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
      const quillRef = React.useRef<ReactQuill>(null);
      const containerRef = React.useRef<HTMLDivElement>(null);

      // Forward ref to container div
      React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

      const modules = React.useMemo(
        () => ({
          toolbar: {
            container: [
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ align: [] }],
              ["link", "image"],
              ["clean"],
            ],
          },
        }),
        []
      );

      const handleEmojiClick = React.useCallback((emojiData: EmojiClickData) => {
        if (quillRef.current) {
          const quillEditor = quillRef.current.getEditor();
          const range = quillEditor.getSelection(true);
          if (range) {
            const newIndex = range.index + emojiData.emoji.length;
            quillEditor.insertText(range.index, emojiData.emoji, "user");
            // Use setTimeout to ensure the text is inserted before setting selection
            setTimeout(() => {
              quillEditor.setSelection(newIndex, 0);
            }, 0);
          }
        }
        setIsEmojiPickerOpen(false);
      }, []);

      return (
        <div ref={containerRef} className={cn("relative", className)}>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            modules={modules}
            readOnly={disabled}
          />
          <button
            type="button"
            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            className="absolute top-2 right-2 z-10 rounded p-1.5 transition-colors hover:bg-slate-100"
            aria-label="choose emoji"
          >
            <Smile className="size-5 text-slate-500" />
          </button>
          {isEmojiPickerOpen && (
            <div className="absolute top-12 right-0 z-50">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                autoFocusSearch={false}
                theme={Theme.LIGHT}
              />
            </div>
          )}
        </div>
      );
    }
  )
);

ReactQuillEditor.displayName = "ReactQuillEditor";

// ---------------- Tiptap Editor ----------------

const TipTapEditor: React.FC<TipTapEditorProps> = ({
  value = "",
  onChange,
  className,
  disabled = false,
}) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (editor) {
      editor.chain().focus().insertContent(emojiData.emoji).run();
    }
    setIsEmojiPickerOpen(false);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <div className="rounded-md border border-slate-300 bg-white p-2">
        <EditorContent editor={editor} />
      </div>
      <button
        type="button"
        onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
        className="absolute top-2 right-2 z-10 rounded p-1.5 transition-colors hover:bg-slate-100"
        aria-label="choose emoji"
      >
        <Smile className="size-5 text-slate-500" />
      </button>
      {isEmojiPickerOpen && (
        <div className="absolute top-12 right-0 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            theme={Theme.LIGHT}
          />
        </div>
      )}
    </div>
  );
};

export { Input, TextareaWithEmoji, ReactQuillEditor, TipTapEditor };
