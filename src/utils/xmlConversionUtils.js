import { create } from 'xmlbuilder2';

// Function to create paragraphs
function createParagraph(paragraphData) {
  const p = { p: [] };
  paragraphData.children.forEach((child) => {
    if (child.bgColor || child.color) {
      p.p.push({
        ph: {
          '@props': `background-color: ${child.bgColor}; color: ${child.color}`,
          '#': child.text || "",
        },
      });
    } else {
      p.p.push({ '#': child.text || "" });
    }
  });
  return p;
}

// Function to create table structure
function createTable(tableData) {
  const tgroup = {
    tgroup: {
      '@cols': tableData.children[0].children.length,
      thead: { row: [] },
      tbody: { row: [] },
    },
  };

  // Process rows
  tableData.children.forEach((row, index) => {
    const rowElement = { row: { entry: [] } };
    row.children.forEach((cell) => {
      rowElement.row.entry.push({ p: cell.children[0].children[0].text || "" });
    });

    if (index === 0) {
      // First row goes to thead
      tgroup.tgroup.thead.row.push(rowElement.row);
    } else {
      // Other rows go to tbody
      tgroup.tgroup.tbody.row.push(rowElement.row);
    }
  });

  return { table: tgroup };
}

// Function to create lists (ordered or unordered)
function createList(listData) {
  const list = listData.ordered ? { ol: { li: [] } } : { ul: { li: [] } };

  listData.children.forEach((item) => {
    list[listData.ordered ? 'ol' : 'ul'].li.push({ p: item.text || "" });
  });

  return list;
}

// Function to create notes
function createNote(noteData) {
  return { note: { p: noteData.text || "" } };
}

// Function to create figures
function createFigure(figureData) {
  const figure = { figure: { title: figureData.title, image: { '@href': figureData.src } } };
  return figure;
}

// Main function to convert JSON to DITA XML
export function convertJsonToDita(jsonData) {
  console.log('json data in convert function', jsonData);
  const topic = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('topic', { id: 'extended-dita-topic', xmlns: 'http://dita.oasis-open.org/architecture/2005/' })
    .ele('title').txt('Extended DITA Test').up()  // Adding the title
    .ele('body');

  // Iterate over the JSON data and append elements
  jsonData.forEach((block) => {
    switch (block.type) {
      case 'paragraph':
        topic.ele(createParagraph(block));
        break;
      case 'table':
        topic.ele(createTable(block));
        break;
      case 'list':
        topic.ele(createList(block));
        break;
      case 'note':
        topic.ele(createNote(block));
        break;
      case 'figure':
        topic.ele(createFigure(block));
        break;
      default:
        console.log(`Unsupported block type: ${block.type}`);
    }
  });

  return topic.end({ prettyPrint: true });
}
