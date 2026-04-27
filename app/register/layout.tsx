import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new Blur account and start creating anonymous chat rooms in seconds.',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
