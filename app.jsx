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
import { BASE_STYLES, TAG_STYLES } from "./constants/styles";

const getInlineStyle = (inlineStyle) => {
    const isItalic = !!inlineStyle.match(/italic/);
    const isBold = !!inlineStyle.match(/weight: 600|700|bold/);

    let style = [];
    if (isItalic) {
        style = [...style, BASE_STYLES.ITALIC];
    }
    if (isBold) {
        style = [...style, BASE_STYLES.BOLD];
    }
    
    return style.length > 0 ? style : [];
}

const getStyle = ({name, attribs}) => {
    const tagStyles = (name && TAG_STYLES[name] && [TAG_STYLES[name]]) || [];
    const inlineStyles = (attribs && attribs.style && getInlineStyle(attribs.style)) || [];
    const aggregatedStyles = [...tagStyles, ...inlineStyles];
    return aggregatedStyles.length > 0 ? aggregatedStyles : [BASE_STYLES.NORMAL];
}

const parseNodes = (nodes, el) => {
    let parsed = [];
    for (const node of nodes) {
        const { children, data, parent } = node;

        let elementStyle;
        if (!el) {
            elementStyle = new Set(getStyle(parent));
        } else {
            getStyle(parent).forEach(style => el.add(style));
            elementStyle = el;
        } 

        if (data) {
            if (elementStyle.has(BASE_STYLES.BOLD) || elementStyle.has(BASE_STYLES.ITALIC)) {
                elementStyle.delete(BASE_STYLES.NORMAL);
            };

            parsed = parsed.concat({
                style: Array.from(elementStyle),
                content: data,
            });
        } else {
            parsed = parsed.concat(parseNodes(children, elementStyle));
        };
    }
    return parsed;
}

const parseHtml = (html) =>
    ReactHtmlParser(html, {
        transform: (node, i) => {
            const { children } = node;
            const parsed = parseNodes(children);

            return parsed.length > 0
                ? {
                        content: parsed,
                    }
                : null;
        },
    }).filter((node) => !!node);

const App = () => {
    const [html, setHtml] = React.useState(`<div>Enter your text here</div>`);
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