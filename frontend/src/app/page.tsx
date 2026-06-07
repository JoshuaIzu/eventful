"use client";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { BorderBeamButton } from "@/components/ui/border-beam-button";
import { LogoCarousel } from "@/components/ui/logo-carousel";
import { ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const PARTNER_LOGOS = [
  { src: "", alt: "TECHCONF" },
  { src: "", alt: "MUSICFEST" },
  { src: "", alt: "ARTEXPO" },
  { src: "", alt: "DEVCON" },
  { src: "", alt: "STARTUPHUB" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      {/* Navigation */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <Link href="/">
          <div className="text-2xl font-bold bg-linear-to-r from-accent to-accent-glow bg-clip-text text-transparent">
            EVENTFUL
          </div>
        </Link>
        <div className="flex gap-4">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-text-secondary hover:text-text-primary"
            >
              Login
            </Button>
          </Link>
          <Link href="/onboarding">
            <BorderBeamButton variantColor="colorful" size="sm">
              Get Started
            </BorderBeamButton>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="overflow-hidden py-20 lg:py-32">
          {/* Heading */}
          <div className="max-w-6xl mx-auto px-6 sm:px-6">
            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold tracking-tight leading-none text-text-primary whitespace-nowrap"
            >
              Discover Events.
              <br />
              <motion.span
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
                className="text-accent"
              >
                Create Moments.
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28, ease: "easeOut" }}
              className="mt-8 flex flex-row flex-wrap gap-3 text-sm lg:text-base font-mono"
            >
              The all-in-one ticketing platform built for creators and
              attendees.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.38, ease: "easeOut" }}
              className="mt-8 flex flex-row flex-wrap gap-3"
            >
              <Link href="/events">
                <BorderBeamButton size="lg">Explore Events</BorderBeamButton>
              </Link>
              <Link href="/onboarding?role=CREATOR">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border hover:bg-surface-elevated"
                >
                  Create an Event
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Partners */}
        <section className="border-y border-border bg-surface/30">
          <LogoCarousel logos={PARTNER_LOGOS} />
        </section>

        {/* Features */}
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Fast Checkout",
                desc: "Buy tickets in seconds with Paystack integration.",
                icon: Zap,
              },
              {
                title: "Secure Entry",
                desc: "Encrypted QR codes for tamper-proof ticketing.",
                icon: ShieldCheck,
              },
              {
                title: "Creator Dashboard",
                desc: "Real-time analytics and attendee management.",
                icon: TrendingUp,
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-surface border border-border space-y-4 hover:border-accent/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <f.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">{f.title}</h3>
                <p className="text-text-secondary">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 border-t border-border bg-surface/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-text-muted font-mono text-sm">
          <div>© 2026 EVENTFUL. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-text-primary">
              TERMS
            </a>
            <a href="#" className="hover:text-text-primary">
              PRIVACY
            </a>
            <a href="#" className="hover:text-text-primary">
              SUPPORT
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
