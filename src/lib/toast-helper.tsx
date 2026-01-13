import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function showError(message: string, error?: any) {
    const errorDetails = error ? (error.response?.data?.detail || error.message || String(error)) : null;
    const fullMessage = errorDetails ? `${message}\n\n${JSON.stringify(errorDetails, null, 2)}` : message;

    toast.error(message, {
        action: {
            label: 'Copy',
            onClick: () => {
                navigator.clipboard.writeText(fullMessage);
                toast.success('Error copied to clipboard');
            }
        },
        description: errorDetails ? (typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)) : undefined,
        duration: 10000, // Longer duration for errors to allow reading/copying
    });
}
