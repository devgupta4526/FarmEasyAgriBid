import { useToastStore } from '@/store/toast.store';

export function useToast() {
  const { toasts, toast, dismiss } = useToastStore();
  return { toasts, toast, dismiss };
}
