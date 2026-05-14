"use client";
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShieldIcon from "@mui/icons-material/Shield";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import StorageIcon from "@mui/icons-material/Storage";
import ShareIcon from "@mui/icons-material/Share";
import DeleteIcon from "@mui/icons-material/Delete";
import CookieIcon from "@mui/icons-material/Cookie";
import UpdateIcon from "@mui/icons-material/Update";

const sections = [
  {
    icon: <StorageIcon />,
    title: "Information We Collect",
    color: "#1a56db",
    content: `We collect information you provide directly to us when you create an account, make a purchase, or contact our support team. This includes:

• Full name, email address, and password (encrypted via JWT)
• Shipping address and billing information
• Order history and book preferences
• Device information, IP address, and browser type for security purposes
• Payment details (processed securely via third-party gateways — we never store raw card data)`,
  },
  {
    icon: <LockIcon />,
    title: "How We Use Your Information",
    color: "#7c3aed",
    content: `Your data is used strictly to provide and improve our bookstore services:

• Process and fulfill your book orders
• Manage your account and authentication sessions
• Send order confirmations and shipping updates
• Provide customer support and resolve disputes
• Improve our recommendation engine and search results
• Detect and prevent fraudulent transactions
• Comply with legal obligations`,
  },
  {
    icon: <ShareIcon />,
    title: "Data Sharing & Third Parties",
    color: "#db2777",
    content: `We do not sell, trade, or rent your personal information. We may share data only in these limited cases:

• Payment processors (Razorpay / Stripe) to complete transactions
• Shipping partners for order delivery
• Cloud infrastructure providers (data hosting only)
• Law enforcement when legally required

All third-party providers are contractually bound to protect your data.`,
  },
  {
    icon: <ShieldIcon />,
    title: "Data Security",
    color: "#059669",
    content: `We implement industry-standard security measures to protect your information:

• Passwords are hashed using bcrypt with salt rounds
• Authentication uses JWT tokens with short expiry windows
• All data in transit is encrypted via HTTPS/TLS
• Database access is restricted with role-based permissions
• Regular security audits and vulnerability assessments
• Automatic session expiry after inactivity`,
  },
  {
    icon: <CookieIcon />,
    title: "Cookies & Tracking",
    color: "#f59e0b",
    content: `We use minimal cookies necessary for site functionality:

• Session cookies: Keep you logged in during your visit
• Preference cookies: Remember your language and display settings
• Analytics cookies: Understand how users navigate our site (anonymized)

You can disable cookies in your browser settings, though some features may not work correctly.`,
  },
  {
    icon: <VisibilityOffIcon />,
    title: "Your Rights & Choices",
    color: "#0891b2",
    content: `You have full control over your personal data:

• Access: Request a copy of all data we hold about you
• Correction: Update or correct inaccurate information in your profile
• Deletion: Request permanent deletion of your account and data
• Portability: Export your order history and profile data
• Opt-out: Unsubscribe from marketing emails at any time

To exercise any of these rights, contact us at privacy@bookstore.com`,
  },
  {
    icon: <DeleteIcon />,
    title: "Data Retention",
    color: "#dc2626",
    content: `We retain your personal data only as long as necessary:

• Account data: Retained while your account is active
• Order records: Kept for 7 years for legal/tax compliance
• Log files: Automatically purged after 90 days
• Deleted accounts: Anonymized within 30 days of deletion request

Backups are purged on a rolling 30-day schedule.`,
  },
  {
    icon: <UpdateIcon />,
    title: "Policy Updates",
    color: "#6b7280",
    content: `We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. When we make significant changes:

• We will notify you via email or a prominent banner on the site
• The "Last Updated" date at the top of this page will be revised
• Continued use of Book Store after changes constitutes acceptance

We encourage you to review this policy periodically.`,
  },
];

const PrivacyPolicy: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>("panel0");

  const handleChange = (panel: string) => (_: any, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#ffffff",
        py: 8,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 7 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: "20px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              mb: 3,
            }}
          >
            <ShieldIcon sx={{ fontSize: 36, color: "#60a5fa" }} />
          </Box>
          <Typography
            sx={{
              fontFamily: "'Georgia', serif",
              fontSize: { xs: "2rem", md: "2.8rem" },
              fontWeight: 700,
              color: "#111827",
              mb: 1.5,
              letterSpacing: "-0.03em",
            }}
          >
            Privacy Policy
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Courier New', monospace",
              fontSize: "0.75rem",
              color: "#60a5fa",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              mb: 2,
            }}
          >
            Book Store Online Bookstore
          </Typography>
          <Chip
            label="Last Updated: May 10, 2026"
            size="small"
            sx={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#10b981",
              fontFamily: "'Courier New', monospace",
              fontSize: "0.7rem",
            }}
          />
          <Typography
            sx={{
              mt: 3,
              color: "#6b7280",
              fontFamily: "'Georgia', serif",
              fontStyle: "italic",
              fontSize: "0.9rem",
              maxWidth: 500,
              mx: "auto",
              lineHeight: 1.8,
            }}
          >
            We are committed to protecting your privacy. This policy explains
            how Book Store collects, uses, and safeguards your personal
            information.
          </Typography>
        </Box>

        {/* Accordion Sections */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {sections.map((section, i) => (
            <Accordion
              key={i}
              expanded={expanded === `panel${i}`}
              onChange={handleChange(`panel${i}`)}
              sx={{
                background: "#f8fafc",
                border: `1px solid ${
                  expanded === `panel${i}` ? section.color + "44" : "#e2e8f0"
                }`,
                borderRadius: "12px !important",

                boxShadow:
                  expanded === `panel${i}`
                    ? `0 0 20px ${section.color}18`
                    : "none",
                transition: "all 0.3s",
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon sx={{ color: section.color, fontSize: 20 }} />
                }
                sx={{ px: 3, py: 0.5 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      color: section.color,
                      display: "flex",
                      alignItems: "center",
                      "& svg": { fontSize: 20 },
                    }}
                  >
                    {section.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: "'Georgia', serif",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      color: expanded === `panel${i}` ? "#111827" : "#374151",
                      transition: "color 0.2s",
                    }}
                  >
                    {section.title}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3 }}>
                <Box
                  sx={{
                    pl: 4.5,
                    borderLeft: `2px solid ${section.color}44`,
                  }}
                >
                  <Typography
                    sx={{
                      color: "#475569",
                      fontFamily: "'Georgia', serif",
                      fontSize: "0.875rem",
                      lineHeight: 2,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {section.content}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Footer note */}
        <Box
          sx={{
            mt: 6,
            p: 3,
            borderRadius: "12px",
            background: "#f0f7ff",
            border: "1px solid #bfdbfe",
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Georgia', serif",
              fontSize: "0.85rem",
              color: "#6b7280",
              lineHeight: 1.8,
            }}
          >
            Questions about this policy? Contact us at{" "}
            <Box
              component="a"
              href="mailto:privacy@bookstore.com"
              sx={{ color: "#60a5fa", textDecoration: "none" }}
            >
              privacy@bookstore.com
            </Box>{" "}
            or visit our{" "}
            <Box
              component="a"
              href="/contact_us"
              sx={{ color: "#60a5fa", textDecoration: "none" }}
            >
              Contact Us
            </Box>{" "}
            page.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
