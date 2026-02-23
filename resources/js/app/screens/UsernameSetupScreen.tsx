import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { RefreshCw } from 'lucide-react';

const avatarOptions = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
];

export function UsernameSetupScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);

  const handleRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * avatarOptions.length);
    setSelectedAvatar(avatarOptions[randomIndex]);
  };

  const handleContinue = () => {
    if (username.length >= 3) {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#16161d] to-[#0a0a0f] p-4">
      <motion.div
        className="glass-card rounded-3xl p-8 w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Identity</h1>
          <p className="text-muted-foreground">Choose your avatar and username</p>
        </div>

        {/* Avatar Selection */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <Avatar className="w-32 h-32 ring-4 ring-[#a855f7]/50">
              <AvatarImage src={selectedAvatar} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <button
              onClick={handleRandomAvatar}
              className="absolute bottom-0 right-0 p-2 rounded-full glass-card hover:bg-secondary/80 transition-colors"
              style={{ borderColor: '#a855f7' }}
            >
              <RefreshCw size={18} className="text-[#a855f7]" />
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {avatarOptions.map((avatar, index) => (
              <button
                key={index}
                onClick={() => setSelectedAvatar(avatar)}
                className={`rounded-full overflow-hidden transition-all ${
                  selectedAvatar === avatar
                    ? 'ring-2 ring-[#a855f7] scale-110'
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                <img src={avatar} alt={`Avatar ${index + 1}`} className="w-10 h-10 object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Username Input */}
        <div className="space-y-4 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 glass-card"
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              {username.length}/20 characters
            </p>
          </div>
        </div>

        <Button
          className="w-full h-12"
          onClick={handleContinue}
          disabled={username.length < 3}
          style={{
            background: username.length >= 3
              ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
              : undefined,
          }}
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
}