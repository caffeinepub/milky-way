import { usePasswordSession } from './auth/usePasswordSession';
import LoginScreen from './pages/LoginScreen';
import RoomChatScreen from './pages/RoomChatScreen';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

export default function App() {
  const { isAuthenticated } = usePasswordSession();

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-background">
        {isAuthenticated ? <RoomChatScreen /> : <LoginScreen />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
