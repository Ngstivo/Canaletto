import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
              Master the Art of{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Painting
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students learning from world-class instructors at Canaletto Art School.
              Transform your passion into mastery with our expert-led courses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 transition-colors"
              >
                Explore Courses
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-md text-base font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 px-8 transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Why Choose Canaletto
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to unlock your creative potential and master the art of painting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">Expert Instructors</h3>
              <p className="text-muted-foreground">
                Learn from accomplished artists with years of teaching experience and professional expertise.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">Structured Learning</h3>
              <p className="text-muted-foreground">
                Follow carefully designed curricula that take you from beginner to advanced techniques.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">Learn at Your Pace</h3>
              <p className="text-muted-foreground">
                Access courses anytime, anywhere with lifetime access and downloadable resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-heading font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Students</div>
            </div>
            <div>
              <div className="text-4xl font-heading font-bold text-secondary mb-2">150+</div>
              <div className="text-muted-foreground">Courses</div>
            </div>
            <div>
              <div className="text-4xl font-heading font-bold text-accent mb-2">50+</div>
              <div className="text-muted-foreground">Instructors</div>
            </div>
            <div>
              <div className="text-4xl font-heading font-bold text-primary mb-2">4.8/5</div>
              <div className="text-muted-foreground">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Ready to Start Your Art Journey?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join our community of aspiring artists and start creating beautiful artwork today.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-md text-base font-medium bg-white text-primary hover:bg-white/90 h-12 px-8 transition-colors"
            >
              Start Learning Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
