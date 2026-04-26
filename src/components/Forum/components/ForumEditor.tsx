import React, {
  useCallback,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  useEditor,
  EditorContent,
  ReactRenderer,
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewProps,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Mention from "@tiptap/extension-mention";
import { mergeAttributes, Node } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import {
  RichTextDocument,
  RichTextNode,
  PostMention,
} from "../../../models/forumModels";
import { Button } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { MentionList, MentionListHandle } from "./MentionList";
import { ForumService } from "../../../_services/forumService";
import { ImageKitService } from "../../../_services/imagekitService";

// ─────────────────────────────────────────────
// Forum image node  (resizable)
// ─────────────────────────────────────────────

const MIN_WIDTH = 80;
const MAX_WIDTH = 900;

const ForumImageNodeView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const width = (node.attrs.width as number | null) ?? null;
  const dragStartX = useRef<number>(0);
  const dragStartW = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragStartX.current = e.clientX;
    dragStartW.current =
      containerRef.current?.getBoundingClientRect().width ?? width ?? 400;

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - dragStartX.current;
      const next = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, Math.round(dragStartW.current + delta)),
      );
      updateAttributes({ width: next });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <NodeViewWrapper>
      <div
        ref={containerRef}
        className={`relative block my-2 mx-auto ${
          selected ? "ring-2 ring-blue-500 rounded" : ""
        }`}
        style={{ width: width ? `${width}px` : "auto", maxWidth: "100%" }}
        contentEditable={false}
      >
        <img
          src={node.attrs.src as string}
          alt={(node.attrs.alt as string) || ""}
          className="block w-full h-auto rounded object-contain max-h-[600px]"
          loading="lazy"
          draggable={false}
        />
        {/* Resize handle — only visible when node is selected */}
        {selected && (
          <div
            onMouseDown={startResize}
            className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize bg-blue-500 rounded-tl opacity-80 hover:opacity-100"
            title="Drag to resize"
          />
        )}
      </div>
    </NodeViewWrapper>
  );
};

const ForumImageExtension = Node.create({
  name: "forumImage",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      width: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "img[data-forum-image]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes, { "data-forum-image": "" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ForumImageNodeView);
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("forumImageClipboardPaste"),
        props: {
          handlePaste(view, event) {
            const items = Array.from(event.clipboardData?.items ?? []);
            const imageItem = items.find((item) =>
              item.type.startsWith("image/"),
            );
            if (!imageItem) return false;

            event.preventDefault();
            const file = imageItem.getAsFile();
            if (!file) return false;

            // Insert a blob URL node immediately so the image is visible at once.
            const previewUrl = URL.createObjectURL(file);
            {
              const { state, dispatch } = view;
              const node = state.schema.nodes.forumImage?.create({
                src: previewUrl,
                alt: "pasted-image",
              });
              if (!node) {
                URL.revokeObjectURL(previewUrl);
                return false;
              }
              dispatch(state.tr.replaceSelectionWith(node).scrollIntoView());
            }

            // Find the node that has a given src value and run a callback on it.
            const withNode = (
              src: string,
              cb: (pos: number, nodeSize: number) => void,
            ) => {
              const { state: s } = view;
              s.doc.descendants((n, pos) => {
                if (n.type.name === "forumImage" && n.attrs.src === src) {
                  cb(pos, n.nodeSize);
                  return false;
                }
              });
            };

            // Web-native types that don't need a canvas round-trip before
            // upload (imagekitService will still compress them to WebP).
            const WEB_NATIVE_TYPES = new Set([
              "image/png",
              "image/jpeg",
              "image/gif",
              "image/webp",
              "image/avif",
              "image/svg+xml",
            ]);

            // Convert exotic formats (BMP, TIFF, etc.) to PNG via canvas so
            // ImageKit always receives a format it can process.
            const toPng = (src: File): Promise<File> =>
              new Promise((resolve) => {
                const img = new Image();
                const tempUrl = URL.createObjectURL(src);
                img.onload = () => {
                  const canvas = document.createElement("canvas");
                  // SVGs without explicit dimensions report 0×0 — use a
                  // sensible fallback so the canvas isn't empty.
                  canvas.width = img.naturalWidth || 800;
                  canvas.height = img.naturalHeight || 600;
                  const ctx = canvas.getContext("2d")!;
                  ctx.drawImage(img, 0, 0);
                  URL.revokeObjectURL(tempUrl);
                  canvas.toBlob(
                    (blob) =>
                      resolve(
                        blob
                          ? new File([blob], "pasted-image.png", {
                              type: "image/png",
                            })
                          : src,
                      ),
                    "image/png",
                  );
                };
                img.onerror = () => {
                  // Browser can't render this format (e.g. HEIC, EMF).
                  // Pass the original through; imagekitService will handle it.
                  URL.revokeObjectURL(tempUrl);
                  resolve(src);
                };
                img.src = tempUrl;
              });

            (async () => {
              const uploadFile = WEB_NATIVE_TYPES.has(file.type)
                ? file
                : await toPng(file);
              const realUrl = await ImageKitService.uploadImage(uploadFile);

              // Swap the blob URL for the persisted ImageKit URL.
              withNode(previewUrl, (pos) => {
                const { state: s, dispatch: d } = view;
                const existing = s.doc.nodeAt(pos);
                d(
                  s.tr.setNodeMarkup(pos, undefined, {
                    ...existing?.attrs,
                    src: realUrl,
                  }),
                );
              });
              URL.revokeObjectURL(previewUrl);
            })().catch((err) => {
              // Remove the placeholder node and clean up on failure.
              withNode(previewUrl, (pos, nodeSize) => {
                const { state: s, dispatch: d } = view;
                d(s.tr.delete(pos, pos + nodeSize));
              });
              URL.revokeObjectURL(previewUrl);
              window.alert(
                "Image upload failed. Please try again. Error: " + err,
              );
            });

            return true;
          },
        },
      }),
    ];
  },
});

// ─────────────────────────────────────────────
// YouTube embed helpers
// ─────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
    /\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// React node view that renders the iframe inside the editor
const YoutubeEmbedNodeView = ({
  node,
}: {
  node: { attrs: Record<string, unknown> };
}) => (
  <NodeViewWrapper>
    <div
      className="relative my-2 mx-auto overflow-hidden rounded"
      style={{ maxWidth: 640, aspectRatio: "16/9" }}
      contentEditable={false}
    >
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${node.attrs.videoId as string}`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube embed"
      />
    </div>
  </NodeViewWrapper>
);

const YoutubeEmbedExtension = Node.create({
  name: "youtubeEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      videoId: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-youtube-embed]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-youtube-embed": "" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(YoutubeEmbedNodeView);
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("youtubeEmbedPaste"),
        props: {
          handlePaste(view, event) {
            const text =
              event.clipboardData?.getData("text/plain")?.trim() ?? "";
            if (!/^https?:\/\//i.test(text)) return false;
            const videoId = extractYouTubeId(text);
            if (!videoId) return false;
            const { state, dispatch } = view;
            const node = state.schema.nodes.youtubeEmbed?.create({ videoId });
            if (!node) return false;
            dispatch(state.tr.replaceSelectionWith(node).scrollIntoView());
            return true;
          },
        },
      }),
    ];
  },
});

// ─────────────────────────────────────────────
// ForumEditor – TipTap rich text editor.
// Outputs RichTextDocument (TipTap-compatible JSON).
// ─────────────────────────────────────────────

interface ForumEditorProps {
  initialText?: string;
  initialDoc?: RichTextDocument;
  placeholder?: string;
  onSubmit: (
    doc: RichTextDocument,
    plainText: string,
    mentions: PostMention[],
  ) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  maxLength?: number;
}

export interface ForumEditorHandle {
  focus: () => void;
}

/** Converts a plain string into a minimal RichTextDocument. */
export function plaintextToDoc(text: string): RichTextDocument {
  const paragraphs = text.split("\n").map((line) => ({
    type: "paragraph" as const,
    content: line.length > 0 ? [{ type: "text" as const, text: line }] : [],
  }));
  return { type: "doc", content: paragraphs };
}

/** Extracts plain text from a RichTextDocument. */
export function docToPlaintext(doc: RichTextDocument): string {
  function extractText(node: {
    type: string;
    text?: string;
    content?: unknown[];
  }): string {
    if (node.type === "text") return node.text ?? "";
    if (!node.content) return "";
    return (node.content as (typeof node)[])
      .map(extractText)
      .join(node.type === "paragraph" ? "\n" : "");
  }
  return doc.content.map(extractText).join("\n");
}

/** Extracts unique PostMention objects from a RichTextDocument. */
function extractMentionsFromDoc(doc: RichTextDocument): PostMention[] {
  const mentions: PostMention[] = [];
  const walk = (node: RichTextNode) => {
    if (node.type === "mention" && node.attrs?.uid && node.attrs?.username) {
      mentions.push({
        uid: node.attrs.uid as string,
        username: node.attrs.username as string,
      });
    }
    node.content?.forEach(walk);
  };
  doc.content.forEach(walk);
  return mentions.filter(
    (m, i, arr) => arr.findIndex((x) => x.uid === m.uid) === i,
  );
}

// Mention extension extended with uid/username attrs
const MentionExtension = Mention.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      uid: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-uid"),
        renderHTML: (attrs) => (attrs.uid ? { "data-uid": attrs.uid } : {}),
      },
      username: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-username"),
        renderHTML: (attrs) =>
          attrs.username ? { "data-username": attrs.username } : {},
      },
    };
  },
  renderHTML({ node, HTMLAttributes: baseAttrs }) {
    return [
      "span",
      mergeAttributes(
        { class: "mention-chip", "data-type": "mention" },
        baseAttrs,
      ),
      `@${(node.attrs.username as string) ?? ""}`,
    ];
  },
}).configure({
  suggestion: {
    items: async ({ query }: { query: string }) => {
      if (!query || query.trim().length === 0) return [];
      try {
        return await ForumService.SearchUsersByPrefix(query.trim());
      } catch {
        return [];
      }
    },
    render: () => {
      let renderer: ReactRenderer<MentionListHandle>;
      let wrapper: HTMLDivElement;

      const positionWrapper = (
        clientRect: (() => DOMRect | null) | null | undefined,
      ) => {
        if (!wrapper || !clientRect) return;
        const rect = clientRect();
        if (!rect) return;
        const DROPDOWN_EST_HEIGHT = 300;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const maxLeft = window.innerWidth - 280;
        const left = Math.min(rect.left, maxLeft);
        wrapper.style.left = `${left}px`;
        if (spaceBelow < DROPDOWN_EST_HEIGHT && spaceAbove > spaceBelow) {
          // Flip above the caret when there isn't enough room below
          wrapper.style.top = "auto";
          wrapper.style.bottom = `${window.innerHeight - rect.top + 4}px`;
        } else {
          wrapper.style.top = `${rect.bottom + 4}px`;
          wrapper.style.bottom = "auto";
        }
      };

      return {
        onStart(props) {
          wrapper = document.createElement("div");
          wrapper.style.position = "fixed";
          wrapper.style.zIndex = "9999";
          document.body.appendChild(wrapper);

          renderer = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          });
          wrapper.appendChild(renderer.element);
          positionWrapper(props.clientRect);
        },
        onUpdate(props) {
          renderer.updateProps(props);
          positionWrapper(props.clientRect);
        },
        onKeyDown(props) {
          if (props.event.key === "Escape") {
            wrapper?.remove();
            renderer?.destroy();
            return true;
          }
          return renderer.ref?.onKeyDown(props.event) ?? false;
        },
        onExit() {
          wrapper?.remove();
          renderer?.destroy();
        },
      };
    },
  },
});

const MAX_DEFAULT = 10000;

// ── Toolbar button ────────────────────────────────────────────────────────────
interface TBtnProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}
const TBtn: React.FC<TBtnProps> = ({
  onClick,
  active,
  disabled,
  title,
  children,
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`px-2 py-1 rounded text-sm font-medium transition-colors select-none
      ${
        active
          ? "bg-blue-600 text-white"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }
      disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

const Divider = () => (
  <span className="w-px h-5 bg-gray-600 mx-0.5 self-center shrink-0" />
);

// ── Main component ────────────────────────────────────────────────────────────
export const ForumEditor = forwardRef<ForumEditorHandle, ForumEditorProps>(
  function ForumEditor(
    {
      initialText = "",
      initialDoc,
      placeholder = "Write your post…",
      onSubmit,
      onCancel,
      submitLabel = "Post",
      isSubmitting = false,
      maxLength = MAX_DEFAULT,
    },
    ref,
  ) {
    const initialContent =
      initialDoc ?? (initialText ? plaintextToDoc(initialText) : undefined);

    const [isEmpty, setIsEmpty] = useState(!initialContent);
    const [isInTable, setIsInTable] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({ codeBlock: { HTMLAttributes: { class: "" } } }),
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
          validate: (href) => /^https?:\/\//.test(href),
        }),
        Placeholder.configure({ placeholder }),
        CharacterCount.configure({ limit: maxLength }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Table.configure({ resizable: false }),
        TableRow,
        TableCell,
        TableHeader,
        MentionExtension,
        YoutubeEmbedExtension,
        ForumImageExtension,
      ],
      content: initialContent,
      onCreate: ({ editor }) => {
        setIsEmpty(editor.isEmpty);
        setIsInTable(editor.isActive("table"));
      },
      onUpdate: ({ editor }) => {
        setIsEmpty(editor.isEmpty);
        setIsInTable(editor.isActive("table"));
      },
      onSelectionUpdate: ({ editor }) => {
        setIsInTable(editor.isActive("table"));
      },
      editorProps: {
        handleKeyDown(_view, event) {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            handleSubmit();
            return true;
          }
          return false;
        },
      },
    });

    useImperativeHandle(ref, () => ({
      focus: () => {
        editor?.commands.focus();
      },
    }));

    const handleSubmit = useCallback(() => {
      if (!editor || editor.isEmpty || isSubmitting) return;
      const json = editor.getJSON() as RichTextDocument;
      const text = editor.getText({ blockSeparator: "\n" });
      const mentions = extractMentionsFromDoc(json);
      onSubmit(json, text, mentions);
      editor.commands.clearContent(true);
    }, [editor, isSubmitting, onSubmit]);

    const handleImageFileChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;
        // Reset so the same file can be re-selected later.
        e.target.value = "";
        if (file.size > 5 * 1024 * 1024) {
          window.alert("Image must be under 5 MB.");
          return;
        }
        setIsUploading(true);
        try {
          const url = await ImageKitService.uploadImage(file);
          editor
            .chain()
            .focus()
            .insertContent({
              type: "forumImage",
              attrs: { src: url, alt: file.name.replace(/\.[^.]+$/, "") },
            })
            .run();
        } catch (err) {
          window.alert("Image upload failed. Please try again. Error:" + err);
        } finally {
          setIsUploading(false);
        }
      },
      [editor],
    );

    const insertYouTube = () => {
      const url = window.prompt("Paste a YouTube URL:");
      if (!url) return;
      const videoId = extractYouTubeId(url.trim());
      if (!videoId) {
        window.alert("Could not find a YouTube video ID in that URL.");
        return;
      }
      editor
        ?.chain()
        .focus()
        .insertContent({ type: "youtubeEmbed", attrs: { videoId } })
        .run();
    };

    const setLink = () => {
      const prev = editor?.getAttributes("link").href as string | undefined;
      const url = window.prompt("Enter URL (https://…)", prev ?? "");
      if (url === null) return;
      if (url === "") {
        editor?.chain().focus().unsetLink().run();
        return;
      }
      if (!/^https?:\/\//.test(url)) {
        window.alert("Only https:// links are allowed.");
        return;
      }
      editor?.chain().focus().setLink({ href: url }).run();
    };

    const charCount = editor?.storage.characterCount.characters() ?? 0;
    const remaining = maxLength - charCount;
    const isOverLimit = remaining < 0;

    return (
      <div className="flex flex-col gap-2 w-full">
        {/* Toolbar */}
        <div
          className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 rounded-t-lg border-b"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border-secondary)",
          }}
        >
          <TBtn
            title="Bold (Ctrl+B)"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive("bold")}
          >
            {" "}
            <strong>B</strong>
          </TBtn>
          <TBtn
            title="Italic (Ctrl+I)"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive("italic")}
          >
            {" "}
            <em>I</em>
          </TBtn>
          <TBtn
            title="Underline (Ctrl+U)"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={editor?.isActive("underline")}
          >
            {" "}
            <u>U</u>
          </TBtn>
          <TBtn
            title="Strikethrough"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={editor?.isActive("strike")}
          >
            <s>S</s>
          </TBtn>
          <TBtn
            title="Inline code"
            onClick={() => editor?.chain().focus().toggleCode().run()}
            active={editor?.isActive("code")}
          >
            {" "}
            <code className="text-xs">{"<>"}</code>
          </TBtn>
          <Divider />
          <TBtn
            title="Heading 2"
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor?.isActive("heading", { level: 2 })}
          >
            H2
          </TBtn>
          <TBtn
            title="Heading 3"
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor?.isActive("heading", { level: 3 })}
          >
            H3
          </TBtn>
          <Divider />
          <TBtn
            title="Bullet list"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive("bulletList")}
          >
            {" "}
            ≡
          </TBtn>
          <TBtn
            title="Numbered list"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive("orderedList")}
          >
            {" "}
            1.
          </TBtn>
          <Divider />
          <TBtn
            title="Blockquote"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            active={editor?.isActive("blockquote")}
          >
            {" "}
            ❝
          </TBtn>
          <TBtn
            title="Code block"
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            active={editor?.isActive("codeBlock")}
          >
            {" "}
            {"{ }"}
          </TBtn>
          <Divider />
          <TBtn
            title="Link"
            onClick={setLink}
            active={editor?.isActive("link")}
          >
            {" "}
            🔗
          </TBtn>
          <TBtn
            title="Horizontal rule"
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          >
            {" "}
            —
          </TBtn>
          <Divider />
          <TBtn
            title="Align left"
            onClick={() => editor?.chain().focus().setTextAlign("left").run()}
            active={editor?.isActive({ textAlign: "left" })}
          >
            &#8676;
          </TBtn>
          <TBtn
            title="Align center"
            onClick={() => editor?.chain().focus().setTextAlign("center").run()}
            active={editor?.isActive({ textAlign: "center" })}
          >
            &#9636;
          </TBtn>
          <TBtn
            title="Align right"
            onClick={() => editor?.chain().focus().setTextAlign("right").run()}
            active={editor?.isActive({ textAlign: "right" })}
          >
            &#8677;
          </TBtn>
          <Divider />
          <TBtn
            title="Undo (Ctrl+Z)"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
          >
            {" "}
            ↩
          </TBtn>
          <TBtn
            title="Redo (Ctrl+Y)"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
          >
            {" "}
            ↪
          </TBtn>
          <Divider />
          <TBtn title="Embed YouTube video" onClick={insertYouTube}>
            ▶
          </TBtn>
          <TBtn
            title="Upload image (max 5 MB)"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? "⏳" : "🖼"}
          </TBtn>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleImageFileChange}
          />
          <Divider />
          <TBtn
            title="Insert table (3×3)"
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            ⊞
          </TBtn>
          {isInTable && (
            <>
              <TBtn
                title="Add column before"
                onClick={() => editor?.chain().focus().addColumnBefore().run()}
              >
                ◁+
              </TBtn>
              <TBtn
                title="Add column after"
                onClick={() => editor?.chain().focus().addColumnAfter().run()}
              >
                +▷
              </TBtn>
              <TBtn
                title="Delete column"
                onClick={() => editor?.chain().focus().deleteColumn().run()}
              >
                ✕col
              </TBtn>
              <TBtn
                title="Add row before"
                onClick={() => editor?.chain().focus().addRowBefore().run()}
              >
                △+
              </TBtn>
              <TBtn
                title="Add row after"
                onClick={() => editor?.chain().focus().addRowAfter().run()}
              >
                +▽
              </TBtn>
              <TBtn
                title="Delete row"
                onClick={() => editor?.chain().focus().deleteRow().run()}
              >
                ✕row
              </TBtn>
              <TBtn
                title="Delete table"
                onClick={() => editor?.chain().focus().deleteTable().run()}
              >
                ✕tbl
              </TBtn>
            </>
          )}
        </div>

        {/* Editor area — also handles image file drops */}
        <div
          className="rounded-b-lg border focus-within:ring-1 focus-within:ring-blue-500 transition-colors"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-secondary)",
          }}
          onDragOver={(e) => {
            if (
              Array.from(e.dataTransfer.items).some(
                (i) => i.kind === "file" && i.type.startsWith("image/"),
              )
            ) {
              e.preventDefault();
            }
          }}
          onDrop={(e) => {
            const files = Array.from(e.dataTransfer.files).filter((f) =>
              f.type.startsWith("image/"),
            );
            if (files.length === 0 || !editor) return;
            e.preventDefault();
            e.stopPropagation();
            files.forEach((file) => {
              if (file.size > 5 * 1024 * 1024) {
                window.alert(
                  `"${file.name}" exceeds the 5 MB limit and was skipped.`,
                );
                return;
              }
              setIsUploading(true);
              ImageKitService.uploadImage(file)
                .then((url) => {
                  setIsUploading(false);
                  editor
                    .chain()
                    .focus()
                    .insertContent({
                      type: "forumImage",
                      attrs: {
                        src: url,
                        alt: file.name.replace(/\.[^.]+$/, ""),
                      },
                    })
                    .run();
                })
                .catch(() => {
                  setIsUploading(false);
                  window.alert(
                    `Failed to upload "${file.name}". Please try again.`,
                  );
                });
            });
          }}
        >
          <EditorContent editor={editor} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <Text
            variant="xs"
            classes={isOverLimit ? "text-red-400" : "text-gray-500"}
          >
            {isOverLimit
              ? `${Math.abs(remaining)} characters over limit`
              : `${remaining.toLocaleString()} characters remaining`}
          </Text>
          <div className="flex gap-2">
            {onCancel && (
              <Button
                variant="secondaryOutline"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || isEmpty || isOverLimit}
            >
              {isSubmitting ? "Posting…" : submitLabel}
            </Button>
          </div>
        </div>
        <Text variant="xs" classes="text-gray-600">
          Tip: Ctrl+Enter to submit
        </Text>
      </div>
    );
  },
);
