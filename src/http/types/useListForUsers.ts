import { useQuery } from '@tanstack/react-query';

type Presence = {
  id: number;
  createdAt: string;
  period?: string;
};

type User = {
  id: number;
  username: string;
  avatarURL: string;
  presence: Presence[];
  havePresence: boolean;
};

type SingleUserResponse = User & {
  havePresence: boolean;
};

type ListUsersResponse = {
  data: User[];
  currentPage: number;
  totalPages: number;
  totalUsers: number;
};

type QueryParams = {
  userId?: number;
  date?: string;
  searchName?: string;
  searchPosition?: string;
  page?: number;
  limit?: number;
};

export function useListUsersForPresence(params?: QueryParams) {
  return useQuery<ListUsersResponse | SingleUserResponse>({
    queryKey: ['listUsersForPresence', params],
    queryFn: async () => {
      const query = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query.append(key, String(value));
          }
        });
      }

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/listUsersForPresence?${query.toString()}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar lista de usuários');
      }

      const result: ListUsersResponse = await response.json();
      return result;
    },
    enabled: !!params,
  });
}
