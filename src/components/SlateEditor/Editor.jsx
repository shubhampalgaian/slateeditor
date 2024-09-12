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
      if (child.type === "body" && child.children) {
        return renderChildren(child.children);
      }

      const hasPlaceholder = child.children[0]?.text === "" && child.children[0]?.placeholder;

      const currentChild = children[childIndex];
      childIndex++;

      return (
        <div key={index} style={{ position: "relative" }}>
          {hasPlaceholder ? (
            <div contentEditable={false} className="placeholder">
              {child.default}
            </div>
          ) : null}
          {currentChild}
          {console.log(currentChild, " <<<<<<<<<<<<<<<<")}
        </div>
      );
    });
  };

  switch (element.type) {
    case "section":
      return <div {...attributes}>{renderChildren(element.children)}</div>;
    case "topic":
      return <div {...attributes}>{renderChildren(element.children)}</div>;
    default:
      return (
        <div {...element.attr} {...attributes}>
          {element.children.map((child, index) => {
            const hasPlaceholder = child.text === "" && child.placeholder;
            return (
              <div key={index} style={{ position: "relative" }}>
                {hasPlaceholder ? (
                  <div contentEditable={false} className="placeholder">
                    {child.default}
                  </div>
                ) : null}
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
      type: "paragraph",
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
                children: [{ text: '', bold: true, placeholder: true, default: 'p' }
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
