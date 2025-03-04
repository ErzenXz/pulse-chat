type StaticParams = {
  id: string;
}

export function generateStaticParams(): StaticParams[] {
  return [
    { id: 'default' }
  ];
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
