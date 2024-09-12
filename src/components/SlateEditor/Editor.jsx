import React, { useCallback, useMemo, useState } from "react";
import { Transforms, createEditor } from "slate";
import { withHistory } from "slate-history";
import { Slate, Editable, withReact } from "slate-react";
import Toolbar from "./Toolbar/Toolbar";
import { sizeMap, fontFamilyMap } from "./utils/SlateUtilityFunctions.js";
import withLinks from "./plugins/withLinks.js";
import withTables from "./plugins/withTable.js";
import withEmbeds from "./plugins/withEmbeds.js";
import withEquation from "./plugins/withEquation.js";
import "./Editor.css";
import Link from "./Elements/Link/Link";
import Image from "./Elements/Image/Image";
import Video from "./Elements/Video/Video";
import Equation from "./Elements/Equation/Equation";
import { InlineMath, BlockMath } from "react-katex";
import { convertJsonToDita } from "../../utils/xmlConversionUtils.js";

const Element = (props) => {
  const { attributes, children, element } = props;
  let childIndex = 0;

  const renderChildren = (childElements) => {
    return childElements.map((child, index) => {
      // Recursively render nested children if type is "body"
      if (child.type === "body" && child.children) {
        return renderChildren(child.children);
      }

      const hasPlaceholder = child.children?.[0]?.text === "" && child.children?.[0]?.placeholder;
      const currentChild = children[childIndex++];

      return (
        <div key={index} style={{ position: "relative" }}>
          {hasPlaceholder && (
            <div contentEditable={false} className="placeholder">
              {child.default}
            </div>
          )}
          {currentChild}
        </div>
      );
    });
  };

  const commonRender = (Tag) => (
    <Tag
      {...attributes}
      {...element.attr}
      data-type={element.type}
    >
      {children}
    </Tag>
  );

  switch (element.type) {
    case "headingOne":
      return commonRender("h1");
    case "headingTwo":
      return commonRender("h2");
    case "headingThree":
      return commonRender("h3");
    case "blockquote":
      return commonRender("blockquote");
    case "alignLeft":
      return (
        <div
          style={{ listStylePosition: "inside" }}
          {...attributes}
          {...element.attr}
          data-type={element.type}
        >
          {children}
        </div>
      );
    case "alignCenter":
    case "alignRight":
      const justifyContent = element.type === "alignCenter" ? "center" : "flex-end";
      return (
        <div
          style={{ display: "flex", justifyContent, listStylePosition: "inside" }}
          {...attributes}
          {...element.attr}
          data-type={element.type}
        >
          {children}
        </div>
      );
    case "list-item":
      return commonRender("li");
    case "orderedList":
      return (
        <ol type="1" {...attributes} data-type={element.type}>
          {children}
        </ol>
      );
    case "unorderedList":
      return (
        <ul {...attributes} data-type={element.type}>
          {children}
        </ul>
      );
    case "link":
      return <Link {...props} data-type={element.type} />;
    case "table":
      return (
        <table data-type={element.type}>
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case "table-row":
      return (
        <tr {...attributes} data-type={element.type}>
          {children}
        </tr>
      );
    case "table-cell":
      return (
        <td {...element.attr} {...attributes} data-type={element.type}>
          {children}
        </td>
      );
    case "image":
      return <Image {...props} data-type={element.type} />;
    case "video":
      return <Video {...props} data-type={element.type} />;
    case "equation":
      return <Equation {...props} data-type={element.type} />;
    case "section":
    case "topic":
      return (
        <div {...attributes} data-type={element.type}>
          {renderChildren(element.children)}
        </div>
      );
    default:
      return (
        <div {...element.attr} {...attributes} data-type={element.type}>
          {element.children.map((child, index) => {
            const hasPlaceholder = child.text === "" && child.placeholder;

            return (
              <div key={index} style={{ position: "relative" }}>
                {hasPlaceholder && (
                  <div contentEditable={false} className="placeholder">
                    {child.default}
                  </div>
                )}
                {children[index]}
              </div>
            );
          })}
        </div>
      );
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.strikethrough) {
    children = (
      <span style={{ textDecoration: "line-through" }}>{children}</span>
    );
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  if (leaf.superscript) {
    children = <sup>{children}</sup>;
  }
  if (leaf.subscript) {
    children = <sub>{children}</sub>;
  }
  if (leaf.color) {
    children = <span style={{ color: leaf.color }}>{children}</span>;
  }
  if (leaf.bgColor) {
    children = (
      <span style={{ backgroundColor: leaf.bgColor }}>{children}</span>
    );
  }
  if (leaf.fontSize) {
    const size = sizeMap[leaf.fontSize];
    children = <span style={{ fontSize: size }}>{children}</span>;
  }
  if (leaf.fontFamily) {
    const family = fontFamilyMap[leaf.fontFamily];
    children = <span style={{ fontFamily: family }}>{children}</span>;
  }
  return <span {...attributes}>{children}</span>;
};
const SlateEditor = () => {
  const editor = useMemo(
    () =>
      withEquation(
        withHistory(
          withEmbeds(withTables(withLinks(withReact(createEditor()))))
        )
      ),
    []
  );

  const [value, setValue] = useState([
    {
      type: "paragaph",
      children: [{ text: "as it is", placeholder: true, default: 'p' }],
      default: 'p'
    },
  ]);

  const [ditaXml, setDitaXml] = useState("");
  const [xmlView, setXMLView] = useState(false);
  const renderElement = useCallback((props) => <Element {...props} />, []);

  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  const handleEditorUpdate = (nv) => {
    setValue(nv);
    console.log("Updated new value : ", nv);
  };

  const downloadDataset = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = "slate_data.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const showXmlPart = () => {
    const xml = convertJsonToDita(value);
    setDitaXml(xml); 
    setXMLView(true);
  };

  const closeEditor = () => {
    setXMLView(false);
  }

  return (
    <>
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => handleEditorUpdate(newValue)}
    >
      <Toolbar />
      <div
        className="editor-wrapper"
        style={{ border: "1px solid #f3f3f3", padding: "0 10px" }}
      >
        <Editable
          // placeholder="Write something"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              Transforms.insertNodes(editor, {
                type: 'paragraph',
                children: [{ text: '', placeholder: true, default: 'p' }
                ]
              })
              return;
            }
          }}
        />
      </div>
    </Slate>

    <div className="xml-editor" style={{
      display: xmlView ? 'flex' : 'none',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'black',      
      zIndex: 55,
      overflow: 'hidden'
    }}>
      <button onClick={closeEditor} style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        padding: '1rem'
      }}>x</button>

      <div>
      {ditaXml && (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#f4f4f4",
            padding: "10px",
            marginTop: "10px",
            border: "1px solid #ddd",
          }}
        >
          {ditaXml}
        </pre>
      )}</div>
    </div>

    <button onClick={downloadDataset} style={{ marginTop: "10px" }}>
      Download Dataset
    </button>
    <span>|</span>
    <button onClick={showXmlPart} style={{ marginTop: "10px" }}>
      Show XML Part
    </button>
    </>
  );
};

export default SlateEditor;
