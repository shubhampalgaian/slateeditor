import { Transforms, Node, Editor } from 'slate';

// Helper function to check if the editor is in placeholder mode
const isPlaceholder = (editor, node) => {
  return Node.has(editor, node.path) && Node.string(node) === 'Section Title';
};

const withPlaceholder = (editor) => {
  const { apply } = editor;

  editor.apply = (operation) => {
    // Clear placeholder text when the user starts typing
    if (
      operation.type === 'insert_text' &&
      isPlaceholder(editor, operation.node)
    ) {
      Transforms.delete(editor, { at: editor.selection });
    }
    apply(operation);
  };

  return editor;
};

export default withPlaceholder;
