import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth-service';

export function useCurrentUser() {
    return useQuery({
        queryKey: ['me'],
        queryFn: authService.getCurrentUser,
    });
}
