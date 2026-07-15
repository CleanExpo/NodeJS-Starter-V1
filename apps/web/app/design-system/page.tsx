'use client';

import * as React from 'react';
import { Button, ButtonGroup } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
  CardBadge,
} from '@/components/ui/card';
import { Spinner, DotsLoader, Skeleton, SkeletonCard } from '@/components/ui/loading';
import {
  FadeIn,
  SlideUp,
  ScaleIn,
  BounceIn,
  Stagger,
  HoverScale,
  HoverLift,
  Pulse,
  Float,
} from '@/components/ui/motion';
import {
  HeroSection,
  FeatureGrid,
  Testimonials,
  type Feature,
  type Testimonial,
} from '@/components/marketing';

/* ----------------------------------------
   Example Data
   ---------------------------------------- */
const features: Feature[] = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: 'Lightning Fast',
    description: 'Optimized for speed with minimal bundle size and instant page loads.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    title: 'Secure by Default',
    description: 'Enterprise-grade security with built-in authentication and encryption.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
    title: 'Flexible Layout',
    description: 'Responsive design that adapts seamlessly to any screen size.',
    highlight: true,
  },
];

const testimonials: Testimonial[] = [
  {
    quote:
      'This design system has transformed how we build products. The component quality is exceptional.',
    author: {
      name: 'Sarah Chen',
      title: 'Engineering Lead',
      company: 'TechCorp',
      avatar: (
        <div className="from-brand-primary to-brand-accent flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white">
          SC
        </div>
      ),
    },
    rating: 5,
  },
  {
    quote:
      'Finally, a design system that actually understands developer experience. Pure joy to work with.',
    author: {
      name: 'Marcus Johnson',
      title: 'Frontend Developer',
      company: 'StartupXYZ',
      avatar: (
        <div className="from-brand-secondary to-brand-primary flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white">
          MJ
        </div>
      ),
    },
    rating: 5,
  },
  {
    quote: 'The attention to accessibility and performance is outstanding. Highly recommended.',
    author: {
      name: 'Emily Rodriguez',
      title: 'Product Designer',
      company: 'DesignStudio',
      avatar: (
        <div className="from-brand-accent to-brand-secondary flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white">
          ER
        </div>
      ),
    },
    rating: 5,
  },
];

/* ----------------------------------------
   Section Component
   ---------------------------------------- */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b py-12 last:border-b-0 md:py-16">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/* ----------------------------------------
   Design System Showcase Page
   ---------------------------------------- */
export default function DesignSystemPage() {
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section Demo */}
      <HeroSection
        variant="gradient"
        size="default"
        badge="Design System v1.0"
        title="Build Beautiful Interfaces"
        titleHighlight="Beautiful"
        subtitle="A comprehensive design system with pre-built components, marketing blocks, and AI-powered image generation."
        actions={[
          { label: 'Get Started', href: '#components' },
          { label: 'View on GitHub', href: '#', variant: 'outline' },
        ]}
        features={['TypeScript First', 'Accessible', 'Customizable', 'Production Ready']}
      />

      {/* Main Content */}
      <div className="container px-4 py-12 md:px-6">
        {/* Buttons Section */}
        <Section
          title="Buttons"
          description="Multiple variants with loading states and icon support."
        >
          <div className="space-y-8">
            {/* Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="gradient">Gradient</Button>
                <Button variant="glow">Glow</Button>
                <Button variant="glow-accent">Glow Accent</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            {/* Loading & Icons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Loading & Icons</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  loading={loading}
                  loadingText="Loading..."
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => setLoading(false), 2000);
                  }}
                >
                  Click to Load
                </Button>
                <Button
                  leftIcon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  }
                >
                  With Icon
                </Button>
              </div>
            </div>

            {/* Button Group */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Button Group</h3>
              <ButtonGroup>
                <Button variant="outline">Left</Button>
                <Button variant="outline">Center</Button>
                <Button variant="outline">Right</Button>
              </ButtonGroup>
            </div>
          </div>
        </Section>

        {/* Cards Section */}
        <Section title="Cards" description="Flexible card components with multiple variants.">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Standard card with subtle shadow.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Card content goes here with additional information.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>Card with enhanced shadow.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Card content goes here with additional information.
                </p>
              </CardContent>
            </Card>

            <Card variant="interactive">
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>Hover for lift effect.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Card content goes here with additional information.
                </p>
              </CardContent>
            </Card>

            <Card variant="featured">
              <CardHeader>
                <CardTitle>Featured Card</CardTitle>
                <CardDescription>Highlighted with brand colors.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Card content goes here with additional information.
                </p>
              </CardContent>
            </Card>

            <Card variant="gradient">
              <CardHeader>
                <CardTitle>Gradient Card</CardTitle>
                <CardDescription>Gradient border effect.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Card content goes here with additional information.
                </p>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
                <CardDescription>Glassmorphism effect.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Card content goes here with additional information.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Card with Image */}
          <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold">Card with Image & Badge</h3>
            <Card variant="interactive" className="relative max-w-sm">
              <CardBadge variant="success">New</CardBadge>
              <CardImage
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format"
                alt="Abstract gradient"
                aspectRatio="video"
              />
              <CardHeader>
                <CardTitle>Image Card</CardTitle>
                <CardDescription>Card with image and badge components.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button size="sm" variant="outline">
                  Learn More
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        {/* Loading States Section */}
        <Section
          title="Loading States"
          description="Various loading indicators for different contexts."
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Spinners</h3>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <Spinner className="mx-auto mb-2 h-4 w-4" />
                  <span className="text-muted-foreground text-sm">Small</span>
                </div>
                <div className="text-center">
                  <Spinner className="mx-auto mb-2 h-6 w-6" />
                  <span className="text-muted-foreground text-sm">Medium</span>
                </div>
                <div className="text-center">
                  <Spinner className="mx-auto mb-2 h-10 w-10" />
                  <span className="text-muted-foreground text-sm">Large</span>
                </div>
                <div className="text-center">
                  <DotsLoader className="mx-auto mb-2" />
                  <span className="text-muted-foreground text-sm">Dots</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Skeletons</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <SkeletonCard />
              </div>
            </div>
          </div>
        </Section>

        {/* Motion Section */}
        <Section
          title="Motion Utilities"
          description="Animation components for engaging interfaces."
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Entrance Animations</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <FadeIn className="bg-muted rounded-lg p-6 text-center">
                  <span className="font-medium">Fade In</span>
                </FadeIn>
                <SlideUp className="bg-muted rounded-lg p-6 text-center">
                  <span className="font-medium">Slide Up</span>
                </SlideUp>
                <ScaleIn className="bg-muted rounded-lg p-6 text-center">
                  <span className="font-medium">Scale In</span>
                </ScaleIn>
                <BounceIn className="bg-muted rounded-lg p-6 text-center">
                  <span className="font-medium">Bounce In</span>
                </BounceIn>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Interactive Effects</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <HoverScale className="bg-muted cursor-pointer rounded-lg p-6 text-center">
                  <span className="font-medium">Hover Scale</span>
                </HoverScale>
                <HoverLift className="bg-muted cursor-pointer rounded-lg p-6 text-center">
                  <span className="font-medium">Hover Lift</span>
                </HoverLift>
                <Pulse className="bg-muted rounded-lg p-6 text-center">
                  <span className="font-medium">Pulse</span>
                </Pulse>
                <Float className="bg-muted rounded-lg p-6 text-center">
                  <span className="font-medium">Float</span>
                </Float>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Staggered Animation</h3>
              <Stagger staggerDelay={100} className="grid grid-cols-4 gap-2 md:grid-cols-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <FadeIn
                    key={i}
                    className="from-brand-primary to-brand-accent aspect-square rounded-lg bg-gradient-to-br"
                  />
                ))}
              </Stagger>
            </div>
          </div>
        </Section>
      </div>

      {/* Feature Grid Demo */}
      <FeatureGrid
        variant="cards"
        badge="Features"
        title="Everything You Need"
        titleHighlight="Everything"
        subtitle="A comprehensive toolkit for building modern web applications."
        features={features}
      />

      {/* Testimonials Demo */}
      <Testimonials
        variant="cards"
        badge="Testimonials"
        title="Loved by Developers"
        titleHighlight="Developers"
        subtitle="See what developers are saying about our design system."
        testimonials={testimonials}
        columns={3}
      />

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container px-4 text-center md:px-6">
          <p className="text-muted-foreground">
            Design System Showcase - Built with Next.js, Tailwind CSS, and shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  );
}
