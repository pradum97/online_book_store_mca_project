import React from "react";
import {
  Box,
  Container,
  Typography,
  Link as MuiLink,
  Divider,
  IconButton,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import LockIcon from "@mui/icons-material/Lock";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import VerifiedIcon from "@mui/icons-material/Verified";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", href: "/home" },
    { label: "Browse Books", href: "/books" },
    { label: "Contact Us", href: "/contact_us" },
  ];

  const accountLinks = [
    { label: "Login", href: "/login" },
    { label: "Sign Up", href: "/signup" },
  ];

  const supportLinks = [
    { label: "Privacy Policy", href: "/privacy_policy" },
    { label: "Terms & Conditions", href: "/term_and_condition" },
    { label: "Contact Us", href: "/contact_us" },
  ];

  const badges = [
    { icon: <LockIcon sx={{ fontSize: 15 }} />, label: "Secure Auth" },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 15 }} />,
      label: "Fast Delivery",
    },
    { icon: <SupportAgentIcon sx={{ fontSize: 15 }} />, label: "24/7 Support" },
    { icon: <VerifiedIcon sx={{ fontSize: 15 }} />, label: "Verified Seller" },
  ];

  const linkSx = (arrowColor: string) => ({
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.875rem",
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    transition: "all 0.2s",
    "&:hover": {
      color: "#ffffff",
      gap: "12px",
    },
    "&::before": {
      content: '"›"',
      color: arrowColor,
      fontWeight: 700,
      fontSize: "1.1rem",
      lineHeight: 1,
      flexShrink: 0,
    },
  });

  const headingSx = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.65rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    color: "#fcd34d",
    mb: 2.5,
    fontWeight: 700,
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        background:
          "linear-gradient(135deg, #4c1d95 0%, #6d28d9 40%, #7c3aed 70%, #5b21b6 100%)",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background:
            "linear-gradient(90deg, #c4b5fd, #fff, #ddd6fe, #fff, #c4b5fd)",
        },
      }}
    >
      {/* Trust Badges Strip */}
      <Box
        sx={{
          borderBottom: "1px solid rgba(255,255,255,0.15)",
          py: 2,
          background: "rgba(0,0,0,0.1)",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "space-around" },
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {badges.map((badge) => (
              <Box
                key={badge.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "rgba(255,255,255,0.85)",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.75rem",
                  letterSpacing: "0.04em",
                }}
              >
                <Box sx={{ color: "#c4b5fd" }}>{badge.icon}</Box>
                {badge.label}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "2fr 1fr 1fr 1fr",
            },
            gap: 5,
          }}
        >
          {/* Brand Column */}
          <Box>
            {/* Logo */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MenuBookIcon sx={{ fontSize: 22, color: "#fff" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.15rem",
                    color: "#fff",
                    lineHeight: 1.1,
                  }}
                >
                  Book Store
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.6rem",
                    color: "rgba(255,255,255,0.6)",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  Online Bookstore
                </Typography>
              </Box>
            </Box>

            {/* Description */}
            <Typography
              sx={{
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.8,
                fontSize: "0.83rem",
                mb: 3,
                fontFamily: "'Inter', sans-serif",
                fontStyle: "italic",
              }}
            >
              A full-stack online bookstore with secure authentication,
              inventory management, and seamless order processing.
            </Typography>

            {/* Tech Tags */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              {["Node.js", "REST API", "JWT Auth", "MongoDB"].map((tech) => (
                <Box
                  key={tech}
                  sx={{
                    px: 1.4,
                    py: 0.5,
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    fontSize: "0.68rem",
                    fontFamily: "'Inter', monospace",
                    color: "rgba(255,255,255,0.9)",
                    letterSpacing: "0.03em",
                  }}
                >
                  {tech}
                </Box>
              ))}
            </Box>

            {/* Social Icons */}
            <Box sx={{ display: "flex", gap: 1 }}>
              {[
                { icon: <GitHubIcon sx={{ fontSize: 17 }} />, href: "#" },
                { icon: <LinkedInIcon sx={{ fontSize: 17 }} />, href: "#" },
                { icon: <TwitterIcon sx={{ fontSize: 17 }} />, href: "#" },
                { icon: <FacebookIcon sx={{ fontSize: 17 }} />, href: "#" },
              ].map((s, i) => (
                <IconButton
                  key={i}
                  size="small"
                  href={s.href}
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: "8px",
                    width: 34,
                    height: 34,
                    transition: "all 0.2s",
                    "&:hover": {
                      color: "#fff",
                      background: "rgba(255,255,255,0.15)",
                      borderColor: "rgba(255,255,255,0.5)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {s.icon}
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* Quick Links */}
          <Box>
            <Typography sx={headingSx}>Quick Links</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4 }}>
              {quickLinks.map((link) => (
                <MuiLink
                  key={link.label}
                  href={link.href}
                  sx={linkSx("#c4b5fd")}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Box>
          </Box>

          {/* My Account */}
          <Box>
            <Typography sx={headingSx}>My Account</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4 }}>
              {accountLinks.map((link) => (
                <MuiLink
                  key={link.label}
                  href={link.href}
                  sx={linkSx("#a78bfa")}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Box>
          </Box>

          {/* Support */}
          <Box>
            <Typography sx={headingSx}>Support</Typography>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1.4, mb: 3 }}
            >
              {supportLinks.map((link) => (
                <MuiLink
                  key={link.label}
                  href={link.href}
                  sx={linkSx("#f9a8d4")}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.15)" }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            sx={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.75rem",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            © {currentYear} Book Store. Built with ♥ for Certcube Labs Project.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              { label: "Privacy Policy", href: "/privacy_policy" },
              { label: "Terms & Conditions", href: "/term_and_condition" },
              { label: "Contact Us", href: "/contact_us" },
            ].map((item) => (
              <MuiLink
                key={item.label}
                href={item.href}
                underline="none"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.73rem",
                  fontFamily: "'Inter', sans-serif",
                  transition: "color 0.2s",
                  "&:hover": { color: "#fff" },
                }}
              >
                {item.label}
              </MuiLink>
            ))}
          </Box>

          {/* API Online Badge */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.6,
              borderRadius: "20px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#4ade80",
                boxShadow: "0 0 8px #4ade80",
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.4 },
                },
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.68rem",
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "0.06em",
              }}
            >
              API Online
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
