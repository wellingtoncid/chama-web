import Swal from 'sweetalert2';

type ToastIcon = 'success' | 'error' | 'warning' | 'info' | 'question';

interface ToastOptions {
  title: string;
  icon?: ToastIcon;
  duration?: number;
}

export function toast({ title, icon = 'info', duration = 2000 }: ToastOptions) {
  return Swal.fire({
    title,
    icon,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: duration,
    timerProgressBar: true,
  });
}

export function toastSuccess(title: string) {
  return toast({ title, icon: 'success' });
}

export function toastError(title: string) {
  return toast({ title, icon: 'error', duration: 4000 });
}

export function toastWarning(title: string) {
  return toast({ title, icon: 'warning', duration: 3000 });
}
