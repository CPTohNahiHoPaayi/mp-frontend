import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from '@/components/ui/provider'; // Chakra UI wrapper
import App from './App';
import LessonPage from './components/MainContent/LessonPage';
import EmptyElement from './components/MainContent/EmptyElement';
import { Signin } from './pages/Signin';
import GoogleCallback from './pages/GoogleCallback'; // adjust the path if needed
import Social from './pages/Social';
import Notes from './pages/Notes';
import NoteEditorPage from './pages/NoteEditorPage';
import NotesRAG from './pages/NotesRAG';
import { Signup } from './pages/Signup';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <Provider>
        <Routes>

         
          <Route path="/signin" element={<Signin />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />


         
          <Route path="/" element={<App />}>
            <Route index element={<EmptyElement />} />
            <Route
              path="courses/:courseId/module/:moduleIndex/lesson/:lessonIndex"
              element={<LessonPage />}
            />
            <Route path="/social" element={<Social/>}/>
            <Route path="/notes" element={<Notes/>}/>
            <Route path="/notes/:noteId/edit" element={<NoteEditorPage/>}/>
            <Route path="/notes/rag" element={<NotesRAG/>}/>
          </Route>

        </Routes>
      </Provider>
    </BrowserRouter>
  </AuthProvider>
);
