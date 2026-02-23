import { useNavigate } from 'react-router';
import { Twitter, Instagram, Facebook, Linkedin, Github, Mail } from 'lucide-react';

export function Footer() {
  const navigate = useNavigate();

  const footerLinks = {
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'How It Works', path: '/about#how-it-works' },
      { label: 'Blog', path: '/blog' },
      { label: 'Careers', path: '/careers' },
    ],
    legal: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Cookie Policy', path: '/cookies' },
      { label: 'Guidelines', path: '/guidelines' },
    ],
    support: [
      { label: 'Help Center', path: '/help' },
      { label: 'Contact Us', path: '/contact' },
      { label: 'FAQ', path: '/faq' },
      { label: 'Report a Problem', path: '/report' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, url: 'https://twitter.com/isaidso', label: 'Twitter' },
    { icon: Instagram, url: 'https://instagram.com/isaidso', label: 'Instagram' },
    { icon: Facebook, url: 'https://facebook.com/isaidso', label: 'Facebook' },
    { icon: Linkedin, url: 'https://linkedin.com/company/isaidso', label: 'LinkedIn' },
    { icon: Github, url: 'https://github.com/isaidso', label: 'GitHub' },
  ];

  return (
    <footer className="glass-card border-t border-border/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#06b6d4] bg-clip-text text-transparent mb-3">
              I Said So
            </h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              The world's first skill-based prediction platform. Prove your foresight, build your reputation, and compete with the best.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-[#a855f7]/20 hover:text-[#a855f7] transition-all"
                    aria-label={social.label}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-sm text-muted-foreground hover:text-[#a855f7] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-sm text-muted-foreground hover:text-[#a855f7] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-3">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-sm text-muted-foreground hover:text-[#a855f7] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © 2026 I Said So. All rights reserved. Built with skill, not luck.
            </p>
            
            <div className="flex items-center gap-4">
              <a 
                href="mailto:hello@isaidso.com"
                className="text-sm text-muted-foreground hover:text-[#a855f7] flex items-center gap-1 transition-colors"
              >
                <Mail size={14} />
                hello@isaidso.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
