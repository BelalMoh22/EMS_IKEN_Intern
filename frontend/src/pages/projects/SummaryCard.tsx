import { Box, Card, CardContent, Typography } from "@mui/material";

interface Props {
  label: string;
  count: number;
  icon: React.ReactNode;
  bgAlpha: string;
  iconColor: string;
}

export function SummaryCard({ label, count, icon, bgAlpha, iconColor }: Props) {
  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: bgAlpha,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
            mb: 1.5,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
          {count}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}
