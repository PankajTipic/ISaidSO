import { TopNav } from '@/app/components/TopNav';
import { Footer } from '@/app/components/Footer';
import { MobileNav } from '@/app/components/MobileNav';
import { motion } from 'motion/react';
import { Target, TrendingUp, Shield, Users, Award, Zap, Heart, Globe } from 'lucide-react';

export function AboutScreen() {
  const features = [
    {
      icon: Target,
      title: 'Skill-Based Ranking',
      description: 'Your rank is determined purely by prediction accuracy, not voting volume. Quality over quantity.',
      gradient: 'from-[#a855f7] to-[#ec4899]',
    },
    {
      icon: TrendingUp,
      title: '6-Tier Level System',
      description: 'Progress from New to Elite based on resolved predictions and sustained accuracy.',
      gradient: 'from-[#ec4899] to-[#f97316]',
    },
    {
      icon: Shield,
      title: 'Transparency First',
      description: 'All predictions are time-stamped and immutable. No editing after voting starts.',
      gradient: 'from-[#06b6d4] to-[#8b5cf6]',
    },
    {
      icon: Users,
      title: 'Community Groups',
      description: 'Create private groups with friends, colleagues, or communities and compete together.',
      gradient: 'from-[#10b981] to-[#06b6d4]',
    },
    {
      icon: Award,
      title: 'Fair Rewards',
      description: 'Higher risk predictions earn more XP. Consistency builds your reputation over time.',
      gradient: 'from-[#fbbf24] to-[#f59e0b]',
    },
    {
      icon: Zap,
      title: 'Real-Time Updates',
      description: 'Live leaderboards, instant result notifications, and dynamic accuracy tracking.',
      gradient: 'from-[#f97316] to-[#ef4444]',
    },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Fairness',
      description: 'No spam voting. No popularity contests. Just pure predictive skill.',
    },
    {
      icon: Shield,
      title: 'Trust',
      description: 'Transparent algorithms, public leaderboards, and immutable prediction history.',
    },
    {
      icon: Globe,
      title: 'Inclusivity',
      description: 'Anyone can compete. Your location, followers, or background don\'t matter.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#06b6d4] bg-clip-text text-transparent">
              Skill, Not Spam
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            I Said So is the world's first prediction platform that ranks users purely on accuracy, not activity.
          </p>
        </motion.div>

        {/* Vision Section */}
        <motion.div
          className="mb-20 glass-card rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            In a world full of bold claims and empty predictions, we believe in creating a space where foresight is 
            measured, not shouted. Where reputation is earned through consistent accuracy, not viral posts.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            I Said So transforms prediction-making into a competitive skill sport. No likes. No followers. 
            Just you, your judgment, and the truth.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-20" id="how-it-works">
          <motion.h2
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            How It Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="glass-card rounded-xl p-6 hover:scale-105 transition-transform duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Values Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] flex items-center justify-center mx-auto mb-4">
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="glass-card rounded-2xl p-8 md:p-12 text-center bg-gradient-to-r from-[#a855f7]/10 via-[#ec4899]/10 to-[#06b6d4]/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to prove yourself?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of predictors competing on skill, not spam.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth"
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </a>
            <a
              href="/leaderboard"
              className="px-8 py-3 rounded-lg glass-card font-medium hover:bg-accent/50 transition-colors"
            >
              View Leaderboard
            </a>
          </div>
        </motion.div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
