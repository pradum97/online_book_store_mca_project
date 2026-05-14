"use client";
import React, { useState } from "react";
import { Box, Container, Typography, Tabs, Tab, Chip } from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CopyrightIcon from "@mui/icons-material/Copyright";
import PolicyIcon from "@mui/icons-material/Policy";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

interface TabSection {
  icon: React.ReactNode;
  label: string;
  title: string;
  paragraphs: { heading: string; text: string }[];
}

const tabs: TabSection[] = [
  {
    icon: <AccountCircleIcon />,
    label: "Account",
    title: "Account Terms",
    paragraphs: [
      {
        heading: "Eligibility",
        text: "You must be at least 13 years of age to create an account on Book Store. By registering, you represent that all information you submit is accurate, current, and complete. Accounts registered with false information may be suspended without notice.",
      },
      {
        heading: "Account Security",
        text: "You are responsible for maintaining the confidentiality of your login credentials. Book Store uses JWT-based authentication with token expiry. You must notify us immediately at security@bookstore.com if you suspect unauthorized access to your account.",
      },
      {
        heading: "Account Termination",
        text: "We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or remain inactive for more than 24 months. You may delete your account at any time from your profile settings.",
      },
    ],
  },
  {
    icon: <ShoppingCartIcon />,
    label: "Orders",
    title: "Orders & Purchases",
    paragraphs: [
      {
        heading: "Order Acceptance",
        text: "Placing an order constitutes an offer to purchase. Book Store reserves the right to accept or decline any order. An order is confirmed only upon receipt of a confirmation email with an order ID.",
      },
      {
        heading: "Pricing & Availability",
        text: "All prices are listed in INR and are subject to change without prior notice. We make every effort to display accurate stock information; however, in case of inventory discrepancies, we will notify you and offer a full refund or substitution.",
      },
      {
        heading: "Order Cancellation",
        text: "Orders may be cancelled within 2 hours of placement for a full refund. After dispatch, cancellations are not accepted, but you may initiate a return once the order is delivered.",
      },
    ],
  },
  {
    icon: <PaymentIcon />,
    label: "Payments",
    title: "Payment Terms",
    paragraphs: [
      {
        heading: "Accepted Methods",
        text: "We accept UPI, credit/debit cards (Visa, Mastercard, RuPay), net banking, and popular digital wallets via our payment gateway partners. All transactions are processed over encrypted connections.",
      },
      {
        heading: "Failed Transactions",
        text: "In case of a payment failure, please verify that no amount was debited before retrying. If a duplicate deduction occurs, contact support@bookstore.com within 48 hours with transaction details for an immediate refund.",
      },
      {
        heading: "Refund Policy",
        text: "Approved refunds are processed within 5–7 business days to your original payment method. Refunds for cash-on-delivery orders will be issued as Book Store store credits.",
      },
    ],
  },
  {
    icon: <LocalShippingIcon />,
    label: "Shipping",
    title: "Shipping & Delivery",
    paragraphs: [
      {
        heading: "Delivery Timelines",
        text: "Standard delivery takes 3–7 business days depending on your location. Express delivery (1–2 days) is available in select pin codes for an additional fee. Delivery times are estimates and not guaranteed.",
      },
      {
        heading: "Damaged or Lost Items",
        text: "If your order arrives damaged or is lost in transit, please report it within 48 hours of the expected delivery date. Provide photographic evidence for damaged items. We will arrange a replacement or full refund.",
      },
      {
        heading: "Shipping Restrictions",
        text: "We currently ship within India only. Certain remote pin codes may have limited service or extended delivery times. Free shipping is available on orders above ₹499.",
      },
    ],
  },
  {
    icon: <CopyrightIcon />,
    label: "Intellectual Property",
    title: "Intellectual Property",
    paragraphs: [
      {
        heading: "Book Store Content",
        text: "All content on Book Store — including logos, interface design, product descriptions, and promotional materials — is the intellectual property of Book Store and protected under applicable copyright laws. Unauthorized reproduction is prohibited.",
      },
      {
        heading: "Book Content",
        text: "Books sold on our platform are protected by their respective authors' and publishers' copyrights. Purchase grants you a personal, non-transferable right to read the content. Reselling digital content or reproducing physical books is strictly prohibited.",
      },
      {
        heading: "User-Generated Content",
        text: "By submitting reviews or ratings, you grant Book Store a non-exclusive, royalty-free license to display your content on our platform. We reserve the right to moderate or remove content that violates our community guidelines.",
      },
    ],
  },
  {
    icon: <ReportProblemIcon />,
    label: "Liability",
    title: "Limitation of Liability",
    paragraphs: [
      {
        heading: "Service Availability",
        text: "Book Store strives for 99.9% uptime but does not guarantee uninterrupted service. We are not liable for losses resulting from temporary unavailability due to maintenance, technical failures, or circumstances beyond our control.",
      },
      {
        heading: "Indirect Damages",
        text: "To the fullest extent permitted by law, Book Store shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services, even if we have been advised of the possibility of such damages.",
      },
      {
        heading: "Maximum Liability",
        text: "Our total liability to you for any claim arising from these terms shall not exceed the amount you paid for the specific order giving rise to the claim, or ₹500, whichever is greater.",
      },
    ],
  },
  {
    icon: <PolicyIcon />,
    label: "Governing Law",
    title: "Governing Law & Disputes",
    paragraphs: [
      {
        heading: "Applicable Law",
        text: "These Terms and Conditions are governed by the laws of India, specifically the Information Technology Act, 2000 and the Consumer Protection Act, 2019. Any disputes shall be subject to the exclusive jurisdiction of courts in New Delhi.",
      },
      {
        heading: "Dispute Resolution",
        text: "We encourage resolving disputes amicably. Please contact our support team first. If a resolution cannot be reached within 30 days, disputes may be submitted to binding arbitration under the Arbitration and Conciliation Act, 1996.",
      },
      {
        heading: "Amendments",
        text: "Book Store reserves the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms. We will notify users of significant changes via email.",
      },
    ],
  },
  {
    icon: <SupportAgentIcon />,
    label: "Support",
    title: "Contact & Support",
    paragraphs: [
      {
        heading: "Customer Support",
        text: "Our support team is available Monday–Saturday, 9 AM to 6 PM IST. You can reach us at support@bookstore.com or via the Contact Us page. We aim to respond to all queries within 24 hours.",
      },
      {
        heading: "Grievance Officer",
        text: "In compliance with the IT Act, our Grievance Officer can be contacted at grievance@bookstore.com. Grievances will be acknowledged within 24 hours and resolved within 15 business days.",
      },
      {
        heading: "Feedback",
        text: "We welcome feedback on our platform and services. Suggestions can be submitted via our contact form. Book Store does not provide compensation for suggestions but values user input for product improvement.",
      },
    ],
  },
];

const TermsAndConditions: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const currentTab = tabs[activeTab];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#ffffff",
        py: 8,
      }}
    >
      <Container maxWidth="lg">
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
              background: "#f5f3ff",
              border: "1px solid #ddd6fe",
              mb: 3,
            }}
          >
            <GavelIcon sx={{ fontSize: 36, color: "#a78bfa" }} />
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
            Terms & Conditions
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Courier New', monospace",
              fontSize: "0.75rem",
              color: "#a78bfa",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              mb: 2,
            }}
          >
            Book Store Online Bookstore
          </Typography>
          <Chip
            label="Effective: February 27, 2026"
            size="small"
            sx={{
              background: "rgba(124,58,237,0.1)",
              border: "1px solid #ddd6fe",
              color: "#a78bfa",
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
              maxWidth: 520,
              mx: "auto",
              lineHeight: 1.8,
            }}
          >
            Please read these terms carefully before using Book Store. By
            accessing our platform, you agree to be bound by these conditions.
          </Typography>
        </Box>

        {/* Tab Layout */}
        <Box
          sx={{
            display: "flex",
            gap: 4,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Sidebar Tabs */}
          <Box sx={{ minWidth: { md: 200 } }}>
            <Tabs
              orientation="vertical"
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                "& .MuiTabs-indicator": {
                  left: 0,
                  width: "3px",
                  borderRadius: "0 3px 3px 0",
                  background: "linear-gradient(180deg, #7c3aed, #db2777)",
                },

                "& .MuiTab-root": {
                  alignItems: "flex-start",
                  textAlign: "left",
                  minHeight: 48,
                  fontFamily: "'Courier New', monospace",
                  fontSize: "0.72rem",
                  letterSpacing: "0.05em",
                  color: "#6b7280 !important",
                  textTransform: "none",
                  pl: 2.5,
                  gap: 1,
                  transition: "all 0.2s",

                  "&.Mui-selected": {
                    color: "#1e293b",
                  },

                  "&:hover": {
                    color: "#475569",
                  },
                },
              }}
            >
              {tabs.map((tab, i) => (
                <Tab
                  key={i}
                  label={tab.label}
                  icon={React.cloneElement(
                    tab.icon as React.ReactElement<any>,
                    {
                      sx: { fontSize: 16 },
                    },
                  )}
                  iconPosition="start"
                  sx={{
                    background:
                      activeTab === i ? "rgba(124,58,237,0.08)" : "transparent",
                    borderRadius: "8px",
                    mb: 0.5,
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Content Panel */}
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                background: "#f8fafc",
                border: "1px solid #ddd6fe",
                borderRadius: "16px",
                p: { xs: 3, md: 5 },
                minHeight: 420,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "10px",
                    background: "#ede9fe",
                    color: "#a78bfa",
                    display: "flex",
                    "& svg": { fontSize: 22 },
                  }}
                >
                  {currentTab.icon}
                </Box>
                <Typography
                  sx={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  {currentTab.title}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {currentTab.paragraphs.map((para, i) => (
                  <Box key={i}>
                    <Typography
                      sx={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: "0.68rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#7c3aed",
                        mb: 1.2,
                        fontWeight: 700,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")} — {para.heading}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'Georgia', serif",
                        fontSize: "0.9rem",
                        color: "#6b7280",
                        lineHeight: 1.9,
                        pl: 2,
                        borderLeft: "2px solid rgba(124,58,237,0.25)",
                      }}
                    >
                      {para.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Navigation hint */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 2,
                px: 1,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "0.65rem",
                  color: "#1e293b",
                }}
              >
                Section {activeTab + 1} of {tabs.length}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "0.65rem",
                  color: "#1e293b",
                }}
              >
                {activeTab < tabs.length - 1
                  ? `Next: ${tabs[activeTab + 1].label} →`
                  : "End of Terms"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Bottom CTA */}
        <Box
          sx={{
            mt: 6,
            p: 3,
            borderRadius: "12px",
            background: "#f5f3ff",
            border: "1px solid #ddd6fe",
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
            Have questions about our terms?{" "}
            <Box
              component="a"
              href="/contact_us"
              sx={{ color: "#a78bfa", textDecoration: "none" }}
            >
              Contact our support team
            </Box>{" "}
            or email us at{" "}
            <Box
              component="a"
              href="mailto:legal@bookstore.com"
              sx={{ color: "#a78bfa", textDecoration: "none" }}
            >
              legal@bookstore.com
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default TermsAndConditions;
