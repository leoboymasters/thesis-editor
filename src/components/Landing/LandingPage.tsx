import React, { useEffect, useState } from 'react';
import {
  Moon,
  Sun,
  ArrowRight,
  Circle,
  Lock,
  BarChart3,
  CheckCircle2,
  FileText,
  LayoutTemplate,
  Quote,
  Zap,
  Shield,
  Globe,
  Users,
  BookOpen,
  Sparkles,
  Share2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { BackgroundRippleEffect } from '../ui/background-ripple-effect';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

const NAV_LINKS = [
  { label: 'Home', active: true },
  { label: 'Features', active: false },
  { label: 'Pricing', active: false },
  { label: 'About', active: false },
  { label: 'Contact', active: false },
];

const TRUST_ITEMS = [
  { icon: Users, label: 'Multi-institutional Collaboration' },
  { icon: Lock, label: 'Enterprise Security' },
  { icon: LayoutTemplate, label: 'Project Lifecycle Management' },
];

const FEATURES = [
  {
    title: 'Research Project Management',
    description: 'Break down silos. Track milestones, grants, and experiments in a dedicated project management suite.',
    icon: LayoutTemplate,
  },
  {
    title: 'Collaborative Editor',
    description: 'Write together in real-time. Switch between rich text and LaTeX while your team reviews instantly.',
    icon: Users,
  },
  {
    title: 'Smart Citations',
    description: 'Search and import citations directly. Manage shared references for your entire collaborative project.',
    icon: BookOpen,
  },
  {
    title: 'Instant Preview',
    description: 'See changes as they happen. No more compilation delays for you or your co-authors.',
    icon: Zap,
  },
  {
    title: 'AI Co-pilot',
    description: 'Intelligent suggestions for grammar, tone, and clarity to harmonize your team’s writing voice.',
    icon: Sparkles,
  },
  {
    title: 'Silo-Breaking Sync',
    description: 'Seamlessly share data and drafts across labs and institutions. Your research, unified.',
    icon: Share2,
  },
];

const STEPS = [
  {
    id: 1,
    title: 'Initialize Project',
    description: 'Define your research scope, set milestones, and invite your team to a unified workspace.',
  },
  {
    id: 2,
    title: 'Collaborate & Execute',
    description: 'Write, analyze, and track progress together. No more isolated workflows or email chains.',
  },
  {
    id: 3,
    title: 'Publish Together',
    description: 'Compile your collaborative work into publication-ready documents instantly.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      "We used to work in isolated silos. This platform unified our lab's workflow and doubled our publication rate.",
    author: 'Dr. Sarah Jenkins',
    role: 'Principal Investigator, MIT',
  },
  {
    quote:
      "The project management features are a game changer. I can track every student's progress and provide feedback instantly.",
    author: 'James Wu',
    role: 'Research Lead, Stanford',
  },
  {
    quote:
      "Finally, a tool that understands research is a team sport. Real-time collaboration meets professional LaTeX typesetting.",
    author: 'Elena Rodriguez',
    role: 'Senior Researcher, CERN',
  },
];

interface LandingPageProps {
  onLogin: () => void;
  onRequestDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRequestDemo }) => {
  const [dark, setDark] = useState(false);
  const handleDemo = onRequestDemo ?? onLogin;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div className="landing-page relative min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <BackgroundRippleEffect rows={14} cols={24} cellSize={48} />
      {/* Floating Header */}
      <header className="fixed top-4 left-4 right-4 z-50 md:left-8 md:right-8 pointer-events-none [&>*]:pointer-events-auto">
        <div className="rounded-xl border border-border bg-background/80 backdrop-blur-md shadow-sm md:shadow-md container mx-auto px-6 h-16 flex items-center justify-between transition-all duration-200">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
              <span className="font-serif font-bold italic text-xl leading-none">R</span>
            </div>
            <span className="font-bold text-lg tracking-tight">researchere</span>
          </a>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href="#"
                className={cn(
                  'text-sm font-medium transition-colors relative group py-2',
                  link.active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
                {link.active && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </a>
            ))}
          </nav>

          {/* Right: theme, login, CTA */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDark((d) => !d)}
              className="text-muted-foreground hover:text-foreground rounded-full"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <button
              type="button"
              onClick={onLogin}
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Log in
            </button>
            <Button onClick={handleDemo} size="sm" className="rounded-full px-6 shadow-sm hover:shadow-md transition-all">
              Request Access
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {/* Section: Hero */}
        <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-24 md:pt-48 md:pb-32 min-h-[90vh]">
          <div className="w-full max-w-4xl mx-auto text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Announcement pill */}
            <a
              href="https://researchere.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Coming Soon
              <ArrowRight className="h-3 w-3 ml-1" />
            </a>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
              <span className="text-foreground">Don&apos;t research there.</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                Research here.
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The first project management platform for research. Break down barriers, collaborating globally, 
              and manage your entire research lifecycle in one unified workspace.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 rounded-full text-base gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" onClick={handleDemo}>
                Get Started for Free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 rounded-full text-base border-2 hover:bg-muted/50">
                View Examples
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-8 text-muted-foreground/80">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="h-5 w-5 shrink-0 text-primary/80" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Features */}
        <section className="py-24 bg-muted/30 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Everything you need to <span className="text-primary">manage research</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Built by researchers, for researchers. We've thought of everything so you can focus on the breakthrough.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map((feature) => (
                <Card key={feature.title} className="bg-background/60 backdrop-blur-sm border-muted transition-all hover:shadow-lg hover:border-primary/20 group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Section: How it Works */}
        <section className="py-24 relative overflow-hidden">
           <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">From idea to <span className="text-primary">breakthrough</span> together</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Streamlined project management designed to move research forward.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
               {/* Connecting Line (Desktop) */}
               <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />

              {STEPS.map((step) => (
                <div key={step.id} className="relative flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-background border-4 border-muted flex items-center justify-center text-2xl font-bold text-muted-foreground relative z-10 mb-6 shadow-sm group hover:border-primary/50 transition-colors">
                    <span className="text-primary">{step.id}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>
                </div>
              ))}
            </div>
           </div>
        </section>

        {/* Section: Testimonials */}
        <section className="py-24 bg-primary/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Trusted by leading <span className="text-primary">labs</span></h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t, i) => (
                <Card key={i} className="border-none shadow-md bg-background relative">
                  <CardContent className="pt-8">
                    <Quote className="h-10 w-10 text-primary/20 absolute top-6 left-6" />
                    <p className="text-lg font-medium leading-relaxed mb-6 relative z-10 text-foreground/90">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                        {t.author[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{t.author}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Section: CTA Bottom */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/90 opacity-100" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="container mx-auto px-6 relative z-10 text-center text-primary-foreground">
             <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to break the silos?</h2>
             <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10">
               Join 10,000+ researchers using Researchere to manage their projects and write their next breakthrough.
             </p>
             <Button size="lg" variant="secondary" className="h-14 px-10 rounded-full text-primary font-bold text-lg shadow-xl hover:shadow-2xl transition-all" onClick={handleDemo}>
               Start Collaborating Now
             </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <a href="#" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
                  <span className="font-serif font-bold italic text-lg leading-none">R</span>
                </div>
                <span className="font-bold text-lg">researchere</span>
              </a>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Empowering the next generation of scientists and thinkers with tools that foster clarity, collaboration, and discovery.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Researchere Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Globe className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Users className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
