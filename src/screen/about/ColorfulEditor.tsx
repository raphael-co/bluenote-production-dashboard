import React, { useState } from "react";
import { convertToRaw, EditorState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "draft-js/dist/Draft.css";

const MyEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  return (
    <div className="App">
      <header className="App-header">Rich Text Editor Example</header>
      <Editor
  editorState={editorState}
  onEditorStateChange={setEditorState}
  wrapperClassName="wrapper-class"
  editorClassName="editor-class"
  toolbarClassName="toolbar-class"
  toolbar={{
    options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'link', 'emoji', 'image'],
    inline: { options: ['bold', 'italic', 'underline', 'strikethrough'] },
    list: { options: ['unordered', 'ordered'] },
    textAlign: { options: ['left', 'center', 'right'] },
  }}
/>
      {/* <div className="code-view">
        <p>HTML View </p>
        <textarea
          className="text-area"
          disabled
          value={draftToHtml(convertToRaw(editorState.getCurrentContent()))}
        />
      </div> */}
    </div>
  );
};

export default MyEditor;
