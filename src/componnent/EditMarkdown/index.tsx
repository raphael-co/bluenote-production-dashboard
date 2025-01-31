import React, { useState, useEffect } from 'react';
import MdEditor from 'react-markdown-editor-lite';
import { marked } from 'marked';
import 'react-markdown-editor-lite/lib/index.css';
import { useTheme } from '../../context/ThemeContext';
import '../../screen/annoncement/annoncement.css';
import axios from 'axios';
import { useDynamicStyles } from './useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';

function EditMarkdown() {
  const [markdownText, setMarkdownText] = useState('');
  const [htmlContent, setHtmlContent] = useState<any>('');
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { enqueueSnackbar } = useSnackbar();
  const id = searchParams.get('id');

  console.log(id);


  useEffect(() => {
    if (id && token) {
      console.log('ID:', id);

      const fetchAnnouncement = async () => {
        console.log('ID:', id);
        console.log('Token:', token);

        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/announcements/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const announcementData = response.data;

          // Mettre à jour le titre
          setTitle(announcementData.title);

          // Utiliser TextDecoder pour décoder le contenu en Markdown
          const decoder = new TextDecoder('utf-8');
          const markdownContent = decoder.decode(new Uint8Array(announcementData.content.data));
          console.log('markdownContent');
          console.log(markdownContent);

          setMarkdownText(markdownContent);
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'annonce :', error);
        }
      };

      fetchAnnouncement();
    }
  }, [id, token]);


  const handleEditorChange = ({ text }: any) => {
    setMarkdownText(text);
  };

  useEffect(() => {
    const processMarkdown = async () => {
      const html = marked(markdownText);
      setHtmlContent(html);
    };

    processMarkdown();
  }, [markdownText]);

  const handleDownload = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = title.trim() === '' ? 'document.md' : `${title.trim()}.md`;
    link.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    if (!title || (!selectedFile && !markdownText.trim())) {
      alert('Veuillez renseigner un titre et sélectionner un fichier ou ajouter du texte Markdown.');
      return;
    }

    const formData = new FormData();
    const markdownBlob = new Blob([markdownText], { type: 'text/markdown' });
    formData.append('announcementFile', markdownBlob, 'document.md');
    formData.append('title', title); // Titre

    try {
      let response;

      if (id) {
        // Si l'id est présent, effectuer une requête PUT pour mettre à jour l'annonce
        response = await axios.put(`${process.env.REACT_APP_API_URL}/announcements/update/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });
      } else {
        // Si aucun id n'est présent, créer une nouvelle annonce avec POST
        response = await axios.post(`${process.env.REACT_APP_API_URL}/announcements/add`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar(response.data.message, { variant: 'success' });
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'annonce :', error);

      // Vérification si c'est une erreur Axios (pour avoir la réponse)
      if (axios.isAxiosError(error)) {
        // Vérification des erreurs de type 4xx
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          enqueueSnackbar(error.response.data.message || 'Une erreur est survenue.', { variant: 'warning' });
        } else {
          enqueueSnackbar('Erreur lors du téléchargement.', { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Une erreur inconnue est survenue.', { variant: 'error' });
      }
    }
  };

  const darkModeStyles = {
    backgroundColor: '#333',
    color: '#fff',
    borderColor: '#555',
    editorBackgroundColor: '#1e1e1e',
    buttonBackground: '#444',
    buttonTextColor: '#fff',
    previewBackgroundColor: '#1e1e1e',
    previewBorderColor: '#555',
  };

  const lightModeStyles = {
    backgroundColor: '#fff',
    color: '#000',
    borderColor: '#ddd',
    editorBackgroundColor: '#fff',
    buttonBackground: '#f0f0f0',
    buttonTextColor: '#000',
    previewBackgroundColor: '#fff',
    previewBorderColor: '#ddd',
  };

  useDynamicStyles(theme, markdownText, htmlContent, selectedFile);
  const currentStyles = theme === 'dark' ? darkModeStyles : lightModeStyles;

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileContent = event.target?.result as string;
        setMarkdownText(fileContent);
      };
      reader.readAsText(selectedFile);
      const fileNameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(fileNameWithoutExtension);
    }
  }, [selectedFile]);

  return (
    <div className="section-editMarker-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, padding: '20px' }}>

      {/* Editeur Markdown, seulement visible si aucun fichier n'est uploadé */}
      {!selectedFile && (
        <MdEditor
          value={markdownText}
          style={{
            display: 'flex',
            flex: 1
          }}
          renderHTML={(text) => marked(text)}
          onChange={handleEditorChange}
        />
      )}

      {/* {selectedFile && (
        <div>
          <p>Fichier sélectionné : {selectedFile.name}</p>
          <button onClick={handleRemoveFile}>Supprimer le fichier</button>
          <div
            style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: currentStyles.previewBackgroundColor,
              border: `1px solid ${currentStyles.previewBorderColor}`,
              color: currentStyles.color,
            }}
          >
            <h2 style={{ color: currentStyles.color }}>Preview</h2>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div> */}

      {selectedFile && (
        <div>
          <p>Fichier sélectionné : {selectedFile.name}</p>
          <button onClick={handleRemoveFile}>Supprimer le fichier</button>
          <h2 style={{ color: currentStyles.color }}>Preview</h2>
          <MdEditor
            value={markdownText}
            renderHTML={(text) => marked(text)}
            onChange={handleEditorChange}
            style={{
              display: 'flex',
              flex: 1
            }}
          />
        </div>
      )}



      {/* </div>
      )} */}

      <button
        style={{
          position: 'absolute',
          right: '20px',
          top: '0',
          marginTop: '20px',
          padding: '10px 20px',
          cursor: 'pointer',
          width: '180px',
        }}
        onClick={handleDownload}
        disabled={markdownText.trim() === ''}
      >
        Télécharger en .md
      </button>

      <div style={{
        position: 'absolute', right: '200px',
        top: '0',
        marginTop: '20px',
      }}>
        <button
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
          }}
          onClick={() => document.getElementById('fileUpload')?.click()}
        >
          Uploader un fichier .md
        </button>

        <input
          id="fileUpload"
          type="file"
          accept=".md"
          onChange={handleFileUpload}
          style={{
            opacity: 0,
            position: 'absolute',
            zIndex: -1,
            width: '0px',
            height: '0px'
          }}
        />
      </div>

      <button
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: theme === 'dark' ? '#444' : '#f0f0f0',
          color: theme === 'dark' ? '#fff' : '#000',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
        onClick={handleSubmit}
      >
        {id ? 'Modifier l\'annonce' : 'Ajouter l\'annonce'}
      </button>
    </div>
  );
}

export default EditMarkdown;
