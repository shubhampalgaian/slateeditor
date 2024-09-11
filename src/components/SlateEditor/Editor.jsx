import React, { useCallback, useMemo, useState } from "react";
import { createEditor } from "slate";
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

  switch (element.type) {
    case "headingOne":
      return (
        <h1 {...attributes} {...element.attr}>
          {children}
        </h1>
      );
    case "headingTwo":
      return (
        <h2 {...attributes} {...element.attr}>
          {children}
        </h2>
      );
    case "headingThree":
      return (
        <h3 {...attributes} {...element.attr}>
          {children}
        </h3>
      );
    case "blockquote":
      return (
        <blockquote {...attributes} {...element.attr}>
          {children}
        </blockquote>
      );
    case "alignLeft":
      return (
        <div
          style={{ listStylePosition: "inside" }}
          {...attributes}
          {...element.attr}
        >
          {children}
        </div>
      );
    case "alignCenter":
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            listStylePosition: "inside",
          }}
          {...attributes}
          {...element.attr}
        >
          {children}
        </div>
      );
    case "alignRight":
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            listStylePosition: "inside",
          }}
          {...attributes}
          {...element.attr}
        >
          {children}
        </div>
      );
    case "list-item":
      return (
        <li {...attributes} {...element.attr}>
          {children}
        </li>
      );
    case "orderedList":
      return (
        <ol type="1" {...attributes}>
          {children}
        </ol>
      );
    case "unorderedList":
      return <ul {...attributes}>{children}</ul>;
    case "link":
      return <Link {...props} />;

    case "table":
      return (
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case "table-row":
      return <tr {...attributes}>{children}</tr>;
    case "table-cell":
      return (
        <td {...element.attr} {...attributes}>
          {children}
        </td>
      );
    case "image":
      return <Image {...props} />;
    case "video":
      return <Video {...props} />;
    case "equation":
      return <Equation {...props} />;
    case "section":
      return (
        <div {...attributes} className="relative-section">
          {element.children.map((child, index) => {
            const hasPlaceholder = child.children[0]?.text === "" && child.children[0]?.placeholder;
    
            return (
              <div key={index} style={{ position: 'relative' }}>
                {hasPlaceholder ? (
                  <div
                    contentEditable={false}
                    className="placeholder"
                  >
                    {child.default}
                  </div>
                ) : null}    
                {children[index]}
              </div>
            );
          })}
        </div>
      );
      
    default:
      return (
        <div {...element.attr} {...attributes}>
          {children}
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
          placeholder="Write something"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
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
