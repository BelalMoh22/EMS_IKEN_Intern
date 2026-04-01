import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { Employee } from "@/types";

interface ResetCredentialsDialogProps {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  onConfirm: (userId: number, username: string, newPassword: string) => Promise<void>;
  loading: boolean;
}

export function ResetCredentialsDialog({
  open,
  onClose,
  employee,
  onConfirm,
  loading,
}: ResetCredentialsDialogProps) {
  const [username, setUsername] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");

  useEffect(() => {
    if (employee) {
      setUsername(employee.user?.username || "");
      setGeneratedPassword(""); // Reset password when opening
    }
  }, [employee]);

  const generatePassword = () => {
    const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowercase = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$^*_-";
    const all = uppercase + lowercase + numbers + special;

    let pass = "";
    // Ensure at least one of each
    pass += uppercase[Math.floor(Math.random() * uppercase.length)];
    pass += lowercase[Math.floor(Math.random() * lowercase.length)];
    pass += numbers[Math.floor(Math.random() * numbers.length)];
    pass += special[Math.floor(Math.random() * special.length)];

    // Fill the rest to reach 10
    for (let i = 4; i < 10; i++) {
      pass += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle
    const shuffled = pass.split('').sort(() => 0.5 - Math.random()).join('');
    setGeneratedPassword(shuffled);
  };

  const validatePassword = (pass: string) => {
    if (!pass) return false;
    if (pass.length < 8) return false;
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
    return hasUpper && hasNumber && hasSpecial;
  };

  const isPasswordValid = validatePassword(generatedPassword);

  const handleReset = async () => {
    if (employee && isPasswordValid) {
        await onConfirm(employee.user?.id || 0, username, generatedPassword);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Reset Employee Credentials</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Reset credentials for <strong>{employee?.firstName} {employee?.lastname}</strong>. The user will be required to change this password on their next login.
        </Typography>
        
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
          size="small"
        />

        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
          <TextField
            label="New Password"
            value={generatedPassword}
            onChange={(e) => setGeneratedPassword(e.target.value)}
            fullWidth
            margin="normal"
            size="small"
            placeholder="Type or generate password"
            error={generatedPassword.length > 0 && !isPasswordValid}
            helperText={generatedPassword.length > 0 && !isPasswordValid ? "Must be 8+ chars with uppercase, number, & special char." : ""}
          />
          <Tooltip title="Generate Secure Password">
            <IconButton onClick={generatePassword} sx={{ mb: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {generatedPassword.length > 0 && (
          <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" component="ul" sx={{ pl: 2, m: 0 }}>
              <li style={{ color: generatedPassword.length >= 8 ? 'green' : 'inherit' }}>8+ characters</li>
              <li style={{ color: /[A-Z]/.test(generatedPassword) ? 'green' : 'inherit' }}>Uppercase letter</li>
              <li style={{ color: /[0-9]/.test(generatedPassword) ? 'green' : 'inherit' }}>Number</li>
              <li style={{ color: /[^a-zA-Z0-9]/.test(generatedPassword) ? 'green' : 'inherit' }}>Special character</li>
            </Typography>
          </Box>
        )}

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleReset} 
          variant="contained" 
          color="primary"
          disabled={!isPasswordValid || !username || loading}
        >
          Confirm Reset
        </Button>
      </DialogActions>
    </Dialog>
  );
}
