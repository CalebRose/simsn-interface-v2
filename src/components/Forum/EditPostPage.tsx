import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageContainer } from "../../_design/Container";
import { Text } from "../../_design/Typography";
import { ForumBreadcrumbs } from "./components/ForumBreadcrumbs";
import { ForumEditor, docToPlaintext } from "./components/ForumEditor";
import { useForumStore } from "../../context/ForumContext";
import { useAuthStore } from "../../context/AuthContext";
import { ForumService } from "../../_services/forumService";
import { Post, RichTextDocument, PostMention } from "../../models/forumModels";
import routes from "../../_constants/routes";

interface Params {
  postId: string;
}

export const EditPostPage: React.FC = () => {
  const { postId } = useParams<keyof Params>() as Params;
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { updatePost, permissions } = useForumStore();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    ForumService.GetPostById(postId)
      .then(setPost)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [postId]);

  if (!loading && !post) {
    return (
      <PageContainer title="Edit Post">
        <Text variant="secondary">Post not found.</Text>
      </PageContainer>
    );
  }

  const isOwn = post?.author.uid === currentUser?.id;
  const canEdit =
    permissions.canEditAnyPost || (isOwn && permissions.canEditOwnPost);

  if (!loading && !canEdit) {
    return (
      <PageContainer title="Edit Post">
        <Text variant="secondary">
          You do not have permission to edit this post.
        </Text>
      </PageContainer>
    );
  }

  const initialText = post ? docToPlaintext(post.body as RichTextDocument) : "";

  const handleSubmit = async (
    doc: RichTextDocument,
    plainText: string,
    mentions: PostMention[],
  ) => {
    if (!post) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await updatePost(post.id, { body: doc, bodyText: plainText, mentions });
      navigate(`${routes.FORUM_THREAD}/${post.threadId}#post-${post.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save edits.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const crumbs = [
    { label: "Forums", href: routes.FORUMS },
    ...(post
      ? [
          {
            label: "Thread",
            href: `${routes.FORUM_THREAD}/${post.threadId}`,
          },
        ]
      : []),
    { label: "Edit Post" },
  ];

  return (
    <PageContainer isLoading={loading} title="">
      <div className="flex flex-col px-4 lg:w-[80vw]">
        <ForumBreadcrumbs crumbs={crumbs} />
        <Text variant="h4" classes="mb-4">
          Edit Post
        </Text>

        {error && (
          <Text variant="danger" classes="text-sm mb-3">
            {error}
          </Text>
        )}

        {post && (
          <ForumEditor
            initialText={initialText}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`${routes.FORUM_THREAD}/${post.threadId}`)}
            submitLabel="Save Changes"
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </PageContainer>
  );
};
