import type { ReactNode } from "react";

const TOKEN_PATTERN =
  /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|@[A-Za-z0-9_.@+-]+)/gi;

const trimUrlPunctuation = (value: string) => {
  let url = value.replace(/[.,!?;:]+$/, "");

  for (const [opening, closing] of [
    ["(", ")"],
    ["[", "]"],
    ["{", "}"],
  ]) {
    while (
      url.endsWith(closing) &&
      url.split(closing).length > url.split(opening).length
    ) {
      url = url.slice(0, -1);
    }
  }

  return { url, trailing: value.slice(url.length) };
};

const toSafeUrl = (value: string) => {
  const href = /^www\./i.test(value) ? `https://${value}` : value;

  try {
    const parsed = new URL(href);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.href
      : null;
  } catch {
    return null;
  }
};

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
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of body.matchAll(TOKEN_PATTERN)) {
    const token = match[0];
    const start = match.index ?? 0;
    const isUrl = /^https?:\/\//i.test(token) || /^www\./i.test(token);
    if (!isUrl && !hasMentions) continue;

    if (start > lastIndex) nodes.push(body.slice(lastIndex, start));

    if (isUrl) {
      const { url, trailing } = trimUrlPunctuation(token);
      const href = toSafeUrl(url);
      if (href) {
        nodes.push(
          <a
            key={start}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-sky-400 underline bg-blue-700/20 rounded-full py-0.5 decoration-sky-400/50 underline-offset-2 hover:text-sky-300"
          >
            {url}
          </a>,
        );
        if (trailing) nodes.push(trailing);
      } else {
        nodes.push(token);
      }
    } else {
      const trailing = token.match(/[.-]+$/)?.[0] ?? "";
      const usernameToken = trailing ? token.slice(0, -trailing.length) : token;
      const isSelf =
        !!currentUsername &&
        usernameToken.slice(1).toLowerCase() === currentUsername.toLowerCase();
      nodes.push(
        <span
          key={start}
          className={`inline-flex items-center rounded-full border px-2 py-0 text-[0.85em] font-semibold ${
            isSelf
              ? "border-yellow-400 bg-yellow-500/30 text-yellow-300"
              : "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
          }`}
        >
          {usernameToken}
        </span>,
      );
      if (trailing) nodes.push(trailing);
    }
    lastIndex = start + token.length;
  }

  if (lastIndex < body.length) nodes.push(body.slice(lastIndex));
  return <>{nodes}</>;
};
