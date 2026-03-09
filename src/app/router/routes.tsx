import { Navigate, Route, Routes } from 'react-router-dom';
import { CharacterPage } from '../../pages/CharacterPage/CharacterPage';
import { ImportPage } from '../../pages/ImportPage/ImportPage';
import { LibraryPage } from '../../pages/LibraryPage/LibraryPage';
import { SettingsPage } from '../../pages/SettingsPage/SettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LibraryPage />} />
      <Route path="/character/:id" element={<CharacterPage />} />
      <Route path="/import" element={<ImportPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
