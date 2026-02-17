import { useContext } from 'react';
import { ToastContext } from '../components/common/ToastProvider';

/**
 * Hook to show toast notifications.
 *
 * @example
 * const { toast } = useToast();
 * toast('Design saved!', 'success');
 */
export function useToast() {
    return useContext(ToastContext);
}
