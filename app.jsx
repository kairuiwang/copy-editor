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

const getStyle = (style, propName) => {
    const propPos = style ? style.search(new RegExp(propName+"(?![\s\S]*"+propName+")")) : -1;
    if(propPos<0)
        return null;
      
    const propValue = style.substr(propPos, style.length).match(new RegExp(propName+"[^;]+"))[0];
    return propValue.replace(`${propName}`, "").replace(':','').replace(' ', '').replace('!important', '');
}

const getFontStyle = (baseStyle, curStyle, tagName) => {
    let isItalic = baseStyle.includes('italic');
    let isBold = baseStyle.includes('bold');

    const fontWeightProp = getStyle(curStyle, 'font-weight');
    const fontStyleProp = getStyle(curStyle, 'font-style');

    if(fontWeightProp) {
        if (fontWeightProp !== 'inherit') {
            isBold = (fontWeightProp === '600') || (fontWeightProp === 'bold');
        }
    } else {
        if (tagName === 'b' || tagName === 'strong')
            isBold = true;
    }
    
    if(fontStyleProp) {
        if (fontStyleProp !== 'inherit') {
            isItalic = fontStyleProp === 'italic';
        }
    } else {
        if (tagName === 'i' || tagName === 'em')
            isItalic = true;
    }

    if(isBold && !isItalic)
        return 'bold';
    if(isBold && isItalic)
        return 'bold-italic';
    if(!isBold && isItalic)
        return 'italic';
    if(!isBold && !isItalic)
        return 'normal';
}

const isBlock = (style, tagName) => {
    const blockValueList = ['block', 'flex', 'grid', 'list-item', 'table', 'table-header-group', 'table-footer-group', 'table-row-group',
                            'table-cell', 'table-row'];
    const blockTags = ['address', 'article', 'aside', 'blockquote', 'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer',
                   'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'section', 
                   'table', 'tfoot', 'ul'];
    const tagDispalyProp = getStyle(style, 'display');
    return tagDispalyProp ? blockValueList.includes(tagDispalyProp) : blockTags.includes(tagName);
}

const parseNodes = (nodes, baseStyle = "normal") => {
    for (const node of nodes) {
        const { attribs, children, data, name } = node;

        if (!name) {
            if(!Array.isArray(paragraphs[index]))
                paragraphs[index] = [];
            paragraphs[index].push({
                style: baseStyle,
                content: data
            })
        } else {
            const { style } = attribs;
            if(isBlock(style, name)){
                index++;
            }
            parseNodes(
                children,
                getFontStyle(baseStyle, style, name)
            );
            if(isBlock(style, name)){
                index++;
            }
        } 
    }
};

const parseHtml = (html) =>
    ReactHtmlParser(html, {
        transform: (node, i) => {
            const { attribs, children, name, parent } = node;
            const { style } = attribs;

            if (!parent) {
                if(isBlock(style, name)){
                    index++;
                }
                parseNodes(children, getFontStyle('normal', style, name));
                if(isBlock(style, name)){
                    index++;
                }
                return null;
            }
        },
    }).filter((node) => !!node);


let paragraphs = [];
let index = 0;

const parseToJson = (html) => {
    paragraphs = [];
    index = 0;
    parseHtml(html);

    const filtered = paragraphs.filter(pargraph => {
        return pargraph.length;
    })

    return filtered.map(item => {
        return {
            content: item
        }
    });
}

const App = () => {
    const [html, setHtml] = React.useState("<div>Edit text here.</div><span>123<div>KFC</div></span>");
    const [parsed, setParsed] = React.useState(parseToJson(html));

    const handleChange = (e) => {
        setHtml(e.target.value);
    };

    React.useEffect(() => {
        const parsedHtml = parseToJson(html);
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
