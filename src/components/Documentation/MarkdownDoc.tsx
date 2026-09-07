import React from "react";
import Markdown from "markdown-to-jsx";

interface MarkdownDocProps {
  content: string;
}

// Maps rendered markdown elements onto the app's dark theme + adds scroll-mt so
// anchor jumps don't tuck headings behind any sticky page chrome.
const overrides = {
  h1: {
    props: {
      className: "text-3xl font-bold text-white mt-8 mb-3 scroll-mt-24",
    },
  },
  h2: {
    props: {
      className: "text-2xl font-semibold text-white mt-6 mb-2 scroll-mt-24",
    },
  },
  h3: {
    props: {
      className: "text-xl font-semibold text-white mt-4 mb-2 scroll-mt-24",
    },
  },
  h4: {
    props: {
      className: "text-lg font-semibold text-gray-200 mt-3 mb-1 scroll-mt-24",
    },
  },
  p: { props: { className: "text-gray-300 mb-3 leading-relaxed" } },
  a: { props: { className: "text-blue-400 hover:underline" } },
  ul: {
    props: { className: "list-disc list-inside text-gray-300 mb-3 space-y-1" },
  },
  ol: {
    props: {
      className: "list-decimal list-inside text-gray-300 mb-3 space-y-1",
    },
  },
  li: { props: { className: "ml-2" } },
  strong: { props: { className: "text-white font-semibold" } },
  table: {
    props: { className: "table-auto border-collapse mb-4 text-gray-300" },
  },
  th: {
    props: {
      className: "border border-gray-600 px-2 py-1 text-left text-white",
    },
  },
  td: { props: { className: "border border-gray-600 px-2 py-1" } },
  hr: { props: { className: "border-gray-700 my-6" } },
  blockquote: {
    props: {
      className: "border-l-4 border-gray-600 pl-4 italic text-gray-400 mb-3",
    },
  },
};

export const MarkdownDoc: React.FC<MarkdownDocProps> = ({ content }) => {
  return <Markdown options={{ overrides, wrapper: "div" }}>{content}</Markdown>;
};
