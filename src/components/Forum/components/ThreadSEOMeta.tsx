import React from "react";
import { Helmet } from "react-helmet-async";
import { Thread } from "../../../models/forumModels";

interface Props {
  thread: Thread;
  threadId: string;
}

const SITE_NAME = "Sim Sports Network";
const BASE_URL = "https://calebrose.io/simsn-interface-v2";
const DEFAULT_IMAGE = `${BASE_URL}/og-default.png`;
const MAX_DESCRIPTION = 200;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export const ThreadSEOMeta: React.FC<Props> = ({ thread, threadId }) => {
  const title = `${thread.title} — ${SITE_NAME}`;
  const description = truncate(thread.contentPreview ?? "", MAX_DESCRIPTION);
  const canonical = `${BASE_URL}/forums/thread/${threadId}`;
  const image = thread.featureImageUrl ?? DEFAULT_IMAGE;

  return (
    <Helmet>
      {/* Page title */}
      <title>{title}</title>

      {/* Canonical */}
      <link rel="canonical" href={canonical} />

      {/* Primary */}
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={thread.title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {thread.author?.username && (
        <meta property="article:author" content={thread.author.username} />
      )}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={thread.title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};
