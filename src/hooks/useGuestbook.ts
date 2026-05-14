import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface Entry {
  id: number;
  github_id: string;
  username: string;
  name: string;
  avatar_url: string;
  message: string;
  signature_data: string | null;
  provider: "github" | "google";
  created_at: string;
  updated_at: string | null;
}

export function useGuestbookEntries(initialData?: Entry[]) {
  return useQuery<Entry[]>({
    queryKey: ["guestbook-entries"],
    queryFn: async () => {
      const { data } = await axios.get<Entry[]>("/api/guestbook");
      return data;
    },
    initialData,
  });
}

export function useSignGuestbook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { message: string; signatureData: string | null; name: string }) => {
      try {
        const { data } = await axios.post<Entry>("/api/guestbook", payload);
        return data;
      } catch (error: any) {
        throw new Error(error.response?.data?.error || "Failed to sign guestbook");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guestbook-entries"] });
    },
  });
}
