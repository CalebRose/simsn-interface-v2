import React from "react";
import {
  RichTextDocument,
  RichTextNode,
  RichTextMark,
} from "../../../models/forumModels";
import { Text } from "../../../_design/Typography";
import { removeForumFeatureImage } from "../forumUtils";

// ─────────────────────────────────────────────
// Safe JSON-to-component renderer.
// Does NOT use dangerouslySetInnerHTML.
// ─────────────────────────────────────────────

interface RichTextRendererProps {
  document: RichTextDocument | null | undefined;
  /** Plain-text fallback when document is null/undefined */
  fallback?: string;
  hideLeadingFeatureImage?: boolean;
}

function applyMarks(
  text: string,
  marks: RichTextMark[] | undefined,
  key: React.Key,
): React.ReactNode {
  if (!marks || marks.length === 0)
    return <React.Fragment key={key}>{text}</React.Fragment>;

  let node: React.ReactNode = text;
  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        node = <strong key={key}>{node}</strong>;
        break;
      case "italic":
        node = <em key={key}>{node}</em>;
        break;
      case "underline":
        node = <u key={key}>{node}</u>;
        break;
      case "code":
        node = (
          <code
            key={key}
            className="bg-gray-800 text-green-400 px-1 rounded text-sm"
          >
            {node}
          </code>
        );
        break;
      case "link": {
        const href = String(mark.attrs?.href ?? "");
        if (!/^https?:\/\//.test(href)) break;
        if (/\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(href)) {
          node = (
            <img
              key={key}
              src={href}
              alt=""
              className="max-w-full max-h-[480px] object-contain rounded my-2 block"
              loading="lazy"
            />
          );
        } else {
          node = (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline hover:text-blue-300"
            >
              {node}
            </a>
          );
        }
        break;
      }
    }
  }
  return node;
}

function renderNode(node: RichTextNode, key: React.Key): React.ReactNode {
  const children = node.content?.map((child, i) => renderNode(child, i)) ?? [];

  switch (node.type) {
    case "doc":
      return <React.Fragment key={key}>{children}</React.Fragment>;

    case "paragraph":
      return children.length === 0 ? (
        <br key={key} />
      ) : (
        <p
          key={key}
          className="mb-2 leading-relaxed"
          style={{
            textAlign: ((node.attrs?.textAlign as string) ||
              "left") as React.CSSProperties["textAlign"],
          }}
        >
          {children}
        </p>
      );

    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const hClasses = [
        "",
        "text-2xl font-bold mt-4 mb-2",
        "text-xl font-bold mt-3 mb-2",
        "text-lg font-semibold mt-3 mb-1",
        "text-base font-semibold mt-2 mb-1",
        "text-sm font-semibold mt-2 mb-1",
        "text-xs font-semibold mt-2 mb-1",
      ];
      return (
        <div
          key={key}
          className={hClasses[level] ?? hClasses[2]}
          style={{
            textAlign: ((node.attrs?.textAlign as string) ||
              "left") as React.CSSProperties["textAlign"],
          }}
        >
          {children}
        </div>
      );
    }

    case "bulletList":
      return (
        <ul key={key} className="list-disc list-inside mb-2 space-y-1">
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="list-decimal list-inside mb-2 space-y-1">
          {children}
        </ol>
      );

    case "listItem": {
      // Unwrap paragraph nodes so text sits inline with the bullet marker
      const listChildren =
        node.content?.map((child, i) => {
          if (child.type === "paragraph") {
            return (
              <React.Fragment key={i}>
                {child.content?.map((gc, j) => renderNode(gc, `${i}-${j}`))}
              </React.Fragment>
            );
          }
          return renderNode(child, i);
        }) ?? [];
      return <li key={key}>{listChildren}</li>;
    }

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-blue-500 pl-3 my-2 text-gray-300 italic"
        >
          {children}
        </blockquote>
      );

    case "codeBlock":
      return (
        <pre
          key={key}
          className="bg-gray-900 text-green-400 p-3 rounded overflow-x-auto text-sm my-2"
        >
          <code>{children}</code>
        </pre>
      );

    case "hardBreak":
      return <br key={key} />;

    case "horizontalRule":
      return <hr key={key} className="border-gray-600 my-3" />;

    case "text": {
      const txt = node.text ?? "";
      if (
        !node.marks?.length &&
        /^https?:\/\/\S+\.(jpe?g|png|gif|webp|svg)(\?[^\s]*)?$/i.test(txt)
      ) {
        return (
          <img
            key={key}
            src={txt}
            alt=""
            className="max-w-full max-h-[480px] object-contain rounded my-2 block"
            loading="lazy"
          />
        );
      }
      return applyMarks(txt, node.marks, key);
    }

    case "mention":
      return (
        <span
          key={key}
          className="inline-flex items-center rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2 py-0 text-[0.85em] font-semibold text-yellow-400"
          data-uid={(node.attrs?.uid ?? node.attrs?.id) as string}
        >
          @{(node.attrs?.username ?? node.attrs?.label) as string}
        </span>
      );

    case "quoteReference":
      return (
        <div
          key={key}
          className="border-l-4 border-gray-500 pl-3 my-2 bg-white/5 rounded text-sm"
        >
          <span className="text-gray-400 text-xs font-medium block mb-1">
            Quote — {node.attrs?.authorUsername as string}
          </span>
          {children}
        </div>
      );

    case "youtubeEmbed": {
      const videoId = node.attrs?.videoId as string | undefined;
      if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return null;
      return (
        <div key={key} className="relative aspect-video my-3 max-w-xl">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        </div>
      );
    }

    case "table":
      return (
        <div key={key} className="overflow-x-auto my-2">
          <table className="min-w-full text-sm border-collapse">
            {children}
          </table>
        </div>
      );

    case "tableRow":
      return <tr key={key}>{children}</tr>;

    case "tableHeader":
      return (
        <th
          key={key}
          className="border border-gray-600 px-2 py-1 bg-gray-800 font-semibold text-left"
        >
          {children}
        </th>
      );

    case "tableCell":
      return (
        <td key={key} className="border border-gray-600 px-2 py-1">
          {children}
        </td>
      );

    default:
      return <React.Fragment key={key}>{children}</React.Fragment>;
  }
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  document,
  fallback,
  hideLeadingFeatureImage = false,
}) => {
  const renderedDocument = hideLeadingFeatureImage
    ? removeForumFeatureImage(document)
    : document;

  if (!renderedDocument) {
    if (fallback) {
      return (
        <p className="leading-relaxed whitespace-pre-wrap break-words">
          {fallback}
        </p>
      );
    }
    return null;
  }

  return (
    <div className="rich-text-content prose prose-invert max-w-none break-words text-left">
      {renderNode(renderedDocument, "root")}
    </div>
  );
};
