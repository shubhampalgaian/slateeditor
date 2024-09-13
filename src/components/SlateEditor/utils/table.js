import { Transforms, Editor, Range, Element } from 'slate';

export class TableUtil {
  constructor(editor) {
    this.editor = editor;
  }

  insertTable = (rows, columns) => {
    if (!rows || !columns) return;

    const cellText = Array.from({ length: rows }, () => Array.from({ length: columns }, () => ""));
    const newTable = createTableNode(cellText);

    Transforms.insertNodes(this.editor, newTable, { mode: 'highest' });
  };

  insertCells = (tableNode, path, action) => {
    console.log("inside cells")
    let existingText = Array.from(tableNode.children, (row) => 
      Array.from(row.children, (cell) => cell.children[0].text || '')
    );
    const columns = existingText[0].length;

    if (action === 'row') {
      existingText.push(Array(columns).fill(""));
    } else if (action === 'column') {
      existingText = existingText.map(row => [...row, ""]);
    }

    const newTable = createTableNode(existingText);
    Transforms.removeNodes(this.editor, { at: path });
    Transforms.insertNodes(this.editor, newTable, { at: path });
    Transforms.insertNodes(this.editor,{type:'paragraph',children:[{text:"dd"}]},{at: path})
  };

  removeTable = () => {
    Transforms.removeNodes(this.editor, {
      match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'table',
      mode: 'highest'
    });
  };

  insertRow = () => {
    const { selection } = this.editor;
    if (selection && Range.isCollapsed(selection)) {
      const [tableNode, path] = Array.from(Editor.nodes(this.editor, {
        match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'table',
      }))[0];

      if (tableNode) {
        this.insertCells(tableNode, path, 'row');
      }
    }
  };

  insertColumn = () => {
    const { selection } = this.editor;
    if (selection && Range.isCollapsed(selection)) {
      const [tableNode, path] = Array.from(Editor.nodes(this.editor, {
        match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'table',
      }))[0];

      if (tableNode) {
        this.insertCells(tableNode, path, 'column');
      }
    }
  };
}

const createRow = (cellText) => {
  const newRow = Array.from(cellText, (value) => createTableCell(value));
  return {
    type: 'table-row',
    children: newRow
  };
}

export const createTableCell = (text) => {
  return {
    type: 'table-cell',
    children: [{
      type: 'paragraph',
      children: [{ text }]
    }]
  };
}

const createTableNode = (cellText) => {
  const tableChildren = Array.from(cellText, (value) => createRow(value));
  let tableNode = { type: 'table', children: tableChildren };
  return tableNode;
}
