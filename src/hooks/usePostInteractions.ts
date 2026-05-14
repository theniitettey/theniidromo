import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface Reply {
  id: number;
  github_id: string;
  username: string;
  name: string;
  avatar_url: string;
  body: string;
  provider: "github" | "google";
  created_at: string;
  reactions_map: Record<string, number>;
  user_reaction: string | null;
}

export interface Comment {
  id: number;
  github_id: string;
  username: string;
  name: string;
  avatar_url: string;
  body: string;
  provider: "github" | "google";
  created_at: string;
  replies: Reply[];
  reactions_map: Record<string, number>;
  user_reaction: string | null;
}

export interface ReactionData {
  totalCount: number;
  userCount: number;
  maxLikes: number;
}

// ── Reactions ────────────────────────────────────────────────

export function useReactions(slug: string) {
  return useQuery<ReactionData>({
    queryKey: ["reactions", slug],
    queryFn: async () => {
      const { data } = await axios.get<ReactionData>(`/api/posts/${slug}/reactions`);
      return data;
    },
  });
}

export function useIncrementReaction(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ delta }: { delta: number }) => {
      const { data } = await axios.post<ReactionData>(`/api/posts/${slug}/reactions`, { delta });
      return data;
    },
    onMutate: async ({ delta }) => {
      await queryClient.cancelQueries({ queryKey: ["reactions", slug] });
      const prev = queryClient.getQueryData<ReactionData>(["reactions", slug]);
      if (prev) {
        queryClient.setQueryData<ReactionData>(["reactions", slug], {
          totalCount: prev.totalCount + delta,
          userCount: Math.min(prev.userCount + delta, prev.maxLikes),
          maxLikes: prev.maxLikes,
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["reactions", slug], ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reactions", slug] });
    },
  });
}

// ── Comments ─────────────────────────────────────────────────

export function useComments(slug: string) {
  return useQuery<Comment[]>({
    queryKey: ["comments", slug],
    queryFn: async () => {
      const { data } = await axios.get<Comment[]>(`/api/posts/${slug}/comments`);
      return data;
    },
  });
}

export function useAddComment(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      const { data } = await axios.post<Comment>(`/api/posts/${slug}/comments`, { body });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", slug] });
    },
  });
}

export function useDeleteComment(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: number) => {
      await axios.delete(`/api/posts/${slug}/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", slug] });
    },
  });
}

export function useAddReply(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, body }: { commentId: number; body: string }) => {
      const { data } = await axios.post<Reply>(
        `/api/posts/${slug}/comments/${commentId}/replies`,
        { body }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", slug] });
    },
  });
}

export function useToggleCommentReaction(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, reaction }: { commentId: number; reaction: string }) => {
      const { data } = await axios.post<{ reactionsMap: Record<string, number> }>(
        `/api/posts/${slug}/comments/${commentId}/reactions`,
        { reaction }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", slug] });
    },
  });
}

export function useToggleReplyReaction(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, replyId, reaction }: { commentId: number; replyId: number; reaction: string }) => {
      const { data } = await axios.post<{ reactionsMap: Record<string, number> }>(
        `/api/posts/${slug}/comments/${commentId}/replies/${replyId}/reactions`,
        { reaction }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", slug] });
    },
  });
}
