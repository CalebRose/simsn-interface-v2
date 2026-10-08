import type { ReactNode } from "react";

const MENTION_PATTERN = /(@[A-Za-z0-9_.-]+)/g;

interface ChatMessageBodyProps {
  body: string;
  hasMentions: boolean;
  currentUsername?: string;
}

export const ChatMessageBody = ({
  body,
  hasMentions,
  currentUsername,
}: ChatMessageBodyProps) => {
  if (!hasMentions) return <>{body}</>;

  const nodes: ReactNode[] = [];
  body.split(MENTION_PATTERN).forEach((part, index) => {
    if (index % 2 === 0) {
      if (part) nodes.push(part);
      return;
    }
    // Trailing punctuation belongs to the sentence, not the username.
    const trailing = part.match(/[.-]+$/)?.[0] ?? "";
    const token = trailing ? part.slice(0, -trailing.length) : part;
    const isSelf =
      !!currentUsername &&
      token.slice(1).toLowerCase() === currentUsername.toLowerCase();
    nodes.push(
      <span
        key={index}
        className={`inline-flex items-center rounded-full border px-2 py-0 text-[0.85em] font-semibold ${
          isSelf
            ? "border-yellow-400 bg-yellow-500/30 text-yellow-300"
            : "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
        }`}
      >
        {token}
      </span>,
    );
    if (trailing) nodes.push(trailing);
  });
  return <>{nodes}</>;
};
