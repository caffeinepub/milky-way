import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '../hooks/useQueries';
import { usePasswordSession } from '../auth/usePasswordSession';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();
  const { setSession } = usePasswordSession();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await loginMutation.mutateAsync({ username, password });
      // Set session with username and password (principal not returned by backend)
      setSession(result.username, password);
      toast.success('Welcome to Milky Way!');
    } catch (error: any) {
      // Display user-friendly error message, never show raw backend errors
      const errorMessage = error instanceof Error && error.message 
        ? error.message 
        : 'Login failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-space-dark via-space-purple to-space-dark">
      <div className="w-full max-w-md space-y-8">
        {/* Branding */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-starlight animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-starlight via-cosmic-blue to-nebula-pink bg-clip-text text-transparent">
              Milky Way
            </h1>
            <Sparkles className="w-10 h-10 text-starlight animate-pulse" />
          </div>
          <p className="text-xl text-cosmic-blue font-medium tracking-wide">
            To Infinity and Beyond
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card/80 backdrop-blur-lg border border-cosmic-blue/30 rounded-2xl p-8 shadow-2xl shadow-cosmic-blue/20">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="bg-background/50 border-cosmic-blue/30 focus:border-cosmic-blue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="bg-background/50 border-cosmic-blue/30 focus:border-cosmic-blue"
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-gradient-to-r from-cosmic-blue to-nebula-pink hover:from-cosmic-blue/90 hover:to-nebula-pink/90 text-white font-semibold py-6 rounded-xl shadow-lg shadow-cosmic-blue/30 transition-all"
            >
              {loginMutation.isPending ? 'Logging in...' : 'Launch into Space'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          © 2026. Built with ❤️ using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cosmic-blue hover:text-starlight transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
