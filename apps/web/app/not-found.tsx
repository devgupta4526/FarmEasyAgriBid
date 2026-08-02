import { createElement as h } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tractor } from 'lucide-react';

export default function NotFound() {
    return h(
          'div',
      { className: 'flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center' },
          h(
                  'div',
            { className: 'flex h-16 w-16 items-center justify-center rounded-lg bg-agri-600' },
                  h(Tractor, { className: 'h-8 w-8 text-white' })
                ),
          h('h1', { className: 'text-4xl font-bold' }, '404'),
          h(
                  'p',
            { className: 'max-w-md text-muted-foreground' },
                  "Sorry, we couldn't find the page you're looking for. It may have been moved or no longer exists."
                ),
          h(
                  Button,
            { asChild: true },
                  h(Link, { href: '/' }, 'Back to home')
                )
        );
}
