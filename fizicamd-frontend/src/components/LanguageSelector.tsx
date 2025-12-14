import { TextField, MenuItem } from "@mui/material";
import { useI18n } from "../i18n";

export default function LanguageSelector() {
  const { language, setLanguage, languages, t } = useI18n();
  return (
    <TextField
      select
      size="small"
      variant="outlined"
      value={language}
      onChange={(e) => setLanguage(e.target.value as typeof language)}
      label={t("common.languageSelector")}
      sx={{ minWidth: 150 }}
    >
      {languages.map((lang) => (
        <MenuItem key={lang.code} value={lang.code}>
          {lang.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
