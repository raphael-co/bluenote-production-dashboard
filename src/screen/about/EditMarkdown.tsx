import React, { useEffect, useState } from 'react';
import MdEditor, { PluginComponent } from 'react-markdown-editor-lite';
import { marked } from 'marked';
import 'react-markdown-editor-lite/lib/index.css';
import { useTheme } from '../../context/ThemeContext';
import '../../screen/annoncement/annoncement.css';
import { SketchPicker } from 'react-color';

interface EditMarkdownProps {
  onMarkdownChange: (markdown: string) => void;
}

// Plugin personnalisé pour gérer la couleur du texte
class ColorTextPlugin extends PluginComponent {
  static pluginName = 'color-text';
  static align = 'left';

  state = {
    showColorPicker: false,
    color: '#FF0000', // Couleur par défaut
  };

  toggleColorPicker = () => {
    this.setState({ showColorPicker: !this.state.showColorPicker }, () => {
      // Si la palette est ouverte, on applique la couleur courante
      if (this.state.showColorPicker) {
        this.applyColor();
      }
    });
  };

  handleColorChange = (color: any) => {
    this.setState({ color: color.hex }, () => {
      this.applyColor();
    });
  };

  applyColor = () => {
    const editor = this.editor;
    const { color } = this.state;
    const selection = editor.getSelection();
    let selectedText = selection ? selection.text : '';

    // Utilisation de la syntaxe HTML pour appliquer la couleur
    const before = editor.getMdValue().slice(0, selection.start);
    const after = editor.getMdValue().slice(selection.end);

    // Si du texte est sélectionné, on l'entoure avec une balise span
    if (selectedText) {
      const coloredText = `<span style="color:${color}">${selectedText}</span>`;
      editor.setText(`${before}${coloredText}${after}`);
      // Rétablir la sélection
      editor.setSelection({
        start: selection.start,
        end: selection.start + coloredText.length,
      });
    } else {
      // Si aucun texte n'est sélectionné, on insère une balise span vide
      const coloredText = `<span style="color:${color}"></span>`;
      editor.setText(`${before}${coloredText}${after}`);
      // Placer le curseur à l'intérieur de la balise span
      editor.setSelection({
        start: selection.start + coloredText.length - 7, // Position après l'ouverture de la balise
        end: selection.start + coloredText.length - 7,
      });
    }
  };

  render() {
    return (
      <span className="button button-type-color-text" title="Texte coloré">
        <span onClick={this.toggleColorPicker} style={{ cursor: 'pointer', color: this.state.color }}>A</span>
        {this.state.showColorPicker && (
          <div style={{ position: 'absolute', zIndex: 2 }}>
            <SketchPicker color={this.state.color} onChange={this.handleColorChange} />
          </div>
        )}
      </span>
    );
  }
}

// Enregistrement du plugin dans l'éditeur
MdEditor.use(ColorTextPlugin);

const EditMarkdown: React.FC<EditMarkdownProps> = ({ onMarkdownChange }) => {
  const [markdownText, setMarkdownText] = useState('');
  const [htmlContent, setHtmlContent] = useState<any>('');
  const { theme } = useTheme();

  useEffect(() => {
    onMarkdownChange(markdownText);
    setHtmlContent(marked.parse(markdownText));
  }, [markdownText, onMarkdownChange]);

  const handleEditorChange = ({ text }: any) => {
    setMarkdownText(text);
  };

  return (
    <div
      className="section-editMarker-container"
      style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
    >
      <MdEditor
        value={markdownText}
        style={{ display: 'flex', flex: 1, minHeight: '200px' }}
        renderHTML={(text) => marked.parse(text)}
        onChange={handleEditorChange}
        config={{
          view: { menu: true, md: true, html: true },
          shortcuts: false,
          // Ajout du plugin "color-text" à la barre d'outils
          plugins: ['color-text'],
          toolbar: [
            'bold',
            'italic',
            'underline',
            '|',
            'color-text',
            '|',
            'preview',
          ],
        }}
      />
    </div>
  );
};

export default EditMarkdown;
