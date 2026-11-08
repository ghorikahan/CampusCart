import Link from "next/link";
import { ShoppingBag, Mail, Globe, MessageCircle } from "lucide-react";

const footerLinks = {
  marketplace: [
    { label: "Browse Listings", href: "/listings" },
    { label: "Sell an Item", href: "/listings/new" },
    { label: "Free Items", href: "/listings?type=FREE" },
    { label: "Exchange", href: "/listings?type=EXCHANGE" },
  ],
  categories: [
    { label: "Books", href: "/listings?category=BOOKS" },
    { label: "Electronics", href: "/listings?category=ELECTRONICS" },
    { label: "Furniture", href: "/listings?category=FURNITURE" },
    { label: "Stationery", href: "/listings?category=STATIONERY" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Contact", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight font-heading">
                CampusCart
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The student marketplace for second-hand goods. Buy, sell, exchange,
              and donate — all on campus.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="https://community.campuscart.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Community"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="mailto:hello@campuscart.in"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-2.5">
              {footerLinks.marketplace.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Categories</h3>
            <ul className="space-y-2.5">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CampusCart. Made with ❤️ for students.
          </p>
          <p className="text-xs text-muted-foreground">
            All transactions are between students. CampusCart is not liable for
            any disputes.
          </p>
        </div>
      </div>
    </footer>
  );
}
