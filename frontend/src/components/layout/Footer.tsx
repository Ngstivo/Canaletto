export default function Footer() {
    return (
        <footer className="border-t bg-muted/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="font-heading font-semibold mb-4">Canaletto Art School</h3>
                        <p className="text-sm text-muted-foreground">
                            Master the art of painting with expert-led courses. Unlock your creative potential.
                        </p>
                    </div>

                    {/* Courses */}
                    <div>
                        <h4 className="font-semibold mb-4">Courses</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="/courses" className="hover:text-foreground transition-colors">All Courses</a></li>
                            <li><a href="/courses?level=beginner" className="hover:text-foreground transition-colors">Beginner</a></li>
                            <li><a href="/courses?level=intermediate" className="hover:text-foreground transition-colors">Intermediate</a></li>
                            <li><a href="/courses?level=advanced" className="hover:text-foreground transition-colors">Advanced</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="/help" className="hover:text-foreground transition-colors">Help Center</a></li>
                            <li><a href="/contact" className="hover:text-foreground transition-colors">Contact Us</a></li>
                            <li><a href="/faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                            <li><a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                            <li><a href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
                            <li><a href="/accessibility" className="hover:text-foreground transition-colors">Accessibility</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Canaletto Art School. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
