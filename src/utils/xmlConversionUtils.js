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
function processJsonBlock(xml, block, parentTopic = null) {
  switch (block.type) {
    case 'topic':
      // Determine whether to create a new topic or reuse the parent one
      const topic = parentTopic ? parentTopic.ele('topic', { id: block.id || 'something', xmlns: 'http://dita.oasis-open.org/architecture/2005/' }) : xml.ele('topic', { id: block.id || 'something', xmlns: 'http://dita.oasis-open.org/architecture/2005/' });

      // Process children
      let hasBody = false;
      block.children?.forEach(child => {
        if (child.type === 'body') {
          hasBody = true;
          const body = topic.ele('body');
          child.children.forEach(bodyChild => processJsonBlock(body, bodyChild, topic));
        } else if (child.type === 'topic') {
          // Process nested topic at the correct level
          processJsonBlock(parentTopic || xml, child);
        } else {
          processJsonBlock(topic, child, topic);
        }
      });

      if (!hasBody) {
        topic.ele('body');
      }
      break;
    case 'title':
      xml.ele(createTitle(block));
      break;
    case 'body':
      const bodyNode = xml.ele('body');
      block.children?.forEach(child => processJsonBlock(bodyNode, child, null));
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
  // Create the root XML document only once
  const ditaXml = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('root', { id: 'root_topic' });

  // Process each block in the JSON
  jsonData.forEach(block => processJsonBlock(ditaXml, block, ditaXml));

  // Return the final XML string
  return ditaXml.end({ prettyPrint: true });
}
