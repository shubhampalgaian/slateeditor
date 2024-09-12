import { create } from 'xmlbuilder2';

// Helper function to create a title
function createTitle(block) {
  return { title: { '#text': block.children[0].text || block.default || 'Untitled Title' } };
}

// Helper function to create a paragraph
function createParagraph(block) {
  return { p: { '#text': block.children[0].text || block.default || '' } };
}

// Recursive function to traverse the JSON structure and append elements to the XML
function processJsonBlock(xml, block) {
  switch (block.type) {
    case 'topic':
      const topic = xml.ele('topic', { id: 'something', xmlns: 'http://dita.oasis-open.org/architecture/2005/' });
      block.children?.forEach(child => processJsonBlock(topic, child));
      break;
    case 'title':
      xml.ele(createTitle(block));
      break;
    case 'body':
      const body = xml.ele('body');
      block.children?.forEach(child => processJsonBlock(body, child));
      break;
    case 'paragraph':
      xml.ele(createParagraph(block));
      break;
    // Add additional DITA constructs here (e.g., 'section', 'table', 'list', etc.)
    default:
      console.log(`Unsupported block type: ${block.type}`);
  }
}

// Main function to convert JSON to DITA XML
export function convertJsonToDita(jsonData) {
  // Create the root XML document
  const ditaXml = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('root'); // You need a root node to wrap the whole document

  // Traverse the entire JSON data structure recursively
  jsonData.forEach(block => processJsonBlock(ditaXml, block));

  // Return the final XML string
  return ditaXml.end({ prettyPrint: true });
}
