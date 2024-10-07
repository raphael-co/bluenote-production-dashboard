import React, { useState, useEffect } from 'react';
import MdEditor from 'react-markdown-editor-lite';
import { marked } from 'marked';
import 'react-markdown-editor-lite/lib/index.css';
import '../documentation.css';
import axios from 'axios';
import { useDynamicStyles } from './useDynamicStyles';
import { useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import EditOffIcon from '@mui/icons-material/EditOff';

function EditMarkdown() {
  const [markdownText, setMarkdownText] = useState('');
  const [htmlContent, setHtmlContent] = useState<any>('');
  const { token, handleReloadDrawerDoc } = useAuth();
  const [title, setTitle] = useState('');
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [titleUrl, setTitleUrl] = useState<string | null>(null)

  const [idDoc, setIdDoc] = useState<number | null>(null);

  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditMode = () => {
    setIsEditMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newTitleUrl = params.get('title');
    setTitleUrl(newTitleUrl);
  }, [location.search]);

  useEffect(() => {
    if (titleUrl && token) {
      const fetchAnnouncement = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/documentation/title/${titleUrl}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const announcementData = response.data;

          // Mettre à jour le titre
          setTitle(announcementData.title);
          setIdDoc(announcementData.id);
          // Utiliser TextDecoder pour décoder le contenu en Markdown
          const decoder = new TextDecoder('utf-8');
          const markdownContent = decoder.decode(new Uint8Array(announcementData.content.data));
          setMarkdownText(markdownContent);
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'annonce :', error);
        }
      };

      fetchAnnouncement();
    } else {
      setTitle('');
      setMarkdownText('');
      setIdDoc(null);
      setHtmlContent('');
      setIsEditMode(false);
    }
  }, [titleUrl, token]);



  // window.addEventListener('scroll', () => {
  //   const headerElement = document.querySelector('.MuiAppBar-root') as HTMLElement;
  //   const customHead = document.querySelector('.rc-md-editor .rc-md-navigation') as HTMLElement;
  //   const editor = document.querySelector('.rc-md-editor') as HTMLElement;

  //   if (headerElement && customHead && editor) {

  //     // Obtenir la position du header par rapport à la page
  //     const headerRect = headerElement.getBoundingClientRect();
  //     const customHeadRect = customHead.getBoundingClientRect();
  //     const editorRect = editor.getBoundingClientRect();
  //     let isFixed = false;
  //     // Si customHead touche le header (ou dépasse), on le rend fixe
  //     if (customHeadRect.top <= headerRect.bottom && editorRect.top < headerRect.bottom && !isFixed) {
  //       customHead.style.position = 'fixed';
  //       customHead.style.top = headerRect.height + 'px'; // Positionner juste en dessous du header
  //       customHead.style.zIndex = '999';
  //       if (collapsed) {
  //         customHead.style.width = 'calc(100% - ' + (collapsedDrawerWidth + 43) + 'px)';

  //       } else {
  //         customHead.style.width = 'calc(100% - ' + (drawerWidth + 43) + 'px)';
  //       }

  //       isFixed = true
  //     } else if (customHeadRect.top >= headerRect.bottom && editorRect.top > headerRect.bottom ) {

  //       // Si on scrolle en haut et que customHead n'a pas encore touché le header
  //       customHead.style.position = 'relative'; // Remettre à la position d'origine
  //       customHead.style.top = 'auto'; // Reset
  //         customHead.style.width = '';
  //         customHead.style.maxWidth = '100%';

  //         isFixed = false

  //     }
  //   }
  // });

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
    setIsEditMode(true);
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
    formData.append('documentationFile', markdownBlob, 'document.md');
    formData.append('title', title); // Titre

    try {
      let response;

      if (titleUrl && token && idDoc) {
        // Si l'id est présent, effectuer une requête PUT pour mettre à jour l'annonce
        response = await axios.put(`${process.env.REACT_APP_API_URL}/documentation/update/${idDoc}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });
      } else {
        // Si aucun id n'est présent, créer une nouvelle annonce avec POST
        response = await axios.post(`${process.env.REACT_APP_API_URL}/documentation/add`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar(response.data.message, { variant: 'success' });
        setTitleUrl(title);
        handleReloadDrawerDoc();
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'annonce :', error);

      if (axios.isAxiosError(error)) {
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
    iconColorActive: '#bb86fc',
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
    iconColorActive: '#008dff',

  };


  useDynamicStyles(markdownText, htmlContent, selectedFile, isEditMode);
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

  useEffect(() => {
    setMarkdownText((prevMarkdownText) => prevMarkdownText);
  }, [isEditMode]);

  return (
    <div className="section-editMarker-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, padding: '20px 20px 0px 20px' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h1>{titleUrl ? titleUrl : 'Nouvelle documentation'}</h1>
        {titleUrl && (isEditMode ? <EditOffIcon onClick={toggleEditMode} style={{ cursor: 'pointer', color: 'red' }} /> : <ModeEditIcon onClick={toggleEditMode} style={{ cursor: 'pointer', color: currentStyles.iconColorActive }} />)}
      </div>

      {(isEditMode && titleUrl) || !titleUrl ? (
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={theme === 'dark' ? { backgroundColor: '#282828', color: '#fff' } : { backgroundColor: '#fff', color: '#000' }}
        />) : null}

      {!selectedFile && (
        <MdEditor
          key={(isEditMode && titleUrl) || !titleUrl ? 'edit-mode' : 'read-only-mode'}
          value={markdownText}
          style={{
            display: 'flex',
            flex: 1,
            transition: 'height 0.3s ease',
            height: isEditMode ? 'calc(100vh - 230px)' : 'calc(100vh - 190px)',
            maxHeight: isEditMode ? 'calc(100vh - 230px)' : 'calc(100vh - 190px)'
          }}
          view={{
            menu: (isEditMode && titleUrl !== null) || titleUrl === null,
            md: (isEditMode && titleUrl !== null) || titleUrl === null,
            html: true
          }}
          renderHTML={(text) => marked(text)}
          onChange={handleEditorChange}
        />
      )}

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
              flex: 1,
              maxHeight: isEditMode ? 'calc(100vh - 90px)' : 'calc(100vh - 90px)'
            }}
          />
        </div>
      )}

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

      {(isEditMode && titleUrl) || !titleUrl || isEditMode ? (
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
      ) : null}



      {/* {(isEditMode && titleUrl) || !titleUrl ? (
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
          {titleUrl ? 'Modifier l\'annonce' : 'Ajouter l\'annonce'}
        </button>
      ) : null
      } */}

      {(isEditMode && titleUrl) || !titleUrl || isEditMode ? (
        <button
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: theme === 'dark' ? '#444' : '#f0f0f0',
            color: theme === 'dark' ? '#fff' : '#000',
            border: '1px solid #ccc',
            cursor: 'pointer',
          }}
          onClick={handleSubmit}
        >
          {titleUrl ? 'Modifier l\'annonce' : 'Ajouter l\'annonce'}
        </button>
      ) : null
      }
      {/* <button
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
        {titleUrl ? 'Modifier l\'annonce' : 'Ajouter l\'annonce'}
      </button> */}
    </div>
  );
}

export default EditMarkdown;
