import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-6">Семейное Древо</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Сохраняйте истории, фото и связи поколений в одном месте
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/register">Начать</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/login">Войти</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}