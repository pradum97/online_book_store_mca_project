"use client";
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SendIcon from "@mui/icons-material/Send";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const contactCards = [
  {
    icon: <EmailIcon sx={{ fontSize: 22 }} />,
    label: "Email Us",
    value: "support@bookstore.com",
    sub: "We reply within 24 hours",
    color: "#1a56db",
    href: "mailto:support@bookstore.com",
  },
  {
    icon: <PhoneIcon sx={{ fontSize: 22 }} />,
    label: "Call Us",
    value: "+91 12345679980",
    sub: "Mon–Sat, 9 AM–6 PM IST",
    color: "#059669",
    href: "tel:+12345679980",
  },

  {
    icon: <AccessTimeIcon sx={{ fontSize: 22 }} />,
    label: "Working Hours",
    value: "Mon – Sat",
    sub: "9:00 AM – 6:00 PM IST",
    color: "#f59e0b",
    href: "#",
  },
];

const subjects = [
  "Order Issue",
  "Payment Problem",
  "Return / Refund",
  "Account Help",
  "Technical Bug",
  "Book Availability",
  "Partnership / Business",
  "Other",
];

const inputSx = {
  "& .MuiOutlinedInput-root": {
    background: "#f8fafc",
    borderRadius: "10px",
    color: "#1e293b",
    fontFamily: "'Georgia', serif",
    fontSize: "0.9rem",
    "& fieldset": { borderColor: "#d1d5db" },
    "&:hover fieldset": { borderColor: "#1a56db" },
    "&.Mui-focused fieldset": { borderColor: "#1a56db" },
  },
  "& .MuiInputLabel-root": {
    color: "#6b7280",
    fontFamily: "'Courier New', monospace",
    fontSize: "0.78rem",
    letterSpacing: "0.05em",
    "&.Mui-focused": { color: "#60a5fa" },
  },
  "& .MuiSelect-icon": { color: "#475569" },
};

const ContactUs: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    orderId: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: any) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", orderId: "", message: "" });
    }, 1500);
  };

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
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              mb: 3,
            }}
          >
            <SupportAgentIcon sx={{ fontSize: 36, color: "#60a5fa" }} />
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
            Contact Us
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
            Book Store Support Center
          </Typography>
          <Typography
            sx={{
              color: "#6b7280",
              fontFamily: "'Georgia', serif",
              fontStyle: "italic",
              fontSize: "0.9rem",
              maxWidth: 480,
              mx: "auto",
              lineHeight: 1.8,
            }}
          >
            We're here to help. Reach out for any query about orders, payments,
            accounts, or anything else — and we'll get back to you promptly.
          </Typography>
        </Box>

        {/* Contact Info Cards */}
        <Grid container spacing={2} sx={{ mb: 6 }}>
          {contactCards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.label}>
              <Box
                component="a"
                href={card.href}
                sx={{
                  display: "block",
                  p: 3,
                  borderRadius: "14px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  textDecoration: "none",
                  transition: "all 0.25s",
                  "&:hover": {
                    background: `${card.color}0f`,
                    borderColor: `${card.color}33`,
                    transform: "translateY(-3px)",
                    boxShadow: `0 8px 25px ${card.color}18`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    background: `${card.color}18`,
                    border: `1px solid ${card.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: card.color,
                    mb: 2,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography
                  sx={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: "0.62rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#6b7280",
                    mb: 0.5,
                  }}
                >
                  {card.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "0.9rem",
                    color: "#1e293b",
                    fontWeight: 600,
                    mb: 0.3,
                  }}
                >
                  {card.value}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "0.75rem",
                    color: "#6b7280",
                  }}
                >
                  {card.sub}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Contact Form */}
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "20px",
                p: { xs: 3, md: 5 },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "#111827",
                  mb: 0.5,
                }}
              >
                Send a Message
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "0.68rem",
                  color: "#6b7280",
                  letterSpacing: "0.08em",
                  mb: 4,
                }}
              >
                Fill out the form and our team will respond within 24 hours
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Your Name *"
                      value={form.name}
                      onChange={handleChange("name")}
                      sx={inputSx}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email Address *"
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      sx={inputSx}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Subject"
                      value={form.subject}
                      onChange={handleChange("subject")}
                      sx={inputSx}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Order ID (optional)"
                      value={form.orderId}
                      onChange={handleChange("orderId")}
                      sx={inputSx}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Message *"
                  value={form.message}
                  onChange={handleChange("message")}
                  sx={inputSx}
                  InputLabelProps={{ shrink: true }}
                />

                <Button
                  fullWidth
                  onClick={handleSubmit}
                  disabled={
                    loading || !form.name || !form.email || !form.message
                  }
                  endIcon={loading ? null : <SendIcon />}
                  sx={{
                    py: 1.6,
                    borderRadius: "12px",
                    background: loading
                      ? "rgba(26,86,219,0.3)"
                      : "linear-gradient(90deg, #1a56db, #7c3aed)",
                    color: "#111827",
                    fontFamily: "'Courier New', monospace",
                    fontSize: "0.78rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    boxShadow: "0 4px 20px rgba(26,86,219,0.35)",
                    transition: "all 0.25s",
                    "&:hover:not(:disabled)": {
                      background: "linear-gradient(90deg, #1a56db, #9333ea)",
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 25px rgba(26,86,219,0.5)",
                    },
                    "&:disabled": { color: "rgba(0,0,0,0.3)" },
                  }}
                >
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* FAQ / Quick Help */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "20px",
                p: { xs: 3, md: 4 },
                height: "100%",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#111827",
                  mb: 0.5,
                }}
              >
                Quick Answers
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "0.68rem",
                  color: "#6b7280",
                  letterSpacing: "0.08em",
                  mb: 3.5,
                }}
              >
                Common questions answered instantly
              </Typography>

              {[
                {
                  q: "How do I track my order?",
                  a: 'Log into your account and visit "Order History" to see real-time tracking updates.',
                  color: "#1a56db",
                },
                {
                  q: "When will my refund be processed?",
                  a: "Refunds are processed within 5–7 business days after return confirmation.",
                  color: "#059669",
                },
                {
                  q: "Can I change my delivery address?",
                  a: "Address changes are possible within 2 hours of placing the order. Contact support immediately.",
                  color: "#f59e0b",
                },
                {
                  q: "I forgot my password. What do I do?",
                  a: 'Click "Forgot Password" on the login page to receive a reset link on your registered email.',
                  color: "#7c3aed",
                },
                {
                  q: "How do I cancel my order?",
                  a: "Orders can be cancelled within 2 hours via your Order History page.",
                  color: "#db2777",
                },
              ].map((faq, i) => (
                <Box
                  key={i}
                  sx={{
                    mb: 2.5,
                    pb: 2.5,
                    borderBottom: i < 4 ? "1px solid #e2e8f0" : "none",
                  }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: faq.color,
                        mt: 0.7,
                        flexShrink: 0,
                        boxShadow: `0 0 8px ${faq.color}`,
                      }}
                    />
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: "'Georgia', serif",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#1e293b",
                          mb: 0.5,
                        }}
                      >
                        {faq.q}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Georgia', serif",
                          fontSize: "0.78rem",
                          color: "#6b7280",
                          lineHeight: 1.7,
                        }}
                      >
                        {faq.a}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={submitted}
        autoHideDuration={5000}
        onClose={() => setSubmitted(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          icon={<CheckCircleIcon />}
          severity="success"
          onClose={() => setSubmitted(false)}
          sx={{
            background: "rgba(5,150,105,0.15)",
            border: "1px solid rgba(5,150,105,0.3)",
            color: "#10b981",
            fontFamily: "'Georgia', serif",
            "& .MuiAlert-icon": { color: "#10b981" },
          }}
        >
          Message sent! We'll respond within 24 hours. ✓
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactUs;
