// @flow
/**
 * Editable content area for rich text formatting that converts the formatted
 * text into a JSON representation of the text.
 */
import * as React from "react";
import ContentEditable from "react-contenteditable";
import JSONPretty from "react-json-pretty";
import ReactHtmlParser from "react-html-parser";
import styled from "styled-components";

import Colors from "./constants/colors";
import Spacing from "./constants/spacing";

const parseNodes = (nodes, baseStyle = "normal") => {
    let parsed = [];

    for (const node of nodes) {
        const { attribs, children, data, name } = node;
        console.log(node)
    
        if (!name) {
            parsed = parsed.concat({
                style: baseStyle,
                content: data,
            });
        } else if (name === "b") {
            parsed = parsed.concat(
                parseNodes(
                    children,
                    baseStyle === "italic" ? "bold-italic" : "bold"
                )
            );
        } else if (name === "i") {
            parsed = parsed.concat(
                parseNodes(
                    children,
                    baseStyle === "bold" ? "bold-italic" : "italic"
                )
            );
        } else  {
            //by removing the span requirement we can account for all other tags to keep
            //Titles (h1 h2 etc) are currently unhandled because I was unsure how to definitively recognize them
            //if we wanted, we could add logic to recognize them as bold automatically 
            //the application from breaking the parsed chain when unidentified text
            //is used. Otherwise when an H2 or other type of tag is read, the application no longer
            //accepts input after the text is rendered. 

            const TextFromGoogleDocs = node.attribs.id ? node.attribs.id.includes('docs') : false
            
            //check to see if the text is from Google docs as the nodesd are defined differently
            //namely, the node's attribs value is an ID for the google doc. 
            //we need to determine on the first pass of the function if the node is of google docs origin
            //and if so, we know to look for its font properties pertainning to italics and boldness 
            
         
            if(TextFromGoogleDocs){
                // console.log("google node:", node)
                // console.log("in the google logic")
           
                const styleForBold = node.children[0].attribs.style
                const styleForItalics =  node.children[0].children[0].parent.attribs.style
                
                const BoldStartIndex = styleForBold.indexOf('font-weight: ')
                const fontWeight = styleForBold.slice(BoldStartIndex+13, BoldStartIndex+16)
               
                const isGoogleFontBold = Number(fontWeight) > 599 ? true : false
                const isGoogleFontItalic = styleForItalics.includes("italic")

                //we can search the two differnt style properties for boldness and italics and then
                //continue on with the recursive calls. After the data is first logged,
                //the nodes will be defined in manor with the text organically generated in the editor
                //see line 96
              
                 if(isGoogleFontItalic, !isGoogleFontBold){

                    parsed = parsed.concat(parseNodes(children, "italic"))

                } else if (!isGoogleFontItalic && isGoogleFontBold){

                    parsed = parsed.concat(parseNodes(children, "bold"))

                }
                 else if (isGoogleFontItalic && isGoogleFontBold) {

                    parsed = parsed.concat(parseNodes(children, "bold-italic"))
                
                } else {

                 parsed = parsed.concat(parseNodes(children, "normal"))

                }
         } else {
      
                const { style } = attribs
                if(style){
                    //here we check to see if the text was organically created in the editor 
                    //The google nodes once parsed through the above code will now be interpretted correctly
                    //by the below logic. 
                    //We can now properly chian the nodes and ensure that entered text does not break the "parsed" chain 
                    //esnuring that anything pasted from any source will be logged 
                    
                    const isItalic = !!style.match(/italic/);
                    //after parsing google Doc nodes, regex for weight check no longer working, 
                    //needed to manually grab the actual value by slicing through the "style" string
                    const BoldStartIndex = style.indexOf('font-weight: ')
                    const fontWeight = style.slice(BoldStartIndex+13, BoldStartIndex+16)
                    const isBold = Number(fontWeight) > 599 ? true : false
      
                    console.log(isBold)

                    if (isItalic && !isBold) {
                        parsed = parsed.concat(parseNodes(children, "italic"));
                    } else if (!isItalic && isBold) {
                        parsed = parsed.concat(parseNodes(children, "bold"));
                    } else if (isItalic && isBold) {
                        parsed = parsed.concat(parseNodes(children, "bold-italic"));
                    } else {
                        parsed = parsed.concat(parseNodes(children, "normal"));
                    }
                
                } else {
                    //catch for the nodes that do not have a style
                    //if the node does not have style values it will adhere to the styling of its parents
                    //or defualt to normal 
                    if (baseStyle === "italic") {
                        parsed = parsed.concat(parseNodes(children, "italic"));
                    } else if (baseStyle === "bold") {
                        parsed = parsed.concat(parseNodes(children, "bold"));
                    } else if (baseStyle === "bold-italic") {
                        parsed = parsed.concat(parseNodes(children, "bold-italic"));
                    } else {
                        parsed = parsed.concat(parseNodes(children, "normal"));
                    }

                }

            }
        }
        
    }
    return parsed;
};

const parseHtml = (html) =>
    ReactHtmlParser(html, {
        transform: (node, i) => {
            const { children, name, parent } = node;
            if (!parent && name === "div") {
                const parsed = parseNodes(children);
                return parsed.length > 0
                    ? {
                          content: parsed,
                      }
                    : null;
            } else {
                return null;
            }
        },
    }).filter((node) => !!node);

const App = () => {
    const [html, setHtml] = React.useState("<div>Edit text here.</div>");
    const [parsed, setParsed] = React.useState(parseHtml(html));

    const handleChange = (e) => {
        setHtml(e.target.value);
    };

    React.useEffect(() => {
        const parsedHtml = parseHtml(html);
        setParsed(parsedHtml);
    }, [html]);

    return (
        <Wrapper>
            <ContentEditable
                html={html}
                onChange={handleChange}
                style={{
                    flex: 1,
                    maxWidth: "50vw",
                    fontSize: "17px",
                    fontFamily: "sans-serif",
                    fontWeight: 300,
                    lineHeight: "24px",
                    height: "100vh",
                    borderRight: `1px solid ${Colors.offBlack}`,
                    padding: `${Spacing.small}px`,
                }}
            />
            <Strut size={24} />
            <JSONPretty
                data={parsed}
                style={{
                    flex: 1,
                    overflowX: "scroll",
                }}
            />
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
`;

const Strut = styled.div`
    flex-basis: ${(props) => props.size}px;
`;

export default App;
