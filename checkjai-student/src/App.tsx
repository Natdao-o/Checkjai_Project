import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import QuizPage from './pages/QuizPage'
import QuizQuestionPage from './pages/QuizQuestionPage'
import DassQuestionPage from './pages/DassQuestionPage'
import ProfilePage from './pages/ProfilePage'
import CategoriesPage from './pages/CategoriesPage'
import BubbleLetterWritePage from './pages/BubbleLetterWritePage'
import BubbleLetterComfortPage from './pages/BubbleLetterComfortPage'

import HealingChoicePage from './pages/HealingChoicePage'
import HealingMusicPage from './pages/HealingMusicPage'
import HealingArtPage from './pages/HealingArtPage'
import PostcardPage from './pages/PostcardPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/quiz/question" element={<QuizQuestionPage />} />
      <Route path="/quiz/dass" element={<DassQuestionPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/bubble-letter/write" element={<BubbleLetterWritePage />} />
      <Route path="/bubble-letter/comfort" element={<BubbleLetterComfortPage />} />
      <Route path="/healing/choice" element={<HealingChoicePage />} />
      <Route path="/healing/music" element={<HealingMusicPage />} />
      <Route path="/healing/art" element={<HealingArtPage />} />
      <Route path="/postcard" element={<PostcardPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
