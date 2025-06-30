"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations("navigation");

  const navigationItems = [
    { href: "/recipes", label: t("recipes") },
    { href: "/mealPlans", label: t("mealPlans") },
    { href: "/pantry", label: t("pantry") },
    { href: "/shoppingList", label: t("shoppingList") },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Backdrop overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200/50 ${
          isMenuOpen ? "rounded-b-xl " : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link
              href="/"
              className="text-xl sm:text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
              onClick={closeMenu}
            >
              {t("appName")}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" className="text-sm">
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="p-2"
                aria-label="Toggle navigation menu"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200/50 bg-white">
              <div className="py-2 space-y-1">
                {navigationItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeMenu}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left px-4 py-3 text-base"
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
